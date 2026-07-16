# ServiceConnect ↔ LedgerOS Financial Integration (Phase 2B)

**Status:** Phase 2B — Integration readiness, account mapping engine, inventory COGS, and refunds are live.

## 1. Integration Identity & Scopes

`api_clients` gains:

- `scopes text[]` — required capabilities the client is authorized for.
- `environment text` — `sandbox` | `production`.

Recognized scopes:

| Scope                   | Grants                         |
| ----------------------- | ------------------------------ |
| `customers.read`        | Future GET on customer records |
| `customers.write`       | `POST /customers`              |
| `work_orders.completed` | `POST /work-orders/completed`  |
| `invoices.create`       | `POST /invoices`               |
| `invoices.read`         | Future GET on invoices         |
| `payments.create`       | `POST /payments`               |
| `refunds.create`        | `POST /refunds`                |
| `inventory.consume`     | `POST /inventory-consumption`  |
| `reports.read`          | Future GET on ledger reports   |

Every integration route calls `beginIntegrationCall(request, endpoint, requiredScope)`. Missing scope → `403 Missing required scope: <name>`. Inactive client → `401`. Missing `Idempotency-Key` → `400`.

The ServiceConnect sandbox identity is a production `api_clients` row with `environment='sandbox'` and full scope set:

```
customers.read, customers.write, work_orders.completed,
invoices.create, invoices.read, payments.create,
refunds.create, inventory.consume, reports.read
```

## 2. Account Mapping Engine

Table `public.account_mappings (org_id, purpose, account_id)` — one row per purpose per org. Owners upsert; members read; service role bypasses.

Purposes:

- `ar` — Accounts Receivable
- `cash_default` — Default cash/bank (used with `payment_account_mappings` for method-specific routing)
- `labor_revenue`, `material_revenue`
- `inventory_asset`, `material_cogs`
- `refund_clearing`
- `credit_liability`

Resolver: `public.resolve_account(_org, _purpose)` returns the mapped account, or a heuristic fallback (name-match) if none is configured. **No account IDs are hardcoded anywhere in the codebase.**

Server functions: `listAccountMappings`, `upsertAccountMapping` in `src/lib/accounting/account-mappings.functions.ts`.

## 3. Work Order Financial Ingestion

`POST /api/public/integrations/work-orders/completed`

Pipeline (unchanged shape, upgraded routing):

1. Auth + scope check (`work_orders.completed`) + idempotency replay.
2. Customer must exist (`customers.write` first) → `422` otherwise.
3. Per line, account resolution priority:
   1. Explicit `account_code`
   2. Mapped `labor_revenue` / `material_revenue` when `line_type` hint is provided
   3. Any mapped revenue (labor → material fallback)
4. Insert **draft** invoice + lines with `external_source='serviceconnect'`, `external_id`, `work_order_ref`.
5. `sync_history` row + `audit_events` row (`invoice.draft_created_from_work_order`).
6. **No GL posting** — an accountant posts drafts via `postInvoice`.

## 4. Inventory COGS

`POST /api/public/integrations/inventory-consumption`

Now atomic via `record_inventory_consumption_with_posting`:

- Inserts `inventory_consumption` row.
- If `total_cost > 0`: posts balanced journal (`source_type='inventory_consumption'`):

| Side   | Account (via mapping) | Amount       |
| ------ | --------------------- | ------------ |
| Debit  | `material_cogs`       | `total_cost` |
| Credit | `inventory_asset`     | `total_cost` |

- Requires an open fiscal period on `consumed_at`.
- Writes `audit_events` (`inventory.consumed`, action=`posted`).
- Duplicate `(org_id, external_source, external_id)` → `409`.

## 5. Refunds

`POST /api/public/integrations/refunds`

Payload: `{ external_id, payment_external_id, refund_date, amount, method?, memo? }`.

- Resolves payment by ServiceConnect external id.
- Calls `record_refund_with_posting` (already in Phase 2A):

| Side   | Account                          | Amount   |
| ------ | -------------------------------- | -------- |
| Debit  | AR (reversing the AR settlement) | `amount` |
| Credit | Cash/Clearing (method-mapped)    | `amount` |

- Idempotency + audit + `sync_history` + fiscal-period check identical to payments.

## 6. Integration Test Matrix

Backed by the RPC + trigger invariants (Phase 2A double-entry engine):

| Scenario                            | Enforced by                                                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| WO creates draft invoice, no GL     | Handler inserts `status='draft'`; posting is a separate server fn.                                                                 |
| Invoice posting → balanced AR entry | `enforce_balanced_journal` trigger; `journal_entries_unique_active_source`.                                                        |
| Payment → balanced Cash/AR entry    | `record_payment_with_posting` (Phase 2A).                                                                                          |
| Inventory consumption → COGS entry  | `record_inventory_consumption_with_posting` (Phase 2B).                                                                            |
| Refund → balanced reversal          | `record_refund_with_posting`.                                                                                                      |
| Duplicate events rejected           | `Idempotency-Key` short-circuit + `UNIQUE(org_id, external_source, external_id)` on `payments`/`invoices`/`inventory_consumption`. |
| Tenant isolation                    | RLS on all tables scoped by `org_id`; bearer resolves to a single org.                                                             |
| Scope enforcement                   | `requireScope` in every route.                                                                                                     |

## 7. Non-goals for Phase 2B

- No UI. Provisioning + mapping configuration are backend-only.
- No AP, no bank feeds.
- Auto-posting of invoices remains explicitly disabled — accountants review drafts.
