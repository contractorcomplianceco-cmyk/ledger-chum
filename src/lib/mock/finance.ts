// Mock data for LedgerOS UI Design Lab. Not connected to any accounting system.

// Whole-dollar formatter — intentionally drops cents. Use ONLY where cents are
// noise (chart axis labels, coarse headline KPIs). For any figure a user might
// reconcile against (balances, line totals, invoices, estimates) use
// `currencyPrecise` so the cents are shown.
export const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export const currencyPrecise = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

/** Dashboard reference KPIs — Revenue, Gross Profit, Net Profit, Cash. */
export const KPIS = [
  { label: "Total Revenue", value: 1_248_750, delta: 18.6, trend: "up" as const, spark: [820, 880, 900, 950, 1020, 1080, 1180, 1248] },
  { label: "Gross Profit", value: 642_540, delta: 14.3, trend: "up" as const, spark: [420, 460, 470, 500, 540, 570, 610, 642] },
  { label: "Net Profit", value: 326_870, delta: 11.8, trend: "up" as const, spark: [210, 220, 235, 250, 268, 285, 305, 326] },
  { label: "True Available Cash", value: 451_510, delta: 11.4, trend: "up" as const, spark: [402, 428, 452, 478, 501, 522, 548, 452] },
];

/** 12 months for the Financial Overview chart. */
export const FIN_OVERVIEW = [
  { m: "Jan", revenue: 620_000, expenses: 380_000, net: 240_000 },
  { m: "Feb", revenue: 680_000, expenses: 410_000, net: 270_000 },
  { m: "Mar", revenue: 720_000, expenses: 420_000, net: 300_000 },
  { m: "Apr", revenue: 800_000, expenses: 450_000, net: 350_000 },
  { m: "May", revenue: 860_000, expenses: 470_000, net: 390_000 },
  { m: "Jun", revenue: 940_000, expenses: 500_000, net: 440_000 },
  { m: "Jul", revenue: 990_000, expenses: 540_000, net: 450_000 },
  { m: "Aug", revenue: 1_040_000, expenses: 580_000, net: 460_000 },
  { m: "Sep", revenue: 1_120_000, expenses: 610_000, net: 510_000 },
  { m: "Oct", revenue: 1_180_000, expenses: 640_000, net: 540_000 },
  { m: "Nov", revenue: 1_240_000, expenses: 670_000, net: 570_000 },
  { m: "Dec", revenue: 1_360_000, expenses: 710_000, net: 650_000 },
];

/** Cash flow donut segments. */
export const CASH_FLOW = [
  { name: "Operating", value: 512_430, pct: 57.4, color: "#3b82f6" },
  { name: "Investing", value: 120_000, pct: 13.4, color: "#22d3ee" },
  { name: "Financing", value: 260_000, pct: 29.2, color: "#8b5cf6" },
];

/** Dashboard recent transactions — Zoho-style. */
export const RECENT_TRANSACTIONS = [
  {
    id: "T-10501",
    date: "May 15, 2025",
    type: "Invoice",
    desc: "Compliance Audit — ALD",
    account: "1200 - Accounts Receivable",
    amount: 12_500,
    kind: "in" as const,
    status: "posted" as const,
  },
  {
    id: "T-10502",
    date: "May 14, 2025",
    type: "Bill",
    desc: "Office Supplies — Amazon",
    account: "6000 - Office Expenses",
    amount: 245.89,
    kind: "out" as const,
    status: "posted" as const,
  },
  {
    id: "T-10503",
    date: "May 14, 2025",
    type: "Payment",
    desc: "Payment from ALD",
    account: "1010 - Checking Account",
    amount: 8_250,
    kind: "in" as const,
    status: "posted" as const,
  },
  {
    id: "T-10504",
    date: "May 13, 2025",
    type: "Journal Entry",
    desc: "Payroll — Week of May 5",
    account: "5000 - Payroll Expenses",
    amount: 18_450.75,
    kind: "out" as const,
    status: "posted" as const,
  },
  {
    id: "T-10505",
    date: "May 12, 2025",
    type: "Bill",
    desc: "Software — Zoho Suite",
    account: "6100 - Software Expenses",
    amount: 1_500,
    kind: "out" as const,
    status: "posted" as const,
  },
];

export type TxnType = "Invoice" | "Bill" | "Payment" | "Journal Entry" | "Refund" | "Transfer";

/** Quick actions column on dashboard (dark navy card). */
export const QUICK_ACTIONS = [
  { label: "New Invoice", icon: "FileText" },
  { label: "New Bill", icon: "Receipt" },
  { label: "New Journal Entry", icon: "NotebookPen" },
  { label: "Bank Reconciliation", icon: "Landmark" },
  { label: "Record Payment", icon: "CreditCard" },
  { label: "Transfer Funds", icon: "ArrowLeftRight" },
];

/** Integration inbox — matches reference. */
export const INTEGRATION_INBOX = [
  { source: "Stripe", event: "Stripe Payout", amount: 2_650, date: "May 15, 2025", color: "#635BFF" },
  { source: "Bill.com", event: "Bill.com Bill", amount: 1_200, date: "May 15, 2025", color: "#22c55e" },
  { source: "Gusto", event: "Gusto Payroll", amount: 18_450.75, date: "May 14, 2025", color: "#f97316" },
];

/** Alerts panel. */
export const ALERTS = [
  {
    severity: "warning" as const,
    title: "3 transactions need review",
    detail: "Across 2 accounts",
  },
  {
    severity: "info" as const,
    title: "Account reconciliation needed",
    detail: "Chase Bank · Apr 30, 2025",
  },
];

/** Legacy structures still referenced by earlier phase files. */
export const CASH_SERIES = FIN_OVERVIEW.slice(4).map((r) => ({
  m: r.m,
  cash: r.revenue - r.expenses + 1_800_000,
  revenue: r.revenue,
  expenses: r.expenses,
}));

export const AR_AGING = [
  { bucket: "Current", value: 412_000 },
  { bucket: "1–30", value: 184_500 },
  { bucket: "31–60", value: 92_300 },
  { bucket: "61–90", value: 41_800 },
  { bucket: "90+", value: 18_400 },
];

export const AP_AGING = [
  { bucket: "Current", value: 218_400 },
  { bucket: "1–30", value: 96_200 },
  { bucket: "31–60", value: 42_100 },
  { bucket: "61–90", value: 12_800 },
  { bucket: "90+", value: 4_200 },
];

export const CLOSE_TASKS = [
  { task: "Bank reconciliations", status: "done", owner: "R. Alvarez" },
  { task: "Credit card reconciliations", status: "done", owner: "R. Alvarez" },
  { task: "Accrued revenue journal", status: "in_review", owner: "K. Chen" },
  { task: "Prepaid amortization", status: "in_progress", owner: "K. Chen" },
  { task: "Fixed-asset depreciation", status: "todo", owner: "J. Patel" },
  { task: "Payroll accrual", status: "todo", owner: "M. Rose" },
  { task: "Financial statement package", status: "blocked", owner: "M. Rose" },
];

export const INTEGRATION_EVENTS = [
  { source: "Stripe", event: "Payout received", status: "matched", when: "12m ago" },
  { source: "Ramp", event: "New card transaction", status: "needs_review", when: "38m ago" },
  { source: "Gusto", event: "Payroll journal draft", status: "needs_review", when: "2h ago" },
  { source: "Plaid", event: "Bank feed refreshed", status: "matched", when: "3h ago" },
  { source: "Zoho Books", event: "Parallel-run variance", status: "flagged", when: "5h ago" },
];
