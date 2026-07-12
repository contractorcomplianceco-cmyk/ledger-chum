import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/banking/demo-notice";
import { cn } from "@/lib/utils";
import { Sparkles, Play } from "lucide-react";

export const AUTOMATION_TABS: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/automation-center", label: "Command Center", exact: true },
  { to: "/automation/rules", label: "Rules" },
  { to: "/automation/approvals", label: "Approvals" },
  { to: "/automation/exceptions", label: "Exceptions" },
  { to: "/automation/collections", label: "Collections" },
  { to: "/automation/payables", label: "Payables" },
  { to: "/automation/cash-controls", label: "Cash Controls" },
  { to: "/automation/budget-controls", label: "Budgets" },
  { to: "/automation/subscription-actions", label: "Subscriptions" },
  { to: "/automation/revenue-recovery", label: "Recovery" },
  { to: "/automation/bonus-controls", label: "Bonus Controls" },
  { to: "/automation/data-quality", label: "Data Quality" },
  { to: "/automation/integration-health", label: "Integrations" },
  { to: "/automation/action-plans", label: "Action Plans" },
  { to: "/automation/decision-log", label: "Decision Log" },
];

export function AutomationPage({
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
        eyebrow="LedgerOS · Automation & Controls"
        title={title}
        description={description}
        actions={
          actions ?? (
            <>
              <Button variant="outline" size="sm" className="h-9">
                <Play className="mr-1.5 h-3.5 w-3.5" /> Run test batch
              </Button>
              <Button size="sm" className="h-9">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask LedgerOS
              </Button>
            </>
          )
        }
      />
      <div className="px-6 sm:px-8">
        <DemoNotice message="LedgerOS UI Design Lab · Demonstration Data — no automations are executing and no records are modified." />
      </div>
      <div className="border-b border-border">
        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto px-6 sm:px-8"
          aria-label="Automation sections"
        >
          {AUTOMATION_TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link
                key={t.to}
                to={t.to as "/automation-center"}
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
