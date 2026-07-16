import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RECOVERIES } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/automation/revenue-recovery")({
  head: () => ({ meta: [{ title: "Revenue Recovery — LedgerOS" }] }),
  component: RecoveryPage,
});

const STATUS_META: Record<string, { label: string; tone: string }> = {
  new: { label: "New", tone: "border-border bg-muted/40 text-muted-foreground" },
  verified: { label: "Verified", tone: "border-warning/30 bg-warning/10 text-warning" },
  invoice_draft: { label: "Invoice draft", tone: "border-brand/30 bg-brand/10 text-brand" },
  on_next_invoice: { label: "On next invoice", tone: "border-brand/30 bg-brand/10 text-brand" },
  contacted: { label: "Contacted", tone: "border-cyan-400/30 bg-cyan-500/10 text-cyan-400" },
  collected: { label: "Collected", tone: "border-success/30 bg-success/10 text-success" },
  dismissed: {
    label: "Dismissed",
    tone: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  },
  nonrecoverable: {
    label: "Non-recoverable",
    tone: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

function RecoveryPage() {
  const totalOpportunity = RECOVERIES.filter(
    (r) => !["dismissed", "nonrecoverable", "collected"].includes(r.status),
  ).reduce((s, r) => s + r.amount, 0);
  const collected = RECOVERIES.reduce((s, r) => s + r.collected, 0);
  return (
    <AutomationPage
      title="Revenue Recovery Workflow"
      description="Turn every leakage opportunity into an action record with owner, method, and collected-vs-expected tracking."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Open opportunity" value={currency(totalOpportunity)} tone="warning" />
        <Kpi label="Collected" value={currency(collected)} tone="success" />
        <Kpi label="Median confidence" value="88%" />
      </section>

      <div className="grid gap-3 xl:grid-cols-2">
        {RECOVERIES.map((r) => (
          <Card key={r.id} className="border-border/70 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{r.client}</div>
                <div className="text-[11.5px] text-muted-foreground">{r.source}</div>
              </div>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase",
                  STATUS_META[r.status].tone,
                )}
              >
                {STATUS_META[r.status].label}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="font-tabular text-2xl font-bold">{currency(r.amount)}</div>
              <div className="text-[11px] text-muted-foreground">Confidence {r.confidence}%</div>
            </div>
            <div className="mt-2 text-[12px] text-muted-foreground">
              Owner {r.owner} · {r.action}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-7">
                Verify
              </Button>
              <Button size="sm" variant="outline" className="h-7">
                Create invoice
              </Button>
              <Button size="sm" variant="outline" className="h-7">
                Add to next invoice
              </Button>
              <Button size="sm" variant="outline" className="h-7">
                Contact client
              </Button>
              <Button size="sm" variant="outline" className="h-7">
                Dismiss
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AutomationPage>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-tabular text-[22px] font-bold",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </div>
    </Card>
  );
}
