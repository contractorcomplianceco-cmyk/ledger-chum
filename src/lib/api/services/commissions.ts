import { mockGet, mockMutation } from "../adapters/mock-adapter";
import {
  DEMO_MUTATION_MESSAGE,
  type DemoResult,
  type ID,
  type ISODate,
  type Money,
  type Paginated,
} from "../types";

// ─── Domain types ─────────────────────────────────────────────────────────

export type CommissionPlanType =
  | "percent_collected_revenue"
  | "percent_gross_profit"
  | "percent_contribution_profit"
  | "fixed_amount"
  | "tiered_percent"
  | "milestone"
  | "recurring_revenue"
  | "team_pool"
  | "split"
  | "referral"
  | "strategic_partner"
  | "expansion"
  | "renewal"
  | "discretionary";

export type CommissionLifecycleState =
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

export interface CommissionPlan {
  id: ID;
  name: string;
  description: string;
  type: CommissionPlanType;
  rate?: number;
  fixedAmount?: Money;
  tiers?: Array<{ threshold: Money; rate: number }>;
  minimumThreshold?: Money;
  maximumPayout?: Money;
  effectiveDate: ISODate;
  expirationDate?: ISODate;
  eligibleParticipants: string[];
  eligibleServices: string[];
  eligibleDepartments: string[];
  collectionRequired: boolean;
  paymentClearingDelayDays: number;
  passThroughExcluded: boolean;
  refundBehavior: "adjust" | "hold" | "ignore";
  chargebackBehavior: "adjust" | "clawback" | "ignore";
  holdbackPercent: number;
  chargebackWindowDays: number;
  approvalRoute: string[];
  commissionExpenseAccount: string;
  commissionPayableAccount: string;
  active: boolean;
  calculationPreview: string;
}

export interface CommissionCalculation {
  id: ID;
  planId: ID;
  planName: string;
  customerId: ID;
  customerName: string;
  invoiceId?: ID;
  paymentId?: ID;
  serviceName: string;
  grossPayment: Money;
  passThroughExcluded: Money;
  adjustments: Money;
  commissionableBase: Money;
  appliedRate: number;
  totalPool: Money;
  splits: Array<{ participant: string; role: string; percent: number; amount: Money }>;
  holdback: Money;
  netPayable: Money;
  expectedPayableDate: ISODate;
  state: CommissionLifecycleState;
  calculatedAt: ISODate;
  explanation: string;
}

export interface CommissionAttribution {
  id: ID;
  sourceId: ID;
  sourceType: "deal" | "invoice" | "payment" | "subscription";
  contributor: string;
  role:
    | "lead_source"
    | "relationship_owner"
    | "closer"
    | "account_manager"
    | "referral_partner"
    | "strategic_partner"
    | "expansion_owner"
    | "support"
    | "team_pool";
  splitPercent?: number;
  fixedAllocation?: Money;
  approved: boolean;
  conflict?: string;
}

export interface CommissionApproval {
  id: ID;
  calculationId: ID;
  participant: string;
  amount: Money;
  submittedBy: string;
  submittedAt: string;
  requiredApprover: string;
  reason: string;
  state: "pending" | "approved" | "rejected";
}

export interface CommissionPayable {
  id: ID;
  participant: string;
  amount: Money;
  scheduledFor: ISODate;
  planName: string;
  calculationIds: ID[];
  state: "scheduled" | "paid" | "held";
}

export interface CommissionStatement {
  id: ID;
  participant: string;
  period: string;
  earned: Money;
  approved: Money;
  payable: Money;
  paid: Money;
  clawback: Money;
  lineItems: Array<{ label: string; amount: Money; state: CommissionLifecycleState }>;
}

export interface CommissionClawback {
  id: ID;
  calculationId: ID;
  participant: string;
  reason: "refund" | "chargeback" | "manual_adjustment";
  amount: Money;
  detectedAt: string;
  state: "pending" | "recovered" | "waived";
}

export interface CommissionDashboardSummary {
  projected: Money;
  pendingCollection: Money;
  calculated: Money;
  awaitingVerification: Money;
  awaitingApproval: Money;
  reserved: Money;
  payable: Money;
  scheduled: Money;
  paid: Money;
  held: Money;
  clawbackExposure: Money;
  byParticipant: Array<{ name: string; amount: Money }>;
  byPlan: Array<{ plan: string; amount: Money }>;
  byService: Array<{ service: string; amount: Money }>;
  upcoming: Array<{ date: ISODate; amount: Money }>;
  exceptions: number;
  attributionConflicts: number;
}

// ─── Service interface ────────────────────────────────────────────────────

