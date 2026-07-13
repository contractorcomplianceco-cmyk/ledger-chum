# Phase 6 — Compensation Intelligence Platform Addendum

Status: **Assessment only.** Extends `phase-6-impact-assessment.md` (§13 disbursement taxonomy still governs). No broad UI/API implementation until Rose signs off on §22 questions below. Reference: Tara Casella proposal (monthly retainer step-up, 5% first-year collected retained revenue, milestone bonuses, 2.5%/1.0% recurring software participation, investor/equity paths).

Every commission, participation, bonus, retainer, stipend, milestone, and equity record in the platform routes through this addendum. It supersedes the narrow "commissions" language in prior Phase 6 drafts — the module is now **Compensation Intelligence**, and `commissions.ts` becomes one facet of it.

---

## 1. Core principle — Realized Commissionable Revenue (RCR)

Default eligible base for every plan unless the plan explicitly overrides with written approval:

```
RCR = collected client payment
    − pass-through fees (gov / board / exam / insurance / bond / CPA
                         / registered-agent / qualifier / third-party vendor)
    − taxes collected
    − refunds − credits − chargebacks − discounts
    − financing costs treated as pass-through
    − merchant fees when configured as pass-through
    − noncommissionable line items
```

For recurring software: **Net Recurring Subscription Revenue (NRSR)** = subscription revenue − refunds/credits/chargebacks − taxes − discounts − payment-processing fees − third-party software pass-through − SMS/telephony pass-through − AI usage pass-through − marketplace/hosting fees − nonrecurring implementation/setup/consulting/customization fees (unless expressly included).

Both bases are stored on `compensation_calculation_lines` with every deduction line-itemized so the explainability panel can reproduce the number.

---

## 2. Current Phase 6A files that must change

| File | Change |
|---|---|
| `src/lib/api/services/commissions.ts` | Rename service surface to `compensation`; keep `commissions` as a typed re-export for backward links. Split into per-domain sub-services (plans, participants, attribution, calculations, approvals, payables, statements, clawbacks, disputes, software, milestones, retainers, event-stipends, equity, investor-review, audit, simulator). |
| `src/lib/api/client.ts` | Expose `api.compensation`; keep `api.commissions` as alias reading from `api.compensation`. |
| `src/lib/api/types.ts` | Add compensation-wide enums (see §4). |
| `src/lib/api/adapters/express-adapter.ts` | Add typed placeholder routes under `/compensation/*`. |
| `src/hooks/use-permission.ts` | Extend permission set (see §7). |
| `.lovable/plan.md` | Reflect Compensation Intelligence scope. |
| `docs/production-handoff/phase-6-impact-assessment.md` | Cross-link this addendum from §9 (special-pay routing) and §13 disbursement taxonomy. |

No routes are added yet. The 14-route inventory (§16 of the spec) is queued for 6B after sign-off.

---

## 3. New types required (summary; full shapes go in `compensation-schema.md`)

