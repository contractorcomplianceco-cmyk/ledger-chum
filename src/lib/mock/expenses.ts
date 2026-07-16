// Mock data for LedgerOS Phase 2B — Expense Management.
// Demonstration data only. No live accounting connection.

export const DEMO_NOTICE = "UI demonstration only — no accounting record was modified.";

export type ExpenseStatus =
  | "draft"
  | "submitted"
  | "needs_changes"
  | "pending_manager"
  | "pending_accounting"
  | "pending_rose"
  | "approved"
  | "rejected"
  | "paid"
  | "closed";

export type PolicyResult =
  | "compliant"
  | "warning"
  | "explanation_required"
  | "approval_required"
  | "blocked"
  | "possible_duplicate"
  | "missing_documentation";

export type ReceiptStatus =
  | "new"
  | "processing"
  | "ready"
  | "low_confidence"
  | "possible_duplicate"
  | "missing_expense"
  | "matched"
  | "rejected";

export type MatchStatus = "exact" | "high" | "possible" | "none" | "duplicate";

export type ReimbursementStatus =
  | "not_applicable"
  | "awaiting_approval"
  | "approved"
  | "scheduled"
  | "paid"
  | "returned"
  | "rejected";

export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export type ExpenseCategory =
  | "payroll"
  | "technology"
  | "ai"
  | "marketing"
  | "travel"
  | "professional"
  | "office"
  | "banking"
  | "other";

export const CATEGORY_META: Record<ExpenseCategory, { label: string; color: string }> = {
  payroll: { label: "Payroll", color: "#3b82f6" },
  technology: { label: "Technology", color: "#22d3ee" },
  ai: { label: "AI", color: "#8b5cf6" },
  marketing: { label: "Marketing", color: "#f59e0b" },
  travel: { label: "Travel", color: "#10b981" },
  professional: { label: "Professional Services", color: "#ec4899" },
  office: { label: "Office", color: "#6366f1" },
  banking: { label: "Banking Fees", color: "#64748b" },
  other: { label: "Other", color: "#94a3b8" },
};

export const STATUS_META: Record<
  ExpenseStatus,
  { label: string; tone: "muted" | "brand" | "warning" | "success" | "destructive" | "violet" }
> = {
  draft: { label: "Draft", tone: "muted" },
  submitted: { label: "Submitted", tone: "brand" },
  needs_changes: { label: "Needs Changes", tone: "warning" },
  pending_manager: { label: "Pending Manager", tone: "brand" },
  pending_accounting: { label: "Pending Accounting", tone: "brand" },
  pending_rose: { label: "Pending Rose", tone: "violet" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "destructive" },
  paid: { label: "Paid", tone: "success" },
  closed: { label: "Closed", tone: "muted" },
};

export const POLICY_META: Record<
  PolicyResult,
  { label: string; tone: "success" | "warning" | "destructive" | "brand" | "muted" }
> = {
  compliant: { label: "Compliant", tone: "success" },
  warning: { label: "Warning", tone: "warning" },
  explanation_required: { label: "Explanation Required", tone: "warning" },
  approval_required: { label: "Approval Required", tone: "brand" },
  blocked: { label: "Blocked", tone: "destructive" },
  possible_duplicate: { label: "Possible Duplicate", tone: "destructive" },
  missing_documentation: { label: "Missing Receipt", tone: "warning" },
};

export type Expense = {
  id: string;
  date: string;
  employee: string;
  vendor: string;
  description: string;
  category: ExpenseCategory;
  department: string;
  client?: string;
  project?: string;
  productApp?: string;
  amount: number;
  paymentMethod: string;
  companyPaid: boolean;
  reimbursable: boolean;
  hasReceipt: boolean;
  match: MatchStatus;
  policy: PolicyResult;
  status: ExpenseStatus;
  reimbursement: ReimbursementStatus;
  anomaly?: AnomalySeverity;
  note?: string;
};

