// Mock demonstration data for the Opportunity Engine.
// Fictional records. Cross-references clients / invoices / employees used by
// other apex-* mock modules so the five experiences interconnect.

export type OppCategory =
  | "Missed Invoice"
  | "Unbilled Work"
  | "Missed Markup"
  | "Underpriced Service"
  | "Dormant Client"
  | "Renewal Opportunity"
  | "Expansion Opportunity"
  | "Upsell Opportunity"
  | "Cross-Sell Opportunity"
  | "Recoverable Expense"
  | "Vendor Savings"
  | "Duplicate Subscription"
  | "Unused Software Seat"
  | "Better Payment Terms"
  | "Better Billing Structure"
  | "Collection Opportunity"
  | "Tax Review Opportunity"
  | "Cash Reserve Improvement"
  | "Marketing Budget Opportunity"
  | "Technology Consolidation"
  | "Commission Plan Improvement"
  | "Travel/Event ROI Improvement"
  | "Intercompany Correction"
  | "Owner Transaction Review"
  | "Profit-Sharing Optimization";

export type OppImpact = "Revenue" | "Margin" | "Cost" | "Cash" | "Risk" | "Growth";
export type OppEffort = "Low" | "Medium" | "High";
export type OppStatus =
  | "New"
  | "Under Review"
  | "Needs Evidence"
  | "Accepted"
  | "Converted to Task"
  | "Converted to Draft"
  | "Pending Approval"
  | "Approved"
  | "In Progress"
  | "Completed"
  | "Outcome Measured"
  | "Dismissed";