```ts
type CompPlanFamily =
  | 'sales_commission' | 'brand_ambassador_participation' | 'relationship_commission'
  | 'referral' | 'affiliate' | 'strategic_partner_share' | 'channel_partner_share'
  | 'software_participation' | 'recurring' | 'residual' | 'renewal' | 'expansion'
  | 'cross_sell' | 'upsell' | 'event_lead' | 'franchise' | 'enterprise'
  | 'milestone_bonus' | 'performance_bonus' | 'leadership_bonus' | 'team_bonus'
  | 'spot_bonus' | 'spiff' | 'contest' | 'customer_success_bonus'
  | 'collected_revenue_bonus' | 'gross_profit_bonus' | 'contribution_profit_bonus'
  | 'draw_recoverable' | 'draw_nonrecoverable' | 'tiered' | 'accelerator' | 'decelerator'
  | 'territory' | 'regional_override' | 'manager_override' | 'house_account'
  | 'support_pool' | 'profit_sharing' | 'phantom_equity' | 'equity_milestone'
  | 'investor_milestone_bonus' | 'advisory_fee' | 'event_stipend' | 'retainer';

type CompBasis =
  | 'collected_realized_service_revenue' | 'collected_retained_revenue'
  | 'net_recurring_subscription_revenue' | 'gross_profit' | 'contribution_profit'
  | 'fixed_amount' | 'milestone_amount' | 'tiered_amount' | 'team_pool'
  | 'revenue_share' | 'profit_share' | 'renewal_amount' | 'expansion_amount'
  | 'subscription_amount' | 'discretionary_amount';

type AttributionRole =
  | 'lead_source' | 'relationship_creator' | 'brand_ambassador' | 'referral_source'
  | 'strategic_partner' | 'sales_representative' | 'discovery_owner' | 'demo_owner'
  | 'proposal_owner' | 'negotiation_owner' | 'closer' | 'account_manager'
  | 'expansion_owner' | 'renewal_owner' | 'support_contributor' | 'leadership_override'
  | 'team_pool' | 'affiliate' | 'channel_partner';

type CompLifecycle =
  | 'projected' | 'pending_collection' | 'pending_clearance' | 'eligible'
  | 'calculated' | 'pending_verification' | 'pending_manager_review'
  | 'pending_accounting_review' | 'pending_approval' | 'approved' | 'reserved'
  | 'payroll_ready' | 'ap_ready' | 'payable' | 'scheduled' | 'paid' | 'held'
  | 'adjusted' | 'reversed' | 'clawback_required' | 'disputed' | 'closed';

type EligibilityQualifier =
  | 'directly_sourced' | 'materially_developed' | 'helps_secure' | 'preexisting_pipeline';
```

Plus: `SoftwareParticipationAccount`, `SoftwareParticipationChannel`, `RetainerSchedule`, `RetainerStep`, `EventStipend`, `EquityMilestone` (foundation / $100k / $250k / software / strategic-scale), `InvestorCompensationReview` (with `legal_review_status`), `MilestoneDefinition`, `MilestoneAchievement`, `AttributionEvidence` (CRM ref, email, text, calendar, meeting note, event, file).

---

## 4. New API interfaces required

`CompensationService` composes:

- `plans` — CRUD + versioning (`createPlanVersion`, `activateVersion`, `deactivate`), effective-date windows, participant/service/entity scoping.
- `participants` — internal users, brand ambassadors, referral partners, affiliates, channels, strategic partners.
- `attribution` — multi-touch records with role, evidence, split %, dispute/approval status; `validateSplit` (≥ 100% or plan-defined tolerance); `attributionTimeline`.
- `calculations` — `preview`, `calculate`, `verify`, line-itemized deductions, RCR/NRSR breakdown, per-participant split lines.
- `approvals` — verify → manager → accounting → owner routing.
- `payables` — payroll-ready vs AP-ready split, scheduling, mark-paid.
- `statements` — beginning balance, earned, adjustments, holdbacks, clawbacks, paid, ending, linked source records.
- `clawbacks` — refund/chargeback/credit adjustments, offset vs recovery.
- `disputes` — open, evidence, resolve, audit.
- `software` — subscription accounts (2.5%) and strategic channels (1.0%) with survival flag and monthly/quarterly statement generation.
- `milestones` — configurable definitions ($500 / $1,500 / $2,500 / $2,500 at $25k / $5,000 at $100k for Tara; extensible for other participants).
- `retainers` — stepped schedules (Tara: $3,000 × 3 months → $4,500 thereafter; early step-up requires written approval).
- `eventStipends` — preapproval, event ref, travel budget, revenue attribution, ROI (default $250 local event-day stipend).
- `equity` — tracking only; 5 × 1% tranches; **never auto-issues**; requires legal + tax review; vesting/earned/issued/repurchase/valuation/governance fields.
- `investorReview` — captures investor/capital/funding relationships; always flags `legal_review_required=true`; no automatic transaction-based investor compensation.
- `simulator` — scenario model (rates, splits, bases, floors, holdbacks, chargeback assumptions) → projected impact on liability, GP, CP, payroll/AP, cash, 30/60/90 forecast.
- `audit` — full event stream (see §8).

All mutations return `DemoResult<T>` in mock mode.

---

## 5. New routes required (queued; not built this turn)

