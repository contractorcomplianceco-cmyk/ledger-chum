// Mock data for LedgerOS UI Design Lab. Not connected to any accounting system.

export const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export const currencyPrecise = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const KPIS = [
  { label: "Cash position", value: 2_845_120, delta: 4.2, trend: "up" as const },
  { label: "Revenue (MTD)", value: 1_248_400, delta: 12.8, trend: "up" as const },
  { label: "Expenses (MTD)", value: 684_210, delta: -3.1, trend: "down" as const },
  { label: "Net income (MTD)", value: 564_190, delta: 18.6, trend: "up" as const },
];

export const CASH_SERIES = [
  { m: "Jan", cash: 1_820_000, revenue: 920_000, expenses: 610_000 },
  { m: "Feb", cash: 1_910_000, revenue: 980_000, expenses: 640_000 },
  { m: "Mar", cash: 2_010_000, revenue: 1_050_000, expenses: 660_000 },
  { m: "Apr", cash: 2_180_000, revenue: 1_120_000, expenses: 655_000 },
  { m: "May", cash: 2_360_000, revenue: 1_190_000, expenses: 670_000 },
  { m: "Jun", cash: 2_510_000, revenue: 1_210_000, expenses: 680_000 },
  { m: "Jul", cash: 2_640_000, revenue: 1_230_000, expenses: 690_000 },
  { m: "Aug", cash: 2_845_120, revenue: 1_248_400, expenses: 684_210 },
];

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

export const RECENT_TRANSACTIONS = [
  { id: "T-10482", date: "2026-07-10", desc: "Stripe payout — Invoice batch #488", account: "Chase Operating •• 4021", amount: 128_420, kind: "in" },
  { id: "T-10481", date: "2026-07-10", desc: "AWS — Production infrastructure", account: "Chase Operating •• 4021", amount: -18_240, kind: "out" },
  { id: "T-10480", date: "2026-07-09", desc: "Payroll — Bi-weekly cycle", account: "Chase Payroll •• 7712", amount: -212_800, kind: "out" },
  { id: "T-10479", date: "2026-07-09", desc: "ACH — Northwind Logistics", account: "Chase Operating •• 4021", amount: 84_500, kind: "in" },
  { id: "T-10478", date: "2026-07-08", desc: "Ramp card — Travel & entertainment", account: "Ramp •• 0091", amount: -6_412, kind: "out" },
  { id: "T-10477", date: "2026-07-08", desc: "Wire — Acme Holdings retainer", account: "Chase Operating •• 4021", amount: 45_000, kind: "in" },
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

export const ALERTS = [
  { severity: "warning", title: "3 unposted journals awaiting approval", detail: "Approvals required before period lock." },
  { severity: "info", title: "Parallel run vs Zoho Books: 99.94% match", detail: "Variance report generated at 06:00 UTC." },
  { severity: "success", title: "Bank feeds healthy", detail: "All 6 connected accounts refreshed in the last hour." },
];
