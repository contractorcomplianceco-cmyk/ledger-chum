import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { DemoNotice } from "@/components/banking/demo-notice";
import { cn } from "@/lib/utils";

export const APEX_TABS: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/apex", label: "Overview", exact: true },
  { to: "/apex/insights", label: "Insights" },
  { to: "/apex/architecture", label: "Experience Architecture" },
  { to: "/apex/navigation", label: "Navigation 3.0" },
  { to: "/apex/widgets", label: "Widgets" },
  { to: "/apex/company-health", label: "Company Health" },
  { to: "/apex/opportunities", label: "Opportunity Engine" },
  { to: "/apex/financial-dna", label: "Financial DNA" },
  { to: "/apex/relationship-graph", label: "Relationship Graph" },
  { to: "/apex/timeline", label: "Financial Timeline" },
  { to: "/apex/digital-twin", label: "Digital Twin" },
  { to: "/apex/briefing", label: "Executive Briefing" },
  { to: "/apex/ai-personas", label: "AI Personas" },
  { to: "/apex/workspaces", label: "Role Workspaces" },
  { to: "/apex/handoff", label: "Production Handoff" },
  { to: "/apex/assets", label: "Illustrations" },
];

export function ApexPage({
  title,
  description,
  decision,
  children,
  actions,
}: {
  title: string;
  description: string;
  decision?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <AppShell>
      <PageHeader
        eyebrow="Project APEX · Executive Intelligence"
        title={title}
        highlight="APEX"
        description={description}
        actions={actions}
      />
      <div className="px-6 sm:px-8">
        <DemoNotice message="Project APEX Planning Surface — demonstration framework only. No production data, no live AI inference, no financial actions." />
      </div>
      {decision && (
        <div className="mx-6 mb-3 rounded-xl border border-border/70 bg-gradient-to-r from-slate-900 to-indigo-950 px-4 py-3 text-white sm:mx-8">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Primary decision question
          </div>
          <div className="mt-0.5 text-[15px] font-semibold">{decision}</div>
        </div>
      )}
      <div className="border-b border-border">
        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto px-6 sm:px-8"
          aria-label="Project APEX sections"
        >
          {APEX_TABS.map((t) => {
            const active = t.exact
              ? pathname === t.to
              : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link
                key={t.to}
                to={t.to as "/apex"}
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

export function ApexSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        {description && <p className="text-[12.5px] text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
