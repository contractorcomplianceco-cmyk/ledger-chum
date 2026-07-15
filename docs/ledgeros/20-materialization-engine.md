# LedgerOS · M7 — Financial Event Materialization Engine

The Materialization Engine is the layer that converts **approved
financial events** into **LedgerOS financial objects**. It runs entirely
inside the ledger's trust boundary. External systems never invoke it —
they only publish to the Financial Event Bus (M6), and the engine picks
up events only after they have passed validation, mapping, rule
evaluation, and human (or rule-based) approval.

```
Approved Financial Event
        │
        ▼
Materialization dispatch (by ledger_object)
        │
        ├── customer      → public.customers  (upsert on external ref)
        ├── invoice       → public.invoices (draft) + invoice_lines
        ├── payment       → public.payments (unapplied)
        ├── credit        → public.credits
        └── (unknown)     → requires_review exception
        │
        ▼
Draft financial object (never posted automatically)
        │
        ▼
Existing posting engine (human review)
   post_manual_journal / record_payment_with_posting / post_bill_with_posting
        │
        ▼
General ledger + reports
```

## Data model

### `public.financial_event_materializations`

One row per materialization attempt of a given event.

| Field                  | Purpose                                                       |
|------------------------|---------------------------------------------------------------|
| `org_id`               | Tenant scope (RLS enforced).                                  |
| `event_id`             | FK to `financial_events`.                                     |
| `materialization_type` | Denormalized `ledger_object` at time of run.                  |
| `target_object_type`   | `customer`, `invoice`, `payment`, `credit`, ...               |
| `target_object_id`     | UUID of the created LedgerOS object.                          |
| `status`               | Lifecycle (see below).                                        |
| `error_code`           | Machine-readable failure code.                                |
| `error_message`        | Operator-facing description.                                  |
| `retry_count`          | Bumped every time a retry fails.                              |
| `audit_event_id`       | Optional pointer to the audit row.                            |
| `created_by`           | Operator who triggered the run.                               |
| `completed_at`         | Set when status transitions to `completed`.                   |

A partial unique index on `(event_id) WHERE status IN
('pending','processing','completed')` guarantees at most one active or
successful materialization per event. Failed / requires_review rows can
coexist so history is preserved across retries.

### Lifecycle

| Status              | Meaning                                                       |
|---------------------|---------------------------------------------------------------|
| `pending`           | Reserved (not currently produced — dispatch begins immediately). |
| `processing`        | Row locked; dispatch in-flight.                               |
| `completed`         | Target object created / found; event marked `materialized`.   |
| `failed`            | Uncaught error; retry available.                              |
| `requires_review`   | Known business exception (missing customer, invalid amount, unsupported ledger_object). |
| `cancelled`         | Superseded by a retry.                                        |

### `public.financial_account_mappings`

Configurable translation of external operational concepts into
LedgerOS account references. There are **no hardcoded mappings** — every
mapping is a row scoped to `(org_id, integration_source_id,
external_type, external_value)`.

| Field                   | Purpose                                                     |
|-------------------------|-------------------------------------------------------------|
| `external_type`         | e.g. `service_category`, `labor_type`, `part`.              |
| `external_value`        | e.g. `Emergency Service`, `Technician Labor`, `Parts`.      |
| `ledger_object_type`    | Target ledger object (revenue account, COGS, ...).          |
| `ledger_account_id`     | FK to `public.accounts`.                                    |
| `effective_date` / `expiration_date` | Time-scoped mappings.                          |
| `status`                | `active` / `inactive`.                                      |
| `approved_by`           | Auditability of who blessed the mapping.                    |

## RPC surface

### `materialize_financial_event(_org, _event_id)`

- `SECURITY DEFINER`, restricted to `owner` or `accounting_lead`.
- Verifies event status is `approved` (or `materialized` for
  idempotency).
