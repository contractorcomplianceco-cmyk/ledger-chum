/**
 * 6B-3 Compensation Operations types.
 * UI/API contracts only. All mutations return DemoResult.
 */

import type { ID, ISODate, ISODateTime, Money } from "../../types";
import type { CompensationCalculationBasis } from "./domain-types";
import type { CompensationPolicyDefaults } from "./policy-defaults";
import type { DisbursementClass, ReviewStatus } from "./types";

export type CompensationCalculationStatus =
  | "draft"
  | "projected"
  | "pending_collection"
  | "pending_clearance"
  | "eligible"
  | "calculated"
  | "pending_verification"
  | "pending_manager_review"
  | "pending_accounting_review"
  | "pending_approval"
  | "approved"
  | "reserved"
  | "payable"
  | "scheduled"
  | "paid"
  | "held"
  | "adjusted"
  | "reversed"
  | "clawback_required"
  | "disputed"
  | "closed";

export interface CalculationSourceRecord {
  type:
    | "invoice"
    | "payment"
    | "subscription"
    | "event"
    | "milestone"
    | "renewal"
    | "expansion"
    | "manual";
  id: ID;
  label: string;
  amount: Money;
  date: ISODate;
  collectionStatus: "uncollected" | "partially_collected" | "collected" | "cleared" | "reversed";
  clearanceDate?: ISODate;
  passThroughAmount: Money;
  refunds: Money;
  credits: Money;
  chargebacks: Money;
  noncommissionable: Money;
  notes?: string;
}

export interface CalculationPolicySnapshot {
  planId: ID;
  planVersion: number;
  resolvedPolicy: CompensationPolicyDefaults & { __resolvedAt: string };
  invariants: {
    passThroughExcluded: boolean;
    collectedRevenueRequired: boolean;
    stackingEnforced: boolean;
    noDoubleDip: boolean;
  };
}

export interface CompensationCalculationLine {
  id: ID;
  participantId: ID;
  participantName: string;
  compensationClass: DisbursementClass;
  planId: ID;
  planName: string;
  planVersion: number;
  poolId: ID;
  poolName: string;
  basis: CompensationCalculationBasis;
  baseAmount: Money;
  rate?: number;
  formulaText: string;
  grossAmount: Money;
  exclusions: Money;
  holdback: Money;
  adjustment: Money;
  netPayable: Money;
  status: CompensationCalculationStatus;
  payDestination: string;
  glExpenseAccount: string;
  glPayableAccount: string;
  explanation: string;
  reviewFlags: string[];
}

export interface CompensationCalculation {
  id: ID;
  version: number;
  participantId: ID;
  participantName: string;
  opportunityId?: ID;
  opportunityName?: string;
  customerId?: ID;
  customerName?: string;
  planId: ID;
  planName: string;
  planVersion: number;
  compensationClasses: DisbursementClass[];
  source: CalculationSourceRecord;
  grossPayment: Money;
  passThroughExcluded: Money;
  realizedRevenue: Money;
  totalGross: Money;
  totalHoldback: Money;
  totalAdjustment: Money;
  totalNetPayable: Money;
  lines: CompensationCalculationLine[];
  marginImpact: number;
  cashImpact: Money;
  status: CompensationCalculationStatus;
  requiredReviewer?: string;
  approvalRoute: string[];
  policySnapshot: CalculationPolicySnapshot;
  riskFlags: string[];
  legalReviewRequired: boolean;
  legalReviewStatus: ReviewStatus;
  accountingReviewRequired: boolean;
  accountingReviewStatus: ReviewStatus;
  createdAt: ISODateTime;
  createdBy: string;
  updatedAt: ISODateTime;
  expectedPayableDate?: ISODate;
  explanation: string;
  auditTimeline: Array<{ at: ISODateTime; actor: string; action: string; note?: string }>;
  sourceIdempotencyKey: string;
}

export interface CompensationCalculationVersion {
  id: ID;
  calculationId: ID;
  version: number;
  createdAt: ISODateTime;
  createdBy: string;
  changeSummary: string;
  snapshot: CompensationCalculation;
}