`/compensation`, `/compensation/plans` (+ `/new`, `/:id`), `/compensation/participants` (+ `/:id`), `/compensation/attribution` (+ `/:id`), `/compensation/calculator`, `/compensation/simulator`, `/compensation/calculations` (+ `/:id`), `/compensation/approvals`, `/compensation/payables`, `/compensation/statements`, `/compensation/clawbacks`, `/compensation/disputes`, `/compensation/software`, `/compensation/milestones`, `/compensation/retainers`, `/compensation/event-stipends`, `/compensation/equity`, `/compensation/investor-review`, `/compensation/audit`. Legacy `/intelligence/bonus-*` and `/automation/bonus-controls` link into `/compensation/*` rather than duplicate logic.

---

## 6. New permissions required

`compensation.view`, `.view_own`, `.view_sensitive`, `.create_plan`, `.edit_plan`, `.activate_plan`, `.assign_participant`, `.assign_attribution`, `.verify_attribution`, `.preview`, `.calculate`, `.verify`, `.approve`, `.adjust`, `.hold`, `.release`, `.reverse`, `.create_clawback`, `.resolve_dispute`, `.create_payable`, `.mark_paid`, `.export`, `.manage_software_participation`, `.manage_milestones`, `.manage_retainers`, `.manage_equity_tracking`, `.manage_investor_review`.

Role defaults per spec §17 — Owner full; Accounting Lead calc/verify/payable/statements/adjust-review; Systems Reviewer diagnostics only (no compensation visibility); Accountant read/export/GL-review; Team Member `view_own` only; Integration Service draft events only.

Additional roles from prior addendum still apply: `legal_counsel` (equity + investor review scope), `external_accountant` (read + comment).

---

## 7. New audit events

`compensation.plan.*` (created/changed/versioned/activated/deactivated), `.participant.assigned`, `.attribution.*` (added/changed/approved/disputed), `.calculation.*` (previewed/created/verified/approved/held/released/adjusted/reversed), `.clawback.created`, `.payable.created`, `.payment.scheduled`, `.payment.marked_paid`, `.statement.generated`, `.software.activated`, `.milestone.achieved`, `.retainer.changed`, `.event_stipend.approved`, `.equity.updated`, `.investor.flagged_for_legal_review`. Every event carries actor, correlation id, plan-version id, RCR/NRSR snapshot, and pre/post lifecycle state.

---

## 8. Tara plan interpretation

Encoded as a **composite participant** with six stacked, independently-priced plan attachments:

| Slot | Family | Basis | Rate / Amount | Notes |
|---|---|---|---|---|
| A | `retainer` | fixed | $3,000 × months 1–3, then $4,500 from month 4 | Stepped schedule; early step-up gated by written-approval flag |
| B | `brand_ambassador_participation` | `collected_retained_revenue` | 5% first-year | Eligible relationships only; post-termination survival flag per signed terms |
| C | `milestone_bonus` (×5) | `milestone_amount` | $500 / $1,500 / $2,500 / $2,500@$25k / $5,000@$100k | Independent of B unless plan expressly stacks |
| D | `software_participation` | `net_recurring_subscription_revenue` | 2.5% direct / 1.0% channel | Survival flag; monthly or quarterly statements per account/channel |
| E | `investor_milestone_bonus` / `advisory_fee` | fixed / milestone | Counsel-approved only | `legal_review_required=true`, never auto-calculated |
| F | `equity_milestone` | tracking-only | 5 × 1% tranches | Foundation / $100k RCR / $250k RCR-or-channel / software / strategic-scale; requires legal + tax + written approval; never auto-issues |

Each slot is a distinct row in `compensation_plan_participants` with its own `effective_date`, `expiration_date`, and `survival_policy`.

---

## 9. Sales plan interpretation

Configurable **standard sales pool** (default 10% of RCR) with pluggable split rules:

- If Tara's attribution qualifies as eligible relationship: pool splits 5% to Tara (slot B), remainder (default 5%) to salesperson.
- If Tara does not qualify: full pool goes to sales attribution chain per split rules.
- Additional roles (closer / relationship / support / team) allocate from the remainder; splits must total 100% of the remainder or fail validation.
- Rose can change pool %, Tara %, remainder allocation, caps, floors, minimum margin, holdback, collection requirement, and payment-clearing lag from the plan editor — no hardcoded rates in code.

