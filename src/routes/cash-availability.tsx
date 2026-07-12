import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Settings2 } from "lucide-react";

export const Route = createFileRoute("/cash-availability")({
  head: () => ({
    meta: [
      { title: "Cash Availability — LedgerOS" },
      {
        name: "description",
        content:
          "Classify every incoming payment into pass-through, commission, tax, payroll, and operating buckets. See what cash is actually safe to spend.",
      },
      { property: "og:title", content: "Cash Availability & Revenue Allocation — LedgerOS" },
      {
        property: "og:description",
        content:
          "LedgerOS never treats the bank balance as fully spendable. Separate restricted, reserved, and operating cash in real time.",
      },
    ],
  }),
  component: CashAvailabilityLayout,
});

const TABS = [
  { to: "/cash-availability", label: "Overview", exact: true },
  { to: "/cash-availability/allocations", label: "Allocations" },
  { to: "/cash-availability/rules", label: "Treatment rules" },
] as const;

function CashAvailabilityLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Cash & Revenue"
        title="Cash Availability Engine"
        description="Bank balance is never fully spendable. Classify every payment into restricted, reserved, and operating buckets."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Guardrails
            </Button>
            <Button size="sm" className="h-9">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export
            </Button>
          </>
        }
      />

      <div className="border-b border-border px-6 sm:px-8">
        <nav className="flex flex-wrap items-center gap-1">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "relative rounded-t-md px-3 py-2 text-[13px] font-medium transition",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
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

      <PageBody>
        <Outlet />
      </PageBody>
    </AppShell>
  );
}