export interface CompensationVerification {
  id: ID;
  calculationId: ID;
  category:
    | "attribution"
    | "collection_clearance"
    | "pass_through"
    | "plan_eligibility"
    | "plan_effective_date"
    | "participant_eligibility"
    | "split_validation"
    | "margin_guardrail"
    | "refund_chargeback"
    | "post_termination"
    | "software_participation"
    | "milestone_completion"
    | "legal_review"
    | "accounting_review";
  status: "pending" | "verified" | "evidence_requested" | "conflict" | "rejected";
  reviewer?: string;
  reviewedAt?: ISODateTime;
  note?: string;
  evidenceCount: number;
}

export interface CompensationApproval {
  id: ID;
  calculationId: ID;
  participantName: string;
  amount: Money;
  planName: string;
  compensationClass: DisbursementClass;
  marginImpact: number;
  cashImpact: Money;
  reserveImpact: Money;
  requiredApproval:
    | "manager"
    | "accounting"
    | "owner"
    | "legal"
    | "high_value"
    | "margin_override"
    | "policy_override"
    | "manual_adjustment"
    | "clawback";
  deadline?: ISODate;
  recommendation: string;
  status:
    | "awaiting"
    | "approved"
    | "approved_with_conditions"
    | "changes_requested"
    | "held"
    | "rejected"
    | "escalated";
  approver?: string;
  approvedAt?: ISODateTime;
  note?: string;
  riskFlags: string[];
}

export interface CompensationReserve {
  id: ID;
  participantId: ID;
  participantName: string;
  planId: ID;
  planName: string;
  compensationClass: DisbursementClass;
  approvedNotPayable: Money;
  reserved: Money;
  holdbacks: Money;
  drawOffset: Money;
  disputed: Money;
  chargebackExposure: Money;
  payableWithin7Days: Money;
  payableWithin30Days: Money;
  expectedPayableDate?: ISODate;
  destination:
    "payroll" | "ap" | "check" | "ach" | "wire" | "partner" | "owner_distribution" | "manual";
}

export type PayableStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "ready_for_payroll"
  | "ready_for_ap"
  | "scheduled"
  | "paid"
  | "failed"
  | "returned"
  | "cancelled"
  | "reversed";

export type PaymentDestination =
  | "adp_payroll"
  | "accounts_payable"
  | "check"
  | "ach"
  | "wire"
  | "partner_payment"
  | "owner_distribution"
  | "manual_external";

export interface CompensationPayable {
  id: ID;
  participantId: ID;
  participantName: string;
  participantType: string;
  compensationClasses: DisbursementClass[];
  periodStart: ISODate;
  periodEnd: ISODate;
  grossAmount: Money;
  adjustments: Money;
  holdbacks: Money;
  drawOffset: Money;
  clawbackOffset: Money;
  netPayable: Money;
  destination: PaymentDestination;
  scheduledDate?: ISODate;
  status: PayableStatus;
  approver?: string;
  approvedAt?: ISODateTime;
  batchId?: ID;
  calculationIds: ID[];
  glExpenseAccount: string;
  glPayableAccount: string;
  notes?: string;
  auditTimeline: Array<{ at: ISODateTime; actor: string; action: string }>;
}

export type PaymentBatchStatus =
  | "draft"
  | "reviewed"
  | "approved"
  | "export_ready"
  | "sent_to_external"
  | "reconciliation_pending"
  | "reconciled"
  | "closed";

export interface CompensationPaymentBatch {
  id: ID;
  destination: PaymentDestination;
  periodStart: ISODate;
  periodEnd: ISODate;
  participantCount: number;
  grossAmount: Money;
  adjustments: Money;
  netAmount: Money;
  status: PaymentBatchStatus;
  preparedBy: string;
  preparedAt: ISODateTime;
  approvedBy?: string;
  approvedAt?: ISODateTime;
  scheduledDate?: ISODate;
  externalReference?: string;
  reconciliationState: "pending" | "in_progress" | "reconciled" | "exception";
  payableIds: ID[];
  auditTimeline: Array<{ at: ISODateTime; actor: string; action: string }>;
}

