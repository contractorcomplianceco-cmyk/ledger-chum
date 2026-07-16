/**
 * Master Feature Registry — LedgerOS
 *
 * Authoritative source of truth for every feature discussed for LedgerOS.
 * This is planning data (mock). It does not modify any backend, Supabase,
 * or authentication configuration.
 *
 * Every record answers: "Do we have this feature, and what stage is it in?"
 */

export type FeatureStatus =
  | "built"
  | "designed"
  | "typed_api_ready"
  | "mock_ui_complete"
  | "planned"
  | "blocked_policy"
  | "blocked_legal"
  | "blocked_accounting"
  | "blocked_integration"
  | "blocked_backend"
  | "in_production_build"
  | "ready_for_testing"
  | "ready_for_parallel_run"
  | "ready_for_cutover"
  | "post_launch";

export type FeatureFlag =
  | "requires_backend"
  | "requires_database"
  | "requires_api"
  | "requires_integration"
  | "requires_legal_review"
  | "requires_accountant_review"
  | "requires_tax_review"
  | "requires_security_review"
  | "requires_data_migration"
  | "requires_owner_approval"
  | "requires_christin_review"
  | "requires_carmen_review"
  | "sensitive_data"
  | "high_financial_risk"
  | "ai_advisory_only"
  | "draft_only_action"
  | "production_critical";

export type ReleaseBucket = "v1" | "v1.5" | "v2" | "v3" | "future" | "post_launch";

export type Priority = "P0" | "P1" | "P2" | "P3";

export type NavGroupId =
  | "overview"
  | "accounting"
  | "banking_cash"
  | "sales_billing"
  | "purchases_spend"
  | "compensation_participation"
  | "payroll_people"
  | "travel_events"
  | "profitability_intelligence"
  | "owner_entity"
  | "legal_tax_community"
  | "assets_procurement"
  | "automation"
  | "integrations"
  | "admin";

export type Placement = "sidebar" | "child_only" | "tab" | "search_only" | "hidden_until_built";

export interface FeatureRecord {
  id: string;
  name: string;
  module: string;
  submodule?: string;
  description: string;
  status: FeatureStatus;
  flags: FeatureFlag[];
  existingRoute?: string;
  futureRoute?: string;
  existingNavGroup?: string;
  futureNavGroup: NavGroupId;
  placement: Placement;
  roles: string[];
  permissions: string[];
  backendRequired: boolean;
  entities?: string[];
  endpoints?: string[];
  integrations?: string[];
  sourceSystems?: string[];
  financialImpact: "none" | "low" | "medium" | "high" | "critical";
  legalRisk: "none" | "low" | "medium" | "high";
  accountingRisk: "none" | "low" | "medium" | "high";
  taxRisk: "none" | "low" | "medium" | "high";
  securityRisk: "none" | "low" | "medium" | "high";
  owner?: string;
  reviewer?: string;
  priority: Priority;
  targetRelease: ReleaseBucket;
  dependencies?: string[];
  blockingDecisions?: string[];
  acceptanceCriteria?: string[];
  notes?: string;
  lastUpdated: string;
  linkedSpec?: string;
  linkedMockScreen?: string;
  linkedAuditEvents?: string[];
  linkedTestCases?: string[];
}

// ---------------------------------------------------------------------------
// Helper builder — reduces boilerplate for the ~450 records that follow.
// ---------------------------------------------------------------------------

type FeatureDefaults = Partial<FeatureRecord> & {
  module: string;
  futureNavGroup: NavGroupId;
};

function mk(id: string, name: string, d: FeatureDefaults): FeatureRecord {
  return {
    id,
    name,
    description: d.description ?? name,
    module: d.module,
    submodule: d.submodule,
    status: d.status ?? "planned",
    flags: d.flags ?? [],
    existingRoute: d.existingRoute,
    futureRoute: d.futureRoute,
    existingNavGroup: d.existingNavGroup,
    futureNavGroup: d.futureNavGroup,
    placement: d.placement ?? "hidden_until_built",
    roles: d.roles ?? ["owner", "accounting_lead"],
    permissions: d.permissions ?? [],
    backendRequired: d.backendRequired ?? true,
    entities: d.entities,
    endpoints: d.endpoints,
    integrations: d.integrations,
    sourceSystems: d.sourceSystems,
    financialImpact: d.financialImpact ?? "medium",
    legalRisk: d.legalRisk ?? "low",
    accountingRisk: d.accountingRisk ?? "medium",
    taxRisk: d.taxRisk ?? "low",
    securityRisk: d.securityRisk ?? "low",
    owner: d.owner ?? "Rose",
    reviewer: d.reviewer,
    priority: d.priority ?? "P2",
    targetRelease: d.targetRelease ?? "v1.5",
    dependencies: d.dependencies,
    blockingDecisions: d.blockingDecisions,
    acceptanceCriteria: d.acceptanceCriteria,
    notes: d.notes,
    lastUpdated: d.lastUpdated ?? "2026-07-13",
    linkedSpec: d.linkedSpec,
    linkedMockScreen: d.linkedMockScreen,
    linkedAuditEvents: d.linkedAuditEvents,
    linkedTestCases: d.linkedTestCases,
  };
}

// Convenience shorthands
const BUILT: FeatureFlag[] = [];
const MOCK: Partial<FeatureRecord> = { status: "mock_ui_complete", backendRequired: true };
const PLANNED: Partial<FeatureRecord> = { status: "planned" };
const V1: Partial<FeatureRecord> = {
  targetRelease: "v1",
  priority: "P0",
  flags: ["production_critical", "requires_backend"],
};

// ---------------------------------------------------------------------------
// 1. Core Accounting
// ---------------------------------------------------------------------------
const CORE_ACCOUNTING: FeatureRecord[] = [
  mk("acc.general-ledger", "General Ledger", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    description: "Double-entry ledger for every posted journal line.",
    status: "mock_ui_complete",
    existingRoute: "/ledger/general",
    existingNavGroup: "Accounting",
    placement: "sidebar",
    ...V1,
    financialImpact: "critical",
    accountingRisk: "high",
    entities: ["journal_entry", "journal_line", "account"],
    permissions: ["ledger.view"],
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
  }),
  mk("acc.chart-of-accounts", "Chart of Accounts", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    status: "mock_ui_complete",
    existingRoute: "/ledger/accounts",
    placement: "sidebar",
    ...V1,
    financialImpact: "critical",
    accountingRisk: "high",
    entities: ["account"],
    permissions: ["ledger.view"],
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
  }),
  mk("acc.journal-entries", "Journal Entries", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    status: "mock_ui_complete",
    existingRoute: "/ledger/journals",
    placement: "sidebar",
    ...V1,
    financialImpact: "critical",
    accountingRisk: "high",
    entities: ["journal_entry", "journal_line"],
    permissions: ["journal.create", "journal.post"],
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "draft_only_action",
    ],
  }),
  mk("acc.reversals", "Reversing Entries", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
    accountingRisk: "high",
    description: "Reverse posted journals on approval with audit trail.",
  }),
  mk("acc.locked-periods", "Locked Periods", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    ...V1,
    description: "Prevent posting to closed periods without approval.",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "requires_owner_approval",
    ],
  }),
  mk("acc.monthly-close", "Monthly Close", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    status: "mock_ui_complete",
    existingRoute: "/close",
    placement: "sidebar",
    ...V1,
    financialImpact: "critical",
    accountingRisk: "high",
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
  }),
  mk("acc.trial-balance", "Trial Balance", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    ...V1,
    placement: "tab",
    flags: ["production_critical", "requires_backend"],
  }),
  mk("acc.balance-sheet", "Balance Sheet", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    status: "mock_ui_complete",
    existingRoute: "/reports",
    placement: "tab",
    ...V1,
    permissions: ["reports.view"],
    flags: ["production_critical", "requires_backend"],
  }),
  mk("acc.profit-loss", "Profit & Loss", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    status: "mock_ui_complete",
    existingRoute: "/reports",
    placement: "tab",
    ...V1,
    permissions: ["reports.view"],
    flags: ["production_critical", "requires_backend"],
  }),
  mk("acc.cash-flow", "Cash Flow Statement", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    status: "mock_ui_complete",
    existingRoute: "/reports",
    placement: "tab",
    ...V1,
    permissions: ["reports.view"],
    flags: ["production_critical", "requires_backend"],
  }),
  mk("acc.audit-log", "Audit Log", {
    module: "Core Accounting",
    futureNavGroup: "admin",
    status: "mock_ui_complete",
    existingRoute: "/audit",
    placement: "sidebar",
    ...V1,
    permissions: ["audit.view"],
    flags: ["production_critical", "requires_backend", "requires_security_review"],
    securityRisk: "high",
  }),
  mk("acc.policies", "Accounting Policies", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
  }),
  mk("acc.close-checklist", "Closing Checklist", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    ...V1,
  }),
  mk("acc.reconciliation", "Accounting Reconciliation", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
  }),
  mk("acc.export-packets", "Accountant Export Packets", {
    module: "Core Accounting",
    futureNavGroup: "accounting",
    ...V1,
    description: "Downloadable close packet for external accountants.",
  }),
];

