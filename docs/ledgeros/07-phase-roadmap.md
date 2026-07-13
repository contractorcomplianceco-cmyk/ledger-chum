# LedgerOS Phase Roadmap

**Version:** 1.0
**Rule:** Ship phases in order. Do not add executive-only features ahead of
the foundation they explain.

## Phase 0 — Baseline (complete)

- TanStack Start scaffold, APEX UI shell, mock adapters.
- Preliminary Phase-1 backend migration (organizations, api_clients,
  audit_events, sync_history, customers, accounts, journals, invoices,
  payments, credits, refunds, inventory_consumption). Retained.
- ServiceConnect public integration routes (customers, work-orders/completed,
  invoices, payments, inventory-consumption). Retained.

Existing UI (APEX, dashboard, workspaces) is not removed. It continues to
run on mock adapters until the corresponding backend phase lands.

## Phase 1 — Accounting Foundation (next)

Scope:

- Fiscal periods table + open/close functions.
- Formal `roles` model already exists; add UI-free server functions for
  `assignRole`, `revokeRole`.
- Audit event coverage on every mutation (verify + fill gaps).
- Tenant isolation verification: RLS policies audited on every existing
  table; per-org GRANT audit.
- API key issuance server function (`issueApiClientKey`, owner-only) +
  rotation.
- Seed script for pilot org (Chart of Accounts, default AR/AP/Bank/Tax
  accounts, fiscal period, ServiceConnect api_client).

Exit criteria:

- Every mutating server function writes exactly one `audit_event`.
- Every public-schema table has GRANTs and RLS validated.
- Fiscal periods enforced by the posting engine.
- Pilot org can be provisioned from a single seed migration + one CLI call.

## Phase 2 — Double-Entry Engine (hardening)

Scope:

- Explicit `postJournal` server function shared by all sources (invoice
  post, payment record, bill post, manual entry).
- Reversing-entry helper.
- Trial-balance and general-ledger views verified against seeded fixtures.
- Period-lock check inside `postJournal`.
- Manual-journal UI (accountant-only).

Exit criteria:

- 100% of ledger writes go through `postJournal`.
- Reversing journals reconcile to zero net GL impact.
- Trial balance always balances for any date range on any seeded fixture.

## Phase 3 — Accounts Receivable

Scope:

- Full invoice lifecycle server functions (draft/edit/post/void, credit
  memo, refund).
- Payment application + unapplied credit model finalized.
- AR aging view with configurable buckets.
- Collections status derivation.
- Payment terms.
- UI: invoice list, invoice detail, payments, credits, aging.

## Phase 4 — Accounts Payable

Scope:

- Vendor, bill, bill_line, vendor_payment tables + RLS.
- Bill lifecycle (draft/post/void, partial pay).
- Expense capture (with category → default account).
- AP aging.
- UI: vendors, bills, expenses, aging.

## Phase 5 — Banking

Scope:

- Bank accounts, transactions, deposits, transfers.
- Matching framework (rules + candidates).
- Reconciliation workflow with statement import.
- UI: bank feed, matching queue, reconciliation session.

## Phase 6 — Reporting

Scope:

- Trial Balance, P&L, Balance Sheet, Cash Flow, AR/AP aging, customer and
  job profitability.
- Period comparison + drill-down to journals.
- Export (CSV, PDF).
- UI: report catalog + saved views.

## Phase 7 — APEX Intelligence (on real data)

Scope: rewire existing APEX experiences (Money, Growth, People, Company,
Opportunity Engine, Financial DNA, Timeline, Relationship Graph, Digital
Twin, Role Workspaces, AI Personas) onto real reporting data. AI remains
read-only: cannot post, move money, or approve.

## Phase 8 — Multi-System & Advanced

Scope: additional operational-system integrations (CRM, ERP, construction,
healthcare), reconciliation reports between systems, tax reporting framework
per jurisdiction, multi-entity consolidation.

## Sequencing Rule

APEX features consuming a data domain (AR, AP, banking, reporting) are only
promoted from mock to live once that phase has shipped. Until then the
existing mock-backed UI stays as-is.
