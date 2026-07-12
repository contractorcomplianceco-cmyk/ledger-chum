// Mock data for LedgerOS Phase 3 — Financial Performance Intelligence.
// Demonstration data only. No live accounting, banking, or AI connection.

export const DEMO_NOTICE_INTEL =
  "LedgerOS UI Design Lab · Demonstration Data — no real financial data, AI inference, or backend is used.";

/* ------------------------------------------------------------------ */
/* Command Center KPIs                                                 */
/* ------------------------------------------------------------------ */

export const INTEL_KPIS = {
  trueCash: 451_510,
  overhead: 214_820,
  overheadPctRevenue: 17.2,
  techSpend: 42_640,
  techRoi: 3.4,
  marketingSpend: 68_200,
  marketingProfitRoi: 2.1,
  bonusReserve: 84_500,
  leakage: 42_180,
  confidence: 87,
};

export const HEALTH_SUMMARY = [
  { label: "Cash guardrails intact", status: "healthy" as const, detail: "All buckets funded" },
  { label: "Overhead within target", status: "watch" as const, detail: "1 category above budget" },
  { label: "Tech spend generating value", status: "healthy" as const, detail: "3.4x ROI" },
  { label: "Marketing payback improving", status: "healthy" as const, detail: "43 days" },
  { label: "Bonus reserve funded", status: "healthy" as const, detail: "104% of expected" },
  { label: "Revenue leakage opportunities", status: "watch" as const, detail: "$42.2k recoverable" },
];

/* ------------------------------------------------------------------ */
/* Overhead                                                            */
/* ------------------------------------------------------------------ */

export type OverheadStatus =
  | "healthy"
  | "watch"
  | "above_budget"
  | "material_increase"
  | "under_review"
  | "structural_risk";

export const OVERHEAD_STATUS_META: Record<OverheadStatus, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "bg-success/10 text-success" },
  watch: { label: "Watch", className: "bg-warning/10 text-warning" },
  above_budget: { label: "Above Budget", className: "bg-warning/15 text-warning" },
  material_increase: { label: "Material Increase", className: "bg-destructive/10 text-destructive" },
  under_review: { label: "Under Review", className: "bg-muted text-muted-foreground" },
  structural_risk: { label: "Structural Risk", className: "bg-destructive/15 text-destructive" },
};

export const OVERHEAD_CATEGORIES = [
  { key: "payroll", label: "Payroll", current: 78_400, prior: 76_200, budget: 80_000, ytd: 462_800, owner: "Christin", status: "healthy" as OverheadStatus, anomalies: 0 },
  { key: "contractor", label: "Contractor labor", current: 12_200, prior: 9_800, budget: 10_000, ytd: 62_400, owner: "Rose", status: "above_budget" as OverheadStatus, anomalies: 1 },
  { key: "software", label: "Software", current: 18_940, prior: 17_100, budget: 18_000, ytd: 110_800, owner: "Carmen", status: "watch" as OverheadStatus, anomalies: 2 },
  { key: "ai", label: "AI tools", current: 9_820, prior: 6_400, budget: 7_500, ytd: 46_100, owner: "Rose", status: "material_increase" as OverheadStatus, anomalies: 1 },
  { key: "marketing", label: "Marketing", current: 22_400, prior: 19_800, budget: 22_000, ytd: 128_600, owner: "Rose", status: "watch" as OverheadStatus, anomalies: 0 },
  { key: "insurance", label: "Insurance", current: 6_100, prior: 6_100, budget: 6_100, ytd: 36_600, owner: "Christin", status: "healthy" as OverheadStatus, anomalies: 0 },
  { key: "legal", label: "Legal", current: 4_800, prior: 3_200, budget: 3_500, ytd: 22_100, owner: "Rose", status: "watch" as OverheadStatus, anomalies: 0 },
  { key: "accounting", label: "Accounting", current: 3_400, prior: 3_400, budget: 3_500, ytd: 20_400, owner: "Christin", status: "healthy" as OverheadStatus, anomalies: 0 },
  { key: "banking", label: "Banking & merchant fees", current: 5_820, prior: 5_400, budget: 5_500, ytd: 32_100, owner: "Christin", status: "watch" as OverheadStatus, anomalies: 1 },
  { key: "communications", label: "Communications", current: 2_100, prior: 2_150, budget: 2_200, ytd: 12_600, owner: "Carmen", status: "healthy" as OverheadStatus, anomalies: 0 },
  { key: "travel", label: "Travel", current: 1_800, prior: 2_400, budget: 2_500, ytd: 11_200, owner: "Rose", status: "healthy" as OverheadStatus, anomalies: 0 },
  { key: "training", label: "Training", current: 950, prior: 400, budget: 800, ytd: 4_100, owner: "Christin", status: "watch" as OverheadStatus, anomalies: 0 },
  { key: "office", label: "Office", current: 1_240, prior: 1_180, budget: 1_500, ytd: 7_400, owner: "Christin", status: "healthy" as OverheadStatus, anomalies: 0 },
  { key: "facilities", label: "Facilities", current: 3_800, prior: 3_800, budget: 3_800, ytd: 22_800, owner: "Christin", status: "healthy" as OverheadStatus, anomalies: 0 },
  { key: "professional", label: "Professional services", current: 2_600, prior: 1_400, budget: 2_000, ytd: 13_100, owner: "Rose", status: "material_increase" as OverheadStatus, anomalies: 1 },
  { key: "admin", label: "General administration", current: 1_450, prior: 1_320, budget: 1_500, ytd: 8_400, owner: "Christin", status: "healthy" as OverheadStatus, anomalies: 0 },
];

export const OVERHEAD_TREND = [
  { m: "Jan", overhead: 182_000, revenue: 1_020_000, budget: 195_000 },
  { m: "Feb", overhead: 189_000, revenue: 1_060_000, budget: 195_000 },
  { m: "Mar", overhead: 194_000, revenue: 1_100_000, budget: 200_000 },
  { m: "Apr", overhead: 198_000, revenue: 1_140_000, budget: 205_000 },
  { m: "May", overhead: 203_000, revenue: 1_180_000, budget: 210_000 },
  { m: "Jun", overhead: 208_000, revenue: 1_210_000, budget: 212_000 },
  { m: "Jul", overhead: 211_000, revenue: 1_240_000, budget: 214_000 },
  { m: "Aug", overhead: 214_820, revenue: 1_248_750, budget: 218_000 },
];

export const OVERHEAD_FIXED_VARIABLE = [
  { name: "Fixed", value: 138_400, color: "#3b82f6" },
  { name: "Variable", value: 76_420, color: "#22d3ee" },
];

/* ------------------------------------------------------------------ */
/* Overhead anomalies                                                  */
/* ------------------------------------------------------------------ */

export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export type OverheadAnomaly = {
  id: string;
  severity: AnomalySeverity;
  type: string;
  category: string;
  vendor: string;
  department: string;
  owner: string;
  expected: number;
  actual: number;
  variancePct: number;
  cashImpact: number;
  confidence: number;
  explanation: string;
  suggestedAction: string;
  status: "open" | "acknowledged" | "resolved" | "monitoring";
};

