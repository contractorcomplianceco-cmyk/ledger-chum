import { mockGet, mockMutation } from "../adapters/mock-adapter";
import { DEMO_MUTATION_MESSAGE, type DemoResult, type ID } from "../types";

export interface Evidence {
  sourceSystem: string;
  recordType: string;
  recordId: string;
  metric: string;
  lastUpdated: string;
  dataQuality: "high" | "medium" | "low";
  permissionScope: "own" | "department" | "company" | "all";
  relatedAuditEventId?: ID;
}

export interface AiAnswer {
  id: ID;
  question: string;
  answer: string;
  timePeriod: string;
  companyScope: string;
  supportingRecords: Evidence[];
  calculationMethod: string;
  confidence: number; // 0-1
  dataFreshness: string;
  assumptions: string[];
  missingData: string[];
  recommendedAction?: string;
  requiredApproval?: string;
  recordLinks: Array<{ label: string; href: string }>;
  createdAt: string;
}

export type RecommendationCategory =
  | "reduce_cost"
  | "recover_revenue"
  | "improve_collection"
  | "reprice_service"
  | "review_scope"
  | "cancel_subscription"
  | "reduce_seats"
  | "increase_campaign"
  | "pause_campaign"
  | "adjust_reserve"
  | "review_attribution"
  | "correct_mapping"
  | "resolve_anomaly"
  | "improve_data_quality"
  | "increase_reserve"
  | "delay_spending";

export type RecommendationState =
  | "generated"
  | "needs_review"
  | "accepted"
  | "dismissed"
  | "converted_to_task"
  | "converted_to_draft"
  | "approved_for_action"
  | "completed"
  | "outcome_measured";

export interface AiRecommendation {
  id: ID;
  title: string;
  category: RecommendationCategory;
  narrative: string;
  evidence: Evidence[];
  confidence: number;
  estimatedImpact: string;
  risk: "low" | "medium" | "high";
  timeHorizon: string;
  owner: string;
  requiredApproval: string;
  state: RecommendationState;
  outcome?: string;
  createdAt: string;
}

export interface AiPolicy {
  permittedScopes: string[];
  prohibitedData: string[];
  permittedCategories: string[];
  prohibitedActions: string[];
  approvalRequirements: string[];
  providerSelection: string;
  modelSelection: string;
  dataRetention: string;
  promptLogging: string;
  sensitiveMasking: boolean;
  humanReviewRequired: boolean;
}

export interface IntelligenceService {
  listSuggestions(): Promise<string[]>;
  ask(question: string): Promise<AiAnswer>;
  getBrief(): Promise<{
    summary: string;
    highlights: Array<{ label: string; value: string; delta?: string }>;
    recommendations: AiRecommendation[];
  }>;
  listRecommendations(): Promise<AiRecommendation[]>;
  getRecommendation(id: ID): Promise<AiRecommendation>;
  updateRecommendationState(
    id: ID,
    state: RecommendationState,
    reason: string,
  ): Promise<DemoResult<AiRecommendation>>;
  submitFeedback(input: {
    answerId: ID;
    rating: "up" | "down";
    comment?: string;
  }): Promise<DemoResult<{ answerId: ID }>>;
  listHistory(): Promise<AiAnswer[]>;
  getPolicy(): Promise<AiPolicy>;
  updatePolicy(policy: AiPolicy): Promise<DemoResult<AiPolicy>>;
  listAudit(): Promise<Array<{ id: ID; type: string; actor: string; at: string; summary: string }>>;
}

const SUGGESTIONS = [
  "What cash can we safely spend today?",
  "What money is restricted?",
  "Why did overhead increase?",
  "Which subscriptions should we review?",
  "Which AI tools create measurable value?",
  "Which clients are below target margin?",
  "Which invoices need immediate follow-up?",
  "Which expenses should be billed to clients?",
  "Where is revenue leaking?",
  "Which campaigns generate contribution profit?",
  "What commissions may become payable?",
  "Can we afford another employee?",
  "What changed financially since last week?",
  "What is lowering our Financial Confidence Score?",
];