const D = (m: number, d: number) =>
  `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export const EXPENSES: Expense[] = [
  {
    id: "EXP-1042",
    date: D(7, 8),
    employee: "Christin Alvarez",
    vendor: "OpenAI",
    description: "GPT-5 Team plan · 4 seats",
    category: "ai",
    department: "Product",
    productApp: "Copilot",
    amount: 480,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "exact",
    policy: "compliant",
    status: "approved",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1043",
    date: D(7, 8),
    employee: "Rose Taylor",
    vendor: "Delta Airlines",
    description: "SFO → JFK — client visit ALD",
    category: "travel",
    department: "Sales",
    client: "ALD",
    amount: 812.4,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: true,
    hasReceipt: true,
    match: "high",
    policy: "warning",
    status: "pending_accounting",
    reimbursement: "not_applicable",
    note: "Client-billable per contract 2.4a",
  },
  {
    id: "EXP-1044",
    date: D(7, 7),
    employee: "Marcus Chen",
    vendor: "Uber",
    description: "Client meeting transport",
    category: "travel",
    department: "Sales",
    client: "Northwind",
    amount: 42.15,
    paymentMethod: "Personal",
    companyPaid: false,
    reimbursable: true,
    hasReceipt: false,
    match: "none",
    policy: "missing_documentation",
    status: "submitted",
    reimbursement: "awaiting_approval",
  },
  {
    id: "EXP-1045",
    date: D(7, 7),
    employee: "System",
    vendor: "Vercel",
    description: "Pro plan — monthly",
    category: "technology",
    department: "Engineering",
    productApp: "LedgerOS",
    amount: 320,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "exact",
    policy: "compliant",
    status: "paid",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1046",
    date: D(7, 6),
    employee: "System",
    vendor: "Lovable",
    description: "Team plan — annual renewal",
    category: "ai",
    department: "Engineering",
    productApp: "LedgerOS",
    amount: 2400,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "exact",
    policy: "approval_required",
    status: "pending_rose",
    reimbursement: "not_applicable",
    anomaly: "medium",
    note: "First annual renewal >$2,500 threshold reached in single charge",
  },
  {
    id: "EXP-1047",
    date: D(7, 6),
    employee: "Priya Menon",
    vendor: "Canva",
    description: "Pro seat",
    category: "marketing",
    department: "Marketing",
    amount: 12.99,
    paymentMethod: "Personal",
    companyPaid: false,
    reimbursable: true,
    hasReceipt: true,
    match: "high",
    policy: "compliant",
    status: "approved",
    reimbursement: "scheduled",
  },
  {
    id: "EXP-1048",
    date: D(7, 5),
    employee: "System",
    vendor: "Google Ads",
    description: "Campaign: CCA — Compliance Q3",
    category: "marketing",
    department: "Marketing",
    productApp: "CCA",
    amount: 4210.55,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "high",
    policy: "compliant",
    status: "paid",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1049",
    date: D(7, 5),
    employee: "System",
    vendor: "Meta Ads",
    description: "Campaign: Retargeting Q3",
    category: "marketing",
    department: "Marketing",
    productApp: "CCA",
    amount: 1980.0,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: false,
    match: "high",
    policy: "missing_documentation",
    status: "pending_accounting",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1050",
    date: D(7, 4),
    employee: "Christin Alvarez",
    vendor: "Zoho Books",
    description: "Legacy — final month",
    category: "technology",
    department: "Finance",
    amount: 89,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "exact",
    policy: "warning",
    status: "approved",
    reimbursement: "not_applicable",
    anomaly: "low",
    note: "Cancellation candidate — replaced by LedgerOS",
  },
  {
    id: "EXP-1051",
    date: D(7, 4),
    employee: "Rose Taylor",
    vendor: "Amazon Business",
    description: "Office supplies",
    category: "office",
    department: "Operations",
    amount: 214.88,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "exact",
    policy: "compliant",
    status: "approved",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1052",
    date: D(7, 3),
    employee: "Marcus Chen",
    vendor: "Chipotle",
    description: "Team lunch — Q3 planning",
    category: "office",
    department: "Engineering",
    amount: 187.4,
    paymentMethod: "Personal",
    companyPaid: false,
    reimbursable: true,
    hasReceipt: true,
    match: "high",
    policy: "explanation_required",
    status: "needs_changes",
    reimbursement: "awaiting_approval",
    note: "Attendees required for meals >$100",
  },
  {
    id: "EXP-1053",
    date: D(7, 3),
    employee: "System",
    vendor: "GitHub",
    description: "Team plan",
    category: "technology",
    department: "Engineering",
    productApp: "LedgerOS",
    amount: 168,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "exact",
    policy: "compliant",
    status: "paid",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1054",
    date: D(7, 2),
    employee: "System",
    vendor: "Replit",
    description: "Teams plan",
    category: "technology",
    department: "Engineering",
    amount: 240,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "possible",
    policy: "warning",
    status: "approved",
    reimbursement: "not_applicable",
    anomaly: "medium",
    note: "Overlap with Vercel/Lovable — duplicate capability",
  },
  {
    id: "EXP-1055",
    date: D(7, 2),
    employee: "Christin Alvarez",
    vendor: "IRS",
    description: "State filing fee — client ALD",
    category: "professional",
    department: "Compliance",
    client: "ALD",
    amount: 350,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: true,
    hasReceipt: true,
    match: "exact",
    policy: "compliant",
    status: "approved",
    reimbursement: "not_applicable",
    note: "Pass-through — recoverable at cost",
  },
  {
    id: "EXP-1056",
    date: D(7, 1),
    employee: "Rose Taylor",
    vendor: "ATM Withdrawal",
    description: "Cash withdrawal — Chase",
    category: "banking",
    department: "Operations",
    amount: 400,
    paymentMethod: "Debit",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: false,
    match: "exact",
    policy: "explanation_required",
    status: "pending_accounting",
    reimbursement: "not_applicable",
    anomaly: "high",
    note: "Cash withdrawals always require review",
  },
  {
    id: "EXP-1057",
    date: D(6, 30),
    employee: "Priya Menon",
    vendor: "RingCentral",
    description: "Phone system — monthly",
    category: "technology",
    department: "Operations",
    amount: 148,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "exact",
    policy: "compliant",
    status: "paid",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1058",
    date: D(6, 29),
    employee: "System",
    vendor: "ADP",
    description: "Payroll processing fee",
    category: "payroll",
    department: "Finance",
    amount: 380,
    paymentMethod: "ACH",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "exact",
    policy: "compliant",
    status: "paid",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1059",
    date: D(6, 28),
    employee: "Marcus Chen",
    vendor: "Hilton",
    description: "Client visit — 2 nights",
    category: "travel",
    department: "Sales",
    client: "Northwind",
    amount: 612.5,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: true,
    hasReceipt: true,
    match: "high",
    policy: "compliant",
    status: "approved",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1060",
    date: D(6, 27),
    employee: "Rose Taylor",
    vendor: "Notion",
    description: "Team seats",
    category: "technology",
    department: "Operations",
    amount: 96,
    paymentMethod: "Amex •• 1004",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "exact",
    policy: "compliant",
    status: "paid",
    reimbursement: "not_applicable",
  },
  {
    id: "EXP-1061",
    date: D(6, 26),
    employee: "Christin Alvarez",
    vendor: "Contractor — J. Rivera",
    description: "Bookkeeping cleanup — June",
    category: "professional",
    department: "Finance",
    amount: 1800,
    paymentMethod: "ACH",
    companyPaid: true,
    reimbursable: false,
    hasReceipt: true,
    match: "high",
    policy: "compliant",
    status: "approved",
    reimbursement: "not_applicable",
  },
];

export function expenseKpis(items = EXPENSES) {
  const total = items.reduce((a, e) => a + e.amount, 0);
  const pending = items.filter((e) => e.status.startsWith("pending") || e.status === "submitted");
  const reimb = items.filter(
    (e) => e.reimbursable && e.reimbursement !== "not_applicable" && e.reimbursement !== "paid",
  );
  const unmatched = items.filter((e) => e.match === "none" || e.match === "possible");
  const missing = items.filter((e) => !e.hasReceipt);
  const exceptions = items.filter((e) => e.policy !== "compliant");
  const subs = items.filter((e) => ["technology", "ai"].includes(e.category));
  const anomalies = items.filter((e) => e.anomaly);
  return {
    total,
    pending: pending.reduce((a, e) => a + e.amount, 0),
    pendingCount: pending.length,
    reimbursable: reimb.reduce((a, e) => a + e.amount, 0),
    unmatched: unmatched.length,
    missing: missing.length,
    exceptions: exceptions.length,
    subscriptions: subs.reduce((a, e) => a + e.amount, 0),
    anomalies: anomalies.length,
  };
}

export const SPEND_BY_CATEGORY = (Object.keys(CATEGORY_META) as ExpenseCategory[]).map((k) => {
  const items = EXPENSES.filter((e) => e.category === k);
  return {
    key: k,
    label: CATEGORY_META[k].label,
    color: CATEGORY_META[k].color,
    value: items.reduce((a, e) => a + e.amount, 0),
  };
});

export const SPEND_BY_DEPT = Array.from(
  EXPENSES.reduce(
    (m, e) => m.set(e.department, (m.get(e.department) ?? 0) + e.amount),
    new Map<string, number>(),
  ),
).map(([label, value]) => ({ label, value }));

export const SPEND_TREND = [
  { m: "Feb", current: 42_100, prior: 39_800, budget: 45_000, forecast: 43_500 },
  { m: "Mar", current: 47_200, prior: 41_400, budget: 46_000, forecast: 47_000 },
  { m: "Apr", current: 51_800, prior: 44_900, budget: 48_000, forecast: 50_400 },
  { m: "May", current: 55_400, prior: 48_600, budget: 51_000, forecast: 54_000 },
  { m: "Jun", current: 61_200, prior: 52_100, budget: 55_000, forecast: 59_500 },
  { m: "Jul", current: 58_700, prior: 55_800, budget: 58_000, forecast: 62_000 },
];

// ---------- Receipts ----------
export type Receipt = {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  uploadedBy: string;
  source: "email" | "mobile" | "web" | "integration";
  confidence: number;
  suggestedCategory: ExpenseCategory;
  suggestedMatch?: string;
  status: ReceiptStatus;
};

export const RECEIPTS: Receipt[] = [
  {
    id: "RCP-501",
    vendor: "OpenAI",
    date: D(7, 8),
    amount: 480,
    uploadedBy: "email@ledgeros.co",
    source: "email",
    confidence: 0.98,
    suggestedCategory: "ai",
    suggestedMatch: "EXP-1042",
    status: "matched",
  },
  {
    id: "RCP-502",
    vendor: "Delta Air Lines",
    date: D(7, 8),
    amount: 812.4,
    uploadedBy: "Rose Taylor",
    source: "mobile",
    confidence: 0.94,
    suggestedCategory: "travel",
    suggestedMatch: "EXP-1043",
    status: "ready",
  },
  {
    id: "RCP-503",
    vendor: "Uber",
    date: D(7, 7),
    amount: 42.15,
    uploadedBy: "Marcus Chen",
    source: "mobile",
    confidence: 0.62,
    suggestedCategory: "travel",
    status: "low_confidence",
  },
  {
    id: "RCP-504",
    vendor: "Chipotle",
    date: D(7, 3),
    amount: 187.4,
    uploadedBy: "Marcus Chen",
    source: "mobile",
    confidence: 0.88,
    suggestedCategory: "office",
    suggestedMatch: "EXP-1052",
    status: "ready",
  },
  {
    id: "RCP-505",
    vendor: "Amazon",
    date: D(7, 4),
    amount: 214.88,
    uploadedBy: "Rose Taylor",
    source: "email",
    confidence: 0.96,
    suggestedCategory: "office",
    suggestedMatch: "EXP-1051",
    status: "matched",
  },
  {
    id: "RCP-506",
    vendor: "Hilton Downtown",
    date: D(6, 28),
    amount: 612.5,
    uploadedBy: "Marcus Chen",
    source: "email",
    confidence: 0.91,
    suggestedCategory: "travel",
    suggestedMatch: "EXP-1059",
    status: "matched",
  },
  {
    id: "RCP-507",
    vendor: "Canva",
    date: D(7, 6),
    amount: 12.99,
    uploadedBy: "integration",
    source: "integration",
    confidence: 0.99,
    suggestedCategory: "marketing",
    suggestedMatch: "EXP-1047",
    status: "matched",
  },
  {
    id: "RCP-508",
    vendor: "Unknown vendor",
    date: D(7, 8),
    amount: 63.5,
    uploadedBy: "Priya Menon",
    source: "mobile",
    confidence: 0.42,
    suggestedCategory: "other",
    status: "low_confidence",
  },
  {
    id: "RCP-509",
    vendor: "Meta Ads",
    date: D(7, 5),
    amount: 1980,
    uploadedBy: "System",
    source: "integration",
    confidence: 0.9,
    suggestedCategory: "marketing",
    suggestedMatch: "EXP-1049",
    status: "missing_expense",
  },
  {
    id: "RCP-510",
    vendor: "Delta Air Lines",
    date: D(7, 8),
    amount: 812.4,
    uploadedBy: "Rose Taylor",
    source: "email",
    confidence: 0.95,
    suggestedCategory: "travel",
    status: "possible_duplicate",
  },
];

// ---------- Approvals ----------
export const APPROVAL_QUEUE = EXPENSES.filter(
  (e) => e.status.startsWith("pending") || e.status === "submitted" || e.status === "needs_changes",
);

// ---------- Policies ----------
export type Policy = {
  id: string;
  name: string;
  category: string;
  applies: string;
  condition: string;
  threshold?: string;
  action: PolicyResult;
  severity: "info" | "warning" | "critical";
  owner: string;
  active: boolean;
};

export const POLICIES: Policy[] = [
  {
    id: "PL-01",
    name: "Receipt required over $25",
    category: "Receipt",
    applies: "All expenses",
    condition: "amount > $25 AND no receipt",
    action: "missing_documentation",
    severity: "warning",
    owner: "Christin",
    active: true,
  },
  {
    id: "PL-02",
    name: "Rose approval over $2,500",
    category: "Threshold",
    applies: "All categories",
    condition: "amount > $2,500",
    action: "approval_required",
    severity: "warning",
    owner: "Rose",
    active: true,
  },
  {
    id: "PL-03",
    name: "Travel requires preapproval",
    category: "Travel",
    applies: "Travel",
    condition: "no linked pre-spend",
    action: "explanation_required",
    severity: "warning",
    owner: "Rose",
    active: true,
  },
  {
    id: "PL-04",
    name: "New software requires owner",
    category: "Software",
    applies: "AI / Technology",
    condition: "no productApp attribution",
    action: "explanation_required",
    severity: "warning",
    owner: "Carmen",
    active: true,
  },
  {
    id: "PL-05",
    name: "AI expense requires attribution",
    category: "AI",
    applies: "AI",
    condition: "no client OR app OR department",
    action: "approval_required",
    severity: "warning",
    owner: "Rose",
    active: true,
  },
  {
    id: "PL-06",
    name: "Marketing requires campaign",
    category: "Marketing",
    applies: "Marketing",
    condition: "no campaign tag",
    action: "explanation_required",
    severity: "warning",
    owner: "Priya",
    active: true,
  },
  {
    id: "PL-07",
    name: "New vendor requires W-9",
    category: "Vendor",
    applies: "All",
    condition: "vendor first appearance",
    action: "approval_required",
    severity: "warning",
    owner: "Christin",
    active: true,
  },
  {
    id: "PL-08",
    name: "Weekend expenses require explanation",
    category: "Timing",
    applies: "All",
    condition: "date is weekend",
    action: "explanation_required",
    severity: "info",
    owner: "Christin",
    active: true,
  },
  {
    id: "PL-09",
    name: "Cash withdrawals always reviewed",
    category: "Banking",
    applies: "Cash",
    condition: "payment method = Debit/ATM",
    action: "explanation_required",
    severity: "critical",
    owner: "Rose",
    active: true,
  },
  {
    id: "PL-10",
    name: "Duplicate vendor/date/amount blocked",
    category: "Duplicate",
    applies: "All",
    condition: "same vendor+date+amount ×2",
    action: "blocked",
    severity: "critical",
    owner: "Christin",
    active: true,
  },
  {
    id: "PL-11",
    name: "Closed period requires adjustment",
    category: "Period",
    applies: "All",
    condition: "date in locked period",
    action: "blocked",
    severity: "critical",
    owner: "Christin",
    active: true,
  },
  {
    id: "PL-12",
    name: "Meals >$100 require attendees",
    category: "Meals",
    applies: "Office / Travel",
    condition: "amount > $100 AND no attendees",
    action: "explanation_required",
    severity: "warning",
    owner: "Rose",
    active: true,
  },
];

// ---------- Anomalies ----------
export type Anomaly = {
  id: string;
  severity: AnomalySeverity;
  vendor: string;
  reason: string;
  expected: number;
  actual: number;
  variance: number;
  department: string;
  owner?: string;
  suggested: string;
  confidence: number;
  expenseId?: string;
  impact: number;
};

export const ANOMALIES: Anomaly[] = [
  {
    id: "AN-01",
    severity: "high",
    vendor: "Lovable",
    reason: "Vendor amount increased 400% (monthly→annual charge)",
    expected: 200,
    actual: 2400,
    variance: 1100,
    department: "Engineering",
    owner: "Rose",
    suggested: "Confirm annual pre-approval; reclassify as prepaid asset",
    confidence: 0.94,
    expenseId: "EXP-1046",
    impact: 2200,
  },
  {
    id: "AN-02",
    severity: "medium",
    vendor: "Replit",
    reason: "Duplicate capability — overlaps with Vercel + Lovable",
    expected: 0,
    actual: 240,
    variance: 100,
    department: "Engineering",
    owner: "Marcus",
    suggested: "Assess consolidation; cancel if unused",
    confidence: 0.78,
    expenseId: "EXP-1054",
    impact: 240,
  },
  {
    id: "AN-03",
    severity: "critical",
    vendor: "ATM Withdrawal",
    reason: "Cash withdrawal without documentation",
    expected: 0,
    actual: 400,
    variance: 100,
    department: "Operations",
    owner: "Rose",
    suggested: "Require business purpose + receipt within 3 days",
    confidence: 0.99,
    expenseId: "EXP-1056",
    impact: 400,
  },
  {
    id: "AN-04",
    severity: "medium",
    vendor: "Meta Ads",
    reason: "Marketing spend missing campaign attribution + receipt",
    expected: 1800,
    actual: 1980,
    variance: 10,
    department: "Marketing",
    owner: "Priya",
    suggested: "Attach campaign tag; upload receipt from ad platform",
    confidence: 0.86,
    expenseId: "EXP-1049",
    impact: 1980,
  },
  {
    id: "AN-05",
    severity: "low",
    vendor: "Zoho Books",
    reason: "Vendor scheduled for cancellation — active charge continues",
    expected: 0,
    actual: 89,
    variance: 100,
    department: "Finance",
    owner: "Christin",
    suggested: "Confirm cancellation; final billing month",
    confidence: 0.9,
    expenseId: "EXP-1050",
    impact: 89,
  },
  {
    id: "AN-06",
    severity: "high",
    vendor: "New Vendor — 'Momentum Labs'",
    reason: "First-time vendor; no W-9 on file; single $3,200 charge",
    expected: 0,
    actual: 3200,
    variance: 100,
    department: "Marketing",
    owner: "Priya",
    suggested: "Require W-9 before payment posts",
    confidence: 0.88,
    impact: 3200,
  },
];

// ---------- Subscriptions ----------
export type SubscriptionStatus =
  | "healthy"
  | "underused"
  | "price_increase"
  | "renewal_soon"
  | "duplicate"
  | "no_owner"
  | "cancellation_candidate"
  | "review_required";

export type Subscription = {
  id: string;
  vendor: string;
  product: string;
  category: ExpenseCategory;
  department: string;
  owner?: string;
  frequency: "monthly" | "annual" | "quarterly";
  currentCost: number;
  priorCost: number;
  seats: number;
  activeUsers: number;
  renewalDate: string;
  cancelDeadline: string;
  contractTerm: string;
  revenueSupported?: string;
  status: SubscriptionStatus;
  recommendation: string;
};

export const SUBSCRIPTIONS: Subscription[] = [
  {
    id: "SUB-01",
    vendor: "OpenAI",
    product: "GPT-5 Team",
    category: "ai",
    department: "Product",
    owner: "Christin",
    frequency: "monthly",
    currentCost: 480,
    priorCost: 480,
    seats: 4,
    activeUsers: 4,
    renewalDate: D(8, 8),
    cancelDeadline: D(7, 25),
    contractTerm: "Month-to-month",
    revenueSupported: "Copilot workflows",
    status: "healthy",
    recommendation: "Keep — 100% utilization",
  },
  {
    id: "SUB-02",
    vendor: "Lovable",
    product: "Team — annual",
    category: "ai",
    department: "Engineering",
    owner: "Marcus",
    frequency: "annual",
    currentCost: 2400,
    priorCost: 200,
    seats: 8,
    activeUsers: 6,
    renewalDate: D(7, 6),
    cancelDeadline: D(6, 20),
    contractTerm: "12 months",
    revenueSupported: "LedgerOS build",
    status: "price_increase",
    recommendation: "Amortize; confirm annual pre-approval",
  },
  {
    id: "SUB-03",
    vendor: "Replit",
    product: "Teams",
    category: "technology",
    department: "Engineering",
    owner: "Marcus",
    frequency: "monthly",
    currentCost: 240,
    priorCost: 240,
    seats: 10,
    activeUsers: 3,
    renewalDate: D(8, 2),
    cancelDeadline: D(7, 20),
    contractTerm: "Monthly",
    status: "underused",
    recommendation: "Reduce seats to 4 — save $144/mo",
  },
  {
    id: "SUB-04",
    vendor: "Vercel",
    product: "Pro",
    category: "technology",
    department: "Engineering",
    owner: "Marcus",
    frequency: "monthly",
    currentCost: 320,
    priorCost: 320,
    seats: 5,
    activeUsers: 5,
    renewalDate: D(8, 7),
    cancelDeadline: D(7, 30),
    contractTerm: "Monthly",
    revenueSupported: "LedgerOS hosting",
    status: "healthy",
    recommendation: "Keep",
  },
  {
    id: "SUB-05",
    vendor: "Canva",
    product: "Pro",
    category: "marketing",
    department: "Marketing",
    owner: "Priya",
    frequency: "monthly",
    currentCost: 12.99,
    priorCost: 12.99,
    seats: 1,
    activeUsers: 1,
    renewalDate: D(8, 6),
    cancelDeadline: D(7, 30),
    contractTerm: "Monthly",
    status: "healthy",
    recommendation: "Keep",
  },
  {
    id: "SUB-06",
    vendor: "GitHub",
    product: "Team",
    category: "technology",
    department: "Engineering",
    owner: "Marcus",
    frequency: "monthly",
    currentCost: 168,
    priorCost: 168,
    seats: 8,
    activeUsers: 8,
    renewalDate: D(8, 3),
    cancelDeadline: D(7, 28),
    contractTerm: "Monthly",
    revenueSupported: "LedgerOS build",
    status: "healthy",
    recommendation: "Keep",
  },
  {
    id: "SUB-07",
    vendor: "Zoho Books",
    product: "Professional",
    category: "technology",
    department: "Finance",
    owner: "Christin",
    frequency: "monthly",
    currentCost: 89,
    priorCost: 89,
    seats: 3,
    activeUsers: 1,
    renewalDate: D(8, 4),
    cancelDeadline: D(7, 22),
    contractTerm: "Monthly",
    status: "cancellation_candidate",
    recommendation: "Cancel — replaced by LedgerOS",
  },
  {
    id: "SUB-08",
    vendor: "Notion",
    product: "Business",
    category: "technology",
    department: "Operations",
    owner: "Rose",
    frequency: "monthly",
    currentCost: 96,
    priorCost: 96,
    seats: 6,
    activeUsers: 6,
    renewalDate: D(7, 27),
    cancelDeadline: D(7, 20),
    contractTerm: "Monthly",
    status: "renewal_soon",
    recommendation: "Renew — high usage",
  },
  {
    id: "SUB-09",
    vendor: "RingCentral",
    product: "Standard",
    category: "technology",
    department: "Operations",
    owner: "Rose",
    frequency: "monthly",
    currentCost: 148,
    priorCost: 148,
    seats: 5,
    activeUsers: 3,
    renewalDate: D(7, 30),
    cancelDeadline: D(7, 25),
    contractTerm: "Monthly",
    status: "underused",
    recommendation: "Reduce seats to 3",
  },
  {
    id: "SUB-10",
    vendor: "Miscellaneous SaaS",
    product: "Team",
    category: "technology",
    department: "Unknown",
    frequency: "monthly",
    currentCost: 220,
    priorCost: 220,
    seats: 3,
    activeUsers: 0,
    renewalDate: D(8, 12),
    cancelDeadline: D(8, 1),
    contractTerm: "Monthly",
    status: "no_owner",
    recommendation: "Assign owner or cancel",
  },
];

export const SUB_STATUS_META: Record<
  SubscriptionStatus,
  { label: string; tone: "success" | "warning" | "destructive" | "brand" | "muted" | "violet" }
> = {
  healthy: { label: "Healthy", tone: "success" },
  underused: { label: "Underused", tone: "warning" },
  price_increase: { label: "Price Increase", tone: "warning" },
  renewal_soon: { label: "Renewal Soon", tone: "brand" },
  duplicate: { label: "Duplicate Capability", tone: "warning" },
  no_owner: { label: "No Owner", tone: "destructive" },
  cancellation_candidate: { label: "Cancellation Candidate", tone: "violet" },
  review_required: { label: "Review Required", tone: "warning" },
};

// ---------- Pre-Spend Requests ----------
export type PreSpendStatus =
  | "draft"
  | "submitted"
  | "needs_info"
  | "pending_manager"
  | "pending_accounting"
  | "pending_rose"
  | "approved"
  | "rejected"
  | "expired"
  | "converted";

export type PreSpend = {
  id: string;
  requester: string;
  department: string;
  type: string;
  vendor: string;
  description: string;
  amount: number;
  frequency: "one_time" | "monthly" | "annual";
  reason: string;
  expectedOutcome: string;
  neededBy: string;
  status: PreSpendStatus;
  duplicateRisk?: string;
  paybackMonths?: number;
};

export const PRESPENDS: PreSpend[] = [
  {
    id: "PSR-201",
    requester: "Marcus Chen",
    department: "Engineering",
    type: "AI tool",
    vendor: "Cursor",
    description: "IDE licenses for engineering team",
    amount: 480,
    frequency: "monthly",
    reason: "Faster review cycles",
    expectedOutcome: "20% throughput uplift",
    neededBy: D(7, 20),
    status: "pending_manager",
    duplicateRisk: "Possible overlap with Lovable/Replit",
    paybackMonths: 3,
  },
  {
    id: "PSR-202",
    requester: "Priya Menon",
    department: "Marketing",
    type: "Marketing",
    vendor: "LinkedIn Ads",
    description: "Q3 pipeline campaign",
    amount: 6000,
    frequency: "one_time",
    reason: "Enterprise pipeline",
    expectedOutcome: "$60k pipeline",
    neededBy: D(7, 15),
    status: "pending_rose",
    paybackMonths: 4,
  },
  {
    id: "PSR-203",
    requester: "Rose Taylor",
    department: "Sales",
    type: "Travel",
    vendor: "United",
    description: "Client visit — Northwind onsite",
    amount: 1200,
    frequency: "one_time",
    reason: "Renewal secure",
    expectedOutcome: "Retain $120k ARR",
    neededBy: D(7, 22),
    status: "approved",
    paybackMonths: 1,
  },
  {
    id: "PSR-204",
    requester: "Christin Alvarez",
    department: "Finance",
    type: "Professional service",
    vendor: "Deloitte",
    description: "Tax planning engagement",
    amount: 8500,
    frequency: "one_time",
    reason: "Optimize Q4 posture",
    expectedOutcome: "Save $22k in tax",
    neededBy: D(8, 15),
    status: "submitted",
    paybackMonths: 6,
  },
  {
    id: "PSR-205",
    requester: "Marcus Chen",
    department: "Engineering",
    type: "Software",
    vendor: "Datadog",
    description: "Observability",
    amount: 480,
    frequency: "monthly",
    reason: "Reduce incident time",
    expectedOutcome: "MTTR ↓ 40%",
    neededBy: D(7, 25),
    status: "needs_info",
    duplicateRisk: "None",
    paybackMonths: 5,
  },
  {
    id: "PSR-206",
    requester: "Priya Menon",
    department: "Marketing",
    type: "Event",
    vendor: "SaaStr",
    description: "Conference booth",
    amount: 12000,
    frequency: "one_time",
    reason: "Brand + pipeline",
    expectedOutcome: "150 leads",
    neededBy: D(9, 1),
    status: "draft",
    paybackMonths: 8,
  },
];

// ---------- Reimbursements ----------
export type Reimbursement = {
  id: string;
  employee: string;
  report: string;
  amount: number;
  approvedDate?: string;
  paymentMethod: "ACH" | "Payroll" | "Check";
  scheduledDate?: string;
  paidDate?: string;
  status: "awaiting" | "approved_for_payment" | "scheduled" | "paid" | "returned" | "rejected";
  notes?: string;
};

export const REIMBURSEMENTS: Reimbursement[] = [
  {
    id: "R-301",
    employee: "Marcus Chen",
    report: "ER-July-Sales",
    amount: 42.15,
    paymentMethod: "Payroll",
    status: "awaiting",
    notes: "Receipt required",
  },
  {
    id: "R-302",
    employee: "Priya Menon",
    report: "ER-July-Mkt",
    amount: 12.99,
    paymentMethod: "Payroll",
    approvedDate: D(7, 7),
    scheduledDate: D(7, 15),
    status: "scheduled",
  },
  {
    id: "R-303",
    employee: "Marcus Chen",
    report: "ER-July-Sales",
    amount: 187.4,
    paymentMethod: "Payroll",
    status: "awaiting",
    notes: "Needs attendees",
  },
  {
    id: "R-304",
    employee: "Marcus Chen",
    report: "ER-June-Sales",
    amount: 1250,
    paymentMethod: "ACH",
    approvedDate: D(6, 30),
    paidDate: D(7, 3),
    status: "paid",
  },
  {
    id: "R-305",
    employee: "Rose Taylor",
    report: "ER-June-Travel",
    amount: 812.4,
    paymentMethod: "ACH",
    approvedDate: D(7, 9),
    scheduledDate: D(7, 16),
    status: "approved_for_payment",
  },
];

// ---------- Reimbursable Recovery ----------
export type Recovery = {
  id: string;
  client: string;
  engagement: string;
  vendor: string;
  date: string;
  expense: string;
  amount: number;
  markup: number;
  recoverable: number;
  contractRule: string;
  status:
    "eligible" | "on_draft" | "invoiced" | "collected" | "written_off" | "disputed" | "at_risk";
  owner: string;
};

export const RECOVERIES: Recovery[] = [
  {
    id: "REC-401",
    client: "ALD",
    engagement: "Compliance Retainer",
    vendor: "IRS",
    date: D(7, 2),
    expense: "State filing fee",
    amount: 350,
    markup: 0,
    recoverable: 350,
    contractRule: "Pass-through at cost",
    status: "on_draft",
    owner: "Christin",
  },
  {
    id: "REC-402",
    client: "ALD",
    engagement: "Compliance Retainer",
    vendor: "Delta Airlines",
    date: D(7, 8),
    expense: "Travel — client visit",
    amount: 812.4,
    markup: 0.1,
    recoverable: 893.64,
    contractRule: "T&E + 10%",
    status: "eligible",
    owner: "Rose",
  },
  {
    id: "REC-403",
    client: "Northwind",
    engagement: "Advisory",
    vendor: "Uber",
    date: D(7, 7),
    expense: "Client transport",
    amount: 42.15,
    markup: 0.15,
    recoverable: 48.47,
    contractRule: "T&E + 15%",
    status: "eligible",
    owner: "Marcus",
  },
  {
    id: "REC-404",
    client: "Northwind",
    engagement: "Advisory",
    vendor: "Hilton",
    date: D(6, 28),
    expense: "Client visit — lodging",
    amount: 612.5,
    markup: 0.15,
    recoverable: 704.38,
    contractRule: "T&E + 15%",
    status: "on_draft",
    owner: "Marcus",
  },
  {
    id: "REC-405",
    client: "Northstar",
    engagement: "Bookkeeping",
    vendor: "Chipotle",
    date: D(6, 15),
    expense: "Team meal at client site",
    amount: 240,
    markup: 0,
    recoverable: 240,
    contractRule: "Onsite meals — cost",
    status: "at_risk",
    owner: "Christin",
  },
  {
    id: "REC-406",
    client: "ALD",
    engagement: "Compliance Retainer",
    vendor: "IRS",
    date: D(5, 30),
    expense: "State filing fee",
    amount: 350,
    markup: 0,
    recoverable: 350,
    contractRule: "Pass-through at cost",
    status: "invoiced",
    owner: "Christin",
  },
  {
    id: "REC-407",
    client: "ALD",
    engagement: "Compliance Retainer",
    vendor: "IRS",
    date: D(4, 22),
    expense: "State filing fee",
    amount: 350,
    markup: 0,
    recoverable: 350,
    contractRule: "Pass-through at cost",
    status: "collected",
    owner: "Christin",
  },
];

// ---------- Expense Reports ----------
export type ExpenseReport = {
  id: string;
  title: string;
  employee: string;
  department: string;
  range: string;
  total: number;
  reimbursable: number;
  companyPaid: number;
  missingReceipts: number;
  exceptions: number;
  status: "draft" | "submitted" | "needs_changes" | "approved" | "scheduled" | "paid" | "closed";
};

export const REPORTS: ExpenseReport[] = [
  {
    id: "ER-601",
    title: "July Travel — Sales",
    employee: "Marcus Chen",
    department: "Sales",
    range: "Jul 1 – Jul 8",
    total: 841.55,
    reimbursable: 229.55,
    companyPaid: 612.0,
    missingReceipts: 1,
    exceptions: 2,
    status: "submitted",
  },
  {
    id: "ER-602",
    title: "July Marketing",
    employee: "Priya Menon",
    department: "Marketing",
    range: "Jul 1 – Jul 8",
    total: 12.99,
    reimbursable: 12.99,
    companyPaid: 0,
    missingReceipts: 0,
    exceptions: 0,
    status: "approved",
  },
  {
    id: "ER-603",
    title: "Client Visit — ALD",
    employee: "Rose Taylor",
    department: "Sales",
    range: "Jul 6 – Jul 9",
    total: 812.4,
    reimbursable: 812.4,
    companyPaid: 0,
    missingReceipts: 0,
    exceptions: 1,
    status: "needs_changes",
  },
  {
    id: "ER-604",
    title: "June Travel — Sales",
    employee: "Marcus Chen",
    department: "Sales",
    range: "Jun 20 – Jun 30",
    total: 1250,
    reimbursable: 1250,
    companyPaid: 0,
    missingReceipts: 0,
    exceptions: 0,
    status: "paid",
  },
  {
    id: "ER-605",
    title: "Compliance Ops — July",
    employee: "Christin Alvarez",
    department: "Compliance",
    range: "Jul 1 – Jul 8",
    total: 830,
    reimbursable: 0,
    companyPaid: 830,
    missingReceipts: 0,
    exceptions: 0,
    status: "approved",
  },
];

// ---------- Vendor Spend ----------
export type VendorSpend = {
  vendor: string;
  category: ExpenseCategory;
  department: string;
  owner?: string;
  total: number;
  current: number;
  prior: number;
  ytd: number;
  budget: number;
  openBills: number;
  subscription: boolean;
  contract: "active" | "expiring" | "none";
  anomalies: number;
};

export const VENDOR_SPEND: VendorSpend[] = [
  {
    vendor: "OpenAI",
    category: "ai",
    department: "Product",
    owner: "Christin",
    total: 4800,
    current: 480,
    prior: 480,
    ytd: 3360,
    budget: 6000,
    openBills: 0,
    subscription: true,
    contract: "active",
    anomalies: 0,
  },
  {
    vendor: "Lovable",
    category: "ai",
    department: "Engineering",
    owner: "Marcus",
    total: 3600,
    current: 2400,
    prior: 200,
    ytd: 3600,
    budget: 3000,
    openBills: 0,
    subscription: true,
    contract: "active",
    anomalies: 1,
  },
  {
    vendor: "Google Ads",
    category: "marketing",
    department: "Marketing",
    owner: "Priya",
    total: 24_800,
    current: 4210.55,
    prior: 3820,
    ytd: 24_800,
    budget: 30_000,
    openBills: 0,
    subscription: false,
    contract: "none",
    anomalies: 0,
  },
  {
    vendor: "Meta Ads",
    category: "marketing",
    department: "Marketing",
    owner: "Priya",
    total: 12_100,
    current: 1980,
    prior: 1780,
    ytd: 12_100,
    budget: 14_000,
    openBills: 1,
    subscription: false,
    contract: "none",
    anomalies: 1,
  },
  {
    vendor: "Vercel",
    category: "technology",
    department: "Engineering",
    owner: "Marcus",
    total: 2240,
    current: 320,
    prior: 320,
    ytd: 2240,
    budget: 3000,
    openBills: 0,
    subscription: true,
    contract: "active",
    anomalies: 0,
  },
  {
    vendor: "GitHub",
    category: "technology",
    department: "Engineering",
    owner: "Marcus",
    total: 1176,
    current: 168,
    prior: 168,
    ytd: 1176,
    budget: 2400,
    openBills: 0,
    subscription: true,
    contract: "active",
    anomalies: 0,
  },
  {
    vendor: "Delta Airlines",
    category: "travel",
    department: "Sales",
    owner: "Rose",
    total: 3402,
    current: 812.4,
    prior: 620,
    ytd: 3402,
    budget: 5000,
    openBills: 0,
    subscription: false,
    contract: "none",
    anomalies: 0,
  },
  {
    vendor: "Amazon Business",
    category: "office",
    department: "Operations",
    owner: "Rose",
    total: 1614,
    current: 214.88,
    prior: 190,
    ytd: 1614,
    budget: 2000,
    openBills: 0,
    subscription: false,
    contract: "none",
    anomalies: 0,
  },
  {
    vendor: "ADP",
    category: "payroll",
    department: "Finance",
    owner: "Christin",
    total: 2660,
    current: 380,
    prior: 380,
    ytd: 2660,
    budget: 3000,
    openBills: 0,
    subscription: true,
    contract: "active",
    anomalies: 0,
  },
  {
    vendor: "RingCentral",
    category: "technology",
    department: "Operations",
    owner: "Rose",
    total: 1036,
    current: 148,
    prior: 148,
    ytd: 1036,
    budget: 1500,
    openBills: 0,
    subscription: true,
    contract: "active",
    anomalies: 0,
  },
  {
    vendor: "Zoho Books",
    category: "technology",
    department: "Finance",
    owner: "Christin",
    total: 623,
    current: 89,
    prior: 89,
    ytd: 623,
    budget: 200,
    openBills: 0,
    subscription: true,
    contract: "expiring",
    anomalies: 1,
  },
];

// ---------- Copilot ----------
export const COPILOT_QUESTIONS = [
  "Why did expenses increase this month?",
  "Which subscriptions should we review?",
  "Which expenses are missing receipts?",
  "What expenses appear abnormal?",
  "Which costs should be billed back to clients?",
  "Which departments are over budget?",
  "Which AI tools have weak ROI?",
  "Which vendors increased prices?",
  "What reimbursements are still unpaid?",
  "Which expenses are hurting margin?",
];

export const COPILOT_ANSWERS: Record<
  string,
  {
    summary: string;
    evidence: string[];
    confidence: number;
    impact: number;
    action: string;
  }
> = {
  "Why did expenses increase this month?": {
    summary:
      "July spend rose 5.2% vs June, driven by Lovable's annual renewal and increased Google Ads pacing.",
    evidence: [
      "EXP-1046 Lovable annual $2,400 (vs $200 monthly)",
      "EXP-1048 Google Ads +10% vs June pacing",
      "EXP-1049 Meta Ads +11% vs June",
    ],
    confidence: 0.92,
    impact: 3_100,
    action: "Amortize Lovable annual across 12 months; verify Google Ads pacing plan.",
  },
  "Which subscriptions should we review?": {
    summary:
      "3 subscriptions flagged: Replit (underused), Zoho Books (cancellation candidate), Miscellaneous SaaS (no owner).",
    evidence: [
      "SUB-03 Replit 3/10 seats used",
      "SUB-07 Zoho Books replaced by LedgerOS",
      "SUB-10 Miscellaneous SaaS zero users",
    ],
    confidence: 0.88,
    impact: 549,
    action: "Reduce Replit to 4 seats, cancel Zoho and Miscellaneous SaaS.",
  },
};
