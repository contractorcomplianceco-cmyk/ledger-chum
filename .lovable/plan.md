# Phase 5 — Core Accounting Product

Goal: make LedgerOS a complete standalone accounting platform. No new ServiceConnect features. All numbers come from the posting engine — no mock financial data in shipped UIs.

## Scope & sequencing

Phase 5 is too large for a single ship. I'll deliver it as four milestones, each independently valuable and typecheck-clean. After each milestone I'll pause for review before starting the next.

```text
M1  Ledger core        →  Chart of Accounts, General Ledger, Journal Entry workspace
M2  AR + AP            →  AR expansion, Vendors, Bills, Vendor payments
M3  Banking + Reports  →  Bank accounts, transactions, reconciliation, 6 financial reports
M4  Close + Settings   →  Period close workflow, accounting settings, roadmap doc
```

## M1 — Ledger core

**Backend (one migration)**

- `accounts`: add `parent_id uuid`, `is_system boolean`, `sort_order int`; recursive view `account_tree_v` for hierarchy + rollup balances from `journal_lines` (posted only).
- `journal_entries`: add `reversal_of uuid`, `reversed_by uuid`, `approval_status`, `approved_by`, `approved_at`.
- `journal_attachments` table (file refs + metadata, RLS by org).
- RPCs: `post_manual_journal`, `reverse_journal` (creates offsetting balanced entry, links both ways, respects period lock), `account_balance(_account, _as_of)`.
- Seed system default accounts on org create (idempotent).

**Server functions** (`src/lib/accounting/`)

- `accounts.functions.ts` — list tree, create/update/deactivate, reorder, resolve balances as-of.
- `general-ledger.functions.ts` — paginated journal query with filters (account, date range, source, status, text), running balance per account.
- `journals.functions.ts` — create draft, add/edit lines (draft only), post (balanced check + period check), reverse, list attachments.

**UI routes**

- `/accounting/chart-of-accounts` — tree with expand/collapse, type-grouped, balances column, drill-down opens filtered GL, edit dialog, activate/deactivate.
- `/accounting/general-ledger` — filter bar (account, date range, source type, status), virtualized table, DR/CR columns, running balance, CSV export.
- `/accounting/journals` — list + create workspace: header form, line editor with live DR/CR totals + balance indicator, save draft, post, reverse action on posted entries, timeline of audit events.

## M2 — AR expansion + AP

**AR (uses existing schema)**

- `/accounts-receivable/customers` — list, detail with balance, transactions, statement generator (PDF-ready HTML).
- `/accounts-receivable/aging` — 0/30/60/90+ buckets from posted invoices.
- `/accounts-receivable/collections` — overdue queue, contact log, promise-to-pay notes.

**AP (new tables + posting)**

- Migration: `vendors`, `bills`, `bill_lines`, `bill_payments`, `bill_payment_applications`. Grants + RLS scoped to `is_org_member`. Reuse fiscal-period + audit patterns.
- RPCs: `post_bill_with_posting` (DR expense / CR AP), `record_vendor_payment_with_posting` (DR AP / CR Cash), balanced + period-checked, audit + idempotency by `(org, external_source, external_id)`.
- Server fns + UI: `/accounts-payable/vendors`, `/accounts-payable/bills` (list, create, approve, post), `/accounts-payable/payments`, `/accounts-payable/aging`.

## M3 — Banking + Reports

**Banking foundation**

- Migration: `bank_accounts` (linked to a GL cash account), `bank_transactions` (imported/manual), `bank_transfers`, `bank_reconciliations` + `reconciliation_lines`.
- UI: `/banking/accounts`, `/banking/transactions`, `/banking/transfers`, `/banking/reconcile/$id` (statement balance vs cleared, match/clear/create).
- No external feed integration — manual entry + CSV import only.

**Financial reports** (server-computed from `journal_lines`)

- `/reports/trial-balance` — as-of date, DR/CR per account, totals prove.
- `/reports/profit-and-loss` — period, revenue − expense, comparative optional.
- `/reports/balance-sheet` — as-of, asset = liability + equity check.
- `/reports/cash-flow` — indirect method from P&L + balance-sheet deltas.
- `/reports/ar-aging`, `/reports/ap-aging`.
- All share a `<ReportShell>` with date pickers, org scope, CSV/print export, drill-down to GL.

## M4 — Close + Settings + Docs

**Period close** (extends existing `fiscal_periods`)

- Checklist server-side: unposted journals, draft invoices, unreconciled bank accounts, unapplied payments.
- `/accounting/period-close` — checklist view, warnings, "Close period" action requires role check, writes audit event, sets `fiscal_periods.status='closed'`. Reopen requires admin + audit.

**Accounting settings**

- `/settings/accounting` tabs: Fiscal (year start, period cadence), Account defaults (system mappings deep-link to `/settings/account-mappings`), Numbering (invoice/bill/journal prefixes + next-number), Invoice defaults, Payment terms (Net 15/30/etc CRUD), Tax rates (rate table, per-jurisdiction).
- Backed by `organization_settings` + new `numbering_sequences`, `payment_terms`, `tax_rates` tables.

**Docs**

- `docs/ledgeros/16-core-accounting-roadmap.md` — milestones, data model additions, posting rules for bills, reconciliation model, report definitions, period-close semantics.

## Cross-cutting rules

- Every new `public.<table>` migration: `GRANT` → `ENABLE RLS` → policies scoped via `is_org_member` / `has_role`.
- Every posting path goes through a SECURITY DEFINER RPC that checks `is_period_open` and writes an `audit_events` row.
- Reversals never mutate posted journals — always insert an offsetting entry.
- Approval-gated actions (post bill, close period, reverse) require `has_role(auth.uid(), _org, 'admin'|'accountant')`.
- All shipped screens use real server fns; demo fallback only where the user has no org yet.
- Design: reuse `AppShell`, `PageHeader`, `Card`, tabular numerics, semantic tokens only.

## Deliverable per milestone

Typecheck clean, build clean, migration approved, docs updated, brief change summary. Nav entries added under an "Accounting" section in the sidebar.

## Starting point

On approval I begin **M1 (Ledger core)**: migration → server fns → three routes → nav → typecheck. Estimated as one focused ship. I'll pause after M1 for your review before M2.
