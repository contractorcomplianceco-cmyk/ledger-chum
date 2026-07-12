import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GUARDRAILS, OVERRIDES } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/automation/cash-controls")({
  head: () => ({ meta: [{ title: "Cash Guardrail Center — LedgerOS" }] }),
  component: CashControlsPage,
});

function CashControlsPage() {
  return (
    <AutomationPage
      title="Cash Guardrail Center"
      description="Configurable reserves, ceilings, and approval thresholds. Every override requires reason, approver, expiration, and audit record."
    >
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {GUARDRAILS.map((g) => {
          const pct = Math.min(100, (g.current / g.target) * 100);
          return (
            <Card key={g.id} className="border-border/70 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{g.label}</div>
                <span className={cn(
                  "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase",
                  g.status === "healthy" && "border-success/30 bg-success/10 text-success",
                  g.status === "watch" && "border-warning/30 bg-warning/10 text-warning",
                  g.status === "breach" && "border-destructive/30 bg-destructive/10 text-destructive",
                )}>{g.status}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="font-tabular text-2xl font-bold">{currency(g.current)}</div>
                <div className="text-[11.5px] text-muted-foreground">/ {currency(g.target)}</div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={cn(
                  "h-full",
                  g.status === "healthy" && "bg-success",
                  g.status === "watch" && "bg-warning",
                  g.status === "breach" && "bg-destructive",
                )} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-[11.5px] text-muted-foreground">{g.description}</div>
              <div className="mt-3 flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7">Configure</Button>
                <Button size="sm" variant="outline" className="h-7">Override</Button>
              </div>
            </Card>
          );
        })}
      </section>

      <section>
        <h2 className="mb-2 text-[13px] font-semibold">Active overrides</h2>
        <Card className="border-border/70 p-0">
          <div className="grid grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Guardrail</span>
            <span>Reason</span>
            <span>Approver</span>
            <span>Expires</span>
            <span>Impact</span>
            <span>Audit</span>
          </div>
          {OVERRIDES.map((o) => (
            <div key={o.id} className="grid grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr_auto] items-center gap-2 border-b border-border px-4 py-2.5 text-[12.5px] last:border-b-0">
              <span className="font-medium">{o.guardrail}</span>
              <span className="text-muted-foreground">{o.reason}</span>
              <span>{o.approver}</span>
              <span className="text-muted-foreground">{o.expires}</span>
              <span className="text-warning">{o.impact}</span>
              <span className="font-tabular text-[11px] text-brand">{o.auditId}</span>
            </div>
          ))}
        </Card>
      </section>
    </AutomationPage>
  );
}
