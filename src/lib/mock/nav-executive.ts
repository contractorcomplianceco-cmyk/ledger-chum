import {
  Home,
  Wallet,
  TrendingUp,
  Users2,
  Building2,
  Coins,
  Landmark,
  ArrowLeftRight,
  BookOpenCheck,
  Split,
  ScrollText,
  Wallet2,
  FileText,
  CalendarClock,
  ReceiptText,
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  ShieldCheck,
  Repeat,
  Award,
  Gauge,
  AlertTriangle,
  BookMarked,
  Sliders,
  Undo2,
  PiggyBank,
  Brain,
  Megaphone,
  Gift,
  PieChart,
  Search,
  Lightbulb,
  Workflow,
  Bot,
  Database,
  Activity,
  Target,
  Plug,
  Settings as SettingsIcon,
  UserCog,
  Rocket,
  BookOpen,
  BarChart3,
  Compass,
  type LucideIcon,
} from "lucide-react";

/**
 * Executive Workspace navigation (Project APEX, Navigation 3.0).
 *
 * Reorganizes existing routes into 5 executive workspaces. No route paths
 * are renamed or removed — this is a display-only overlay.
 */

export type ExecutiveNavItem = {
  title: string;
  to: string;
  icon: LucideIcon;
  permission?: string;
  badge?: string;
};

export type ExecutiveWorkspace = {
  id: "home" | "money" | "growth" | "people" | "company" | "admin";
  title: string;
  icon: LucideIcon;
  /** Primary decision question this workspace answers. */
  decision: string;
  /** Landing route for the workspace (may be an /apex/* summary or an existing route). */
  landing: string;
  permission?: string;
  items: ExecutiveNavItem[];
};

