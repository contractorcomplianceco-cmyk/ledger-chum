import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { INTEGRATIONS_HEALTH } from "@/lib/mock/automation";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export const Route = createFileRoute("/automation/integration-health")({
  head: () => ({ meta: [{ title: "Integration Health — LedgerOS" }] }),
  component: IntegrationHealthPage,
});

function IntegrationHealthPage() {
  const healthy = INTEGRATIONS_HEALTH.filter((i) => i.status === "healthy").length;
  const degraded = INTEGRATIONS_HEALTH.filter((i) => i.status === "degraded").length;
  const down = INTEGRATIONS_HEALTH.filter((i) => i.status === "down").length;

  return (
    <AutomationPage
      title="Integration Health"
      description="Live status of every connected source — banking, payroll, ads, subscriptions. Failures create exceptions and block automations that depend on them."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Healthy" value={String(healthy)} tone="success" />
        <Kpi label="Degraded" value={String(degraded)} tone="warning" />
        <Kpi label="Down" value={String(down)} tone="destructive" />
      </section>

      <Card className="border-border/70 p-0">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Integration</span>
          <span>Status</span>
          <span>Last sync</span>
          <span>Errors 24h</span>
          <span>Latency</span>
          <span>Action</span>
        </div>
        {INTEGRATIONS_HEALTH.map((i) => (
          <div key={i.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 border-b border-border px-4 py-3 text-[12.5px] last:border-b-0">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-[11px] text-muted-foreground">{i.recordsSynced} records synced today</div>
            </div>
            <span className={cn(
              "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase w-fit",
              i.status === "healthy" && "border-success/30 bg-success/10 text-success",
              i.status === "degraded" && "border-warning/30 bg-warning/10 text-warning",
              i.status === "down" && "border-destructive/30 bg-destructive/10 text-destructive",
            )}>{i.status}</span>
            <span className="text-[11.5px] text-muted-foreground">{i.lastSync}</span>
            <span className={cn("font-tabular", i.errors24h > 5 ? "text-destructive" : i.errors24h > 0 ? "text-warning" : "text-muted-foreground")}>{i.errors24h}</span>
            <span className="font-tabular text-[11.5px] text-muted-foreground">{i.latencyMs ? `${i.latencyMs} ms` : "—"}</span>
            <Button size="sm" variant="outline" className="h-7"><RefreshCw className="mr-1 h-3 w-3" /> Sync</Button>
          </div>
        ))}
      </Card>
    </AutomationPage>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "destructive" }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-tabular text-[22px] font-bold",
        tone === "success" && "text-success", tone === "warning" && "text-warning", tone === "destructive" && "text-destructive")}>{value}</div>
    </Card>
  );
}