export const OVERHEAD_ANOMALIES: OverheadAnomaly[] = [
  {
    id: "OA-001",
    severity: "high",
    type: "Vendor price increase",
    category: "AI tools",
    vendor: "OpenAI",
    department: "Systems",
    owner: "Rose",
    expected: 6_400,
    actual: 9_820,
    variancePct: 53,
    cashImpact: -3_420,
    confidence: 94,
    explanation:
      "OpenAI billing is $3,420 above the trailing three-month average. GPT-5 tier usage grew 61% while token cost per completion rose 22%.",
    suggestedAction: "Review Copilot workloads for unnecessary retries; consider prompt-caching tier.",
    status: "open",
  },
  {
    id: "OA-002",
    severity: "medium",
    type: "Duplicate subscription",
    category: "Software",
    vendor: "Canva Pro (2 accounts)",
    department: "Marketing",
    owner: "Rose",
    expected: 149,
    actual: 298,
    variancePct: 100,
    cashImpact: -149,
    confidence: 98,
    explanation:
      "Two Canva Pro subscriptions detected on separate billing profiles. Same seat count, overlapping team.",
    suggestedAction: "Cancel the older workspace (created 2023-11-03).",
    status: "open",
  },
  {
    id: "OA-003",
    severity: "high",
    type: "Expense after employee departure",
    category: "Communications",
    vendor: "RingCentral",
    department: "Sales",
    owner: "Carmen",
    expected: 42,
    actual: 42,
    variancePct: 0,
    cashImpact: -42,
    confidence: 99,
    explanation:
      "Extension 1042 belonged to M. Patel who departed on Jul 3. Line is still billed at $42/mo.",
    suggestedAction: "Reduce seat count; reclaim $42/mo recurring.",
    status: "open",
  },
  {
    id: "OA-004",
    severity: "medium",
    type: "New recurring expense",
    category: "Professional services",
    vendor: "Alacer Advisory",
    department: "Admin",
    owner: "Rose",
    expected: 0,
    actual: 1_200,
    variancePct: 100,
    cashImpact: -1_200,
    confidence: 82,
    explanation: "First charge from this vendor — no prior invoices or contract on file.",
    suggestedAction: "Request documentation; classify as recurring if intentional.",
    status: "open",
  },
  {
    id: "OA-005",
    severity: "critical",
    type: "Cost growing faster than revenue",
    category: "AI tools",
    vendor: "Portfolio",
    department: "Systems",
    owner: "Rose",
    expected: 0,
    actual: 0,
    variancePct: 0,
    cashImpact: 0,
    confidence: 88,
    explanation:
      "AI tools grew 53% YoY while attributable revenue grew 18%. Ratio moved from 2.1% to 3.2% of revenue.",
    suggestedAction: "Rebalance: consolidate to one primary vendor; enforce owner sign-off on new AI SaaS.",
    status: "open",
  },
  {
    id: "OA-006",
    severity: "low",
    type: "Unexpected bank fee",
    category: "Banking & merchant fees",
    vendor: "Chase",
    department: "Admin",
    owner: "Christin",
    expected: 0,
    actual: 185,
    variancePct: 100,
    cashImpact: -185,
    confidence: 100,
    explanation: "Wire fee applied to a client refund — should have used ACH per policy.",
    suggestedAction: "Add reminder to refund workflow to prefer ACH.",
    status: "acknowledged",
  },
  {
    id: "OA-007",
    severity: "medium",
    type: "Software with no active users",
    category: "Software",
    vendor: "Notion Business",
    department: "Systems",
    owner: "Carmen",
    expected: 320,
    actual: 320,
    variancePct: 0,
    cashImpact: -320,
    confidence: 91,
    explanation: "8 seats provisioned, 2 with logins in the last 45 days.",
    suggestedAction: "Reduce to 3 seats; recover $200/mo.",
    status: "open",
  },
  {
    id: "OA-008",
    severity: "high",
    type: "Vendor concentration risk",
    category: "Multiple",
    vendor: "OpenAI",
    department: "Systems",
    owner: "Rose",
    expected: 0,
    actual: 0,
    variancePct: 0,
    cashImpact: 0,
    confidence: 90,
    explanation: "38% of AI spend and 62% of automation dependencies flow through one vendor.",
    suggestedAction: "Evaluate a secondary provider for continuity risk.",
    status: "monitoring",
  },
];

/* ------------------------------------------------------------------ */
/* Technology portfolio                                                */
/* ------------------------------------------------------------------ */

export type TechStatus =
  | "core"
  | "healthy"
  | "underused"
  | "overpriced"
  | "duplicate"
  | "renewal_soon"
  | "no_owner"
  | "no_measured_value"
  | "high_strategic_value"
  | "cancellation_candidate"
  | "review_required";

export const TECH_STATUS_META: Record<TechStatus, { label: string; className: string }> = {
  core: { label: "Core", className: "bg-info/10 text-info" },
  healthy: { label: "Healthy", className: "bg-success/10 text-success" },
  underused: { label: "Underused", className: "bg-warning/10 text-warning" },
  overpriced: { label: "Overpriced", className: "bg-warning/15 text-warning" },
  duplicate: { label: "Duplicate", className: "bg-destructive/10 text-destructive" },
  renewal_soon: { label: "Renewal soon", className: "bg-warning/10 text-warning" },
  no_owner: { label: "No owner", className: "bg-destructive/10 text-destructive" },
  no_measured_value: { label: "No measured value", className: "bg-destructive/10 text-destructive" },
  high_strategic_value: { label: "High strategic value", className: "bg-info/10 text-info" },
  cancellation_candidate: { label: "Cancel candidate", className: "bg-destructive/15 text-destructive" },
  review_required: { label: "Review required", className: "bg-muted text-muted-foreground" },
};

export const TECH_PORTFOLIO = [
  { id: "T-001", vendor: "OpenAI", product: "API + ChatGPT Business", category: "AI", owner: "Rose", department: "Systems", monthly: 3_820, annual: 45_840, seats: 12, activeUsers: 11, utilization: 0.92, costPerActiveUser: 347, renewal: "2026-04-01", cancelBy: "2026-03-15", revenueSupported: 380_000, laborSaved: 210, importance: 5, recommendation: "Keep; monitor cost per completion", status: "core" as TechStatus },
  { id: "T-002", vendor: "Replit", product: "Teams", category: "Development", owner: "Rose", department: "Systems", monthly: 220, annual: 2_640, seats: 5, activeUsers: 4, utilization: 0.80, costPerActiveUser: 55, renewal: "2026-02-01", cancelBy: "2026-01-15", revenueSupported: 62_000, laborSaved: 44, importance: 4, recommendation: "Keep", status: "healthy" as TechStatus },
  { id: "T-003", vendor: "Lovable", product: "Team", category: "Development", owner: "Rose", department: "Systems", monthly: 400, annual: 4_800, seats: 6, activeUsers: 5, utilization: 0.83, costPerActiveUser: 80, renewal: "2026-05-01", cancelBy: "2026-04-15", revenueSupported: 120_000, laborSaved: 62, importance: 5, recommendation: "Core — expanding usage", status: "high_strategic_value" as TechStatus },
  { id: "T-004", vendor: "Zoho", product: "One", category: "CRM", owner: "Christin", department: "Admin", monthly: 890, annual: 10_680, seats: 22, activeUsers: 20, utilization: 0.91, costPerActiveUser: 44.5, renewal: "2026-01-15", cancelBy: "2026-01-01", revenueSupported: 640_000, laborSaved: 180, importance: 5, recommendation: "Renew; annual saves 20%", status: "renewal_soon" as TechStatus },
  { id: "T-005", vendor: "Vercel", product: "Pro", category: "Hosting", owner: "Rose", department: "Systems", monthly: 240, annual: 2_880, seats: 4, activeUsers: 4, utilization: 1.0, costPerActiveUser: 60, renewal: "2026-06-01", cancelBy: "2026-05-15", revenueSupported: 96_000, laborSaved: 18, importance: 4, recommendation: "Keep", status: "healthy" as TechStatus },
  { id: "T-006", vendor: "GitHub", product: "Enterprise", category: "Development", owner: "Rose", department: "Systems", monthly: 320, annual: 3_840, seats: 8, activeUsers: 7, utilization: 0.88, costPerActiveUser: 45.7, renewal: "2026-09-01", cancelBy: "2026-08-15", revenueSupported: 220_000, laborSaved: 92, importance: 5, recommendation: "Keep", status: "core" as TechStatus },
  { id: "T-007", vendor: "Canva", product: "Pro (workspace A)", category: "Design", owner: "Rose", department: "Marketing", monthly: 149, annual: 1_788, seats: 5, activeUsers: 3, utilization: 0.60, costPerActiveUser: 49.7, renewal: "2026-03-01", cancelBy: "2026-02-15", revenueSupported: 32_000, laborSaved: 22, importance: 3, recommendation: "Consolidate with workspace B", status: "duplicate" as TechStatus },
  { id: "T-008", vendor: "Canva", product: "Pro (workspace B)", category: "Design", owner: "-", department: "Marketing", monthly: 149, annual: 1_788, seats: 5, activeUsers: 1, utilization: 0.20, costPerActiveUser: 149, renewal: "2026-03-01", cancelBy: "2026-02-15", revenueSupported: 12_000, laborSaved: 4, importance: 2, recommendation: "Cancel", status: "cancellation_candidate" as TechStatus },
  { id: "T-009", vendor: "RingCentral", product: "MVP", category: "Communications", owner: "Carmen", department: "Sales", monthly: 420, annual: 5_040, seats: 10, activeUsers: 7, utilization: 0.70, costPerActiveUser: 60, renewal: "2026-07-01", cancelBy: "2026-06-15", revenueSupported: 180_000, laborSaved: 42, importance: 4, recommendation: "Reduce 2 seats", status: "underused" as TechStatus },
  { id: "T-010", vendor: "ADP", product: "Run", category: "HR/Payroll", owner: "Christin", department: "Admin", monthly: 680, annual: 8_160, seats: 22, activeUsers: 22, utilization: 1.0, costPerActiveUser: 30.9, renewal: "2026-11-01", cancelBy: "2026-10-15", revenueSupported: 0, laborSaved: 34, importance: 5, recommendation: "Keep", status: "core" as TechStatus },
  { id: "T-011", vendor: "Supabase", product: "Pro", category: "Data", owner: "Rose", department: "Systems", monthly: 25, annual: 300, seats: 8, activeUsers: 8, utilization: 1.0, costPerActiveUser: 3.1, renewal: "2026-12-01", cancelBy: "2026-11-15", revenueSupported: 140_000, laborSaved: 36, importance: 5, recommendation: "Keep", status: "high_strategic_value" as TechStatus },
  { id: "T-012", vendor: "Google", product: "Workspace Business Plus", category: "Productivity", owner: "Christin", department: "Admin", monthly: 396, annual: 4_752, seats: 22, activeUsers: 22, utilization: 1.0, costPerActiveUser: 18, renewal: "2026-01-30", cancelBy: "2026-01-15", revenueSupported: 0, laborSaved: 48, importance: 5, recommendation: "Renew", status: "renewal_soon" as TechStatus },
  { id: "T-013", vendor: "Notion", product: "Business (8 seats)", category: "Productivity", owner: "Carmen", department: "Systems", monthly: 320, annual: 3_840, seats: 8, activeUsers: 2, utilization: 0.25, costPerActiveUser: 160, renewal: "2026-08-01", cancelBy: "2026-07-15", revenueSupported: 8_000, laborSaved: 4, importance: 2, recommendation: "Reduce to 3 seats", status: "underused" as TechStatus },
];

