# LedgerOS · M6 — Financial Event Engine

The Financial Event Engine is the mandatory boundary between **external
systems** (ServiceConnect, banking feeds, partner APIs, CSV imports) and
the **LedgerOS ledger**. External systems never create journal entries
directly — they emit *events*, which are recorded, validated, mapped,
approved, and only then materialized into financial objects using the
existing posting engine.

```
External System
       │
       ▼
Financial Event    ← recorded on the bus (idempotent)
       │
       ▼
   Validation      ← schema + org / period checks
       │
       ▼
     Mapping       ← integration_event_mappings → ledger object + account_purpose
       │
       ▼
Financial Object   ← draft (customer, invoice, payment, bill, ...)
       │
       ▼
Accounting Rules   ← financial_event_rules (auto-approve / require approval)
       │
       ▼
 Journal Impact    ← via existing SECURITY DEFINER posting RPCs
       │
       ▼
   Reporting
```

## Event model

`public.financial_events` is the append-first bus. Every row carries:

| Field                    | Purpose                                                       |
|--------------------------|---------------------------------------------------------------|
| `org_id`                 | Tenant scope (RLS enforced).                                  |
| `source_id`              | FK to `integration_sources` (nullable for `manual`).          |
| `source_system`          | Denormalized origin identifier (`serviceconnect`, `csv`, …).  |
| `external_event_type`    | Origin's event name (`work_order.completed`, …).              |
| `external_id`            | Stable identifier in the origin system.                       |
| `idempotency_key`        | Unique per `org_id`; duplicates return the prior result.      |
| `correlation_id`         | Propagates end-to-end across audit + sync history.            |
| `ledger_object`          | Target object type resolved via mapping.                      |
| `status`                 | Lifecycle state (see below).                                  |
| `payload`                | Verbatim JSON as received.                                    |
| `mapping_id`             | Mapping used, if any.                                         |
| `matched_rule_id`        | Rule that decided approval.                                   |
| `requires_approval`      | Set by rules; defaults to `true`.                             |
| `materialized_target_*`  | Populated when the event turns into a ledger object.          |
| `validation_errors`      | Detailed validation output.                                   |

## Lifecycle

| Status              | Meaning                                                                 |
|---------------------|-------------------------------------------------------------------------|
| `received`          | Ingested but no mapping yet.                                            |
| `validated`         | Schema OK; still no mapping.                                            |
| `mapped`            | Mapping resolved → `ledger_object` known.                               |
| `pending_approval`  | Mapped and rules demand human review.                                   |
| `approved`          | Approved; awaits materialization.                                       |
| `materialized`      | Underlying ledger object was created via posting RPCs.                  |
| `rejected`          | Terminal — never materialized.                                          |
| `error`             | Ingestion or materialization failed; retryable via idempotency key.     |

Only the transitions `pending_approval → approved`, `* → rejected`, and
`approved → materialized` are user-initiated. Ingestion transitions
(`received → validated → mapped`) happen inside `ingest_financial_event`.

## Rules engine

`public.financial_event_rules` is priority-ordered per org. The highest
priority matching rule wins (`ORDER BY priority ASC LIMIT 1`).

Conditions (jsonb, all optional; unset = wildcard):

- `source_system`
- `external_event_type`
- `ledger_object`
- `mapping_state` — reserved
- `approval_state` — reserved

Actions (jsonb):

- `auto_approve: true` — sets `requires_approval = false`.
- `require_approval: true` — forces human review even if mapped.
- Future actions: `create_customer`, `create_invoice_draft`,
  `request_approval`, `create_exception` — carried in `actions` and
  interpreted by a follow-on materializer.

## Approval model

`approve_financial_event(_org, _event, _note)` and
`reject_financial_event(_org, _event, _reason)` are `SECURITY DEFINER`
RPCs gated by `has_role(auth.uid(), _org, 'owner' | 'accounting_lead')`.
Each transition inserts a row in `financial_event_approvals` and an
`audit_events` row carrying the original `correlation_id`.

## Idempotency

Every ingestion carries an `Idempotency-Key` header (public route
requirement) which becomes `financial_events.idempotency_key`. The unique
`(org_id, idempotency_key)` index guarantees at-most-once ingestion. A
duplicate call returns the prior event's `event_id` and `status` without
side effects.

## Error handling

- Schema failure → 422 response, `sync_history` row with `status='error'`,
  no `financial_events` row.
- RPC failure → 500 response, `sync_history` error row, no event row.
- Post-ingestion errors (materialization) → event moved to `error` and
  the operator can replay via a new idempotency key or reject.

## Security model

- Public route is protected by ServiceConnect bearer auth (`api_clients`
  + scopes) and requires an `Idempotency-Key` header.
- `ingest_financial_event` is `SECURITY DEFINER` so the service-role
  client can insert audit rows without violating RLS.
- Every UI-side function uses `requireSupabaseAuth` middleware — no
  server function is callable unauthenticated.
- Ledger writes remain gated by the existing posting RPCs (invoice /
  bill / payment / refund / inventory / manual journal). The event
  engine only issues drafts — it never writes to `journal_entries`
  or `journal_lines` directly.

## ServiceConnect pilot flow

```
ServiceConnect: work_order.completed
        │  POST /api/public/integrations/events
        ▼
financial_events (status=mapped, requires_approval per rule)
        │
        ▼
Accountant reviews (Admin → Event Bus)
        │
        ├── reject → status=rejected
        └── approve → status=approved
                │
                ▼
Materialization (out of scope for M6 — future M7)
        │
        ▼
public.invoices / customers / payments (via existing posting RPCs)
        │
        ▼
General Ledger + Reports
```

ServiceConnect remains **configuration only**: the `integration_sources`
row, the `integration_event_mappings` rows, and the
`financial_event_rules` rows collectively describe the pilot. No
ServiceConnect-specific business logic lives in the ledger code.
