/**
 * Compensation Intelligence service surface (6B-1 scaffold).
 *
 * This barrel exports the policy defaults, resolver, and shared types.
 * Sub-services (plans, participants, attribution, calculations, approvals,
 * payables, statements, clawbacks, disputes, software, milestones, retainers,
 * event-stipends, equity, investor-review, simulator, audit) are landed in
 * 6B-2 → 6B-6 per the addendum §13 implementation order.
 *
 * Legacy `commissions.ts` continues to serve the existing UI unchanged;
 * it will be re-exported through this barrel once the sub-services exist.
 */

export * from "./policy-defaults";
export * from "./types";