const SAMPLE_EVIDENCE: Evidence[] = [
  {
    sourceSystem: "LedgerOS Cash Availability",
    recordType: "AllocationRule",
    recordId: "alloc_pass_through",
    metric: "$18,420 restricted",
    lastUpdated: "2026-07-12T13:00:00Z",
    dataQuality: "high",
    permissionScope: "company",
    relatedAuditEventId: "aud_cash_1",
  },
  {
    sourceSystem: "Zoho Billing",
    recordType: "Invoice",
    recordId: "inv_2145",
    metric: "$5,000 paid",
    lastUpdated: "2026-07-12T10:00:00Z",
    dataQuality: "high",
    permissionScope: "company",
    relatedAuditEventId: "aud_pay_1",
  },
];

const MOCK_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: "rec_1",
    title: "Cancel two idle Zoho Creator seats — $84/mo",
    category: "cancel_subscription",
    narrative:
      "Two Zoho Creator seats have shown zero session activity for 62 days. Cancelling reclaims $84/month with no functional impact based on current usage data.",
    evidence: [
      {
        sourceSystem: "Zoho Admin",
        recordType: "SeatUsage",
        recordId: "seat_zc_42",
        metric: "0 sessions / 62d",
        lastUpdated: "2026-07-12T00:00:00Z",
        dataQuality: "high",
        permissionScope: "company",
      },
    ],
    confidence: 0.92,
    estimatedImpact: "$1,008 annualized savings",
    risk: "low",
    timeHorizon: "Immediate",
    owner: "Christin Vale",
    requiredApproval: "Accounting Lead",
    state: "needs_review",
    createdAt: "2026-07-12T09:00:00Z",
  },
  {
    id: "rec_2",
    title: "Follow up on 3 invoices > 45 days past due — $22,400",
    category: "improve_collection",
    narrative:
      "Three invoices from BrightPath, Meridian, and Halcyon total $22,400 outstanding beyond 45 days. Payment-likelihood scores dropped from 78 → 41 over the last week.",
    evidence: SAMPLE_EVIDENCE,
    confidence: 0.81,
    estimatedImpact: "Up to $22,400 recovery",
    risk: "medium",
    timeHorizon: "This week",
    owner: "Priya K.",
    requiredApproval: "Accounting Lead",
    state: "generated",
    createdAt: "2026-07-11T18:00:00Z",
  },
  {
    id: "rec_3",
    title: "Review attribution conflict on deal_51",
    category: "review_attribution",
    narrative:
      "Attribution total for deal_51 is 50% — under-allocated by 50%. This blocks commission_calculation from advancing past pending_verification.",
    evidence: [
      {
        sourceSystem: "Commissions",
        recordType: "Attribution",
        recordId: "attr_3",
        metric: "50% assigned",
        lastUpdated: "2026-07-10T15:00:00Z",
        dataQuality: "high",
        permissionScope: "company",
      },
    ],
    confidence: 0.99,
    estimatedImpact: "Unblocks $1,200 payable",
    risk: "low",
    timeHorizon: "This week",
    owner: "Rose",
    requiredApproval: "Owner",
    state: "needs_review",
    createdAt: "2026-07-11T12:00:00Z",
  },
];

const MOCK_POLICY: AiPolicy = {
  permittedScopes: [
    "Company financial data",
    "Anonymized customer data",
    "Aggregated payroll totals",
  ],
  prohibitedData: [
    "Individual employee compensation",
    "Bank account credentials",
    "Client PII outside scope",
  ],
  permittedCategories: [
    "Explain",
    "Summarize",
    "Suggest",
    "Rank",
    "Forecast",
    "Identify exceptions",
    "Propose task",
    "Propose draft",
  ],
  prohibitedActions: [
    "Post journals",
    "Send payments",
    "Transfer funds",
    "Approve expenses",
    "Approve commissions",
    "Lock periods",
    "Change permissions",
    "Cancel subscriptions",
    "Send invoices",
    "Modify payroll",
    "Delete records",
  ],
  approvalRequirements: [
    "All financial actions require human approver",
    "AI cannot approve its own recommendation",
    "Overrides require reason string",
  ],
  providerSelection: "Configured via server-side gateway — not exposed to frontend",
  modelSelection: "Configured via server-side gateway — not exposed to frontend",
  dataRetention: "Prompt + response retained 90 days for audit; then anonymized",
  promptLogging: "Full prompt/response with correlation ID logged to audit stream",
  sensitiveMasking: true,
  humanReviewRequired: true,
};

