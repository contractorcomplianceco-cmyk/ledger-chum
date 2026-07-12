import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { DECISION_LOG, type DecisionEntry } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/automation/decision-log")({
  head: () => ({ meta: [{ title: "Decision Log — LedgerOS" }] }),
  component: DecisionLogPage,
});

const TYPE_META: Record<DecisionEntry["type"], { label: string; tone: string }> = {
  approved_spend: { label: "Approved spend", tone: "border-brand/30 bg-brand/10 text-brand" },
  rejected_spend: { label: "Rejected spend", tone: "border-destructive/30 bg-destructive/10 text-destructive" },
  pricing: { label: "Pricing change", tone: "border-violet-400/30 bg-violet-500/10 text-violet-400" },
  bonus: { label: "Bonus", tone: "border-pink-400/30 bg-pink-500/10 text-pink-400" },
  budget_override: { label: "Budget override", tone: "border-warning/30 bg-warning/10 text-warning" },
  software_cancel: { label: "Software cancel", tone: "border-cyan-400/30 bg-cyan-500/10 text-cyan-400" },
  campaign_increase: { label: "Campaign increase", tone: "border-emerald-400/30 bg-emerald-500/10 text-emerald-400" },
  vendor_reneg: { label: "Vendor negotiation", tone: "border-amber-400/30 bg-amber-500/10 text-amber-400" },
  reserve_change: { label: "Reserve change", tone: "border-brand/30 bg-brand/10 text-brand" },
  client_exception: { label: "Client exception", tone: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-400" },
};

function DecisionLogPage() {
  const [type, setType] = useState<DecisionEntry["type"] | "all">("all");
  const rows = type === "all" ? DECISION_LOG : DECISION_LOG.filter((d) => d.type === type);

  return (
    <AutomationPage
      title="Decision Log"
      description="An auditable record of every major financial decision — who decided, why, and which records it touched."
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setType("all")}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
            type === "all" ? "border-transparent bg-gradient-brand-cool text-white" : "border-border bg-surface text-foreground/80",
          )}
        >
          All
        </button>
        {Object.entries(TYPE_META).map(([k, m]) => (
          <button
            key={k}
            onClick={() => setType(k as DecisionEntry["type"])}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
              type === k ? "border-transparent bg-gradient-brand-cool text-white" : "border-border bg-surface text-foreground/80",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative pl-6">
        <div className="absolute inset-y-0 left-2 w-px bg-border" />
        <ul className="space-y-3">
          {rows.map((d) => (
            <li key={d.id} className="relative">
              <span className="absolute -left-4 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-background" />
              <Card className="border-border/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase", TYPE_META[d.type].tone)}>
                        {TYPE_META[d.type].label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{d.date}</span>
                      <span className="text-[11px] text-muted-foreground">· by {d.decidedBy}</span>
                    </div>
                    <div className="mt-1 font-semibold">{d.title}</div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">{d.rationale}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {d.linkedRecords.map((r) => (
                        <span key={r} className="rounded-md border border-border/70 bg-muted/30 px-1.5 py-0.5 text-[10.5px] font-mono text-muted-foreground">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={cn("font-tabular text-lg font-bold", d.amount < 0 ? "text-destructive" : d.amount > 0 ? "text-success" : "text-muted-foreground")}>
                    {d.amount === 0 ? "—" : currency(d.amount)}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </AutomationPage>
  );
}
