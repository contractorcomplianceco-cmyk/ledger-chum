# LedgerOS · Phase 5 — Core Accounting Roadmap

> The goal of Phase 5 is to make LedgerOS a **standalone accounting platform**,
> independent of ServiceConnect. Phase 4 completed the integration edges; this
> phase fills in the accountant-facing product.

## Delivery in four milestones

| Milestone                       | Scope                                                                                                             | Status                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **M1 — Ledger core**            | Chart of Accounts, General Ledger, Journal Entries + reversals                                                    | **✅ Shipped**                                                                      |
| **M2 — AR expansion + AP**      | Dimensions & source-lineage framework. AR aging + statements. Vendors, bills, bill payments with posting.         | **✅ Shipped**                                                                      |
| **M3 — Banking + Reports**      | Bank accounts, transactions, matching, reconciliation. Trial Balance, P&L, Balance Sheet, Cash Flow, AR/AP Aging. | **✅ Shipped** — see [17-banking-and-reports.md](./17-banking-and-reports.md)       |
| **M4 — Close + Settings**       | Period-close workflow, accounting settings, control center.                                                       | **✅ Shipped**                                                                      |
| **M5 — Integration Layer**      | Integration sources, event mappings, sync history + retry.                                                        | **✅ Shipped** — see [18-integration-layer.md](./18-integration-layer.md)           |
| **M6 — Financial Event Engine** | Event bus, rules engine, approval model. External systems can never post journals directly.                       | **✅ Shipped** — see [19-financial-event-engine.md](./19-financial-event-engine.md) |

Each milestone typechecks cleanly, runs one migration, updates this doc.

---

## Foundational concepts (adopted in M2, applied everywhere after)

### Accounting dimensions

Every posted `journal_line` may carry any subset of the following dimensions,
so reports can slice results without denormalising into per-report tables.
All are nullable UUIDs / short codes, indexed individually, and always
scoped to the same `org_id` as the line's account.

| Dimension    | Purpose                                             |
| ------------ | --------------------------------------------------- |
| `department` | Cost / revenue center inside the org.               |
| `location`   | Physical or logical operating site.                 |
| `project`    | Job, engagement, or capital project.                |
| `customer`   | Counterparty on the revenue side.                   |
| `vendor`     | Counterparty on the expense side.                   |
| `service`    | Service line delivered.                             |
| `product`    | Inventory or SKU consumed / sold.                   |
| `entity`     | Legal entity within a group (future consolidation). |

Dimensions are **descriptive**, not part of the balance identity — the
double-entry rule stays enforced at the journal level. Aging, profitability,
and segment reports read `journal_lines` filtered by dimension.

### Universal source-transaction framework

Every financial event carries a consistent lineage envelope so any posted
row can be traced back to its origin without joining through business
tables:

- `source_type` — canonical event name (`invoice`, `bill`, `payment`,
  `refund`, `inventory_consumption`, `manual`, `reversal`, ...).
- `source_system` — originating system (`ledgeros.manual`,
  `serviceconnect`, `csv_import`, external partner name).