// ---------------------------------------------------------------------------
// 2. Banking & Cash
// ---------------------------------------------------------------------------
const BANKING_CASH: FeatureRecord[] = [
  mk("bank.accounts", "Bank Accounts", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    status: "mock_ui_complete",
    existingRoute: "/banking",
    placement: "sidebar",
    ...V1,
    entities: ["bank_account"],
    flags: ["production_critical", "requires_backend", "requires_integration"],
    integrations: ["Navy Federal"],
  }),
  mk("bank.navy-federal-import", "Navy Federal Import", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    status: "blocked_integration",
    ...V1,
    integrations: ["Navy Federal"],
    flags: ["production_critical", "requires_backend", "requires_integration", "sensitive_data"],
    securityRisk: "high",
  }),
  mk("bank.transactions", "Transaction Review", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    status: "mock_ui_complete",
    existingRoute: "/banking/transactions",
    placement: "sidebar",
    ...V1,
    flags: ["production_critical", "requires_backend"],
  }),
  mk("bank.matching", "Transaction Matching", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    status: "mock_ui_complete",
    existingRoute: "/banking/transactions",
    placement: "tab",
    ...V1,
  }),
  mk("bank.reconciliation", "Bank Reconciliation", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    status: "mock_ui_complete",
    existingRoute: "/banking/reconciliation",
    placement: "sidebar",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
  }),
  mk("bank.outstanding-checks", "Outstanding Checks", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    ...V1,
    placement: "tab",
  }),
  mk("bank.cash-forecast", "Cash Forecast", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    status: "mock_ui_complete",
    existingRoute: "/cash-availability",
    ...V1,
    placement: "tab",
  }),
  mk("bank.true-available-cash", "True Available Cash", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    status: "mock_ui_complete",
    existingRoute: "/cash-availability",
    placement: "sidebar",
    ...V1,
    financialImpact: "critical",
  }),
  mk("bank.restricted-cash", "Restricted Cash", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    ...V1,
    placement: "tab",
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
  }),
  mk("bank.payroll-reserve", "Payroll Reserve", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    ...V1,
    placement: "tab",
  }),
  mk("bank.tax-reserve", "Tax Reserve", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    ...V1,
    placement: "tab",
    flags: ["production_critical", "requires_backend", "requires_tax_review"],
  }),
  mk("bank.commission-reserve", "Commission Reserve", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    status: "mock_ui_complete",
    existingRoute: "/compensation/reserves",
    placement: "tab",
    ...V1,
  }),
  mk("bank.passthrough-reserve", "Pass-Through Reserve", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    ...V1,
    placement: "tab",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "high_financial_risk",
    ],
  }),
  mk("bank.guardrails", "Cash Guardrails", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    status: "mock_ui_complete",
    existingRoute: "/automation/cash-controls",
    placement: "sidebar",
    ...V1,
    flags: ["production_critical", "requires_backend", "high_financial_risk"],
  }),
  mk("bank.transfer-approval", "Cash Transfer Approval", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_owner_approval"],
  }),
  mk("bank.fees", "Bank Fee Tracking", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    targetRelease: "v1.5",
    priority: "P2",
    placement: "tab",
  }),
  mk("bank.interest", "Interest Tracking", {
    module: "Banking & Cash",
    futureNavGroup: "banking_cash",
    targetRelease: "v1.5",
    priority: "P2",
    placement: "tab",
  }),
];

// ---------------------------------------------------------------------------
// 3. Revenue Allocation
// ---------------------------------------------------------------------------
const REVENUE_ALLOCATION: FeatureRecord[] = [
  mk("rev.cca-service-revenue", "CCA Service Revenue", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
    accountingRisk: "high",
  }),
  mk("rev.passthrough-allocation", "Pass-Through Fee Allocation", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    status: "mock_ui_complete",
    existingRoute: "/cash-availability/allocations",
    ...V1,
    placement: "sidebar",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "high_financial_risk",
    ],
    accountingRisk: "high",
  }),
  mk("rev.commission-allocation", "Commission Allocation", {
    module: "Revenue Allocation",
    futureNavGroup: "compensation_participation",
    status: "mock_ui_complete",
    existingRoute: "/compensation/reserves",
    ...V1,
  }),
  mk("rev.tax-allocation", "Tax Allocation", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_tax_review"],
    taxRisk: "high",
  }),
  mk("rev.deferred-revenue", "Deferred Revenue", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
    accountingRisk: "high",
  }),
  mk("rev.refundable-deposits", "Refundable Deposits", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
  }),
  mk("rev.qualifier-payables", "Qualifier Payables", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_legal_review"],
    legalRisk: "medium",
  }),
  mk("rev.third-party-costs", "Third-Party Costs", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
  }),
  mk("rev.revenue-recognition", "Revenue Recognition", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_accountant_review"],
    accountingRisk: "high",
  }),
  mk("rev.allocation-rules", "Allocation Rules", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    status: "mock_ui_complete",
    existingRoute: "/cash-availability/rules",
    ...V1,
    placement: "sidebar",
  }),
  mk("rev.allocation-preview", "Allocation Preview", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    status: "mock_ui_complete",
    ...V1,
    placement: "tab",
  }),
  mk("rev.allocation-audit", "Allocation Audit", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    placement: "tab",
  }),
  mk("rev.expired-reserve-review", "Expired Reserve Review", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    placement: "tab",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "requires_legal_review",
    ],
  }),
  mk("rev.dormant-passthrough", "Dormant Pass-Through Review", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    placement: "tab",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "requires_legal_review",
      "high_financial_risk",
    ],
    legalRisk: "high",
    accountingRisk: "high",
    description:
      "Reviews pass-through balances aging past defined dormancy threshold; requires legal/escheatment guidance.",
  }),
  mk("rev.controlled-reclass", "Controlled Reclassification", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "requires_owner_approval",
    ],
  }),
  mk("rev.refund-review", "Refund Review", {
    module: "Revenue Allocation",
    futureNavGroup: "accounting",
    ...V1,
  }),
  mk("rev.escheatment", "Escheatment / Unclaimed Property", {
    module: "Revenue Allocation",
    futureNavGroup: "legal_tax_community",
    ...V1,
    status: "blocked_legal",
    flags: [
      "requires_legal_review",
      "requires_accountant_review",
      "requires_tax_review",
      "high_financial_risk",
    ],
    legalRisk: "high",
    taxRisk: "high",
  }),
];

