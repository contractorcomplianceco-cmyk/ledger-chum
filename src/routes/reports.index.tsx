import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { BarChart3, BookOpen, Landmark, Scale, TrendingUp, Wallet } from "lucide-react";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      { title: "Financial Reports — LedgerOS" },
      { name: "description", content: "Trial Balance, Profit & Loss, Balance Sheet, Cash Flow, AR/AP Aging. All from posted journal lines." },
      { property: "og:title", content: "Financial Reports — LedgerOS" },
      { property: "og:description", content: "Standalone accounting reports driven by the LedgerOS posting engine." },
    ],
  }),
  component: ReportsIndex,
});

const REPORTS = [
  { to: "/reports/trial-balance", title: "Trial Balance", desc: "Debits and credits per account for a date range.", icon: BookOpen },
  { to: "/reports/profit-loss", title: "Profit & Loss", desc: "Revenue, expense, and net income across a period.", icon: TrendingUp },
  { to: "/reports/balance-sheet", title: "Balance Sheet", desc: "Assets, liabilities, equity as of a date.", icon: Scale },
  { to: "/reports/cash-flow", title: "Cash Flow", desc: "Operating cash flow via indirect method.", icon: Wallet },
  { to: "/accounts-receivable/aging", title: "AR Aging", desc: "Open receivables bucketed by days past due.", icon: BarChart3 },
  { to: "/accounts-payable/aging", title: "AP Aging", desc: "Open payables bucketed by days past due.", icon: BarChart3 },
  { to: "/ledger/banking", title: "Banking", desc: "Bank accounts, imported transactions, matching, reconciliation.", icon: Landmark },
] as const;

function ReportsIndex() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Reporting"
        title="Financial Reports"
        description="All figures resolve from posted journal lines. No mocks, no fake intelligence."
      />
      <PageBody>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {REPORTS.map(({ to, title, desc, icon: Icon }) => (
            <Link key={to} to={to} className="block">
              <Card className="p-5 h-full hover:border-primary/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-muted p-2"><Icon className="h-4 w-4" /></div>
                  <div>
                    <div className="font-medium">{title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </PageBody>
    </AppShell>
  );
}
