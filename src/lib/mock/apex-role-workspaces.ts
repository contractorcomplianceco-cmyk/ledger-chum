/**
 * Role workspace demonstration data — Project APEX Phase G.
 * All values are fictional. No production data, no real people.
 */

export type RoleKey = "rose" | "accounting" | "sales" | "operations" | "systems" | "team";

export type RoleMetric = {
  label: string;
  value: string;
  delta?: string;
  tone?: "up" | "down" | "flat";
  hint?: string;
  sensitive?: boolean;
};

export type RolePriority = {
  title: string;
  detail: string;
  urgency: "high" | "medium" | "low";
  requiresApproval?: boolean;
};

export type RoleRecommendation = {
  title: string;
  rationale: string;
  impact: string;
  confidence: number;
  approval: string;
};

export type RoleRisk = {
  title: string;
  category: string;
  severity: "high" | "medium" | "low";
  detail: string;
};

export type RoleOpportunity = {
  title: string;
  category: string;
  potential: string;
  detail: string;
};

export type RoleAdvisor = {
  persona: string;
  question: string;
  summary: string;
  actions: string[];
};

export type RoleQuickAction = { label: string; description?: string };

export type RoleWorkspace = {
  key: RoleKey;
  slug: string;
  name: string;
  title: string;
  subtitle: string;
  decisionQuestion: string;
  healthScore: { value: number; label: string; tone: "up" | "down" | "flat" };
  theme: { gradient: string; soft: string; accent: string };
  metrics: RoleMetric[];
  priorities: RolePriority[];
  recommendations: RoleRecommendation[];
  risks: RoleRisk[];
  opportunities: RoleOpportunity[];
  advisor: RoleAdvisor;
  quickActions: RoleQuickAction[];
  visibleModules: string[];
  hiddenModules: string[];
  sensitiveVisible: boolean;
};

