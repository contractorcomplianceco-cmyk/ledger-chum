import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mock/finance";
import {
  DNA_NODES,
  DNA_SUBJECTS,
  ASK_LEDGEROS_DNA,
  type Classification,
  type DnaNode,
} from "@/lib/mock/apex-financial-dna";
import { ConfidenceChip, FreshnessChip } from "@/components/apex/chips";
import { AskLedgerOS, KVRow } from "@/components/apex/experience-kit";

export const Route = createFileRoute("/apex/financial-dna")({
  head: () => ({
    meta: [
      { title: "Financial DNA — Project APEX" },
      {
        name: "description",
        content:
          "Trace every dollar from source through allocation, cost, and profit to reserves and distributions.",
      },
    ],
  }),
  component: DnaPage,
});

const CLASS_TONE: Record<Classification, string> = {
  available: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700",
  restricted: "border-rose-500/50 bg-rose-500/10 text-rose-700",
  reserved: "border-amber-500/50 bg-amber-500/10 text-amber-700",
  distributed: "border-sky-500/50 bg-sky-500/10 text-sky-700",
};

function DnaNodeCard({ n, onOpen }: { n: DnaNode; onOpen: (n: DnaNode) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(n)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border bg-surface p-3 text-left transition hover:border-info/60 hover:shadow-card",
        CLASS_TONE[n.classification],
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide opacity-80">
          {n.stage}
        </div>
        <div className="mt-0.5 truncate text-[13px] font-semibold text-foreground">{n.label}</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <ConfidenceChip value={n.confidence} />
          <FreshnessChip label={n.freshness} />
          <span className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium">
            {n.classification}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[14px] font-bold text-foreground tabular-nums">
          {currency(n.amount)}
        </div>
        <div className="text-[10.5px] text-muted-foreground">
          {n.pctOfOrigin.toFixed(1)}% of origin
        </div>
      </div>
    </button>
  );
}

function DnaPage() {
  const [selected, setSelected] = useState<DnaNode | null>(DNA_NODES[6] ?? null);

  const stages: DnaNode["stage"][] = [
    "Client",
    "Contract",
    "Service",
    "Invoice",
    "Payment",
    "Pass-Through",
    "Revenue",
    "Commission",
    "Payroll",
    "Technology",
    "Marketing",
    "Overhead",
    "Direct Cost",
    "Contribution Profit",
    "Tax Reserve",
    "Profit Share",
    "Retained Earnings",
    "Owner Distribution",
  ];

  return (
    <ApexPage
      title="Financial DNA"
      description="Follow every dollar from origin to outcome. Each node carries source, freshness, confidence, and audit status."
      decision="Where did this dollar come from and where did it go?"
    >
      <ApexSection title="Subject">
        <div className="flex flex-wrap gap-1.5">
          {DNA_SUBJECTS.map((s) => (
            <Link
              key={s.id}
              to="/apex/financial-dna/$id"
              params={{ id: s.id }}
              className="rounded-full border border-border/70 bg-background px-3 py-1 text-[11.5px] font-medium text-foreground hover:border-info/50 hover:bg-info/5"
            >
              {s.label}
              <span className="ml-1 text-[10px] text-muted-foreground">{s.type}</span>
            </Link>
          ))}
        </div>
      </ApexSection>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <ApexSection
          title="Flow — ALD Holdings · $100,000"
          description="Nodes colored by classification (available, restricted, reserved, distributed). Click any node for evidence."
        >
          <div className="space-y-2">
            {stages.map((stage) => {
              const nodes = DNA_NODES.filter((n) => n.stage === stage);
              if (nodes.length === 0) return null;
              return (
                <div key={stage} className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {nodes.map((n) => (
                    <DnaNodeCard key={n.id} n={n} onOpen={setSelected} />
                  ))}
                </div>
              );
            })}
          </div>
        </ApexSection>

        <aside className="space-y-3">
          {selected && (
            <Card className="border-border/70 p-4">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                {selected.stage}
              </div>
              <div className="text-[15px] font-semibold text-foreground">{selected.label}</div>
              <div className="mt-1 text-[18px] font-bold tabular-nums text-foreground">
                {currency(selected.amount)}
              </div>
              <div className="mt-3">
                <KVRow k="Classification" v={selected.classification} />
                <KVRow k="% of origin" v={`${selected.pctOfOrigin.toFixed(2)}%`} />
                <KVRow k="Source" v={selected.source} />
                <KVRow k="Freshness" v={selected.freshness} />
                <KVRow k="Confidence" v={`${selected.confidence}%`} />
                <KVRow k="Audit" v={selected.auditStatus} />
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground">{selected.explanation}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                {selected.relatedTimeline && (
                  <Link
                    to="/apex/timeline/$id"
                    params={{ id: selected.relatedTimeline }}
                    className="rounded-full border border-border/60 px-2 py-1 hover:bg-info/5"
                  >
                    Open timeline
                  </Link>
                )}
                {selected.relatedOpportunity && (
                  <Link
                    to="/apex/opportunities/$id"
                    params={{ id: selected.relatedOpportunity }}
                    className="rounded-full border border-border/60 px-2 py-1 hover:bg-info/5"
                  >
                    View opportunity
                  </Link>
                )}
                {selected.relatedGraphNode && (
                  <Link
                    to="/apex/relationship-graph"
                    className="rounded-full border border-border/60 px-2 py-1 hover:bg-info/5"
                  >
                    Open graph
                  </Link>
                )}
                <Link
                  to="/apex/digital-twin"
                  className="rounded-full border border-border/60 px-2 py-1 hover:bg-info/5"
                >
                  Simulate change
                </Link>
              </div>
            </Card>
          )}
          <AskLedgerOS prompts={ASK_LEDGEROS_DNA} />
        </aside>
      </div>
    </ApexPage>
  );
}
