import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/mock/finance";
import { OVERHEAD_ANOMALIES } from "@/lib/mock/intelligence";
import { ExplainabilityPanel } from "@/components/intelligence/explainability-panel";
import { AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_META = {
  low: { label: "Low", cls: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", cls: "bg-warning/10 text-warning" },
  high: { label: "High", cls: "bg-warning/15 text-warning" },
  critical: { label: "Critical", cls: "bg-destructive/15 text-destructive" },
} as const;

const ACTIONS = [
  "Review", "Approve as Normal", "Request Documentation", "Reclassify",
  "Create Policy", "Reduce Seats", "Cancel", "Renegotiate", "Freeze Spend",
  "Escalate to Rose", "Escalate to Christin", "Monitor for 30 Days",
];

export const Route = createFileRoute("/intelligence/overhead-anomalies")({
  head: () => ({ meta: [{ title: "Overhead Anomalies — LedgerOS" }] }),
  component: OverheadAnomalies,
});

function OverheadAnomalies() {
  const totalImpact = OVERHEAD_ANOMALIES.reduce((s, a) => s + a.cashImpact, 0);
  return (
    <IntelligencePage
      title="Overhead Anomaly Center"
      description="Explainable detection across expense trends, subscriptions, vendors, and structural risk."
    >
      <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <SummaryCell label="Open anomalies" value={String(OVERHEAD_ANOMALIES.filter((a) => a.status === "open").length)} />
        <SummaryCell label="Critical" value={String(OVERHEAD_ANOMALIES.filter((a) => a.severity === "critical").length)} tone="destructive" />
        <SummaryCell label="High" value={String(OVERHEAD_ANOMALIES.filter((a) => a.severity === "high").length)} tone="warning" />
        <SummaryCell label="Cash impact" value={currency(totalImpact)} tone={totalImpact < 0 ? "destructive" : "default"} />
        <SummaryCell label="Recoverable / mo" value={currency(469)} tone="success" />
      </section>

      <section className="mb-2 flex flex-wrap items-center gap-1.5">
        {ACTIONS.map((a) => (
          <Badge key={a} variant="outline" className="border-border/70 text-[11px] font-medium text-muted-foreground">
            {a}
          </Badge>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {OVERHEAD_ANOMALIES.map((a) => {
          const sev = SEVERITY_META[a.severity];
          return (
            <Card key={a.id} className="border-border/70 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {a.severity === "critical" ? (
                      <AlertOctagon className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    )}
                    <span className={cn("rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold uppercase", sev.cls)}>
                      {sev.label}
                    </span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                      {a.type}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-foreground">
                    {a.vendor} · {a.category}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {a.department} · Owner {a.owner}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Cash impact
                  </div>
                  <div
                    className={cn(
                      "font-tabular text-[15px] font-bold",
                      a.cashImpact < 0 ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {a.cashImpact === 0 ? "—" : currency(a.cashImpact)}
                  </div>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 rounded-md bg-muted/40 p-2 text-[11px]">
                <div>
                  <div className="text-muted-foreground">Expected</div>
                  <div className="font-tabular font-semibold">{currency(a.expected)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Actual</div>
                  <div className="font-tabular font-semibold">{currency(a.actual)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Variance</div>
                  <div className="font-tabular font-semibold">{a.variancePct}%</div>
                </div>
              </div>

              <ExplainabilityPanel
                title="Why this was flagged"
                confidence={a.confidence}
                reasons={[a.explanation, `Suggested action: ${a.suggestedAction}`]}
                className="mt-2"
              />

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10.5px] italic text-muted-foreground">Demonstration only.</span>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 text-[11px]">Review</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]">Approve as normal</Button>
                </div>
              </div>
            </Card>
          );
        })}
      </section>
    </IntelligencePage>
  );
}

function SummaryCell({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" | "destructive" | "success" }) {
  const toneCls =
    tone === "warning"
      ? "text-warning"
      : tone === "destructive"
        ? "text-destructive"
        : tone === "success"
          ? "text-success"
          : "text-foreground";
  return (
    <Card className="border-border/70 p-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-tabular text-[20px] font-bold", toneCls)}>{value}</div>
    </Card>
  );
}
