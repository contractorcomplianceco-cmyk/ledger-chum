/**
 * AI Persona demonstration data — Project APEX Phase G.
 * All personas are advisory; no autonomous actions.
 */

export type PersonaKey =
  | "cfo"
  | "controller"
  | "revenue"
  | "growth"
  | "cash"
  | "operations"
  | "tax"
  | "risk"
  | "executive";

export type AIPersona = {
  key: PersonaKey;
  slug: string;
  name: string;
  tagline: string;
  purpose: string;
  intendedRoles: string[];
  allowedData: string[];
  restrictedData: string[];
  questions: string[];
  recommendations: string[];
  approvalRequired: string[];
  escalation: string;
  theme: { gradient: string; accent: string };
};

const GOV_CANNOT = [
  "Post transactions",
  "Approve payments",
  "Change permissions",
  "Modify payroll",
  "Approve compensation",
  "Move money",
  "Send invoices",
  "Delete records",
];

const GOV_CAN = [
  "Explain",
  "Summarize",
  "Recommend",
  "Forecast",
  "Prioritize",
  "Identify patterns",
];

export const AI_GOVERNANCE = { can: GOV_CAN, cannot: GOV_CANNOT };

export const AI_RESPONSE_CONTRACT = [
  "Answer",
  "Evidence",
  "Confidence",
  "Freshness",
  "Assumptions",
  "Missing data",
  "Impact",
  "Recommended action",
  "Required approval",
];

