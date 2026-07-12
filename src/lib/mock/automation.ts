// Mock data for LedgerOS Phase 4 — Financial Automation, Controls & Decision Execution.
// Demonstration data only. No backend, no real automation execution.

export const DEMO_NOTICE_AUTOMATION =
  "LedgerOS UI Design Lab · Demonstration Data — no rules are executing, no records are modified.";

/* ------------------------------------------------------------------ */
/* Automation rules                                                    */
/* ------------------------------------------------------------------ */

export type RuleStatus = "active" | "test_mode" | "paused" | "draft";
export type RuleCategory =
  | "allocation"
  | "cash_guardrail"
  | "expense_routing"
  | "vendor"
  | "invoice"
  | "recovery"
  | "bonus"
  | "anomaly";

export type AutomationRule = {
  id: string;
  name: string;
  category: RuleCategory;
  trigger: string;
  conditions: string[];
  action: string;
  approval: "none" | "manager" | "rose" | "dual";
  owner: string;
  effective: string;
  status: RuleStatus;
  lastRun: string;
  successCount: number;
  failureCount: number;
  auditCount: number;
};

export const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "R-001",
    name: "Auto-allocate pass-through fees on payment",
    category: "allocation",
    trigger: "Client payment received",
    conditions: ["Invoice has pass-through line", "Payment fully applied"],
    action: "Move pass-through amount to Restricted Obligations bucket",
    approval: "none",
    owner: "System",
    effective: "2026-01-01",
    status: "active",
    lastRun: "2 min ago",
    successCount: 1284,
    failureCount: 3,
    auditCount: 1287,
  },
  {
    id: "R-002",
    name: "Reserve commissions only after payment clears",
    category: "allocation",
    trigger: "Bank clearing confirmed",
    conditions: ["Commission line present", "Cleared ≥ commission amount"],
    action: "Move commission amount to Commission Reserve bucket",
    approval: "none",
    owner: "System",
    effective: "2026-01-01",
    status: "active",
    lastRun: "14 min ago",
    successCount: 612,
    failureCount: 1,
    auditCount: 613,
  },
  {
    id: "R-003",
    name: "Alert when unrestricted cash < 2 payroll cycles",
    category: "cash_guardrail",
    trigger: "Daily 6:00 AM ET",
    conditions: ["Unrestricted cash < 2 × avg payroll"],
    action: "Notify Rose + create guardrail alert",
    approval: "none",
    owner: "Rose",
    effective: "2026-01-15",
    status: "active",
    lastRun: "6:00 AM today",
    successCount: 187,
    failureCount: 0,
    auditCount: 187,
  },
  {
    id: "R-004",
    name: "Route expenses over $2,500 to Rose",
    category: "expense_routing",
    trigger: "Expense submitted",
    conditions: ["Amount ≥ $2,500"],
    action: "Route to Rose approval queue",
    approval: "rose",
    owner: "Christin",
    effective: "2026-01-01",
    status: "active",
    lastRun: "38 min ago",
    successCount: 96,
    failureCount: 0,
    auditCount: 96,
  },
  {
    id: "R-005",
    name: "Route recurring vendor expenses to Christin",
    category: "expense_routing",
    trigger: "Expense submitted",
    conditions: ["Vendor is recurring", "Amount < $2,500", "Category is compliant"],
    action: "Route to Christin approval queue",
    approval: "manager",
    owner: "Christin",
    effective: "2026-01-01",
    status: "active",
    lastRun: "1 hr ago",
    successCount: 421,
    failureCount: 2,
    auditCount: 423,
  },
  {
    id: "R-006",
    name: "Flag software price increases > 10%",
    category: "vendor",
    trigger: "Vendor invoice imported",
    conditions: ["Category = Software", "Amount > 1.1 × 90-day avg"],
    action: "Flag as anomaly + notify owner",
    approval: "manager",
    owner: "Rose",
    effective: "2026-02-01",
    status: "active",
    lastRun: "yesterday",
    successCount: 14,
    failureCount: 0,
    auditCount: 14,
  },
  {
    id: "R-007",
    name: "Draft invoice on service milestone",
    category: "invoice",
    trigger: "Project milestone marked complete",
    conditions: ["Milestone has billable amount"],
    action: "Create invoice draft, route to owner",
    approval: "manager",
    owner: "Sales Ops",
    effective: "2026-01-10",
    status: "test_mode",
    lastRun: "3 hr ago",
    successCount: 22,
    failureCount: 1,
    auditCount: 23,
  },
  {
    id: "R-008",
    name: "Create recovery task on unbilled reimbursable",
    category: "recovery",
    trigger: "Expense marked reimbursable + 7 days elapsed",
    conditions: ["Not attached to invoice", "Client billing active"],
    action: "Create recovery task + notify PM",
    approval: "none",
    owner: "Sales Ops",
    effective: "2026-01-01",
    status: "active",
    lastRun: "12 min ago",
    successCount: 63,
    failureCount: 0,
    auditCount: 63,
  },
  {
    id: "R-009",
    name: "Hold bonus eligibility when related invoice unpaid",
    category: "bonus",
    trigger: "Bonus period close",
    conditions: ["Related invoice status ≠ Paid"],
    action: "Move bonus to Held bucket until collection",
    approval: "rose",
    owner: "Rose",
    effective: "2026-01-01",
    status: "active",
    lastRun: "close of last cycle",
    successCount: 41,
    failureCount: 0,
    auditCount: 41,
  },
  {
    id: "R-010",
    name: "Escalate unresolved anomalies after 5 days",
    category: "anomaly",
    trigger: "Daily",
    conditions: ["Anomaly age > 5 days", "Status = Open"],
    action: "Escalate to Rose + create action item",
    approval: "none",
    owner: "System",
    effective: "2026-01-05",
    status: "active",
    lastRun: "6:00 AM today",
    successCount: 27,
    failureCount: 0,
    auditCount: 27,
  },
  {
    id: "R-011",
    name: "Auto-hold marketing spend above ceiling",
    category: "cash_guardrail",
    trigger: "Vendor invoice imported",
    conditions: ["Category = Marketing", "MTD spend > ceiling"],
    action: "Hold payment + require override",
    approval: "dual",
    owner: "Rose",
    effective: "2026-02-01",
    status: "test_mode",
    lastRun: "2 days ago",
    successCount: 4,
    failureCount: 0,
    auditCount: 4,
  },
  {
    id: "R-012",
    name: "Pause dormant subscription over 60 days",
    category: "vendor",
    trigger: "Weekly",
    conditions: ["Usage < 5%", "Age > 60 days"],
    action: "Draft cancellation task, notify owner",
    approval: "manager",
    owner: "Ops",
    effective: "2026-02-15",
    status: "draft",
    lastRun: "—",
    successCount: 0,
    failureCount: 0,
    auditCount: 0,
  },
];