/* ------------------------------------------------------------------ */
/* App profitability (CCA-built)                                       */
/* ------------------------------------------------------------------ */

export type AppStatus =
  | "profitable"
  | "approaching_payback"
  | "strategic_investment"
  | "needs_adoption"
  | "cost_review"
  | "consolidation_candidate"
  | "sunset_candidate";

export const APP_STATUS_META: Record<AppStatus, { label: string; className: string }> = {
  profitable: { label: "Profitable", className: "bg-success/10 text-success" },
  approaching_payback: { label: "Approaching payback", className: "bg-info/10 text-info" },
  strategic_investment: { label: "Strategic investment", className: "bg-info/10 text-info" },
  needs_adoption: { label: "Needs adoption", className: "bg-warning/10 text-warning" },
  cost_review: { label: "Cost review", className: "bg-warning/10 text-warning" },
  consolidation_candidate: { label: "Consolidate", className: "bg-warning/15 text-warning" },
  sunset_candidate: { label: "Sunset candidate", className: "bg-destructive/10 text-destructive" },
};

export const APPS = [
  { id: "APP-001", name: "LedgerOS", devCost: 84_000, monthly: 1_200, hosting: 220, aiUsage: 480, laborSupport: 3_200, users: 18, activeUsers: 14, clients: 0, directRevenue: 0, revenueInfluenced: 0, timeSaved: 120, errorsPrevented: 22, riskReduced: "High", payback: -1, roi: 0, score: 78, status: "strategic_investment" as AppStatus },
  { id: "APP-002", name: "Command Center", devCost: 52_000, monthly: 640, hosting: 120, aiUsage: 180, laborSupport: 1_800, users: 22, activeUsers: 22, clients: 0, directRevenue: 0, revenueInfluenced: 240_000, timeSaved: 260, errorsPrevented: 44, riskReduced: "Medium", payback: 9, roi: 3.8, score: 86, status: "profitable" as AppStatus },
  { id: "APP-003", name: "Business Services Hub", devCost: 96_000, monthly: 1_400, hosting: 260, aiUsage: 320, laborSupport: 2_400, users: 320, activeUsers: 220, clients: 180, directRevenue: 420_000, revenueInfluenced: 180_000, timeSaved: 480, errorsPrevented: 62, riskReduced: "High", payback: 6, roi: 4.4, score: 91, status: "profitable" as AppStatus },
  { id: "APP-004", name: "QualifierConnect", devCost: 62_000, monthly: 480, hosting: 90, aiUsage: 220, laborSupport: 1_200, users: 62, activeUsers: 48, clients: 44, directRevenue: 180_000, revenueInfluenced: 62_000, timeSaved: 210, errorsPrevented: 18, riskReduced: "High", payback: 8, roi: 3.1, score: 82, status: "profitable" as AppStatus },
  { id: "APP-005", name: "ComplianceConnect", devCost: 74_000, monthly: 720, hosting: 140, aiUsage: 280, laborSupport: 1_800, users: 240, activeUsers: 180, clients: 160, directRevenue: 320_000, revenueInfluenced: 140_000, timeSaved: 380, errorsPrevented: 54, riskReduced: "Critical", payback: 5, roi: 4.2, score: 90, status: "profitable" as AppStatus },
  { id: "APP-006", name: "Bid Intelligence OS", devCost: 42_000, monthly: 320, hosting: 60, aiUsage: 140, laborSupport: 800, users: 18, activeUsers: 12, clients: 8, directRevenue: 48_000, revenueInfluenced: 22_000, timeSaved: 88, errorsPrevented: 6, riskReduced: "Medium", payback: 12, roi: 2.1, score: 71, status: "approaching_payback" as AppStatus },
  { id: "APP-007", name: "Facility Intelligence", devCost: 38_000, monthly: 240, hosting: 60, aiUsage: 80, laborSupport: 600, users: 12, activeUsers: 4, clients: 2, directRevenue: 8_000, revenueInfluenced: 4_000, timeSaved: 22, errorsPrevented: 2, riskReduced: "Low", payback: 32, roi: 0.6, score: 42, status: "needs_adoption" as AppStatus },
  { id: "APP-008", name: "TrustScore", devCost: 48_000, monthly: 380, hosting: 90, aiUsage: 260, laborSupport: 1_100, users: 44, activeUsers: 38, clients: 30, directRevenue: 96_000, revenueInfluenced: 42_000, timeSaved: 120, errorsPrevented: 14, riskReduced: "High", payback: 9, roi: 2.8, score: 80, status: "profitable" as AppStatus },
  { id: "APP-009", name: "HealthCast", devCost: 34_000, monthly: 220, hosting: 60, aiUsage: 90, laborSupport: 500, users: 8, activeUsers: 3, clients: 1, directRevenue: 4_000, revenueInfluenced: 2_000, timeSaved: 12, errorsPrevented: 1, riskReduced: "Low", payback: 42, roi: 0.3, score: 34, status: "sunset_candidate" as AppStatus },
  { id: "APP-010", name: "Sales Intelligence OS", devCost: 58_000, monthly: 420, hosting: 100, aiUsage: 240, laborSupport: 1_400, users: 24, activeUsers: 20, clients: 0, directRevenue: 0, revenueInfluenced: 220_000, timeSaved: 180, errorsPrevented: 24, riskReduced: "Medium", payback: 7, roi: 3.6, score: 84, status: "profitable" as AppStatus },
  { id: "APP-011", name: "Guided Sales", devCost: 22_000, monthly: 180, hosting: 40, aiUsage: 60, laborSupport: 400, users: 14, activeUsers: 12, clients: 0, directRevenue: 0, revenueInfluenced: 88_000, timeSaved: 62, errorsPrevented: 8, riskReduced: "Low", payback: 6, roi: 3.9, score: 82, status: "profitable" as AppStatus },
  { id: "APP-012", name: "Tara OS", devCost: 44_000, monthly: 340, hosting: 80, aiUsage: 220, laborSupport: 900, users: 6, activeUsers: 6, clients: 0, directRevenue: 0, revenueInfluenced: 62_000, timeSaved: 120, errorsPrevented: 12, riskReduced: "Medium", payback: 10, roi: 2.4, score: 74, status: "strategic_investment" as AppStatus },
  { id: "APP-013", name: "ChristinOS", devCost: 28_000, monthly: 200, hosting: 40, aiUsage: 140, laborSupport: 600, users: 3, activeUsers: 3, clients: 0, directRevenue: 0, revenueInfluenced: 48_000, timeSaved: 88, errorsPrevented: 10, riskReduced: "Medium", payback: 8, roi: 2.9, score: 79, status: "profitable" as AppStatus },
  { id: "APP-014", name: "JestinaOS", devCost: 24_000, monthly: 180, hosting: 40, aiUsage: 100, laborSupport: 400, users: 2, activeUsers: 2, clients: 0, directRevenue: 0, revenueInfluenced: 32_000, timeSaved: 44, errorsPrevented: 6, riskReduced: "Low", payback: 14, roi: 1.8, score: 68, status: "approaching_payback" as AppStatus },
];

