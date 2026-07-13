# Sub-phase 6B-3 — Compensation Operations Layer

Building the full Compensation Operations layer on top of 6B-2. All work is
frontend + typed mock-service surface only. No backend, no Supabase, no
auth changes. Every mutation returns `DemoResult` with the standard
"UI demonstration only — no compensation or accounting record was modified."
message.

## Scope preserved from 6B-2

All 13 existing compensation routes, plans/versions, resolved policy
snapshots, participants, multi-touch attribution (with per-pool 100%
validation), stacked pools, Tara eligibility states, evidence library,
conflict center, eligibility checker, plan preview, invariant rules, typed
API architecture, mock+Express adapter seams, and demonstration-only
messaging all remain intact.

## New routes (21)

Wired into the `CompensationShell` subnav under an "Operations" group.

```text
/compensation                              -> ops dashboard
/compensation/calculations                 -> list + saved views
/compensation/calculations/new             -> 10-step guided workflow
/compensation/calculations/$id             -> detail (16 tabs)
/compensation/calculations/$id.preview     -> preview snapshot
/compensation/verification                 -> queue
/compensation/approvals                    -> approval center
/compensation/reserves                     -> reserve center
/compensation/payables                     -> list
/compensation/payables/$id                 -> detail
/compensation/payment-batches              -> list
/compensation/payment-batches/$id          -> detail
/compensation/statements                   -> list
/compensation/statements/$id               -> statement view
/compensation/holdbacks                    -> holdback center
/compensation/adjustments                  -> adjustments + reversals
/compensation/clawbacks                    -> clawback center
/compensation/disputes                     -> list
/compensation/disputes/$id                 -> detail
/compensation/reconciliation               -> reconciliation workspace
/compensation/audit                        -> compensation audit history
```

## Domain types (new file `service/operations-types.ts`)

`CompensationCalculation`, `CompensationCalculationStatus` (20 states),
`CompensationCalculationLine`, `CompensationCalculationVersion`,
`CalculationSourceRecord`, `CalculationPolicySnapshot`,
`CompensationVerification`, `CompensationApproval`, `CompensationReserve`,
`CompensationPayable`, `CompensationPaymentBatch`, `CompensationStatement`,
`CompensationStatementLine`, `CompensationHoldback`, `HoldbackRelease`,
`CompensationAdjustment`, `CompensationReversal`, `CompensationClawback`,
`ClawbackRecovery`, `CompensationDispute`, `CompensationReconciliation`,
`CompensationReconciliationException`, `AccountingImpactPreview`.

## Service methods (extend `compensationService`)

All ~45 methods listed in §21 of the spec. Reads return typed shapes,
mutations return `DemoResult` via `mockMutation`.

## Mock data (new file `service/operations-mock-data.ts`)

Fictional demonstration records covering every scenario in §25 (Tara
stacked, salesperson-only, strategic partner, affiliate, referral,
software participation, strategic-channel, milestone bonus, retainer,
event stipend, partial payment, pending clearance, refund, chargeback,
holdback, clawback, dispute, post-termination, house account, renewal,
expansion, below-target margin, manual adjustment).

## Components (`src/components/compensation/operations/`)

- `calculation-status-badge`, `calc-lifecycle-funnel`, `calc-line-table`
- `verification-checklist`, `approval-decision-panel`
- `reserve-summary`, `payable-status-badge`, `payment-batch-status`
- `statement-section`, `holdback-timeline`, `clawback-recovery-panel`
- `dispute-timeline`, `reconciliation-exception-row`
- `accounting-impact-preview` (labeled "Proposed accounting treatment —
  requires backend validation and accountant approval.")

## Permissions

Extend the permission strings in §22. Continue using existing
`usePermission` hook to gate destructive/approval actions.

## Navigation

Add an "Operations" section to `CompensationShell` subnav and extend
`src/lib/mock/nav.ts` accordingly.

## Invariants surfaced in UI

- Pass-through funds visibly excluded from every calculation display
- Uncollected revenue blocks progression in the create-calculation flow
  unless the plan is fixed / milestone
- Partial payments show pro-rata eligibility
- Stacked pools shown as separate rows, never blended
- Every calculation view surfaces the resolved policy snapshot
- Paid calculations render read-only; corrections require Adjustment/Reversal
- Holdback release honors chargeback-window + Rose-approval triggers
- Clawback recovery never auto-touches already-paid amounts
- Statements keep classes separate (retainer / revenue participation /
  milestone / software participation / event stipend / investor / equity)

## Validation

Typecheck and production build pass; every new route renders; role-aware
restricted states shown for team member / integration service; every
mutation displays the demonstration-only toast.

## Technical Details

- New files under `src/lib/api/services/compensation/` and
  `src/components/compensation/operations/`.
- `service.ts` extended (not rewritten) — keeps the 6B-2 surface intact.
- Route files use flat dot-separated names to match TanStack Router.
- No changes to `client.ts` schema (only additive method surface).
- No `src/pages/`, no Supabase, no auth work.

## Completion report

Delivered at the end of implementation covering the 28 items requested in
§27.