export const RULE_CATEGORY_META: Record<RuleCategory, { label: string; tone: string }> = {
  allocation: { label: "Allocation", tone: "text-brand" },
  cash_guardrail: { label: "Cash Guardrail", tone: "text-warning" },
  expense_routing: { label: "Expense Routing", tone: "text-violet-400" },
  vendor: { label: "Vendor", tone: "text-cyan-400" },
  invoice: { label: "Invoice", tone: "text-emerald-400" },
  recovery: { label: "Recovery", tone: "text-amber-400" },
  bonus: { label: "Bonus", tone: "text-pink-400" },
  anomaly: { label: "Anomaly", tone: "text-red-400" },
};

export const RULE_STATUS_META: Record<RuleStatus, { label: string; tone: string }> = {
  active: { label: "Active", tone: "bg-success/15 text-success border-success/30" },
  test_mode: { label: "Test Mode", tone: "bg-warning/15 text-warning border-warning/30" },
  paused: { label: "Paused", tone: "bg-muted/40 text-muted-foreground border-border" },
  draft: { label: "Draft", tone: "bg-muted/20 text-muted-foreground border-border" },
};

/* ------------------------------------------------------------------ */
/* Unified approvals                                                   */
/* ------------------------------------------------------------------ */

export type ApprovalSource =
  | "invoice"
  | "expense"
  | "bill"
  | "journal"
  | "reconciliation"
  | "bonus"
  | "pre_spend"
  | "subscription"
  | "budget_exception"
  | "cash_override"
  | "leakage_recovery";

export type ApprovalItem = {
  id: string;
  source: ApprovalSource;
  title: string;
  requestor: string;
  amount: number;
  cashImpact: number;
  marginImpactPct: number;
  risk: "low" | "medium" | "high";
  approver: string;
  deadline: string;
  supporting: string[];
  recommendation: string;
};

export const APPROVAL_ITEMS: ApprovalItem[] = [
  { id: "APV-1042", source: "expense", title: "Meta Ads — March buy", requestor: "Christin", amount: 12500, cashImpact: -12500, marginImpactPct: -1.2, risk: "medium", approver: "Rose", deadline: "Today 5pm", supporting: ["Campaign brief", "Q1 ROI = 2.4x"], recommendation: "Approve — within ceiling" },
  { id: "APV-1043", source: "bill", title: "State filing bulk renewals", requestor: "Ops", amount: 8400, cashImpact: 0, marginImpactPct: 0, risk: "low", approver: "Christin", deadline: "Tomorrow", supporting: ["Pass-through funded"], recommendation: "Approve — pass-through covers" },
  { id: "APV-1044", source: "cash_override", title: "Override payroll reserve floor", requestor: "Rose", amount: 22000, cashImpact: -22000, marginImpactPct: 0, risk: "high", approver: "Dual", deadline: "Today 3pm", supporting: ["Vendor critical", "5-day extension available"], recommendation: "Prefer 5-day delay" },
  { id: "APV-1045", source: "invoice", title: "Invoice #2098 — $48k, allocation adjusted", requestor: "Sales Ops", amount: 48000, cashImpact: 32000, marginImpactPct: 3.4, risk: "low", approver: "Rose", deadline: "Today 6pm", supporting: ["Margin above target"], recommendation: "Approve & send" },
  { id: "APV-1046", source: "bonus", title: "Q1 sales bonus release", requestor: "HR", amount: 18500, cashImpact: -18500, marginImpactPct: -0.8, risk: "medium", approver: "Rose", deadline: "Friday", supporting: ["2 invoices unpaid"], recommendation: "Release cleared portion only" },
  { id: "APV-1047", source: "subscription", title: "Notion Enterprise renewal", requestor: "Ops", amount: 14400, cashImpact: -14400, marginImpactPct: -0.3, risk: "low", approver: "Christin", deadline: "3 days", supporting: ["Usage 76%"], recommendation: "Renew with seat reduction (−8)" },
  { id: "APV-1048", source: "pre_spend", title: "Design agency retainer", requestor: "Marketing", amount: 9500, cashImpact: -9500, marginImpactPct: -0.9, risk: "medium", approver: "Rose", deadline: "Next week", supporting: ["No prior spend"], recommendation: "Approve 60-day pilot" },
  { id: "APV-1049", source: "reconciliation", title: "Chase Op ×4421 — $84 variance", requestor: "System", amount: 84, cashImpact: 0, marginImpactPct: 0, risk: "low", approver: "Christin", deadline: "This week", supporting: ["Timing difference"], recommendation: "Approve reconciliation" },
  { id: "APV-1050", source: "leakage_recovery", title: "Recover unbilled reimbursables — Acme", requestor: "Sales Ops", amount: 3200, cashImpact: 3200, marginImpactPct: 0.4, risk: "low", approver: "Rose", deadline: "Next invoice", supporting: ["4 expenses attached"], recommendation: "Add to next invoice" },
  { id: "APV-1051", source: "budget_exception", title: "Dev tools — over budget 12%", requestor: "Engineering", amount: 2100, cashImpact: -2100, marginImpactPct: -0.1, risk: "low", approver: "Christin", deadline: "Today", supporting: ["Vendor essential"], recommendation: "Approve with note" },
];

