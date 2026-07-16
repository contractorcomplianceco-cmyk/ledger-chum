/**
 * Guided product-tour step definitions for the LedgerOS demo.
 *
 * Each step walks the core double-entry accounting story across real routes.
 * `route` is navigated to before the step is shown; `selector` targets a stable
 * `data-tour` anchor on that page. When a selector is absent (e.g. a route that
 * renders a "coming soon" placeholder) the step falls back to a centered card,
 * so the tour never breaks even if a target is missing.
 */
export interface TourStep {
  /** Route to navigate to before showing this step. */
  route: string;
  /** CSS selector for the element to spotlight. Omit for a centered step. */
  selector?: string;
  title: string;
  description: string;
  /** Preferred popover side; driver.js auto-adjusts if it doesn't fit. Omit for centered steps. */
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: "/dashboard",
    title: "Welcome to LedgerOS",
    description:
      "A Fortune-500-grade double-entry accounting & financial operations platform. Take this quick 60-second tour of the core product story — you can skip or exit anytime.",
    align: "center",
  },
  {
    route: "/dashboard",
    selector: '[data-tour="dashboard-kpis"]',
    title: "Your financial cockpit",
    description:
      "The operational dashboard surfaces live KPIs — cash position, revenue, AR/AP and margin — so you always know where the business stands at a glance.",
    side: "bottom",
    align: "start",
  },
  {
    route: "/dashboard",
    selector: '[data-tour="nav:/ledger/accounts"]',
    title: "Chart of Accounts — the double-entry core",
    description:
      "Every transaction posts as balanced debits and credits against your chart of accounts. Assets, liabilities, equity, revenue and expenses roll up automatically into the general ledger.",
    side: "right",
    align: "center",
  },
  {
    route: "/invoices",
    selector: '[data-tour="invoices-kpis"]',
    title: "Invoices & Accounts Receivable",
    description:
      "Create and send invoices with automatic revenue, pass-through, commission and tax-reserve allocation on every line. Outstanding and overdue balances track your AR in real time.",
    side: "bottom",
    align: "start",
  },
  {
    route: "/payments",
    selector: '[data-tour="nav:/payments"]',
    title: "Payments, credits & refunds",
    description:
      "Applying a payment automatically posts the matching double-entry — debit cash, credit accounts receivable — and settles the invoice. Credits and refunds reverse cleanly with a full audit trail.",
    side: "right",
    align: "center",
  },
  {
    route: "/bills",
    selector: '[data-tour="nav:/bills"]',
    title: "Bills & Accounts Payable",
    description:
      "Vendor bills flow through approval and post to AP automatically. Pay them and LedgerOS records the offsetting cash and expense entries for you.",
    side: "right",
    align: "center",
  },
  {
    route: "/banking",
    selector: '[data-tour="banking-overview"]',
    title: "Banking & reconciliation",
    description:
      "Connect accounts, import transactions and reconcile against the ledger. Matched activity keeps your books tied out to the bank down to the cent.",
    side: "bottom",
    align: "start",
  },
  {
    route: "/reports/trial-balance",
    selector: '[data-tour="trial-balance"]',
    title: "Reporting — the payoff",
    description:
      "Because every entry is balanced, reports are instant: trial balance, general ledger, P&L, balance sheet and AR aging — all live, all auditable. Debits must equal credits, always.",
    side: "top",
    align: "center",
  },
  {
    route: "/apex/insights",
    selector: '[data-tour="apex-insights"]',
    title: "Apex intelligence layer",
    description:
      "Apex turns your ledger into foresight — surfacing anomalies, cash risks and growth opportunities so you act on what matters before it becomes a problem.",
    side: "bottom",
    align: "start",
  },
  {
    route: "/apex",
    title: "You're all set",
    description:
      "That's the core LedgerOS story. Explore freely from here — the sidebar has everything, and you can relaunch this tour anytime from the “Take the tour” button in the top bar.",
    align: "center",
  },
];

export const TOUR_SEEN_KEY = "ledgeros.tour.seen.v1";
