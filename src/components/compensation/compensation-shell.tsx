import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DEMO_MUTATION_MESSAGE } from "@/lib/api/types";

const SUBNAV: Array<{ to: string; label: string; matchStartsWith?: string }> = [
  { to: "/compensation", label: "Overview" },
  { to: "/compensation/plans", label: "Plans", matchStartsWith: "/compensation/plans" },
  { to: "/compensation/participants", label: "Participants", matchStartsWith: "/compensation/participants" },
  { to: "/compensation/attribution", label: "Attribution", matchStartsWith: "/compensation/attribution" },
  { to: "/compensation/eligibility", label: "Eligibility" },
  { to: "/compensation/preview", label: "Plan Preview" },
  { to: "/compensation/calculations", label: "Calculations", matchStartsWith: "/compensation/calculations" },
  { to: "/compensation/verification", label: "Verification" },
  { to: "/compensation/approvals", label: "Approvals" },
  { to: "/compensation/reserves", label: "Reserves" },
  { to: "/compensation/payables", label: "Payables", matchStartsWith: "/compensation/payables" },
  { to: "/compensation/payment-batches", label: "Batches", matchStartsWith: "/compensation/payment-batches" },
  { to: "/compensation/statements", label: "Statements", matchStartsWith: "/compensation/statements" },
  { to: "/compensation/holdbacks", label: "Holdbacks" },
  { to: "/compensation/adjustments", label: "Adjustments" },
  { to: "/compensation/clawbacks", label: "Clawbacks" },
  { to: "/compensation/disputes", label: "Disputes", matchStartsWith: "/compensation/disputes" },
  { to: "/compensation/reconciliation", label: "Reconciliation" },
  { to: "/compensation/audit", label: "Audit" },
];

export function CompensationShell({
  eyebrow = "Compensation Intelligence",
  title,
  highlight,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <AppShell>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        highlight={highlight}
        description={description}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-brand-violet/40 bg-brand-violet/10 text-brand-violet">
              Demo — no real records modified
            </Badge>
            {actions}
          </div>
        }
      />
      <div className="border-b border-border/60 px-6 sm:px-8">
        <nav className="-mb-px flex flex-wrap gap-1 text-sm">
          {SUBNAV.map((item) => {
            const active =
              pathname === item.to ||
              (item.matchStartsWith ? pathname.startsWith(item.matchStartsWith) : false);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "border-b-2 px-3 py-2 font-medium transition-colors",
                  active
                    ? "border-brand text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <PageBody>{children}</PageBody>
    </AppShell>
  );
}

export function showDemoToast(action: string) {
  toast.success(action, { description: DEMO_MUTATION_MESSAGE });
}

export function DemoActionNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Every action on this screen is demonstration-only — no compensation or accounting record
      is modified.
    </p>
  );
}
