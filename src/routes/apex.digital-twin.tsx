import { createFileRoute, Link } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mock/finance";
import { SCENARIOS, ASK_LEDGEROS_TWIN, BASELINE } from "@/lib/mock/apex-digital-twin";
import { AskLedgerOS, ExperienceStat } from "@/components/apex/experience-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apex/digital-twin")({
  head: () => ({
    meta: [
      { title: "Financial Digital Twin — Project APEX" },
      { name: "description", content: "Model business decisions before making them. Demonstration scenarios only." },
    ],
  }),
  component: TwinIndex,
});

function TwinIndex() {
  return (
    <ApexPage
      title="Financial Digital Twin"
      description="Model business decisions across cash, revenue, profit, payroll, tax, runway, and risk. Demonstration scenarios only — not a production forecast."
      decision="If we made this change, what would happen?"
    >
      <ApexSection title="Baseline (current plan)">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <ExperienceStat label="True Available Cash" value={currency(BASELINE.trueAvailableCash)} tone="info" />
          <ExperienceStat label="Revenue (TTM)" value={currency(BASELINE.revenue)} />
          <ExperienceStat label="Net Income" value={currency(BASELINE.netIncome)} tone="success" />
          <ExperienceStat label="Runway" value={`${BASELINE.runwayMonths} mo`} hint="Hiring capacity: 4" />
          <ExperienceStat label="Company Health" value={`${BASELINE.companyHealth}`} tone="success" />
          <ExperienceStat label="Financial Confidence" value={`${BASELINE.financialConfidence}%`} tone="info" />
          <ExperienceStat label="Risk Index" value={`${BASELINE.risk}`} tone="warning" />
          <ExperienceStat label="Opportunity Value" value={currency(BASELINE.opportunityValue)} />
        </div>
      </ApexSection>

      <ApexSection title="Scenarios">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SCENARIOS.map((s) => {
            const delta = s.outputs12mo.netIncome - BASELINE.netIncome;
            const pct = ((s.outputs12mo.netIncome / BASELINE.netIncome - 1) * 100).toFixed(1);
            const positive = delta > 0;
            return (
              <Link
                key={s.id}
                to="/apex/digital-twin/scenarios/$id"
                params={{ id: s.id }}
                className="group"
              >
                <Card className="h-full border-border/70 p-4 transition group-hover:border-info/60 group-hover:shadow-card">
                  <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>{s.band}</span>
                    <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px]">Demo</span>
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-foreground">{s.title}</div>
                  <p className="mt-1 text-[11.5px] text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <div className="text-muted-foreground">12-mo Net</div>
                      <div className={cn("font-bold tabular-nums", positive ? "text-emerald-600" : "text-rose-600")}>
                        {currency(s.outputs12mo.netIncome)}
                      </div>
                      <div className={cn("text-[10px]", positive ? "text-emerald-600" : "text-rose-600")}>
                        {positive ? "+" : ""}{pct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Runway</div>
                      <div className="font-bold tabular-nums text-foreground">{s.outputs12mo.runwayMonths} mo</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Health</div>
                      <div className="font-bold tabular-nums text-foreground">{s.outputs12mo.companyHealth}</div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </ApexSection>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <ApexSection title="Governance" description="What Digital Twin will and will not do.">
          <Card className="border-border/70 p-4 text-[12.5px]">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Demonstration scenario — not a production forecast.</strong>{" "}
              Every output includes assumptions and confidence. AI may explain, rank, and suggest.
              AI cannot commit a scenario, post entries, change compensation, or move money.
            </p>
          </Card>
        </ApexSection>
        <AskLedgerOS prompts={ASK_LEDGEROS_TWIN} />
      </div>
    </ApexPage>
  );
}
