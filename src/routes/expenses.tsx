import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/banking/demo-notice";
import { cn } from "@/lib/utils";
import { Plus, Download, Upload } from "lucide-react";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — LedgerOS" },
      {
        name: "description",
        content:
          "Review, approve, match, and understand company spending with policy, receipt, anomaly, and subscription intelligence built in.",
      },
      { property: "og:title", content: "Expenses — LedgerOS" },
      {
        property: "og:description",
        content:
          "Expense management with smart matching, policy enforcement, anomaly detection, and reimbursable recovery.",
      },
    ],
  }),
  component: ExpensesLayout,
});

const TABS: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/expenses", label: "Dashboard", exact: true },
  { to: "/expenses/list", label: "Expenses" },
  { to: "/expenses/receipts", label: "Receipts" },
  { to: "/expenses/matching", label: "Matching" },
  { to: "/expenses/approvals", label: "Approvals" },
  { to: "/expenses/policies", label: "Policies" },
  { to: "/expenses/intelligence", label: "Anomalies" },
  { to: "/expenses/subscriptions", label: "Subscriptions" },
  { to: "/expenses/pre-spend", label: "Pre-Spend" },
  { to: "/expenses/reimbursements", label: "Reimbursements" },
  { to: "/expenses/recovery", label: "Recovery" },
  { to: "/expenses/reports", label: "Reports" },
  { to: "/expenses/vendors", label: "Vendor Spend" },
  { to: "/expenses/copilot", label: "Copilot" },
];

function ExpensesLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isSubmit = pathname === "/expenses/submit";

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Purchases"
        title="Expenses"
        description="Review, approve, match, and understand company spending. Every expense connects to allocation, budgets, subscriptions, and client recovery."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Import
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm" className="h-9" asChild>
              <Link to="/expenses/submit">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Submit expense
              </Link>
            </Button>
          </>
        }
      />

      <div className="px-6 sm:px-8">
        <DemoNotice message="LedgerOS UI Design Lab · Demonstration Data — no accounting record is modified." />
      </div>

      {!isSubmit && (
        <div className="border-b border-border">
          <nav
            className="flex flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto px-6 sm:px-8"
            aria-label="Expenses sections"
          >
            {TABS.map((t) => {
              const active = t.exact
                ? pathname === t.to
                : pathname === t.to || pathname.startsWith(t.to + "/");
              return (
                <Link
                  key={t.to}
                  to={t.to as "/expenses"}
                  className={cn(
                    "relative rounded-t-md px-3 py-2 text-[13px] font-medium transition whitespace-nowrap",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-brand-cool" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <PageBody>
        <Outlet />
      </PageBody>
    </AppShell>
  );
}
