import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apex/company-health")({
  head: () => ({ meta: [{ title: "Company Health — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Company Health"
      description="Explainable composite score across cash, growth, profitability, collections, technology, marketing, people, compliance, data quality, controls, integration health, and risk."
      decision="What is financially unhealthy, and what would improve the score?"
    >
      <ApexSection title="Scoring framework (demonstration)">
        <Card className="border-border/70 p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 text-[12.5px]">
            {[
              ["Cash", 15],
              ["Growth", 12],
              ["Profitability", 15],
              ["Collections", 10],
              ["Technology", 6],
              ["Marketing", 8],
              ["People", 10],
              ["Compliance", 8],
              ["Data Quality", 6],
              ["Controls", 5],
              ["Integration Health", 3],
              ["Risk", 2],
            ].flatMap(([label, w]) => [
              <div key={String(label) + "l"}>{label as string}</div>,
              <div key={String(label) + "w"} className="text-right font-mono text-muted-foreground">
                {w as number}%
              </div>,
            ])}
          </div>
        </Card>
      </ApexSection>

      <ApexSection title="Each component must publish">
        <ul className="list-disc space-y-1 pl-5 text-[12.5px] text-muted-foreground">
          <li>0–100 sub-score</li>
          <li>Drivers (what is lifting the score)</li>
          <li>Detractors (what is lowering the score)</li>
          <li>Evidence records</li>
          <li>Expected lift if recommended actions are taken</li>
          <li>Trend vs prior period</li>
          <li>Confidence and data freshness</li>
        </ul>
      </ApexSection>
    </ApexPage>
  ),
});