export const APPROVAL_SOURCE_META: Record<ApprovalSource, { label: string; color: string }> = {
  invoice: { label: "Invoice", color: "text-brand" },
  expense: { label: "Expense", color: "text-violet-400" },
  bill: { label: "Bill", color: "text-cyan-400" },
  journal: { label: "Journal", color: "text-muted-foreground" },
  reconciliation: { label: "Reconciliation", color: "text-emerald-400" },
  bonus: { label: "Bonus", color: "text-pink-400" },
  pre_spend: { label: "Pre-Spend", color: "text-amber-400" },
  subscription: { label: "Subscription", color: "text-fuchsia-400" },
  budget_exception: { label: "Budget", color: "text-orange-400" },
  cash_override: { label: "Cash Override", color: "text-red-400" },
  leakage_recovery: { label: "Recovery", color: "text-teal-400" },
};

/* ------------------------------------------------------------------ */
/* Exceptions                                                          */
/* ------------------------------------------------------------------ */

export type ExceptionType =
  | "accounting"
  | "policy"
  | "missing_receipt"
  | "failed_allocation"
  | "unmatched"
  | "integration"
  | "attribution"
  | "leakage"
  | "bonus_verify"
  | "reconciliation"
  | "forecast_risk"
  | "data_quality";

export type ExceptionItem = {
  id: string;
  type: ExceptionType;
  title: string;
  detail: string;
  dollarImpact: number;
  age: number;
  urgency: "low" | "medium" | "high";
  compliance: boolean;
  cashRisk: boolean;
  confidence: number;
  owner: string;
};

export const EXCEPTIONS: ExceptionItem[] = [
  { id: "EX-2001", type: "failed_allocation", title: "Payment applied without pass-through split", detail: "Payment #P-5541 · $18,400 · missing state fee line", dollarImpact: 18400, age: 2, urgency: "high", compliance: true, cashRisk: true, confidence: 96, owner: "Christin" },
  { id: "EX-2002", type: "unmatched", title: "Wire deposit unmatched", detail: "Chase Op ×4421 · $32,600 · no invoice match", dollarImpact: 32600, age: 4, urgency: "high", compliance: false, cashRisk: false, confidence: 74, owner: "Christin" },
  { id: "EX-2003", type: "missing_receipt", title: "Missing receipt over $500", detail: "Rose · Delta · $612", dollarImpact: 612, age: 3, urgency: "medium", compliance: true, cashRisk: false, confidence: 100, owner: "Rose" },
  { id: "EX-2004", type: "policy", title: "Non-reimbursable submitted", detail: "Client entertainment · $340", dollarImpact: 340, age: 1, urgency: "low", compliance: true, cashRisk: false, confidence: 92, owner: "Christin" },
  { id: "EX-2005", type: "integration", title: "Stripe webhook failed 3×", detail: "Retry queue backed up · last 6 hr", dollarImpact: 0, age: 0, urgency: "high", compliance: false, cashRisk: false, confidence: 100, owner: "Engineering" },
  { id: "EX-2006", type: "attribution", title: "Revenue with no service", detail: "$4,200 · client unknown", dollarImpact: 4200, age: 6, urgency: "medium", compliance: false, cashRisk: false, confidence: 88, owner: "Sales Ops" },
  { id: "EX-2007", type: "leakage", title: "Unbilled reimbursable > 14d", detail: "Acme · 4 expenses · $3,200", dollarImpact: 3200, age: 15, urgency: "medium", compliance: false, cashRisk: false, confidence: 94, owner: "Sales Ops" },
  { id: "EX-2008", type: "bonus_verify", title: "Bonus math off by $88", detail: "Q1 payout · rounding", dollarImpact: 88, age: 2, urgency: "low", compliance: true, cashRisk: false, confidence: 99, owner: "HR" },
  { id: "EX-2009", type: "reconciliation", title: "Bank feed variance", detail: "Op ×4421 · $84 timing", dollarImpact: 84, age: 5, urgency: "low", compliance: false, cashRisk: false, confidence: 90, owner: "Christin" },
  { id: "EX-2010", type: "forecast_risk", title: "Projected cash < guardrail in 21d", detail: "Confidence 82% · 2 large bills due", dollarImpact: 42000, age: 0, urgency: "high", compliance: false, cashRisk: true, confidence: 82, owner: "Rose" },
  { id: "EX-2011", type: "data_quality", title: "6 vendors missing GL mapping", detail: "New vendors from Q1 import", dollarImpact: 0, age: 9, urgency: "medium", compliance: true, cashRisk: false, confidence: 100, owner: "Christin" },
  { id: "EX-2012", type: "accounting", title: "Journal draft awaiting review", detail: "Depreciation catch-up · $2,850", dollarImpact: 2850, age: 3, urgency: "medium", compliance: true, cashRisk: false, confidence: 100, owner: "Christin" },
];

