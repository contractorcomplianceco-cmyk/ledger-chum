import { createFileRoute, Link } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { SCENARIOS, BASELINE } from "@/lib/mock/apex-digital-twin";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/apex/digital-twin/scenarios")({
  head: () => ({ meta: [{ title: "Scenarios — Digital Twin" }] }),
  component: ScenarioIndex,
});

function ScenarioIndex() {
  return (
    <ApexPage
      title="Scenario Library"
      description="Every demonstration scenario in the Digital Twin catalog."
      decision="Which decisions should we model?"
    >
      <ApexSection title="Catalog">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {SCENARIOS.map((s) => {
            const delta = s.outputs12mo.netIncome - BASELINE.netIncome;
            return (
              <Link key={s.id} to="/apex/digital-twin/scenarios/$id" params={{ id: s.id }}>
                <Card className="border-border/70 p-3 hover:border-info/60">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{s.band}</div>
                  <div className="text-[13px] font-semibold text-foreground">{s.title}</div>
                  <div className={cn("mt-1 text-[11.5px] font-semibold tabular-nums", delta >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {delta >= 0 ? "+" : ""}{currency(delta)} · 12-mo net income
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </ApexSection>
    </ApexPage>
  );
}
