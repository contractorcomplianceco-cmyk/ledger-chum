import {
  LayoutDashboard,
  Landmark,
  Wallet,
  ArrowLeftRight,
  Users,
  FileText,
  CreditCard,
  Building2,
  Receipt,
  ReceiptText,
  BookOpen,
  BookOpenCheck,
  NotebookPen,
  BarChart3,
  CalendarClock,
  Inbox,
  ShieldCheck,
  UserCog,
  Settings,
  Rocket,
  Gauge,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Executive", to: "/", icon: LayoutDashboard },
      { title: "Accounting Lead", to: "/dashboards/accounting", icon: Gauge },
      { title: "Systems Reviewer", to: "/dashboards/reviewer", icon: ShieldCheck },
      { title: "Team Member", to: "/dashboards/team", icon: Wallet },
    ],
  },
  {
    label: "Banking",
    items: [
      { title: "Banking", to: "/banking", icon: Landmark },
      { title: "Transactions", to: "/banking/transactions", icon: ArrowLeftRight, badge: "24" },
      { title: "Reconciliation", to: "/banking/reconciliation", icon: BookOpenCheck },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Customers", to: "/customers", icon: Users },
      { title: "Invoices", to: "/invoices", icon: FileText },
      { title: "Payments", to: "/payments", icon: CreditCard },
    ],
  },
  {
    label: "Purchases",
    items: [
      { title: "Vendors", to: "/vendors", icon: Building2 },
      { title: "Bills", to: "/bills", icon: Receipt },
      { title: "Expenses", to: "/expenses", icon: ReceiptText },
    ],
  },
  {
    label: "Ledger",
    items: [
      { title: "Chart of Accounts", to: "/ledger/accounts", icon: BookOpen },
      { title: "General Ledger", to: "/ledger/general", icon: BookOpenCheck },
      { title: "Journal Entries", to: "/ledger/journals", icon: NotebookPen },
    ],
  },
  {
    label: "Insight",
    items: [
      { title: "Reports", to: "/reports", icon: BarChart3 },
      { title: "Monthly Close", to: "/close", icon: CalendarClock },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Integration Inbox", to: "/integrations", icon: Inbox, badge: "3" },
      { title: "Audit Log", to: "/audit", icon: ShieldCheck },
    ],
  },
  {
    label: "Admin",
    items: [
      { title: "Users & Roles", to: "/admin/users", icon: UserCog },
      { title: "Settings", to: "/settings", icon: Settings },
      { title: "Migration Readiness", to: "/readiness/migration", icon: Rocket },
      { title: "Production Readiness", to: "/readiness/production", icon: ShieldCheck },
    ],
  },
];