export const EXCEPTION_TYPE_META: Record<ExceptionType, string> = {
  accounting: "Accounting",
  policy: "Policy",
  missing_receipt: "Receipt",
  failed_allocation: "Allocation",
  unmatched: "Unmatched",
  integration: "Integration",
  attribution: "Attribution",
  leakage: "Leakage",
  bonus_verify: "Bonus",
  reconciliation: "Reconciliation",
  forecast_risk: "Forecast",
  data_quality: "Data Quality",
};

/* ------------------------------------------------------------------ */
/* Smart collections                                                   */
/* ------------------------------------------------------------------ */

export type CollectionItem = {
  id: string;
  invoice: string;
  client: string;
  amount: number;
  daysOverdue: number;
  probability: number;
  paymentBehavior: "on_time" | "late_20" | "late_40" | "erratic";
  lastReminder: string;
  remindersSent: number;
  promiseDate?: string;
  dispute: boolean;
  serviceHold: boolean;
  recommendedContact: string;
  expectedCollection: string;
  escalation: string;
};

export const COLLECTIONS: CollectionItem[] = [
  { id: "C-1", invoice: "INV-2091", client: "Acme Holdings", amount: 24500, daysOverdue: 12, probability: 78, paymentBehavior: "late_20", lastReminder: "3 days ago", remindersSent: 2, promiseDate: "Fri", dispute: false, serviceHold: false, recommendedContact: "Call CFO · Wed 2pm", expectedCollection: "Next 7 days", escalation: "Manager review at 21d" },
  { id: "C-2", invoice: "INV-2088", client: "Blue Ridge Legal", amount: 8800, daysOverdue: 6, probability: 92, paymentBehavior: "on_time", lastReminder: "Yesterday", remindersSent: 1, dispute: false, serviceHold: false, recommendedContact: "Friendly reminder · email", expectedCollection: "This week", escalation: "None yet" },
  { id: "C-3", invoice: "INV-2072", client: "Northgate Ventures", amount: 42000, daysOverdue: 34, probability: 41, paymentBehavior: "erratic", lastReminder: "7 days ago", remindersSent: 4, dispute: true, serviceHold: true, recommendedContact: "Escalate to Rose", expectedCollection: "Uncertain", escalation: "Legal notice ready" },
  { id: "C-4", invoice: "INV-2081", client: "Pacific Retail", amount: 15600, daysOverdue: 19, probability: 66, paymentBehavior: "late_40", lastReminder: "4 days ago", remindersSent: 3, promiseDate: "Mon", dispute: false, serviceHold: false, recommendedContact: "Confirm promise · Mon 10am", expectedCollection: "Next 14 days", escalation: "Service hold at 30d" },
  { id: "C-5", invoice: "INV-2065", client: "Riverdale Estates", amount: 6200, daysOverdue: 45, probability: 28, paymentBehavior: "erratic", lastReminder: "12 days ago", remindersSent: 5, dispute: false, serviceHold: true, recommendedContact: "Final notice", expectedCollection: "Doubtful", escalation: "Send to collections" },
];

/* ------------------------------------------------------------------ */
/* Payables                                                            */
/* ------------------------------------------------------------------ */

export type PayableItem = {
  id: string;
  vendor: string;
  bill: string;
  amount: number;
  due: string;
  priority: "must_pay" | "safe_delay" | "restricted" | "critical_delivery" | "at_risk";
  discount?: string;
  penalty?: string;
  cashImpact: number;
  category: string;
};

export const PAYABLES: PayableItem[] = [
  { id: "P-1", vendor: "AWS", bill: "BILL-8801", amount: 8420, due: "Feb 22", priority: "must_pay", cashImpact: -8420, category: "Infra" },
  { id: "P-2", vendor: "State of NY (client filing)", bill: "BILL-8802", amount: 6200, due: "Feb 24", priority: "restricted", cashImpact: 0, category: "Pass-through" },
  { id: "P-3", vendor: "Notion", bill: "BILL-8803", amount: 1200, due: "Mar 05", priority: "safe_delay", discount: "2% net-10", cashImpact: -1176, category: "Software" },
  { id: "P-4", vendor: "Contract counsel", bill: "BILL-8804", amount: 14500, due: "Feb 20", priority: "critical_delivery", cashImpact: -14500, category: "Client delivery" },
  { id: "P-5", vendor: "Meta", bill: "BILL-8805", amount: 12500, due: "Feb 28", priority: "at_risk", penalty: "Campaign pause", cashImpact: -12500, category: "Marketing" },
  { id: "P-6", vendor: "Rose Bonuses", bill: "BILL-8806", amount: 18500, due: "Mar 15", priority: "safe_delay", cashImpact: -18500, category: "Comp" },
  { id: "P-7", vendor: "Chase", bill: "BILL-8807", amount: 4200, due: "Feb 21", priority: "must_pay", penalty: "Late fee $85", cashImpact: -4200, category: "Debt" },
];

