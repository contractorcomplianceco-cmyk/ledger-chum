// Demonstration ledger data for the LedgerOS UI when no live org is available.
// Not connected to any accounting system. Shapes mirror the live server-fn
// return values in src/lib/accounting/*.functions.ts so pages can render the
// exact same components against either data source.

export type DemoAccount = {
  account_id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  normal_balance: "debit" | "credit";
  parent_id: string | null;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
  debit_total: number;
  credit_total: number;
  balance: number;
};

const A = (
  code: string,
  name: string,
  type: DemoAccount["type"],
  debit: number,
  credit: number,
  is_system = false,
): DemoAccount => {
  const normal_balance: "debit" | "credit" =
    type === "asset" || type === "expense" ? "debit" : "credit";
  const balance =
    normal_balance === "debit" ? debit - credit : credit - debit;
  return {
    account_id: `demo-acct-${code}`,
    code,
    name,
    type,
    normal_balance,
    parent_id: null,
    is_active: true,
    is_system,
    sort_order: Number(code),
    debit_total: debit,
    credit_total: credit,
    balance,
  };
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  // Assets
  A("1010", "Checking — Chase Operating", "asset", 1_842_600, 1_657_200, true),
  A("1020", "Savings — Chase Reserve", "asset", 320_000, 60_000),
  A("1030", "Undeposited Funds", "asset", 42_800, 30_400),
  A("1200", "Accounts Receivable", "asset", 1_684_500, 1_272_500, true),
  A("1300", "Inventory — Parts & Supplies", "asset", 268_400, 129_800),
  A("1500", "Equipment & Vehicles", "asset", 260_000, 40_000),
  // Liabilities
  A("2000", "Accounts Payable", "liability", 812_400, 961_100, true),
  A("2100", "Credit Card — Amex Platinum", "liability", 184_600, 207_000),
  A("2200", "Sales Tax Payable", "liability", 46_200, 62_800),
  A("2400", "SBA Loan Payable", "liability", 40_000, 220_000),
  // Equity
  A("3000", "Owner Contributions", "equity", 0, 500_000, true),
  A("3100", "Retained Earnings", "equity", 0, 158_800, true),
  // Revenue
  A("4000", "Service Revenue", "revenue", 12_400, 1_248_750),
  A("4100", "Product Revenue", "revenue", 3_200, 186_300),
  // Expense
  A("5000", "Cost of Services", "expense", 486_200, 0),
  A("6000", "Payroll Expense", "expense", 328_400, 0),
  A("6100", "Software & Subscriptions", "expense", 42_600, 0),
  A("6200", "Rent & Facilities", "expense", 54_000, 0),
  A("6300", "Marketing & Advertising", "expense", 61_800, 0),
  A("6400", "Office Supplies", "expense", 18_200, 0),
  A("6500", "Professional Fees", "expense", 22_400, 0),
];

const byCode = (code: string) => DEMO_ACCOUNTS.find((a) => a.code === code)!;

// ---------- General Ledger lines ----------

export type DemoGlRow = {
  id: string;
  debit: number;
  credit: number;
  memo: string | null;
  account: {
    id: string;
    code: string;
    name: string;
    type: string;
    normal_balance: string;
  };
  journal: {
    id: string;
    entry_date: string;
    memo: string | null;
    description: string | null;
    source_type: string | null;
    source_id: string | null;
    status: string;
    posted_at: string | null;
    reversal_of: string | null;
    reversed_by: string | null;
  };
};

type JEntry = {
  id: string;
  date: string;
  memo: string;
  source: string;
  lines: Array<{ code: string; debit?: number; credit?: number; memo?: string }>;
};

const JOURNALS: JEntry[] = [
  {
    id: "J-2410",
    date: "2025-05-15",
    memo: "Invoice INV-10501 — Compliance Audit (ALD)",
    source: "invoice",
    lines: [
      { code: "1200", debit: 12_500, memo: "ALD — May audit" },
      { code: "4000", credit: 12_500, memo: "Service revenue" },
    ],
  },
  {
    id: "J-2411",
    date: "2025-05-14",
    memo: "Bill from Amazon Business — office supplies",
    source: "bill",
    lines: [
      { code: "6400", debit: 245.89, memo: "Office supplies" },
      { code: "2000", credit: 245.89, memo: "Amazon Business" },
    ],
  },
  {
    id: "J-2412",
    date: "2025-05-14",
    memo: "Payment received — ALD invoice INV-10488",
    source: "payment",
    lines: [
      { code: "1010", debit: 8_250, memo: "ACH deposit" },
      { code: "1200", credit: 8_250, memo: "Apply to INV-10488" },
    ],
  },
  {
    id: "J-2413",
    date: "2025-05-13",
    memo: "Payroll — week of May 5",
    source: "manual",
    lines: [
      { code: "6000", debit: 18_450.75, memo: "Gusto payroll" },
      { code: "1010", credit: 18_450.75, memo: "Payroll draw" },
    ],
  },
  {
    id: "J-2414",
    date: "2025-05-12",
    memo: "Zoho Suite — May subscription",
    source: "bill",
    lines: [
      { code: "6100", debit: 1_500, memo: "Zoho One" },
      { code: "2100", credit: 1_500, memo: "Amex charge" },
    ],
  },
  {
    id: "J-2415",
    date: "2025-05-10",
    memo: "Invoice INV-10499 — Fleet maintenance retainer",
    source: "invoice",
    lines: [
      { code: "1200", debit: 24_800, memo: "Northwind fleet" },
      { code: "4000", credit: 24_800, memo: "Retainer" },
    ],
  },
  {
    id: "J-2416",
    date: "2025-05-09",
    memo: "Inventory receipt — Parts order #4482",
    source: "inventory_consumption",
    lines: [
      { code: "1300", debit: 6_240, memo: "Parts receipt" },
      { code: "2000", credit: 6_240, memo: "Grainger" },
    ],
  },
  {
    id: "J-2417",
    date: "2025-05-08",
    memo: "Marketing — Google Ads May",
    source: "bill",
    lines: [
      { code: "6300", debit: 4_820, memo: "Google Ads" },
      { code: "2100", credit: 4_820, memo: "Amex charge" },
    ],
  },
  {
    id: "J-2418",
    date: "2025-05-05",
    memo: "Rent — May",
    source: "bill",
    lines: [
      { code: "6200", debit: 9_000, memo: "May rent" },
      { code: "1010", credit: 9_000, memo: "ACH landlord" },
    ],
  },
  {
    id: "J-2419",
    date: "2025-05-03",
    memo: "Stripe payout — batch #5081",
    source: "payment",
    lines: [
      { code: "1010", debit: 14_620, memo: "Stripe payout" },
      { code: "1200", credit: 14_620, memo: "Applied to open invoices" },
    ],
  },
  {
    id: "J-2420",
    date: "2025-05-01",
    memo: "Product sale — Marine kit",
    source: "invoice",
    lines: [
      { code: "1200", debit: 8_640, memo: "Marine kit" },
      { code: "4100", credit: 8_640, memo: "Product revenue" },
    ],
  },
  {
    id: "J-2421",
    date: "2025-04-30",
    memo: "Professional fees — legal retainer",
    source: "bill",
    lines: [
      { code: "6500", debit: 3_200, memo: "Legal retainer" },
      { code: "2000", credit: 3_200, memo: "Baker & Co" },
    ],
  },
];