// ---------------------------------------------------------------------------
// 4. Invoicing & Receivables
// ---------------------------------------------------------------------------
const INVOICING: FeatureRecord[] = [
  mk("inv.customers", "Customers", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    status: "mock_ui_complete",
    existingRoute: "/customers",
    placement: "sidebar",
    ...V1,
  }),
  mk("inv.estimates", "Estimates", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    status: "mock_ui_complete",
    existingRoute: "/estimates",
    placement: "sidebar",
    ...V1,
  }),
  mk("inv.proposals", "Proposals", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    targetRelease: "v1.5",
    priority: "P2",
  }),
  mk("inv.invoices", "Invoices", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    status: "mock_ui_complete",
    existingRoute: "/invoices",
    placement: "sidebar",
    ...V1,
    financialImpact: "critical",
  }),
  mk("inv.recurring", "Recurring Invoices", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    status: "mock_ui_complete",
    existingRoute: "/invoices/recurring",
    placement: "sidebar",
    ...V1,
  }),
  mk("inv.credit-notes", "Credit Notes", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    status: "mock_ui_complete",
    existingRoute: "/invoices/credit-notes",
    placement: "sidebar",
    ...V1,
  }),
  mk("inv.statements", "Customer Statements", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    ...V1,
    placement: "tab",
  }),
  mk("inv.deposits", "Deposits", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    ...V1,
    placement: "tab",
  }),
  mk("inv.retainers", "Retainers", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    ...V1,
    placement: "tab",
  }),
  mk("inv.milestone-billing", "Milestone Billing", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    ...V1,
  }),
  mk("inv.progress-billing", "Progress Billing", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    targetRelease: "v1.5",
    priority: "P2",
  }),
  mk("inv.subscription-billing", "Subscription Billing", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    targetRelease: "v1.5",
    priority: "P2",
    integrations: ["Zoho Billing"],
  }),
  mk("inv.payment-links", "Payment Links", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_integration"],
  }),
  mk("inv.payment-reminders", "Payment Reminders", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    ...V1,
    placement: "tab",
  }),
  mk("inv.late-fees", "Late Fees", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    targetRelease: "v1.5",
    priority: "P2",
    flags: ["requires_legal_review"],
    legalRisk: "medium",
  }),
  mk("inv.client-portal", "Client Portal", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    targetRelease: "v1.5",
    priority: "P1",
    integrations: ["Client Portal"],
    flags: ["requires_backend", "requires_integration", "sensitive_data"],
  }),
  mk("inv.ai-invoice-drafting", "AI Invoice Studio", {
    module: "Invoicing & Receivables",
    futureNavGroup: "profitability_intelligence",
    targetRelease: "v1.5",
    priority: "P2",
    flags: ["ai_advisory_only", "draft_only_action"],
    description: "AI drafts invoices from CRM opportunities; humans approve before posting.",
  }),
  mk("inv.templates", "Fully Custom Invoice Templates", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    targetRelease: "v1.5",
  }),
  mk("inv.template-versioning", "Invoice Template Versioning", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    targetRelease: "v1.5",
  }),
  mk("inv.margin-preview", "Margin Preview", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    status: "mock_ui_complete",
    ...V1,
    placement: "tab",
  }),
  mk("inv.allocation-preview", "Invoice Allocation Preview", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    status: "mock_ui_complete",
    ...V1,
    placement: "tab",
  }),
  mk("inv.payment-likelihood", "Payment Likelihood", {
    module: "Invoicing & Receivables",
    futureNavGroup: "profitability_intelligence",
    status: "mock_ui_complete",
    targetRelease: "v1.5",
    flags: ["ai_advisory_only"],
  }),
  mk("inv.smarter-billing-recs", "Smarter Billing Recommendations", {
    module: "Invoicing & Receivables",
    futureNavGroup: "profitability_intelligence",
    targetRelease: "v1.5",
    priority: "P2",
    flags: ["ai_advisory_only"],
  }),
  mk("inv.collection-prioritization", "Collection Prioritization", {
    module: "Invoicing & Receivables",
    futureNavGroup: "sales_billing",
    status: "mock_ui_complete",
    existingRoute: "/automation/collections",
    ...V1,
    placement: "tab",
  }),
  mk("inv.revenue-leakage", "Revenue Leakage Detection", {
    module: "Invoicing & Receivables",
    futureNavGroup: "profitability_intelligence",
    status: "mock_ui_complete",
    existingRoute: "/intelligence/leakage",
    targetRelease: "v1.5",
    flags: ["ai_advisory_only"],
  }),
];

// ---------------------------------------------------------------------------
// 5. Markup & Micro-Margin
// ---------------------------------------------------------------------------
const MARKUP: FeatureRecord[] = [
  "Product Cost",
  "Client Price",
  "Fixed Markup",
  "Percentage Markup",
  "Tiered Markup",
  "Rush Markup",
  "Processing Markup",
  "Administrative Markup",
  "Technology Surcharge",
  "Pass-Through Markup",
  "Contract Allowance",
  "Lost Markup Detection",
  "Markup Margin",
  "Vendor Cost Increase Alert",
  "Estimated vs Realized Markup",
  "Markup Profitability",
].map((name, i) =>
  mk(`mkp.${i}`, name, {
    module: "Markup & Micro-Margin",
    futureNavGroup: "profitability_intelligence",
    targetRelease: "v1",
    priority: "P1",
    flags: ["production_critical", "requires_backend"],
    status: "planned",
    accountingRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 6. Expenses & Reimbursements
// ---------------------------------------------------------------------------
const EXPENSES: FeatureRecord[] = [
  mk("exp.submission", "Expense Submission", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/submit",
    placement: "sidebar",
    ...V1,
  }),
  mk("exp.receipt-upload", "Receipt Upload", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/receipts",
    placement: "sidebar",
    ...V1,
  }),
  mk("exp.ocr", "OCR / Receipt Extraction", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    ...V1,
    flags: ["production_critical", "requires_backend", "requires_integration"],
  }),
  mk("exp.reports", "Expense Reports", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/reports",
    ...V1,
    placement: "tab",
  }),
  mk("exp.approval", "Expense Approval", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/approvals",
    placement: "sidebar",
    ...V1,
  }),
  mk("exp.reimbursements", "Reimbursements", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/reimbursements",
    ...V1,
  }),
  mk("exp.missing-receipt", "Missing Receipt", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    ...V1,
    placement: "tab",
  }),
  mk("exp.duplicate-detection", "Duplicate Detection", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    ...V1,
    placement: "tab",
    flags: ["production_critical", "requires_backend", "ai_advisory_only"],
  }),
  mk("exp.policy-engine", "Policy Engine", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/policies",
    ...V1,
  }),
  mk("exp.smart-matching", "Smart Matching", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/matching",
    targetRelease: "v1.5",
  }),
  mk("exp.bank-match", "Bank Match", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    ...V1,
    placement: "tab",
  }),
  mk("exp.subscription-match", "Subscription Match", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/subscriptions",
    ...V1,
  }),
  mk("exp.client-reimbursable", "Client-Reimbursable Expense", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    ...V1,
  }),
  mk("exp.recovery", "Expense Recovery", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/recovery",
    targetRelease: "v1.5",
  }),
  mk("exp.attribution", "Expense Attribution", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "profitability_intelligence",
    targetRelease: "v1.5",
    priority: "P2",
  }),
  mk("exp.vendor-spend", "Vendor Spend", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/vendors",
    ...V1,
    placement: "sidebar",
  }),
  mk("exp.anomalies", "Expense Anomalies", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "profitability_intelligence",
    status: "mock_ui_complete",
    existingRoute: "/expenses/intelligence",
    targetRelease: "v1.5",
    flags: ["ai_advisory_only"],
  }),
  mk("exp.pre-spend", "Pre-Spend Requests", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "purchases_spend",
    status: "mock_ui_complete",
    existingRoute: "/expenses/pre-spend",
    targetRelease: "v1.5",
  }),
  mk("exp.copilot", "Expense Copilot", {
    module: "Expenses & Reimbursements",
    futureNavGroup: "profitability_intelligence",
    status: "mock_ui_complete",
    existingRoute: "/expenses/copilot",
    targetRelease: "v1.5",
    flags: ["ai_advisory_only", "draft_only_action"],
  }),
];

// ---------------------------------------------------------------------------
// 7. Travel, Events & Development
// ---------------------------------------------------------------------------
const TRAVEL_EVENTS: FeatureRecord[] = [
  "Travel Request",
  "Travel Approval",
  "Trip Budget",
  "Company Trips",
  "Conventions",
  "Trade Shows",
  "Retreats",
  "Client Visits",
  "International Travel",
  "Registration Fees",
  "Flights",
  "Hotels",
  "Ground Transport",
  "Meals",
  "Booths",
  "Sponsorships",
  "Swag",
  "Shipping",
  "Travel Stipends",
  "Per Diem",
  "Event ROI",
  "Lead Tracking",
  "Partnership Tracking",
  "Continuing Education",
  "Personal Development Budget",
  "Education Wallet",
  "Certifications",
  "Professional Memberships",
  "Training Hours",
  "Training ROI",
].map((name, i) =>
  mk(`trv.${i}`, name, {
    module: "Travel, Events & Development",
    futureNavGroup: "travel_events",
    targetRelease: "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["requires_backend"],
  }),
);

