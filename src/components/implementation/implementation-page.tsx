import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/banking/demo-notice";
import { cn } from "@/lib/utils";
import { Download, FileCode2 } from "lucide-react";

export const IMPL_TABS: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/implementation", label: "Blueprint", exact: true },
  { to: "/implementation/api-map", label: "API Map" },
  { to: "/implementation/data-map", label: "Data Map" },
  { to: "/implementation/permissions", label: "Permissions" },
  { to: "/implementation/integrations", label: "Integrations" },
  { to: "/implementation/events", label: "Events & Drafts" },
  { to: "/implementation/migration", label: "Migration" },
  { to: "/implementation/testing", label: "Testing" },
  { to: "/implementation/security", label: "Security" },
  { to: "/implementation/cutover", label: "Cutover" },
  { to: "/implementation/readiness", label: "Readiness" },
  { to: "/implementation/handoff", label: "Handoff" },
];

export function ImplementationPage({
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
        eyebrow="LedgerOS · Phase 5 · Production Integration Blueprint"
        title={title}
        description={description}
        actions={
          actions ?? (
            <>
              <Button variant="outline" size="sm" className="h-9">
                <FileCode2 className="mr-1.5 h-3.5 w-3.5" /> View spec
              </Button>
              <Button size="sm" className="h-9">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export handoff
              </Button>
            </>
          )
        }
      />
      <div className="px-6 sm:px-8">
        <DemoNotice message="LedgerOS UI Design Lab · Phase 5 blueprint — no backend is connected. Every endpoint, permission, and event listed here is a design contract, not a live API." />
      </div>
      <div className="border-b border-border">
        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto px-6 sm:px-8"
          aria-label="Implementation sections"
        >
          {IMPL_TABS.map((t) => {
            const active = t.exact
              ? pathname === t.to
              : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link
                key={t.to}
                to={t.to as "/implementation"}
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
