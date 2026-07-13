import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apex/widgets")({
  head: () => ({ meta: [{ title: "Intelligent Widgets — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Intelligent Widget System"
      description="Every pulse widget renders headline value, trend, drivers, risk, forecast, recommended action, confidence, and evidence link. Concrete components ship in APEX 2."
    >
      <ApexSection title="Twelve pulse widgets (planned)">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Cash Pulse", "Bank cash · true available · restricted · committed · reserved · expected collections · upcoming disbursements · 7d/30d forecast · risk · action."],
            ["Profit Pulse", "Gross · operating · net · contribution · margin · prior · target · drivers · pressure · action."],
            ["Growth Pulse", "Revenue · new · renewals · upsells · expansions · lost · pipeline · collected · contribution · risks · opportunities."],
            ["AI Pulse", "New opportunities · savings · risks · open recommendations · accepted · outcomes · confidence · staleness."],
            ["Team Pulse", "Payroll · commissions · bonuses · profit sharing · workforce cost · capacity · hiring · training · travel · trend."],
            ["Collections Pulse", "AR aging · expected · escalations · risk · action."],
            ["Expense Pulse", "Spend · variance · categories · anomalies · action."],
            ["Technology Pulse", "App spend · usage · consolidation savings · risk."],
            ["Marketing Pulse", "Campaign contribution · CAC · payback · pipeline · action."],
            ["Risk Pulse", "Top risks · severity · trend · owner · mitigation."],
            ["Opportunity Pulse", "Impact · effort · confidence · owner · next step."],
            ["Data Confidence Pulse", "Freshness · coverage · reconciliation gaps · integration health."],
          ].map(([t, d]) => (
            <Card key={t} className="border-border/70 p-3">
              <div className="text-[13px] font-semibold">{t}</div>
              <div className="mt-1 text-[12px] text-muted-foreground">{d}</div>
            </Card>
          ))}
        </div>
      </ApexSection>
    </ApexPage>
  ),
});
