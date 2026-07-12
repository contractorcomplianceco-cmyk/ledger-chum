// LedgerOS UI Design Lab — Banking mock fixtures.
// Fictional demonstration data only. No real accounts, no live bank connection.

export type ConnectionState =
  | "csv_import"
  | "manual_entry"
  | "future_secure"
  | "import_review"
  | "current";

export type AccountHealth = "healthy" | "attention" | "at_risk";

export type ReconciliationStatus =
  | "not_started"
  | "in_progress"
  | "needs_review"
  | "ready_for_approval"
  | "reconciled"
  | "overdue"
  | "variance";

export type BankAccount = {
  id: string;
  institution: string;
  nickname: string;
  mask: string;
  type: "Operating Checking" | "Payroll Checking" | "Tax Reserve" | "Business Savings";
  bankBalance: number;
  ledgerBalance: number;
  lastImportedAt: string;
  importMethod: "CSV Import" | "Manual Entry" | "Future Secure Connection";
  connection: ConnectionState;
  reconciliation: ReconciliationStatus;
  pendingReview: number;
  unmatched: number;
  lastReconciledOn: string;
  health: AccountHealth;
};

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "acct-op",
    institution: "Navy Federal Credit Union",
    nickname: "Operating",
    mask: "•• 4021",
    type: "Operating Checking",
    bankBalance: 1_842_318.44,
    ledgerBalance: 1_838_902.11,
    lastImportedAt: "2026-07-10 08:12",
    importMethod: "CSV Import",
    connection: "csv_import",
    reconciliation: "in_progress",
    pendingReview: 14,
    unmatched: 6,
    lastReconciledOn: "2026-06-30",
    health: "attention",
  },
  {
    id: "acct-pr",
    institution: "Navy Federal Credit Union",
    nickname: "Payroll",
    mask: "•• 7712",
    type: "Payroll Checking",
    bankBalance: 384_920.0,
    ledgerBalance: 384_920.0,
    lastImportedAt: "2026-07-10 08:12",
    importMethod: "CSV Import",
    connection: "current",
    reconciliation: "reconciled",
    pendingReview: 0,
    unmatched: 0,
    lastReconciledOn: "2026-06-30",
    health: "healthy",
  },
  {
    id: "acct-tax",
    institution: "Navy Federal Credit Union",
    nickname: "Tax Reserve",
    mask: "•• 5580",
    type: "Tax Reserve",
    bankBalance: 412_500.0,
    ledgerBalance: 412_500.0,
    lastImportedAt: "2026-07-09 17:44",
    importMethod: "Manual Entry",
    connection: "manual_entry",
    reconciliation: "ready_for_approval",
    pendingReview: 2,
    unmatched: 0,
    lastReconciledOn: "2026-06-30",
    health: "healthy",
  },
  {
    id: "acct-sav",
    institution: "Navy Federal Credit Union",
    nickname: "Business Savings",
    mask: "•• 9004",
    type: "Business Savings",
    bankBalance: 205_382.19,
    ledgerBalance: 201_942.19,
    lastImportedAt: "2026-07-01 09:02",
    importMethod: "CSV Import",
    connection: "import_review",
    reconciliation: "overdue",
    pendingReview: 8,
    unmatched: 3,
    lastReconciledOn: "2026-05-31",
    health: "at_risk",
  },
];

export type TransactionKind =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "fee"
  | "interest"
  | "refund";

export type TxStatus =
  | "pending_review"
  | "suggested_match"
  | "categorized"
  | "matched"
  | "split"
  | "transfer"
  | "needs_receipt"
  | "flagged"
  | "reconciled"
  | "excluded";

export type Tx = {
  id: string;
  date: string;
  postedDate: string;
  merchant: string;
  bankDescription: string;
  accountId: string;
  amount: number;
  kind: TransactionKind;
  suggestedCategory?: { code: string; name: string };
  suggestedMatch?: { id: string; label: string; amount: number };
  confidence?: number; // 0-100
  reason?: string;
  status: TxStatus;
  receipt: "attached" | "missing" | "not_required";
  reconciled: boolean;
  source: "Navy Federal CSV" | "Manual" | "Ramp" | "Stripe" | "Zoho";
  importBatch: string;
  bankRef: string;
  memo?: string;
  possibleDuplicateOf?: string;
};

