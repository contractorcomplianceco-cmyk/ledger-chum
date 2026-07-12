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
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
  badgeTone?: "brand" | "violet" | "warning";
  status?: "Soon";
  hasChildren?: boolean;
};

/**
 * Flat primary navigation matching the LedgerOS reference dashboard sidebar.
 * No section labels — the reference uses a single continuous list.
 */
export const NAV_PRIMARY: NavItem[] = [
  { title: "Dashboard", to: "/", icon: LayoutDashboard },
  { title: "Transactions", to: "/banking/transactions", icon: ArrowLeftRight, hasChildren: true, badge: "24", badgeTone: "brand" },
  { title: "Journal Entries", to: "/ledger/journals", icon: NotebookPen },
  { title: "Banking", to: "/banking", icon: Landmark, hasChildren: true },
  { title: "Sales", to: "/invoices", icon: ShoppingBag, hasChildren: true, badge: "New", badgeTone: "violet" },
  { title: "Estimates", to: "/estimates", icon: FileText },
  { title: "Recurring", to: "/invoices/recurring", icon: CalendarClock },
  { title: "Credit Notes", to: "/invoices/credit-notes", icon: ReceiptText },
  { title: "Customers", to: "/customers", icon: Users2 },
  { title: "Purchases", to: "/bills", icon: ShoppingCart, hasChildren: true },
  { title: "Expenses", to: "/expenses", icon: ReceiptText, badge: "New", badgeTone: "violet", hasChildren: true },
  { title: "Receipts", to: "/expenses/receipts", icon: Receipt },
  { title: "Approvals", to: "/expenses/approvals", icon: ShieldCheck },
  { title: "Subscriptions", to: "/expenses/subscriptions", icon: CalendarClock },
  { title: "Vendor Spend", to: "/expenses/vendors", icon: Building2 },
  { title: "Payroll", to: "/payroll", icon: Users2, status: "Soon" },
  { title: "Chart of Accounts", to: "/ledger/accounts", icon: BookOpen },
  { title: "Cash Availability", to: "/cash-availability", icon: Coins, badge: "New", badgeTone: "violet", hasChildren: true },
  { title: "Allocations", to: "/cash-availability/allocations", icon: Split },
  { title: "Treatment Rules", to: "/cash-availability/rules", icon: ScrollText },
  { title: "Reports", to: "/reports", icon: BarChart3, hasChildren: true },
  { title: "Budgets", to: "/budgets", icon: Wallet2 },
  { title: "Reconciliation", to: "/banking/reconciliation", icon: BookOpenCheck },
  { title: "Financial Intelligence", to: "/intelligence", icon: Brain, badge: "New", badgeTone: "violet", hasChildren: true },
  { title: "Marketing ROI", to: "/intelligence/marketing", icon: Megaphone },
  { title: "Bonus Center", to: "/intelligence/bonuses", icon: Gift },
  { title: "Profitability", to: "/intelligence/profitability", icon: PieChart },
  { title: "Forecasting", to: "/intelligence/forecasting", icon: Gauge },
  { title: "Revenue Leakage", to: "/intelligence/leakage", icon: Search },
  { title: "Recommendations", to: "/intelligence/recommendations", icon: Lightbulb },
  { title: "Integrations", to: "/integrations", icon: Plug, badge: "3", badgeTone: "violet" },
  { title: "Settings", to: "/settings", icon: SettingsIcon, hasChildren: true },
  { title: "Audit Log", to: "/audit", icon: ShieldCheck },
];

/** Secondary / admin destinations retained from earlier phases so all routes stay reachable. */
export const NAV_SECONDARY: NavItem[] = [
  { title: "Monthly Close", to: "/close", icon: CalendarClock },
  { title: "Customers", to: "/customers", icon: Users2 },
  { title: "Invoices", to: "/invoices", icon: FileText },
  { title: "Payments", to: "/payments", icon: CreditCard },
  { title: "Vendors", to: "/vendors", icon: Building2 },
  { title: "Bills", to: "/bills", icon: Receipt },
  { title: "Expenses", to: "/expenses", icon: ReceiptText },
  { title: "General Ledger", to: "/ledger/general", icon: BookOpenCheck },
  { title: "Users & Roles", to: "/admin/users", icon: UserCog },
  { title: "Migration Readiness", to: "/readiness/migration", icon: Rocket },
  { title: "Production Readiness", to: "/readiness/production", icon: ShieldCheck },
];
