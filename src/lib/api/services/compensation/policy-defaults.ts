/**
 * Compensation policy defaults.
 *
 * These values are **defaults**, not hard-coded business rules. Every
 * compensation plan may override any field via `CompensationPlan.policyOverrides`.
 * The resolved policy that produced a calculation is snapshotted onto every
 * `compensation_calculation_lines` row so the audit trail is complete and
 * reproducible.
 *
 * Rose-approved defaults, 2026-07-13. Any change to this file is itself an
 * audit event (`compensation.policy_defaults.updated`) — the backend must
 * refuse to load a build whose defaults hash differs from the recorded
 * approval hash without a signed override.
 *
 * Core invariants preserved regardless of override:
 *   1. No compensation is calculated from pass-through funds.
 *   2. No compensation is calculated from uncollected revenue.
 *   3. Commissions, bonuses, retainers, milestone payments, software
 *      participation, profit sharing, equity, and investor comp remain
 *      distinct disbursement classes end-to-end (see phase-6 §13 taxonomy).
 *
 * A plan may override the base to include pass-through or uncollected
 * revenue ONLY if `legal_review_status = 'cleared'` is attached AND
 * `policyOverrides.allowPassThroughInBase` / `allowUncollectedInBase` is
 * set explicitly by an Owner-role user.
 */

import type { CompensationPlanFamily } from "./types";

// ─── Attribution ──────────────────────────────────────────────────────────

export interface AttributionPolicy {
  /** Splits must sum exactly to this fraction of the pool (1 = 100%). */
  requiredTotal: 1;
  /** Absolute tolerance for rounding (fraction of pool). */
  tolerance: number;
  /**
   * If true, a leadership override (`compensation.attribution.override`)
   * may authorize a stacked total > 100% — recorded as an audit event with
   * required justification.
   */
  allowLeadershipOverstack: boolean;
}

// ─── Revenue recognition ──────────────────────────────────────────────────

export interface RevenueRecognitionPolicy {
  /** Default eligibility trigger — RCR requires cleared payment. */
  requireCollected: true;
  /** Default: pass-through fees NEVER count toward RCR/NRSR base. */
  excludePassThrough: true;
  /** Days after payment posts before it counts as "cleared". */
  paymentClearingLagDays: number;
  /** Recognize partial payments proportionately (pro-rata eligibility). */
  proRataOnPartialPayments: boolean;
}

// ─── Chargebacks, holdbacks, clawbacks ────────────────────────────────────

export interface RiskReservePolicy {
  /** Window during which a chargeback/refund automatically adjusts comp. */
  chargebackWindowDays: number;
  /** Portion of earned comp held in reserve until window expires (0..1). */
  defaultHoldbackPct: number;
  /** How the holdback is released once the window closes. */
  holdbackReleaseTrigger: "automatic_on_window_expiry" | "requires_owner_approval";
  /** Recoverable-draw offset order — which lifecycle state absorbs draw. */
  drawOffsetState: "approved" | "payable" | "paid_only";
}

// ─── Software / recurring participation ───────────────────────────────────

export interface SoftwareParticipationPolicy {
  /** Basis for monthly participation accrual. */
  basis: "collected_and_cleared_nrsr" | "billed_nrsr";
  /** Post-termination survival months when signed terms are silent. */
  survivalMonthsDefault: number;
}

// ─── Stacking rules ───────────────────────────────────────────────────────

export interface StackingPolicy {
  /**
   * Brand-ambassador participation (slot B) and milestone bonus (slot C):
   * stack only when explicitly elected per milestone; never auto-stacked.
   */
  brandAmbassadorMilestoneStack: "elect_per_milestone" | "auto_stack";
  /** Global rule: no duplicate compensation on the same basis by default. */
  preventDoubleDipOnSameBasis: true;
}

// ─── Sales pool ───────────────────────────────────────────────────────────

export interface SalesPoolPolicy {
  /** Default standard sales pool as fraction of RCR. */
  defaultPoolPct: number;
  /** Tara-slot share of RCR when eligible. */
  defaultRelationshipSharePct: number;
  /**
   * House-account behavior: 'suppress' → 0% pool; 'reduce' → configurable
   * reduced pool. Default suppresses to protect margin.
   */
  houseAccountRule: "suppress" | "reduce";
  /** Reduced pool % when houseAccountRule = 'reduce'. */
  houseAccountReducedPoolPct: number;
}

// ─── Post-termination ─────────────────────────────────────────────────────

export interface PostTerminationPolicy {
  /** Default survival window if signed terms are silent. */
  survivalMonthsDefault: number;
  /** Post-termination payments always require legal review before release. */
  requireLegalReview: true;
}

// ─── Event stipends ───────────────────────────────────────────────────────

export interface EventStipendPolicy {
  localPerDiem: number;
  travelPerDiem: number;
  multiDayCap: number;
}