/* ------------------------------------------------------------------ */
/* Marketing ROI + Campaigns                                           */
/* ------------------------------------------------------------------ */

export const MARKETING_KPIS = {
  spend: 68_200,
  leads: 842,
  qualified: 268,
  consultations: 148,
  deals: 62,
  collectedRevenue: 312_400,
  attributedGross: 168_400,
  attributedContribution: 142_800,
  cpl: 81,
  cpa: 1_100,
  revenueRoi: 4.58,
  grossRoi: 2.47,
  profitRoi: 2.09,
  paybackDays: 43,
  chargebackRate: 1.6,
  ltv: 8_400,
};

export const MARKETING_TREND = [
  { m: "Feb", spend: 42_000, revenue: 180_000, contribution: 78_000 },
  { m: "Mar", spend: 48_000, revenue: 210_000, contribution: 92_000 },
  { m: "Apr", spend: 52_000, revenue: 232_000, contribution: 104_000 },
  { m: "May", spend: 58_000, revenue: 268_000, contribution: 118_000 },
  { m: "Jun", spend: 62_000, revenue: 284_000, contribution: 128_000 },
  { m: "Jul", spend: 66_000, revenue: 296_000, contribution: 134_000 },
  { m: "Aug", spend: 68_200, revenue: 312_400, contribution: 142_800 },
];

export type CampaignStatus = "active" | "paused" | "ended" | "review";

export const CAMPAIGNS = [
  { id: "C-101", name: "Google Search — Formation", channel: "Search", platform: "Google Ads", owner: "Rose", start: "2025-02-01", status: "active" as CampaignStatus, spend: 18_400, leads: 240, qualified: 92, deals: 24, revenue: 104_000, passthrough: 22_800, commission: 8_400, fulfillment: 12_600, contribution: 42_100, profitRoi: 2.28, payback: 34, chargebackRate: 0.8 },
  { id: "C-102", name: "Meta Retargeting — SMB", channel: "Social", platform: "Meta", owner: "Rose", start: "2025-03-14", status: "active" as CampaignStatus, spend: 12_800, leads: 168, qualified: 42, deals: 12, revenue: 48_600, passthrough: 6_200, commission: 3_900, fulfillment: 6_800, contribution: 18_400, profitRoi: 1.44, payback: 52, chargebackRate: 1.4 },
  { id: "C-103", name: "LinkedIn — Enterprise Compliance", channel: "Social", platform: "LinkedIn", owner: "Rose", start: "2025-04-02", status: "active" as CampaignStatus, spend: 14_200, leads: 88, qualified: 44, deals: 14, revenue: 92_400, passthrough: 4_800, commission: 6_400, fulfillment: 11_200, contribution: 54_800, profitRoi: 3.86, payback: 28, chargebackRate: 0.4 },
  { id: "C-104", name: "Email Nurture — Renewals", channel: "Email", platform: "Zoho Marketing", owner: "Christin", start: "2025-01-15", status: "active" as CampaignStatus, spend: 2_100, leads: 62, qualified: 38, deals: 22, revenue: 44_800, passthrough: 8_200, commission: 3_100, fulfillment: 4_800, contribution: 26_600, profitRoi: 12.7, payback: 12, chargebackRate: 0.2 },
  { id: "C-105", name: "YouTube Pre-roll — Brand", channel: "Video", platform: "YouTube", owner: "Rose", start: "2025-05-20", status: "review" as CampaignStatus, spend: 8_800, leads: 42, qualified: 6, deals: 1, revenue: 3_800, passthrough: 400, commission: 200, fulfillment: 600, contribution: -1_800, profitRoi: -0.20, payback: -1, chargebackRate: 0 },
  { id: "C-106", name: "SEO — Foreign Registration", channel: "Organic", platform: "Site", owner: "Rose", start: "2024-11-01", status: "active" as CampaignStatus, spend: 4_200, leads: 148, qualified: 32, deals: 9, revenue: 22_800, passthrough: 4_200, commission: 1_800, fulfillment: 3_600, contribution: 11_400, profitRoi: 2.71, payback: 22, chargebackRate: 0.6 },
  { id: "C-107", name: "Referral — Partner Firms", channel: "Referral", platform: "Direct", owner: "Rose", start: "2024-09-01", status: "active" as CampaignStatus, spend: 6_400, leads: 62, qualified: 28, deals: 18, revenue: 84_200, passthrough: 12_400, commission: 6_800, fulfillment: 9_200, contribution: 42_600, profitRoi: 6.66, payback: 18, chargebackRate: 0.2 },
  { id: "C-108", name: "Google Search — Licensing", channel: "Search", platform: "Google Ads", owner: "Rose", start: "2025-06-01", status: "paused" as CampaignStatus, spend: 1_300, leads: 32, qualified: 6, deals: 1, revenue: 1_800, passthrough: 200, commission: 100, fulfillment: 400, contribution: -200, profitRoi: -0.15, payback: -1, chargebackRate: 2.1 },
];

export const MARKETING_ALERTS = [
  { severity: "high", vendor: "YouTube Pre-roll — Brand", detail: "Spend $8.8k, 1 deal, negative contribution", action: "Pause and reallocate" },
  { severity: "medium", vendor: "Meta Retargeting — SMB", detail: "CPA $1,067 — above $850 target", action: "Refresh creative; tighten audience" },
  { severity: "low", vendor: "LinkedIn — Enterprise Compliance", detail: "Payback 28 days, best ROI — consider budget lift", action: "Increase budget 25%" },
];

/* ------------------------------------------------------------------ */
/* Bonuses                                                             */
/* ------------------------------------------------------------------ */

export type BonusStatus =
  | "projected"
  | "tracking"
  | "earned"
  | "pending_verification"
  | "pending_christin"
  | "pending_rose"
  | "approved"
  | "payable"
  | "scheduled"
  | "paid"
  | "held"
  | "reversed"
  | "clawback";

export const BONUS_STATUS_META: Record<BonusStatus, { label: string; className: string }> = {
  projected: { label: "Projected", className: "bg-muted text-muted-foreground" },
  tracking: { label: "Tracking", className: "bg-info/10 text-info" },
  earned: { label: "Earned", className: "bg-info/15 text-info" },
  pending_verification: { label: "Pending verification", className: "bg-warning/10 text-warning" },
  pending_christin: { label: "Pending Christin", className: "bg-warning/10 text-warning" },
  pending_rose: { label: "Pending Rose", className: "bg-warning/10 text-warning" },
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  payable: { label: "Payable", className: "bg-success/15 text-success" },
  scheduled: { label: "Scheduled", className: "bg-info/10 text-info" },
  paid: { label: "Paid", className: "bg-success/15 text-success" },
  held: { label: "Held", className: "bg-warning/15 text-warning" },
  reversed: { label: "Reversed", className: "bg-destructive/10 text-destructive" },
  clawback: { label: "Clawback required", className: "bg-destructive/15 text-destructive" },
};

export const BONUS_KPIS = {
  projected: 128_400,
  earned: 84_500,
  awaitingVerification: 18_200,
  awaitingApproval: 12_400,
  approvedUnpaid: 22_100,
  scheduled: 8_400,
  paidPeriod: 21_400,
  reserve: 84_500,
};

