import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { EXCEPTIONS, EXCEPTION_TYPE_META, type ExceptionItem } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/automation/exceptions")({
  head: () => ({ meta: [{ title: "Exception Management — LedgerOS" }] }),
  component: ExceptionsPage,
});

type SortKey = "dollar" | "age" | "urgency" | "confidence";

function ExceptionsPage() {
  const [sort, setSort] = useState<SortKey>("dollar");
  const [selected, setSelected] = useState<ExceptionItem | null>(EXCEPTIONS[0] ?? null);
  const urgencyRank = { high: 3, medium: 2, low: 1 } as const;
  const sorted = [...EXCEPTIONS].sort((a, b) => {
    if (sort === "dollar") return b.dollarImpact - a.dollarImpact;
    if (sort === "age") return b.age - a.age;
    if (sort === "urgency") return urgencyRank[b.urgency] - urgencyRank[a.urgency];
    return b.confidence - a.confidence;
  });

  return (
    <AutomationPage
      title="Exception Management"
      description="One prioritized operational queue — every failed allocation, unmatched deposit, policy violation, and data quality issue in one place."
    >
      <section className="grid gap-3 sm:grid-cols-4">
        <Metric label="Total exceptions" value={String(EXCEPTIONS.length)} />
        <Metric label="High urgency" value={String(EXCEPTIONS.filter((e) => e.urgency === "high").length)} tone="destructive" />
        <Metric label="Cash risk" value={String(EXCEPTIONS.filter((e) => e.cashRisk).length)} tone="warning" />
        <Metric label="Compliance risk" value={String(EXCEPTIONS.filter((e) => e.compliance).length)} tone="warning" />
      </section>

      <div className="flex flex-wrap items-center gap-1.5">
        {([
          { k: "dollar" as SortKey, l: "Dollar impact" },
          { k: "urgency" as SortKey, l: "Urgency" },
          { k: "age" as SortKey, l: "Age" },
          { k: "confidence" as SortKey, l: "Confidence" },
        ]).map((s) => (
          <button
            key={s.k}
            onClick={() => setSort(s.k)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
              sort === s.k ? "border-transparent bg-gradient-brand-cool text-white" : "border-border bg-surface text-foreground/80",
            )}
          >
            Sort · {s.l}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="border-border/70 p-0">
          <div className="grid grid-cols-[minmax(0,2.5fr)_1fr_1fr_auto_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Exception</span>
            <span>Type</span>
            <span>Owner</span>
            <span>Age</span>
            <span>Impact</span>
          </div>
          {sorted.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className={cn(
                "grid w-full grid-cols-[minmax(0,2.5fr)_1fr_1fr_auto_auto] items-center gap-2 border-b border-border px-4 py-3 text-left text-[12.5px] transition last:border-b-0",
                selected?.id === e.id ? "bg-brand/5" : "hover:bg-muted/30",
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    e.urgency === "high" && "border-destructive/30 bg-destructive/10 text-destructive",
                    e.urgency === "medium" && "border-warning/30 bg-warning/10 text-warning",
                    e.urgency === "low" && "border-border bg-muted/40 text-muted-foreground",
                  )}>{e.urgency}</span>
                  <span className="truncate font-medium">{e.title}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{e.detail}</div>
              </div>
              <span className="text-[11.5px] text-muted-foreground">{EXCEPTION_TYPE_META[e.type]}</span>
              <span className="text-[11.5px] text-muted-foreground">{e.owner}</span>
              <span className="text-[11.5px] text-muted-foreground">{e.age}d</span>
              <span className="font-tabular text-[12px] text-destructive">{e.dollarImpact ? currency(e.dollarImpact) : "—"}</span>
            </button>
          ))}
        </Card>

        {selected && (
          <Card className="border-border/70 p-5">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{selected.id} · {EXCEPTION_TYPE_META[selected.type]}</div>
            <div className="mt-0.5 font-semibold">{selected.title}</div>
            <div className="text-[12px] text-muted-foreground">{selected.detail}</div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px]">
              <Fld label="Dollar impact" value={currency(selected.dollarImpact)} />
              <Fld label="Owner" value={selected.owner} />
              <Fld label="Age" value={`${selected.age} days`} />
              <Fld label="Confidence" value={`${selected.confidence}%`} />
              <Fld label="Cash risk" value={selected.cashRisk ? "Yes" : "No"} />
              <Fld label="Compliance risk" value={selected.compliance ? "Yes" : "No"} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-1.5">
              <button className="rounded-md border border-border bg-surface px-2 py-1.5 text-[11.5px] hover:border-foreground/20">Assign</button>
              <button className="rounded-md border border-border bg-surface px-2 py-1.5 text-[11.5px] hover:border-foreground/20">Resolve</button>
              <button className="rounded-md border border-border bg-surface px-2 py-1.5 text-[11.5px] hover:border-foreground/20">Snooze 24h</button>
              <button className="rounded-md border border-border bg-surface px-2 py-1.5 text-[11.5px] hover:border-foreground/20">Escalate to Rose</button>
            </div>
          </Card>
        )}
      </div>
    </AutomationPage>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" | "destructive" }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-tabular text-[22px] font-bold", tone === "warning" && "text-warning", tone === "destructive" && "text-destructive")}>
        {value}
      </div>
    </Card>
  );
}

function Fld({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
