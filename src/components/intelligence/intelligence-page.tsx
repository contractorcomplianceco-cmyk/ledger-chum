import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/banking/demo-notice";
import { cn } from "@/lib/utils";
import { Download, Sparkles } from "lucide-react";

export const INTEL_TABS: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/intelligence", label: "Command Center", exact: true },
  { to: "/intelligence/overhead", label: "Overhead" },
  { to: "/intelligence/overhead-anomalies", label: "Anomalies" },
  { to: "/intelligence/tech", label: "Tech & AI" },
  { to: "/intelligence/tech-portfolio", label: "Portfolio" },
  { to: "/intelligence/apps", label: "Apps" },
  { to: "/intelligence/marketing", label: "Marketing ROI" },
  { to: "/intelligence/campaigns", label: "Campaigns" },
  { to: "/intelligence/bonuses", label: "Bonuses" },
  { to: "/intelligence/bonus-plans", label: "Bonus Plans" },
  { to: "/intelligence/bonus-forecast", label: "Bonus Forecast" },
  { to: "/intelligence/profitability", label: "Profitability" },
  { to: "/intelligence/clients", label: "Clients" },
  { to: "/intelligence/services", label: "Services" },
  { to: "/intelligence/departments", label: "Departments" },
  { to: "/intelligence/attribution", label: "Attribution" },
  { to: "/intelligence/forecasting", label: "Forecasting" },
  { to: "/intelligence/confidence", label: "Confidence" },
  { to: "/intelligence/leakage", label: "Leakage" },
  { to: "/intelligence/recommendations", label: "Recommendations" },
];

export function IntelligencePage({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Financial Intelligence"
        title={title}
        description={description}
        actions={
          actions ?? (
            <>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export
              </Button>
              <Button size="sm" className="h-9">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask LedgerOS
              </Button>
            </>
          )
        }
      />
      <div className="px-6 sm:px-8">
        <DemoNotice message="LedgerOS UI Design Lab · Demonstration Data — no backend, no live AI inference, no real financial data." />
      </div>
      <div className="border-b border-border">
        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto px-6 sm:px-8"
          aria-label="Financial Intelligence sections"
        >
          {INTEL_TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link
                key={t.to}
                to={t.to as "/intelligence"}
                className={cn(
                  "relative whitespace-nowrap rounded-t-md px-3 py-2 text-[12.5px] font-medium transition",
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
      <PageBody>{children}</PageBody>
    </AppShell>
  );
}
