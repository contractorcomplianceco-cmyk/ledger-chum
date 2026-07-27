/**
 * Mock ledger for demo/mock mode — chart of accounts, journal lines, and the
 * financial reports derived from them.
 *
 * Everything on this page is generated from ONE source of truth: `JOURNAL_ENTRIES`.
 * Each entry is balanced line-by-line, so the trial balance and balance sheet
 * reconcile by construction rather than by hand-tuned totals.
 *
 * Return shapes intentionally mirror the Supabase-backed server functions in
 * `src/lib/accounting/*` so routes can swap one for the other.
 */

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

type MockAccount = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normal_balance: "debit" | "credit";
  is_system: boolean;
  sort_order: number;
};

const ACCOUNT_DEFS: Array<[code: string, name: string, type: AccountType, normal: "debit" | "credit", system: boolean]> = [
  ["1010", "Operating Checking", "asset", "debit", true],
  ["1020", "Payroll Checking", "asset", "debit", false],
  ["1030", "Money Market Savings", "asset", "debit", false],
  ["1200", "Accounts Receivable", "asset", "debit", true],
  ["1300", "Prepaid Expenses", "asset", "debit", false],
  ["1400", "Inventory", "asset", "debit", true],
  ["1500", "Computer Equipment", "asset", "debit", false],
  ["1510", "Accumulated Depreciation", "asset", "credit", false],
  ["2000", "Accounts Payable", "liability", "credit", true],
  ["2100", "Accrued Liabilities", "liability", "credit", false],
  ["2200", "Payroll Liabilities", "liability", "credit", false],
  ["2300", "Deferred Revenue", "liability", "credit", true],
  ["2500", "Line of Credit", "liability", "credit", false],
  ["3000", "Common Stock", "equity", "credit", true],
  ["3100", "Retained Earnings", "equity", "credit", true],
  ["4000", "Consulting Revenue", "revenue", "credit", false],
  ["4100", "Compliance Services Revenue", "revenue", "credit", false],
  ["4200", "Subscription Revenue", "revenue", "credit", false],
  ["5000", "Payroll Expenses", "expense", "debit", false],
  ["5100", "Contractor Payments", "expense", "debit", false],
  ["5200", "Cost of Services", "expense", "debit", false],
  ["6000", "Office Expenses", "expense", "debit", false],
  ["6100", "Software Expenses", "expense", "debit", false],
  ["6200", "Rent", "expense", "debit", false],
  ["6300", "Marketing", "expense", "debit", false],
  ["6400", "Professional Fees", "expense", "debit", false],
  ["6500", "Insurance", "expense", "debit", false],
  ["6600", "Depreciation Expense", "expense", "debit", false],
];

export const MOCK_ACCOUNTS: MockAccount[] = ACCOUNT_DEFS.map(([code, name, type, normal_balance, is_system], i) => ({
  id: `acct-${code}`,
  code,
  name,
  type,
  normal_balance,
  is_system,
  sort_order: i * 10,
}));

const byCode = new Map(MOCK_ACCOUNTS.map((a) => [a.code, a]));

type EntryLine = { code: string; debit: number; credit: number; memo: string };
type JournalEntry = {
  id: string;
  entry_date: string;
  memo: string;
  source_type: string;
  lines: EntryLine[];
};

const FISCAL_YEAR = 2026;
/** Jan–Jul 2026: the demo org's fiscal year to date. */
const MONTHS = [0, 1, 2, 3, 4, 5, 6];