export interface CommissionsService {
  getDashboard(): Promise<CommissionDashboardSummary>;
  listPlans(): Promise<Paginated<CommissionPlan>>;
  getPlan(id: ID): Promise<CommissionPlan>;
  createPlan(input: Omit<CommissionPlan, "id">): Promise<DemoResult<CommissionPlan>>;
  listCalculations(): Promise<Paginated<CommissionCalculation>>;
  getCalculation(id: ID): Promise<CommissionCalculation>;
  calculate(input: {
    customerId: ID;
    paymentId?: ID;
    invoiceId?: ID;
    grossPayment: Money;
    passThroughAmount: Money;
    adjustments?: Money;
    planId: ID;
  }): Promise<DemoResult<CommissionCalculation>>;
  listAttributions(): Promise<CommissionAttribution[]>;
  saveAttribution(
    input: Omit<CommissionAttribution, "id">,
  ): Promise<DemoResult<CommissionAttribution>>;
  listApprovals(): Promise<CommissionApproval[]>;
  approve(id: ID, reason: string): Promise<DemoResult<CommissionApproval>>;
  listPayables(): Promise<CommissionPayable[]>;
  listStatements(): Promise<CommissionStatement[]>;
  listClawbacks(): Promise<CommissionClawback[]>;
  listAudit(): Promise<Array<{ id: ID; type: string; actor: string; at: string; summary: string }>>;
}

// ─── Mock implementation ──────────────────────────────────────────────────

const MOCK_PLANS: CommissionPlan[] = [
  {
    id: "plan_1",
    name: "Standard Sales Plan — 10% Collected",
    description: "Pay 10% of cleared, collected CCA service revenue after pass-through exclusion.",
    type: "percent_collected_revenue",
    rate: 0.1,
    effectiveDate: "2026-01-01",
    eligibleParticipants: ["Jamie R.", "Priya K.", "Devon L."],
    eligibleServices: ["Compliance Onboarding", "Advisory Retainer"],
    eligibleDepartments: ["Sales"],
    collectionRequired: true,
    paymentClearingDelayDays: 3,
    passThroughExcluded: true,
    refundBehavior: "adjust",
    chargebackBehavior: "clawback",
    holdbackPercent: 0.1,
    chargebackWindowDays: 60,
    approvalRoute: ["accounting_lead", "owner"],
    commissionExpenseAccount: "6100 · Commission Expense",
    commissionPayableAccount: "2210 · Commission Payable",
    active: true,
    calculationPreview:
      "Pay 10% of cleared, collected CCA service revenue after excluding pass-through fees, refunds, credits, and noncommissionable items.",
  },
  {
    id: "plan_2",
    name: "Referral Partner — 5% First Year",
    description: "External referral partners on year-one collected revenue only.",
    type: "referral",
    rate: 0.05,
    effectiveDate: "2026-01-01",
    eligibleParticipants: ["Partner: NorthStar", "Partner: Reliant"],
    eligibleServices: ["Compliance Onboarding"],
    eligibleDepartments: ["Sales", "Partnerships"],
    collectionRequired: true,
    paymentClearingDelayDays: 3,
    passThroughExcluded: true,
    refundBehavior: "adjust",
    chargebackBehavior: "clawback",
    holdbackPercent: 0.15,
    chargebackWindowDays: 90,
    approvalRoute: ["accounting_lead", "owner"],
    commissionExpenseAccount: "6110 · Referral Commission",
    commissionPayableAccount: "2211 · Referral Payable",
    active: true,
    calculationPreview:
      "5% of year-one collected revenue, less pass-through, refunds, and adjustments.",
  },
  {
    id: "plan_3",
    name: "Renewal Bonus — 3% Tiered",
    description: "Account managers earn 3% escalating to 5% above $50k renewal MRR.",
    type: "tiered_percent",
    tiers: [
      { threshold: 0, rate: 0.03 },
      { threshold: 50_000, rate: 0.05 },
    ],
    effectiveDate: "2026-01-01",
    eligibleParticipants: ["Priya K.", "Devon L."],
    eligibleServices: ["Advisory Retainer"],
    eligibleDepartments: ["Accounts"],
    collectionRequired: true,
    paymentClearingDelayDays: 5,
    passThroughExcluded: true,
    refundBehavior: "adjust",
    chargebackBehavior: "adjust",
    holdbackPercent: 0.05,
    chargebackWindowDays: 45,
    approvalRoute: ["owner"],
    commissionExpenseAccount: "6120 · Renewal Bonus",
    commissionPayableAccount: "2212 · Bonus Payable",
    active: true,
    calculationPreview:
      "3% on collected renewal revenue; 5% on cleared amounts above the $50k threshold.",
  },
];