export type Opportunity = {
  id: string;
  title: string;
  category: OppCategory;
  description: string;
  entity: string;
  subject: string; // client / vendor / person
  financialImpact: number;
  impactType: OppImpact;
  confidence: number;
  effort: OppEffort;
  timeToValue: string;
  urgency: "Low" | "Medium" | "High";
  risk: "Low" | "Medium" | "High";
  evidence: string[];
  sources: string[];
  owner: string;
  approver: string;
  status: OppStatus;
  createdAt: string;
  targetDate: string;
  recommendedAction: string;
  relatedDnaPath?: string;
  relatedTimeline?: string;
  relatedGraphNode?: string;
  actualRealized?: number;
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "OPP-1042",
    title: "ALD engagement never billed for April milestone",
    category: "Unbilled Work",
    description:
      "82 tracked hours on the ALD compliance audit closed in April but no invoice was issued. Contract rate $185/hr.",
    entity: "LedgerOS LLC",
    subject: "ALD Holdings",
    financialImpact: 15170,
    impactType: "Revenue",
    confidence: 92,
    effort: "Low",
    timeToValue: "3 days",
    urgency: "High",
    risk: "Low",
    evidence: ["82 hrs logged in Harvest", "Milestone marked complete", "Contract §3.2 billing terms"],
    sources: ["Harvest", "Zoho CRM", "Google Drive"],
    owner: "K. Chen",
    approver: "Rose Alvarez",
    status: "New",
    createdAt: "2025-05-12",
    targetDate: "2025-05-20",
    recommendedAction: "Draft invoice INV-2025-0518 for $15,170 and send for approval.",
    relatedDnaPath: "DNA-CLIENT-ALD",
    relatedTimeline: "TL-CLIENT-ALD",
    relatedGraphNode: "client:ald",
  },
  {
    id: "OPP-1043",
    title: "Duplicate Notion subscription across entities",
    category: "Duplicate Subscription",
    description: "Notion charged twice — LedgerOS LLC and LedgerOS Studio — 14 overlapping seats.",
    entity: "LedgerOS Group",
    subject: "Notion Labs",
    financialImpact: 4620,
    impactType: "Cost",
    confidence: 96,
    effort: "Low",
    timeToValue: "7 days",
    urgency: "Medium",
    risk: "Low",
    evidence: ["Two active billing accounts", "Overlap of 14 users", "Ramp category: SaaS"],
    sources: ["Ramp", "Notion Admin"],
    owner: "J. Patel",
    approver: "Rose Alvarez",
    status: "Under Review",
    createdAt: "2025-05-10",
    targetDate: "2025-05-24",
    recommendedAction: "Consolidate under LedgerOS Group and cancel duplicate.",
    relatedDnaPath: "DNA-VENDOR-NOTION",
    relatedGraphNode: "vendor:notion",
  },
  {
    id: "OPP-1044",
    title: "NorthStar renewal window opens in 21 days",
    category: "Renewal Opportunity",
    description: "24-month engagement ending Jun 30. Usage +38%, expansion signal strong.",
    entity: "LedgerOS LLC",
    subject: "NorthStar Systems",
    financialImpact: 96000,
    impactType: "Revenue",
    confidence: 78,
    effort: "Medium",
    timeToValue: "30 days",
    urgency: "High",
    risk: "Medium",
    evidence: ["Contract expiring 06-30", "Usage up 38% YoY", "NPS 62"],
    sources: ["Zoho CRM", "Stripe", "Product analytics"],
    owner: "M. Rose",
    approver: "Rose Alvarez",
    status: "Accepted",
    createdAt: "2025-05-08",
    targetDate: "2025-06-10",
    recommendedAction: "Send renewal proposal at +12% with expansion module.",
    relatedTimeline: "TL-CLIENT-NORTHSTAR",
    relatedGraphNode: "client:northstar",
  },
  {
    id: "OPP-1045",
    title: "Markup missing on 6 pass-through vendor invoices",
    category: "Missed Markup",
    description: "6 vendor invoices passed through without contractual 15% markup applied.",
    entity: "LedgerOS LLC",
    subject: "Brightpath Media",
    financialImpact: 8250,
    impactType: "Margin",
    confidence: 88,
    effort: "Low",
    timeToValue: "5 days",
    urgency: "Medium",
    risk: "Low",
    evidence: ["6 vendor bills", "MSA §4.1 15% markup", "No markup line on client invoices"],
    sources: ["Bill.com", "Zoho Books"],
    owner: "K. Chen",
    approver: "Rose Alvarez",
    status: "Pending Approval",
    createdAt: "2025-05-06",
    targetDate: "2025-05-18",
    recommendedAction: "Issue supplemental invoices totaling $8,250.",
    relatedDnaPath: "DNA-CLIENT-BRIGHTPATH",
  },
  {
    id: "OPP-1046",
    title: "Meridian dormant 94 days — reactivation window",
    category: "Dormant Client",
    description: "Historic ARR $84k. Last engagement Feb 8. Contact still warm per CRM.",
    entity: "LedgerOS LLC",
    subject: "Meridian Group",
    financialImpact: 42000,
    impactType: "Growth",
    confidence: 62,
    effort: "Medium",
    timeToValue: "45 days",
    urgency: "Medium",
    risk: "Medium",
    evidence: ["No activity 94 days", "Prior ARR $84k", "Warm CRM signal"],
    sources: ["Zoho CRM"],
    owner: "M. Rose",
    approver: "Rose Alvarez",
    status: "New",
    createdAt: "2025-05-11",
    targetDate: "2025-06-25",
    recommendedAction: "Owner-led outreach with tailored offer.",
    relatedGraphNode: "client:meridian",
  },
  {
    id: "OPP-1047",
    title: "AR aging — Sequoia Labs 61-day overdue $38,400",
    category: "Collection Opportunity",
    description: "Invoice INV-2025-0311 past due 61 days. Prior payment history strong.",
    entity: "LedgerOS LLC",
    subject: "Sequoia Labs",
    financialImpact: 38400,
    impactType: "Cash",
    confidence: 84,
    effort: "Low",
    timeToValue: "10 days",
    urgency: "High",
    risk: "Low",
    evidence: ["INV-2025-0311 61 days overdue", "3 prior invoices paid on time", "No dispute logged"],
    sources: ["Zoho Books", "Stripe"],
    owner: "K. Chen",
    approver: "Rose Alvarez",
    status: "In Progress",
    createdAt: "2025-05-02",
    targetDate: "2025-05-19",
    recommendedAction: "Send 2nd reminder + call by AR lead.",
    relatedTimeline: "TL-INVOICE-0311",
  },
  {
    id: "OPP-1048",
    title: "Q2 payroll tax reserve underfunded by $12,300",
    category: "Tax Review Opportunity",
    description: "Payroll growth outpaced reserve calc. Recommend one-time top-up.",
    entity: "LedgerOS LLC",
    subject: "Internal",
    financialImpact: 12300,
    impactType: "Cash",
    confidence: 90,
    effort: "Low",
    timeToValue: "2 days",
    urgency: "High",
    risk: "Medium",
    evidence: ["Gusto Q2 gross wages", "Historical reserve ratio 22.4%", "Current reserve 19.1%"],
    sources: ["Gusto", "Zoho Books"],
    owner: "R. Alvarez",
    approver: "Rose Alvarez",
    status: "Approved",
    createdAt: "2025-05-04",
    targetDate: "2025-05-15",
    recommendedAction: "Transfer $12,300 to tax reserve account.",
  },
  {
    id: "OPP-1049",
    title: "Commission plan overweighting one-time deals",
    category: "Commission Plan Improvement",
    description: "Current plan pays same rate on one-time vs. recurring. Modeled shift to 3:1 recurring lifts LTV margin.",
    entity: "LedgerOS LLC",
    subject: "GTM Team",
    financialImpact: 68000,
    impactType: "Margin",
    confidence: 71,
    effort: "High",
    timeToValue: "90 days",
    urgency: "Medium",
    risk: "Medium",
    evidence: ["12mo commission ledger", "LTV cohort model", "GTM feedback"],
    sources: ["Zoho Books", "Compensation ledger"],
    owner: "Rose Alvarez",
    approver: "Rose Alvarez",
    status: "Under Review",
    createdAt: "2025-04-28",
    targetDate: "2025-08-01",
    recommendedAction: "Draft v3 plan; simulate in Digital Twin before roll-out.",
  },
  {
    id: "OPP-1050",
    title: "Zapier seats — 9 of 24 unused for 60+ days",
    category: "Unused Software Seat",
    description: "Rightsize seats. Monthly recovery $486.",
    entity: "LedgerOS LLC",
    subject: "Zapier",
    financialImpact: 5832,
    impactType: "Cost",
    confidence: 94,
    effort: "Low",
    timeToValue: "7 days",
    urgency: "Low",
    risk: "Low",
    evidence: ["Zapier admin usage export", "60+ day inactivity"],
    sources: ["Zapier"],
    owner: "J. Patel",
    approver: "Rose Alvarez",
    status: "Converted to Task",
    createdAt: "2025-05-01",
    targetDate: "2025-05-15",
    recommendedAction: "Reclaim 9 seats.",
  },
  {
    id: "OPP-1051",
    title: "Kestrel upsell — Analytics module fits usage pattern",
    category: "Upsell Opportunity",
    description: "Query volume 4.2× baseline. Analytics module aligns with observed workflow.",
    entity: "LedgerOS LLC",
    subject: "Kestrel Bio",
    financialImpact: 24000,
    impactType: "Revenue",
    confidence: 74,
    effort: "Medium",
    timeToValue: "30 days",
    urgency: "Medium",
    risk: "Low",
    evidence: ["Product usage query volume", "3 support tickets referencing analytics"],
    sources: ["Product analytics", "Help desk"],
    owner: "M. Rose",
    approver: "Rose Alvarez",
    status: "Accepted",
    createdAt: "2025-05-07",
    targetDate: "2025-06-15",
    recommendedAction: "Send tailored expansion proposal.",
    relatedGraphNode: "client:kestrel",
  },
  {
    id: "OPP-1052",
    title: "Recoverable travel expense — Q1 conference",
    category: "Recoverable Expense",
    description: "$2,840 in Q1 travel is reimbursable under NorthStar SOW §7.",
    entity: "LedgerOS LLC",
    subject: "NorthStar Systems",
    financialImpact: 2840,
    impactType: "Cash",
    confidence: 89,
    effort: "Low",
    timeToValue: "14 days",
    urgency: "Medium",
    risk: "Low",
    evidence: ["Ramp expense category", "SOW §7 travel clause"],
    sources: ["Ramp", "Contract"],
    owner: "K. Chen",
    approver: "Rose Alvarez",
    status: "New",
    createdAt: "2025-05-09",
    targetDate: "2025-05-23",
    recommendedAction: "Package receipts and invoice for reimbursement.",
  },
  {
    id: "OPP-1053",
    title: "Vendor consolidation — 3 QA testing tools",
    category: "Technology Consolidation",
    description: "Replace BrowserStack + Sauce + LambdaTest with single vendor.",
    entity: "LedgerOS LLC",
    subject: "QA Toolchain",
    financialImpact: 18400,
    impactType: "Cost",
    confidence: 68,
    effort: "High",
    timeToValue: "90 days",
    urgency: "Low",
    risk: "Medium",
    evidence: ["3 overlapping subscriptions", "Feature parity matrix"],
    sources: ["Ramp", "Engineering review"],
    owner: "J. Patel",
    approver: "Rose Alvarez",
    status: "Under Review",
    createdAt: "2025-04-22",
    targetDate: "2025-07-30",
    recommendedAction: "Run 30-day trial on preferred consolidator.",
  },
];

