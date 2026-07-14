# LedgerOS · Phase 5 — Core Accounting Roadmap

> The goal of Phase 5 is to make LedgerOS a **standalone accounting platform**,
> independent of ServiceConnect. Phase 4 completed the integration edges; this
> phase fills in the accountant-facing product.

## Delivery in four milestones

| Milestone | Scope | Status |
|-----------|-------|--------|
| **M1 — Ledger core** | Chart of Accounts, General Ledger, Journal Entries + reversals | **✅ Shipped** |
| M2 — AR expansion + AP | Customer statements, aging, collections. Vendors, bills, bill payments. | Planned |
| M3 — Banking + Reports | Bank accounts, transactions, reconciliation. Trial Balance, P&L, Balance Sheet, Cash Flow, AR/AP Aging. | Planned |
| M4 — Close + Settings | Period-close workflow, accounting settings, numbering, terms, tax. | Planned |

Each milestone typechecks cleanly, runs one migration, updates this doc.

---

## Foundational concepts (adopted in M2, applied everywhere after)

### Accounting dimensions

Every posted `journal_line` may carry any subset of the following dimensions,
so reports can slice results without denormalising into per-report tables.
All are nullable UUIDs / short codes, indexed individually, and always
scoped to the same `org_id` as the line's account.

| Dimension    | Purpose                                                        |
|--------------|----------------------------------------------------------------|
| `department` | Cost / revenue center inside the org.                          |
| `location`   | Physical or logical operating site.                            |
| `project`    | Job, engagement, or capital project.                           |
| `customer`   | Counterparty on the revenue side.                              |
| `vendor`     | Counterparty on the expense side.                              |
| `service`    | Service line delivered.                                        |
| `product`    | Inventory or SKU consumed / sold.                              |
| `entity`     | Legal entity within a group (future consolidation).            |

Dimensions are **descriptive**, not part of the balance identity — the
double-entry rule stays enforced at the journal level. Aging, profitability,
and segment reports read `journal_lines` filtered by dimension.

### Universal source-transaction framework

Every financial event carries a consistent lineage envelope so any posted
row can be traced back to its origin without joining through business
tables:

- `source_type`    — canonical event name (`invoice`, `bill`, `payment`,
  `refund`, `inventory_consumption`, `manual`, `reversal`, ...).
- `source_system`  — originating system (`ledgeros.manual`,
  `serviceconnect`, `csv_import`, external partner name).
- `external_id`    — stable identifier in the source system.
- `source_ref`     — human-readable pointer (work order #, bill #, etc.).
- `ledger_impact`  — jsonb summary of the resulting debits/credits and
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

| Route | What it does |
|-------|--------------|
| `/ledger/accounts` | Grouped hierarchy of the chart of accounts with per-type totals, drill-down to General Ledger, create / edit dialog. System accounts are marked and non-deletable. |
| `/ledger/general` | Full posted line detail. Filter by account, date range, source, status, memo search. When an account filter is active, a running balance column is computed on the client. CSV export. |
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

## M2 — AR expansion + AP (planned)

- Customer detail with transactions and a statement generator.
- AR aging (0 / 30 / 60 / 90+) sourced from posted invoices' `balance`.
- Collections queue with contact log and promise-to-pay notes.
- New tables: `vendors`, `bills`, `bill_lines`, `bill_payments`,
  `bill_payment_applications`.
- New RPCs: `post_bill_with_posting` (DR Expense / CR AP),
  `record_vendor_payment_with_posting` (DR AP / CR Cash).
- UI: `/accounts-payable/*` mirroring the AR surface.

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
