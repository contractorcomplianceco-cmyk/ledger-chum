## Scope

This is a massive product spec — 12 modules spanning cash allocation, anomaly detection, tech ROI, marketing attribution, bonuses, expense matching, forecasting, an AI copilot, and a confidence score. LedgerOS today is a **UI Design Lab** with mock data (`src/lib/mock/*`) and no backend. I'll match that pattern: build these as designed, navigable screens with realistic mock data, following the LedgerOS visual system already established (dark sidebar, gradient KPI cards, existing components). No Supabase/backend changes.

I'll deliver in **phases**. This plan covers **Phase 1 only** — the module you flagged as first priority: **Revenue Allocation & Cash Availability**. After you approve Phase 1 shipped, we sequence the rest.

## Phase 1 — Cash Availability & Revenue Allocation Engine

### New routes

```
/cash-availability          → main dashboard: "what's actually spendable"
/cash-availability/allocations   → per-payment allocation breakdowns
/cash-availability/rules    → treatment rules per line-item type
```

### Screens

**1. Cash Availability dashboard (`/cash-availability`)**
- Hero waterfall card: `Bank cash → − Pass-through → − Commission reserve → − Tax reserve → − Payroll reserve → True Available Operating Cash`
- 4 KPI tiles: Total Cash, Restricted Obligations, Reserved (commissions/tax/payroll), True Available
- Stacked bar chart: 12-month history of Available vs Restricted vs Reserved
- Guardrail status strip: "2.4 payroll cycles protected", "Pass-through fully held ✓", "Tax reserve 82% funded"
- Right rail: upcoming pass-through disbursements (filing fees due, qualifier payments)

**2. Allocations ledger (`/cash-availability/allocations`)**
- Table of recent client payments, each row expandable to show the split:
  ```
  Payment $5,000 from Acme LLC
    ├─ Government filing fee   $1,250  Restricted
    ├─ Qualifier payment       $  750  Restricted
    ├─ Sales commission        $  300  Reserved
    └─ CCA service revenue     $2,700  Operating
  ```
- Filter chips: Restricted / Reserved / Operating / All
- Sidebar detail panel (reuses transaction-detail-panel pattern) with allocation timeline & source invoice link

**3. Treatment rules (`/cash-availability/rules`)**
- List of the 9 invoice-line treatments (CCA Revenue, Pass-Through, Commissionable, Non-Commissionable, Reimbursable Expense, Tax Reserve, Refundable Deposit, Deferred Revenue, Other Restricted) with GL account mapping, recognition policy, and a "review needed by accountant" flag
- Read-only cards with edit affordance (design lab — no persistence)

### Components to add
- `src/components/cash/waterfall-card.tsx` — the hero cash-flow waterfall
- `src/components/cash/allocation-row.tsx` — expandable allocation breakdown
- `src/components/cash/treatment-badge.tsx` — Restricted / Reserved / Operating pill (3 semantic tones)
- `src/components/cash/guardrail-strip.tsx` — payroll-cycles / reserve status
- `src/components/cash/obligation-list.tsx` — upcoming pass-through disbursements

### Mock data
- `src/lib/mock/cash-availability.ts` — payments with line-item splits, obligation schedule, reserves, treatment rules, 12-month history

### Sidebar / nav
- Add a new **"Cash & Revenue"** section to `NAV_PRIMARY` above "Reports": Cash Availability, Allocations, Treatment Rules
- Wire the executive dashboard's Cash KPI card to link to `/cash-availability`

### Executive dashboard touch
- Replace/augment the existing "Cash Balance" KPI with **"True Available Cash"** and add a small breakdown line ("$892k bank · $2,000 restricted · $300 reserved") so the top-level view reflects the new engine

## Explicitly out of scope for Phase 1

Modules 2–12 (Overhead Intelligence, Tech & AI Economics, Marketing ROI, Bonus Center, Expense Intelligence, Revenue Leakage, Margin Intelligence, Financial Digital Twin, Cash Guardrails config UI, AI Copilot, Financial Confidence Score) — I'll plan and build these in follow-up phases once Phase 1 is approved.

## Constraints honored
- Visual language: existing LedgerOS dark sidebar, gradient KPIs, shadcn tokens — no new theme
- No backend, no Supabase, no auth — mock data only, matching Design Lab pattern
- No changes to existing banking/transactions/reconciliation screens beyond the KPI link

## Confirm before I build

1. Ship **Phase 1 only** now (Cash Availability + Allocations + Rules) and queue the other 11 modules for later phases? Or a different first slice?
2. OK to add a **"Cash & Revenue"** section to the sidebar, or keep it flat?