export const BONUSES = [
  { id: "B-001", employee: "A. Rivera", department: "Sales", plan: "Sales commission tier 2", period: "Aug 2026", trigger: "Collected revenue > $60k", projected: 6_200, earned: 4_800, approved: 4_800, payable: 4_800, paid: 0, holdback: 480, status: "approved" as BonusStatus, approver: "Rose" },
  { id: "B-002", employee: "J. Nguyen", department: "Sales", plan: "Sales commission tier 1", period: "Aug 2026", trigger: "Collected revenue > $30k", projected: 3_400, earned: 2_100, approved: 0, payable: 0, paid: 0, holdback: 210, status: "pending_rose" as BonusStatus, approver: "Rose" },
  { id: "B-003", employee: "M. Patel", department: "Fulfillment", plan: "Turnaround-time bonus", period: "Q3 2026", trigger: "Avg turnaround < 4 days", projected: 1_800, earned: 1_800, approved: 1_800, payable: 1_800, paid: 1_800, holdback: 0, status: "paid" as BonusStatus, approver: "Christin" },
  { id: "B-004", employee: "L. Chen", department: "Compliance Ops", plan: "Accuracy bonus", period: "Aug 2026", trigger: "Error rate < 1%", projected: 1_200, earned: 1_200, approved: 0, payable: 0, paid: 0, holdback: 0, status: "pending_verification" as BonusStatus, approver: "Christin" },
  { id: "B-005", employee: "S. Alvarez", department: "Fulfillment", plan: "Fulfillment milestone", period: "Aug 2026", trigger: "50 filings completed", projected: 2_400, earned: 2_400, approved: 2_400, payable: 2_400, paid: 0, holdback: 0, status: "payable" as BonusStatus, approver: "Christin" },
  { id: "B-006", employee: "K. Rose", department: "Marketing", plan: "Campaign performance", period: "Aug 2026", trigger: "Profit ROI > 2.0", projected: 3_800, earned: 2_100, approved: 0, payable: 0, paid: 0, holdback: 0, status: "tracking" as BonusStatus, approver: "Rose" },
  { id: "B-007", employee: "T. Brooks", department: "Sales", plan: "Expansion revenue", period: "Q3 2026", trigger: "Client upsell > $10k", projected: 2_800, earned: 2_800, approved: 2_800, payable: 2_800, paid: 0, holdback: 280, status: "scheduled" as BonusStatus, approver: "Rose" },
  { id: "B-008", employee: "D. Kim", department: "Sales", plan: "Sales commission tier 3", period: "Jul 2026", trigger: "Collected revenue > $100k", projected: 8_200, earned: 8_200, approved: 8_200, payable: 8_200, paid: 8_200, holdback: 820, status: "paid" as BonusStatus, approver: "Rose" },
  { id: "B-009", employee: "R. Fields", department: "Sales", plan: "Referral bonus", period: "Aug 2026", trigger: "Closed referral deal", projected: 500, earned: 500, approved: 500, payable: 500, paid: 0, holdback: 0, status: "held" as BonusStatus, approver: "Rose" },
  { id: "B-010", employee: "P. Ortiz", department: "Sales", plan: "Sales commission tier 1", period: "Jul 2026", trigger: "Chargeback occurred", projected: 1_600, earned: 1_600, approved: 1_600, payable: 0, paid: 1_600, holdback: 0, status: "clawback" as BonusStatus, approver: "Rose" },
];

export const BONUS_FORECAST = [
  { horizon: "Next payroll", obligation: 12_400, reserve: 84_500, shortfall: 0 },
  { horizon: "30 days", obligation: 34_800, reserve: 84_500, shortfall: 0 },
  { horizon: "60 days", obligation: 62_200, reserve: 84_500, shortfall: 0 },
  { horizon: "90 days", obligation: 98_400, reserve: 84_500, shortfall: 13_900 },
];

export const BONUS_PLAN_TYPES = [
  "Sales commission",
  "Collected revenue bonus",
  "Gross-profit bonus",
  "Department performance",
  "Client retention",
  "Fulfillment milestone",
  "Accuracy bonus",
  "Turnaround-time bonus",
  "Referral bonus",
  "Expansion revenue",
  "Leadership discretionary",
  "Team bonus",
  "App adoption bonus",
  "Cost-saving bonus",
];

export const BONUS_PLANS = [
  { id: "BP-001", name: "Sales commission tier 2", type: "Sales commission", eligible: 6, department: "Sales", metric: "Collected revenue", trigger: ">$60k monthly", calc: "Tiered % 6-8-10", max: 12_000, holdback: "10% for 60 days", approver: "Rose", effective: "2025-01-01" },
  { id: "BP-002", name: "Turnaround-time bonus", type: "Turnaround-time bonus", eligible: 8, department: "Fulfillment", metric: "Avg days to complete", trigger: "< 4 days", calc: "Fixed $600", max: 1_800, holdback: "None", approver: "Christin", effective: "2025-04-01" },
  { id: "BP-003", name: "Accuracy bonus", type: "Accuracy bonus", eligible: 12, department: "Compliance Ops", metric: "Error rate", trigger: "< 1%", calc: "Fixed $400", max: 1_200, holdback: "None", approver: "Christin", effective: "2025-04-01" },
  { id: "BP-004", name: "Campaign performance", type: "Team bonus", eligible: 3, department: "Marketing", metric: "Profit ROI", trigger: "> 2.0", calc: "% of contribution", max: 6_000, holdback: "20% chargeback hold", approver: "Rose", effective: "2025-07-01" },
  { id: "BP-005", name: "Expansion revenue", type: "Expansion revenue", eligible: 6, department: "Sales", metric: "Upsell revenue", trigger: "> $10k per deal", calc: "10%", max: 8_000, holdback: "10%", approver: "Rose", effective: "2025-06-01" },
];

/* ------------------------------------------------------------------ */
/* Profitability                                                       */
/* ------------------------------------------------------------------ */

export type ProfitStatus =
  | "highly_profitable"
  | "healthy"
  | "below_target"
  | "at_risk"
  | "unprofitable"
  | "pricing_review"
  | "scope_review";

export const PROFIT_STATUS_META: Record<ProfitStatus, { label: string; className: string }> = {
  highly_profitable: { label: "Highly profitable", className: "bg-success/15 text-success" },
  healthy: { label: "Healthy", className: "bg-success/10 text-success" },
  below_target: { label: "Below target", className: "bg-warning/10 text-warning" },
  at_risk: { label: "At risk", className: "bg-warning/15 text-warning" },
  unprofitable: { label: "Unprofitable", className: "bg-destructive/10 text-destructive" },
  pricing_review: { label: "Pricing review", className: "bg-warning/10 text-warning" },
  scope_review: { label: "Scope review", className: "bg-warning/10 text-warning" },
};

export const CLIENT_PROFITABILITY = [
  { id: "CL-001", client: "ALD Facility Services", revenue: 148_200, passthrough: 22_400, commission: 9_800, labor: 32_600, expenses: 4_200, tech: 6_200, marketing: 3_400, refunds: 0, contribution: 69_600, margin: 47.0, payment: "On time", burden: "Low", status: "highly_profitable" as ProfitStatus },
  { id: "CL-002", client: "Northgate Ventures", revenue: 96_400, passthrough: 18_200, commission: 6_800, labor: 24_800, expenses: 2_800, tech: 4_200, marketing: 2_100, refunds: 800, contribution: 36_700, margin: 38.1, payment: "On time", burden: "Medium", status: "healthy" as ProfitStatus },
  { id: "CL-003", client: "Pinehurst Holdings", revenue: 62_800, passthrough: 9_200, commission: 4_100, labor: 22_400, expenses: 3_100, tech: 2_800, marketing: 1_800, refunds: 400, contribution: 19_000, margin: 30.3, payment: "Slow", burden: "High", status: "below_target" as ProfitStatus },
  { id: "CL-004", client: "Cypress Retail Co", revenue: 42_400, passthrough: 6_400, commission: 2_800, labor: 18_200, expenses: 2_200, tech: 1_800, marketing: 1_200, refunds: 1_800, contribution: 8_000, margin: 18.9, payment: "Slow", burden: "High", status: "at_risk" as ProfitStatus },
  { id: "CL-005", client: "Silverstone Group", revenue: 128_600, passthrough: 24_800, commission: 8_400, labor: 28_400, expenses: 3_800, tech: 5_400, marketing: 2_800, refunds: 0, contribution: 55_000, margin: 42.8, payment: "On time", burden: "Low", status: "highly_profitable" as ProfitStatus },
  { id: "CL-006", client: "Blue Harbor Partners", revenue: 22_400, passthrough: 3_200, commission: 1_400, labor: 14_600, expenses: 1_800, tech: 1_200, marketing: 800, refunds: 1_200, contribution: -1_800, margin: -8.0, payment: "Very slow", burden: "Very high", status: "unprofitable" as ProfitStatus },
  { id: "CL-007", client: "Harborline Logistics", revenue: 74_800, passthrough: 12_800, commission: 5_200, labor: 20_400, expenses: 2_400, tech: 3_200, marketing: 1_800, refunds: 0, contribution: 29_000, margin: 38.8, payment: "On time", burden: "Medium", status: "healthy" as ProfitStatus },
  { id: "CL-008", client: "Meridian Group", revenue: 44_200, passthrough: 7_800, commission: 3_100, labor: 18_400, expenses: 2_100, tech: 1_900, marketing: 1_100, refunds: 400, contribution: 9_400, margin: 21.3, payment: "On time", burden: "High", status: "pricing_review" as ProfitStatus },
];