export interface CompensationStatementLine {
  id: ID;
  compensationClass: DisbursementClass;
  planName: string;
  planVersion: number;
  clientName?: string;
  opportunityName?: string;
  invoiceId?: ID;
  paymentId?: ID;
  amount: Money;
  status: CompensationCalculationStatus;
  effectiveDate: ISODate;
  explanation: string;
  paymentDate?: ISODate;
  paymentMethod?: string;
  disputeId?: ID;
}

export interface CompensationStatement {
  id: ID;
  participantId: ID;
  participantName: string;
  participantType: string;
  periodType: "monthly" | "quarterly" | "annual" | "custom";
  periodStart: ISODate;
  periodEnd: ISODate;
  statementKind:
    | "sales_commission"
    | "brand_ambassador"
    | "software_participation"
    | "strategic_partner"
    | "affiliate"
    | "bonus"
    | "retainer"
    | "event_stipend"
    | "combined";
  beginningBalance: Money;
  projected: Money;
  earned: Money;
  verified: Money;
  approved: Money;
  reserved: Money;
  payable: Money;
  paid: Money;
  holdbacks: Money;
  adjustments: Money;
  clawbacks: Money;
  endingBalance: Money;
  sections: Array<{
    kind: CompensationStatement["statementKind"];
    label: string;
    total: Money;
    lines: CompensationStatementLine[];
  }>;
  generatedAt: ISODateTime;
  notes?: string;
}

export interface CompensationHoldback {
  id: ID;
  participantId: ID;
  participantName: string;
  calculationId: ID;
  planId: ID;
  planName: string;
  originalCompensation: Money;
  holdbackPercent: number;
  holdbackAmount: Money;
  holdStart: ISODate;
  chargebackWindowEnd: ISODate;
  riskStatus: "low" | "medium" | "high";
  riskTriggers: string[];
  releaseMethod:
    | "automatic"
    | "rose_approval"
    | "manual"
    | "partial"
    | "extended"
    | "converted_to_clawback"
    | "reversed";
  requiredApproval?: string;
  releaseDate?: ISODate;
  releasedAmount: Money;
  remainingAmount: Money;
  status:
    | "held"
    | "eligible_for_release"
    | "partial_released"
    | "released"
    | "extended"
    | "converted"
    | "reversed";
  auditTimeline: Array<{ at: ISODateTime; actor: string; action: string }>;
}

export interface HoldbackRelease {
  id: ID;
  holdbackId: ID;
  releasedAt: ISODateTime;
  releasedBy: string;
  amount: Money;
  method: CompensationHoldback["releaseMethod"];
  note?: string;
}

export type AdjustmentType =
  | "positive"
  | "negative"
  | "correction"
  | "missed_commission"
  | "rate_correction"
  | "attribution_correction"
  | "refund"
  | "credit"
  | "chargeback"
  | "payment_correction"
  | "draw_offset"
  | "holdback_correction"
  | "manual_award"
  | "manual_reduction";

export interface CompensationAdjustment {
  id: ID;
  originalCalculationId: ID;
  participantId: ID;
  participantName: string;
  type: AdjustmentType;
  amount: Money;
  reason: string;
  supportingRecord?: string;
  requestedBy: string;
  requestedAt: ISODateTime;
  requiredApprover: string;
  effectivePeriod: ISODate;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "posted";
  accountingPreview: string;
  auditTimeline: Array<{ at: ISODateTime; actor: string; action: string }>;
}

export interface CompensationReversal {
  id: ID;
  originalCalculationId: ID;
  affectedLineIds: ID[];
  reversalScope: "full" | "partial";
  reason: string;
  effectivePeriod: ISODate;
  accountingImpact: string;
  participantImpact: string;
  statementImpact: string;
  requestedBy: string;
  requestedAt: ISODateTime;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "posted";
  approver?: string;
  amount: Money;
}

export type ClawbackTrigger =
  | "full_refund"
  | "partial_refund"
  | "chargeback"
  | "payment_reversal"
  | "client_cancellation"
  | "subscription_cancellation"
  | "incorrect_attribution"
  | "fraud_misconduct"
  | "duplicate_payment"
  | "plan_error"
  | "post_payment_pricing_adjustment";