export const EXECUTIVE_WORKSPACES: ExecutiveWorkspace[] = [
  {
    id: "home",
    title: "Home",
    icon: Home,
    decision: "What requires my attention today?",
    landing: "/apex/home",
    items: [
      { title: "Executive Workspace", to: "/apex/home", icon: Home },
      { title: "Company Health", to: "/apex/company-health", icon: Gauge },
      { title: "Executive Briefing", to: "/apex/briefing", icon: BookMarked },
      { title: "Priorities & Approvals", to: "/automation/approvals", icon: ShieldCheck },
      { title: "Operational Dashboard", to: "/dashboard", icon: Compass },
    ],
  },
  {
    id: "money",
    title: "Money",
    icon: Wallet,
    decision: "Where is the money, where is it going, and what can we safely use?",
    landing: "/apex/money",
    items: [
      { title: "Money Workspace", to: "/apex/money", icon: Wallet },
      { title: "Cash Availability", to: "/cash-availability", icon: Coins },
      { title: "Allocations", to: "/cash-availability/allocations", icon: Split },
      { title: "Treatment Rules", to: "/cash-availability/rules", icon: ScrollText },
      { title: "Banking", to: "/banking", icon: Landmark },
      { title: "Transactions", to: "/banking/transactions", icon: ArrowLeftRight },
      { title: "Reconciliation", to: "/banking/reconciliation", icon: BookOpenCheck },
      { title: "Invoices", to: "/invoices", icon: ShoppingBag },
      { title: "Estimates", to: "/estimates", icon: FileText },
      { title: "Recurring", to: "/invoices/recurring", icon: CalendarClock },
      { title: "Credit Notes", to: "/invoices/credit-notes", icon: ReceiptText },
      { title: "Customers", to: "/customers", icon: Users2 },
      { title: "Payments", to: "/payments", icon: CreditCard },
      { title: "Bills", to: "/bills", icon: ShoppingCart },
      { title: "Vendors", to: "/vendors", icon: Building2 },
      { title: "Expenses", to: "/expenses", icon: ReceiptText },
      { title: "Receipts", to: "/expenses/receipts", icon: Receipt },
      { title: "Subscriptions", to: "/expenses/subscriptions", icon: Repeat },
      { title: "Ledger", to: "/ledger/general", icon: BookOpen },
      { title: "Monthly Close", to: "/close", icon: CalendarClock },
      { title: "Reports", to: "/reports", icon: BarChart3, permission: "reports.view" },
    ],
  },
  {
    id: "growth",
    title: "Growth",
    icon: TrendingUp,
    decision: "What is increasing company value?",
    landing: "/apex/growth",
    items: [
      { title: "Growth Workspace", to: "/apex/growth", icon: TrendingUp },
      { title: "Financial Intelligence", to: "/intelligence", icon: Brain },
      { title: "Marketing ROI", to: "/intelligence/marketing", icon: Megaphone },
      { title: "Campaigns", to: "/intelligence/campaigns", icon: Megaphone },
      { title: "Clients", to: "/intelligence/clients", icon: Users2 },
      { title: "Services", to: "/intelligence/services", icon: BookOpen },
      { title: "Profitability", to: "/intelligence/profitability", icon: PieChart },
      { title: "Attribution", to: "/intelligence/attribution", icon: Split },
      { title: "Forecasting", to: "/intelligence/forecasting", icon: Gauge },
      { title: "Revenue Leakage", to: "/intelligence/leakage", icon: Search },
      { title: "Recommendations", to: "/intelligence/recommendations", icon: Lightbulb },
      { title: "Opportunity Engine", to: "/apex/opportunities", icon: Target },
    ],
  },
  {
    id: "people",
    title: "People",
    icon: Users2,
    decision: "What are our people costing, earning, producing, and needing?",
    landing: "/apex/people",
    items: [
      { title: "People Workspace", to: "/apex/people", icon: Users2 },
      { title: "Compensation Overview", to: "/compensation", icon: Award },
      { title: "Plans", to: "/compensation/plans", icon: ScrollText },
      { title: "Participants", to: "/compensation/participants", icon: Users2 },
      { title: "Attribution", to: "/compensation/attribution", icon: Split },
      { title: "Calculations", to: "/compensation/calculations", icon: Coins },
      { title: "Approvals", to: "/compensation/approvals", icon: ShieldCheck },
      { title: "Reserves", to: "/compensation/reserves", icon: PiggyBank },
      { title: "Payables", to: "/compensation/payables", icon: Wallet2 },
      { title: "Statements", to: "/compensation/statements", icon: ScrollText },
      { title: "Holdbacks", to: "/compensation/holdbacks", icon: PiggyBank },
      { title: "Clawbacks", to: "/compensation/clawbacks", icon: Undo2 },
      { title: "Disputes", to: "/compensation/disputes", icon: AlertTriangle },
      { title: "Bonus Center", to: "/intelligence/bonuses", icon: Gift },
      { title: "Bonus Forecast", to: "/intelligence/bonus-forecast", icon: Gauge },
      { title: "My Expenses", to: "/expenses/submit", icon: Receipt },
      { title: "My Reimbursements", to: "/expenses/reimbursements", icon: Wallet },
    ],
  },
  {
    id: "company",
    title: "Company",
    icon: Building2,
    decision: "What does the company need to remain healthy, protected, and scalable?",
    landing: "/apex/company",
    items: [
      { title: "Company Workspace", to: "/apex/company", icon: Building2 },
      { title: "Overhead", to: "/intelligence/overhead", icon: PieChart },
      { title: "Overhead Anomalies", to: "/intelligence/overhead-anomalies", icon: AlertTriangle },
      { title: "Technology", to: "/intelligence/tech", icon: Brain },
      { title: "Tech Portfolio", to: "/intelligence/tech-portfolio", icon: BookMarked },
      { title: "Apps", to: "/intelligence/apps", icon: Plug },
      { title: "Automation Center", to: "/automation-center", icon: Workflow },
      { title: "Rules", to: "/automation/rules", icon: Bot },
      { title: "Cash Controls", to: "/automation/cash-controls", icon: Sliders },
      { title: "Budget Controls", to: "/automation/budget-controls", icon: Wallet2 },
      { title: "Bonus Controls", to: "/automation/bonus-controls", icon: Award },
      { title: "Subscription Actions", to: "/automation/subscription-actions", icon: Repeat },
      { title: "Exceptions", to: "/automation/exceptions", icon: AlertTriangle },
      { title: "Collections", to: "/automation/collections", icon: Coins },
      { title: "Payables Queue", to: "/automation/payables", icon: Wallet },
      { title: "Revenue Recovery", to: "/automation/revenue-recovery", icon: Undo2 },
      { title: "Data Quality", to: "/automation/data-quality", icon: Database },
      { title: "Integration Health", to: "/automation/integration-health", icon: Activity },
      { title: "Decision Log", to: "/automation/decision-log", icon: BookMarked },
      { title: "Action Plans", to: "/automation/action-plans", icon: Target },
      { title: "Integrations", to: "/integrations", icon: Plug },
      { title: "Settings", to: "/settings", icon: SettingsIcon },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    icon: ShieldCheck,
    decision: "What governance, audit, and readiness work is open?",
    landing: "/settings",
    permission: "admin.view",
    items: [
      { title: "Users", to: "/admin/users", icon: UserCog },
      { title: "Audit Log", to: "/audit", icon: ShieldCheck },
      { title: "Migration Readiness", to: "/readiness/migration", icon: Rocket },
      { title: "Production Readiness", to: "/readiness/production", icon: ShieldCheck },
      {
        title: "Master Feature Registry",
        to: "/feature-registry",
        icon: BookMarked,
        permission: "implementation.view",
      },
      { title: "Project APEX", to: "/apex", icon: Compass, permission: "implementation.view" },
      {
        title: "Implementation",
        to: "/implementation",
        icon: FileText,
        permission: "implementation.view",
      },
    ],
  },
];
