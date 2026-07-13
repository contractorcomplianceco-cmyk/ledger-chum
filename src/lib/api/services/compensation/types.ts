/**
 * Compensation Intelligence — shared enums and identifiers.
 *
 * These types keep the seven disbursement classes distinct end-to-end:
 * commission, bonus, retainer, milestone, software participation,
 * profit share, and equity/investor comp each have their own family
 * discriminator and lifecycle. The calculator, ledger poster, and 1099/W-2
 * classifier all key off `CompensationPlanFamily`.
 */

export type CompensationPlanFamily =
  // Sales / relationship / channel
  | "sales_commission"
  | "brand_ambassador_participation"
  | "relationship_commission"
  | "referral"
  | "affiliate"
  | "strategic_partner_share"
  | "channel_partner_share"
  | "house_account"
  | "territory"
  | "regional_override"
  | "manager_override"
  // Recurring / software
  | "software_participation"
  | "recurring"
  | "residual"
  | "renewal"
  | "expansion"
  | "cross_sell"
  | "upsell"
  // Bonuses
  | "milestone_bonus"
  | "performance_bonus"
  | "leadership_bonus"
  | "team_bonus"
  | "spot_bonus"
  | "spiff"
  | "contest"
  | "customer_success_bonus"
  | "collected_revenue_bonus"
  | "gross_profit_bonus"
  | "contribution_profit_bonus"
  // Retainer / stipend
  | "retainer"
  | "event_stipend"
  | "advisory_fee"
  // Draws
  | "draw_recoverable"
  | "draw_nonrecoverable"
  // Shape modifiers
  | "tiered"
  | "accelerator"
  | "decelerator"
  | "split"
  | "support_pool"
  // Profit / equity / investor
  | "profit_sharing"
  | "phantom_equity"
  | "equity_milestone"
  | "investor_milestone_bonus"
  // Event source
  | "event_lead"
  | "franchise"
  | "enterprise";

/**
 * The 14 canonical disbursement classes from phase-6 §13. Every
 * compensation record must resolve to exactly one class for legal/tax
 * treatment. This is separate from `CompensationPlanFamily` (which is a
 * plan-shape discriminator) — many families map to the same class.
 */
export type DisbursementClass =
  | "owner_draw"
  | "owner_distribution"
  | "owner_reimbursement"
  | "employee_reimbursement"
  | "bonus"
  | "commission"
  | "profit_share"
  | "investor_distribution"
  | "affiliate_fee"
  | "strategic_partner_payment"
  | "contractor_payment"
  | "charitable_contribution"
  | "marketing_sponsorship"
  | "pass_through_disbursement";

/** Family → default disbursement class. Plans may override with legal review. */
export const DEFAULT_FAMILY_DISBURSEMENT_CLASS: Record<CompensationPlanFamily, DisbursementClass> = {
  sales_commission: "commission",
  brand_ambassador_participation: "commission",
  relationship_commission: "commission",
  referral: "commission",
  affiliate: "affiliate_fee",
  strategic_partner_share: "strategic_partner_payment",
  channel_partner_share: "strategic_partner_payment",
  house_account: "commission",
  territory: "commission",
  regional_override: "commission",
  manager_override: "commission",
  software_participation: "commission",
  recurring: "commission",
  residual: "commission",
  renewal: "commission",
  expansion: "commission",
  cross_sell: "commission",
  upsell: "commission",
  milestone_bonus: "bonus",
  performance_bonus: "bonus",
  leadership_bonus: "bonus",
  team_bonus: "bonus",
  spot_bonus: "bonus",
  spiff: "bonus",
  contest: "bonus",
  customer_success_bonus: "bonus",
  collected_revenue_bonus: "bonus",
  gross_profit_bonus: "bonus",
  contribution_profit_bonus: "bonus",
  retainer: "contractor_payment",
  event_stipend: "employee_reimbursement",
  advisory_fee: "contractor_payment",
  draw_recoverable: "commission",
  draw_nonrecoverable: "bonus",
  tiered: "commission",
  accelerator: "commission",
  decelerator: "commission",
  split: "commission",
  support_pool: "bonus",
  profit_sharing: "profit_share",
  phantom_equity: "bonus",
  equity_milestone: "investor_distribution",
  investor_milestone_bonus: "investor_distribution",
  event_lead: "commission",
  franchise: "commission",
  enterprise: "commission",
};

export type CompensationLifecycleState =
  | "projected"
  | "pending_collection"
  | "calculated"
  | "pending_verification"
  | "pending_approval"
  | "approved"
  | "reserved"
  | "payable"
  | "scheduled"
  | "paid"
  | "held"
  | "reversed"
  | "clawback_required"
  | "closed";

/** Review gates required before certain lifecycle transitions. */
export type ReviewStatus = "not_required" | "pending" | "cleared" | "rejected";