export const TRANSACTIONS: Tx[] = [
  {
    id: "tx-9001",
    date: "2026-07-10",
    postedDate: "2026-07-10",
    merchant: "Stripe Payout — Batch #488",
    bankDescription: "ACH CREDIT STRIPE TRANSFER ST-8H4KDQ",
    accountId: "acct-op",
    amount: 128_420.0,
    kind: "deposit",
    suggestedMatch: { id: "inv-batch-488", label: "Invoice batch #488 (12 invoices)", amount: 128_420.0 },
    confidence: 96,
    reason: "Exact amount + Stripe payout reference within 24h window",
    status: "suggested_match",
    receipt: "not_required",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "REF-ST-8H4KDQ",
  },
  {
    id: "tx-9002",
    date: "2026-07-10",
    postedDate: "2026-07-10",
    merchant: "AWS — Production Infrastructure",
    bankDescription: "AMAZON WEB SERVICES AWS.AMAZON.CO",
    accountId: "acct-op",
    amount: -18_240.12,
    kind: "withdrawal",
    suggestedCategory: { code: "6210", name: "Software & Infrastructure" },
    confidence: 92,
    reason: "Similar to 11 previous AWS transactions",
    status: "pending_review",
    receipt: "missing",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "REF-AWS-2026JUL",
  },
  {
    id: "tx-9003",
    date: "2026-07-09",
    postedDate: "2026-07-09",
    merchant: "Payroll — Bi-weekly Cycle",
    bankDescription: "GUSTO PAYROLL PMT",
    accountId: "acct-pr",
    amount: -212_800.0,
    kind: "withdrawal",
    suggestedMatch: { id: "je-payroll-2607", label: "Payroll journal 2026-07-09", amount: 212_800.0 },
    confidence: 99,
    reason: "Amount + date match to posted payroll journal",
    status: "matched",
    receipt: "not_required",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "REF-GUSTO-260709",
  },
  {
    id: "tx-9004",
    date: "2026-07-09",
    postedDate: "2026-07-09",
    merchant: "Northwind Logistics",
    bankDescription: "ACH CREDIT NORTHWIND LOGISTICS",
    accountId: "acct-op",
    amount: 84_500.0,
    kind: "deposit",
    suggestedMatch: { id: "inv-2264", label: "Invoice #2264 — Northwind Logistics", amount: 84_500.0 },
    confidence: 98,
    reason: "Customer + amount exact match",
    status: "matched",
    receipt: "not_required",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "REF-NW-84500",
  },
  {
    id: "tx-9005",
    date: "2026-07-08",
    postedDate: "2026-07-08",
    merchant: "Ramp — T&E aggregate",
    bankDescription: "RAMP CARD SETTLEMENT",
    accountId: "acct-op",
    amount: -6_412.44,
    kind: "withdrawal",
    suggestedCategory: { code: "6410", name: "Travel & Entertainment" },
    confidence: 74,
    reason: "Ramp settlement — split across 8 card transactions",
    status: "needs_receipt",
    receipt: "missing",
    reconciled: false,
    source: "Ramp",
    importBatch: "RAMP-20260708",
    bankRef: "RMP-SET-0708",
  },
  {
    id: "tx-9006",
    date: "2026-07-08",
    postedDate: "2026-07-08",
    merchant: "Acme Holdings — Retainer",
    bankDescription: "WIRE IN ACME HOLDINGS RETAINER",
    accountId: "acct-op",
    amount: 45_000.0,
    kind: "deposit",
    suggestedCategory: { code: "4010", name: "Retainer Revenue" },
    confidence: 88,
    reason: "Recurring monthly retainer pattern",
    status: "categorized",
    receipt: "not_required",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "WIRE-ACME-0708",
  },
  {
    id: "tx-9007",
    date: "2026-07-07",
    postedDate: "2026-07-07",
    merchant: "Transfer to Tax Reserve",
    bankDescription: "INTERNAL XFER TO 5580",
    accountId: "acct-op",
    amount: -60_000.0,
    kind: "transfer",
    status: "transfer",
    receipt: "not_required",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "XFR-260707-A",
    memo: "Quarterly tax reserve funding",
  },
  {
    id: "tx-9008",
    date: "2026-07-07",
    postedDate: "2026-07-07",
    merchant: "Zoho Books — Subscription",
    bankDescription: "ZOHO CORP SUBSCRIPTION",
    accountId: "acct-op",
    amount: -1_248.0,
    kind: "withdrawal",
    suggestedCategory: { code: "6220", name: "Software Subscriptions" },
    confidence: 97,
    status: "categorized",
    receipt: "attached",
    reconciled: true,
    source: "Zoho",
    importBatch: "NFCU-20260710-A",
    bankRef: "REF-ZOHO-JUL",
  },
  {
    id: "tx-9009",
    date: "2026-07-06",
    postedDate: "2026-07-06",
    merchant: "Refund — Overpayment #2201",
    bankDescription: "ACH DEBIT REFUND ARROW MFG",
    accountId: "acct-op",
    amount: -3_412.0,
    kind: "refund",
    status: "pending_review",
    receipt: "missing",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "RFD-2201",
  },
  {
    id: "tx-9010",
    date: "2026-07-05",
    postedDate: "2026-07-05",
    merchant: "Interest Earned",
    bankDescription: "INTEREST CREDIT NFCU",
    accountId: "acct-sav",
    amount: 412.19,
    kind: "interest",
    suggestedCategory: { code: "7010", name: "Interest Income" },
    confidence: 100,
    status: "categorized",
    receipt: "not_required",
    reconciled: true,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260701-S",
    bankRef: "INT-260705",
  },
  {
    id: "tx-9011",
    date: "2026-07-05",
    postedDate: "2026-07-05",
    merchant: "Wire Fee",
    bankDescription: "OUTGOING WIRE FEE",
    accountId: "acct-op",
    amount: -35.0,
    kind: "fee",
    suggestedCategory: { code: "6820", name: "Bank Fees" },
    confidence: 100,
    status: "categorized",
    receipt: "not_required",
    reconciled: true,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "FEE-WIRE-0705",
  },
  {
    id: "tx-9012",
    date: "2026-07-04",
    postedDate: "2026-07-04",
    merchant: "Duplicate? AWS Charge",
    bankDescription: "AMAZON WEB SERVICES AWS.AMAZON.CO",
    accountId: "acct-op",
    amount: -18_240.12,
    kind: "withdrawal",
    status: "flagged",
    receipt: "missing",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "REF-AWS-DUP",
    possibleDuplicateOf: "tx-9002",
    reason: "Same merchant + identical amount within 6 days",
  },
  {
    id: "tx-9013",
    date: "2026-07-03",
    postedDate: "2026-07-03",
    merchant: "Client Payment — Brightside Co",
    bankDescription: "ACH CREDIT BRIGHTSIDE",
    accountId: "acct-op",
    amount: 22_400.0,
    kind: "deposit",
    suggestedMatch: { id: "inv-2241", label: "Invoice #2241 — Brightside Co", amount: 22_400.0 },
    confidence: 95,
    status: "suggested_match",
    receipt: "not_required",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "ACH-BRT-2241",
  },
  {
    id: "tx-9014",
    date: "2026-07-02",
    postedDate: "2026-07-02",
    merchant: "Expense Reimbursement — R. Alvarez",
    bankDescription: "ACH DEBIT REIMB ALVAREZ",
    accountId: "acct-op",
    amount: -842.15,
    kind: "withdrawal",
    suggestedCategory: { code: "6420", name: "Employee Reimbursements" },
    confidence: 89,
    status: "needs_receipt",
    receipt: "missing",
    reconciled: false,
    source: "Navy Federal CSV",
    importBatch: "NFCU-20260710-A",
    bankRef: "REIMB-ALV-0702",
  },
];

