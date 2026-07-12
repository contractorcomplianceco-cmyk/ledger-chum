import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SubscriptionCard } from "@/components/expenses/subscription-card";
import { SUBSCRIPTIONS, SUB_STATUS_META, type SubscriptionStatus } from "@/lib/mock/expenses";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/subscriptions")({
  component: SubscriptionsPage,
});

const STATUSES: Array<"all" | SubscriptionStatus> = ["all", "healthy", "underused", "price_increase", "renewal_soon", "no_owner", "cancellation_candidate"];

function SubscriptionsPage() {
  const [status, setStatus] = useState<"all" | SubscriptionStatus>("all");
  const rows = status === "all" ? SUBSCRIPTIONS : SUBSCRIPTIONS.filter((s) => s.status === status);
  const totalAnnual = SUBSCRIPTIONS.reduce((a, s) => a + (s.frequency === "annual" ? s.currentCost : s.currentCost * 12), 0);
  const savings = SUBSCRIPTIONS.filter((s) => s.status === "underused" || s.status === "cancellation_candidate" || s.status === "no_owner")
    .reduce((a, s) => a + (s.frequency === "annual" ? s.currentCost : s.currentCost * 12), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Annualized spend" value={currency(totalAnnual)} sub={`${SUBSCRIPTIONS.length} subscriptions`} />
        <StatCard label="Potential savings" value={currency(savings)} sub="cancel / right-size" tone="success" />
        <StatCard label="Needs attention" value={String(SUBSCRIPTIONS.filter((s) => s.status !== "healthy").length)} sub="review recommended" tone="warning" />
      </div>

      <Card className="border-border/70 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition capitalize",
                status === s
                  ? "border-transparent bg-gradient-brand-cool text-white shadow-sm"
                  : "border-border bg-surface text-foreground/80 hover:border-foreground/20",
              )}
            >
              {s === "all" ? "All" : SUB_STATUS_META[s].label}
              <span className="ml-1.5 rounded-full bg-black/10 px-1 text-[10px]">
                {s === "all" ? SUBSCRIPTIONS.length : SUBSCRIPTIONS.filter((x) => x.status === s).length}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((s) => <SubscriptionCard key={s.id} s={s} />)}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, tone = "muted" }: { label: string; value: string; sub: string; tone?: "muted" | "success" | "warning" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-tabular text-2xl font-bold ${t}`}>{value}</div>
      <div className="mt-0.5 text-[11.5px] text-muted-foreground">{sub}</div>
    </Card>
  );
}
