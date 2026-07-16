import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ConfidenceChip, DemoBadge, TrendChip } from "@/components/apex/chips";
import { APEX_HEALTH } from "@/lib/mock/apex-pulses";

export const Route = createFileRoute("/apex/company-health")({
  head: () => ({ meta: [{ title: "Company Health — Project APEX" }] }),
  component: CompanyHealthPage,
});

function CompanyHealthPage() {
  return (
    <ApexPage
      title="Company Health"
      description="Explainable composite score across cash, growth, profitability, collections, technology, marketing, people, compliance, data quality, controls, integration health, and risk."
      decision="What is financially unhealthy, and what would improve the score?"
    >
      <ApexSection title="Overall health (demonstration framework)">
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-info/25 blur-3xl"
          />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/60">
                Overall Company Health
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <div className="text-[48px] font-semibold leading-none">{APEX_HEALTH.grade}</div>
                <div className="text-[22px] font-semibold tabular-nums text-white/90">
                  {APEX_HEALTH.score}
                  <span className="text-[14px] text-white/60">/100</span>
                </div>
                <TrendChip delta={APEX_HEALTH.trend} suffix=" pts" />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-white/70">
                <span className="rounded-full bg-white/10 px-2 py-0.5">
                  Stress · {APEX_HEALTH.stress}
                </span>
                <ConfidenceChip value={APEX_HEALTH.confidence} />
                <DemoBadge />
              </div>
            </div>
            <div className="max-w-md text-[12.5px] leading-relaxed text-white/80">
              A higher score requires resolving one unreconciled account, addressing two
              declining-margin clients, filing two open sales-tax returns, and consolidating three
              unused software seats. Expected lift on full remediation:{" "}
              <span className="font-semibold text-white">+4 pts → 96.</span>
            </div>
          </div>
        </Card>
      </ApexSection>

      <ApexSection
        title="Component sub-scores"
        description="Each component publishes score, drivers, detractors, weight, and expected lift on remediation."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {APEX_HEALTH.components.map((c) => (
            <Card key={c.key} className="border-border/70 p-3">
              <div className="flex items-baseline justify-between">
                <div className="text-[13px] font-semibold">{c.key}</div>
                <div className="text-[11px] text-muted-foreground">weight {c.weight}%</div>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-[20px] font-semibold tabular-nums">{c.score}</div>
                <div className="text-[11px] text-muted-foreground">/100</div>
              </div>
              <Progress value={c.score} className="mt-1 h-1.5" />
              <div className="mt-2 space-y-1 text-[11.5px]">
                <div>
                  <span className="font-semibold text-success">Driver · </span>
                  <span className="text-foreground/80">{c.driver}</span>
                </div>
                <div>
                  <span className="font-semibold text-destructive">Detractor · </span>
                  <span className="text-foreground/80">{c.detract}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ApexSection>

      <ApexSection title="Standards every component must publish">
        <ul className="list-disc space-y-1 pl-5 text-[12.5px] text-muted-foreground">
          <li>0–100 sub-score with weight</li>
          <li>Drivers lifting the score, detractors lowering it</li>
          <li>Evidence records linking back to source data</li>
          <li>Expected lift if recommended actions are taken</li>
          <li>Trend vs prior period and rolling four periods</li>
          <li>Confidence and data freshness</li>
        </ul>
      </ApexSection>
    </ApexPage>
  );
}