export const IMPORT_HISTORY = [
  {
    id: "imp-1",
    fileName: "nfcu-operating-20260710.csv",
    accountId: "acct-op",
    importedAt: "2026-07-10 08:12",
    imported: 42,
    duplicates: 1,
    errors: 0,
    importedBy: "R. Alvarez",
    status: "needs_review" as const,
  },
  {
    id: "imp-2",
    fileName: "nfcu-payroll-20260710.csv",
    accountId: "acct-pr",
    importedAt: "2026-07-10 08:12",
    imported: 4,
    duplicates: 0,
    errors: 0,
    importedBy: "R. Alvarez",
    status: "posted" as const,
  },
  {
    id: "imp-3",
    fileName: "nfcu-savings-20260701.csv",
    accountId: "acct-sav",
    importedAt: "2026-07-01 09:02",
    imported: 12,
    duplicates: 0,
    errors: 2,
    importedBy: "C. Park",
    status: "flagged" as const,
  },
  {
    id: "imp-4",
    fileName: "ramp-settlement-20260708.csv",
    accountId: "acct-op",
    importedAt: "2026-07-08 21:30",
    imported: 8,
    duplicates: 0,
    errors: 0,
    importedBy: "System",
    status: "posted" as const,
  },
];

export const BANKING_ALERTS = [
  {
    id: "al-1",
    severity: "critical" as const,
    title: "Duplicate transaction detected — Business Savings",
    detail: "AWS charge appears twice on Operating within 6 days. Review before reconciliation.",
    account: "Operating •• 4021",
  },
  {
    id: "al-2",
    severity: "warning" as const,
    title: "Reconciliation overdue — Business Savings",
    detail: "Last reconciled 2026-05-31. Statement period 2026-06 closed 12 days ago.",
    account: "Business Savings •• 9004",
  },
  {
    id: "al-3",
    severity: "warning" as const,
    title: "Ledger / bank difference: $3,416.33",
    detail: "Operating account variance since last import.",
    account: "Operating •• 4021",
  },
  {
    id: "al-4",
    severity: "review" as const,
    title: "6 transactions missing receipts",
    detail: "Above the $500 receipt threshold in current period.",
    account: "Operating •• 4021",
  },
  {
    id: "al-5",
    severity: "info" as const,
    title: "Suspense account used in 2 entries",
    detail: "Clear before month-end close.",
    account: "Operating •• 4021",
  },
];

