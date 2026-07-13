/**
 * 6B-2 Compensation service — mock adapter.
 *
 * All mutations return DemoResult with the standard demonstration message.
 * No real compensation, accounting, or attribution records are modified.
 */

import { mockGet, mockMutation } from "../../adapters/mock-adapter";
import {
  DEMO_MUTATION_MESSAGE,
  type DemoResult,
  type ID,
  type Paginated,
} from "../../types";
import {
  MOCK_ATTRIBUTIONS,
  MOCK_CONFLICTS,
  MOCK_EVIDENCE,
  MOCK_PARTICIPANTS,
  MOCK_PLANS,
  MOCK_PLAN_PARTICIPANTS,
  MOCK_PLAN_VERSIONS,
} from "./mock-data";
import type {
  AttributionConflict,
  AttributionEvidence,
  CompensationAttribution,
  CompensationContribution,
  CompensationParticipant,
  CompensationPlan,
  CompensationPlanParticipant,
  CompensationPlanVersion,
  EligibilityCheck,
  EligibilityResult,
  EligibilityResultState,
  PlanPreviewRequest,
  PlanPreviewResponse,
} from "./domain-types";
import { resolveCompensationPolicy } from "./policy-defaults";

// ─── Service interface ────────────────────────────────────────────────────

export interface CompensationService {
  // Plans
  listPlans(): Promise<Paginated<CompensationPlan>>;
  getPlan(id: ID): Promise<CompensationPlan | undefined>;
  createPlan(input: Omit<CompensationPlan, "id">): Promise<DemoResult<CompensationPlan>>;
  updatePlan(id: ID, patch: Partial<CompensationPlan>): Promise<DemoResult<CompensationPlan>>;

  // Plan versions
  listPlanVersions(planId: ID): Promise<CompensationPlanVersion[]>;
  createPlanVersion(planId: ID, changeSummary: string): Promise<DemoResult<CompensationPlanVersion>>;
  comparePlanVersions(planId: ID, a: number, b: number): Promise<{ a: CompensationPlanVersion; b: CompensationPlanVersion } | undefined>;
  activatePlanVersion(id: ID): Promise<DemoResult<{ id: ID }>>;
  retirePlanVersion(id: ID): Promise<DemoResult<{ id: ID }>>;

  // Participants
  listParticipants(): Promise<Paginated<CompensationParticipant>>;
  getParticipant(id: ID): Promise<CompensationParticipant | undefined>;
  listPlanParticipants(planId: ID): Promise<CompensationPlanParticipant[]>;
  assignParticipantToPlan(input: Omit<CompensationPlanParticipant, "id">): Promise<DemoResult<CompensationPlanParticipant>>;

  // Attribution
  listAttributions(): Promise<Paginated<CompensationAttribution>>;
  getAttribution(id: ID): Promise<CompensationAttribution | undefined>;
  createAttribution(input: Omit<CompensationAttribution, "id" | "createdAt" | "updatedAt">): Promise<DemoResult<CompensationAttribution>>;
  updateAttribution(id: ID, patch: Partial<CompensationAttribution>): Promise<DemoResult<CompensationAttribution>>;
  validateAttributionSplit(contributions: CompensationContribution[]): Promise<{
    pools: Array<{ poolId: ID; poolName: string; totalPercent: number; valid: boolean; message?: string }>;
    valid: boolean;
  }>;

  // Evidence
  listEvidence(attributionId?: ID): Promise<AttributionEvidence[]>;
  addEvidence(input: Omit<AttributionEvidence, "id" | "createdAt">): Promise<DemoResult<AttributionEvidence>>;
  verifyEvidence(id: ID): Promise<DemoResult<{ id: ID }>>;

  // Conflicts
  listConflicts(): Promise<AttributionConflict[]>;
  getConflict(id: ID): Promise<AttributionConflict | undefined>;
  resolveConflict(id: ID, resolution: string): Promise<DemoResult<{ id: ID }>>;

  // Eligibility + preview
  checkEligibility(input: EligibilityCheck): Promise<EligibilityResult>;
  previewPlan(input: PlanPreviewRequest): Promise<PlanPreviewResponse>;