- Creates the materialization row, dispatches by `ledger_object`, and
  runs an UPSERT on the target table's `(org, external_source,
  external_id)` unique index so replays cannot duplicate customers,
  invoices, or payments.
- On success: sets `financial_events.status = 'materialized'`, sets
  `materialized_target_type` / `_id`, writes an audit row.
- On business exception: sets status `requires_review`, records
  `error_code` + `error_message`, writes an audit row, returns the error
  (never raises to the caller).
- On unexpected error: status `failed`, same audit + return shape.

### `retry_materialization(_org, _event_id)`

- Same authorization gate.
- Cancels prior `failed` / `requires_review` rows for the event, then
  invokes `materialize_financial_event` again.
- Idempotent by construction: dispatch always upserts on external
  identifiers.

## Server functions (UI-side)

`src/lib/accounting/financial-events.functions.ts` exposes:

- `materializeFinancialEvent({ orgId, id })`
- `retryMaterialization({ orgId, id })`
- `listMaterializations({ orgId, status? })`
- `listFinancialAccountMappings({ orgId })`
- `upsertFinancialAccountMapping({ ... })`
- `deleteFinancialAccountMapping({ orgId, id })`

Every function uses `requireSupabaseAuth` middleware — no path is
callable unauthenticated.

## Error handling

All failures land in `financial_event_materializations` with:

- `status` = `failed` or `requires_review`
- `error_code` (machine)
- `error_message` (operator)
- `retry_count` incremented
- An `audit_events` row keyed by `correlation_id` so the failure is
  traceable end-to-end with the ingest and approval events.

Known exception codes:

| Code                          | Meaning                                     |
|-------------------------------|---------------------------------------------|
| `MISSING_CUSTOMER`            | Event references a customer that doesn't exist yet — create the customer event first, or pass `customer_id` in payload. |
| `INVALID_AMOUNT`              | Amount is zero or negative.                 |
| `UNSUPPORTED_LEDGER_OBJECT`   | No dispatch branch for the mapped ledger object. |

## Idempotency and duplication safety

- **Events** are already deduplicated by
  `(org_id, idempotency_key)` at ingestion (M6).
- **Materializations** are constrained by the partial unique index —
  only one active/completed row per `event_id`.
- **Target objects** are keyed by their own external unique indexes:
  - `customers(org_id, external_source, external_id)`
  - `invoices(org_id, external_source, external_id)`
  - `payments(org_id, external_source, external_id)`

Replaying an approved event never produces a duplicate customer,
invoice, or payment. Credits carry `source_type='financial_event' +
source_id=event_id` for lineage.

## Security model

| Boundary                                | Enforcement                                     |
|-----------------------------------------|-------------------------------------------------|
| External → journal entry                | **Blocked.** External systems can only POST to `/api/public/integrations/events`. |
| External → materialization              | **Blocked.** The materialization RPC is `SECURITY DEFINER` and requires an authenticated org role. |
| Non-approved events                     | RPC raises before dispatch.                     |
| Cross-org access                        | Every query filters `org_id`; RLS re-checks.    |
| Draft → posted transition               | Still gated by `post_manual_journal`, `record_payment_with_posting`, `post_bill_with_posting`. |
| Fiscal periods                          | Enforced inside the posting RPCs, not here.     |

## ServiceConnect pilot flow

```
ServiceConnect: work_order.completed
   │
   ▼ POST /api/public/integrations/events (bearer + Idempotency-Key)
financial_events (status=pending_approval per rule)
   │
   ▼ accountant approves
financial_events (status=approved)
   │
   ▼ operator clicks "Materialize"
financial_event_materializations (status=completed)
   │
   ▼ dispatch resolves customer_external_id → customer, or creates one
public.invoices (status=draft) + invoice_lines
   │
   ▼ accountant reviews draft in Invoicing workspace and posts
post_manual_journal / posting RPC → journal_entries + journal_lines
   │
   ▼
AR, cash, reports
```

The pilot invoice **remains a draft** until a human posts it — the
first production tenants never see external systems reach into
`journal_entries` directly.

## Test scenarios

| Scenario                                          | Expected outcome                                  |
|---------------------------------------------------|---------------------------------------------------|
| Approved work_order.completed → invoice           | Draft invoice + lines created; event `materialized`. |
| Duplicate event replay                            | Idempotent — returns the existing invoice.        |
| Invoice event with unknown customer               | `requires_review` + `MISSING_CUSTOMER`.           |
| Rejected event                                    | Never enters materialization RPC.                 |
| Failed materialization retry                      | Cancels prior row, retries, no duplicates.        |
| Payment event                                     | Payment (unapplied) created; no journal.          |
| External POST to journal_entries                  | Denied — no external write path exists.           |
| Cross-org materialization                         | RPC raises on `has_role` check.                   |
| Audit lineage                                     | ingest, approval, materialization all share `correlation_id`. |
