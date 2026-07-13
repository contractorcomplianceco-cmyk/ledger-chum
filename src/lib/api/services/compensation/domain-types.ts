/**
 * 6B-2 domain types: Compensation Plans, Participants, Attribution.
 *
 * All types are UI/API contracts only. The mock service exposes typed
 * envelopes matching what the real backend will provide.
 */

import type { ID, ISODate, ISODateTime, Money } from "../../types";
import type {
  CompensationPlanFamily,
  DisbursementClass,
  CompensationLifecycleState,
  ReviewStatus,
} from "./types";
import type { CompensationPolicyOverrides, CompensationPolicyDefaults } from "./policy-defaults";

// ─── Plans ────────────────────────────────────────────────────────────────

export type CompensationPlanStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "future_effective"
  | "expiring_soon"
  | "inactive"
  | "requires_legal_review"
  | "requires_accounting_review";

export type CompensationCalculationBasis =
  | "collected_realized_service_revenue"
  | "collected_retained_revenue"
  | "collected_and_cleared_nrsr"
  | "gross_profit"
  | "contribution_profit"
  | "fixed_amount"
  | "milestone_amount"
  | "tiered_amount"
  | "team_pool"
  | "revenue_share"
  | "profit_share"
  | "renewal_amount"
  | "expansion_amount"
  | "subscription_amount"
  | "discretionary_amount";

export interface CompensationPlan {
  id: ID;
  name: string;
  description: string;
  family: CompensationPlanFamily;
  disbursementClass: DisbursementClass;
  basis: CompensationCalculationBasis;
  defaultRate?: number;
  fixedAmount?: Money;
  formulaText: string;
  effectiveDate: ISODate;
  expirationDate?: ISODate;
  participantCount: number;
  eligibleServices: string[];
  eligibleProducts: string[];
  eligibleApps: string[];
  eligibleDepartments: string[];
  eligibleChannels: string[];
  eligibleEntities: string[];
  eligibleCustomerTypes: string[];
  geographicScope: string[];
  houseAccountRule: "suppress" | "reduce";
  survivalMonths: number | "life_of_account" | "none";
  policyOverrides?: CompensationPolicyOverrides;
  passThroughTreatment: "excluded" | "included_legal_cleared";
  collectionRequirement: "collected_and_cleared" | "billed" | "custom";
  chargebackWindowDays: number;
  holdbackPercent: number;
  approvalRoute: string[];
  glExpenseAccount: string;
  glPayableAccount: string;
  glReserveAccount: string;
  glClawbackAccount: string;
  entityAssignment: string;
  status: CompensationPlanStatus;
  currentVersion: number;
  lastUpdatedAt: ISODateTime;
  updatedBy: string;
  owner: string;
  legalReviewRequired: boolean;
  legalReviewStatus: ReviewStatus;
  accountingReviewRequired: boolean;
  accountingReviewStatus: ReviewStatus;
  active: boolean;
  plainLanguageSummary: string;
}

export interface CompensationPlanVersion {
  id: ID;
  planId: ID;
  version: number;
  effectiveDate: ISODate;
  createdBy: string;
  createdAt: ISODateTime;
  changeSummary: string;
  priorVersion?: number;
  approvalStatus: "draft" | "pending" | "approved" | "rejected" | "retired";
  activeFrom?: ISODate;
  activeTo?: ISODate;
  impactedCalculations: number;
  resolvedPolicySnapshot: CompensationPolicyDefaults & { __resolvedAt: string };
  planSnapshot: CompensationPlan;
}

// ─── Participants ─────────────────────────────────────────────────────────

export type CompensationParticipantType =
  | "employee"
  | "brand_ambassador"
  | "salesperson"
  | "referral_partner"
  | "affiliate"
  | "strategic_partner"
  | "channel_partner"
  | "consultant"
  | "contractor"
  | "investor"
  | "team_pool"
  | "external_entity"
  | "owner"
  | "profit_share_participant";

export interface CompensationParticipant {
  id: ID;
  name: string;
  type: CompensationParticipantType;
  relatedUserId?: ID;
  relatedContactId?: ID;
  relatedEntityId?: ID;
  department?: string;
  defaultRole: string;
  activePlans: number;
  attributionCount: number;
  payableBalance: Money;
  holdbackBalance: Money;
  clawbackExposure: Money;
  paymentMethod: "ach" | "check" | "payroll" | "ap" | "wire" | "external";
  taxDocumentStatus: "on_file" | "requested" | "expired" | "not_applicable";
  legalReviewStatus: ReviewStatus;
  active: boolean;
  restrictions: string[];
  survivalRights?: string;
  totalProjected: Money;
  totalEarned: Money;
  totalApproved: Money;
  totalReserved: Money;
  totalPayable: Money;
  totalPaid: Money;
  totalHeld: Money;
  totalClawback: Money;
}

export interface CompensationPlanParticipant {
  id: ID;
  planId: ID;
  participantId: ID;
  participantName: string;
  role: string;
  effectiveFrom: ISODate;
  effectiveTo?: ISODate;
  overridePercent?: number;
  overrideFixed?: Money;
  active: boolean;
}

// ─── Attribution ──────────────────────────────────────────────────────────

export type AttributionRole =
  | "lead_source"
  | "relationship_creator"
  | "brand_ambassador"
  | "referral_source"
  | "strategic_partner"
  | "sales_representative"
  | "discovery_owner"
  | "demo_owner"
  | "proposal_owner"
  | "negotiation_owner"
  | "closer"
  | "account_manager"
  | "expansion_owner"
  | "renewal_owner"
  | "support_contributor"
  | "leadership_override"
  | "team_pool"
  | "affiliate"
  | "channel_partner";

