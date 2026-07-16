import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeakageCard } from "@/components/intelligence/leakage-card";
import { currency } from "@/lib/mock/finance";
import { LEAKAGE_OPPS, LEAKAGE_STATUS_META, type LeakageStatus } from "@/lib/mock/intelligence";
import { cn } from "@/lib/utils";

const FILTERS: (LeakageStatus | "all")[] = [
  "all",
  "new",
  "verified",
  "invoice_draft",
  "invoiced",
  "collected",
  "dismissed",
  "not_recoverable",
];

export const Route = createFileRoute("/intelligence/leakage")({
  head: () => ({ meta: [{ title: "Revenue Leakage — LedgerOS" }] }),
  component: LeakagePage,
});

function LeakagePage() {
  const [filter, setFilter] = useState<LeakageStatus | "all">("all");
  const opps = filter === "all" ? LEAKAGE_OPPS : LEAKAGE_OPPS.filter((o) => o.status === filter);
  const totalRecoverable = LEAKAGE_OPPS.filter(
    (o) => o.status !== "dismissed" && o.status !== "not_recoverable",
  ).reduce((s, o) => s + o.amount, 0);
  const verifiedCount = LEAKAGE_OPPS.filter(
    (o) => o.status === "verified" || o.status === "invoice_draft",
  ).length;

  return (
    <IntelligencePage
      title="Revenue Leakage Center"
      description="Find money that has already been earned but not yet invoiced or collected."
    >
      <section className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Recoverable" value={currency(totalRecoverable)} tone="success" />
        <MetricCard label="Verified & ready" value={String(verifiedCount)} tone="warning" />
        <MetricCard label="Median age" value="16 days" />
        <MetricCard label="Median confidence" value="90%" />
      </section>

      <section className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="h-7 text-[11.5px]"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : LEAKAGE_STATUS_META[f].label}
          </Button>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        {opps.map((o) => (
          <LeakageCard key={o.id} opp={o} />
        ))}
      </section>
    </IntelligencePage>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-tabular text-[22px] font-bold",
          tone === "success"
            ? "text-success"
            : tone === "warning"
              ? "text-warning"
              : "text-foreground",
        )}
      >
        {value}
      </div>
    </Card>
  );
}