export const SERVICE_PROFITABILITY = [
  { id: "SVC-001", name: "Compliance Risk Audit", avgPrice: 4_500, passthrough: 200, commission: 450, labor: 1_600, tech: 220, marketing: 380, gross: 2_200, contribution: 1_650, completionDays: 8, reworkRate: 3.2, refundRate: 0.8, chargebackRate: 0.4 },
  { id: "SVC-002", name: "Expansion Readiness Roadmap", avgPrice: 6_800, passthrough: 400, commission: 680, labor: 2_400, tech: 280, marketing: 520, gross: 3_320, contribution: 2_520, completionDays: 12, reworkRate: 4.4, refundRate: 1.2, chargebackRate: 0.6 },
  { id: "SVC-003", name: "Licensing Strategy", avgPrice: 3_200, passthrough: 180, commission: 320, labor: 1_400, tech: 180, marketing: 320, gross: 1_320, contribution: 800, completionDays: 6, reworkRate: 5.1, refundRate: 1.4, chargebackRate: 0.4 },
  { id: "SVC-004", name: "Qualifier Review and Placement", avgPrice: 2_400, passthrough: 800, commission: 240, labor: 900, tech: 120, marketing: 220, gross: 720, contribution: 380, completionDays: 5, reworkRate: 2.8, refundRate: 0.4, chargebackRate: 0.2 },
  { id: "SVC-005", name: "Renewal Tracking", avgPrice: 480, passthrough: 40, commission: 48, labor: 180, tech: 40, marketing: 40, gross: 220, contribution: 172, completionDays: 2, reworkRate: 1.2, refundRate: 0.2, chargebackRate: 0.1 },
  { id: "SVC-006", name: "Monthly Compliance Management", avgPrice: 1_200, passthrough: 80, commission: 120, labor: 480, tech: 100, marketing: 100, gross: 640, contribution: 420, completionDays: 30, reworkRate: 1.6, refundRate: 0.4, chargebackRate: 0.2 },
  { id: "SVC-007", name: "Enterprise Support", avgPrice: 8_400, passthrough: 200, commission: 840, labor: 3_200, tech: 340, marketing: 620, gross: 4_660, contribution: 3_200, completionDays: 30, reworkRate: 2.1, refundRate: 0.6, chargebackRate: 0.3 },
  { id: "SVC-008", name: "Business Formation", avgPrice: 1_800, passthrough: 480, commission: 180, labor: 620, tech: 80, marketing: 180, gross: 620, contribution: 260, completionDays: 4, reworkRate: 2.8, refundRate: 1.1, chargebackRate: 0.6 },
  { id: "SVC-009", name: "Foreign Registration", avgPrice: 2_400, passthrough: 620, commission: 240, labor: 780, tech: 100, marketing: 220, gross: 780, contribution: 440, completionDays: 6, reworkRate: 3.4, refundRate: 1.4, chargebackRate: 0.8 },
  { id: "SVC-010", name: "Registered Agent", avgPrice: 320, passthrough: 60, commission: 32, labor: 40, tech: 20, marketing: 30, gross: 220, contribution: 138, completionDays: 1, reworkRate: 0.4, refundRate: 0.2, chargebackRate: 0.1 },
  { id: "SVC-011", name: "Business License", avgPrice: 1_200, passthrough: 320, commission: 120, labor: 420, tech: 60, marketing: 140, gross: 420, contribution: 140, completionDays: 5, reworkRate: 3.8, refundRate: 1.6, chargebackRate: 0.6 },
  { id: "SVC-012", name: "Application Processing", avgPrice: 680, passthrough: 180, commission: 68, labor: 220, tech: 40, marketing: 80, gross: 240, contribution: 92, completionDays: 3, reworkRate: 2.4, refundRate: 0.8, chargebackRate: 0.4 },
];

export const DEPARTMENT_PROFITABILITY = [
  { name: "Sales", revenueSupported: 1_248_750, directRevenue: 1_248_750, directCost: 128_400, overhead: 62_400, payroll: 168_400, tech: 12_400, bonus: 22_400, contribution: 288_800, efficiency: 2.28, kind: "direct" as const },
  { name: "Fulfillment", revenueSupported: 1_248_750, directRevenue: 0, directCost: 42_000, overhead: 48_200, payroll: 142_400, tech: 8_400, bonus: 14_800, contribution: -14_400, efficiency: 0, kind: "support" as const },
  { name: "Compliance Operations", revenueSupported: 980_000, directRevenue: 0, directCost: 32_000, overhead: 38_200, payroll: 118_400, tech: 6_800, bonus: 8_200, contribution: -3_600, efficiency: 0, kind: "support" as const },
  { name: "Systems", revenueSupported: 1_248_750, directRevenue: 0, directCost: 4_200, overhead: 18_400, payroll: 84_200, tech: 22_400, bonus: 4_200, contribution: 0, efficiency: 0, kind: "support" as const },
  { name: "Marketing", revenueSupported: 312_400, directRevenue: 0, directCost: 68_200, overhead: 14_800, payroll: 52_400, tech: 4_800, bonus: 3_800, contribution: 3_400, efficiency: 0.05, kind: "direct" as const },
  { name: "Administration", revenueSupported: 1_248_750, directRevenue: 0, directCost: 12_400, overhead: 28_400, payroll: 42_800, tech: 3_400, bonus: 0, contribution: 0, efficiency: 0, kind: "support" as const },
  { name: "Accounting", revenueSupported: 1_248_750, directRevenue: 0, directCost: 4_800, overhead: 8_200, payroll: 48_400, tech: 2_800, bonus: 1_200, contribution: 0, efficiency: 0, kind: "support" as const },
  { name: "Leadership", revenueSupported: 1_248_750, directRevenue: 0, directCost: 0, overhead: 12_400, payroll: 62_000, tech: 1_200, bonus: 0, contribution: 0, efficiency: 0, kind: "strategic" as const },
];

/* ------------------------------------------------------------------ */
/* Attribution                                                         */
/* ------------------------------------------------------------------ */

export type AllocationMethod =
  | "direct"
  | "fixed"
  | "percentage"
  | "headcount"
  | "revenue_share"
  | "usage"
  | "employee_time"
  | "client_count"
  | "manual";

export const ATTRIBUTION_EXPENSES = [
  { id: "EX-A-001", vendor: "OpenAI", amount: 3_820, method: "usage" as AllocationMethod, allocated: 100, targets: [{ label: "LedgerOS", pct: 22 }, { label: "Command Center", pct: 18 }, { label: "ComplianceConnect", pct: 34 }, { label: "Shared overhead", pct: 26 }], unallocated: 0, marginImpact: -2.1, confidence: 88, evidence: "Vendor API usage export · 2,140 calls" },
  { id: "EX-A-002", vendor: "AWS Hosting", amount: 620, method: "usage" as AllocationMethod, allocated: 100, targets: [{ label: "Business Services Hub", pct: 42 }, { label: "LedgerOS", pct: 22 }, { label: "Facility Intelligence", pct: 12 }, { label: "Shared", pct: 24 }], unallocated: 0, marginImpact: -0.4, confidence: 92, evidence: "AWS cost explorer tag map" },
  { id: "EX-A-003", vendor: "Zoho One", amount: 890, method: "headcount" as AllocationMethod, allocated: 100, targets: [{ label: "Sales", pct: 40 }, { label: "Fulfillment", pct: 30 }, { label: "Admin", pct: 30 }], unallocated: 0, marginImpact: -0.6, confidence: 95, evidence: "Active seat report" },
  { id: "EX-A-004", vendor: "LinkedIn Ads", amount: 14_200, method: "direct" as AllocationMethod, allocated: 100, targets: [{ label: "C-103 Enterprise Compliance", pct: 100 }], unallocated: 0, marginImpact: -12.2, confidence: 100, evidence: "Ad account invoice" },
  { id: "EX-A-005", vendor: "Alacer Advisory", amount: 1_200, method: "manual" as AllocationMethod, allocated: 40, targets: [{ label: "R&D", pct: 40 }], unallocated: 720, marginImpact: -0.8, confidence: 42, evidence: "No contract on file" },
  { id: "EX-A-006", vendor: "Canva (both)", amount: 298, method: "manual" as AllocationMethod, allocated: 0, targets: [], unallocated: 298, marginImpact: 0, confidence: 20, evidence: "No owner assigned" },
];

