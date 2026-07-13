/**
 * Project APEX — Executive Workspace demonstration data.
 * All numbers and text are illustrative. No backend, no live inference.
 */

export type WorkspaceThemeId = "money" | "growth" | "people" | "company";

export type WorkspaceTheme = {
  id: WorkspaceThemeId;
  title: string;
  question: string;
  eyebrow: string;
  /** Tailwind gradient class used across hero + accents. */
  gradient: string;
  /** Soft tint gradient for cards. */
  soft: string;
  /** Accent hex used inline for charts / glows. */
  accent: string;
  accentSoft: string;
  /** Highlighted word inside title. */
  highlight?: string;
};

export type WorkspaceMetric = {
  label: string;
  value: string;
  delta?: string;
  tone?: "up" | "down" | "flat";
  hint?: string;
};

export type WorkspaceSection = {
  id: string;
  title: string;
  value?: string;
  delta?: string;
  tone?: "up" | "down" | "flat";
  caption: string;
};

export type WorkspaceRecommendation = {
  id: string;
  title: string;
  body: string;
  impact: string;
  confidence: number;
  action: string;
};

export type WorkspaceTimelineEntry = {
  when: string;
  label: string;
  detail: string;
  tone?: "positive" | "warning" | "neutral";
};

export type WorkspaceInsight = {
  label: string;
  detail: string;
};

export type WorkspaceQuickAction = { label: string };

export type WorkspaceAdvisor = {
  name: string;
  role: string;
  greeting: string;
  bullets: string[];
  prompts: string[];
};

export type WorkspaceDefinition = {
  theme: WorkspaceTheme;
  summary: string;
  health: { score: number; label: string; confidence: number; freshness: string };
  priorities: string[];
  metrics: WorkspaceMetric[];
  sections: WorkspaceSection[];
  recommendations: WorkspaceRecommendation[];
  timeline: WorkspaceTimelineEntry[];
  insights: WorkspaceInsight[];
  quickActions: WorkspaceQuickAction[];
  advisor: WorkspaceAdvisor;
};

/* ------------------------------------------------------------------ */
/* MONEY                                                              */
/* ------------------------------------------------------------------ */