export const OPP_VIEWS = [
  "Highest Impact",
  "Quick Wins",
  "Revenue Recovery",
  "Cost Savings",
  "Growth",
  "Cash",
  "Billing",
  "Technology",
  "Tax Review",
  "Owner/Entity",
  "Completed",
  "Dismissed",
] as const;
export type OppView = (typeof OPP_VIEWS)[number];

export function filterOpps(view: OppView): Opportunity[] {
  switch (view) {
    case "Highest Impact":
      return [...OPPORTUNITIES].sort((a, b) => b.financialImpact - a.financialImpact);
    case "Quick Wins":
      return OPPORTUNITIES.filter((o) => o.effort === "Low" && o.confidence >= 80);
    case "Revenue Recovery":
      return OPPORTUNITIES.filter((o) => o.impactType === "Revenue" || o.category === "Unbilled Work" || o.category === "Missed Invoice" || o.category === "Missed Markup");
    case "Cost Savings":
      return OPPORTUNITIES.filter((o) => o.impactType === "Cost");
    case "Growth":
      return OPPORTUNITIES.filter((o) => o.impactType === "Growth" || o.category.includes("Expansion") || o.category === "Upsell Opportunity" || o.category === "Cross-Sell Opportunity" || o.category === "Renewal Opportunity");
    case "Cash":
      return OPPORTUNITIES.filter((o) => o.impactType === "Cash");
    case "Billing":
      return OPPORTUNITIES.filter((o) => ["Unbilled Work", "Missed Invoice", "Missed Markup", "Underpriced Service", "Better Billing Structure"].includes(o.category));
    case "Technology":
      return OPPORTUNITIES.filter((o) => ["Duplicate Subscription", "Unused Software Seat", "Technology Consolidation"].includes(o.category));
    case "Tax Review":
      return OPPORTUNITIES.filter((o) => o.category === "Tax Review Opportunity");
    case "Owner/Entity":
      return OPPORTUNITIES.filter((o) => o.category === "Owner Transaction Review" || o.category === "Intercompany Correction");
    case "Completed":
      return OPPORTUNITIES.filter((o) => o.status === "Completed" || o.status === "Outcome Measured");
    case "Dismissed":
      return OPPORTUNITIES.filter((o) => o.status === "Dismissed");
  }
}