/* ------------------------------------------------------------------ */
/* Forecasting                                                         */
/* ------------------------------------------------------------------ */

export type ForecastScenario =
  | "base"
  | "best"
  | "conservative"
  | "revenue_decline"
  | "marketing_expansion"
  | "new_hires"
  | "tech_reduction"
  | "high_chargebacks"
  | "major_client_loss"
  | "product_launch";

export const FORECAST_SCENARIOS: { key: ForecastScenario; label: string }[] = [
  { key: "base", label: "Base case" },
  { key: "best", label: "Best case" },
  { key: "conservative", label: "Conservative" },
  { key: "revenue_decline", label: "Revenue decline 15%" },
  { key: "marketing_expansion", label: "Marketing +40%" },
  { key: "new_hires", label: "Add 4 hires" },
  { key: "tech_reduction", label: "Tech reduction 20%" },
  { key: "high_chargebacks", label: "High chargebacks" },
  { key: "major_client_loss", label: "Major client loss" },
  { key: "product_launch", label: "New product launch" },
];

const baseForecast = [
  { m: "Sep", revenue: 1_290_000, collections: 1_220_000, expenses: 720_000, cash: 468_000, profit: 348_000 },
  { m: "Oct", revenue: 1_340_000, collections: 1_268_000, expenses: 736_000, cash: 492_000, profit: 372_000 },
  { m: "Nov", revenue: 1_390_000, collections: 1_312_000, expenses: 748_000, cash: 528_000, profit: 396_000 },
  { m: "Dec", revenue: 1_480_000, collections: 1_398_000, expenses: 782_000, cash: 588_000, profit: 442_000 },
  { m: "Jan", revenue: 1_320_000, collections: 1_368_000, expenses: 776_000, cash: 618_000, profit: 388_000 },
  { m: "Feb", revenue: 1_360_000, collections: 1_302_000, expenses: 782_000, cash: 622_000, profit: 396_000 },
];

export function forecastFor(scenario: ForecastScenario) {
  const modifier: Record<ForecastScenario, { rev: number; exp: number }> = {
    base: { rev: 1.0, exp: 1.0 },
    best: { rev: 1.08, exp: 1.02 },
    conservative: { rev: 0.94, exp: 1.0 },
    revenue_decline: { rev: 0.85, exp: 0.98 },
    marketing_expansion: { rev: 1.12, exp: 1.08 },
    new_hires: { rev: 1.02, exp: 1.11 },
    tech_reduction: { rev: 0.98, exp: 0.92 },
    high_chargebacks: { rev: 0.94, exp: 1.03 },
    major_client_loss: { rev: 0.82, exp: 0.97 },
    product_launch: { rev: 1.14, exp: 1.09 },
  };
  const m = modifier[scenario];
  return baseForecast.map((r) => ({
    ...r,
    revenue: Math.round(r.revenue * m.rev),
    collections: Math.round(r.collections * m.rev),
    expenses: Math.round(r.expenses * m.exp),
    profit: Math.round(r.revenue * m.rev - r.expenses * m.exp),
    cash: Math.round(r.cash + (r.revenue * m.rev - r.expenses * m.exp) * 0.1),
  }));
}

/* ------------------------------------------------------------------ */
/* Financial Confidence                                                */
/* ------------------------------------------------------------------ */

export const CONFIDENCE_COMPONENTS = [
  { key: "reconciliation", label: "Reconciliation status", weight: 12, current: 11, max: 12, gap: "1 unreconciled bank account", impact: 1 },
  { key: "uncategorized", label: "Uncategorized transactions", weight: 8, current: 7, max: 8, gap: "6 items awaiting category", impact: 1 },
  { key: "receipts", label: "Missing receipts", weight: 10, current: 7, max: 10, gap: "3 missing receipts", impact: 3 },
  { key: "overdue", label: "Overdue invoices", weight: 10, current: 8, max: 10, gap: "$34.8k past 30 days", impact: 2 },
  { key: "unapproved_exp", label: "Unapproved expenses", weight: 6, current: 5, max: 6, gap: "4 items pending", impact: 1 },
  { key: "suspense", label: "Suspense balance", weight: 6, current: 6, max: 6, gap: "None", impact: 0 },
  { key: "integrations", label: "Failed integrations", weight: 8, current: 7, max: 8, gap: "1 failed sync (Stripe)", impact: 1 },
  { key: "anomalies", label: "Unresolved anomalies", weight: 8, current: 6, max: 8, gap: "8 anomalies open", impact: 2 },
  { key: "attribution", label: "Incomplete expense allocation", weight: 8, current: 7, max: 8, gap: "$720 unallocated", impact: 1 },
  { key: "close", label: "Monthly-close progress", weight: 10, current: 9, max: 10, gap: "Aug 92% complete", impact: 1 },
  { key: "freshness", label: "Data freshness", weight: 6, current: 6, max: 6, gap: "All feeds current", impact: 0 },
  { key: "bonus_verify", label: "Bonus verification", weight: 4, current: 2, max: 4, gap: "2 unverified bonuses", impact: 2 },
  { key: "leakage", label: "Revenue leakage", weight: 4, current: 2, max: 4, gap: "$42.2k open opportunities", impact: 2 },
];

/* ------------------------------------------------------------------ */
/* Revenue Leakage                                                     */
/* ------------------------------------------------------------------ */

export type LeakageStatus =
  | "new"
  | "verified"
  | "invoice_draft"
  | "invoiced"
  | "collected"
  | "dismissed"
  | "not_recoverable";

export const LEAKAGE_STATUS_META: Record<LeakageStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-info/10 text-info" },
  verified: { label: "Verified", className: "bg-warning/10 text-warning" },
  invoice_draft: { label: "Invoice drafted", className: "bg-info/15 text-info" },
  invoiced: { label: "Invoiced", className: "bg-success/10 text-success" },
  collected: { label: "Collected", className: "bg-success/15 text-success" },
  dismissed: { label: "Dismissed", className: "bg-muted text-muted-foreground" },
  not_recoverable: { label: "Not recoverable", className: "bg-destructive/10 text-destructive" },
};

export type LeakageOpportunity = {
  id: string;
  client: string;
  service: string;
  source: string;
  amount: number;
  confidence: number;
  ageDays: number;
  reason: string;
  evidence: string;
  action: string;
  owner: string;
  status: LeakageStatus;
};

export const LEAKAGE_OPPS: LeakageOpportunity[] = [
  { id: "L-001", client: "ALD Facility Services", service: "Foreign Registration filing", source: "ComplianceConnect", amount: 620, confidence: 96, ageDays: 12, reason: "Pass-through fee paid but not billed", evidence: "State filing receipt 8/12 — no client invoice line", action: "Draft supplemental invoice", owner: "Christin", status: "new" },
  { id: "L-002", client: "Pinehurst Holdings", service: "Renewal — Registered Agent", source: "Zoho CRM", amount: 320, confidence: 98, ageDays: 22, reason: "Renewal not invoiced", evidence: "Renewal due 7/22 · no invoice", action: "Create invoice", owner: "Christin", status: "verified" },
  { id: "L-003", client: "Cypress Retail Co", service: "Business License add-on", source: "Business Services Hub", amount: 480, confidence: 88, ageDays: 8, reason: "Add-on delivered without charge", evidence: "Service ticket #4218 closed 8/4", action: "Draft change order", owner: "Rose", status: "new" },
  { id: "L-004", client: "Blue Harbor Partners", service: "Monthly Compliance Management", source: "Zoho Books", amount: 1_200, confidence: 92, ageDays: 34, reason: "Recurring invoice missing", evidence: "Aug schedule did not fire", action: "Backfill invoice", owner: "Christin", status: "new" },
  { id: "L-005", client: "Silverstone Group", service: "Enterprise Support", source: "ClickUp", amount: 4_800, confidence: 76, ageDays: 16, reason: "Client receiving service beyond package", evidence: "58 hours logged · 40 in scope", action: "Prepare overage invoice", owner: "Rose", status: "verified" },
  { id: "L-006", client: "Northgate Ventures", service: "Compliance Risk Audit", source: "Manual", amount: 4_500, confidence: 82, ageDays: 5, reason: "Completed service not invoiced", evidence: "Audit delivered 8/8", action: "Create invoice", owner: "Rose", status: "invoice_draft" },
  { id: "L-007", client: "Cypress Retail Co", service: "State examination fee", source: "Bank feed", amount: 340, confidence: 94, ageDays: 44, reason: "Client expense not recovered", evidence: "Card charge · matched to client project", action: "Recover on next invoice", owner: "Christin", status: "verified" },
  { id: "L-008", client: "Meridian Group", service: "Missing late fee", source: "Zoho Books", amount: 180, confidence: 100, ageDays: 46, reason: "Missing late fee", evidence: "Invoice INV-2178 paid 46 days late", action: "Apply 5% late fee", owner: "Christin", status: "new" },
  { id: "L-009", client: "Harborline Logistics", service: "Recurring payment", source: "Stripe", amount: 1_800, confidence: 89, ageDays: 3, reason: "Failed recurring payment", evidence: "Card declined 8/9", action: "Notify client; retry", owner: "Christin", status: "new" },
  { id: "L-010", client: "Northgate Ventures", service: "Qualifier fee", source: "QualifierConnect", amount: 620, confidence: 94, ageDays: 18, reason: "Uncollected qualifier fee", evidence: "Placement completed · fee not on invoice", action: "Add to next invoice", owner: "Rose", status: "verified" },
  { id: "L-011", client: "Sales team", service: "Commission overpayment", source: "Payroll", amount: 480, confidence: 84, ageDays: 12, reason: "Commission overpayment", evidence: "Chargeback occurred · commission not adjusted", action: "Clawback next payroll", owner: "Christin", status: "verified" },
  { id: "L-012", client: "Pinehurst Holdings", service: "Change order", source: "ClickUp", amount: 1_800, confidence: 78, ageDays: 22, reason: "Unbilled change order", evidence: "Scope note 7/22 · no CO issued", action: "Issue change order", owner: "Rose", status: "new" },
];