const MOCK_CALCULATIONS: CommissionCalculation[] = [
  {
    id: "calc_1",
    planId: "plan_1",
    planName: "Standard Sales Plan — 10% Collected",
    customerId: "cust_apex",
    customerName: "Apex Manufacturing",
    invoiceId: "inv_2145",
    paymentId: "pay_9931",
    serviceName: "Compliance Onboarding",
    grossPayment: 5_000,
    passThroughExcluded: 1_700,
    adjustments: 0,
    commissionableBase: 3_300,
    appliedRate: 0.1,
    totalPool: 330,
    splits: [{ participant: "Jamie R.", role: "closer", percent: 100, amount: 330 }],
    holdback: 33,
    netPayable: 297,
    expectedPayableDate: "2026-08-01",
    state: "pending_approval",
    calculatedAt: "2026-07-10T10:15:00Z",
    explanation:
      "Payment $5,000 received. Pass-through $1,700 excluded per plan. Commissionable base $3,300 × 10% = $330. Holdback 10% ($33) reserved. Net payable $297 on 2026-08-01.",
  },
  {
    id: "calc_2",
    planId: "plan_3",
    planName: "Renewal Bonus — 3% Tiered",
    customerId: "cust_bright",
    customerName: "BrightPath Holdings",
    invoiceId: "inv_2098",
    paymentId: "pay_9877",
    serviceName: "Advisory Retainer",
    grossPayment: 12_500,
    passThroughExcluded: 0,
    adjustments: 0,
    commissionableBase: 12_500,
    appliedRate: 0.03,
    totalPool: 375,
    splits: [{ participant: "Priya K.", role: "account_manager", percent: 100, amount: 375 }],
    holdback: 18.75,
    netPayable: 356.25,
    expectedPayableDate: "2026-07-30",
    state: "approved",
    calculatedAt: "2026-07-05T14:20:00Z",
    explanation:
      "Renewal payment $12,500 fully commissionable. Tier 1 rate 3% applied (below $50k threshold). Pool $375, holdback 5% ($18.75). Net payable $356.25.",
  },
];

let MOCK_ATTRIBUTIONS: CommissionAttribution[] = [
  {
    id: "attr_1",
    sourceId: "deal_44",
    sourceType: "deal",
    contributor: "Jamie R.",
    role: "closer",
    splitPercent: 60,
    approved: true,
  },
  {
    id: "attr_2",
    sourceId: "deal_44",
    sourceType: "deal",
    contributor: "Priya K.",
    role: "account_manager",
    splitPercent: 40,
    approved: true,
  },
  {
    id: "attr_3",
    sourceId: "deal_51",
    sourceType: "deal",
    contributor: "Devon L.",
    role: "closer",
    splitPercent: 50,
    approved: false,
    conflict: "Total attribution below 100%",
  },
];

const MOCK_APPROVALS: CommissionApproval[] = [
  {
    id: "app_1",
    calculationId: "calc_1",
    participant: "Jamie R.",
    amount: 297,
    submittedBy: "Christin",
    submittedAt: "2026-07-10T11:00:00Z",
    requiredApprover: "Rose",
    reason: "Standard plan, cleared payment",
    state: "pending",
  },
];

const MOCK_PAYABLES: CommissionPayable[] = [
  {
    id: "pay_1",
    participant: "Priya K.",
    amount: 356.25,
    scheduledFor: "2026-07-30",
    planName: "Renewal Bonus — 3% Tiered",
    calculationIds: ["calc_2"],
    state: "scheduled",
  },
];

const MOCK_STATEMENTS: CommissionStatement[] = [
  {
    id: "stmt_1",
    participant: "Jamie R.",
    period: "2026-Q2",
    earned: 4_200,
    approved: 3_800,
    payable: 297,
    paid: 3_450,
    clawback: 0,
    lineItems: [
      { label: "Apex Manufacturing · Compliance", amount: 297, state: "pending_approval" },
      { label: "Meridian Group · Advisory setup", amount: 950, state: "paid" },
    ],
  },
];

const MOCK_CLAWBACKS: CommissionClawback[] = [
  {
    id: "cb_1",
    calculationId: "calc_3_hist",
    participant: "Devon L.",
    reason: "chargeback",
    amount: 175,
    detectedAt: "2026-07-08T09:00:00Z",
    state: "pending",
  },
];