// ---------------------------------------------------------------------------
// 8. Employee Appreciation & Culture
// ---------------------------------------------------------------------------
const APPRECIATION: FeatureRecord[] = [
  "Birthday Gifts",
  "Anniversary Gifts",
  "Holiday Gifts",
  "Gift Cards",
  "Team Lunches",
  "Recognition Awards",
  "Employee Contests",
  "Company Celebrations",
  "Appreciation Events",
  "Culture Spend",
  "Retention Correlation",
  "Engagement Correlation",
].map((name, i) =>
  mk(`apc.${i}`, name, {
    module: "Employee Appreciation & Culture",
    futureNavGroup: "payroll_people",
    targetRelease: "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["requires_backend", "requires_tax_review"],
    taxRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 9. Payroll & Workforce
// ---------------------------------------------------------------------------
const PAYROLL: FeatureRecord[] = [
  {
    n: "ADP Payroll Integration",
    flg: [
      "production_critical",
      "requires_backend",
      "requires_integration",
      "sensitive_data",
    ] as FeatureFlag[],
    r: "v1" as ReleaseBucket,
    p: "P0" as Priority,
  },
  {
    n: "Payroll Summary",
    flg: ["production_critical", "requires_backend", "requires_integration"] as FeatureFlag[],
    r: "v1" as ReleaseBucket,
    p: "P0" as Priority,
    existingRoute: "/payroll",
  },
  {
    n: "Payroll Variance",
    flg: [] as FeatureFlag[],
    r: "v1" as ReleaseBucket,
    p: "P1" as Priority,
  },
  { n: "Salary" },
  { n: "Hourly Wages" },
  { n: "Overtime" },
  { n: "Commissions" },
  { n: "Bonuses" },
  { n: "Reimbursements" },
  { n: "Retro Pay" },
  { n: "Correction Pay" },
  { n: "Supplemental Pay" },
  { n: "Holiday Pay" },
  { n: "Travel Pay" },
  { n: "Per Diem" },
  { n: "Stipends" },
  { n: "Severance", flg: ["requires_legal_review"] as FeatureFlag[] },
  { n: "Garnishments", flg: ["requires_legal_review", "sensitive_data"] as FeatureFlag[] },
  { n: "Employer Taxes", flg: ["requires_tax_review"] as FeatureFlag[] },
  { n: "Payroll Liabilities" },
  { n: "Payroll Clearing" },
  { n: "Special Pay Requests" },
  {
    n: "Payroll Reconciliation",
    flg: ["production_critical"] as FeatureFlag[],
    r: "v1" as ReleaseBucket,
    p: "P0" as Priority,
  },
].map(
  (
    x: { n: string; flg?: FeatureFlag[]; r?: ReleaseBucket; p?: Priority; existingRoute?: string },
    i,
  ) =>
    mk(`pay.${i}`, x.n, {
      module: "Payroll & Workforce",
      futureNavGroup: "payroll_people",
      targetRelease: x.r ?? "v1.5",
      priority: x.p ?? "P2",
      status: "planned",
      flags: x.flg ?? ["requires_backend"],
      integrations: ["ADP"],
      existingRoute: x.existingRoute,
      sensitiveAccess: true,
      financialImpact: "high",
      accountingRisk: "high",
    } as FeatureDefaults),
);

// ---------------------------------------------------------------------------
// 10. Employee Benefits
// ---------------------------------------------------------------------------
const BENEFITS: FeatureRecord[] = [
  "Health Insurance",
  "Dental",
  "Vision",
  "Life Insurance",
  "Disability",
  "Retirement",
  "Employer Match",
  "PTO Cost",
  "Wellness",
  "Education Benefits",
  "Equipment",
  "Software",
  "Travel",
  "Total Workforce Cost",
  "Hiring Capacity",
  "Benefits Forecast",
].map((name, i) =>
  mk(`ben.${i}`, name, {
    module: "Employee Benefits",
    futureNavGroup: "payroll_people",
    targetRelease: "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["requires_backend", "requires_legal_review", "sensitive_data"],
    securityRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 11. Compensation Intelligence
// ---------------------------------------------------------------------------
const COMPENSATION: FeatureRecord[] = [
  { n: "Compensation Plans", r: "/compensation/plans" },
  { n: "Participants", r: "/compensation/participants" },
  { n: "Attribution", r: "/compensation/attribution" },
  { n: "Evidence", r: "/compensation/attribution/evidence" },
  { n: "Eligibility", r: "/compensation/eligibility" },
  { n: "Conflicts", r: "/compensation/attribution/conflicts" },
  { n: "Calculations", r: "/compensation/calculations" },
  { n: "Verification", r: "/compensation/verification" },
  { n: "Compensation Approvals", r: "/compensation/approvals" },
  { n: "Reserves", r: "/compensation/reserves" },
  { n: "Payables", r: "/compensation/payables" },
  { n: "Payment Batches", r: "/compensation/payment-batches" },
  { n: "Statements", r: "/compensation/statements" },
  { n: "Holdbacks", r: "/compensation/holdbacks" },
  { n: "Adjustments", r: "/compensation/adjustments" },
  { n: "Reversals" },
  { n: "Clawbacks", r: "/compensation/clawbacks" },
  { n: "Disputes", r: "/compensation/disputes" },
  { n: "Compensation Reconciliation", r: "/compensation/reconciliation" },
  { n: "Accounting Preview" },
  { n: "Compensation Simulator", r: "/compensation/preview" },
].map((x, i) =>
  mk(`cmp.${i}`, x.n, {
    module: "Compensation Intelligence",
    futureNavGroup: "compensation_participation",
    targetRelease: "v1",
    priority: "P0",
    status: "mock_ui_complete",
    existingRoute: x.r,
    existingNavGroup: "Compensation",
    placement: x.r ? "sidebar" : "child_only",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_legal_review",
      "requires_accountant_review",
      "high_financial_risk",
    ],
    legalRisk: "high",
    accountingRisk: "high",
    financialImpact: "critical",
    permissions: ["compensation.view"],
  }),
);

// ---------------------------------------------------------------------------
// 12. Commission Types
// ---------------------------------------------------------------------------
const COMMISSION_TYPES: FeatureRecord[] = [
  "Sales Commission",
  "Tara Brand Ambassador Participation",
  "Referral Commission",
  "Strategic Partner Revenue Share",
  "Affiliate Commission",
  "Channel Partner Revenue Share",
  "Software Revenue Participation",
  "Recurring Commission",
  "Residual Commission",
  "Renewal Commission",
  "Expansion Commission",
  "Upsell Commission",
  "Cross-Sell Commission",
  "Milestone Bonus",
  "Team Bonus",
  "Leadership Bonus",
  "Spot Bonus",
  "Contest Bonus",
  "SPIFF",
  "House Account",
  "Manager Override",
  "Draw Against Commission",
  "Recoverable Draw",
  "Accelerator",
  "Decelerator",
].map((name, i) =>
  mk(`cmt.${i}`, name, {
    module: "Commission Types",
    futureNavGroup: "compensation_participation",
    targetRelease: "v1",
    priority: "P0",
    status: "designed",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_legal_review",
      "requires_accountant_review",
    ],
    legalRisk: "high",
    accountingRisk: "high",
    permissions: ["compensation.view"],
  }),
);

// ---------------------------------------------------------------------------
// 13. Profit Sharing & Ownership Participation
// ---------------------------------------------------------------------------
const PROFIT_SHARING: FeatureRecord[] = [
  "Profit-Sharing Plans",
  "Profit-Sharing Pools",
  "Net Income Basis",
  "Contribution Profit Basis",
  "Thresholds",
  "Reserve Requirements",
  "Distribution Approval",
  "Profit-Sharing Statements",
  "Owner Distributions",
  "Investor Distributions",
  "Strategic Partner Distributions",
  "Affiliate Payments",
  "Capital Accounts",
  "Preferred Returns",
  "Revenue Share",
  "Phantom Equity",
  "Equity Milestones",
  "Vesting",
  "Repurchase Terms",
  "Ownership Tracking",
  "Distribution Forecast",
  "Distribution Reconciliation",
].map((name, i) =>
  mk(`ps.${i}`, name, {
    module: "Profit Sharing & Ownership Participation",
    futureNavGroup: "owner_entity",
    targetRelease: "v1",
    priority: "P0",
    status: "planned",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_legal_review",
      "requires_accountant_review",
      "requires_tax_review",
      "requires_owner_approval",
      "sensitive_data",
      "high_financial_risk",
    ],
    legalRisk: "high",
    accountingRisk: "high",
    taxRisk: "high",
    securityRisk: "medium",
    financialImpact: "critical",
  }),
);

// ---------------------------------------------------------------------------
// 14. Owner Finance
// ---------------------------------------------------------------------------
const OWNER_FINANCE: FeatureRecord[] = [
  "Owner Draws",
  "Owner Distributions",
  "Owner Contributions",
  "Owner Reimbursements",
  "Company Expense Paid Personally",
  "Personal Expense Paid by Company",
  "Due to Owner",
  "Due from Owner",
  "Shareholder Loan",
  "Loan to Owner",
  "Loan from Owner",
  "Mixed-Use Expense",
  "Mortgage Review",
  "Utility Review",
  "Personal Vehicle Review",
  "Business-Use Percentage",
  "Owner Transaction Review Queue",
  "Accountant Review",
  "Owner Transaction Guardian",
].map((name, i) =>
  mk(`own.${i}`, name, {
    module: "Owner Finance",
    futureNavGroup: "owner_entity",
    targetRelease: "v1",
    priority: "P0",
    status: "planned",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "requires_tax_review",
      "requires_owner_approval",
      "sensitive_data",
      "high_financial_risk",
    ],
    legalRisk: "medium",
    accountingRisk: "high",
    taxRisk: "high",
    securityRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 15. Investors, Strategic Partners & Affiliates
// ---------------------------------------------------------------------------
const INVESTORS: FeatureRecord[] = [
  "Investor Records",
  "Investment Type",
  "Ownership Percentage",
  "Capital Contributions",
  "Return of Capital",
  "Preferred Return",
  "Investor Distributions",
  "Voting Rights",
  "Profit Participation",
  "Strategic Partner Agreements",
  "Affiliate Agreements",
  "Referral Agreements",
  "Revenue Attribution",
  "Payment Triggers",
  "Agreement Expiration",
  "Performance Requirements",
  "Investor Reporting",
  "Legal Review",
  "Tax Review",
].map((name, i) =>
  mk(`inv2.${i}`, name, {
    module: "Investors, Strategic Partners & Affiliates",
    futureNavGroup: "owner_entity",
    targetRelease: name === "Investor Records" || name === "Investor Distributions" ? "v1" : "v1.5",
    priority: "P1",
    status: "planned",
    flags: [
      "requires_backend",
      "requires_legal_review",
      "requires_accountant_review",
      "requires_tax_review",
      "sensitive_data",
      "high_financial_risk",
    ],
    legalRisk: "high",
    accountingRisk: "high",
    taxRisk: "high",
  }),
);

// ---------------------------------------------------------------------------
// 16. Check Writing & Disbursements
// ---------------------------------------------------------------------------
const CHECKS: FeatureRecord[] = [
  "Check Writer",
  "Check Register",
  "Voucher Checks",
  "Three-Per-Page Checks",
  "Single Checks",
  "Blank Check Stock",
  "Preprinted Check Stock",
  "Top/Middle/Bottom Check",
  "Custom Check Templates",
  "Check Alignment Test",
  "Check Stub Customization",
  "Signature Rules",
  "Dual Signature",
  "Payee",
  "Memo",
  "Payment Reason",
  "GL Mapping",
  "Approval",
  "Print Queue",
  "Printed",
  "Released",
  "Cleared",
  "Voided",
  "Stop Payment",
  "Reissued",
  "Outstanding Check",
  "Stale Check",
  "Check Reconciliation",
  "Duplicate Check Detection",
  "Duplicate Payee/Amount Alert",
  "Bank Guardrail Check",
].map((name, i) =>
  mk(`chk.${i}`, name, {
    module: "Check Writing & Disbursements",
    futureNavGroup: "banking_cash",
    targetRelease: "v1",
    priority: "P0",
    status: "planned",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_owner_approval",
      "high_financial_risk",
      "sensitive_data",
    ],
    financialImpact: "high",
    securityRisk: "medium",
    accountingRisk: "high",
  }),
);

// ---------------------------------------------------------------------------
// 17. Disbursement Classes
// ---------------------------------------------------------------------------
const DISBURSEMENTS: FeatureRecord[] = [
  "Vendor Payment",
  "Employee Reimbursement",
  "Payroll Payment",
  "Commission Payment",
  "Bonus Payment",
  "Profit-Sharing Payment",
  "Owner Draw",
  "Owner Distribution",
  "Investor Distribution",
  "Strategic Partner Payment",
  "Affiliate Payment",
  "Contractor Payment",
  "Charitable Contribution",
  "Marketing Sponsorship",
  "Pass-Through Disbursement",
  "Client Refund",
  "Government Fee",
  "Qualifier Payment",
  "Intercompany Transfer",
  "Loan Payment",
].map((name, i) =>
  mk(`dsb.${i}`, name, {
    module: "Disbursement Classes",
    futureNavGroup: "banking_cash",
    targetRelease: "v1",
    priority: "P0",
    status: "planned",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "requires_tax_review",
    ],
    accountingRisk: "high",
    taxRisk: "high",
    legalRisk: "medium",
    description: `Legally and financially distinct disbursement class: ${name}.`,
  }),
);

// ---------------------------------------------------------------------------
// 18. Legal, Tax & Professional Services
// ---------------------------------------------------------------------------
const LEGAL_TAX: FeatureRecord[] = [
  "Legal Bills",
  "Legal Matters",
  "Legal Retainers",
  "Matter Numbers",
  "Privileged Documents",
  "Attorneys",
  "Accountants",
  "Consultants",
  "Tax Advisors",
  "Federal Taxes",
  "State Taxes",
  "Payroll Taxes",
  "Sales Tax",
  "Use Tax",
  "Franchise Tax",
  "Estimated Taxes",
  "Property Taxes",
  "International Tax",
  "Tax Deposits",
  "Tax Reserves",
  "Tax Notices",
  "Tax Deadlines",
  "Tax Penalties",
  "Tax Interest",
  "Tax Opportunity Radar",
  "Potential Deductions",
  "Potential Credits",
  "Capitalization Review",
  "Accountant Review",
  "Legal Review",
].map((name, i) =>
  mk(`ltx.${i}`, name, {
    module: "Legal, Tax & Professional Services",
    futureNavGroup: "legal_tax_community",
    targetRelease: name === "Tax Opportunity Radar" ? "v1.5" : "v1",
    priority: "P1",
    status: "planned",
    flags: ["requires_backend", "requires_legal_review", "requires_tax_review", "sensitive_data"],
    legalRisk: "high",
    taxRisk: "high",
    securityRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 19. Charity, Nonprofit & Community
// ---------------------------------------------------------------------------
const CHARITY: FeatureRecord[] = [
  "Donations",
  "Sponsorships",
  "In-Kind Contributions",
  "Volunteer Events",
  "Scholarships",
  "Charitable Partnerships",
  "Community Events",
  "Matching Gifts",
  "Nonprofit Verification",
  "Tax-Exempt Verification",
  "Community Impact",
  "Marketing Benefit",
  "Charity vs Sponsorship Classification",
].map((name, i) =>
  mk(`chr.${i}`, name, {
    module: "Charity, Nonprofit & Community",
    futureNavGroup: "legal_tax_community",
    targetRelease: "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["requires_backend", "requires_tax_review", "requires_accountant_review"],
    taxRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 20. Giveaways, Contests & Promotions
// ---------------------------------------------------------------------------
const GIVEAWAYS: FeatureRecord[] = [
  "Promotional Giveaways",
  "Employee Contests",
  "Customer Incentives",
  "Referral Rewards",
  "Sweepstakes",
  "Gifts",
  "Gift Cards",
  "Prizes",
  "Winners",
  "Tax Document Review",
  "Rules",
  "Eligibility",
  "Marketing ROI",
  "Legal Review",
].map((name, i) =>
  mk(`gwy.${i}`, name, {
    module: "Giveaways, Contests & Promotions",
    futureNavGroup: "legal_tax_community",
    targetRelease: "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["requires_backend", "requires_legal_review", "requires_tax_review"],
    legalRisk: "medium",
    taxRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 21. Multi-Entity Accounting
// ---------------------------------------------------------------------------
const MULTI_ENTITY: FeatureRecord[] = [
  "Parent Company",
  "Sister Companies",
  "Subsidiaries",
  "Divisions",
  "Joint Ventures",
  "Entity-Specific Books",
  "Entity-Specific Chart of Accounts",
  "Entity Bank Accounts",
  "Intercompany Invoices",
  "Intercompany Loans",
  "Shared Expenses",
  "Shared Employees",
  "Shared Software",
  "Management Fees",
  "Due To/From",
  "Consolidated Reporting",
  "Eliminations",
  "Intercompany Reconciliation",
  "Entity Profitability",
  "Entity Cash Position",
].map((name, i) =>
  mk(`ent.${i}`, name, {
    module: "Multi-Entity Accounting",
    futureNavGroup: "owner_entity",
    targetRelease: "v1",
    priority: "P0",
    status: "planned",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_accountant_review",
      "requires_tax_review",
      "requires_legal_review",
    ],
    accountingRisk: "high",
    taxRisk: "high",
    legalRisk: "high",
    notes:
      "Multi-Entity Foundation is Version 1 production-critical; downstream features layered on V1.5+.",
  }),
);

// ---------------------------------------------------------------------------
// 22. International Staff & Consultants
// ---------------------------------------------------------------------------
const INTERNATIONAL: FeatureRecord[] = [
  "Country",
  "Currency",
  "Employment Type",
  "Contractor Type",
  "International Payroll",
  "International Contractor Payments",
  "Exchange Rates",
  "FX Gains/Losses",
  "Local Benefits",
  "Tax Withholding",
  "Work Authorization",
  "Country Documents",
  "Local-Currency Budgets",
  "Payment Fees",
  "Entity Responsibility",
  "Global Workforce Cost",
].map((name, i) =>
  mk(`intl.${i}`, name, {
    module: "International Staff & Consultants",
    futureNavGroup: "payroll_people",
    targetRelease: name === "Global Workforce Cost" ? "v2" : "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["requires_backend", "requires_legal_review", "requires_tax_review", "sensitive_data"],
    legalRisk: "high",
    taxRisk: "high",
    securityRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 23. Procurement, Vendors & Assets
// ---------------------------------------------------------------------------
const PROCUREMENT: FeatureRecord[] = [
  "Purchase Requests",
  "Quote Comparison",
  "Vendor Selection",
  "Purchase Orders",
  "Receiving",
  "Three-Way Match",
  "Vendor Contracts",
  "Approved Vendors",
  "W-9",
  "Insurance Documents",
  "Vendor Risk",
  "Vendor Performance",
  "Price Changes",
  "Equipment",
  "Computers",
  "Phones",
  "Vehicles",
  "Furniture",
  "Fixed Assets",
  "Depreciation",
  "Assignment",
  "Warranty",
  "Disposal",
  "Gain/Loss",
  "Insurance Tracking",
].map((name, i) =>
  mk(`prc.${i}`, name, {
    module: "Procurement, Vendors & Assets",
    futureNavGroup: "assets_procurement",
    targetRelease: "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["requires_backend"],
    accountingRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 24. Research, Consulting & Innovation
// ---------------------------------------------------------------------------
const RESEARCH: FeatureRecord[] = [
  "Consultants",
  "Regulatory Research",
  "Product Research",
  "Market Research",
  "App Development",
  "AI Experimentation",
  "Proof of Concept",
  "Pilot Programs",
  "Data Purchases",
  "Advisory Services",
  "Research Budget",
  "Deliverables",
  "Outcomes",
  "Revenue Supported",
  "Time Saved",
  "Risk Reduced",
  "IP Created",
  "Capitalization Review",
].map((name, i) =>
  mk(`res.${i}`, name, {
    module: "Research, Consulting & Innovation",
    futureNavGroup: "profitability_intelligence",
    targetRelease: "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["requires_backend", "requires_accountant_review"],
    accountingRisk: "medium",
  }),
);

// ---------------------------------------------------------------------------
// 25. Technology & AI Economics
// ---------------------------------------------------------------------------
const TECH: FeatureRecord[] = [
  "Tech Spend",
  "AI Spend",
  "Hosting Spend",
  "Automation Spend",
  "Development Spend",
  "Cost per Employee",
  "Cost per Active User",
  "Cost per Client",
  "Cost per Service",
  "Revenue Supported",
  "Revenue Generated",
  "Labor Saved",
  "Errors Reduced",
  "Risk Reduced",
  "Seat Utilization",
  "Duplicate Tools",
  "Renewal Risk",
  "Cancellation Recommendations",
  "Build-to-Value Score",
  "App Profitability",
].map((name, i) =>
  mk(`tec.${i}`, name, {
    module: "Technology & AI Economics",
    futureNavGroup: "profitability_intelligence",
    targetRelease: "v1.5",
    priority: "P2",
    status: "mock_ui_complete",
    existingRoute: "/intelligence/tech",
    flags: ["ai_advisory_only"],
  }),
);

// ---------------------------------------------------------------------------
// 26. Marketing ROI
// ---------------------------------------------------------------------------
const MARKETING: FeatureRecord[] = [
  "Marketing Spend",
  "Leads",
  "Qualified Leads",
  "Consultations",
  "Deals",
  "Collected Revenue",
  "Gross Profit",
  "Contribution Profit",
  "Cost per Lead",
  "Cost per Acquisition",
  "ROAS",
  "Revenue ROI",
  "Gross Profit ROI",
  "Contribution Profit ROI",
  "Refunds",
  "Chargebacks",
  "Payback Period",
  "Campaign Economics",
  "Channel Economics",
  "Creative Economics",
  "Client Quality",
  "Marketing Recommendations",
].map((name, i) =>
  mk(`mkt.${i}`, name, {
    module: "Marketing ROI",
    futureNavGroup: "profitability_intelligence",
    targetRelease: "v1.5",
    priority: "P2",
    status: "mock_ui_complete",
    existingRoute: "/intelligence/marketing",
    flags: ["ai_advisory_only"],
  }),
);

// ---------------------------------------------------------------------------
// 27. Profitability
// ---------------------------------------------------------------------------
const PROFITABILITY: FeatureRecord[] = [
  "Company Profit",
  "Gross Profit",
  "Operating Profit",
  "Net Income",
  "Retained Earnings",
  "Client Profitability",
  "Service Profitability",
  "Department Profitability",
  "Employee Cost",
  "Salesperson Profitability",
  "State Profitability",
  "Product Profitability",
  "App Profitability",
  "Campaign Profitability",
  "Lead-Source Profitability",
  "Project Profitability",
  "Qualifier Placement Profitability",
  "Contract Economics",
].map((name, i) =>
  mk(`pft.${i}`, name, {
    module: "Profitability",
    futureNavGroup: "profitability_intelligence",
    targetRelease: "v1.5",
    priority: "P1",
    status: "mock_ui_complete",
    existingRoute: "/intelligence/profitability",
    flags: ["ai_advisory_only"],
  }),
);

// ---------------------------------------------------------------------------
// 28. Forecasting & Digital Twin
// ---------------------------------------------------------------------------
const FORECASTING: FeatureRecord[] = [
  { n: "Cash Forecast", r: "v1.5" as ReleaseBucket },
  { n: "Revenue Forecast", r: "v1.5" as ReleaseBucket },
  { n: "Collection Forecast" },
  { n: "Expense Forecast" },
  { n: "Overhead Forecast" },
  { n: "Payroll Forecast" },
  { n: "Bonus Forecast" },
  { n: "Commission Forecast" },
  { n: "Tax Forecast" },
  { n: "Pass-Through Forecast" },
  { n: "Available Cash Forecast" },
  { n: "Runway" },
  { n: "Hiring Capacity" },
  { n: "Expansion Readiness" },
  { n: "Acquisition Readiness", r: "v2" as ReleaseBucket },
  { n: "Investor Return Forecast", r: "v2" as ReleaseBucket },
  { n: "Best Case" },
  { n: "Base Case" },
  { n: "Conservative Case" },
  { n: "Revenue Decline" },
  { n: "Major Client Loss" },
  { n: "New Hire" },
  { n: "New Product" },
  { n: "Marketing Increase" },
  { n: "Technology Reduction" },
  { n: "Financial Digital Twin", r: "v2" as ReleaseBucket },
].map((x, i) =>
  mk(`fct.${i}`, x.n, {
    module: "Forecasting & Digital Twin",
    futureNavGroup: "profitability_intelligence",
    targetRelease: x.r ?? "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["ai_advisory_only"],
  }),
);

// ---------------------------------------------------------------------------
// 29. Financial Intelligence & AI
// ---------------------------------------------------------------------------
const AI_FEATURES: FeatureRecord[] = [
  { n: "Ask LedgerOS", r: "v2" as ReleaseBucket },
  { n: "AI CFO", r: "v2" as ReleaseBucket },
  { n: "AI Controller", r: "v2" as ReleaseBucket },
  { n: "AI Cost Optimizer", r: "v1.5" as ReleaseBucket },
  { n: "AI Opportunity Engine", r: "v1.5" as ReleaseBucket },
  { n: "AI Risk Radar", r: "v2" as ReleaseBucket },
  { n: "AI Billing Architect", r: "v1.5" as ReleaseBucket },
  { n: "AI Invoice Generator", r: "v1.5" as ReleaseBucket },
  { n: "AI Collections" },
  { n: "AI Expense Review" },
  { n: "AI Tax Opportunity Radar", r: "v1.5" as ReleaseBucket },
  { n: "AI Owner Transaction Guardian" },
  { n: "AI Meeting Brief" },
  { n: "Automated Close Narrative" },
  { n: "Evidence Panel" },
  { n: "Confidence" },
  { n: "Data Freshness" },
  { n: "Assumptions" },
  { n: "Human Approval" },
  { n: "AI Audit" },
  { n: "AI Policy Controls" },
].map((x, i) =>
  mk(`ai.${i}`, x.n, {
    module: "Financial Intelligence & AI",
    futureNavGroup: "profitability_intelligence",
    targetRelease: x.r ?? "v1.5",
    priority: "P2",
    status: "planned",
    flags: ["ai_advisory_only", "draft_only_action"],
  }),
);

// ---------------------------------------------------------------------------
// 30. Financial Relationship & Timeline
// ---------------------------------------------------------------------------
const RELATIONSHIP: FeatureRecord[] = [
  "Financial Relationship Graph",
  "Financial Timeline",
  "Source Record Trace",
  "Customer-to-Profit Trace",
  "Invoice-to-Cash Trace",
  "Payment-to-Commission Trace",
  "Expense-to-Revenue Trace",
  "Campaign-to-Profit Trace",
  "Event-to-Revenue Trace",
  "Owner Distribution Impact",
  "Investor Return Impact",
  "Related Records",
  "Audit Trail",
  "Chronological History",
].map((name, i) =>
  mk(`rel.${i}`, name, {
    module: "Financial Relationship & Timeline",
    futureNavGroup: "profitability_intelligence",
    targetRelease: "v2",
    priority: "P2",
    status: "planned",
    flags: ["ai_advisory_only"],
  }),
);

// ---------------------------------------------------------------------------
// 31. Automation & Controls
// ---------------------------------------------------------------------------
const AUTOMATION_FEATURES: FeatureRecord[] = [
  { n: "No-Code Rules", r: "/automation/rules" },
  { n: "Trigger" },
  { n: "Condition" },
  { n: "Action" },
  { n: "Approval" },
  { n: "Exception Queue", r: "/automation/exceptions" },
  { n: "Unified Approval Center", r: "/automation/approvals" },
  { n: "Cash Guardrails", r: "/automation/cash-controls" },
  { n: "Budget Controls", r: "/automation/budget-controls" },
  { n: "Subscription Actions", r: "/automation/subscription-actions" },
  { n: "Revenue Recovery", r: "/automation/revenue-recovery" },
  { n: "Bonus Controls", r: "/automation/bonus-controls" },
  { n: "Data Quality", r: "/automation/data-quality" },
  { n: "Integration Health", r: "/automation/integration-health" },
  { n: "Action Plans", r: "/automation/action-plans" },
  { n: "Decision Log", r: "/automation/decision-log" },
  { n: "Escalations" },
  { n: "Scheduled Jobs" },
  { n: "Draft-Only Automation" },
  { n: "Human Approval" },
].map((x, i) =>
  mk(`aut.${i}`, x.n, {
    module: "Automation & Controls",
    futureNavGroup: "automation",
    targetRelease: "v1",
    priority: "P1",
    status: x.r ? "mock_ui_complete" : "planned",
    existingRoute: x.r,
    placement: x.r ? "sidebar" : "child_only",
    flags: ["requires_backend", "draft_only_action"],
  }),
);

// ---------------------------------------------------------------------------
// 32. Integrations
// ---------------------------------------------------------------------------
const INTEGRATIONS_FEATURES: FeatureRecord[] = [
  { n: "Zoho CRM", r: "v1" },
  { n: "Zoho Forms", r: "v1" },
  { n: "Zoho Books Migration", r: "v1" },
  { n: "Zoho Billing", r: "v1.5" },
  { n: "Navy Federal", r: "v1" },
  { n: "ADP", r: "v1" },
  { n: "Command Center", r: "v1" },
  { n: "Client Portal", r: "v1.5" },
  { n: "Business Services Hub", r: "v1.5" },
  { n: "QualifierConnect", r: "v1" },
  { n: "ComplianceConnect", r: "v1.5" },
  { n: "Sales Intelligence OS", r: "v1.5" },
  { n: "Guided Sales", r: "v1.5" },
  { n: "Tara OS", r: "v1" },
  { n: "Marketing Platforms", r: "v1.5" },
  { n: "Replit", r: "future" },
  { n: "Lovable", r: "future" },
  { n: "Vercel", r: "future" },
  { n: "GitHub", r: "future" },
  { n: "OpenAI", r: "v1.5" },
  { n: "Other AI Providers", r: "v1.5" },
  { n: "Email", r: "v1" },
  { n: "Document Systems", r: "v1.5" },
].map((x, i) =>
  mk(`int.${i}`, x.n, {
    module: "Integrations",
    futureNavGroup: "integrations",
    targetRelease: x.r as ReleaseBucket,
    priority: x.r === "v1" ? "P0" : "P1",
    status: "blocked_integration",
    flags: [
      "requires_backend",
      "requires_integration",
      "requires_security_review",
      "sensitive_data",
    ],
    securityRisk: "high",
  }),
);

// ---------------------------------------------------------------------------
// 33. Admin & Users
// ---------------------------------------------------------------------------
const ADMIN: FeatureRecord[] = [
  "Users",
  "Invitations",
  "Activation",
  "Deactivation",
  "Suspension",
  "Lock",
  "Password Reset",
  "Sessions",
  "Session Revocation",
  "Roles",
  "Permissions",
  "Custom Roles",
  "Departments",
  "Managers",
  "Approval Limits",
  "Entity Access",
  "Sensitive Access",
  "Feature Access",
  "MFA",
  "Security Events",
  "Login History",
  "Service Accounts",
  "Integration Credentials",
  "Audit Review",
].map((name, i) =>
  mk(`adm.${i}`, name, {
    module: "Admin & Users",
    futureNavGroup: "admin",
    targetRelease: "v1",
    priority: "P0",
    status: "mock_ui_complete",
    existingRoute: name === "Users" ? "/admin/users" : undefined,
    placement: name === "Users" ? "sidebar" : "child_only",
    flags: [
      "production_critical",
      "requires_backend",
      "requires_security_review",
      "sensitive_data",
    ],
    securityRisk: "high",
    permissions: ["admin.view"],
  }),
);

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const FEATURE_REGISTRY: FeatureRecord[] = [
  ...CORE_ACCOUNTING,
  ...BANKING_CASH,
  ...REVENUE_ALLOCATION,
  ...INVOICING,
  ...MARKUP,
  ...EXPENSES,
  ...TRAVEL_EVENTS,
  ...APPRECIATION,
  ...PAYROLL,
  ...BENEFITS,
  ...COMPENSATION,
  ...COMMISSION_TYPES,
  ...PROFIT_SHARING,
  ...OWNER_FINANCE,
  ...INVESTORS,
  ...CHECKS,
  ...DISBURSEMENTS,
  ...LEGAL_TAX,
  ...CHARITY,
  ...GIVEAWAYS,
  ...MULTI_ENTITY,
  ...INTERNATIONAL,
  ...PROCUREMENT,
  ...RESEARCH,
  ...TECH,
  ...MARKETING,
  ...PROFITABILITY,
  ...FORECASTING,
  ...AI_FEATURES,
  ...RELATIONSHIP,
  ...AUTOMATION_FEATURES,
  ...INTEGRATIONS_FEATURES,
  ...ADMIN,
];

// ---------------------------------------------------------------------------
// Future navigation map (planning artifact only — not the live sidebar)
// ---------------------------------------------------------------------------

export interface FutureNavGroupSpec {
  id: NavGroupId;
  title: string;
  description: string;
  modules: string[];
}

export const FUTURE_NAV_MAP: FutureNavGroupSpec[] = [
  {
    id: "overview",
    title: "Overview",
    description: "Dashboard, health, alerts.",
    modules: ["Overview"],
  },
  {
    id: "accounting",
    title: "Accounting",
    description: "Ledger, close, allocation, reporting.",
    modules: ["Core Accounting", "Revenue Allocation"],
  },
  {
    id: "banking_cash",
    title: "Banking & Cash",
    description: "Bank feeds, cash forecast, reserves, checks.",
    modules: ["Banking & Cash", "Check Writing & Disbursements", "Disbursement Classes"],
  },
  {
    id: "sales_billing",
    title: "Sales & Billing",
    description: "Customers, estimates, invoices, receivables.",
    modules: ["Invoicing & Receivables"],
  },
  {
    id: "purchases_spend",
    title: "Purchases & Spend",
    description: "Bills, expenses, subscriptions.",
    modules: ["Expenses & Reimbursements"],
  },
  {
    id: "compensation_participation",
    title: "Compensation & Participation",
    description: "Plans, calculations, statements, commission types.",
    modules: ["Compensation Intelligence", "Commission Types"],
  },
  {
    id: "payroll_people",
    title: "Payroll & People",
    description: "Payroll, benefits, appreciation, international staff.",
    modules: [
      "Payroll & Workforce",
      "Employee Benefits",
      "Employee Appreciation & Culture",
      "International Staff & Consultants",
    ],
  },
  {
    id: "travel_events",
    title: "Travel & Events",
    description: "Travel, conventions, education.",
    modules: ["Travel, Events & Development"],
  },
  {
    id: "profitability_intelligence",
    title: "Profitability & Intelligence",
    description: "Markup, marketing, forecasting, AI, relationship graph.",
    modules: [
      "Markup & Micro-Margin",
      "Marketing ROI",
      "Profitability",
      "Forecasting & Digital Twin",
      "Financial Intelligence & AI",
      "Financial Relationship & Timeline",
      "Technology & AI Economics",
      "Research, Consulting & Innovation",
    ],
  },
  {
    id: "owner_entity",
    title: "Owner & Entity",
    description: "Owners, investors, multi-entity, profit sharing.",
    modules: [
      "Owner Finance",
      "Investors, Strategic Partners & Affiliates",
      "Multi-Entity Accounting",
      "Profit Sharing & Ownership Participation",
    ],
  },
  {
    id: "legal_tax_community",
    title: "Legal, Tax & Community",
    description: "Legal, tax, charity, giveaways.",
    modules: [
      "Legal, Tax & Professional Services",
      "Charity, Nonprofit & Community",
      "Giveaways, Contests & Promotions",
    ],
  },
  {
    id: "assets_procurement",
    title: "Assets & Procurement",
    description: "Purchasing, fixed assets, vendors.",
    modules: ["Procurement, Vendors & Assets"],
  },
  {
    id: "automation",
    title: "Automation",
    description: "Rules, approvals, guardrails.",
    modules: ["Automation & Controls"],
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "External systems.",
    modules: ["Integrations"],
  },
  {
    id: "admin",
    title: "Admin",
    description: "Users, roles, security, audit.",
    modules: ["Admin & Users"],
  },
];

// ---------------------------------------------------------------------------
// Convenience selectors
// ---------------------------------------------------------------------------

export const STATUS_LABELS: Record<FeatureStatus, string> = {
  built: "Built",
  designed: "Designed",
  typed_api_ready: "Typed/API Ready",
  mock_ui_complete: "Mock UI Complete",
  planned: "Planned",
  blocked_policy: "Blocked · Policy",
  blocked_legal: "Blocked · Legal",
  blocked_accounting: "Blocked · Accounting",
  blocked_integration: "Blocked · Integration",
  blocked_backend: "Blocked · Backend",
  in_production_build: "In Production Build",
  ready_for_testing: "Ready for Testing",
  ready_for_parallel_run: "Ready for Parallel Run",
  ready_for_cutover: "Ready for Cutover",
  post_launch: "Post-Launch",
};

export const FLAG_LABELS: Record<FeatureFlag, string> = {
  requires_backend: "Requires Backend",
  requires_database: "Requires Database",
  requires_api: "Requires API",
  requires_integration: "Requires Integration",
  requires_legal_review: "Requires Legal Review",
  requires_accountant_review: "Requires Accountant Review",
  requires_tax_review: "Requires Tax Review",
  requires_security_review: "Requires Security Review",
  requires_data_migration: "Requires Data Migration",
  requires_owner_approval: "Requires Owner Approval",
  requires_christin_review: "Requires Christin Review",
  requires_carmen_review: "Requires Carmen Review",
  sensitive_data: "Sensitive Data",
  high_financial_risk: "High Financial Risk",
  ai_advisory_only: "AI Advisory Only",
  draft_only_action: "Draft-Only Action",
  production_critical: "Production Critical",
};

export const RELEASE_LABELS: Record<ReleaseBucket, string> = {
  v1: "Version 1 — Required Before Launch",
  "v1.5": "Version 1.5 — First 90 Days",
  v2: "Version 2 — Advanced Operations",
  v3: "Version 3 — Intelligence Expansion",
  future: "Future Research",
  post_launch: "Post-Launch",
};

export function countBy<T extends string>(
  items: FeatureRecord[],
  select: (r: FeatureRecord) => T | T[] | undefined,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of items) {
    const v = select(r);
    if (v === undefined) continue;
    const arr = Array.isArray(v) ? v : [v];
    for (const key of arr) out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

export function findFeature(id: string): FeatureRecord | undefined {
  return FEATURE_REGISTRY.find((r) => r.id === id);
}

export function isBlocked(r: FeatureRecord): boolean {
  return r.status.startsWith("blocked");
}

export function isBuiltOrMock(r: FeatureRecord): boolean {
  return ["built", "mock_ui_complete", "typed_api_ready", "designed"].includes(r.status);
}

export const REGISTRY_STATS = () => {
  const total = FEATURE_REGISTRY.length;
  const byStatus = countBy(FEATURE_REGISTRY, (r) => r.status);
  const byRelease = countBy(FEATURE_REGISTRY, (r) => r.targetRelease);
  const byFlag = countBy(FEATURE_REGISTRY, (r) => r.flags);
  return { total, byStatus, byRelease, byFlag };
};
