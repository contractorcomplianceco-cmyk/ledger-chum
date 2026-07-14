# 18 — Integration Layer (M5)

LedgerOS is a standalone accounting engine. External systems (ServiceConnect,
Zoho Books, ADP, Navy Federal, etc.) push financial events into LedgerOS
through a **generic, configurable integration layer** — never through
hard-coded, client-specific code paths.

This document defines that layer.

---

## 1. Architecture

```
   External System
        │
        ▼
   /api/public/integrations/*   ← inbound REST endpoints
        │
        ▼
   Bearer token verification    (api_clients.key_hash)
        │
        ▼
   Idempotency check            (sync_history unique index)
        │
        ▼
   integration_event_mappings   ← config, per org
        │
        ▼
   LedgerOS financial object    (customer / invoice / payment / …)
        │
        ▼
   Double-entry posting engine  (journal_entries + journal_lines)
        │
        ▼
   audit_events                 ← immutable lineage
```

**Boundaries.**

- **ServiceConnect** owns operational truth (work orders, technicians,
  scheduling).
- **LedgerOS** owns financial truth (customers, invoices, AR, payments, GL,
  reporting).
- The layer between them is a **contract**, not shared code.

---

## 2. Event Model

Every inbound call carries:

| Field | Purpose |
| --- | --- |
| `Authorization: Bearer <token>` | `api_clients.key_hash` lookup — identifies caller org |
| `Idempotency-Key` | Deduplicates retries; stored on `sync_history` |
| `external_id` | Caller's stable ID for the record (customer, invoice, payment) |
| `external_source` | System of origin (e.g. `serviceconnect`) — persisted on the created row |
| Payload | JSON body specific to the ledger object |

Every generated LedgerOS row records `external_source` + `external_id`,
enabling **round-trip traceability** — a payment posted from ServiceConnect
carries the ServiceConnect payment id all the way through to the trial balance.

---

## 3. Configuration Model

Two tables replace hard-coded ServiceConnect logic:

### `integration_sources`

Per-organization registry of external systems.

| Field | Notes |
| --- | --- |
| `source_key` | Machine key (`serviceconnect`, `zoho_books`, `adp`, …) |
| `name` | Display name |
| `kind` | `inbound_api` \| `outbound_api` \| `webhook` \| `file_feed` \| `manual` |
| `active` | Master enable/disable |
| `config` | JSONB — adapter-specific hints (rate limits, feature flags) |

### `integration_event_mappings`

Per-organization mapping from an external event type to a LedgerOS
financial object and (optionally) an `account_mappings.purpose`.

| Field | Notes |
| --- | --- |
| `source_id` | FK to `integration_sources` |
| `external_event_type` | e.g. `work_order.completed` |
| `ledger_object` | `customer` \| `invoice` \| `payment` \| `refund` \| `inventory_consumption` \| `bill` \| `credit` |
| `account_purpose` | Optional link to `account_mappings.purpose` (e.g. `ar`, `labor_revenue`) |
| `active` | Per-event toggle |
| `config` | JSONB — per-mapping adapter hints |

**Rule.** Business logic (e.g. "a completed work order becomes a draft
invoice") lives in the endpoint handler + the mapping row — not in a
condition like `if source == "serviceconnect"`. New source systems reuse the
same endpoints by adding rows to these tables.

---

## 4. Sync Lifecycle

```
receive → verify auth → check idempotency → validate schema
       → resolve mapping → transform → post to ledger
       → write sync_history (status=ok) → write audit_event → 2xx response
```

Failure branches:

- `4xx` (validation / auth / mapping missing) → `sync_history.status='error'`,
  no ledger side effects, caller retries with corrected payload.
- `5xx` (transient) → `sync_history.status='error'`, caller retries with the
  **same** `Idempotency-Key`. The unique index on
  `(org_id, idempotency_key)` guarantees at-most-once semantics; a duplicate
  succeeding call replays the cached response.

---

## 5. Retry & Error Handling

`sync_history` was extended in M5 with:

- `retry_count` — increments each time an operator flags the row for retry.
- `last_retry_at` — timestamp of the last retry signal.
- `source_id` — optional FK to `integration_sources` for grouping.
- `event_type` — canonical event type (matches `integration_event_mappings.external_event_type`).

Operators use `/admin/integrations` to:

1. Inspect failed inbound calls (`sync_history.status='error'`).
2. Read the provider error body preserved in `sync_history.error`.
3. Press **Retry** — records a `sync_history.retry_requested` audit event and
   stamps `retry_count`. The upstream system then **replays the call using the
   same idempotency key**. LedgerOS never re-executes business rules on its own
   — the financial-truth boundary is preserved.

---

## 6. Security Model

- **Authentication.** Bearer tokens, hashed with SHA-256, stored in
  `api_clients.key_hash`. Raw tokens are shown exactly once on issue.
- **Authorization.** Every table (`api_clients`, `integration_sources`,
  `integration_event_mappings`, `sync_history`, `audit_events`) is RLS-gated
  via `is_org_member(org_id)`; mutations additionally require `owner` or
  `accounting_lead` roles.
- **Tenant isolation.** Every write is scoped to the caller's `org_id`
  (derived from the api_client row). Cross-org access is impossible even with
  a valid but foreign key.
- **Audit lineage.** Every mutation writes to `audit_events` with
  `correlation_id`, actor type/id, before/after snapshots, and source. This
  is the read model for the Integration Inbox and Control Center.

---

## 7. ServiceConnect Pilot Configuration

The ServiceConnect pilot is now a **configuration** of the generic framework:

1. An `api_clients` row with `provider='serviceconnect'` (raw token given to
   the ServiceConnect team).
2. An `integration_sources` row with `source_key='serviceconnect'`,
   `kind='inbound_api'`.
3. `integration_event_mappings` rows:

   | external_event_type | ledger_object | account_purpose |
   | --- | --- | --- |
   | `work_order.completed` | `invoice` | `ar` |
   | `payment.received` | `payment` | `cash_default` |
   | `refund.created` | `refund` | `refund_clearing` |
   | `inventory.consumed` | `inventory_consumption` | `inventory_asset` |
   | `customer.upserted` | `customer` | *(none)* |

Adding a second pilot (e.g. Zoho Books) is done by inserting a new
`integration_sources` row and a set of `integration_event_mappings` — no code
changes.

---

## 8. Non-Goals

- LedgerOS does not implement operational workflows (dispatch, scheduling,
  technician management).
- LedgerOS does not push data outward autonomously; outbound sync (if ever
  needed) is a separate future adapter.
- No client-specific rules live in the ledger core. If a rule seems
  ServiceConnect-specific, it belongs in ServiceConnect or in an
  `integration_event_mappings.config` blob — never in migration or handler
  code.