export const mockCommissions: CommissionsService = {
  getDashboard: () =>
    mockGet(() => ({
      projected: 48_200,
      pendingCollection: 12_400,
      calculated: 8_100,
      awaitingVerification: 2_200,
      awaitingApproval: 4_050,
      reserved: 1_320,
      payable: 3_450,
      scheduled: 2_100,
      paid: 27_800,
      held: 400,
      clawbackExposure: 780,
      byParticipant: [
        { name: "Jamie R.", amount: 4_200 },
        { name: "Priya K.", amount: 3_850 },
        { name: "Devon L.", amount: 2_100 },
        { name: "Partner: NorthStar", amount: 1_450 },
      ],
      byPlan: [
        { plan: "Standard Sales 10%", amount: 6_900 },
        { plan: "Renewal Bonus", amount: 3_100 },
        { plan: "Referral", amount: 1_600 },
      ],
      byService: [
        { service: "Compliance Onboarding", amount: 5_400 },
        { service: "Advisory Retainer", amount: 4_100 },
        { service: "Implementation", amount: 2_100 },
      ],
      upcoming: [
        { date: "2026-07-30", amount: 356.25 },
        { date: "2026-08-01", amount: 297 },
        { date: "2026-08-15", amount: 1_200 },
      ],
      exceptions: 3,
      attributionConflicts: 1,
    })),
  listPlans: () =>
    mockGet(() => ({
      data: MOCK_PLANS,
      meta: { total: MOCK_PLANS.length, page: 1, pageSize: 50 },
    })),
  getPlan: (id) =>
    mockGet(() => {
      const p = MOCK_PLANS.find((x) => x.id === id);
      if (!p) throw new Error("Plan not found");
      return p;
    }),
  createPlan: (input) =>
    mockMutation(
      () => ({ ...(input as CommissionPlan), id: `plan_${Date.now()}` }),
      DEMO_MUTATION_MESSAGE,
    ),
  listCalculations: () =>
    mockGet(() => ({
      data: MOCK_CALCULATIONS,
      meta: { total: MOCK_CALCULATIONS.length, page: 1, pageSize: 50 },
    })),
  getCalculation: (id) =>
    mockGet(() => {
      const c = MOCK_CALCULATIONS.find((x) => x.id === id);
      if (!c) throw new Error("Calculation not found");
      return c;
    }),
  calculate: (input) =>
    mockMutation(() => {
      const plan = MOCK_PLANS.find((p) => p.id === input.planId) ?? MOCK_PLANS[0];
      const base = input.grossPayment - input.passThroughAmount - (input.adjustments ?? 0);
      const rate = plan.rate ?? 0.1;
      const pool = Math.max(0, base * rate);
      const holdback = pool * plan.holdbackPercent;
      const calc: CommissionCalculation = {
        id: `calc_${Date.now()}`,
        planId: plan.id,
        planName: plan.name,
        customerId: input.customerId,
        customerName: "—",
        invoiceId: input.invoiceId,
        paymentId: input.paymentId,
        serviceName: plan.eligibleServices[0] ?? "—",
        grossPayment: input.grossPayment,
        passThroughExcluded: input.passThroughAmount,
        adjustments: input.adjustments ?? 0,
        commissionableBase: base,
        appliedRate: rate,
        totalPool: pool,
        splits: [
          {
            participant: plan.eligibleParticipants[0] ?? "—",
            role: "closer",
            percent: 100,
            amount: pool,
          },
        ],
        holdback,
        netPayable: pool - holdback,
        expectedPayableDate: "2026-08-15",
        state: "calculated",
        calculatedAt: new Date().toISOString(),
        explanation: `Gross $${input.grossPayment} − pass-through $${input.passThroughAmount} − adjustments $${input.adjustments ?? 0} = base $${base}. Rate ${(rate * 100).toFixed(1)}% → pool $${pool.toFixed(2)}. Holdback ${(plan.holdbackPercent * 100).toFixed(0)}% ($${holdback.toFixed(2)}). Net $${(pool - holdback).toFixed(2)}.`,
      };
      return calc;
    }, DEMO_MUTATION_MESSAGE),
  listAttributions: () => mockGet(() => MOCK_ATTRIBUTIONS),
  saveAttribution: (input) =>
    mockMutation(() => {
      const saved: CommissionAttribution = { ...input, id: `attr_${Date.now()}` };
      MOCK_ATTRIBUTIONS = [...MOCK_ATTRIBUTIONS, saved];
      return saved;
    }, DEMO_MUTATION_MESSAGE),
  listApprovals: () => mockGet(() => MOCK_APPROVALS),
  approve: (id, reason) =>
    mockMutation(() => {
      const a = MOCK_APPROVALS.find((x) => x.id === id);
      if (!a) throw new Error("Approval not found");
      return { ...a, state: "approved" as const, reason };
    }, DEMO_MUTATION_MESSAGE),
  listPayables: () => mockGet(() => MOCK_PAYABLES),
  listStatements: () => mockGet(() => MOCK_STATEMENTS),
  listClawbacks: () => mockGet(() => MOCK_CLAWBACKS),
  listAudit: () =>
    mockGet(() => [
      {
        id: "aud_1",
        type: "commission.calculated",
        actor: "system",
        at: "2026-07-10T10:15:00Z",
        summary: "calc_1 pool $330 pending approval",
      },
      {
        id: "aud_2",
        type: "commission.approved",
        actor: "Rose",
        at: "2026-07-05T14:22:00Z",
        summary: "calc_2 approved for $356.25",
      },
    ]),
};
