import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mock/finance";
import {
  OPPORTUNITIES,
  OPP_KPI_TOTALS,
  OPP_VIEWS,
  filterOpps,
  ASK_LEDGEROS_OPPORTUNITIES,
  type OppView,
} from "@/lib/mock/apex-opportunities";
import { OpportunityCard, AskLedgerOS, ExperienceStat } from "@/components/apex/experience-kit";

export const Route = createFileRoute("/apex/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunity Engine — Project APEX" },
      {
        name: "description",
        content:
          "Continuously surfaces revenue, margin, cost, cash, and growth opportunities with evidence, confidence, and approval.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const [view, setView] = useState<OppView>("Highest Impact");
  const [q, setQ] = useState("");
  const list = filterOpps(view).filter(
    (o) =>
      !q ||
      o.title.toLowerCase().includes(q.toLowerCase()) ||
      o.subject.toLowerCase().includes(q.toLowerCase()) ||
      o.category.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <ApexPage
      title="Opportunity Engine"
      description="Continuously surface revenue, margin, cost, cash, and growth opportunities — each with evidence, confidence, effort, and required approval."
      decision="What is the highest-leverage next action?"
    >
      <ApexSection title="Portfolio">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <ExperienceStat
            label="Total identified"
            value={currency(OPP_KPI_TOTALS.identified)}
            tone="info"
            hint={`${OPPORTUNITIES.length} opportunities`}
          />
          <ExperienceStat
            label="High-confidence"
            value={currency(OPP_KPI_TOTALS.highConfidence)}
            tone="success"
            hint="≥ 80% confidence"
          />
          <ExperienceStat label="Revenue recovery" value={currency(OPP_KPI_TOTALS.revenue)} />
          <ExperienceStat label="Cost savings" value={currency(OPP_KPI_TOTALS.cost)} />
          <ExperienceStat
            label="Cash improvement"
            value={currency(OPP_KPI_TOTALS.cash)}
            tone="info"
          />
          <ExperienceStat label="Margin lift" value={currency(OPP_KPI_TOTALS.margin)} />
          <ExperienceStat label="Growth" value={currency(OPP_KPI_TOTALS.growth)} />
          <ExperienceStat label="Open" value={String(OPP_KPI_TOTALS.open)} />
          <ExperienceStat
            label="Accepted / active"
            value={String(OPP_KPI_TOTALS.accepted)}
            tone="success"
          />
          <ExperienceStat
            label="Realized value"
            value={currency(OPP_KPI_TOTALS.realized)}
            hint="Post-outcome"
          />
        </div>
      </ApexSection>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {OPP_VIEWS.map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11.5px] font-medium transition",
                    view === v
                      ? "border-info bg-info text-info-foreground"
                      : "border-border/70 bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, client, category…"
              className="h-8 max-w-xs text-[12px]"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {list.map((o) => (
              <OpportunityCard key={o.id} o={o} />
            ))}
            {list.length === 0 && (
              <Card className="col-span-full border-dashed p-6 text-center text-[12.5px] text-muted-foreground">
                No opportunities match this view.
              </Card>
            )}
          </div>
        </div>

        <aside className="space-y-3">
          <AskLedgerOS prompts={ASK_LEDGEROS_OPPORTUNITIES} />
          <Card className="border-border/70 p-4">
            <div className="text-[12.5px] font-semibold text-foreground">Cross-experience</div>
            <ul className="mt-2 space-y-1 text-[11.5px]">
              <li>
                <Link to="/apex/financial-dna" className="text-info hover:underline">
                  Follow the dollar → Financial DNA
                </Link>
              </li>
              <li>
                <Link to="/apex/relationship-graph" className="text-info hover:underline">
                  See related records → Relationship Graph
                </Link>
              </li>
              <li>
                <Link to="/apex/timeline" className="text-info hover:underline">
                  Chronology → Financial Timeline
                </Link>
              </li>
              <li>
                <Link to="/apex/digital-twin" className="text-info hover:underline">
                  Model impact → Digital Twin
                </Link>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </ApexPage>
  );
}
