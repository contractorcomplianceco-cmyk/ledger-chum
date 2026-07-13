// Financial Digital Twin — demonstration scenario modeling only.
// Not a production forecast.

export type ScenarioKey =
  | "revenue-drop-20"
  | "revenue-grow-20"
  | "hire-five"
  | "add-executive"
  | "expand-state"
  | "lose-largest-client"
  | "raise-prices"
  | "cancel-software"
  | "increase-marketing"
  | "add-investor"
  | "launch-product"
  | "attend-3-conferences";

export type ScenarioBand = "Base" | "Conservative" | "Best Case" | "Custom";

export type ScenarioInputs = {
  revenueDelta: number; // %
  pricingDelta: number; // %
  headcountDelta: number;
  payrollDelta: number; // $
  marketingDelta: number; // $
  techDelta: number; // $
  benefitsDelta: number; // $
  taxReserveDelta: number; // $
  ownerDistributionDelta: number; // $
};

export type ScenarioOutputs = {
  cash: number;
  trueAvailableCash: number;
  revenue: number;
  grossProfit: number;
  contributionProfit: number;
  netIncome: number;
  payroll: number;
  compensationObligations: number;
  taxReserves: number;
  profitSharingObligations: number;
  runwayMonths: number;
  hiringCapacity: number;
  companyHealth: number;
  financialConfidence: number;
  risk: number;
  opportunityValue: number;
};

export type Scenario = {
  id: string;
  key: ScenarioKey;
  title: string;
  band: ScenarioBand;
  description: string;
  assumptions: string[];
  inputs: ScenarioInputs;
  outputs30: ScenarioOutputs;
  outputs90: ScenarioOutputs;
  outputs12mo: ScenarioOutputs;
  approvalRequired: string;
  supportingOpportunities: string[];
  affectedDnaPaths: string[];
};

// Baseline
export const BASELINE: ScenarioOutputs = {
  cash: 451510,
  trueAvailableCash: 328000,
  revenue: 1248750,
  grossProfit: 642540,
  contributionProfit: 486000,
  netIncome: 326870,
  payroll: 480000,
  compensationObligations: 68000,
  taxReserves: 92000,
  profitSharingObligations: 32500,
  runwayMonths: 14,
  hiringCapacity: 4,
  companyHealth: 82,
  financialConfidence: 88,
  risk: 24,
  opportunityValue: 345712,
};