export const OPP_KPI_TOTALS = {
  identified: OPPORTUNITIES.reduce((s, o) => s + o.financialImpact, 0),
  highConfidence: OPPORTUNITIES.filter((o) => o.confidence >= 80).reduce((s, o) => s + o.financialImpact, 0),
  revenue: OPPORTUNITIES.filter((o) => o.impactType === "Revenue").reduce((s, o) => s + o.financialImpact, 0),
  cost: OPPORTUNITIES.filter((o) => o.impactType === "Cost").reduce((s, o) => s + o.financialImpact, 0),
  margin: OPPORTUNITIES.filter((o) => o.impactType === "Margin").reduce((s, o) => s + o.financialImpact, 0),
  cash: OPPORTUNITIES.filter((o) => o.impactType === "Cash").reduce((s, o) => s + o.financialImpact, 0),
  growth: OPPORTUNITIES.filter((o) => o.impactType === "Growth").reduce((s, o) => s + o.financialImpact, 0),
  open: OPPORTUNITIES.filter((o) => !["Completed", "Outcome Measured", "Dismissed"].includes(o.status)).length,
  accepted: OPPORTUNITIES.filter((o) => o.status === "Accepted" || o.status === "Approved" || o.status === "In Progress").length,
  realized: OPPORTUNITIES.reduce((s, o) => s + (o.actualRealized ?? 0), 0),
};

export const ASK_LEDGEROS_OPPORTUNITIES = [
  "What is the highest-value opportunity?",
  "Which opportunities are quick wins?",
  "What can improve cash this month?",
  "Where are we losing margin?",
];