// ─── Composite ────────────────────────────────────────────────────────────

export interface CompensationPolicyDefaults {
  attribution: AttributionPolicy;
  revenueRecognition: RevenueRecognitionPolicy;
  riskReserve: RiskReservePolicy;
  softwareParticipation: SoftwareParticipationPolicy;
  stacking: StackingPolicy;
  salesPool: SalesPoolPolicy;
  postTermination: PostTerminationPolicy;
  eventStipend: EventStipendPolicy;
  /** Never allow pass-through in base unless override cleared by legal + Owner. */
  requirePassThroughExclusion: true;
  /** Never allow uncollected revenue in base unless override cleared by legal + Owner. */
  requireCollectedRevenue: true;
}

export const COMPENSATION_POLICY_DEFAULTS: CompensationPolicyDefaults = {
  attribution: {
    requiredTotal: 1,
    tolerance: 0.0001,
    allowLeadershipOverstack: true,
  },
  revenueRecognition: {
    requireCollected: true,
    excludePassThrough: true,
    paymentClearingLagDays: 3,
    proRataOnPartialPayments: true,
  },
  riskReserve: {
    chargebackWindowDays: 90,
    defaultHoldbackPct: 0.1,
    holdbackReleaseTrigger: "automatic_on_window_expiry",
    drawOffsetState: "payable",
  },
  softwareParticipation: {
    basis: "collected_and_cleared_nrsr",
    survivalMonthsDefault: 12,
  },
  stacking: {
    brandAmbassadorMilestoneStack: "elect_per_milestone",
    preventDoubleDipOnSameBasis: true,
  },
  salesPool: {
    defaultPoolPct: 0.1,
    defaultRelationshipSharePct: 0.05,
    houseAccountRule: "suppress",
    houseAccountReducedPoolPct: 0,
  },
  postTermination: {
    survivalMonthsDefault: 12,
    requireLegalReview: true,
  },
  eventStipend: {
    localPerDiem: 250,
    travelPerDiem: 400,
    multiDayCap: 2000,
  },
  requirePassThroughExclusion: true,
  requireCollectedRevenue: true,
};

/**
 * A per-plan override envelope. All fields optional — omitted fields inherit
 * from defaults. Overrides that relax an invariant (pass-through inclusion,
 * uncollected inclusion, holdback = 0, chargeback window = 0) require an
 * attached `legal_review_status = 'cleared'` record on the plan and an
 * explicit Owner approval; the backend must reject the plan otherwise.
 */
export interface CompensationPolicyOverrides {
  attribution?: Partial<AttributionPolicy>;
  revenueRecognition?: Partial<RevenueRecognitionPolicy> & {
    /** Legal-cleared override to include pass-through in base. */
    allowPassThroughInBase?: boolean;
    /** Legal-cleared override to include uncollected revenue in base. */
    allowUncollectedInBase?: boolean;
  };
  riskReserve?: Partial<RiskReservePolicy>;
  softwareParticipation?: Partial<SoftwareParticipationPolicy>;
  stacking?: Partial<StackingPolicy>;
  salesPool?: Partial<SalesPoolPolicy>;
  postTermination?: Partial<PostTerminationPolicy>;
  eventStipend?: Partial<EventStipendPolicy>;
}

/**
 * Merge defaults with plan overrides, returning the fully-resolved policy
 * that the calculator will actually use. Snapshot this onto every
 * calculation line for audit reproducibility.
 */
export function resolveCompensationPolicy(
  overrides?: CompensationPolicyOverrides,
): CompensationPolicyDefaults & { __resolvedAt: string } {
  const d = COMPENSATION_POLICY_DEFAULTS;
  const o = overrides ?? {};
  return {
    attribution: { ...d.attribution, ...o.attribution },
    revenueRecognition: { ...d.revenueRecognition, ...o.revenueRecognition },
    riskReserve: { ...d.riskReserve, ...o.riskReserve },
    softwareParticipation: { ...d.softwareParticipation, ...o.softwareParticipation },
    stacking: { ...d.stacking, ...o.stacking },
    salesPool: { ...d.salesPool, ...o.salesPool },
    postTermination: { ...d.postTermination, ...o.postTermination },
    eventStipend: { ...d.eventStipend, ...o.eventStipend },
    requirePassThroughExclusion: d.requirePassThroughExclusion,
    requireCollectedRevenue: d.requireCollectedRevenue,
    __resolvedAt: new Date().toISOString(),
  };
}

/**
 * Families that MUST NEVER share a calculation basis — used by the
 * "prevent double-dip on same basis" guard when stacking.
 */
export const MUTUALLY_EXCLUSIVE_BASIS_GROUPS: ReadonlyArray<ReadonlyArray<CompensationPlanFamily>> = [
  ["sales_commission", "house_account"],
  ["draw_recoverable", "draw_nonrecoverable"],
];