export const ROLE_WORKSPACES: Record<RoleKey, RoleWorkspace> = {
  rose: {
    key: "rose",
    slug: "rose",
    name: "Rose · Owner",
    title: "Rose Executive Workspace",
    subtitle: "Run the company with signal, evidence, and next-best-action.",
    decisionQuestion: "Are we healthy, growing, and making the right decisions?",
    healthScore: { value: 87, label: "Strong", tone: "up" },
    theme: {
      gradient: "from-indigo-500 via-violet-500 to-cyan-500",
      soft: "from-slate-950 via-indigo-950 to-slate-900",
      accent: "text-cyan-300",
    },
    metrics: [
      { label: "Available Cash", value: "$1.82M", delta: "+$142K", tone: "up", hint: "After obligations & reserves" },
      { label: "Profit Pulse (30d)", value: "$284K", delta: "+11.4%", tone: "up" },
      { label: "Growth Pulse", value: "18.2%", delta: "+3.1 pts", tone: "up", hint: "Trailing quarter" },
      { label: "Risk Radar", value: "3 items", delta: "1 new", tone: "down" },
      { label: "Hiring Capacity", value: "4 seats", hint: "Funded through Q4" },
      { label: "Marketing ROI", value: "4.2x", delta: "+0.6x", tone: "up" },
    ],
    priorities: [
      { title: "Approve Q4 expansion plan", detail: "New market pilot — $340K allocated, 6-month payback modeled.", urgency: "high", requiresApproval: true },
      { title: "Review runway scenarios", detail: "Digital Twin suggests hire pause improves runway by 3.2 months.", urgency: "medium" },
      { title: "Board briefing draft", detail: "AI Executive Advisor prepared narrative — awaiting your review.", urgency: "medium" },
    ],
    recommendations: [
      { title: "Fund expansion pilot", rationale: "Positive unit economics; 92% modeled confidence.", impact: "+$1.1M ARR (12mo)", confidence: 0.82, approval: "Owner sign-off" },
      { title: "Hire 2 revenue engineers", rationale: "Backlog exceeds delivery capacity by 34%.", impact: "Recover $220K/qtr in leaked pipeline", confidence: 0.71, approval: "Owner + Sales lead" },
    ],
    risks: [
      { title: "Client concentration", category: "Revenue", severity: "medium", detail: "Top 3 clients = 41% of MRR. Diversify or contract-secure." },
      { title: "Vendor spend drift", category: "Cost", severity: "low", detail: "SaaS spend +14% QoQ without headcount growth." },
      { title: "AP aging bulge", category: "Cash", severity: "medium", detail: "$68K aging 45-60 days — review payment sequencing." },
    ],
    opportunities: [
      { title: "Renegotiate top vendor tier", category: "Cost", potential: "$38K/yr", detail: "Volume threshold now supports enterprise tier discount." },
      { title: "Repackage service bundles", category: "Revenue", potential: "$210K/yr", detail: "Pricing model shows 18% margin lift on bundled offering." },
    ],
    advisor: {
      persona: "LedgerOS Executive Advisor",
      question: "What should I prioritize this week?",
      summary: "Cash healthy, growth accelerating. Two decisions gate the quarter: expansion pilot approval and hiring sequence.",
      actions: ["Approve expansion pilot", "Review runway scenarios", "Generate board brief"],
    },
    quickActions: [
      { label: "Run Scenario" },
      { label: "Review Cash" },
      { label: "Review Profitability" },
      { label: "Review Opportunities" },
      { label: "Approve Decisions" },
      { label: "Generate Board Brief" },
    ],
    visibleModules: ["Company Health", "Cash", "Profit", "Growth", "Risk", "Opportunities", "Digital Twin", "Timeline", "Approvals"],
    hiddenModules: [],
    sensitiveVisible: true,
  },

  accounting: {
    key: "accounting",
    slug: "accounting",
    name: "Christin · Accounting Lead",
    title: "Accounting Workspace",
    subtitle: "Maintain financial accuracy — books accurate, controlled, and close-ready.",
    decisionQuestion: "Are the books accurate, controlled, and ready?",
    healthScore: { value: 78, label: "On Track", tone: "flat" },
    theme: {
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      soft: "from-slate-950 via-emerald-950 to-slate-900",
      accent: "text-emerald-300",
    },
    metrics: [
      { label: "Close Readiness", value: "78%", delta: "+12 pts", tone: "up", hint: "Day 4 of close cycle" },
      { label: "Banking Exceptions", value: "24", delta: "-8", tone: "up" },
      { label: "Uncategorized Txns", value: "17", tone: "flat" },
      { label: "Expense Approvals", value: "9 pending", tone: "down" },
      { label: "Comp Verification", value: "3 open", hint: "Attribution review" },
      { label: "Payroll / ADP Sync", value: "Healthy", tone: "up" },
    ],
    priorities: [
      { title: "Resolve 24 banking exceptions", detail: "8 auto-suggested matches ready for review.", urgency: "high" },
      { title: "Reconcile operating account", detail: "$412 variance — likely timing on 2 vendor payments.", urgency: "high" },
      { title: "Verify commission calculations", detail: "3 attribution reviews awaiting sign-off.", urgency: "medium" },
    ],
    recommendations: [
      { title: "Auto-apply 8 high-confidence matches", rationale: "≥95% confidence across all 8 suggested matches.", impact: "Clear 8 exceptions", confidence: 0.96, approval: "Controller review" },
      { title: "Extend pass-through reserve", rationale: "Reserve trending 6% below policy floor.", impact: "Restore compliance buffer", confidence: 0.88, approval: "Accounting lead" },
    ],
    risks: [
      { title: "Data quality drift", category: "Ledger", severity: "medium", detail: "12 vendor records missing tax classification." },
      { title: "Tax calendar item due", category: "Compliance", severity: "medium", detail: "State filing due in 9 days." },
      { title: "Audit trail gap", category: "Governance", severity: "low", detail: "2 journal entries missing supporting document link." },
    ],
    opportunities: [
      { title: "Reduce close cycle by 2 days", category: "Process", potential: "16 hrs/mo saved", detail: "Automating exception routing pattern from prior close." },
    ],
    advisor: {
      persona: "LedgerOS Controller",
      question: "What is incomplete for month-end?",
      summary: "Close is on track. Exception queue is the critical path — clear high-confidence matches first.",
      actions: ["Review exceptions", "Run close checklist", "Verify commissions"],
    },
    quickActions: [
      { label: "Review Exceptions" },
      { label: "Run Close Checklist" },
      { label: "Review Compensation" },
      { label: "Review Expenses" },
      { label: "Review Reconciliation" },
    ],
    visibleModules: ["Close", "Banking", "Ledger", "Expenses", "Compensation", "Payroll", "Tax Calendar", "Reserves", "Audit"],
    hiddenModules: ["Board Briefing", "Strategic Decisions"],
    sensitiveVisible: true,
  },

  sales: {
    key: "sales",
    slug: "sales",
    name: "Sales Leadership",
    title: "Sales Leadership Workspace",
    subtitle: "Grow revenue with attribution, pricing, and pipeline signal.",
    decisionQuestion: "Where is revenue coming from and where can we grow?",
    healthScore: { value: 82, label: "Growing", tone: "up" },
    theme: {
      gradient: "from-fuchsia-500 via-pink-500 to-orange-400",
      soft: "from-slate-950 via-fuchsia-950 to-slate-900",
      accent: "text-fuchsia-300",
    },
    metrics: [
      { label: "Pipeline", value: "$4.8M", delta: "+$620K", tone: "up" },
      { label: "New MRR (30d)", value: "$74K", delta: "+22%", tone: "up" },
      { label: "Renewal Rate", value: "94%", delta: "+2 pts", tone: "up" },
      { label: "Expansion", value: "$38K", tone: "up" },
      { label: "Marketing ROI", value: "4.2x", delta: "+0.6x", tone: "up" },
      { label: "Revenue Leakage", value: "$18K", tone: "down", hint: "Discount overrides" },
    ],
    priorities: [
      { title: "Review $340K stalled deals", detail: "5 opportunities aged 60+ days in negotiation stage.", urgency: "high" },
      { title: "Approve Q4 pricing pilot", detail: "Bundle test shows +18% attach rate.", urgency: "medium", requiresApproval: true },
      { title: "Attribution disputes", detail: "2 deals with contested credit assignment.", urgency: "medium" },
    ],
    recommendations: [
      { title: "Raise floor price on Tier 2", rationale: "Discount overrides drove $18K leak in 30d.", impact: "Recover ~$60K/qtr", confidence: 0.79, approval: "Sales lead + Owner" },
      { title: "Focus renewals on top 10 accounts", rationale: "84% of renewal revenue concentrated there.", impact: "Protect $1.2M ARR", confidence: 0.9, approval: "Sales lead" },
    ],
    risks: [
      { title: "Top-account renewal risk", category: "Revenue", severity: "high", detail: "Client A signals procurement review." },
      { title: "Attribution conflicts", category: "Compensation", severity: "medium", detail: "2 open disputes could shift $12K in commissions." },
    ],
    opportunities: [
      { title: "Repackage service bundles", category: "Pricing", potential: "$210K/yr", detail: "Higher-margin bundle tested successfully with 3 accounts." },
      { title: "Expand Client B footprint", category: "Expansion", potential: "$88K ARR", detail: "Usage exceeds tier — upgrade motion warranted." },
    ],
    advisor: {
      persona: "LedgerOS Revenue Architect",
      question: "Where are we leaking revenue?",
      summary: "Discount overrides on Tier 2 are the largest current leak. Top-account renewal risk is the biggest exposure.",
      actions: ["Review pricing", "Analyze attribution", "Forecast revenue"],
    },
    quickActions: [
      { label: "Review Pipeline" },
      { label: "Analyze Pricing" },
      { label: "View Attribution" },
      { label: "Forecast Revenue" },
      { label: "Review Opportunities" },
    ],
    visibleModules: ["Pipeline", "Revenue", "Attribution", "Commissions", "Marketing ROI", "Pricing"],
    hiddenModules: ["Payroll", "Vendor Spend", "Close", "Reconciliation"],
    sensitiveVisible: false,
  },

  operations: {
    key: "operations",
    slug: "operations",
    name: "Operations",
    title: "Operations Workspace",
    subtitle: "Execute efficiently — unblock, recover, and keep the machine running.",
    decisionQuestion: "Where are processes blocked or inefficient?",
    healthScore: { value: 74, label: "Attention", tone: "flat" },
    theme: {
      gradient: "from-amber-400 via-orange-500 to-rose-500",
      soft: "from-slate-950 via-amber-950 to-slate-900",
      accent: "text-amber-300",
    },
    metrics: [
      { label: "Open Tasks", value: "42", delta: "-6", tone: "up" },
      { label: "Exceptions", value: "11", delta: "+3", tone: "down" },
      { label: "Client Deadlines (7d)", value: "8" },
      { label: "Revenue Recovery", value: "$46K", hint: "Recoverable this month" },
      { label: "Vendor Issues", value: "4", tone: "down" },
      { label: "Automation Health", value: "97%", tone: "up" },
    ],
    priorities: [
      { title: "Recover $18K stuck invoice", detail: "Client B — 42 days aged, response received today.", urgency: "high" },
      { title: "Clear vendor issue #V-217", detail: "Duplicate invoice from vendor — dispute drafted.", urgency: "medium" },
      { title: "Onboard 2 new clients", detail: "Delivery kickoff scheduled Thursday.", urgency: "medium" },
    ],
    recommendations: [
      { title: "Auto-assign exception queue", rationale: "Owner workload skewed 3:1 vs teammates.", impact: "Cut resolution time 28%", confidence: 0.83, approval: "Ops lead" },
      { title: "Retire manual sync job", rationale: "Superseded by native integration 60 days ago.", impact: "Free 4 hrs/wk", confidence: 0.92, approval: "Ops lead" },
    ],
    risks: [
      { title: "Delivery capacity", category: "Process", severity: "medium", detail: "Backlog +18% vs 30d avg." },
      { title: "Integration flakiness", category: "Technology", severity: "low", detail: "3 retries this week on billing sync." },
    ],
    opportunities: [
      { title: "Batch reimbursement processing", category: "Automation", potential: "6 hrs/wk", detail: "Group weekly instead of daily." },
    ],
    advisor: {
      persona: "LedgerOS Operations Advisor",
      question: "What is blocking my team today?",
      summary: "Two bottlenecks: exception queue skew and vendor dispute. Both have clear resolution paths.",
      actions: ["Review exceptions", "Review tasks", "View recovery"],
    },
    quickActions: [
      { label: "Review Exceptions" },
      { label: "Review Tasks" },
      { label: "View Recovery" },
      { label: "Review Automation" },
    ],
    visibleModules: ["Tasks", "Exceptions", "Delivery", "Recovery", "Vendors", "Automation"],
    hiddenModules: ["Payroll", "Compensation Detail", "Investor Reporting"],
    sensitiveVisible: false,
  },

  systems: {
    key: "systems",
    slug: "systems",
    name: "Systems Reviewer",
    title: "Systems Reviewer Workspace",
    subtitle: "Keep systems connected, healthy, and secure.",
    decisionQuestion: "Are systems connected, healthy, and secure?",
    healthScore: { value: 91, label: "Healthy", tone: "up" },
    theme: {
      gradient: "from-cyan-400 via-blue-500 to-indigo-500",
      soft: "from-slate-950 via-cyan-950 to-slate-900",
      accent: "text-cyan-300",
    },
    metrics: [
      { label: "Integration Health", value: "97%", delta: "+1 pt", tone: "up" },
      { label: "API Errors (24h)", value: "3", tone: "flat" },
      { label: "Sync Failures", value: "0", tone: "up" },
      { label: "Data Quality", value: "94%", delta: "+2 pts", tone: "up" },
      { label: "AI Usage", value: "128 calls", hint: "Trailing 24h" },
      { label: "Security Events", value: "1 review", tone: "flat" },
    ],
    priorities: [
      { title: "Review vendor tax-class gaps", detail: "12 vendor records missing classification.", urgency: "medium" },
      { title: "Rotate expiring API credential", detail: "Integration X credential expires in 6 days.", urgency: "high" },
      { title: "Review AI usage cost curve", detail: "Trending 12% above prior 30-day baseline.", urgency: "low" },
    ],
    recommendations: [
      { title: "Add retry-with-backoff on billing sync", rationale: "3 retries/week — cheap resilience win.", impact: "Reduce sync failure risk", confidence: 0.9, approval: "Systems lead" },
      { title: "Enable SSO enforcement for admin", rationale: "Best-practice hardening — currently optional.", impact: "Reduce credential-risk surface", confidence: 0.95, approval: "Systems lead + Owner" },
    ],
    risks: [
      { title: "Credential expiry", category: "Security", severity: "high", detail: "Rotation window closes in 6 days." },
      { title: "Technical debt in sync job", category: "Reliability", severity: "medium", detail: "Legacy job scheduled for retirement." },
    ],
    opportunities: [
      { title: "Consolidate 2 overlapping tools", category: "Cost", potential: "$8K/yr", detail: "Overlap in monitoring stack — vendor bake-off ready." },
    ],
    advisor: {
      persona: "LedgerOS Risk Advisor",
      question: "What is my biggest system risk today?",
      summary: "Credential rotation is time-sensitive. Data quality is trending up — keep momentum on vendor classification cleanup.",
      actions: ["Review integrations", "Review errors", "Review data quality", "Review security"],
    },
    quickActions: [
      { label: "Review Integrations" },
      { label: "Review Errors" },
      { label: "Review Data Quality" },
      { label: "Review Security" },
    ],
    visibleModules: ["Integrations", "API Health", "Data Quality", "Automation Errors", "AI Usage", "Technology Spend (aggregate)", "Security"],
    hiddenModules: [
      "Employee Compensation",
      "Payroll Detail",
      "Individual Bonuses",
      "Private Financial Records",
    ],
    sensitiveVisible: false,
  },

  team: {
    key: "team",
    slug: "team",
    name: "Team Member",
    title: "My Workspace",
    subtitle: "Focus on what you own — tasks, expenses, and your compensation.",
    decisionQuestion: "What do I need to complete?",
    healthScore: { value: 100, label: "On Track", tone: "up" },
    theme: {
      gradient: "from-sky-400 via-teal-400 to-emerald-400",
      soft: "from-slate-950 via-sky-950 to-slate-900",
      accent: "text-sky-300",
    },
    metrics: [
      { label: "My Tasks", value: "6 open", delta: "-2", tone: "up" },
      { label: "My Expenses", value: "$412 pending", hint: "3 receipts" },
      { label: "Reimbursements", value: "$284 due", tone: "up" },
      { label: "Travel", value: "1 trip booked" },
      { label: "Education Budget", value: "$620 left", hint: "of $1,500 annual" },
      { label: "My Comp Statement", value: "Available", sensitive: true },
    ],
    priorities: [
      { title: "Submit last week's expenses", detail: "3 receipts scanned — waiting on submission.", urgency: "medium" },
      { title: "Complete security training", detail: "Due Friday — 25 minutes.", urgency: "medium" },
      { title: "Review compensation statement", detail: "Latest statement ready to view.", urgency: "low" },
    ],
    recommendations: [],
    risks: [],
    opportunities: [],
    advisor: {
      persona: "LedgerOS Executive Advisor",
      question: "What do I need to do today?",
      summary: "Two things: submit pending expenses and finish security training. Everything else is on track.",
      actions: ["Submit expenses", "Complete training", "View my statement"],
    },
    quickActions: [
      { label: "Submit Expenses" },
      { label: "View My Statement" },
      { label: "Book Travel" },
      { label: "Complete Training" },
    ],
    visibleModules: ["My Tasks", "My Expenses", "My Reimbursements", "My Travel", "My Education Budget", "My Compensation Statement", "My Approvals", "My Documents", "My Training"],
    hiddenModules: [
      "Company Financials",
      "Other Employee Compensation",
      "Investor Reporting",
      "Sensitive Companywide Reports",
    ],
    sensitiveVisible: false,
  },
};

export const ROLE_ORDER: RoleKey[] = ["rose", "accounting", "sales", "operations", "systems", "team"];

export function getRoleWorkspace(slug: string): RoleWorkspace | undefined {
  return ROLE_ORDER.map((k) => ROLE_WORKSPACES[k]).find((r) => r.slug === slug);
}
