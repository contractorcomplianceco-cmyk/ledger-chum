import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Download } from "lucide-react";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — LedgerOS" },
      {
        name: "description",
        content:
          "Create, send, and collect invoices with automatic pass-through, commission, and cash-availability allocation on every line.",
      },
      { property: "og:title", content: "Invoices & Allocation Preview — LedgerOS" },
      {
        property: "og:description",
        content:
          "Every LedgerOS invoice line auto-routes to a spendability bucket — Operating, Reserved, or Restricted — so cash decisions are real-time.",
      },
    ],
  }),
  component: InvoicesLayout,
});

const TABS: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/invoices", label: "Invoices", exact: true },
  { to: "/invoices/recurring", label: "Recurring" },
  { to: "/invoices/credit-notes", label: "Credit notes" },
  { to: "/estimates", label: "Estimates" },
  { to: "/customers", label: "Customers" },
];

function InvoicesLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isNew = pathname === "/invoices/new";
  const isDetail = /^\/invoices\/inv-/.test(pathname);

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Sales"
        title="Invoicing"
        description="Every line auto-allocates to CCA revenue, pass-through, commission, tax reserve, or deferred revenue in real time."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link to="/invoices"><Download className="mr-1.5 h-3.5 w-3.5" /> Export</Link>
            </Button>
            <Button size="sm" className="h-9" asChild>
              <Link to="/invoices/new"><Plus className="mr-1.5 h-3.5 w-3.5" /> New invoice</Link>
            </Button>
          </>
        }
      />

      {!isNew && !isDetail && (
        <div className="border-b border-border px-6 sm:px-8">
          <nav className="flex flex-wrap items-center gap-1">
            {TABS.map((t) => {
              const active = t.exact
                ? pathname === t.to
                : pathname === t.to || pathname.startsWith(t.to + "/");
              return (
                <Link
                  key={t.to}
                  to={t.to as "/invoices"}
                  className={cn(
                    "relative rounded-t-md px-3 py-2 text-[13px] font-medium transition",
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
