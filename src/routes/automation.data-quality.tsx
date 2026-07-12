import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DATA_QUALITY } from "@/lib/mock/automation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/automation/data-quality")({
  head: () => ({ meta: [{ title: "Data Quality Center — LedgerOS" }] }),
  component: DataQualityPage,
});

function DataQualityPage() {
  const total = DATA_QUALITY.reduce((s, i) => s + i.count, 0);
  const highImpact = DATA_QUALITY.filter((i) => i.impact === "high").reduce((s, i) => s + i.count, 0);

  return (
    <AutomationPage
      title="Data Quality Center"
      description="Every unmapped account, orphan expense, duplicate vendor, and stale record — grouped by category, owned by a person, resolvable in one place."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Total issues" value={String(total)} />
        <Kpi label="High impact" value={String(highImpact)} tone="destructive" />
        <Kpi label="Categories" value={String(DATA_QUALITY.length)} />
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DATA_QUALITY.map((i) => (
          <Card key={i.id} className="border-border/70 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold">{i.category}</div>
              <span className={cn(
                "rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                i.impact === "high" && "border-destructive/30 bg-destructive/10 text-destructive",
                i.impact === "medium" && "border-warning/30 bg-warning/10 text-warning",
                i.impact === "low" && "border-border bg-muted/40 text-muted-foreground",
              )}>{i.impact}</span>
            </div>
            <div className="mt-2 font-tabular text-3xl font-bold">{i.count}</div>
            <div className="mt-1 text-[11.5px] text-muted-foreground">{i.example}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Owner · {i.owner}</div>
            <div className="mt-3 flex gap-1.5">
              <Button size="sm" variant="outline" className="h-7">Open</Button>
              <Button size="sm" variant="outline" className="h-7">Auto-fix suggestions</Button>
            </div>
          </Card>
        ))}
      </div>
    </AutomationPage>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "destructive" }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-tabular text-[22px] font-bold", tone === "destructive" && "text-destructive")}>{value}</div>
    </Card>
  );
}