const d = (monthIndex: number, day: number) =>
  `${FISCAL_YEAR}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const round = (n: number) => Math.round(n * 100) / 100;

const dr = (code: string, amount: number, memo: string): EntryLine => ({ code, debit: round(amount), credit: 0, memo });
const cr = (code: string, amount: number, memo: string): EntryLine => ({ code, debit: 0, credit: round(amount), memo });

/**
 * Opening balances. Debits and credits are hand-matched here; every other entry
 * is generated in balanced pairs.
 */
const OPENING: JournalEntry = {
  id: "JE-2026-0000",
  entry_date: d(0, 1),
  memo: "Opening balances brought forward",
  source_type: "manual",
  lines: [
    dr("1010", 385_000, "Opening cash — operating"),
    dr("1020", 42_000, "Opening cash — payroll"),
    dr("1030", 240_000, "Opening cash — reserves"),
    dr("1200", 168_000, "Open invoices at year end"),
    dr("1300", 38_400, "Prepaid insurance and licences"),
    dr("1400", 64_500, "Inventory on hand"),
    dr("1500", 182_000, "Equipment at cost"),
    cr("1510", 46_800, "Accumulated depreciation to date"),
    cr("2000", 96_200, "Unpaid vendor bills"),
    cr("2100", 21_400, "Accrued professional fees"),
    cr("2200", 18_600, "Payroll taxes payable"),
    cr("2300", 231_000, "Unearned subscription revenue"),
    cr("2500", 120_000, "Revolving line of credit"),
    cr("3000", 250_000, "Paid-in capital"),
    cr("3100", 335_900, "Prior-year retained earnings"),
  ],
};

function monthlyEntries(m: number): JournalEntry[] {
  const growth = 1 + 0.04 * m;
  const seq = `JE-${FISCAL_YEAR}-${String(m + 1).padStart(2, "0")}`;
  const period = new Date(FISCAL_YEAR, m, 1).toLocaleString("en-US", { month: "long", year: "numeric" });

  const consulting = round(88_000 * growth);
  const compliance = round(52_000 * growth);
  const subscription = 22_000;
  const collections = round((consulting + compliance) * 0.92);
  const payroll = round(58_000 * (1 + 0.02 * m));
  const payrollNet = round(payroll * 0.78);
  const payrollTax = round(payroll - payrollNet);
  const contractors = round(14_000 * growth);
  const costOfServices = round(18_000 * growth);
  const inventoryPurchase = round(costOfServices + 1_500);
  const marketing = round(11_500 * growth);
  const software = 5_400;
  const rent = 9_800;
  const office = 3_200;
  const professionalFees = 4_200;
  const insurance = 1_900;
  const depreciation = 2_650;
  const apPayment = round((inventoryPurchase + software + marketing) * 0.88);
  const accruedPayment = round(professionalFees * 0.85);
  const savingsSweep = 25_000;

  const pair = (
    n: string,
    day: number,
    memo: string,
    source: string,
    debitCode: string,
    creditCode: string,
    amount: number,
    lineMemo: string,
  ): JournalEntry => ({
    id: `${seq}-${n}`,
    entry_date: d(m, day),
    memo,
    source_type: source,
    lines: [dr(debitCode, amount, lineMemo), cr(creditCode, amount, lineMemo)],
  });

  return [
    pair("01", 5, `Consulting engagements billed — ${period}`, "invoice", "1200", "4000", consulting, "Consulting fees billed"),
    pair("02", 6, `Compliance services billed — ${period}`, "invoice", "1200", "4100", compliance, "Compliance retainers billed"),
    pair("03", 7, `Subscription revenue recognised — ${period}`, "manual", "2300", "4200", subscription, "Monthly subscription earned"),
    pair("04", 20, `Customer collections — ${period}`, "payment", "1010", "1200", collections, "Deposits applied to open invoices"),
    {
      id: `${seq}-05`,
      entry_date: d(m, 15),
      memo: `Payroll run — ${period}`,
      source_type: "manual",
      lines: [
        dr("5000", payroll, "Gross wages and employer taxes"),
        cr("1020", payrollNet, "Net pay disbursed"),
        cr("2200", payrollTax, "Employee and employer taxes withheld"),
      ],
    },
    pair("06", 14, `Payroll account funding — ${period}`, "manual", "1020", "1010", payrollNet, "Transfer to payroll checking"),
    pair("07", 18, `Payroll tax remittance — ${period}`, "payment", "2200", "1010", round(payrollTax * 0.9), "Federal and state deposits"),
    pair("08", 22, `Contractor payments — ${period}`, "payment", "5100", "1010", contractors, "1099 contractor invoices paid"),
    pair("09", 8, `Inventory purchase — ${period}`, "manual", "1400", "2000", inventoryPurchase, "Fulfilment materials received"),
    pair("10", 25, `Cost of services — ${period}`, "inventory_consumption", "5200", "1400", costOfServices, "Materials consumed on engagements"),
    pair("11", 1, `Office rent — ${period}`, "payment", "6200", "1010", rent, "Monthly lease payment"),
    pair("12", 3, `Software subscriptions — ${period}`, "manual", "6100", "2000", software, "SaaS vendor bills received"),
    pair("13", 12, `Office expenses — ${period}`, "payment", "6000", "1010", office, "Supplies and shipping"),
    pair("14", 10, `Marketing spend — ${period}`, "manual", "6300", "2000", marketing, "Campaign and agency invoices"),
    pair("15", 24, `Professional fees accrued — ${period}`, "manual", "6400", "2100", professionalFees, "Legal and audit accrual"),
    pair("16", 25, `Prepaid insurance amortisation — ${period}`, "manual", "6500", "1300", insurance, "Monthly insurance expense"),
    pair("17", 25, `Depreciation — ${period}`, "manual", "6600", "1510", depreciation, "Straight-line equipment depreciation"),
    pair("18", 21, `Vendor bill payments — ${period}`, "payment", "2000", "1010", apPayment, "Scheduled AP run"),
    pair("19", 23, `Accrued liabilities settled — ${period}`, "payment", "2100", "1010", accruedPayment, "Professional fee invoices paid"),
    pair("20", 25, `Reserve sweep — ${period}`, "manual", "1030", "1010", savingsSweep, "Transfer to money market"),
  ];
}

export const JOURNAL_ENTRIES: JournalEntry[] = [OPENING, ...MONTHS.flatMap(monthlyEntries)];

/* ------------------------------------------------------------------ */
/* Journal lines (General Ledger)                                      */
/* ------------------------------------------------------------------ */

export type MockLedgerLine = {
  id: string;
  debit: number;
  credit: number;
  memo: string | null;
  account: { id: string; code: string; name: string; type: string; normal_balance: string };
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

const ALL_LINES: MockLedgerLine[] = JOURNAL_ENTRIES.flatMap((entry) =>
  entry.lines.map((line, i) => {
    const account = byCode.get(line.code)!;
    return {
      id: `${entry.id}-L${i + 1}`,
      debit: line.debit,
      credit: line.credit,
      memo: line.memo,
      account: {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        normal_balance: account.normal_balance,
      },
      journal: {
        id: entry.id,
        entry_date: entry.entry_date,
        memo: entry.memo,
        description: entry.memo,
        source_type: entry.source_type,
        source_id: null,
        status: "posted",
        posted_at: `${entry.entry_date}T17:00:00.000Z`,
        reversal_of: null,
        reversed_by: null,
      },
    };
  }),
).sort((a, b) =>
  a.journal.entry_date === b.journal.entry_date
    ? b.id.localeCompare(a.id)
    : b.journal.entry_date.localeCompare(a.journal.entry_date),
);

export type MockLedgerFilters = {
  accountId?: string;
  from?: string;
  to?: string;
  sourceType?: string;
  status?: string;
  search?: string;
  limit?: number;
};

export function mockLedgerLines(filters: MockLedgerFilters = {}): MockLedgerLine[] {
  const needle = filters.search?.trim().toLowerCase();
  return ALL_LINES.filter((l) => {
    if (filters.accountId && l.account.id !== filters.accountId) return false;
    if (filters.from && l.journal.entry_date < filters.from) return false;
    if (filters.to && l.journal.entry_date > filters.to) return false;
    if (filters.sourceType && l.journal.source_type !== filters.sourceType) return false;
    // Demo data is fully posted; a draft/void filter legitimately returns nothing.
    if (filters.status && filters.status !== "posted") return false;
    if (needle) {
      const haystack = `${l.memo ?? ""} ${l.journal.memo ?? ""} ${l.account.code} ${l.account.name}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  }).slice(0, filters.limit ?? 500);
}

