// Central mock data source for the APEX Executive Home Workspace.
// UI Design Lab · Demonstration Data only.

import {
  Banknote,
  FileText,
  Landmark,
  Megaphone,
  Package,
  PiggyBank,
  Plane,
  Receipt,
  Repeat,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

export const APEX_HOME_GREETING = {
  firstName: "Rose",
  fullName: "Rose Taylor",
  role: "Founder & CEO",
  company: "Contractor Compliance Authority",
  greeting: "Good morning, Rose!",
  supporting: "Here's what's happening with Contractor Compliance Authority today.",
  compactLabel: { name: "Rose Taylor", role: "CEO" },
  decisionPrompt: "What requires your attention today?",
  date: "Monday, July 13, 2026",
  time: "8:42 AM CT",
};

export type ExecutiveKpi = {
  id: "cash" | "profit" | "collections" | "runway" | "health";
  label: string;
  value: string;
  supporting: string;
  trendDelta: number;
  trendSuffix?: string;
  invertTrend?: boolean;
  confidence: number;
  freshness: string;
  route: string;
  askPrompts: string[];
};

export const APEX_HOME_KPIS: ExecutiveKpi[] = [
  {
    id: "cash",
    label: "Cash Available",
    value: "$1.84M",
    supporting: "True available · after reserves",
    trendDelta: -6,
    confidence: 92,
    freshness: "Refreshed 4m ago",
    route: "/cash-availability",
    askPrompts: ["What can we safely spend today?", "Why is available cash lower?"],
  },
  {
    id: "profit",
    label: "Net Profit (MTD)",
    value: "$412K",
    supporting: "Operating profit · 17% margin",
    trendDelta: 8,
    confidence: 88,
    freshness: "Refreshed 1h ago",
    route: "/apex/financial-dna",
    askPrompts: ["Why did profit change?", "What lowered margin?"],
  },
  {
    id: "collections",
    label: "Collections (30D)",
    value: "$486K",
    supporting: "91% collected on time",
    trendDelta: -4,
    invertTrend: true,
    confidence: 87,
    freshness: "Refreshed 12m ago",
    route: "/invoicing",
    askPrompts: ["Who is overdue?", "What should we escalate today?"],
  },
  {
    id: "runway",
    label: "Runway",
    value: "142 days",
    supporting: "At current burn · $324K/mo",
    trendDelta: 6,
    confidence: 90,
    freshness: "Refreshed today 06:00",
    route: "/apex/digital-twin",
    askPrompts: ["Can we hire?", "Can we afford this decision?"],
  },
  {
    id: "health",
    label: "Financial Health",
    value: "A · 92",
    supporting: "Stress: Low · 12 pillars",
    trendDelta: 3,
    trendSuffix: " pts",
    confidence: 94,
    freshness: "Refreshed today 06:00",
    route: "/apex/company-health",
    askPrompts: ["What is unhealthy?", "What would raise our score?"],
  },
];

export const APEX_DECISION_STRIP = [
  { key: "priorities", label: "Priorities", value: 6, route: "/apex" },
  { key: "risks", label: "Risks", value: 3, route: "/apex/company-health" },
  { key: "opportunities", label: "Opportunities", value: 9, route: "/apex/opportunities" },
  { key: "approvals", label: "Approvals", value: 4, route: "/automation" },
  { key: "confidence", label: "Data Confidence", value: "94%", route: "/apex/company-health" },
];

export type ExecutiveCashSlice = { name: string; value: number; color: string };
export const APEX_CASH_PULSE = {
  trueAvailable: 1_840_000,
  totalCash: 2_612_400,
  forecast30d: 1_550_000,
  risk: "Two enterprise invoices at 43 days aging — $128K.",
  action: "Reallocate $95K to cover payables week of 7/20; escalate 2 aging AR.",
  confidence: 92,
  freshness: "Refreshed 4m ago",
  slices: [
    { name: "Available", value: 1_840_000, color: "#3b82f6" },
    { name: "Restricted", value: 412_300, color: "#8b5cf6" },
    { name: "Committed", value: 175_200, color: "#f97316" },
    { name: "Reserved", value: 184_900, color: "#06b6d4" },
  ] as ExecutiveCashSlice[],
};

export const APEX_PROFIT_PULSE = {
  gross: 1_128_000,
  operating: 412_000,
  net: 326_000,
  contribution: 486_000,
  margin: 17,
  trendDelta: 8,
  drivers: ["Enterprise renewals", "Campaign 18", "Texas expansion"],
  pressure: "Software cost inflation +$14K",
  action: "Approve renewal-uplift pricing for two mid-market clients.",
  confidence: 88,
  freshness: "Refreshed 1h ago",
  series: [
    { m: "Feb", value: 268_000 },
    { m: "Mar", value: 292_000 },
    { m: "Apr", value: 318_000 },
    { m: "May", value: 340_000 },
    { m: "Jun", value: 365_000 },
    { m: "Jul", value: 412_000 },
  ],
  milestone: { m: "Jul", label: "MTD" },
};

export type ExecRecommendation = {
  id: string;
  category: "Marketing" | "Cost" | "Vendor" | "Revenue";
  title: string;
  impact: string;
  confidence: number;
  evidence: number;
  action: string;
  approval: string;
};

export const APEX_RECOMMENDATIONS: ExecRecommendation[] = [
  {
    id: "rec-1",
    category: "Marketing",
    title: "Marketing Campaign 18 exceeding ROI target",
    impact: "+$41K contribution · scale +15% budget",
    confidence: 84,
    evidence: 6,
    action: "Scale Budget",
    approval: "CEO + CMO",
  },
  {
    id: "rec-2",
    category: "Cost",
    title: "Two subscription renewals overlap capability",
    impact: "~$38K annual savings",
    confidence: 78,
    evidence: 4,
    action: "Review",
    approval: "Controller",
  },
  {
    id: "rec-3",
    category: "Vendor",
    title: "Vendor consolidation opportunity identified",
    impact: "~$46K annual opportunity",
    confidence: 72,
    evidence: 8,
    action: "View Details",
    approval: "COO",
  },
  {
    id: "rec-4",
    category: "Revenue",
    title: "Missed markup on 3 invoices (Texas region)",
    impact: "$18.4K recoverable margin",
    confidence: 89,
    evidence: 3,
    action: "Review Invoices",
    approval: "Controller",
  },
];

export const APEX_BRIEFING = {
  title: "AI Briefing",
  subtitle: "Daily financial briefing · " + APEX_HOME_GREETING.date,
  greeting: "Good morning, Rose. Here's the shape of today.",
  insights: [
    { icon: "trend", text: "Revenue is up 14% MTD driven by renewals and enterprise clients." },
    { icon: "cash", text: "Cash remains strong with 142 days of runway at current burn." },
    { icon: "check", text: "Collections at 91% over the last 30 days — mid-market on time." },
    { icon: "spark", text: "Marketing Campaign 18 is outperforming target by 22%." },
    { icon: "alert", text: "Six priorities require attention today — 1 high severity." },
  ],
  confidence: 91,
  freshness: "Refreshed today 06:00",
};

export type ExecPriority = {
  id: string;
  title: string;
  due: string;
  severity: "High" | "Medium" | "Low";
  owner: string;
  route: string;
  impact?: string;
};

export const APEX_PRIORITIES: ExecPriority[] = [
  {
    id: "p1",
    title: "Review Q2 Forecast",
    due: "Today · 10:00 AM",
    severity: "High",
    owner: "Rose Taylor",
    route: "/apex/digital-twin",
    impact: "$1.2M revenue plan",
  },
  {
    id: "p2",
    title: "Approve Compensation Run",
    due: "Today · 2:00 PM",
    severity: "High",
    owner: "Rose Taylor",
    route: "/compensation",
    impact: "$142K",
  },
  {
    id: "p3",
    title: "Vendor Contract Renewal — CloudCore",
    due: "Tomorrow",
    severity: "Medium",
    owner: "COO",
    route: "/automation",
    impact: "$96K/yr",
  },
  {
    id: "p4",
    title: "Marketing Budget Review",
    due: "Wed",
    severity: "Medium",
    owner: "CMO",
    route: "/apex/opportunities",
  },
  {
    id: "p5",
    title: "Board Package Review",
    due: "Thu · 3:00 PM",
    severity: "Medium",
    owner: "Rose Taylor",
    route: "/apex/briefing",
  },
  {
    id: "p6",
    title: "Texas Expansion Analysis",
    due: "Fri",
    severity: "Low",
    owner: "Growth Lead",
    route: "/apex/opportunities",
    impact: "+$220K ARR",
  },
];

export const APEX_QUICK_ACTIONS = [
  {
    id: "invoice",
    label: "New Invoice",
    icon: FileText,
    tint: "from-blue-500 to-cyan-500",
    route: "/invoicing",
  },
  {
    id: "expense",
    label: "Record Expense",
    icon: Receipt,
    tint: "from-violet-500 to-fuchsia-500",
    route: "/expenses",
  },
  {
    id: "report",
    label: "Run Report",
    icon: Package,
    tint: "from-teal-500 to-emerald-500",
    route: "/intelligence",
  },
  {
    id: "check",
    label: "Write Check",
    icon: Wallet,
    tint: "from-orange-500 to-amber-500",
    route: "/banking",
  },
  {
    id: "transfer",
    label: "Transfer Funds",
    icon: Repeat,
    tint: "from-sky-500 to-indigo-500",
    route: "/cash-availability",
  },
  {
    id: "vendor",
    label: "Add Vendor",
    icon: ShoppingBag,
    tint: "from-rose-500 to-pink-500",
    route: "/automation",
  },
];

export const APEX_REVENUE_TREND = [
  { m: "Aug", value: 780 },
  { m: "Sep", value: 840 },
  { m: "Oct", value: 890 },
  { m: "Nov", value: 940 },
  { m: "Dec", value: 1020 },
  { m: "Jan", value: 1080 },
  { m: "Feb", value: 1140 },
  { m: "Mar", value: 1180 },
  { m: "Apr", value: 1250 },
  { m: "May", value: 1320 },
  { m: "Jun", value: 1390 },
  { m: "Jul", value: 1460, highlight: true as const },
];

export const APEX_REVENUE_TREND_TOTAL = "$1.46M MTD · +18.6% vs prior year";

export const APEX_REVENUE_DRIVERS = [
  { name: "Renewals", value: 612_000, color: "#3b82f6", delta: 8 },
  { name: "Texas Expansion", value: 188_000, color: "#06b6d4", delta: 22 },
  { name: "Enterprise Clients", value: 342_000, color: "#8b5cf6", delta: 12 },
  { name: "Campaign 18", value: 128_000, color: "#f97316", delta: 22 },
  { name: "Other", value: 190_000, color: "#94a3b8", delta: -3 },
];

export type ExpenseAnomaly = {
  id: string;
  category: string;
  vendor: string;
  amount: string;
  variance: string;
  period: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
};

export const APEX_ANOMALIES: ExpenseAnomaly[] = [
  {
    id: "a1",
    category: "Marketing",
    vendor: "Social advertising",
    amount: "$18,420",
    variance: "+62%",
    period: "vs 90-day avg",
    severity: "High",
    explanation: "Campaign 18 push above monthly plan; contribution ROI is positive.",
  },
  {
    id: "a2",
    category: "Infrastructure",
    vendor: "Cloud hosting",
    amount: "$9,240",
    variance: "+28%",
    period: "vs prior month",
    severity: "Medium",
    explanation: "New data warehouse tier plus increased egress from analytics load.",
  },
  {
    id: "a3",
    category: "Travel",
    vendor: "Travel — Texas",
    amount: "$6,180",
    variance: "+41%",
    period: "vs 90-day avg",
    severity: "Medium",
    explanation: "Two Texas expansion site visits and one client onsite.",
  },
];

export type TimelineEvent = {
  id: string;
  title: string;
  supporting: string;
  amount?: string;
  date: string;
  status: "Completed" | "Scheduled" | "Pending";
  icon: typeof Banknote;
  tone: "cash" | "profit" | "growth" | "attention" | "neutral";
  route: string;
};

export const APEX_TIMELINE: TimelineEvent[] = [
  {
    id: "t1",
    title: "Invoice Paid",
    supporting: "ALD Compliance Audit",
    amount: "+$12,500",
    date: "Jul 10",
    status: "Completed",
    icon: Banknote,
    tone: "cash",
    route: "/invoicing",
  },
  {
    id: "t2",
    title: "Compensation Run",
    supporting: "July commissions",
    amount: "$142K",
    date: "Jul 15",
    status: "Scheduled",
    icon: Users,
    tone: "attention",
    route: "/compensation",
  },
  {
    id: "t3",
    title: "Payroll Run",
    supporting: "Bi-weekly cycle",
    amount: "$186K",
    date: "Jul 16",
    status: "Scheduled",
    icon: PiggyBank,
    tone: "neutral",
    route: "/compensation",
  },
  {
    id: "t4",
    title: "Tax Payment",
    supporting: "Q2 federal estimated",
    amount: "$78K",
    date: "Jul 20",
    status: "Scheduled",
    icon: Landmark,
    tone: "attention",
    route: "/banking",
  },
  {
    id: "t5",
    title: "Board Meeting",
    supporting: "Quarterly review",
    date: "Jul 24",
    status: "Scheduled",
    icon: ShieldCheck,
    tone: "growth",
    route: "/apex/briefing",
  },
  {
    id: "t6",
    title: "Profit Share",
    supporting: "Team distribution",
    amount: "$96K",
    date: "Jul 31",
    status: "Pending",
    icon: Sparkles,
    tone: "profit",
    route: "/compensation",
  },
  {
    id: "t7",
    title: "Investor Payout",
    supporting: "Convertible interest",
    amount: "$54K",
    date: "Aug 5",
    status: "Pending",
    icon: Plane,
    tone: "profit",
    route: "/banking",
  },
  {
    id: "t8",
    title: "Campaign Renewal",
    supporting: "Campaign 18 continuation",
    amount: "$42K",
    date: "Aug 10",
    status: "Pending",
    icon: Megaphone,
    tone: "growth",
    route: "/apex/opportunities",
  },
];

export const APEX_ASK_PROMPTS = [
  "What should I focus on today?",
  "What changed financially since yesterday?",
  "What money can we safely spend?",
  "What is the largest current risk?",
  "Where are we leaking profit?",
  "Can we afford another employee?",
  "What decision has the highest financial impact?",
];
