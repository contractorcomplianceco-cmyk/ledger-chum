import {
  LayoutDashboard,
  ArrowLeftRight,
  NotebookPen,
  Landmark,
  ShoppingBag,
  ShoppingCart,
  Users2,
  BookOpen,
  BarChart3,
  Wallet2,
  BookOpenCheck,
  Plug,
  Settings as SettingsIcon,
  ShieldCheck,
  UserCog,
  Rocket,
  CalendarClock,
  FileText,
  CreditCard,
  Building2,
  Receipt,
  ReceiptText,
  Coins,
  Split,
  ScrollText,
  Brain,
  Megaphone,
  Gift,
  PieChart,
  Gauge,
  Search,
  Lightbulb,
  Workflow,
  Bot,
  AlertTriangle,
  PhoneCall,
  Wallet,
  Sliders,
  Repeat,
  Undo2,
  Award,
  Database,
  Activity,
  Target,
  BookMarked,
  PiggyBank,
  ClipboardList,
  Compass,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type NavBadgeTone = "brand" | "violet" | "warning";

export type NavItem = {
  title: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
  badgeTone?: NavBadgeTone;
  /** Permission required to view this item. Owner ("*") always sees it. */
  permission?: string;
  /** Optional short keywords to help command-palette search. */
  keywords?: string[];
  /**
   * When true, the item is not rendered in the sidebar but is still
   * indexed for breadcrumbs, favorites, recents, and command-palette search.
   */
  hidden?: boolean;
  /** @deprecated Retained so legacy references compile. Grouping is expressed via NavGroup now. */
  hasChildren?: boolean;
  /** @deprecated "Soon" badges removed — badges must be actionable. */
  status?: "Soon";
};

export type NavGroup = {
  id: string;
  title: string;
  icon?: LucideIcon;
  /** Permission required to see the whole group. */
  permission?: string;
  /** Whether the group is open by default. Users can override via localStorage. */
  defaultOpen?: boolean;
  items: NavItem[];
};

/**
 * Grouped navigation. Route paths are NEVER renamed here — only display
 * labels, grouping, badges, and permissions. See sidebar refactor spec.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    title: "Overview",
    icon: Compass,
    defaultOpen: true,
    items: [
      { title: "Dashboard", to: "/", icon: LayoutDashboard, keywords: ["home", "kpi"] },
    ],
  },
  {
    id: "accounting",
    title: "Accounting",
    icon: BookOpen,
    defaultOpen: true,
    items: [
      { title: "Journal Entries", to: "/ledger/journals", icon: NotebookPen },
      { title: "Chart of Accounts", to: "/ledger/accounts", icon: BookOpen },
      { title: "General Ledger", to: "/ledger/general", icon: BookOpenCheck },
      { title: "Banking", to: "/banking", icon: Landmark },
      { title: "Transactions", to: "/banking/transactions", icon: ArrowLeftRight, badge: "24", badgeTone: "brand" },
      { title: "Reconciliation", to: "/banking/reconciliation", icon: BookOpenCheck },
      { title: "Cash Availability", to: "/cash-availability", icon: Coins },
      { title: "Allocations", to: "/cash-availability/allocations", icon: Split },
      { title: "Treatment Rules", to: "/cash-availability/rules", icon: ScrollText },
      { title: "Budgets", to: "/budgets", icon: Wallet2 },
      { title: "Reports", to: "/reports", icon: BarChart3, permission: "reports.view" },
      { title: "Monthly Close", to: "/close", icon: CalendarClock },
    ],
  },
  {
    id: "sales",
    title: "Sales & Receivables",
    icon: ShoppingBag,
    permission: "sales.view",
    defaultOpen: true,
    items: [
      { title: "Sales", to: "/invoices", icon: ShoppingBag, keywords: ["invoices"] },
      { title: "Estimates", to: "/estimates", icon: FileText },
      { title: "Recurring", to: "/invoices/recurring", icon: CalendarClock },
      { title: "Credit Notes", to: "/invoices/credit-notes", icon: ReceiptText },
      { title: "Customers", to: "/customers", icon: Users2 },
      { title: "Payments", to: "/payments", icon: CreditCard },
    ],
  },
  {
    id: "purchases",
    title: "Purchases & Spend",
    icon: ShoppingCart,
    permission: "purchases.view",
    defaultOpen: false,
    items: [
      { title: "Purchases", to: "/bills", icon: ShoppingCart, keywords: ["bills"] },
      { title: "Vendors", to: "/vendors", icon: Building2 },
      { title: "Expenses", to: "/expenses", icon: ReceiptText },
      { title: "Receipts", to: "/expenses/receipts", icon: Receipt },
      { title: "Approvals", to: "/expenses/approvals", icon: ShieldCheck },
      { title: "Subscriptions", to: "/expenses/subscriptions", icon: CalendarClock },
      { title: "Vendor Spend", to: "/expenses/vendors", icon: Building2 },
      { title: "Payroll", to: "/payroll", icon: Users2 },
    ],
  },
  {
    id: "compensation",
    title: "Compensation",
    icon: Award,
    permission: "compensation.view",
    defaultOpen: false,
    items: [
      { title: "Overview", to: "/compensation", icon: Gauge },
      { title: "Plans", to: "/compensation/plans", icon: ScrollText },
      { title: "Participants", to: "/compensation/participants", icon: Users2 },
      { title: "Attribution", to: "/compensation/attribution", icon: Split },
      { title: "Conflicts", to: "/compensation/attribution/conflicts", icon: AlertTriangle },
      { title: "Evidence", to: "/compensation/attribution/evidence", icon: BookMarked },
      { title: "Eligibility", to: "/compensation/eligibility", icon: ShieldCheck },
      { title: "Preview", to: "/compensation/preview", icon: Gauge },
      { title: "Calculations", to: "/compensation/calculations", icon: Coins },
      { title: "Verification", to: "/compensation/verification", icon: ShieldCheck },
      { title: "Compensation Approvals", to: "/compensation/approvals", icon: ShieldCheck },
      { title: "Reserves", to: "/compensation/reserves", icon: Wallet2 },
      { title: "Payables", to: "/compensation/payables", icon: Wallet },
      { title: "Payment Batches", to: "/compensation/payment-batches", icon: Repeat },
      { title: "Statements", to: "/compensation/statements", icon: ScrollText },
      { title: "Holdbacks", to: "/compensation/holdbacks", icon: PiggyBank },
      { title: "Adjustments", to: "/compensation/adjustments", icon: Sliders },
      { title: "Clawbacks", to: "/compensation/clawbacks", icon: Undo2 },
      { title: "Disputes", to: "/compensation/disputes", icon: AlertTriangle },
      { title: "Reconciliation", to: "/compensation/reconciliation", icon: BookOpenCheck },
      { title: "Audit", to: "/compensation/audit", icon: BookMarked },
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence",
    icon: Brain,
    permission: "intelligence.view",
    defaultOpen: false,
    items: [
      { title: "Financial Intelligence", to: "/intelligence", icon: Brain, badge: "New", badgeTone: "violet" },
      { title: "Marketing ROI", to: "/intelligence/marketing", icon: Megaphone },
      { title: "Bonus Center", to: "/intelligence/bonuses", icon: Gift },
      { title: "Profitability", to: "/intelligence/profitability", icon: PieChart },
      { title: "Forecasting", to: "/intelligence/forecasting", icon: Gauge },
      { title: "Revenue Leakage", to: "/intelligence/leakage", icon: Search },
      { title: "Recommendations", to: "/intelligence/recommendations", icon: Lightbulb },
    ],
  },
  {
    id: "work-queues",
    title: "Work Queues",
    icon: ClipboardList,
    defaultOpen: false,
    items: [
      { title: "Company Approvals", to: "/automation/approvals", icon: ShieldCheck },
      { title: "Exceptions", to: "/automation/exceptions", icon: AlertTriangle },
      { title: "Collections", to: "/automation/collections", icon: PhoneCall },
      { title: "Payables", to: "/automation/payables", icon: Wallet },
      { title: "Revenue Recovery", to: "/automation/revenue-recovery", icon: Undo2 },
      { title: "Data Quality", to: "/automation/data-quality", icon: Database },
      { title: "Integration Health", to: "/automation/integration-health", icon: Activity },
      { title: "Action Plans", to: "/automation/action-plans", icon: Target },
      { title: "Decision Log", to: "/automation/decision-log", icon: BookMarked },
    ],
  },
  {
    id: "automation",
    title: "Automation",
    icon: Workflow,
    permission: "automation.view",
    defaultOpen: false,
    items: [
      { title: "Automation Center", to: "/automation-center", icon: Workflow, badge: "New", badgeTone: "violet" },
      { title: "Rules", to: "/automation/rules", icon: Bot },
      { title: "Cash Controls", to: "/automation/cash-controls", icon: Sliders },
      { title: "Budget Controls", to: "/automation/budget-controls", icon: Wallet2 },
      { title: "Subscription Actions", to: "/automation/subscription-actions", icon: Repeat },
      { title: "Bonus Controls", to: "/automation/bonus-controls", icon: Award },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    icon: Briefcase,
    permission: "admin.view",
    defaultOpen: false,
    items: [
      { title: "Settings", to: "/settings", icon: SettingsIcon },
      { title: "Integrations", to: "/integrations", icon: Plug, badge: "3", badgeTone: "violet" },
      { title: "Users", to: "/admin/users", icon: UserCog },
      { title: "Audit Log", to: "/audit", icon: ShieldCheck },
      { title: "Migration Readiness", to: "/readiness/migration", icon: Rocket },
      { title: "Production Readiness", to: "/readiness/production", icon: ShieldCheck },
      { title: "Master Feature Registry", to: "/feature-registry", icon: ClipboardList, badge: "Planning", badgeTone: "violet", permission: "implementation.view" },
      // Implementation subsection — narrower gating than admin.view
      { title: "Implementation", to: "/implementation", icon: FileText, badge: "Phase 5", badgeTone: "violet", permission: "implementation.view" },
      { title: "API Map", to: "/implementation/api-map", icon: ScrollText, permission: "implementation.view" },
      { title: "Data Map", to: "/implementation/data-map", icon: Database, permission: "implementation.view" },
      { title: "Permissions", to: "/implementation/permissions", icon: ShieldCheck, permission: "implementation.view" },
      { title: "Integration Contracts", to: "/implementation/integrations", icon: Plug, permission: "implementation.view" },
      { title: "Events & Drafts", to: "/implementation/events", icon: Workflow, permission: "implementation.view" },
      { title: "Migration", to: "/implementation/migration", icon: Rocket, permission: "implementation.view" },
      { title: "Testing", to: "/implementation/testing", icon: BookOpenCheck, permission: "implementation.view" },
      { title: "Security", to: "/implementation/security", icon: ShieldCheck, permission: "implementation.view" },
      { title: "Cutover", to: "/implementation/cutover", icon: CalendarClock, permission: "implementation.view" },
      { title: "Readiness", to: "/implementation/readiness", icon: Gauge, permission: "implementation.view" },
      { title: "Handoff", to: "/implementation/handoff", icon: BookMarked, permission: "implementation.view" },
    ],
  },
];

/**
 * Child-only routes (accessible via deep-link from a parent workspace) that
 * should still surface in breadcrumbs and command-palette search but not in
 * the sidebar list.
 */
export const CHILD_ONLY_ROUTES: NavItem[] = [
  { title: "Customer Detail", to: "/customers/$customerId", icon: Users2, hidden: true },
  { title: "Invoice Detail", to: "/invoices/$invoiceId", icon: FileText, hidden: true },
  { title: "New Invoice", to: "/invoices/new", icon: FileText, hidden: true },
  { title: "New Estimate", to: "/estimates/new", icon: FileText, hidden: true },
  { title: "Attribution Detail", to: "/compensation/attribution/$id", icon: Split, hidden: true, permission: "compensation.view" },
  { title: "Participant Detail", to: "/compensation/participants/$id", icon: Users2, hidden: true, permission: "compensation.view" },
  { title: "Plan Detail", to: "/compensation/plans/$id", icon: ScrollText, hidden: true, permission: "compensation.view" },
  { title: "Calculation Detail", to: "/compensation/calculations/$id", icon: Coins, hidden: true, permission: "compensation.view" },
  { title: "Calculation Preview", to: "/compensation/calculations/$id/preview", icon: Gauge, hidden: true, permission: "compensation.view" },
  { title: "Payable Detail", to: "/compensation/payables/$id", icon: Wallet, hidden: true, permission: "compensation.view" },
  { title: "Payment Batch", to: "/compensation/payment-batches/$id", icon: Repeat, hidden: true, permission: "compensation.view" },
  { title: "Statement", to: "/compensation/statements/$id", icon: ScrollText, hidden: true, permission: "compensation.view" },
  { title: "Dispute Detail", to: "/compensation/disputes/$id", icon: AlertTriangle, hidden: true, permission: "compensation.view" },
];

/** Flat lookup used by breadcrumbs, favorites, and command palette. */
export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...CHILD_ONLY_ROUTES,
];

/** @deprecated Kept for backwards compatibility — prefer NAV_GROUPS. */
export const NAV_PRIMARY: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
/** @deprecated Kept for backwards compatibility — prefer NAV_GROUPS. */
export const NAV_SECONDARY: NavItem[] = [];
