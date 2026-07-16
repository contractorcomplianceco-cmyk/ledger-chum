import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mock/finance";
import { SCENARIOS, BASELINE, type ScenarioOutputs } from "@/lib/mock/apex-digital-twin";
import { AskLedgerOS, CrossExperienceLinks } from "@/components/apex/experience-kit";
import { toast } from "sonner";
import { DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";

export const Route = createFileRoute("/apex/digital-twin/scenarios/$id")({
  head: () => ({ meta: [{ title: "Scenario — Digital Twin" }] }),
  component: ScenarioDetail,
});

const METRIC_ROWS: Array<{
  key: keyof ScenarioOutputs;
  label: string;
  fmt: "$" | "n" | "%" | "mo";
}> = [
  { key: "trueAvailableCash", label: "True Available Cash", fmt: "$" },
  { key: "revenue", label: "Revenue", fmt: "$" },
  { key: "grossProfit", label: "Gross Profit", fmt: "$" },
  { key: "contributionProfit", label: "Contribution Profit", fmt: "$" },
  { key: "netIncome", label: "Net Income", fmt: "$" },
  { key: "payroll", label: "Payroll", fmt: "$" },
  { key: "compensationObligations", label: "Compensation Obligations", fmt: "$" },
  { key: "taxReserves", label: "Tax Reserves", fmt: "$" },
  { key: "profitSharingObligations", label: "Profit-Sharing Obligations", fmt: "$" },
  { key: "runwayMonths", label: "Runway (months)", fmt: "mo" },
  { key: "hiringCapacity", label: "Hiring Capacity", fmt: "n" },
  { key: "companyHealth", label: "Company Health", fmt: "n" },
  { key: "financialConfidence", label: "Financial Confidence", fmt: "%" },
  { key: "risk", label: "Risk Index", fmt: "n" },
  { key: "opportunityValue", label: "Opportunity Value", fmt: "$" },
];

function fmt(v: number, kind: "$" | "n" | "%" | "mo") {
  if (kind === "$") return currency(v);
  if (kind === "%") return `${v}%`;
  if (kind === "mo") return `${v} mo`;
  return String(v);
}

function ScenarioDetail() {
  const { id } = Route.useParams();
  const s = SCENARIOS.find((x) => x.id === id);
  if (!s) throw notFound();
  const demo = (label: string) => toast(label, { description: DEMO_ACTION_MESSAGE });

  return (
    <ApexPage
      title={s.title}
      description={`${s.band} scenario · demonstration only — not a production forecast.`}
      decision="Can we afford this?"
      actions={
        <Link to="/apex/digital-twin">
          <Button size="sm" variant="outline">
            <ArrowLeft className="mr-1 h-3 w-3" /> Digital Twin
          </Button>
        </Link>
      }
    >
      <ApexSection title="Assumptions">
        <Card className="border-border/70 p-4">
          <p className="text-[12.5px] text-muted-foreground">{s.description}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[11.5px] text-muted-foreground">
            {s.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Card>
      </ApexSection>

      <ApexSection title="Baseline vs. Proposed">
        <Card className="border-border/70 p-0 overflow-hidden">
          <div className="grid grid-cols-[1.4fr_repeat(4,_1fr)] gap-0 text-[11.5px]">
            <div className="border-b border-border/60 bg-muted px-3 py-2 font-semibold text-muted-foreground">
              Metric
            </div>
            <div className="border-b border-l border-border/60 bg-muted px-3 py-2 font-semibold text-muted-foreground">
              Baseline
            </div>
            <div className="border-b border-l border-border/60 bg-muted px-3 py-2 font-semibold text-muted-foreground">
              30-day
            </div>
            <div className="border-b border-l border-border/60 bg-muted px-3 py-2 font-semibold text-muted-foreground">
              90-day
            </div>
            <div className="border-b border-l border-border/60 bg-muted px-3 py-2 font-semibold text-muted-foreground">
              12-mo
            </div>
            {METRIC_ROWS.map((r) => {
              const base = BASELINE[r.key];
              const p12 = s.outputs12mo[r.key];
              const diff = p12 - base;
              const pctDiff = base === 0 ? 0 : (diff / Math.abs(base)) * 100;
              const positive = diff > 0;
              const negative = diff < 0;
              return (
                <div key={r.key} className="contents">
                  <div className="border-b border-border/40 px-3 py-2 text-foreground">
                    {r.label}
                  </div>
                  <div className="border-b border-l border-border/40 px-3 py-2 tabular-nums text-muted-foreground">
                    {fmt(base, r.fmt)}
                  </div>
                  <div className="border-b border-l border-border/40 px-3 py-2 tabular-nums text-foreground">
                    {fmt(s.outputs30[r.key], r.fmt)}
                  </div>
                  <div className="border-b border-l border-border/40 px-3 py-2 tabular-nums text-foreground">
                    {fmt(s.outputs90[r.key], r.fmt)}
                  </div>
                  <div
                    className={cn(
                      "border-b border-l border-border/40 px-3 py-2 tabular-nums font-semibold",
                      positive && "text-emerald-600",
                      negative && "text-rose-600",
                    )}
                  >
                    {fmt(p12, r.fmt)}
                    <span className="ml-1 text-[10.5px] opacity-70">
                      {positive ? "+" : ""}
                      {pctDiff.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </ApexSection>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <ApexSection title="Approval">
            <Card className="border-info/40 bg-info/5 p-4 text-[12.5px] text-foreground">
              Required approver: <strong>{s.approvalRequired}</strong>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => demo("Converted to recommendation")}>
                  Convert to recommendation
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => demo("Draft action plan created")}
                >
                  Create action plan draft
                </Button>
                <Button size="sm" variant="ghost" onClick={() => demo("Scenario archived")}>
                  Archive
                </Button>
              </div>
              <p className="mt-2 text-[10.5px] text-muted-foreground">
                Digital Twin cannot commit a scenario. Owner approval is required to convert to a
                plan.
              </p>
            </Card>
          </ApexSection>

          <ApexSection title="Cross-experience">
            <CrossExperienceLinks
              opportunityId={s.supportingOpportunities[0]}
              dnaId={s.affectedDnaPaths[0]}
              graphNodeId="entity:llc"
              timelineId="TL-COMPANY"
            />
          </ApexSection>
        </div>
        <AskLedgerOS
          prompts={[
            "Can we afford this?",
            "What is the downside?",
            "What assumptions matter most?",
            "What would improve the outcome?",
          ]}
        />
      </div>
    </ApexPage>
  );
}