export const CATEGORY_GROUPS = [
  {
    label: "Suggested",
    accounts: [{ code: "6210", name: "Software & Infrastructure", type: "Expense", note: "Recurring match" }],
  },
  {
    label: "Recently used",
    accounts: [
      { code: "6220", name: "Software Subscriptions", type: "Expense" },
      { code: "6410", name: "Travel & Entertainment", type: "Expense" },
      { code: "4010", name: "Retainer Revenue", type: "Revenue" },
    ],
  },
  {
    label: "Revenue",
    accounts: [
      { code: "4000", name: "Service Revenue", type: "Revenue" },
      { code: "4010", name: "Retainer Revenue", type: "Revenue" },
      { code: "4100", name: "Product Revenue", type: "Revenue" },
      { code: "7010", name: "Interest Income", type: "Revenue" },
    ],
  },
  {
    label: "Expenses",
    accounts: [
      { code: "6210", name: "Software & Infrastructure", type: "Expense" },
      { code: "6220", name: "Software Subscriptions", type: "Expense" },
      { code: "6410", name: "Travel & Entertainment", type: "Expense" },
      { code: "6420", name: "Employee Reimbursements", type: "Expense" },
      { code: "6820", name: "Bank Fees", type: "Expense" },
    ],
  },
  {
    label: "Assets",
    accounts: [
      { code: "1010", name: "Cash — Operating", type: "Asset" },
      { code: "1020", name: "Cash — Payroll", type: "Asset" },
      { code: "1030", name: "Cash — Tax Reserve", type: "Asset", restricted: true },
    ],
  },
  {
    label: "Transfers & suspense",
    accounts: [
      { code: "1090", name: "Intercompany Transfers", type: "Clearing" },
      { code: "1099", name: "Suspense", type: "Clearing", restricted: true },
    ],
  },
];

export const MATCH_CANDIDATES = [
  { id: "inv-2264", type: "Invoice payment", label: "Invoice #2264 — Northwind Logistics", date: "2026-07-08", amount: 84_500.0, confidence: 98, diff: 0 },
  { id: "inv-2241", type: "Invoice payment", label: "Invoice #2241 — Brightside Co", date: "2026-07-02", amount: 22_400.0, confidence: 95, diff: 0 },
  { id: "bill-882", type: "Bill payment", label: "Bill #882 — CDW Direct", date: "2026-07-06", amount: 4_128.0, confidence: 71, diff: 12.0 },
  { id: "je-892", type: "Journal entry", label: "JE #892 — Accrued interest reversal", date: "2026-07-05", amount: 412.19, confidence: 82, diff: 0 },
];

export const RECON_HISTORY = [
  {
    id: "rec-1",
    accountId: "acct-op",
    period: "Jun 2026",
    starting: 1_620_400.11,
    ending: 1_838_902.11,
    diff: 0,
    status: "reconciled" as const,
    preparedBy: "K. Chen",
    approvedBy: "M. Rose",
    completedOn: "2026-07-02",
  },
  {
    id: "rec-2",
    accountId: "acct-pr",
    period: "Jun 2026",
    starting: 402_120.0,
    ending: 384_920.0,
    diff: 0,
    status: "reconciled" as const,
    preparedBy: "K. Chen",
    approvedBy: "M. Rose",
    completedOn: "2026-07-02",
  },
  {
    id: "rec-3",
    accountId: "acct-sav",
    period: "May 2026",
    starting: 198_912.0,
    ending: 201_942.19,
    diff: 3_440.0,
    status: "variance" as const,
    preparedBy: "K. Chen",
    approvedBy: "—",
    completedOn: "2026-06-14",
  },
];