export const DEMO_GL_LINES: DemoGlRow[] = JOURNALS.flatMap((j) =>
  j.lines.map((l, idx) => {
    const acct = byCode(l.code);
    return {
      id: `${j.id}-${idx}`,
      debit: l.debit ?? 0,
      credit: l.credit ?? 0,
      memo: l.memo ?? null,
      account: {
        id: acct.account_id,
        code: acct.code,
        name: acct.name,
        type: acct.type,
        normal_balance: acct.normal_balance,
      },
      journal: {
        id: j.id,
        entry_date: j.date,
        memo: j.memo,
        description: null,
        source_type: j.source,
        source_id: null,
        status: "posted",
        posted_at: `${j.date}T09:00:00Z`,
        reversal_of: null,
        reversed_by: null,
      },
    };
  }),
);

// ---------- Reports ----------

type ReportRow = { account_id: string; code: string; name: string; amount: number };
const toRows = (type: DemoAccount["type"]): ReportRow[] =>
  DEMO_ACCOUNTS.filter((a) => a.type === type && a.balance !== 0).map((a) => ({
    account_id: a.account_id,
    code: a.code,
    name: a.name,
    amount: Math.abs(a.balance),
  }));

const sum = (rows: ReportRow[]) => rows.reduce((s, r) => s + r.amount, 0);

export function getDemoTrialBalance() {
  const rows = DEMO_ACCOUNTS.filter(
    (a) => a.debit_total !== 0 || a.credit_total !== 0,
  ).map((a) => ({
    account_id: a.account_id,
    code: a.code,
    name: a.name,
    type: a.type,
    debit: a.debit_total,
    credit: a.credit_total,
    balance: a.balance,
  }));
  const debit = rows.reduce((s, r) => s + r.debit, 0);
  const credit = rows.reduce((s, r) => s + r.credit, 0);
  return {
    rows,
    totals: { debit, credit },
    balanced: Math.abs(debit - credit) < 0.01,
  };
}

export function getDemoProfitAndLoss() {
  const revenue = toRows("revenue");
  const expense = toRows("expense");
  const revenueTotal = sum(revenue);
  const expenseTotal = sum(expense);
  return {
    revenue,
    expense,
    revenueTotal,
    expenseTotal,
    netIncome: revenueTotal - expenseTotal,
  };
}

export function getDemoBalanceSheet() {
  const asset = toRows("asset");
  const liability = toRows("liability");
  const equity = toRows("equity");
  const totalAsset = sum(asset);
  const totalLiab = sum(liability);
  const totalEquityRows = sum(equity);
  const retainedEarnings = totalAsset - totalLiab - totalEquityRows;
  const liabAndEquity = totalLiab + totalEquityRows + retainedEarnings;
  return {
    asset,
    liability,
    equity,
    retainedEarnings,
    totals: {
      asset: totalAsset,
      liability: totalLiab,
      equity: totalEquityRows + retainedEarnings,
      liabAndEquity,
    },
    balanced: Math.abs(totalAsset - liabAndEquity) < 0.01,
  };
}

export function getDemoCashFlow() {
  const pnl = getDemoProfitAndLoss();
  const arIncrease = 92_400;
  const inventoryIncrease = 18_600;
  const apIncrease = 61_200;
  const operating =
    pnl.netIncome - arIncrease - inventoryIncrease + apIncrease;
  const investing = -48_000;
  const financing = -22_500;
  return {
    netIncome: pnl.netIncome,
    adjustments: { arIncrease, inventoryIncrease, apIncrease },
    operating,
    investing,
    financing,
    netChange: operating + investing + financing,
  };
}

export const DEMO_MODE_MESSAGE =
  "Demonstration ledger. Sample data for UI preview — not connected to a live organization.";