  // Prebuilt preview scenarios
  listPreviewScenarios(): Promise<PlanPreviewResponse[]>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function validatePools(
  contributions: CompensationContribution[],
): Array<{ poolId: ID; poolName: string; totalPercent: number; valid: boolean; message?: string }> {
  const byPool = new Map<ID, { poolName: string; total: number }>();
  for (const c of contributions) {
    const key = c.poolId;
    const prev = byPool.get(key) ?? { poolName: c.poolName, total: 0 };
    prev.total += c.splitPercent ?? 0;
    byPool.set(key, prev);
  }
  return Array.from(byPool.entries()).map(([poolId, v]) => {
    const valid = Math.abs(v.total - 1) < 0.0001;
    return {
      poolId,
      poolName: v.poolName,
      totalPercent: v.total,
      valid,
      message: valid ? undefined : v.total < 1 ? "Pool is under-attributed" : "Pool is over-attributed",
    };
  });
}

const scenario = (
  key: string,
  label: string,
  input: Omit<PlanPreviewResponse, "resolvedPolicySnapshot" | "scenarioKey" | "scenarioLabel" | "invariantChecks"> & {
    invariantChecks?: PlanPreviewResponse["invariantChecks"];
  },
): PlanPreviewResponse => {
  const invariants: PlanPreviewResponse["invariantChecks"] =
    input.invariantChecks ?? [
      { label: "Pass-through excluded from base", passed: true },
      { label: "Base uses collected & cleared revenue only", passed: true },
      { label: "No double-dip on same basis", passed: true },
      { label: "Attribution split totals exactly 100% per pool", passed: true },
    ];
  return {
    scenarioKey: key,
    scenarioLabel: label,
    ...input,
    invariantChecks: invariants,
    resolvedPolicySnapshot: resolveCompensationPolicy(),
  };
};

const PREVIEW_SCENARIOS: PlanPreviewResponse[] = [
  scenario("tara_plus_sales", "Tara + Salesperson (stacked)", {
    grossPayment: 12000,
    excludedPassThrough: 1200,
    realizedRevenue: 10800,
    applicablePlans: ["Standard Sales Pool (10%)", "Tara — Brand Ambassador (5%)"],
    pools: [{ poolName: "Sales Pool (10%)", poolAmount: 1080 }],
    participants: [
      { name: "Tara Casella", role: "brand_ambassador", poolName: "Sales Pool (10%)", splitPercent: 0.5, amount: 540 },
      { name: "Jamie Rivera", role: "closer", poolName: "Sales Pool (10%)", splitPercent: 0.5, amount: 540 },
    ],
    totalCompensation: 1080,
    marginImpact: -0.1,
    cashImpact: -1080,
    requiredApprovals: ["Accounting Lead", "Owner"],
    legalReviewRequired: false,
    accountingReviewRequired: true,
    narrative:
      "Tara qualifies at 5% (carved) and salesperson receives the remaining 5%. Standard 10% pool preserved; no over-stack.",
  }),
  scenario("sales_only", "Salesperson only", {
    grossPayment: 8000,
    excludedPassThrough: 500,
    realizedRevenue: 7500,
    applicablePlans: ["Standard Sales Pool (10%)"],
    pools: [{ poolName: "Sales Pool (10%)", poolAmount: 750 }],
    participants: [
      { name: "Jamie Rivera", role: "closer", poolName: "Sales Pool (10%)", splitPercent: 1, amount: 750 },
    ],
    totalCompensation: 750,
    marginImpact: -0.1,
    cashImpact: -750,
    requiredApprovals: ["Accounting Lead"],
    legalReviewRequired: false,
    accountingReviewRequired: true,
    narrative: "No Tara involvement — full 10% pool to salesperson.",
  }),
  scenario("multi_contrib", "Multiple contributors", {
    grossPayment: 20000,
    excludedPassThrough: 2000,
    realizedRevenue: 18000,
    applicablePlans: ["Standard Sales Pool (10%)"],
    pools: [{ poolName: "Sales Pool (10%)", poolAmount: 1800 }],
    participants: [
      { name: "Tara Casella", role: "relationship_creator", poolName: "Sales Pool (10%)", splitPercent: 0.4, amount: 720 },
      { name: "Jamie Rivera", role: "closer", poolName: "Sales Pool (10%)", splitPercent: 0.4, amount: 720 },
      { name: "Priya Kapoor", role: "support_contributor", poolName: "Sales Pool (10%)", splitPercent: 0.2, amount: 360 },
    ],
    totalCompensation: 1800,
    marginImpact: -0.1,
    cashImpact: -1800,
    requiredApprovals: ["Accounting Lead", "Owner"],
    legalReviewRequired: false,
    accountingReviewRequired: true,
    narrative: "Three contributors split the standard 10% pool, totaling exactly 100%.",
  }),
  scenario("strategic_plus_sales", "Strategic partner + salesperson (separate pool)", {
    grossPayment: 30000,
    excludedPassThrough: 3000,
    realizedRevenue: 27000,
    applicablePlans: ["Standard Sales Pool (10%)", "Strategic Partner (7%)"],
    pools: [
      { poolName: "Sales Pool (10%)", poolAmount: 2700 },
      { poolName: "Strategic Partner Pool (7%)", poolAmount: 1890 },
    ],
    participants: [
      { name: "Jamie Rivera", role: "closer", poolName: "Sales Pool (10%)", splitPercent: 1, amount: 2700 },
      { name: "Reliant Strategic", role: "strategic_partner", poolName: "Strategic Partner Pool (7%)", splitPercent: 1, amount: 1890 },
    ],
    totalCompensation: 4590,
    marginImpact: -0.17,
    cashImpact: -4590,
    requiredApprovals: ["Accounting Lead", "Owner"],
    legalReviewRequired: false,
    accountingReviewRequired: true,
    narrative: "Sales pool and Strategic Partner pool are separate — each totals 100% independently.",
  }),
  scenario("affiliate_plus_sales", "Affiliate + salesperson", {
    grossPayment: 6000,
    excludedPassThrough: 400,
    realizedRevenue: 5600,
    applicablePlans: ["Standard Sales Pool (10%)", "Affiliate Pool (5%)"],
    pools: [
      { poolName: "Sales Pool (10%)", poolAmount: 560 },
      { poolName: "Affiliate Pool (5%)", poolAmount: 280 },
    ],
    participants: [
      { name: "Devon Locke", role: "closer", poolName: "Sales Pool (10%)", splitPercent: 1, amount: 560 },
      { name: "Affiliate: Kestrel Media", role: "affiliate", poolName: "Affiliate Pool (5%)", splitPercent: 1, amount: 280 },
    ],
    totalCompensation: 840,
    marginImpact: -0.15,
    cashImpact: -840,
    requiredApprovals: ["Accounting Lead"],
    legalReviewRequired: false,
    accountingReviewRequired: true,
    narrative: "Affiliate is a separate disbursement class (affiliate_fee) and a separate pool.",
  }),
  scenario("software_participation", "Software participation (recurring)", {
    grossPayment: 2500,
    excludedPassThrough: 0,
    realizedRevenue: 2500,
    applicablePlans: ["Software Participation (3%)"],
    pools: [{ poolName: "Software Participation (3%)", poolAmount: 75 }],
    participants: [
      { name: "Tara Casella", role: "brand_ambassador", poolName: "Software Participation (3%)", splitPercent: 1, amount: 75 },
    ],
    totalCompensation: 75,
    marginImpact: -0.03,
    cashImpact: -75,
    requiredApprovals: ["Accounting Lead"],
    legalReviewRequired: false,
    accountingReviewRequired: true,
    narrative: "Monthly software NRSR participation — accrues only after payment clears.",
  }),
  scenario("milestone_stack", "Milestone bonus stack (elected)", {
    grossPayment: 15000,
    excludedPassThrough: 0,
    realizedRevenue: 15000,
    applicablePlans: ["Milestone Bonus — Enterprise Onboarding", "Standard Sales Pool (10%)"],
    pools: [
      { poolName: "Sales Pool (10%)", poolAmount: 1500 },
      { poolName: "Milestone Bonus (fixed)", poolAmount: 5000 },
    ],
    participants: [
      { name: "Jamie Rivera", role: "closer", poolName: "Sales Pool (10%)", splitPercent: 1, amount: 1500 },
      { name: "Delivery Team Pool", role: "team_pool", poolName: "Milestone Bonus (fixed)", splitPercent: 1, amount: 5000 },
    ],
    totalCompensation: 6500,
    marginImpact: -0.43,
    cashImpact: -6500,
    requiredApprovals: ["Accounting Lead", "Owner"],
    legalReviewRequired: false,
    accountingReviewRequired: true,
    narrative: "Milestone bonus stacks with sales — different basis (fixed vs %), different disbursement class (bonus vs commission).",
    invariantChecks: [
      { label: "Pass-through excluded from base", passed: true },
      { label: "Base uses collected & cleared revenue only", passed: true },
      { label: "Milestone stack elected per milestone", passed: true, note: "Elected via plan configuration" },
      { label: "No duplicate compensation on the same basis", passed: true },
    ],
  }),
  scenario("house_account", "House account (suppressed)", {
    grossPayment: 10000,
    excludedPassThrough: 500,
    realizedRevenue: 9500,
    applicablePlans: ["House Account — Suppressed"],
    pools: [{ poolName: "House Account (0%)", poolAmount: 0 }],
    participants: [],
    totalCompensation: 0,
    marginImpact: 0,
    cashImpact: 0,
    requiredApprovals: [],
    legalReviewRequired: false,
    accountingReviewRequired: false,
    narrative: "House-account rule suppresses the pool to protect margin. No compensation calculated.",
  }),
  scenario("renewal", "Renewal", {
    grossPayment: 9000,
    excludedPassThrough: 900,
    realizedRevenue: 8100,
    applicablePlans: ["Standard Sales Pool (10%) — renewal eligibility"],
    pools: [{ poolName: "Sales Pool (10%)", poolAmount: 810 }],
    participants: [
      { name: "Jamie Rivera", role: "account_manager", poolName: "Sales Pool (10%)", splitPercent: 1, amount: 810 },
    ],
    totalCompensation: 810,
    marginImpact: -0.1,
    cashImpact: -810,
    requiredApprovals: ["Accounting Lead"],
    legalReviewRequired: false,
    accountingReviewRequired: true,
    narrative: "Renewal eligible under standard plan; account manager credited.",
  }),
  scenario("expansion", "Expansion", {
    grossPayment: 6000,
    excludedPassThrough: 200,
    realizedRevenue: 5800,
    applicablePlans: ["Standard Sales Pool (10%) — expansion eligibility"],
    pools: [{ poolName: "Sales Pool (10%)", poolAmount: 580 }],
    participants: [
      { name: "Priya Kapoor", role: "expansion_owner", poolName: "Sales Pool (10%)", splitPercent: 1, amount: 580 },
    ],
    totalCompensation: 580,
    marginImpact: -0.1,
    cashImpact: -580,
    requiredApprovals: ["Accounting Lead"],
    legalReviewRequired: false,
    accountingReviewRequired: true,
    narrative: "Expansion revenue counts under standard plan; expansion owner credited.",
  }),
  scenario("post_termination", "Post-termination survival", {
    grossPayment: 4200,
    excludedPassThrough: 0,
    realizedRevenue: 4200,
    applicablePlans: ["Software Participation (3%) — 12-month survival"],
    pools: [{ poolName: "Software Participation (3%)", poolAmount: 126 }],
    participants: [
      { name: "Tara Casella (post-term)", role: "brand_ambassador", poolName: "Software Participation (3%)", splitPercent: 1, amount: 126 },
    ],
    totalCompensation: 126,
    marginImpact: -0.03,
    cashImpact: -126,
    requiredApprovals: ["Accounting Lead", "Owner", "Legal"],
    legalReviewRequired: true,
    accountingReviewRequired: true,
    narrative: "Participant terminated 4 months ago; within 12-month survival window. Legal review required before disbursement.",
    invariantChecks: [
      { label: "Pass-through excluded from base", passed: true },
      { label: "Base uses collected & cleared revenue only", passed: true },
      { label: "Post-termination survival window valid", passed: true, note: "8 months remaining of 12" },
      { label: "Legal review attached", passed: false, note: "Awaiting cleared legal review" },
    ],
  }),
];

// ─── Mock implementation ──────────────────────────────────────────────────

export const compensationService: CompensationService = {
  listPlans: () =>
    mockGet<Paginated<CompensationPlan>>(() => ({
      data: MOCK_PLANS,
      meta: { total: MOCK_PLANS.length, page: 1, pageSize: MOCK_PLANS.length, nextCursor: null },
    })),
  getPlan: (id) => mockGet(() => MOCK_PLANS.find((p) => p.id === id)),
  createPlan: (input) =>
    mockMutation(
      () => ({ ...(input as CompensationPlan), id: `cp_new_${Date.now()}` }),
      DEMO_MUTATION_MESSAGE,
    ),
  updatePlan: (id, patch) =>
    mockMutation(() => {
      const plan = MOCK_PLANS.find((p) => p.id === id) ?? MOCK_PLANS[0];
      return { ...plan, ...patch };
    }, DEMO_MUTATION_MESSAGE),

  listPlanVersions: (planId) => mockGet(() => MOCK_PLAN_VERSIONS.filter((v) => v.planId === planId)),
  createPlanVersion: (planId, changeSummary) =>
    mockMutation(() => {
      const versions = MOCK_PLAN_VERSIONS.filter((v) => v.planId === planId);
      const latest = versions.reduce((n, v) => Math.max(n, v.version), 0);
      const base = MOCK_PLANS.find((p) => p.id === planId) ?? MOCK_PLANS[0];
      const draft: CompensationPlanVersion = {
        id: `cpv_${planId}_${latest + 1}`,
        planId,
        version: latest + 1,
        effectiveDate: new Date().toISOString().slice(0, 10),
        createdBy: "Rose Delacroix",
        createdAt: new Date().toISOString(),
        changeSummary,
        priorVersion: latest,
        approvalStatus: "draft",
        impactedCalculations: 0,
        resolvedPolicySnapshot: resolveCompensationPolicy(base.policyOverrides),
        planSnapshot: base,
      };
      return draft;
    }, DEMO_MUTATION_MESSAGE),
  comparePlanVersions: (planId, a, b) =>
    mockGet(() => {
      const va = MOCK_PLAN_VERSIONS.find((v) => v.planId === planId && v.version === a);
      const vb = MOCK_PLAN_VERSIONS.find((v) => v.planId === planId && v.version === b);
      if (!va || !vb) return undefined;
      return { a: va, b: vb };
    }),
  activatePlanVersion: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  retirePlanVersion: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),