export type ClawbackRecoveryMethod =
  | "offset_future_approved"
  | "offset_future_payable"
  | "payroll_deduction"
  | "ap_offset"
  | "direct_repayment"
  | "writeoff"
  | "legal_collection";

export interface ClawbackRecovery {
  id: ID;
  clawbackId: ID;
  amount: Money;
  method: ClawbackRecoveryMethod;
  recordedAt: ISODateTime;
  recordedBy: string;
  note?: string;
}

export interface CompensationClawback {
  id: ID;
  originalCalculationId: ID;
  originalPaymentId?: ID;
  participantId: ID;
  participantName: string;
  trigger: ClawbackTrigger;
  grossClawback: Money;
  amountRecovered: Money;
  remainingAmount: Money;
  recoveryMethod?: ClawbackRecoveryMethod;
  approvalStatus: "draft" | "pending_approval" | "approved" | "rejected" | "in_recovery" | "closed";
  disputeState: "none" | "disputed" | "resolved";
  accountingImpact: string;
  payrollApImpact: string;
  recoveries: ClawbackRecovery[];
  createdAt: ISODateTime;
  createdBy: string;
  auditTimeline: Array<{ at: ISODateTime; actor: string; action: string }>;
}

export type DisputeType =
  | "attribution"
  | "eligibility"
  | "rate"
  | "plan_interpretation"
  | "split"
  | "missing_payment"
  | "underpayment"
  | "overpayment"
  | "clawback"
  | "post_termination_survival"
  | "software_participation"
  | "milestone_completion"
  | "house_account_classification"
  | "preexisting_pipeline"
  | "payment_clearing_status"
  | "margin_override";

export type DisputeStatus =
  | "submitted"
  | "under_review"
  | "needs_evidence"
  | "accounting_review"
  | "leadership_review"
  | "legal_review"
  | "resolved"
  | "partially_resolved"
  | "rejected"
  | "closed";

export interface CompensationDispute {
  id: ID;
  participantId: ID;
  participantName: string;
  calculationId?: ID;
  amountInDispute: Money;
  type: DisputeType;
  filedDate: ISODate;
  filedBy: string;
  assignedReviewer?: string;
  status: DisputeStatus;
  slaDueDate?: ISODate;
  proposedResolution?: string;
  finalDecision?: string;
  approver?: string;
  approvedAt?: ISODateTime;
  evidenceIds: ID[];
  auditTimeline: Array<{ at: ISODateTime; actor: string; action: string; note?: string }>;
}

export type ReconciliationExceptionType =
  | "approved_not_reserved"
  | "payable_not_scheduled"
  | "external_payment_without_payable"
  | "ledger_entry_missing"
  | "statement_mismatch"
  | "payroll_amount_mismatch"
  | "ap_amount_mismatch"
  | "duplicate_payment"
  | "returned_payment"
  | "check_outstanding"
  | "clawback_not_reflected"
  | "holdback_released_incorrectly";

export interface CompensationReconciliationException {
  id: ID;
  type: ReconciliationExceptionType;
  participantName: string;
  amount: Money;
  detectedAt: ISODateTime;
  description: string;
  suggestedResolution: string;
  status: "open" | "in_progress" | "resolved" | "waived";
  assignedTo?: string;
  resolvedAt?: ISODateTime;
  resolvedBy?: string;
  notes?: string;
}

export interface CompensationReconciliation {
  periodStart: ISODate;
  periodEnd: ISODate;
  calculated: Money;
  approved: Money;
  reserved: Money;
  payable: Money;
  exported: Money;
  paidExternally: Money;
  clearedInBank: Money;
  recordedInLedger: Money;
  reflectedOnStatement: Money;
  exceptions: CompensationReconciliationException[];
}

export interface AccountingImpactPreview {
  calculationId?: ID;
  action:
    | "reserve"
    | "payable"
    | "payment"
    | "holdback"
    | "holdback_release"
    | "adjustment"
    | "reversal"
    | "clawback"
    | "clawback_recovery"
    | "writeoff";
  entries: Array<{ account: string; debit?: Money; credit?: Money; memo?: string }>;
  narrative: string;
  requiresBackendValidation: true;
  requiresAccountantApproval: true;
}