export const AI_PERSONAS: Record<PersonaKey, AIPersona> = {
  cfo: {
    key: "cfo",
    slug: "cfo",
    name: "LedgerOS CFO",
    tagline: "Strategic financial guidance for owner/executive decisions.",
    purpose: "Advise on hiring, expansion, prioritization, and overall financial health.",
    intendedRoles: ["Owner", "Sales Leadership"],
    allowedData: [
      "Company financial summaries",
      "Profitability",
      "Forecasts",
      "Cash",
      "Growth metrics",
    ],
    restrictedData: ["Individual payroll", "Personal HR records"],
    questions: [
      "Can we hire?",
      "Can we expand into a new market?",
      "What should we prioritize this quarter?",
      "What is our financial health today?",
    ],
    recommendations: ["Hiring cadence", "Investment sequencing", "Scenario framing"],
    approvalRequired: ["Owner sign-off on all strategic moves"],
    escalation: "Escalate irreversible financial decisions to owner + accountant of record.",
    theme: { gradient: "from-indigo-500 to-cyan-500", accent: "text-cyan-300" },
  },
  controller: {
    key: "controller",
    slug: "controller",
    name: "LedgerOS Controller",
    tagline: "Accounting integrity — close-readiness, exceptions, and verification.",
    purpose: "Explain what changed, what is incomplete, and what needs reconciliation.",
    intendedRoles: ["Accounting Lead", "Systems Reviewer"],
    allowedData: ["General ledger", "Expenses", "Banking", "Close checklist"],
    restrictedData: ["Board strategy", "Investor communication"],
    questions: [
      "Why did numbers change from last period?",
      "What is incomplete for the close?",
      "What needs reconciliation?",
    ],
    recommendations: ["Match suggestions", "Reconciliation sequencing", "Close checklist ordering"],
    approvalRequired: ["Cannot approve own findings — controller review required"],
    escalation: "Escalate policy exceptions to accounting lead + owner.",
    theme: { gradient: "from-emerald-500 to-teal-500", accent: "text-emerald-300" },
  },
  revenue: {
    key: "revenue",
    slug: "revenue",
    name: "LedgerOS Revenue Architect",
    tagline: "Revenue optimization — billing, profitability, and leakage.",
    purpose: "Advise on billing structure, client profitability, and revenue leakage.",
    intendedRoles: ["Sales Leadership", "Owner"],
    allowedData: ["Customers", "Sales", "Invoices", "Services", "Pricing"],
    restrictedData: ["Employee payroll", "Vendor tax IDs"],
    questions: [
      "How should we bill this offering?",
      "Which clients are most profitable?",
      "Where are we leaking revenue?",
    ],
    recommendations: ["Pricing changes", "Bundle experiments", "Discount policy tightening"],
    approvalRequired: ["Sales lead + Owner sign-off on pricing changes"],
    escalation: "Escalate contract-level pricing exceptions to owner.",
    theme: { gradient: "from-fuchsia-500 to-orange-500", accent: "text-fuchsia-300" },
  },
  growth: {
    key: "growth",
    slug: "growth",
    name: "LedgerOS Growth Advisor",
    tagline: "Growth decisions — campaigns, investment, and expansion.",
    purpose: "Advise on which campaigns, services, and channels to invest in.",
    intendedRoles: ["Owner", "Marketing"],
    allowedData: ["Campaigns", "Attribution", "Marketing ROI", "Customer LTV"],
    restrictedData: ["Payroll", "Employee compensation"],
    questions: [
      "Which campaigns are working?",
      "Where should we invest next?",
      "Which services should we grow?",
    ],
    recommendations: ["Channel reallocation", "Campaign scaling", "Service prioritization"],
    approvalRequired: ["Budget owner sign-off on reallocations"],
    escalation: "Escalate multi-quarter commitments to owner.",
    theme: { gradient: "from-violet-500 to-pink-500", accent: "text-violet-300" },
  },
  cash: {
    key: "cash",
    slug: "cash",
    name: "LedgerOS Cash Advisor",
    tagline: "Liquidity — true available cash, obligations, and restrictions.",
    purpose: "Show what can be spent, what is restricted, and what obligations are coming.",
    intendedRoles: ["Owner", "Accounting Lead"],
    allowedData: ["Bank balances", "Obligations", "Reserves", "Pass-through allocations"],
    restrictedData: ["Individual bonus calculations"],
    questions: [
      "What can we spend right now?",
      "What is restricted?",
      "What obligations are coming?",
    ],
    recommendations: ["Payment sequencing", "Reserve adjustments", "Timing of large outflows"],
    approvalRequired: ["Owner sign-off on discretionary spending above threshold"],
    escalation: "Escalate reserve-floor breaches to accounting lead.",
    theme: { gradient: "from-sky-500 to-emerald-500", accent: "text-sky-300" },
  },
  operations: {
    key: "operations",
    slug: "operations",
    name: "LedgerOS Operations Advisor",
    tagline: "Efficiency — blockers, bottlenecks, and slow processes.",
    purpose: "Identify what is blocked, what is slow, and where bottlenecks live.",
    intendedRoles: ["Operations"],
    allowedData: ["Tasks", "Exceptions", "Vendor issues", "Automation health"],
    restrictedData: ["Compensation detail", "Investor reporting"],
    questions: ["What is blocked today?", "What processes are slow?", "Where are the bottlenecks?"],
    recommendations: ["Workload rebalance", "Automation candidates", "Retire redundant jobs"],
    approvalRequired: ["Ops lead sign-off on process changes"],
    escalation: "Escalate cross-team blockers to owner.",
    theme: { gradient: "from-amber-500 to-rose-500", accent: "text-amber-300" },
  },
  tax: {
    key: "tax",
    slug: "tax",
    name: "LedgerOS Tax Opportunity Advisor",
    tagline: "Tax-awareness support — never a substitute for a licensed accountant.",
    purpose: "Surface potential tax exposures and opportunities for professional review.",
    intendedRoles: ["Owner", "Accounting Advisor"],
    allowedData: ["Expense categorization", "Vendor classification", "Tax calendar"],
    restrictedData: ["Personal tax records outside company scope"],
    questions: [
      "Is there anything worth flagging for my accountant?",
      "Are we missing a classification?",
      "Are deadlines approaching?",
    ],
    recommendations: [
      "Flag items for accountant review",
      "Highlight potential classification gaps",
      'Never state "this is deductible" — say "this may require accountant review"',
    ],
    approvalRequired: ["All conclusions require licensed accountant review"],
    escalation: "Escalate every flagged item to accountant of record.",
    theme: { gradient: "from-lime-500 to-emerald-500", accent: "text-lime-300" },
  },
  risk: {
    key: "risk",
    slug: "risk",
    name: "LedgerOS Risk Advisor",
    tagline: "Risk identification — cash, margin, vendor, client, technology.",
    purpose: "Identify risks across categories and stage them for owner review.",
    intendedRoles: ["Systems Reviewer", "Owner"],
    allowedData: [
      "Concentration metrics",
      "Integration health",
      "Data quality",
      "Vendor stability",
    ],
    restrictedData: ["Individual HR records"],
    questions: [
      "What are our biggest risks today?",
      "Where is concentration too high?",
      "What technology risk should we act on?",
    ],
    recommendations: ["Diversification moves", "Hardening actions", "Monitoring additions"],
    approvalRequired: ["Owner + Systems lead sign-off on hardening changes"],
    escalation: "Escalate security events to owner immediately.",
    theme: { gradient: "from-rose-500 to-orange-500", accent: "text-rose-300" },
  },
  executive: {
    key: "executive",
    slug: "executive",
    name: "LedgerOS Executive Advisor",
    tagline: "Daily executive guidance — a synthesis of CFO, Growth, Cash, Risk, and Operations.",
    purpose: "Give the owner one governed daily summary and next-best-action queue.",
    intendedRoles: ["Owner"],
    allowedData: ["All companywide summary metrics"],
    restrictedData: ["Anything outside owner scope"],
    questions: ["What matters today?", "What changed?", "What should I do next?"],
    recommendations: ["Daily priorities", "Cross-cutting decisions", "Approval routing"],
    approvalRequired: ["Owner sign-off on all recommended actions"],
    escalation: "Owner is the escalation endpoint.",
    theme: { gradient: "from-indigo-500 via-violet-500 to-cyan-500", accent: "text-cyan-300" },
  },
};

export const PERSONA_ORDER: PersonaKey[] = [
  "cfo",
  "controller",
  "revenue",
  "growth",
  "cash",
  "operations",
  "tax",
  "risk",
  "executive",
];

export function getPersona(slug: string): AIPersona | undefined {
  return PERSONA_ORDER.map((k) => AI_PERSONAS[k]).find((p) => p.slug === slug);
}