- `external_id` — stable identifier in the source system.
- `source_ref` — human-readable pointer (work order #, bill #, etc.).
- `ledger_impact` — jsonb summary of the resulting debits/credits and
  affected accounts, mirrored into `audit_events.after`.
- `correlation_id` — request/idempotency key propagated end-to-end.

AR and AP are the first surfaces designed around these fields; older
integration-owned rows already carry `(external_source, external_id)` and
are compatible with the new framework.

---

## M1 — Ledger core (Shipped)

### Database changes

**`accounts`** — grouping / display metadata

- `is_system boolean` — marks default accounts (cannot be deleted).
- `sort_order integer` — custom ordering inside a type / parent.

**`journal_entries`** — reversal linkage

- `reversal_of uuid` → original entry a reversal offsets.
- `reversed_by uuid` → set on the original when a reversal is posted.
- `description text` — longer narrative beyond the short `memo`.

**View `v_account_balances`** — per-account debit / credit / net balance from
posted lines only, used by both the Chart of Accounts screen and the report
tiles. Runs `security_invoker=on`, so RLS applies as the caller.

### RPCs

Both are `SECURITY DEFINER` and enforce `is_org_member` + `is_period_open`
internally. Both write an `audit_events` row.

**`post_manual_journal(_org_id, _entry_date, _memo, _description, _lines jsonb)`**

- Inserts a draft entry, adds the supplied lines, then flips status to
  `posted`. The existing `enforce_balanced_journal` trigger provides the
  final guardrail against unbalanced writes.
- Rejects: entries with fewer than two lines, zero totals, unbalanced totals,
  or a date outside an open fiscal period.

**`reverse_journal(_org_id, _journal_id, _reason)`**

- Creates an offsetting balanced journal dated today, swaps debits/credits
  from the original, links both entries (`reversal_of` / `reversed_by`).
- Never mutates the original posted entry.
- Rejects: unposted originals, already-reversed originals, or a closed
  current period.

### Server functions

- `src/lib/accounting/accounts.functions.ts`
  - `listAccountTree` — pulls `v_account_balances` sorted by type / sort_order / code.
  - `createAccount`, `updateAccount` — RLS-scoped writes.
- `src/lib/accounting/general-ledger.functions.ts`
  - `listLedgerLines` — filterable by account, date range, source, status, memo search.
- `src/lib/accounting/journals.functions.ts`
  - `listJournals`, `getJournal` — reads.
  - `postManualJournal`, `reverseJournal` — thin wrappers over the RPCs.

### UI routes

| Route              | What it does                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/ledger/accounts` | Grouped hierarchy of the chart of accounts with per-type totals, drill-down to General Ledger, create / edit dialog. System accounts are marked and non-deletable.                             |
| `/ledger/general`  | Full posted line detail. Filter by account, date range, source, status, memo search. When an account filter is active, a running balance column is computed on the client. CSV export.         |
| `/ledger/journals` | List posted, draft, void journals. New-journal workspace enforces balance and open period client-side before hitting the RPC. Reversal dialog captures a reason and posts an offsetting entry. |

### Posting rules — manual journals

```text
Debit sum == Credit sum   (enforced by RPC + trigger)
At least 2 lines
Entry date must be within an open fiscal period
Only members of the org may post
Once posted, only status transition allowed is → void
Corrections are made by reversing, never by editing
```

### Audit

Every posted manual entry and reversal writes an `audit_events` row with
`event_type` in `journal.posted` / `journal.reversed`, `target_type =
journal_entry`, and enough `after` data to reconstruct the totals and
linkages without joining back.

---

## M2 — AR expansion + AP (Shipped)

### Database changes

**`journal_lines`** — dimension columns (all nullable, indexed)

- `department_id`, `location_id`, `project_id`, `customer_id`, `vendor_id`,
  `service_id`, `product_id`, `entity_id`.
- Applied to every future posting; older rows stay `NULL`.

**`journal_entries`** — source-lineage columns

- `source_system text` (originating system).
- `source_ref text` (human-readable pointer).
- `ledger_impact jsonb` (mirrored summary of debits/credits).
- `external_id text` (idempotency across integrations).

**AP tables**

- `vendors (org, external_source, external_id, name, email, phone, terms_days, default_expense_account_id, ...)`.
- `bills (org, vendor_id, bill_number, issue_date, due_date, status, subtotal, tax, total, balance, memo, external_source, external_id, source_system, source_ref)`.
- `bill_lines (bill_id, account_id, description, quantity, unit_price, amount, dimensions...)`.
- `bill_payments (org, vendor_id, payment_date, method, amount, unapplied_amount, memo, source_*)`.
- `bill_payment_applications (bill_payment_id, bill_id, amount_applied)`.

All new tables: `GRANT` → `ENABLE RLS` → policies scoped via `is_org_member`.

### RPCs

- `post_bill_with_posting(_org, _vendor, ...)` → creates a bill and a
  posted journal (DR expense accounts per line / CR AP), idempotent on
  `(org, external_source, external_id)`, period-checked, audit row.
- `record_vendor_payment_with_posting(_org, _vendor, _apply_to, ...)`
  → allocates payment across bills (DR AP / CR Cash), balanced,
  period-checked, updates bill balances/statuses, audit row.

### Server functions

- `src/lib/accounting/vendors.functions.ts`
- `src/lib/accounting/bills.functions.ts`
- `src/lib/accounting/bill-payments.functions.ts`
- `src/lib/accounting/ar-aging.functions.ts` (aging + statements from
  `invoices`/`payment_applications`).

### UI routes

| Route                        | What it does                                         |
| ---------------------------- | ---------------------------------------------------- |
| `/accounts-receivable/aging` | 0/30/60/90+ buckets from posted invoices' `balance`. |
| `/accounts-payable/vendors`  | Vendor master with balances.                         |
| `/accounts-payable/bills`    | Bill list + create/post workspace.                   |
| `/accounts-payable/payments` | Record vendor payment, allocate across bills.        |
| `/accounts-payable/aging`    | AP aging buckets.                                    |

### Posting rules — bills

```text
Bill total = sum(bill_lines.amount) + tax
Post: DR each line's expense account, CR AP for total
Bill date must be within an open period
Reversal creates an offsetting journal + resets bill balance/status
```

### Posting rules — vendor payments

```text
Applied total <= payment amount (remainder becomes unapplied credit)
Post: DR AP for applied amount, CR Cash for payment amount
Each application decrements bill.balance and re-derives status
Payment date must be within an open period
```

## M3 — Banking + Reports (planned)

- `bank_accounts` linked to a GL cash account, `bank_transactions`,
  `bank_transfers`, `bank_reconciliations` + `reconciliation_lines`.
- CSV import + manual entry (no external feeds).
- Reports fed from `journal_lines` + `v_account_balances`: Trial Balance,
  P&L, Balance Sheet, Cash Flow (indirect), AR Aging, AP Aging.

## M4 — Close + Settings (planned)

- Period-close checklist: unposted journals, draft invoices/bills,
  unreconciled bank accounts, unapplied payments/credits.
- Close/reopen actions gated by `has_role(admin|accountant)`.
- Accounting Settings tabs: Fiscal, Defaults, Numbering, Invoice defaults,
  Payment terms, Tax rates.

---

## Cross-cutting rules

- Every new `public.*` table lands with `GRANT` → `ENABLE RLS` → policies
  in the same migration, scoped through `is_org_member` / `has_role`.
- All posting paths go through a `SECURITY DEFINER` RPC that checks
  `is_period_open` and writes an `audit_events` row.
- Reversals never mutate posted journals.
- No mocked financial data in shipped screens. Balances always resolve from
  `v_account_balances` or filtered `journal_lines`.

---

## M4 — Close + Settings + Accounting Controls (shipped)

### Close workflow

Tables:

- `close_runs (id, org_id, fiscal_period_id, status, started_by/at,
completed_by/at, notes)` — one per period-close attempt, unique per
  period.
- `close_tasks (id, org_id, close_run_id, task_key, title, category,
required, order_index, status, note, completed_by/at)` — checklist
  items seeded by `seed_default_close_tasks`.
- `close_approvals (id, org_id, close_run_id, approver_id, decision,
note)` — append-only approve/reject decisions.

Default checklist (`bank_recon`, `ar_review`, `ap_review`,
`unposted_journals`, `trial_balance`, `variance_review`,
`accrual_review`, `lead_approval`, `lock_period`) is applied by
`seed_default_close_tasks(_org, _run)` when a close starts.

RPCs (all `SECURITY DEFINER`, RLS-checked, audit-logged):

- `start_period_close(_org_id, _period_id)` — owner or accounting lead
  only. Moves the period to `pending_close`, seeds the checklist,
  writes `close.started`.
- `set_close_task_status(_task_id, _status, _note)` — any org member.
  Records completion metadata and emits `close.task.<status>`.
- `approve_period_close(_close_run_id, _note)` — owner or accounting
  lead. Rejects if any required task is still open or the trial
  balance (sum of debits vs credits on posted journal lines) does not
  balance. On success, moves the period to `closed` and locks postings
  through the existing `is_period_open` guard.
- `reopen_period(_org_id, _period_id, _reason)` — owner only. Refuses
  `locked` periods. Marks the prior close run as `reopened` and
  reverts the period to `open`.

### Period lock rules

- `is_period_open(org, date)` is the single source of truth for whether
  a posting is allowed. All posting RPCs (`post_invoice_with_posting`,
  `record_payment_with_posting`, `post_bill_with_posting`,
  `record_vendor_payment_with_posting`, `post_manual_journal`,
  `record_refund_with_posting`, `record_inventory_consumption_with_posting`)
  call it before writing.
- Status transitions: `open → pending_close → closed → (reopened →) open`.
  `locked` is a terminal state and cannot be reopened via `reopen_period`.
- The `enforce_balanced_journal` and `tg_journal_entry_immutable`
  triggers continue to enforce double-entry integrity independent of
  close status.

### Settings model

`organization_settings` (existing, extended via UI):

- `accounting_basis` (`cash` | `accrual`)
- `default_currency`, `timezone`, `fiscal_calendar`
- `close_policy` JSONB — `{ soft_close_days, hard_close_days }`
- `audit_retention_months`

Read/write policies: read = `is_org_member`, write = `owner` or
`accounting_lead`. Every upsert emits an `org_settings.updated`
audit event.

### Account mapping architecture

Purpose-keyed mappings (`account_mappings` table, one row per
`org_id`/`purpose`) drive the `resolve_account(_org, _purpose)` RPC.
Every posting RPC that needs a well-known account (AR, AP, cash,
labor revenue, material revenue, inventory, COGS, refund clearing,
credit liability) resolves through this indirection so integrations
never hard-code account IDs. Unmapped purposes fall back to a
heuristic and surface as an inbox event.

### Control Center

`v_control_exceptions` (security_invoker view) unions live rows from
the sub-ledgers:

- Draft journals (`journal_entries.status = 'draft'`)
- Unmatched bank transactions older than 7 days
- Past-due invoices (`invoices.balance > 0 AND due_date < today`)
- Past-due bills (`bills.balance > 0 AND due_date < today`)

Every row includes `category`, `severity` (`warning` | `critical`),
and `occurred_on`. Severities escalate to `critical` past 30/60 days
depending on the sub-ledger.

The `/controls` route rolls these into KPI tiles alongside the current
fiscal period and recent close runs, so operators can see close
readiness and outstanding exceptions at a glance.

### Report lineage architecture

Every posted amount in every report can be traced to a `journal_line`
whose parent `journal_entry` carries:

- `source_type` — `manual` | `invoice` | `payment` | `bill` |
  `vendor_payment` | `refund` | `inventory_consumption` | `reversal`.
- `source_id` — pointer to the originating sub-ledger row.
- `source_system` + `source_ref` — external system envelope.
- `external_id` + `correlation_id` — idempotency + request tracing.
- `ledger_impact` (JSONB) — snapshot of what the posting RPC decided,
  including which mapping resolved which account.

The reporting views (`v_trial_balance`, `v_general_ledger`,
`v_ar_aging`, `v_ap_aging`) select from `journal_lines` filtered by
`journal_entries.status = 'posted'`, so a drill-down from any report
cell can walk back to the exact `journal_entry` and thus the source
transaction.

### What M4 explicitly does NOT add

- No ServiceConnect-specific rules (integrations remain generic).
- No fake financial intelligence or hardcoded customer logic.
- No APEX redesign — the control surfaces are LedgerOS-native.

---

## Milestone 5 — Integration Layer + ServiceConnect Pilot ✅

**Status:** complete.

M5 introduces a generic, configurable integration framework so external
systems (ServiceConnect first, more later) can push financial events into
LedgerOS without hard-coded client rules.

### What M5 ships

- **`integration_sources`** — per-org registry of external systems.
- **`integration_event_mappings`** — per-org config mapping
  `(source, external_event_type)` → LedgerOS financial object +
  optional `account_mappings.purpose`.
- **`sync_history` extensions** — `retry_count`, `last_retry_at`,
  `source_id`, `event_type`, plus supporting indexes.
- **`/admin/integrations`** — operator workspace to register sources,
  edit mappings, and retry failed inbound calls.
- **API surface** unchanged: existing `/api/public/integrations/*`
  endpoints continue to serve customers, invoices, payments, refunds,
  and inventory consumption. Business logic now consults the mapping
  tables instead of encoding source-specific rules.
- **Docs** — `docs/ledgeros/18-integration-layer.md` covers architecture,
  event model, mapping model, sync lifecycle, error handling, and
  security model.

### Preserved invariants

Double-entry integrity, fiscal controls, audit lineage, close workflow,
Control Center, organization isolation, and source traceability are all
unchanged by M5 — the layer is strictly additive.

### What M5 explicitly does NOT add

- No ServiceConnect-specific rules baked into LedgerOS code.
- No hardcoded customer logic.
- No APEX redesign.
- No fake integrations.

## Milestone 8 — Accounting Completeness Layer ✅

Completes the foundation required before activating full LedgerOS
Intelligence, without changing any prior invariant.

### What M8 ships

- **Inventory** — `inventory_categories`, `inventory_locations`,
  `inventory_items`, `inventory_transactions`. Cost methods scaffolded
  (`average`, `fifo`, `standard`, `specific`); no auto-posting.
- **Fixed assets** — `fixed_asset_categories`, `fixed_assets`,
  `fixed_asset_depreciation`. Straight-line schedule generation as
  `scheduled` rows only; posting flows through the accounting engine.
  `book_value` is a stored generated column.
- **Tax framework** — `tax_jurisdictions`, `tax_categories`,
  `tax_rates`, `tax_liabilities`. Framework only; no calculation.
- **Multi-entity** — `legal_entities`, `intercompany_transactions`,
  live due-to / due-from aggregation. Consolidation deferred.
- **Accounting Intelligence** — `accounting_insights` (advisory,
  service-role insert only). DB trigger `tg_insights_advisory_guard`
  enforces immutability of the narrative, evidence, confidence, and
  `advisory_only` flag. Users may only acknowledge / dismiss / resolve.
- **UI routes** — `/ledger/inventory`, `/ledger/fixed-assets`,
  `/ledger/tax`, `/ledger/entities`, `/close/ai-assistant`.
- **Docs** — `docs/ledgeros/21-accounting-completeness.md`.

### Preserved invariants

Financial Event Bus, Materialization Engine, Accounting Engine,
double-entry integrity, fiscal controls, audit lineage, close workflow,
Control Center, and organization isolation are all unchanged by M8.

### What M8 explicitly does NOT add

- No ServiceConnect-specific accounting code.
- No hardcoded customer logic.
- No automatic tax calculations.
- No auto-posting of depreciation, COGS, or intercompany journals.
- No AI ability to write to the ledger, approve transactions, or
  override controls.
- No APEX redesign.

### AI capability boundary (mandatory)

The Accounting Intelligence layer can:

- Explain what happened, why, evidence, confidence
- Recommend a human action

The Accounting Intelligence layer cannot:

- Post journal entries
- Change accounting records
- Approve transactions
- Override controls
- Alter fiscal-period state