export const SCENARIOS: Scenario[] = [
  {
    id: "SC-01",
    key: "revenue-drop-20",
    title: "Revenue drops 20%",
    band: "Conservative",
    description: "Model a broad 20% top-line contraction across all active clients.",
    assumptions: ["Fixed costs unchanged", "Commissions scale with revenue", "No hiring freeze applied"],
    inputs: { revenueDelta: -20, pricingDelta: 0, headcountDelta: 0, payrollDelta: 0, marketingDelta: 0, techDelta: 0, benefitsDelta: 0, taxReserveDelta: 0, ownerDistributionDelta: 0 },
    outputs30: shift(-8),
    outputs90: shift(-16),
    outputs12mo: shift(-28),
    approvalRequired: "Owner + Advisor",
    supportingOpportunities: ["OPP-1047", "OPP-1046"],
    affectedDnaPaths: ["DNA-CLIENT-ALD", "DNA-CLIENT-NORTHSTAR"],
  },
  {
    id: "SC-02",
    key: "hire-five",
    title: "Hire five employees",
    band: "Base",
    description: "Add 5 delivery hires at $95k avg base + benefits load.",
    assumptions: ["Ramp: 60 days to full productivity", "Utilization 68%", "Attrition: 8%"],
    inputs: { revenueDelta: 4, pricingDelta: 0, headcountDelta: 5, payrollDelta: 475000, marketingDelta: 0, techDelta: 12000, benefitsDelta: 62000, taxReserveDelta: 15000, ownerDistributionDelta: 0 },
    outputs30: shift(-6),
    outputs90: shift(-4),
    outputs12mo: shift(9),
    approvalRequired: "Owner",
    supportingOpportunities: ["OPP-1044", "OPP-1051"],
    affectedDnaPaths: ["DNA-CLIENT-NORTHSTAR"],
  },
  {
    id: "SC-03",
    key: "raise-prices",
    title: "Raise service prices +8%",
    band: "Best Case",
    description: "Across-the-board price increase on new engagements and renewals.",
    assumptions: ["Churn adds 2 pts", "Renewals accept increase", "Sales cycle +7 days"],
    inputs: { revenueDelta: 6, pricingDelta: 8, headcountDelta: 0, payrollDelta: 0, marketingDelta: 0, techDelta: 0, benefitsDelta: 0, taxReserveDelta: 5000, ownerDistributionDelta: 0 },
    outputs30: shift(3),
    outputs90: shift(8),
    outputs12mo: shift(14),
    approvalRequired: "Owner",
    supportingOpportunities: ["OPP-1049"],
    affectedDnaPaths: ["DNA-CLIENT-ALD"],
  },
  {
    id: "SC-04",
    key: "cancel-software",
    title: "Cancel duplicate SaaS",
    band: "Base",
    description: "Consolidate duplicate subscriptions across Notion, Zapier, QA tools.",
    assumptions: ["No feature loss", "Migration 30 days"],
    inputs: { revenueDelta: 0, pricingDelta: 0, headcountDelta: 0, payrollDelta: 0, marketingDelta: 0, techDelta: -28852, benefitsDelta: 0, taxReserveDelta: 0, ownerDistributionDelta: 0 },
    outputs30: shift(1),
    outputs90: shift(3),
    outputs12mo: shift(5),
    approvalRequired: "Owner",
    supportingOpportunities: ["OPP-1043", "OPP-1050", "OPP-1053"],
    affectedDnaPaths: ["DNA-VENDOR-NOTION"],
  },
  {
    id: "SC-05",
    key: "lose-largest-client",
    title: "Lose the largest client",
    band: "Conservative",
    description: "Model NorthStar not renewing after June 30.",
    assumptions: ["Reallocate 40% of delivery to next-largest", "Retain full team"],
    inputs: { revenueDelta: -19, pricingDelta: 0, headcountDelta: 0, payrollDelta: 0, marketingDelta: 25000, techDelta: 0, benefitsDelta: 0, taxReserveDelta: -10000, ownerDistributionDelta: -30000 },
    outputs30: shift(-4),
    outputs90: shift(-14),
    outputs12mo: shift(-24),
    approvalRequired: "Owner + Advisor",
    supportingOpportunities: ["OPP-1044", "OPP-1046"],
    affectedDnaPaths: ["DNA-CLIENT-NORTHSTAR"],
  },
];

function shift(pct: number): ScenarioOutputs {
  const f = 1 + pct / 100;
  return {
    cash: Math.round(BASELINE.cash * f),
    trueAvailableCash: Math.round(BASELINE.trueAvailableCash * f),
    revenue: Math.round(BASELINE.revenue * f),
    grossProfit: Math.round(BASELINE.grossProfit * f),
    contributionProfit: Math.round(BASELINE.contributionProfit * f),
    netIncome: Math.round(BASELINE.netIncome * f),
    payroll: Math.round(BASELINE.payroll * (1 + Math.max(pct, -5) / 200)),
    compensationObligations: Math.round(BASELINE.compensationObligations * f),
    taxReserves: Math.round(BASELINE.taxReserves * f),
    profitSharingObligations: Math.round(BASELINE.profitSharingObligations * f),
    runwayMonths: Math.max(2, Math.round(BASELINE.runwayMonths * (1 + pct / 200))),
    hiringCapacity: Math.max(0, Math.round(BASELINE.hiringCapacity + pct / 8)),
    companyHealth: Math.max(30, Math.min(99, Math.round(BASELINE.companyHealth + pct / 2))),
    financialConfidence: Math.max(30, Math.min(99, Math.round(BASELINE.financialConfidence + pct / 3))),
    risk: Math.max(5, Math.min(95, Math.round(BASELINE.risk - pct / 2))),
    opportunityValue: Math.round(BASELINE.opportunityValue * (1 + pct / 400)),
  };
}

export const SCENARIO_BANDS: ScenarioBand[] = ["Base", "Conservative", "Best Case", "Custom"];

export const ASK_LEDGEROS_TWIN = [
  "Can we afford this?",
  "What is the downside?",
  "What assumptions matter most?",
  "What would improve the outcome?",
];
