import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { DemoNotice } from "@/components/banking/demo-notice";
import { cn } from "@/lib/utils";

export const REGISTRY_TABS: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/feature-registry", label: "Summary", exact: true },
  { to: "/feature-registry/all", label: "All" },
  { to: "/feature-registry/built", label: "Built / Mock" },
  { to: "/feature-registry/planned", label: "Planned" },
  { to: "/feature-registry/blocked", label: "Blocked" },
  { to: "/feature-registry/integrations", label: "Integrations" },
  { to: "/feature-registry/legal-accounting", label: "Legal & Accounting" },
  { to: "/feature-registry/releases", label: "Releases" },
  { to: "/feature-registry/navigation", label: "Future Nav" },
  { to: "/feature-registry/dependencies", label: "Dependencies" },
  { to: "/feature-registry/readiness", label: "Readiness" },
];

export function FeatureRegistryPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Planning · Master Feature Registry"
        title={title}
        description={description}
      />
      <div className="px-6 sm:px-8">
        <DemoNotice message="Planning artifact only — no backend, Supabase, or auth changes. Every record here is a design contract for future implementation." />
      </div>
      <div className="border-b border-border">
        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto px-6 sm:px-8"
          aria-label="Feature registry sections"
        >
          {REGISTRY_TABS.map((t) => {
            const active = t.exact
              ? pathname === t.to
              : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link
                key={t.to}
                to={t.to as "/feature-registry"}
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