/* ------------------------------------------------------------------ */
/* Executive recommendations                                           */
/* ------------------------------------------------------------------ */

export type RecCategory =
  | "reduce_cost"
  | "increase_investment"
  | "reprice_service"
  | "recover_revenue"
  | "cancel_software"
  | "reduce_seats"
  | "increase_budget"
  | "pause_campaign"
  | "adjust_bonus_reserve"
  | "increase_cash_reserve"
  | "review_client_scope"
  | "review_vendor"
  | "hire"
  | "delay_hire"
  | "consolidate_tools"
  | "improve_collections";

export const REC_CATEGORY_META: Record<RecCategory, { label: string; tone: "up" | "down" | "neutral" }> = {
  reduce_cost: { label: "Reduce cost", tone: "up" },
  increase_investment: { label: "Increase investment", tone: "up" },
  reprice_service: { label: "Reprice service", tone: "up" },
  recover_revenue: { label: "Recover revenue", tone: "up" },
  cancel_software: { label: "Cancel software", tone: "up" },
  reduce_seats: { label: "Reduce seats", tone: "up" },
  increase_budget: { label: "Increase budget", tone: "neutral" },
  pause_campaign: { label: "Pause campaign", tone: "up" },
  adjust_bonus_reserve: { label: "Adjust bonus reserve", tone: "neutral" },
  increase_cash_reserve: { label: "Increase cash reserve", tone: "neutral" },
  review_client_scope: { label: "Review client scope", tone: "neutral" },
  review_vendor: { label: "Review vendor", tone: "neutral" },
  hire: { label: "Hire", tone: "neutral" },
  delay_hire: { label: "Delay hire", tone: "up" },
  consolidate_tools: { label: "Consolidate tools", tone: "up" },
  improve_collections: { label: "Improve collections", tone: "up" },
};

export type Recommendation = {
  id: string;
  category: RecCategory;
  title: string;
  evidence: string;
  impact: number;
  horizon: string;
  confidence: number;
  risks: string;
  owner: string;
  approval: string;
  status: "open" | "approved" | "in_progress" | "completed" | "dismissed";
};

export const RECOMMENDATIONS: Recommendation[] = [
  { id: "R-001", category: "cancel_software", title: "Cancel duplicate Canva workspace", evidence: "Two Canva Pro workspaces with overlapping teams; workspace B has 1 active user of 5 seats.", impact: 1_788, horizon: "30 days", confidence: 96, risks: "Minor — verify no external shares.", owner: "Rose", approval: "Rose", status: "open" },
  { id: "R-002", category: "reduce_seats", title: "Reduce Notion to 3 seats", evidence: "8 seats provisioned; 2 with logins in last 45 days.", impact: 2_400, horizon: "60 days", confidence: 91, risks: "Downgrade requires plan change.", owner: "Carmen", approval: "Rose", status: "open" },
  { id: "R-003", category: "increase_budget", title: "Increase LinkedIn Enterprise Compliance +25%", evidence: "Profit ROI 3.86 · payback 28 days · lowest chargeback.", impact: 12_400, horizon: "30 days", confidence: 88, risks: "Diminishing returns above +30%.", owner: "Rose", approval: "Rose", status: "open" },
  { id: "R-004", category: "pause_campaign", title: "Pause YouTube pre-roll", evidence: "Spend $8.8k · 1 deal · contribution -$1.8k.", impact: 8_800, horizon: "Immediate", confidence: 94, risks: "Loss of brand impressions.", owner: "Rose", approval: "Rose", status: "open" },
  { id: "R-005", category: "recover_revenue", title: "Recover $42.2k in leakage opportunities", evidence: "12 verified opportunities across 8 clients.", impact: 42_180, horizon: "60 days", confidence: 84, risks: "Client relationship on 2 items.", owner: "Christin", approval: "Rose", status: "open" },
  { id: "R-006", category: "reprice_service", title: "Reprice Business License service", evidence: "Contribution margin 11.7% vs 25% target; rework 3.8%.", impact: 18_400, horizon: "90 days", confidence: 78, risks: "May lose 5-8% of low-margin volume.", owner: "Rose", approval: "Rose", status: "open" },
  { id: "R-007", category: "review_client_scope", title: "Review Blue Harbor Partners scope", evidence: "Contribution -$1.8k · very slow pay · very high service burden.", impact: 1_800, horizon: "30 days", confidence: 82, risks: "Client offboarding risk.", owner: "Rose", approval: "Rose", status: "open" },
  { id: "R-008", category: "consolidate_tools", title: "Consolidate AI vendor concentration", evidence: "OpenAI = 38% of AI spend and 62% of automation dependencies.", impact: 0, horizon: "180 days", confidence: 74, risks: "Migration effort.", owner: "Rose", approval: "Rose", status: "open" },
  { id: "R-009", category: "adjust_bonus_reserve", title: "Increase bonus reserve $14k", evidence: "90-day forecast shows $13.9k shortfall.", impact: -14_000, horizon: "90 days", confidence: 92, risks: "Reduces spendable cash.", owner: "Christin", approval: "Rose", status: "open" },
  { id: "R-010", category: "improve_collections", title: "Automate late-fee application", evidence: "$34.8k past 30 days; 46-day median lag on Meridian.", impact: 4_200, horizon: "30 days", confidence: 90, risks: "Client friction on first application.", owner: "Christin", approval: "Rose", status: "open" },
  { id: "R-011", category: "delay_hire", title: "Delay Fulfillment hire 60 days", evidence: "Turnaround < 4 days achieved; capacity slack 22%.", impact: 22_400, horizon: "60 days", confidence: 68, risks: "Capacity crunch if new client onboards.", owner: "Rose", approval: "Rose", status: "open" },
  { id: "R-012", category: "increase_investment", title: "Grow Command Center adoption", evidence: "ROI 3.8x · influences $240k revenue · 100% adoption.", impact: 84_000, horizon: "180 days", confidence: 72, risks: "Development capacity.", owner: "Rose", approval: "Rose", status: "open" },
];

/* ------------------------------------------------------------------ */
/* Emerging risks                                                      */
/* ------------------------------------------------------------------ */

export const EMERGING_RISKS = [
  { severity: "high" as const, label: "AI tools growing 2.9x revenue growth", detail: "3.2% of revenue · target 2.0%" },
  { severity: "medium" as const, label: "Blue Harbor scope drift", detail: "Unprofitable · scope review needed" },
  { severity: "medium" as const, label: "Bonus reserve 90-day gap", detail: "$13.9k shortfall projected" },
  { severity: "low" as const, label: "Vendor concentration — OpenAI", detail: "Continuity risk" },
];