/* ------------------------------------------------------------------ */
/* Aggregation — the basis for every report below                       */
/* ------------------------------------------------------------------ */

type AggregatedRow = {
  account_id: string;
  code: string;
  name: string;
  type: AccountType;
  debit: number;
  credit: number;
};

function aggregate(from?: string, to?: string): AggregatedRow[] {
  const map = new Map<string, AggregatedRow>();
  for (const line of ALL_LINES) {
    if (from && line.journal.entry_date < from) continue;
    if (to && line.journal.entry_date > to) continue;
    const account = byCode.get(line.account.code)!;
    const row = map.get(account.id) ?? {
      account_id: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      debit: 0,
      credit: 0,
    };
    row.debit = round(row.debit + line.debit);
    row.credit = round(row.credit + line.credit);
    map.set(account.id, row);
  }
  return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
}

/* ------------------------------------------------------------------ */
/* Chart of Accounts                                                   */
/* ------------------------------------------------------------------ */

export type MockAccountBalance = {
  account_id: string;
  code: string;
  name: string;
  type: string;
  normal_balance: string;
  parent_id: string | null;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
  debit_total: number;
  credit_total: number;
  balance: number;
};

export function mockAccountTree(): MockAccountBalance[] {
  const totals = new Map(aggregate().map((r) => [r.account_id, r]));
  return MOCK_ACCOUNTS.map((a) => {
    const t = totals.get(a.id);
    const debit_total = t?.debit ?? 0;
    const credit_total = t?.credit ?? 0;
    return {
      account_id: a.id,
      code: a.code,
      name: a.name,
      type: a.type,
      normal_balance: a.normal_balance,
      parent_id: null,
      is_active: true,
      is_system: a.is_system,
      sort_order: a.sort_order,
      debit_total,
      credit_total,
      balance: round(a.normal_balance === "debit" ? debit_total - credit_total : credit_total - debit_total),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

/** First day of the demo fiscal year — the sensible default for a YTD report. */
export const MOCK_FISCAL_YEAR_START = d(0, 1);

export function mockTrialBalance(from?: string, to?: string) {
  const rows = aggregate(from, to);
  const totals = rows.reduce(
    (acc, r) => ({ debit: round(acc.debit + r.debit), credit: round(acc.credit + r.credit) }),
    { debit: 0, credit: 0 },
  );
  return {
    from: from ?? null,
    to: to ?? null,
    rows: rows.map((r) => ({ ...r, balance: round(r.debit - r.credit) })),
    totals,
    balanced: Math.abs(totals.debit - totals.credit) < 0.005,
  };
}

export function mockProfitAndLoss(from?: string, to?: string) {
  const rows = aggregate(from, to);
  const revenue = rows
    .filter((r) => r.type === "revenue")
    .map((r) => ({ ...r, amount: round(r.credit - r.debit) }));
  const expense = rows
    .filter((r) => r.type === "expense")
    .map((r) => ({ ...r, amount: round(r.debit - r.credit) }));
  const revenueTotal = round(revenue.reduce((s, r) => s + r.amount, 0));
  const expenseTotal = round(expense.reduce((s, r) => s + r.amount, 0));
  return {
    from: from ?? null,
    to: to ?? null,
    revenue,
    expense,
    revenueTotal,
    expenseTotal,
    netIncome: round(revenueTotal - expenseTotal),
  };
}

export function mockBalanceSheet(asOf?: string) {
  const rows = aggregate(undefined, asOf);
  const asset = rows.filter((r) => r.type === "asset").map((r) => ({ ...r, amount: round(r.debit - r.credit) }));
  const liability = rows.filter((r) => r.type === "liability").map((r) => ({ ...r, amount: round(r.credit - r.debit) }));
  const equity = rows.filter((r) => r.type === "equity").map((r) => ({ ...r, amount: round(r.credit - r.debit) }));
  const revenue = rows.filter((r) => r.type === "revenue").reduce((s, r) => s + (r.credit - r.debit), 0);
  const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + (r.debit - r.credit), 0);
  const retainedEarnings = round(revenue - expense);

  const assetTotal = round(asset.reduce((s, r) => s + r.amount, 0));
  const liabilityTotal = round(liability.reduce((s, r) => s + r.amount, 0));
  const equityTotal = round(equity.reduce((s, r) => s + r.amount, 0) + retainedEarnings);

  return {
    asOf: asOf ?? null,
    asset,
    liability,
    equity,
    retainedEarnings,
    totals: {
      asset: assetTotal,
      liability: liabilityTotal,
      equity: equityTotal,
      liabAndEquity: round(liabilityTotal + equityTotal),
    },
    balanced: Math.abs(assetTotal - (liabilityTotal + equityTotal)) < 0.005,
  };
}

export function mockCashFlow(from?: string, to?: string) {
  const rows = aggregate(from, to);
  const revenue = rows.filter((r) => r.type === "revenue").reduce((s, r) => s + (r.credit - r.debit), 0);
  const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + (r.debit - r.credit), 0);
  const netIncome = round(revenue - expense);

  const arIncrease = round(
    rows.filter((r) => r.type === "asset" && /receivable/i.test(r.name)).reduce((s, r) => s + (r.debit - r.credit), 0),
  );
  const inventoryIncrease = round(
    rows.filter((r) => r.type === "asset" && /inventory/i.test(r.name)).reduce((s, r) => s + (r.debit - r.credit), 0),
  );
  const apIncrease = round(
    rows.filter((r) => r.type === "liability" && /payable/i.test(r.name)).reduce((s, r) => s + (r.credit - r.debit), 0),
  );

  const operating = round(netIncome - arIncrease - inventoryIncrease + apIncrease);
  return {
    from: from ?? null,
    to: to ?? null,
    netIncome,
    adjustments: { arIncrease, inventoryIncrease, apIncrease },
    operating,
    investing: 0,
    financing: 0,
    netChange: operating,
  };
}