export const mockIntelligence: IntelligenceService = {
  listSuggestions: () => mockGet(() => SUGGESTIONS),
  ask: (question) =>
    mockGet(() => ({
      id: `ans_${Date.now()}`,
      question,
      answer:
        "Based on demonstration data, ~$42,180 of your operating balance is currently safely spendable after subtracting pass-through obligations, commission reserves, upcoming payroll, and guardrail floors.",
      timePeriod: "As of today (mock)",
      companyScope: "CCA (single-entity mock)",
      supportingRecords: SAMPLE_EVIDENCE,
      calculationMethod:
        "Spendable = operating balance − pass-through obligations − commission reserve − scheduled payables (7-day) − guardrail floor.",
      confidence: 0.86,
      dataFreshness: "≤ 15 min old (mock)",
      assumptions: [
        "No unrecorded pending refunds",
        "Payroll run on schedule",
        "All connected banks synced today",
      ],
      missingData: ["Deferred vendor deposits > $10k", "Uncleared ACH holds"],
      recommendedAction:
        "Review the 3 outstanding invoices above 45 days before releasing discretionary spend.",
      requiredApproval: "Owner (for spend over guardrail)",
      recordLinks: [
        { label: "Cash Availability", href: "/cash-availability" },
        { label: "Commission reserve", href: "/commissions" },
      ],
      createdAt: new Date().toISOString(),
    })),
  getBrief: () =>
    mockGet(() => ({
      summary:
        "Cash position is stable. Two attribution conflicts and one subscription anomaly need review.",
      highlights: [
        { label: "Safely spendable", value: "$42,180", delta: "+$1,240 vs yesterday" },
        { label: "Commission reserve", value: "$3,450" },
        { label: "Overdue AR", value: "$22,400", delta: "3 invoices > 45d" },
        { label: "Confidence score", value: "82 / 100", delta: "−3 wk-over-wk" },
      ],
      recommendations: MOCK_RECOMMENDATIONS.slice(0, 2),
    })),
  listRecommendations: () => mockGet(() => MOCK_RECOMMENDATIONS),
  getRecommendation: (id) =>
    mockGet(() => {
      const r = MOCK_RECOMMENDATIONS.find((x) => x.id === id);
      if (!r) throw new Error("Recommendation not found");
      return r;
    }),
  updateRecommendationState: (id, state, reason) =>
    mockMutation(() => {
      const r = MOCK_RECOMMENDATIONS.find((x) => x.id === id);
      if (!r) throw new Error("Recommendation not found");
      return { ...r, state, outcome: reason };
    }, DEMO_MUTATION_MESSAGE),
  submitFeedback: (input) =>
    mockMutation(() => ({ answerId: input.answerId }), DEMO_MUTATION_MESSAGE),
  listHistory: () =>
    mockGet(() => [
      {
        id: "ans_hist_1",
        question: "Why did overhead increase last month?",
        answer:
          "Overhead rose $3,120 primarily due to a one-time software renewal and a duplicate SaaS subscription flagged by anomaly detection.",
        timePeriod: "June 2026 vs May 2026",
        companyScope: "CCA",
        supportingRecords: SAMPLE_EVIDENCE,
        calculationMethod: "Category-level month-over-month delta with anomaly overlay.",
        confidence: 0.9,
        dataFreshness: "1 day old",
        assumptions: ["Category mappings unchanged"],
        missingData: [],
        recordLinks: [{ label: "Overhead Intelligence", href: "/intelligence/overhead" }],
        createdAt: "2026-07-08T10:00:00Z",
      },
    ]),
  getPolicy: () => mockGet(() => MOCK_POLICY),
  updatePolicy: (policy) => mockMutation(() => policy, DEMO_MUTATION_MESSAGE),
  listAudit: () =>
    mockGet(() => [
      {
        id: "aud_ai_1",
        type: "ai.query",
        actor: "Rose",
        at: "2026-07-12T13:00:00Z",
        summary: "Asked: what cash can we safely spend today?",
      },
      {
        id: "aud_ai_2",
        type: "ai.recommendation",
        actor: "system",
        at: "2026-07-12T09:00:00Z",
        summary: "Generated rec_1 (cancel idle seats)",
      },
    ]),
};