export type AttributionEligibilityState =
  | "eligible"
  | "likely_eligible"
  | "needs_evidence"
  | "preexisting_pipeline_conflict"
  | "material_development_not_proven"
  | "strategic_channel_eligible"
  | "software_participation_eligible"
  | "post_termination_survival_review"
  | "not_eligible";

export interface CompensationContribution {
  id: ID;
  participantId: ID;
  participantName: string;
  role: AttributionRole;
  poolId: ID;
  poolName: string;
  splitPercent?: number;
  fixedAmount?: Money;
  eligibility: AttributionEligibilityState;
  evidenceCount: number;
  approvalStatus: "draft" | "verified" | "approved" | "rejected" | "under_review";
  effectiveDate: ISODate;
  conflictId?: ID;
}

export interface CompensationAttribution {
  id: ID;
  opportunityId: ID;
  opportunityName: string;
  customerId?: ID;
  customerName?: string;
  sourceSystem: "crm" | "invoice" | "payment" | "subscription" | "event" | "manual";
  relatedDealId?: ID;
  relatedInvoiceId?: ID;
  relatedPaymentId?: ID;
  contributions: CompensationContribution[];
  totalPools: Array<{ poolId: ID; poolName: string; totalPercent: number; valid: boolean }>;
  overallStatus: "draft" | "verified" | "approved" | "rejected" | "under_review" | "conflict";
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  createdBy: string;
}

export type EvidenceType =
  | "crm_record"
  | "email"
  | "text_message"
  | "calendar_event"
  | "event_lead_capture"
  | "meeting_note"
  | "call_note"
  | "partner_agreement"
  | "signed_contract"
  | "subscription_record"
  | "leadership_confirmation"
  | "manual_affidavit"
  | "imported_source_record";

export interface AttributionEvidence {
  id: ID;
  attributionId: ID;
  contributionId?: ID;
  type: EvidenceType;
  date: ISODate;
  source: string;
  uploadedBy: string;
  opportunityId?: ID;
  participantId?: ID;
  relevance: "primary" | "supporting" | "circumstantial";
  confidence: number;
  verified: boolean;
  notes?: string;
  createdAt: ISODateTime;
}

export type ConflictType =
  | "duplicate_lead_source"
  | "tara_preexisting_pipeline"
  | "sales_vs_house_account"
  | "duplicate_referral_source"
  | "plan_overlap"
  | "split_not_100"
  | "duplicate_participant"
  | "evidence_conflict"
  | "effective_date_conflict"
  | "post_termination_dispute"
  | "relationship_not_eligible"
  | "missing_source_documentation";

export type ConflictStatus =
  | "open"
  | "under_review"
  | "needs_evidence"
  | "accounting_review"
  | "leadership_review"
  | "legal_review"
  | "resolved"
  | "rejected"
  | "closed";

export interface AttributionConflict {
  id: ID;
  attributionId: ID;
  opportunityName: string;
  type: ConflictType;
  participants: string[];
  competingClaims: string;
  evidenceCount: number;
  financialImpact: Money;
  affectedPlans: string[];
  suggestedResolution: string;
  requiredApprover: string;
  status: ConflictStatus;
  timeline: Array<{ at: ISODateTime; actor: string; action: string }>;
}

// ─── Eligibility engine ───────────────────────────────────────────────────

export type EligibilityResultState =
  | "eligible"
  | "conditionally_eligible"
  | "ineligible"
  | "needs_evidence"
  | "needs_approval"
  | "needs_legal_review"
  | "needs_accounting_review"
  | "payment_not_cleared"
  | "plan_not_effective"
  | "house_account_restricted"
  | "post_termination_review";

export interface EligibilityCheck {
  participantId: ID;
  opportunityId: ID;
  planId: ID;
}

export interface EligibilityResult {
  input: EligibilityCheck;
  checks: Array<{ label: string; status: "pass" | "fail" | "warn" | "n/a"; detail: string }>;
  result: EligibilityResultState;
  explanation: string;
  requiredReviews: Array<"legal" | "accounting" | "owner">;
}

// ─── Plan simulation preview ──────────────────────────────────────────────

export interface PlanPreviewRequest {
  scenarioKey?: string;
  planId?: ID;
  grossPayment: Money;
  passThroughAmount: Money;
  contributors: Array<{ name: string; role: AttributionRole; splitPercent: number }>;
}

export interface PlanPreviewResponse {
  scenarioKey: string;
  scenarioLabel: string;
  grossPayment: Money;
  excludedPassThrough: Money;
  realizedRevenue: Money;
  applicablePlans: string[];
  pools: Array<{ poolName: string; poolAmount: Money }>;
  participants: Array<{
    name: string;
    role: AttributionRole;
    poolName: string;
    splitPercent: number;
    amount: Money;
  }>;
  totalCompensation: Money;
  marginImpact: number;
  cashImpact: Money;
  requiredApprovals: string[];
  legalReviewRequired: boolean;
  accountingReviewRequired: boolean;
  invariantChecks: Array<{ label: string; passed: boolean; note?: string }>;
  resolvedPolicySnapshot: CompensationPolicyDefaults & { __resolvedAt: string };
  narrative: string;
}

// ─── Re-exports ───────────────────────────────────────────────────────────

export type {
  CompensationPlanFamily,
  DisbursementClass,
  CompensationLifecycleState,
  ReviewStatus,
  CompensationPolicyOverrides,
};