export const MONEY_WORKSPACE: WorkspaceDefinition = {
  theme: {
    id: "money",
    title: "Money Workspace",
    highlight: "Money",
    eyebrow: "Executive Workspace · Cash & Capital",
    question: "Can we spend? Where is our money and where is it going?",
    gradient: "from-sky-500 via-blue-600 to-cyan-500",
    soft: "from-sky-50 via-white to-cyan-50 dark:from-sky-950/40 dark:via-slate-950 dark:to-cyan-950/40",
    accent: "#0ea5e9",
    accentSoft: "rgba(14,165,233,0.14)",
  },
  summary:
    "Liquidity is healthy — $2.41M truly available with 8.4 months of runway. Collections improved 12% week-over-week. Payables are on track; no cash controls tripped in the last 24h.",
  health: { score: 87, label: "Healthy", confidence: 92, freshness: "Updated 4 min ago" },
  priorities: [
    "Approve $184K vendor batch — cutoff 4:00 PM",
    "Review $92K profit transfer to reserve account",
    "Investigate $12.4K subscription anomaly (Adobe cluster)",
  ],
  metrics: [
    { label: "True Available Cash", value: "$2.41M", delta: "+3.2%", tone: "up", hint: "After reserves & obligations" },
    { label: "Cash Runway", value: "8.4 mo", delta: "+0.3 mo", tone: "up" },
    { label: "Net Profit MTD", value: "$412K", delta: "+8.1%", tone: "up" },
    { label: "Collections DSO", value: "27 d", delta: "-3 d", tone: "up", hint: "Lower is better" },
    { label: "Payables Due 7d", value: "$318K", delta: "flat", tone: "flat" },
  ],
  sections: [
    { id: "cash-pulse", title: "Cash Pulse™", value: "$2.41M available", caption: "3 pods — Operating · Reserve · Growth" },
    { id: "revenue", title: "Revenue", value: "$1.82M MTD", delta: "+11.4%", tone: "up", caption: "Pacing above forecast" },
    { id: "profit", title: "Profit", value: "$412K MTD", delta: "+8.1%", tone: "up", caption: "Margin 22.6%" },
    { id: "collections", title: "Collections", value: "$986K in transit", delta: "+12%", tone: "up", caption: "27-day DSO" },
    { id: "payables", title: "Payables", value: "$318K due 7d", caption: "82 open bills, 6 awaiting approval" },
    { id: "forecast", title: "Cash Forecast", value: "$3.02M in 30d", caption: "Confidence 91%" },
    { id: "banking", title: "Banking", value: "9 accounts", caption: "All reconciled through yesterday" },
    { id: "check-writing", title: "Check Writing", value: "12 pending", caption: "Batch cutoff 4:00 PM" },
    { id: "invoices", title: "Invoices", value: "146 open", caption: "$1.24M outstanding" },
    { id: "expenses", title: "Expenses", value: "$92K MTD", caption: "Down 6% vs prior month" },
    { id: "reserved", title: "Reserved Funds", value: "$640K", caption: "Tax · Payroll · Buffer" },
    { id: "pass-through", title: "Pass-Through", value: "$118K", caption: "3 client escrows active" },
    { id: "allocation", title: "Revenue Allocation", value: "3 rules live", caption: "Auto-splitting on deposit" },
    { id: "profit-sharing", title: "Profit Sharing", value: "$74K accrued", caption: "Q3 pool building" },
    { id: "investor", title: "Investor Distribution", value: "$220K scheduled", caption: "Sept 30 · 4 partners" },
    { id: "owner-draws", title: "Owner Draws", value: "$60K YTD", caption: "Under plan by $18K" },
    { id: "taxes", title: "Taxes", value: "$164K reserved", caption: "Q3 estimated ready" },
    { id: "budget-health", title: "Budget Health", value: "94% aligned", caption: "2 categories over" },
    { id: "expense-intel", title: "Expense Intelligence", value: "3 anomalies", caption: "Requires review" },
    { id: "subs", title: "Subscription Intelligence", value: "42 active", caption: "6 unused > 60d" },
    { id: "travel", title: "Travel Spend", value: "$18K MTD", caption: "Down 22% vs plan" },
    { id: "marketing", title: "Marketing Spend", value: "$88K MTD", caption: "ROI 4.2×" },
    { id: "tech", title: "Tech Spend", value: "$42K MTD", caption: "AI portfolio +18%" },
    { id: "payroll", title: "Payroll", value: "$421K next run", caption: "9 days out — funded" },
    { id: "alerts", title: "Smart Cash Alerts", value: "2 active", caption: "None critical" },
  ],
  recommendations: [
    {
      id: "r1",
      title: "Transfer $92K to Reserve Pod",
      body: "Operating balance exceeds 60-day buffer target by $92K. Moving now preserves runway without disrupting payables.",
      impact: "+0.4 months runway",
      confidence: 94,
      action: "Prepare transfer",
    },
    {
      id: "r2",
      title: "Cancel 4 unused subscriptions",
      body: "Adobe, Zoom, Notion, Loom seats unused > 90 days across 3 users.",
      impact: "-$2,180/mo",
      confidence: 88,
      action: "Open cleanup",
    },
    {
      id: "r3",
      title: "Accelerate collections on 3 clients",
      body: "Three clients aged 45-60d — send AI-drafted reminders with payment plan.",
      impact: "+$184K in 10d",
      confidence: 81,
      action: "Draft messages",
    },
  ],
  timeline: [
    { when: "08:42", label: "Deposit received", detail: "Acme Corp — $84,200", tone: "positive" },
    { when: "09:15", label: "Bill queued", detail: "AWS — $12,410", tone: "neutral" },
    { when: "10:04", label: "Anomaly flagged", detail: "Duplicate Adobe seats — $1,180", tone: "warning" },
    { when: "11:30", label: "Approval requested", detail: "Vendor batch — $184K", tone: "neutral" },
    { when: "13:12", label: "Reserve refill", detail: "Tax pod +$18K", tone: "positive" },
  ],
  insights: [
    { label: "Runway sensitivity", detail: "A $50K/mo overhead cut extends runway by 0.6 months." },
    { label: "Payables timing", detail: "Delaying non-strategic bills 5 days preserves $92K in float." },
    { label: "Revenue concentration", detail: "Top 3 clients now 41% of MRR — up from 36%." },
  ],
  quickActions: [
    { label: "Write Check" },
    { label: "Pay Bills" },
    { label: "Transfer Funds" },
    { label: "Invoice Client" },
    { label: "Approve Expense" },
    { label: "Approve Payroll" },
    { label: "Approve Commission" },
    { label: "Transfer Profit" },
    { label: "Generate Executive Report" },
  ],
  advisor: {
    name: "Cash Advisor",
    role: "Money · Specialist AI",
    greeting: "Cash is healthy — three actions unlock $186K of value today.",
    bullets: [
      "Reserve pod is 8% under target. Suggest $92K transfer.",
      "Two vendor invoices exceed contract ceiling by $6.4K.",
      "Subscription cluster on Adobe shows 4 duplicate seats.",
    ],
    prompts: [
      "What can we safely spend this week?",
      "Where is money leaking right now?",
      "What happens if we delay payroll funding 2 days?",
      "Draft a 30-day cash forecast for the board.",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* GROWTH                                                             */
/* ------------------------------------------------------------------ */

export const GROWTH_WORKSPACE: WorkspaceDefinition = {
  theme: {
    id: "growth",
    title: "Growth Workspace",
    highlight: "Growth",
    eyebrow: "Executive Workspace · Revenue & Expansion",
    question: "How do we grow — and where is the next dollar coming from?",
    gradient: "from-violet-500 via-fuchsia-500 to-emerald-500",
    soft: "from-violet-50 via-white to-emerald-50 dark:from-violet-950/40 dark:via-slate-950 dark:to-emerald-950/40",
    accent: "#8b5cf6",
    accentSoft: "rgba(139,92,246,0.14)",
  },
  summary:
    "Pipeline is 1.4× coverage on Q4 target. Marketing ROI held at 4.2×; 3 upsell paths totaling $284K ARR are ready. Two leakage points cost roughly $28K MRR last month.",
  health: { score: 82, label: "Momentum building", confidence: 89, freshness: "Updated 6 min ago" },
  priorities: [
    "Approve pricing lift on tier B — $46K ARR uplift",
    "Launch reactivation to 41 dormant accounts",
    "Fix invoice miscoding — $28K MRR leakage stream",
  ],
  metrics: [
    { label: "ARR", value: "$21.6M", delta: "+9.4%", tone: "up" },
    { label: "Pipeline Coverage", value: "1.42×", delta: "+0.11×", tone: "up" },
    { label: "Marketing ROI", value: "4.2×", delta: "+0.3×", tone: "up" },
    { label: "Net Revenue Retention", value: "112%", delta: "+3pt", tone: "up" },
    { label: "Revenue Leakage", value: "$28K/mo", delta: "-", tone: "down", hint: "Actively closing" },
  ],
  sections: [
    { id: "marketing-roi", title: "Marketing ROI", value: "4.2×", tone: "up", caption: "Blended across 6 channels" },
    { id: "revenue-growth", title: "Revenue Growth", value: "+11.4% MoM", tone: "up", caption: "Above plan" },
    { id: "pipeline", title: "Sales Pipeline", value: "$8.4M open", caption: "1.42× coverage" },
    { id: "customers", title: "Customers", value: "612 active", delta: "+18", tone: "up", caption: "Logo growth 3.1%" },
    { id: "products", title: "Products", value: "9 lines", caption: "2 exceeding forecast" },
    { id: "services", title: "Services", value: "$4.2M MTD", caption: "62% margin" },
    { id: "expansion", title: "Expansion", value: "$284K ARR ready", caption: "3 upsell paths" },
    { id: "campaigns", title: "Campaigns", value: "6 live", caption: "Best: Winback — 6.1×" },
    { id: "pricing", title: "Pricing Intelligence", value: "Under-priced 2 tiers", caption: "Elasticity study ready" },
    { id: "upsells", title: "Upsells", value: "12 signals", caption: "$164K ARR potential" },
    { id: "renewals", title: "Renewals", value: "94% next 60d", caption: "3 at risk" },
    { id: "lost-revenue", title: "Lost Revenue", value: "$74K last 30d", caption: "Recoverable: 41%" },
    { id: "lead-quality", title: "Lead Quality", value: "72 MQL score", caption: "Up from 68" },
    { id: "sales-perf", title: "Sales Performance", value: "84% quota", caption: "Top rep at 141%" },
    { id: "revenue-leakage", title: "Revenue Leakage", value: "2 streams", caption: "$28K MRR at risk" },
    { id: "forecast", title: "Forecast", value: "$24.1M ARR EOY", caption: "Confidence 86%" },
    { id: "ai-opps", title: "AI Growth Opportunities", value: "7 open", caption: "3 high-signal" },
    { id: "market-exp", title: "Market Expansion", value: "2 regions ready", caption: "EU + CA" },
    { id: "competitive", title: "Competitive Position", value: "Strong · Segment 2", caption: "3 competitors tracked" },
    { id: "cltv", title: "Client Lifetime Value", value: "$182K avg", delta: "+9%", tone: "up", caption: "Cohort 2024 leading" },
    { id: "acq-readiness", title: "Acquisition Readiness", value: "Green", caption: "2 targets pre-qualified" },
    { id: "opps-engine", title: "Opportunity Engine", value: "7 recommendations", caption: "Auto-generated" },
  ],
  recommendations: [
    {
      id: "g1",
      title: "Lift tier B pricing 6%",
      body: "Elasticity study shows minimal churn risk. Applies at renewal.",
      impact: "+$46K ARR",
      confidence: 87,
      action: "Preview impact",
    },
    {
      id: "g2",
      title: "Reactivate 41 dormant accounts",
      body: "Accounts idle 90+ days match recent winback ICP.",
      impact: "+$118K ARR",
      confidence: 79,
      action: "Launch sequence",
    },
    {
      id: "g3",
      title: "Close two leakage streams",
      body: "Invoice miscoding + underbilled overage — recover $28K MRR going forward.",
      impact: "+$336K ARR",
      confidence: 93,
      action: "Fix invoicing",
    },
  ],
  timeline: [
    { when: "Mon", label: "New logo closed", detail: "Northwind Bio — $84K ACV", tone: "positive" },
    { when: "Tue", label: "Campaign launched", detail: "Winback wave 3 — 41 accounts", tone: "neutral" },
    { when: "Wed", label: "Churn signal", detail: "Cohort 22 — 2 accounts at risk", tone: "warning" },
    { when: "Thu", label: "Upsell won", detail: "Vertex — +$18K MRR", tone: "positive" },
    { when: "Fri", label: "Pricing test ready", detail: "Tier B elasticity study", tone: "neutral" },
  ],
  insights: [
    { label: "Compounding effect", detail: "A 6% pricing lift + churn hold = +$720K ARR over 12 months." },
    { label: "Best channel", detail: "Referral partners returned 6.1× ROI — reallocate 15% budget from paid social." },
    { label: "Retention driver", detail: "Onboarding NPS > 8 correlates with 22% higher 12-month retention." },
  ],
  quickActions: [
    { label: "Create Campaign" },
    { label: "Run Forecast" },
    { label: "Price Analysis" },
    { label: "Expansion Analysis" },
    { label: "AI Growth Brief" },
  ],
  advisor: {
    name: "Growth Advisor",
    role: "Growth · Specialist AI",
    greeting: "Momentum is building. Three moves would add $500K ARR in the next 90 days.",
    bullets: [
      "Tier B pricing is measurably under market.",
      "41 dormant accounts fit a proven winback profile.",
      "Two invoice leakage streams are recoverable this month.",
    ],
    prompts: [
      "What is my highest-leverage growth move today?",
      "Where am I leaving revenue on the table?",
      "Which clients are at risk of churn in 60 days?",
      "Draft an expansion plan for the EU market.",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* PEOPLE                                                             */
/* ------------------------------------------------------------------ */

export const PEOPLE_WORKSPACE: WorkspaceDefinition = {
  theme: {
    id: "people",
    title: "People Workspace",
    highlight: "People",
    eyebrow: "Executive Workspace · Team & Performance",
    question: "Are our people healthy, productive, and fairly rewarded?",
    gradient: "from-rose-500 via-pink-500 to-orange-400",
    soft: "from-rose-50 via-white to-orange-50 dark:from-rose-950/40 dark:via-slate-950 dark:to-orange-950/40",
    accent: "#f43f5e",
    accentSoft: "rgba(244,63,94,0.14)",
  },
  summary:
    "Team utilization is 82% — inside healthy band. Two commission disputes need review; recognition budget is 34% underused. Payroll is funded and ADP is synced.",
  health: { score: 79, label: "Steady", confidence: 86, freshness: "Updated 8 min ago" },
  priorities: [
    "Approve $28K commission run — 14 participants",
    "Resolve 2 commission disputes (Q3)",
    "Approve manager recognition batch — $4.6K",
  ],
  metrics: [
    { label: "Headcount", value: "68", delta: "+3", tone: "up" },
    { label: "Utilization", value: "82%", delta: "+2pt", tone: "up" },
    { label: "Payroll Next Run", value: "$421K", delta: "flat", tone: "flat", hint: "9 days out" },
    { label: "Attrition (TTM)", value: "6.4%", delta: "-1.1pt", tone: "up", hint: "Lower is better" },
    { label: "Recognition Budget", value: "$14.8K left", delta: "-", tone: "flat", hint: "Underused 34%" },
  ],
  sections: [
    { id: "payroll", title: "Payroll", value: "$421K next run", caption: "Funded · 9 days out" },
    { id: "commissions", title: "Commissions", value: "$28K queued", caption: "14 participants" },
    { id: "bonuses", title: "Bonuses", value: "$74K accrued", caption: "Q3 pool building" },
    { id: "profit-sharing", title: "Profit Sharing", value: "$62K accrued", caption: "12 eligible" },
    { id: "benefits", title: "Benefits", value: "$38K/mo", caption: "Renewal in 45 days" },
    { id: "travel", title: "Travel", value: "$18K MTD", caption: "Down 22% vs plan" },
    { id: "education", title: "Education", value: "$6.4K MTD", caption: "3 team members active" },
    { id: "recognition", title: "Employee Recognition", value: "$14.8K left", caption: "Underused 34%" },
    { id: "performance", title: "Performance", value: "84% on track", caption: "Reviews cycle in 21d" },
    { id: "hiring", title: "Hiring", value: "5 open roles", caption: "2 in final round" },
    { id: "capacity", title: "Capacity", value: "82% utilized", caption: "Healthy band" },
    { id: "utilization", title: "Utilization", value: "82%", caption: "Rolling 4 weeks" },
    { id: "intl", title: "International Staff", value: "9 members", caption: "3 countries" },
    { id: "consultants", title: "Consultants", value: "6 active", caption: "$32K MTD" },
    { id: "contractors", title: "Contractors", value: "11 active", caption: "$46K MTD" },
    { id: "appreciation", title: "Appreciation Budget", value: "$8.2K left", caption: "Q3 tracker" },
    { id: "events", title: "Events", value: "2 upcoming", caption: "All-hands + offsite" },
    { id: "trips", title: "Company Trips", value: "$62K planned", caption: "Q4 offsite" },
    { id: "reimbursements", title: "Reimbursements", value: "18 pending", caption: "$8.4K queued" },
    { id: "adp", title: "ADP Status", value: "Synced", caption: "Last sync 2 min ago" },
    { id: "advisor", title: "AI Workforce Advisor", value: "3 signals", caption: "1 retention, 2 capacity" },
  ],
  recommendations: [
    {
      id: "p1",
      title: "Rebalance capacity — 2 accounts",
      body: "Two team members trending toward 100% utilization for 3+ weeks — reassign work.",
      impact: "Reduce burnout risk",
      confidence: 84,
      action: "Open plan",
    },
    {
      id: "p2",
      title: "Deploy $8K recognition batch",
      body: "12 team members hit performance markers this quarter with no visible recognition.",
      impact: "+9pt engagement",
      confidence: 78,
      action: "Preview batch",
    },
    {
      id: "p3",
      title: "Fast-track 2 hires",
      body: "Roles open 45+ days — top candidates in final round. Delay costs $12K/mo in contractor spend.",
      impact: "-$24K contractor spend",
      confidence: 82,
      action: "Advance offers",
    },
  ],
  timeline: [
    { when: "Mon", label: "New hire started", detail: "Sr. Engineer — Team Vertex", tone: "positive" },
    { when: "Tue", label: "Commission dispute filed", detail: "Q3 attribution — 1 seller", tone: "warning" },
    { when: "Wed", label: "Reviews scheduled", detail: "42 cycles auto-drafted", tone: "neutral" },
    { when: "Thu", label: "Recognition sent", detail: "6 team members — $2.4K", tone: "positive" },
    { when: "Fri", label: "Capacity alert", detail: "2 members trending overloaded", tone: "warning" },
  ],
  insights: [
    { label: "Retention leverage", detail: "Team members receiving quarterly recognition churn 3.4× less." },
    { label: "Hiring math", detail: "Every week of delay on the two open roles equals $3K in contractor premium." },
    { label: "Bonus fairness", detail: "Q3 attribution shows 2 outlier splits — recommend review before payout." },
  ],
  quickActions: [
    { label: "Approve Payroll" },
    { label: "Run Bonus Preview" },
    { label: "Approve Commission" },
    { label: "Approve Reimbursement" },
    { label: "Recognize Employee" },
  ],
  advisor: {
    name: "People Advisor",
    role: "People · Specialist AI",
    greeting: "The team is healthy. Two actions materially reduce risk this week.",
    bullets: [
      "Two members are trending overloaded — rebalance suggested.",
      "Recognition budget is materially underused vs plan.",
      "Two commission disputes need review before payout run.",
    ],
    prompts: [
      "Who is at risk of burnout this month?",
      "How does our comp compare to market?",
      "Who should we recognize this quarter?",
      "Draft a capacity plan for Q4.",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* COMPANY                                                            */
/* ------------------------------------------------------------------ */

export const COMPANY_WORKSPACE: WorkspaceDefinition = {
  theme: {
    id: "company",
    title: "Company Workspace",
    highlight: "Company",
    eyebrow: "Executive Workspace · Enterprise & Governance",
    question: "How healthy is the business — and what protects its future?",
    gradient: "from-slate-800 via-indigo-800 to-amber-500",
    soft: "from-slate-50 via-white to-amber-50 dark:from-slate-950 dark:via-indigo-950/40 dark:to-amber-950/30",
    accent: "#f59e0b",
    accentSoft: "rgba(245,158,11,0.14)",
  },
  summary:
    "Company health index at 88. Two entities filed compliance on time; AI portfolio consolidation would save $6.2K/mo. Legal calendar has 3 items due in 30 days.",
  health: { score: 88, label: "Resilient", confidence: 91, freshness: "Updated 12 min ago" },
  priorities: [
    "Review AI portfolio consolidation — $6.2K/mo savings",
    "Approve Q3 board packet — draft ready",
    "Renew commercial insurance — 22 days to expiry",
  ],
  metrics: [
    { label: "Company Health", value: "88", delta: "+2", tone: "up" },
    { label: "Entities", value: "4 active", delta: "flat", tone: "flat" },
    { label: "Compliance", value: "97% on time", delta: "+1pt", tone: "up" },
    { label: "AI Spend", value: "$14.2K/mo", delta: "+18%", tone: "up", hint: "Rising fast" },
    { label: "Risk Score", value: "Low", delta: "-", tone: "flat" },
  ],
  sections: [
    { id: "owners", title: "Owners", value: "3 principals", caption: "Cap table stable" },
    { id: "investors", title: "Investors", value: "6 on record", caption: "Q3 update sent" },
    { id: "partners", title: "Strategic Partners", value: "8 active", caption: "2 renewals in 60d" },
    { id: "affiliates", title: "Affiliates", value: "14 active", caption: "Top affiliate 22% of leads" },
    { id: "legal", title: "Legal", value: "3 items 30d", caption: "1 contract, 2 filings" },
    { id: "compliance", title: "Compliance", value: "97% on time", caption: "1 filing 8 days out" },
    { id: "taxes", title: "Taxes", value: "$164K reserved", caption: "Q3 estimated ready" },
    { id: "technology", title: "Technology", value: "62 systems", caption: "9 core · 12 fringe" },
    { id: "ai-spend", title: "AI Spend", value: "$14.2K/mo", delta: "+18%", tone: "up", caption: "8 vendors" },
    { id: "assets", title: "Assets", value: "$1.42M NBV", caption: "Depreciation on track" },
    { id: "insurance", title: "Insurance", value: "6 policies", caption: "Commercial renews in 22d" },
    { id: "entities", title: "Entities", value: "4 active", caption: "US · CA · UK · SG" },
    { id: "research", title: "Research", value: "3 workstreams", caption: "Innovation runway 6 mo" },
    { id: "automation", title: "Automation", value: "148 rules", caption: "18 saved this month" },
    { id: "integrations", title: "Integrations", value: "34 live", caption: "All healthy" },
    { id: "security", title: "Security", value: "SOC 2 in progress", caption: "82% controls complete" },
    { id: "parent", title: "Parent Company", value: "N/A", caption: "Independent" },
    { id: "subs", title: "Subsidiaries", value: "2", caption: "US ops + UK sales" },
    { id: "sisters", title: "Sister Companies", value: "1", caption: "Shared ownership" },
    { id: "risk", title: "Risk Radar", value: "3 tracked", caption: "1 amber, 2 green" },
    { id: "innovation", title: "Innovation Tracker", value: "5 bets", caption: "2 near production" },
    { id: "twin", title: "Digital Twin", value: "Live", caption: "Model at 91% confidence" },
    { id: "graph", title: "Relationship Graph", value: "Live", caption: "612 nodes, 3.2K edges" },
  ],
  recommendations: [
    {
      id: "c1",
      title: "Consolidate AI vendor portfolio",
      body: "Three overlapping LLM subscriptions can be merged onto one master account.",
      impact: "-$6.2K/mo",
      confidence: 92,
      action: "Open review",
    },
    {
      id: "c2",
      title: "Advance SOC 2 completion",
      body: "18 controls remain — two block enterprise deals worth $340K ARR.",
      impact: "+$340K ARR unlock",
      confidence: 88,
      action: "See gap plan",
    },
    {
      id: "c3",
      title: "Renegotiate commercial insurance",
      body: "Market rates fell 8% since last renewal — quote 3 carriers before expiry.",
      impact: "-$9.2K/yr",
      confidence: 74,
      action: "Request quotes",
    },
  ],
  timeline: [
    { when: "Q3-01", label: "Board packet drafted", detail: "12 sections auto-assembled", tone: "positive" },
    { when: "Q3-02", label: "SOC 2 milestone", detail: "82% controls complete", tone: "positive" },
    { when: "Q3-03", label: "Vendor overlap flagged", detail: "AI portfolio — $6.2K/mo", tone: "warning" },
    { when: "Q3-04", label: "Insurance quote due", detail: "22 days to expiry", tone: "warning" },
    { when: "Q3-05", label: "Innovation review", detail: "5 bets · 2 near production", tone: "neutral" },
  ],
  insights: [
    { label: "AI cost curve", detail: "AI spend growing 18% MoM — outpacing gross margin growth by 11pt." },
    { label: "Compliance leverage", detail: "Closing SOC 2 unlocks 2 enterprise deals worth $340K ARR." },
    { label: "Entity structure", detail: "UK sub tax exposure drops 6% with a Q4 elective filing." },
  ],
  quickActions: [
    { label: "Open Digital Twin" },
    { label: "Review Technology" },
    { label: "Review AI Spend" },
    { label: "Run Risk Report" },
    { label: "Generate Board Report" },
  ],
  advisor: {
    name: "Executive Advisor",
    role: "Company · Specialist AI",
    greeting: "The company is resilient. Three governance actions protect and unlock value.",
    bullets: [
      "AI vendor overlap is the fastest cost win — $6.2K/mo.",
      "Two SOC 2 controls block $340K in pipeline.",
      "Insurance renewal window opens with rates down 8%.",
    ],
    prompts: [
      "What are the top risks to the business right now?",
      "Where can we cut $10K/mo of overhead safely?",
      "Draft a board update for this quarter.",
      "Model the impact of closing SOC 2 next month.",
    ],
  },
};

export const APEX_WORKSPACES: Record<WorkspaceThemeId, WorkspaceDefinition> = {
  money: MONEY_WORKSPACE,
  growth: GROWTH_WORKSPACE,
  people: PEOPLE_WORKSPACE,
  company: COMPANY_WORKSPACE,
};