Worked example (RCR $20,000, 10% pool, Tara eligible):
- Pool = $2,000. Tara = $1,000 (5% of RCR). Salesperson remainder = $1,000 (5% of RCR).
- Tara not eligible → salesperson receives full $2,000.

---

## 10. Proposed default split logic

1. Compute RCR (or NRSR for recurring plans) with itemized deductions.
2. Resolve applicable plan(s) per participant/service/entity/effective-date.
3. For each plan, compute pool = base × rate (or tier/milestone/fixed).
4. Load attribution records for the source (deal/invoice/payment/subscription).
5. Validate splits total 100% of pool (or plan-defined tolerance); flag conflicts.
6. Apply role-priority stacking: brand-ambassador participation is deducted **before** sales pool remainder is split among sales-side roles.
7. Apply holdback and chargeback-window reserve.
8. Emit `compensation_calculation_lines` per participant with full explainability.
9. Route to lifecycle state per §8 of the spec.
10. Simulator uses the same pipeline with substituted parameters — never a parallel formula.

---

## 11. Approved policy defaults (Rose sign-off 2026-07-13)

Encoded in `src/lib/api/services/compensation/policy-defaults.ts` as
`COMPENSATION_POLICY_DEFAULTS`. Every plan may override any field via
`CompensationPlanPolicyOverrides`; the resolved policy is snapshotted onto
every calculation line for audit reproducibility. Overrides that relax an
invariant (pass-through inclusion, uncollected inclusion, zero holdback,
zero chargeback window) additionally require `legal_review_status = 'cleared'`
plus explicit Owner approval — the backend must reject the plan otherwise.

| # | Question | Approved default | Override path |
|---|---|---|---|
| 1 | Attribution split total | Must equal 100% (± tolerance 0.0001) | `attribution.allowLeadershipOverstack = true` permits stacked > 100% with justification + audit event |
| 2 | Payment-clearing lag | **3 days** global | Per-plan `revenueRecognition.paymentClearingLagDays` |
| 3 | BA + milestone stacking | **Elect per milestone**; never auto-stack | Per-plan `stacking.brandAmbassadorMilestoneStack = 'auto_stack'` |
| 4 | Post-termination survival | **12 months** when signed terms silent | Per-plan `postTermination.survivalMonthsDefault`; legal review always required to release |
| 5 | Software participation basis | **Collected-and-cleared NRSR only** | Per-plan `softwareParticipation.basis = 'billed_nrsr'` (requires legal review — permits pre-collection accrual) |
| 6 | Chargeback window | **90 days** | Per-plan `riskReserve.chargebackWindowDays` (0 requires legal + Owner) |
| 7 | Draw offset order | Draws offset at **payable** state | Per-plan `riskReserve.drawOffsetState` |
| 8 | Holdback release | **Automatic on chargeback-window expiry** | Per-plan `riskReserve.holdbackReleaseTrigger = 'requires_owner_approval'` |
| 9 | House-account rule | **Suppress** sales commission (0% pool) | Per-plan `salesPool.houseAccountRule = 'reduce'` + `houseAccountReducedPoolPct` |
| 10 | Event stipend caps | Local **$250/day**, travel **$400/day**, multi-day cap **$2,000** | Per-plan `eventStipend.*` |

**Invariants that survive all overrides (unless legal + Owner override attached):**

- No compensation is ever calculated from pass-through funds.
- No compensation is ever calculated from uncollected revenue.
- Commissions, bonuses, retainers, milestone payments, software participation, profit sharing, and equity remain distinct disbursement classes end-to-end (see phase-6 §13 taxonomy and `DEFAULT_FAMILY_DISBURSEMENT_CLASS`).
- Every default change emits `compensation.policy_defaults.updated`; every plan override that relaxes an invariant emits `compensation.plan.invariant_override` with the attached legal-review record ID.

---

## 12. Legal / accounting review flags (mandatory)

The following actions **cannot** be approved in-app without a `legal_review_status = 'cleared'` record attached, and equity/investor items additionally require `tax_review_status = 'cleared'`:

- Any `investor_milestone_bonus`, `advisory_fee`, or capital-introduction compensation.
- Every `equity_milestone` state transition (grant / vest / issue / repurchase / valuation update / governance change).
- Post-termination compensation payments (survival-clause invocation).
- Retroactive reduction of earned compensation.
- Any plan permitting inclusion of pass-through revenue in the base.
- Any compensation to international employees/consultants (payroll, tax, and treaty review).
- Charitable / sponsorship compensation classified as marketing versus donation.

AI recommendations may surface these; only humans with the required role and cleared review may approve.

---

## 13. Proposed implementation order

1. **6B-1 — Types + service scaffolding (no UI).** Land compensation types, split `commissions.ts` into subservices, keep mock data flowing, ship spec docs (§20).
2. **6B-2 — Plans + Participants + Attribution.** `/compensation`, `/compensation/plans[/new|/:id]`, `/compensation/participants[/:id]`, `/compensation/attribution[/:id]`, Tara + Standard Sales seeded plans, split validator UI.
3. **6B-3 — Calculator + Simulator + Calculations.** RCR/NRSR breakdown UI, worked-example explainability panel, `/compensation/calculator`, `/compensation/simulator`, `/compensation/calculations[/:id]`.
4. **6B-4 — Approvals / Payables / Statements / Clawbacks / Disputes.** Lifecycle screens, holdbacks, chargeback flow.
5. **6B-5 — Software / Milestones / Retainers / Event Stipends.** Recurring participation statements, milestone tracker, retainer step-up.
6. **6B-6 — Equity + Investor Review + Audit.** Tracking-only equity screens with legal/tax gates, investor-review workqueue, audit stream.
7. **6C-D — Admin & Users / Integrations / Intelligence AI + spec docs** (unchanged from prior plan, now downstream of compensation).

Each sub-step is one turn, mock-only, with `DemoResult` mutations and permission-gated restricted states.

---

## 14. Files expected to change (across 6B-1 → 6B-6)

- `src/lib/api/services/compensation/` (new folder) — `plans.ts`, `participants.ts`, `attribution.ts`, `calculations.ts`, `approvals.ts`, `payables.ts`, `statements.ts`, `clawbacks.ts`, `disputes.ts`, `software.ts`, `milestones.ts`, `retainers.ts`, `event-stipends.ts`, `equity.ts`, `investor-review.ts`, `simulator.ts`, `audit.ts`, `index.ts`.
- `src/lib/api/services/commissions.ts` — re-export alias.
- `src/lib/api/types.ts` — enums from §3.
- `src/lib/api/client.ts` — `api.compensation`.
- `src/lib/api/adapters/express-adapter.ts` — placeholder routes.
- `src/hooks/use-permission.ts` — extended permission set.
- `src/lib/mock/compensation/` (new) — Tara plan, Standard Sales plan, seed calculations, milestones, software accounts, retainer schedule, equity tranches, investor review records.
- `src/components/compensation/` (new) — plan editor, attribution editor, calculator explainability panel, simulator, lifecycle badge, statement view, milestone tracker, retainer schedule, equity tracker.
- `src/routes/compensation.*.tsx` — 19 route files per §5.
- `src/lib/mock/nav.ts` — new Compensation section.
- `docs/production-handoff/` — 16 spec files per spec §20.
- `.lovable/plan.md`, `phase-6-impact-assessment.md` — cross-links.

`src/routeTree.gen.ts` is regenerated by the plugin — never hand-edited.

---

## 15. Working defaults (until Rose approves changes)

Per spec §23, encoded as plan defaults (not hardcoded): base = collected & cleared realized CCA service revenue; pass-through excluded; standard sales pool = 10%; Tara = 5% when eligible; salesperson = remainder; no duplicate compensation on same basis unless stacking explicitly allowed; partial payments → proportionate eligibility; refunds/chargebacks → adjustment or clawback; investor comp → legal review; equity → tracked, never auto-issued; AI = advisory only.

---

**Ready to proceed on 6B-1 after sign-off on §11 policy questions and confirmation that this scope replaces the narrower Commission Management sub-phase.**
