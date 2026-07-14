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