export const PRIORITY_META = {
  must_pay: { label: "Must Pay", tone: "bg-destructive/15 text-destructive border-destructive/30" },
  safe_delay: { label: "Safe to Delay", tone: "bg-success/15 text-success border-success/30" },
  restricted: { label: "Restricted", tone: "bg-warning/15 text-warning border-warning/30" },
  critical_delivery: { label: "Client Critical", tone: "bg-brand/15 text-brand border-brand/30" },
  at_risk: { label: "At Risk", tone: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
} as const;

/* ------------------------------------------------------------------ */
/* Cash guardrails                                                     */
/* ------------------------------------------------------------------ */

export type Guardrail = {
  id: string;
  label: string;
  current: number;
  target: number;
  status: "healthy" | "watch" | "breach";
  description: string;
};

export const GUARDRAILS: Guardrail[] = [
  { id: "g1", label: "Payroll Reserve", current: 148000, target: 140000, status: "healthy", description: "≥ 2 payroll cycles reserved" },
  { id: "g2", label: "Tax Reserve", current: 62000, target: 60000, status: "healthy", description: "Q1 estimated + safety" },
  { id: "g3", label: "Pass-through Reserve", current: 41200, target: 41200, status: "healthy", description: "Matches outstanding obligations" },
  { id: "g4", label: "Commission Reserve", current: 22400, target: 24000, status: "watch", description: "Slight shortfall for Q1" },
  { id: "g5", label: "Minimum Operating Cash", current: 96000, target: 90000, status: "healthy", description: "Rolling 30-day minimum" },
  { id: "g6", label: "Max Discretionary / mo", current: 18600, target: 20000, status: "healthy", description: "Cap on non-essential spend" },
  { id: "g7", label: "Max Marketing / mo", current: 21800, target: 20000, status: "breach", description: "Over ceiling by $1.8k" },
  { id: "g8", label: "Tech Spend Ceiling / mo", current: 12400, target: 15000, status: "healthy", description: "Below ceiling" },
  { id: "g9", label: "High-Value Approval", current: 2500, target: 2500, status: "healthy", description: "Any expense ≥ $2.5k → Rose" },
];

export type Override = {
  id: string;
  guardrail: string;
  reason: string;
  approver: string;
  expires: string;
  impact: string;
  auditId: string;
};

export const OVERRIDES: Override[] = [
  { id: "OV-1", guardrail: "Max Marketing / mo", reason: "Product launch buy", approver: "Rose", expires: "Feb 28", impact: "+$1.8k over cap", auditId: "AUD-4491" },
  { id: "OV-2", guardrail: "Payroll Reserve", reason: "One-time vendor deposit", approver: "Dual", expires: "Feb 24", impact: "−$8k, restores Fri", auditId: "AUD-4498" },
];

/* ------------------------------------------------------------------ */
/* Budgets                                                             */
/* ------------------------------------------------------------------ */

export type BudgetScope =
  | "department" | "vendor" | "category" | "campaign" | "product"
  | "app" | "employee" | "project" | "client" | "initiative";

export type BudgetItem = {
  id: string;
  scope: BudgetScope;
  name: string;
  approved: number;
  committed: number;
  spent: number;
  forecast: number;
  remaining: number;
  status: "on_track" | "at_risk" | "exceeded" | "pending";
};

export const BUDGETS: BudgetItem[] = [
  { id: "B-01", scope: "department", name: "Marketing", approved: 60000, committed: 48000, spent: 46200, forecast: 62000, remaining: 13800, status: "at_risk" },
  { id: "B-02", scope: "department", name: "Engineering", approved: 90000, committed: 72000, spent: 68000, forecast: 88000, remaining: 22000, status: "on_track" },
  { id: "B-03", scope: "vendor", name: "AWS", approved: 30000, committed: 28000, spent: 24800, forecast: 31000, remaining: 5200, status: "exceeded" },
  { id: "B-04", scope: "category", name: "Software", approved: 45000, committed: 40000, spent: 38000, forecast: 44000, remaining: 7000, status: "on_track" },
  { id: "B-05", scope: "campaign", name: "Q1 Meta launch", approved: 20000, committed: 20000, spent: 18500, forecast: 21800, remaining: 1500, status: "at_risk" },
  { id: "B-06", scope: "app", name: "Filing Studio", approved: 24000, committed: 18000, spent: 16800, forecast: 22000, remaining: 7200, status: "on_track" },
  { id: "B-07", scope: "project", name: "Website relaunch", approved: 32000, committed: 28000, spent: 22000, forecast: 30000, remaining: 10000, status: "on_track" },
  { id: "B-08", scope: "client", name: "Acme retainer", approved: 48000, committed: 44000, spent: 41000, forecast: 47000, remaining: 7000, status: "on_track" },
  { id: "B-09", scope: "initiative", name: "AI cost reduction", approved: 15000, committed: 6000, spent: 4200, forecast: 13000, remaining: 10800, status: "on_track" },
  { id: "B-10", scope: "employee", name: "Rose T&E", approved: 6000, committed: 4200, spent: 3900, forecast: 5800, remaining: 2100, status: "pending" },
];

export const BUDGET_STATUS_META = {
  on_track: { label: "On Track", tone: "text-success" },
  at_risk: { label: "At Risk", tone: "text-warning" },
  exceeded: { label: "Exceeded", tone: "text-destructive" },
  pending: { label: "Pending", tone: "text-muted-foreground" },
} as const;

/* ------------------------------------------------------------------ */
/* Subscription actions                                                */
/* ------------------------------------------------------------------ */

export type SubAction = {
  id: string;
  vendor: string;
  recommendation: "reduce" | "cancel" | "renew" | "renegotiate" | "consolidate" | "assign_owner" | "usage_review" | "justify";
  owner: string;
  expectedSavings: number;
  realizedSavings: number;
  status: "open" | "in_progress" | "done" | "blocked";
  due: string;
  notes: string;
};

export const SUB_ACTIONS: SubAction[] = [
  { id: "SA-1", vendor: "Notion", recommendation: "reduce", owner: "Ops", expectedSavings: 2400, realizedSavings: 0, status: "open", due: "Mar 01", notes: "Reduce by 8 seats" },
  { id: "SA-2", vendor: "Figma", recommendation: "renegotiate", owner: "Design", expectedSavings: 3200, realizedSavings: 0, status: "in_progress", due: "Mar 10", notes: "Enterprise ramp discount" },
  { id: "SA-3", vendor: "Zapier", recommendation: "cancel", owner: "Ops", expectedSavings: 1800, realizedSavings: 1800, status: "done", due: "—", notes: "Replaced by n8n" },
  { id: "SA-4", vendor: "Loom", recommendation: "consolidate", owner: "Ops", expectedSavings: 900, realizedSavings: 0, status: "open", due: "Mar 05", notes: "Fold into Google Workspace" },
  { id: "SA-5", vendor: "Superhuman", recommendation: "usage_review", owner: "Sales", expectedSavings: 1400, realizedSavings: 0, status: "open", due: "Feb 28", notes: "Low usage 3 seats" },
  { id: "SA-6", vendor: "Various AI tools", recommendation: "justify", owner: "Engineering", expectedSavings: 4200, realizedSavings: 600, status: "in_progress", due: "Mar 15", notes: "Consolidate on 2 vendors" },
];

export const SUB_ACTION_META: Record<SubAction["recommendation"], string> = {
  reduce: "Reduce seats",
  cancel: "Cancel",
  renew: "Renew",
  renegotiate: "Renegotiate",
  consolidate: "Consolidate",
  assign_owner: "Assign owner",
  usage_review: "Usage review",
  justify: "Require justification",
};

/* ------------------------------------------------------------------ */
/* Revenue recovery workflow                                           */
/* ------------------------------------------------------------------ */

export type RecoveryItem = {
  id: string;
  client: string;
  source: string;
  amount: number;
  confidence: number;
  status: "new" | "verified" | "invoice_draft" | "on_next_invoice" | "contacted" | "collected" | "dismissed" | "nonrecoverable";
  owner: string;
  action: string;
  collected: number;
};

export const RECOVERIES: RecoveryItem[] = [
  { id: "REC-1", client: "Acme Holdings", source: "Unbilled reimbursables (4)", amount: 3200, confidence: 94, status: "on_next_invoice", owner: "Sales Ops", action: "Bundle into INV-2101", collected: 0 },
  { id: "REC-2", client: "Blue Ridge Legal", source: "Overage on retainer", amount: 1450, confidence: 88, status: "verified", owner: "Rose", action: "Send addendum", collected: 0 },
  { id: "REC-3", client: "Pacific Retail", source: "Unbilled hours", amount: 5800, confidence: 76, status: "new", owner: "Sales Ops", action: "Verify with PM", collected: 0 },
  { id: "REC-4", client: "Northgate Ventures", source: "Duplicate refund reversal", amount: 620, confidence: 100, status: "collected", owner: "Christin", action: "Applied", collected: 620 },
  { id: "REC-5", client: "Sunrise Group", source: "Scope creep", amount: 4400, confidence: 62, status: "contacted", owner: "Rose", action: "Awaiting reply", collected: 0 },
  { id: "REC-6", client: "Old Legacy Co", source: "Aged unbilled", amount: 900, confidence: 34, status: "nonrecoverable", owner: "Sales Ops", action: "Write off", collected: 0 },
];

/* ------------------------------------------------------------------ */
/* Bonus controls                                                      */
/* ------------------------------------------------------------------ */

export type BonusControl = {
  id: string;
  employee: string;
  plan: string;
  earned: number;
  eligible: number;
  held: number;
  released: number;
  reason: string;
  status: "cleared" | "partial_hold" | "hold" | "released";
};

export const BONUS_CONTROLS: BonusControl[] = [
  { id: "BC-1", employee: "Amir S.", plan: "Sales Q1", earned: 8400, eligible: 8400, held: 0, released: 8400, reason: "All invoices paid", status: "released" },
  { id: "BC-2", employee: "Priya N.", plan: "Sales Q1", earned: 6200, eligible: 4400, held: 1800, released: 0, reason: "INV-2091 outstanding", status: "partial_hold" },
  { id: "BC-3", employee: "Devon R.", plan: "Ops Q1", earned: 3600, eligible: 3600, held: 0, released: 0, reason: "Awaiting release", status: "cleared" },
  { id: "BC-4", employee: "Kai M.", plan: "Sales Q1", earned: 5400, eligible: 0, held: 5400, released: 0, reason: "INV-2072 disputed", status: "hold" },
  { id: "BC-5", employee: "Rin P.", plan: "Referral Q1", earned: 1200, eligible: 1200, held: 0, released: 1200, reason: "Paid", status: "released" },
];

/* ------------------------------------------------------------------ */
/* Data quality                                                        */
/* ------------------------------------------------------------------ */

export type DataQualityIssue = {
  id: string;
  category: string;
  count: number;
  impact: "low" | "medium" | "high";
  example: string;
  owner: string;
};

export const DATA_QUALITY: DataQualityIssue[] = [
  { id: "DQ-1", category: "Missing GL mapping", count: 6, impact: "medium", example: "6 new vendors this quarter", owner: "Christin" },
  { id: "DQ-2", category: "Missing client assignment", count: 12, impact: "high", example: "$8.4k of expenses unassigned", owner: "Sales Ops" },
  { id: "DQ-3", category: "Missing project attribution", count: 22, impact: "medium", example: "Design work unattributed", owner: "PMs" },
  { id: "DQ-4", category: "Missing receipts", count: 8, impact: "medium", example: "$2.1k over threshold", owner: "Rose" },
  { id: "DQ-5", category: "Duplicate vendors", count: 4, impact: "low", example: "AWS/Amazon Web Services", owner: "Christin" },
  { id: "DQ-6", category: "Invalid account mapping", count: 2, impact: "high", example: "Cash routed to income account", owner: "Christin" },
  { id: "DQ-7", category: "Unassigned subscription owner", count: 9, impact: "low", example: "9 tools ownerless", owner: "Ops" },
  { id: "DQ-8", category: "Stale customer records", count: 14, impact: "low", example: "Not updated in 12+ months", owner: "Sales Ops" },
  { id: "DQ-9", category: "Unverified bonus records", count: 3, impact: "medium", example: "Q1 payouts pending audit", owner: "HR" },
  { id: "DQ-10", category: "Unreconciled accounts", count: 1, impact: "high", example: "Chase Op ×4421", owner: "Christin" },
  { id: "DQ-11", category: "Failed source-system mappings", count: 5, impact: "medium", example: "Stripe → GL", owner: "Engineering" },
];

/* ------------------------------------------------------------------ */
/* Integration health                                                  */
/* ------------------------------------------------------------------ */

export type Integration = {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "down";
  lastSync: string;
  errors24h: number;
  recordsSynced: number;
  latencyMs: number;
};

export const INTEGRATIONS_HEALTH: Integration[] = [
  { id: "I-1", name: "Chase (Plaid)", status: "healthy", lastSync: "2 min ago", errors24h: 0, recordsSynced: 214, latencyMs: 480 },
  { id: "I-2", name: "Stripe", status: "degraded", lastSync: "38 min ago", errors24h: 3, recordsSynced: 62, latencyMs: 2200 },
  { id: "I-3", name: "Zoho Books", status: "healthy", lastSync: "4 min ago", errors24h: 0, recordsSynced: 118, latencyMs: 610 },
  { id: "I-4", name: "Gusto (payroll)", status: "healthy", lastSync: "1 hr ago", errors24h: 0, recordsSynced: 12, latencyMs: 720 },
  { id: "I-5", name: "Ramp (cards)", status: "healthy", lastSync: "8 min ago", errors24h: 1, recordsSynced: 84, latencyMs: 540 },
  { id: "I-6", name: "Meta Ads", status: "down", lastSync: "6 hr ago", errors24h: 14, recordsSynced: 0, latencyMs: 0 },
  { id: "I-7", name: "Google Ads", status: "healthy", lastSync: "12 min ago", errors24h: 0, recordsSynced: 36, latencyMs: 890 },
];

/* ------------------------------------------------------------------ */
/* Action plans                                                        */
/* ------------------------------------------------------------------ */

export type ActionPlan = {
  id: string;
  objective: string;
  owner: string;
  due: string;
  expectedSavings: number;
  realizedSavings: number;
  approval: "pending" | "approved";
  progressPct: number;
  status: "not_started" | "in_progress" | "at_risk" | "done";
  tasks: { title: string; done: boolean }[];
  sources: string[];
};

export const ACTION_PLANS: ActionPlan[] = [
  {
    id: "AP-1",
    objective: "Reduce AI + software spending by 15% over 60 days",
    owner: "Christin",
    due: "Apr 15",
    expectedSavings: 8400,
    realizedSavings: 2400,
    approval: "approved",
    progressPct: 34,
    status: "in_progress",
    tasks: [
      { title: "Cancel 3 low-usage tools", done: true },
      { title: "Renegotiate Figma", done: false },
      { title: "Consolidate on 2 AI vendors", done: false },
      { title: "Reduce Notion seats by 8", done: false },
    ],
    sources: ["Subscription Intelligence", "Tech & AI Economics"],
  },
  {
    id: "AP-2",
    objective: "Bring Marketing back within ceiling in 30 days",
    owner: "Rose",
    due: "Mar 22",
    expectedSavings: 1800,
    realizedSavings: 0,
    approval: "approved",
    progressPct: 12,
    status: "at_risk",
    tasks: [
      { title: "Pause underperforming Meta ad sets", done: false },
      { title: "Shift budget to Google branded", done: false },
      { title: "Weekly Rose review", done: true },
    ],
    sources: ["Marketing ROI", "Cash Guardrails"],
  },
  {
    id: "AP-3",
    objective: "Recover $42k of revenue leakage this quarter",
    owner: "Sales Ops",
    due: "Mar 31",
    expectedSavings: 42000,
    realizedSavings: 6100,
    approval: "approved",
    progressPct: 14,
    status: "in_progress",
    tasks: [
      { title: "Bundle unbilled reimbursables", done: true },
      { title: "Send retainer addendums", done: false },
      { title: "Escalate 2 disputed items to Rose", done: false },
    ],
    sources: ["Revenue Leakage"],
  },
  {
    id: "AP-4",
    objective: "Fix data quality on client attribution",
    owner: "Sales Ops",
    due: "Mar 05",
    expectedSavings: 0,
    realizedSavings: 0,
    approval: "pending",
    progressPct: 0,
    status: "not_started",
    tasks: [
      { title: "Assign clients to 12 orphan expenses", done: false },
      { title: "Merge duplicate vendors", done: false },
    ],
    sources: ["Data Quality Center"],
  },
];

/* ------------------------------------------------------------------ */
/* Decision log                                                        */
/* ------------------------------------------------------------------ */

export type DecisionEntry = {
  id: string;
  date: string;
  type: "approved_spend" | "rejected_spend" | "pricing" | "bonus" | "budget_override" | "software_cancel" | "campaign_increase" | "vendor_reneg" | "reserve_change" | "client_exception";
  title: string;
  decidedBy: string;
  amount: number;
  rationale: string;
  linkedRecords: string[];
};

export const DECISION_LOG: DecisionEntry[] = [
  { id: "D-01", date: "2026-02-18", type: "approved_spend", title: "Approve Meta Q1 launch buy", decidedBy: "Rose", amount: 12500, rationale: "Q1 ROI target 2.4x; within launch window", linkedRecords: ["APV-1042"] },
  { id: "D-02", date: "2026-02-17", type: "software_cancel", title: "Cancel Zapier", decidedBy: "Christin", amount: -1800, rationale: "Replaced by n8n; usage < 5%", linkedRecords: ["SA-3"] },
  { id: "D-03", date: "2026-02-15", type: "bonus", title: "Hold Kai M. Q1 bonus", decidedBy: "Rose", amount: -5400, rationale: "INV-2072 disputed; release after collection", linkedRecords: ["BC-4"] },
  { id: "D-04", date: "2026-02-14", type: "vendor_reneg", title: "Figma enterprise ramp discount", decidedBy: "Rose", amount: -3200, rationale: "Renewal negotiation window", linkedRecords: ["SA-2"] },
  { id: "D-05", date: "2026-02-12", type: "budget_override", title: "Marketing ceiling override", decidedBy: "Dual", amount: 1800, rationale: "One-time launch buy, expires Feb 28", linkedRecords: ["OV-1"] },
  { id: "D-06", date: "2026-02-10", type: "rejected_spend", title: "Reject 3rd design agency retainer", decidedBy: "Rose", amount: -9500, rationale: "Insufficient ROI evidence; revisit Q2", linkedRecords: ["APV-1048"] },
  { id: "D-07", date: "2026-02-08", type: "pricing", title: "Raise retainer floor to $6k/mo", decidedBy: "Rose", amount: 0, rationale: "Below-target margin on <$6k retainers", linkedRecords: ["Profitability report"] },
  { id: "D-08", date: "2026-02-05", type: "reserve_change", title: "Raise payroll reserve target", decidedBy: "Rose", amount: 20000, rationale: "Team growth + longer AR cycle", linkedRecords: ["Guardrails"] },
  { id: "D-09", date: "2026-02-03", type: "campaign_increase", title: "Google branded +$3k / mo", decidedBy: "Rose", amount: 3000, rationale: "42-day payback, above threshold", linkedRecords: ["Marketing ROI"] },
  { id: "D-10", date: "2026-02-01", type: "client_exception", title: "Waive late fee — Acme", decidedBy: "Rose", amount: -320, rationale: "Long-standing client goodwill", linkedRecords: ["INV-2088"] },
];

/* ------------------------------------------------------------------ */
/* Command center KPIs                                                 */
/* ------------------------------------------------------------------ */

export const AUTOMATION_KPIS = {
  activeRules: AUTOMATION_RULES.filter((r) => r.status === "active").length,
  testRules: AUTOMATION_RULES.filter((r) => r.status === "test_mode").length,
  pendingApprovals: APPROVAL_ITEMS.length,
  openExceptions: EXCEPTIONS.length,
  overdueCollections: COLLECTIONS.reduce((s, c) => s + c.amount, 0),
  expectedSavings: ACTION_PLANS.reduce((s, a) => s + a.expectedSavings, 0),
  realizedSavings: ACTION_PLANS.reduce((s, a) => s + a.realizedSavings, 0),
  guardrailBreaches: GUARDRAILS.filter((g) => g.status === "breach").length,
  integrationDown: INTEGRATIONS_HEALTH.filter((i) => i.status !== "healthy").length,
};