  listParticipants: () =>
    mockGet(() => ({
      data: MOCK_PARTICIPANTS,
      meta: {
        total: MOCK_PARTICIPANTS.length,
        page: 1,
        pageSize: MOCK_PARTICIPANTS.length,
        nextCursor: null,
      },
    })),
  getParticipant: (id) => mockGet(() => MOCK_PARTICIPANTS.find((p) => p.id === id)),
  listPlanParticipants: (planId) => mockGet(() => MOCK_PLAN_PARTICIPANTS.filter((p) => p.planId === planId)),
  assignParticipantToPlan: (input) =>
    mockMutation(
      () => ({ ...(input as CompensationPlanParticipant), id: `pp_new_${Date.now()}` }),
      DEMO_MUTATION_MESSAGE,
    ),

  listAttributions: () =>
    mockGet(() => ({
      data: MOCK_ATTRIBUTIONS,
      meta: {
        total: MOCK_ATTRIBUTIONS.length,
        page: 1,
        pageSize: MOCK_ATTRIBUTIONS.length,
        nextCursor: null,
      },
    })),
  getAttribution: (id) => mockGet(() => MOCK_ATTRIBUTIONS.find((a) => a.id === id)),
  createAttribution: (input) =>
    mockMutation(
      () => ({
        ...(input as CompensationAttribution),
        id: `ca_new_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      DEMO_MUTATION_MESSAGE,
    ),
  updateAttribution: (id, patch) =>
    mockMutation(() => {
      const a = MOCK_ATTRIBUTIONS.find((x) => x.id === id) ?? MOCK_ATTRIBUTIONS[0];
      return { ...a, ...patch, updatedAt: new Date().toISOString() };
    }, DEMO_MUTATION_MESSAGE),
  validateAttributionSplit: (contributions) =>
    mockGet(() => {
      const pools = validatePools(contributions);
      return { pools, valid: pools.every((p) => p.valid) };
    }),

  listEvidence: (attributionId) =>
    mockGet(() => (attributionId ? MOCK_EVIDENCE.filter((e) => e.attributionId === attributionId) : MOCK_EVIDENCE)),
  addEvidence: (input) =>
    mockMutation(
      () => ({
        ...(input as AttributionEvidence),
        id: `ev_new_${Date.now()}`,
        createdAt: new Date().toISOString(),
      }),
      DEMO_MUTATION_MESSAGE,
    ),
  verifyEvidence: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),

  listConflicts: () => mockGet(() => MOCK_CONFLICTS),
  getConflict: (id) => mockGet(() => MOCK_CONFLICTS.find((c) => c.id === id)),
  resolveConflict: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),

  checkEligibility: (input) =>
    mockGet<EligibilityResult>(() => {
      const plan = MOCK_PLANS.find((p) => p.id === input.planId);
      const participant = MOCK_PARTICIPANTS.find((p) => p.id === input.participantId);
      const checks: EligibilityResult["checks"] = [
        {
          label: "Plan effective date reached",
          status: plan && new Date(plan.effectiveDate) <= new Date() ? "pass" : "warn",
          detail: plan ? `Effective ${plan.effectiveDate}` : "Plan not found",
        },
        {
          label: "Participant type matches plan",
          status: participant && plan ? "pass" : "fail",
          detail: participant?.type ?? "unknown",
        },
        {
          label: "Service / product eligibility",
          status: "pass",
          detail: plan?.eligibleServices.join(", ") || "n/a",
        },
        {
          label: "Relationship eligibility",
          status: participant?.type === "brand_ambassador" ? "warn" : "pass",
          detail: "Brand ambassador claims require attached evidence",
        },
        {
          label: "Collected & cleared revenue requirement",
          status: plan?.collectionRequirement === "collected_and_cleared" ? "pass" : "warn",
          detail: `Collection requirement: ${plan?.collectionRequirement ?? "n/a"}`,
        },
        {
          label: "House-account rule",
          status: plan?.houseAccountRule === "suppress" ? "pass" : "warn",
          detail: `House account rule: ${plan?.houseAccountRule ?? "n/a"}`,
        },
        {
          label: "Post-termination survival",
          status: participant?.active === false ? "warn" : "n/a",
          detail: participant?.survivalRights ?? "Active participant",
        },
        {
          label: "Legal review",
          status: plan?.legalReviewRequired && plan.legalReviewStatus !== "cleared" ? "fail" : "pass",
          detail: `${plan?.legalReviewStatus ?? "not_required"}`,
        },
        {
          label: "Accounting review",
          status: plan?.accountingReviewRequired && plan.accountingReviewStatus !== "cleared" ? "warn" : "pass",
          detail: `${plan?.accountingReviewStatus ?? "not_required"}`,
        },
      ];
      const requiredReviews: EligibilityResult["requiredReviews"] = [];
      if (plan?.legalReviewRequired && plan.legalReviewStatus !== "cleared") requiredReviews.push("legal");
      if (plan?.accountingReviewRequired && plan.accountingReviewStatus !== "cleared") requiredReviews.push("accounting");
      if (plan?.family === "investor_milestone_bonus" || plan?.family === "equity_milestone") requiredReviews.push("owner");

      let result: EligibilityResultState = "eligible";
      if (checks.some((c) => c.status === "fail")) result = "needs_legal_review";
      else if (checks.some((c) => c.status === "warn")) result = "conditionally_eligible";
      if (participant?.type === "brand_ambassador") result = "conditionally_eligible";
      if (!plan?.active) result = "plan_not_effective";

      return {
        input,
        checks,
        result,
        explanation: plan
          ? `Under plan "${plan.name}" for ${participant?.name ?? "participant"}: ${plan.plainLanguageSummary}`
          : "Plan not found",
        requiredReviews,
      };
    }),
  previewPlan: (input) =>
    mockGet<PlanPreviewResponse>(() => {
      const found = PREVIEW_SCENARIOS.find((s) => s.scenarioKey === input.scenarioKey);
      if (found) return found;
      const realized = input.grossPayment - input.passThroughAmount;
      const pool = realized * 0.1;
      return scenario("custom", "Custom scenario", {
        grossPayment: input.grossPayment,
        excludedPassThrough: input.passThroughAmount,
        realizedRevenue: realized,
        applicablePlans: ["Standard Sales Pool (10%)"],
        pools: [{ poolName: "Sales Pool (10%)", poolAmount: pool }],
        participants: input.contributors.map((c) => ({
          name: c.name,
          role: c.role,
          poolName: "Sales Pool (10%)",
          splitPercent: c.splitPercent,
          amount: pool * c.splitPercent,
        })),
        totalCompensation: pool,
        marginImpact: -0.1,
        cashImpact: -pool,
        requiredApprovals: ["Accounting Lead"],
        legalReviewRequired: false,
        accountingReviewRequired: true,
        narrative: "Custom preview using standard 10% pool.",
      });
    }),
  listPreviewScenarios: () => mockGet(() => PREVIEW_SCENARIOS),
};
