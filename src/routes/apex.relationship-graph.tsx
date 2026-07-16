import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mock/finance";
import {
  GRAPH_NODES,
  GRAPH_EDGES,
  GRAPH_NODE_TYPES,
  NODE_TYPE_COLOR,
  ASK_LEDGEROS_GRAPH,
  type GraphNode,
  type GraphNodeType,
} from "@/lib/mock/apex-relationship-graph";
import { AskLedgerOS, KVRow } from "@/components/apex/experience-kit";

export const Route = createFileRoute("/apex/relationship-graph")({
  head: () => ({
    meta: [
      { title: "Financial Relationship Graph — Project APEX" },
      {
        name: "description",
        content:
          "Visualize how clients, invoices, payments, employees, vendors, campaigns, and decisions connect.",
      },
    ],
  }),
  component: GraphPage,
});

function GraphPage() {
  const [mode, setMode] = useState<"graph" | "list">("graph");
  const [types, setTypes] = useState<Set<GraphNodeType>>(new Set(GRAPH_NODE_TYPES));
  const [selected, setSelected] = useState<GraphNode | null>(GRAPH_NODES[1] ?? null);

  const visibleNodes = GRAPH_NODES.filter((n) => types.has(n.type));
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = GRAPH_EDGES.filter(
    (e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to),
  );

  function toggleType(t: GraphNodeType) {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <ApexPage
      title="Financial Relationship Graph"
      description="Explore financial connections between every record. Toggle to List View for keyboard and screen-reader use."
      decision="How are these records financially connected?"
    >
      <ApexSection title="Filters">
        <div className="flex flex-wrap items-center gap-1.5">
          {GRAPH_NODE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                types.has(t)
                  ? "border-foreground/40 bg-background text-foreground"
                  : "border-dashed border-border/60 bg-transparent text-muted-foreground opacity-60",
              )}
              style={
                types.has(t) ? { boxShadow: `inset 0 -2px 0 ${NODE_TYPE_COLOR[t]}` } : undefined
              }
            >
              {t}
            </button>
          ))}
          <div className="ml-auto flex overflow-hidden rounded-full border border-border/70 text-[11.5px]">
            {(["graph", "list"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-3 py-1 font-medium",
                  mode === m
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground",
                )}
              >
                {m === "graph" ? "Graph View" : "List View"}
              </button>
            ))}
          </div>
        </div>
      </ApexSection>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <ApexSection title={mode === "graph" ? "Graph" : "List (accessible alternative)"}>
          {mode === "graph" ? (
            <Card className="overflow-hidden border-border/70 bg-slate-950 p-0">
              <svg
                viewBox="0 0 800 520"
                className="h-[520px] w-full"
                role="img"
                aria-label="Financial relationship graph — demonstration data"
              >
                <defs>
                  <marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.55)" />
                  </marker>
                </defs>
                {visibleEdges.map((e, i) => {
                  const from = GRAPH_NODES.find((n) => n.id === e.from)!;
                  const to = GRAPH_NODES.find((n) => n.id === e.to)!;
                  return (
                    <line
                      key={i}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="rgba(148,163,184,0.35)"
                      strokeWidth={1.25}
                      markerEnd="url(#arr)"
                    />
                  );
                })}
                {visibleNodes.map((n) => (
                  <g
                    key={n.id}
                    transform={`translate(${n.x}, ${n.y})`}
                    onClick={() => setSelected(n)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={n.risk === "high" ? 14 : n.amount && n.amount > 100000 ? 12 : 9}
                      fill={NODE_TYPE_COLOR[n.type]}
                      opacity={selected?.id === n.id ? 1 : 0.85}
                      stroke={selected?.id === n.id ? "white" : "rgba(15,23,42,0.4)"}
                      strokeWidth={selected?.id === n.id ? 2 : 1}
                    />
                    <text
                      x={0}
                      y={-16}
                      textAnchor="middle"
                      fill="rgba(226,232,240,0.95)"
                      fontSize={10}
                      fontWeight={600}
                    >
                      {n.label.length > 22 ? n.label.slice(0, 22) + "…" : n.label}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="border-t border-slate-800 bg-slate-900/80 px-3 py-2 text-[10.5px] text-slate-400">
                Demonstration graph. Every node also appears in the accessible List View.
              </div>
            </Card>
          ) : (
            <Card className="border-border/70 p-0">
              <table className="w-full text-[12px]">
                <thead className="bg-muted text-left text-[10.5px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Node</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Risk</th>
                    <th className="px-3 py-2">Connections</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleNodes.map((n) => {
                    const connections = visibleEdges.filter(
                      (e) => e.from === n.id || e.to === n.id,
                    ).length;
                    return (
                      <tr key={n.id} className="border-t border-border/50 hover:bg-muted/40">
                        <td className="px-3 py-2">
                          <button
                            className="font-medium text-foreground hover:text-info"
                            onClick={() => setSelected(n)}
                          >
                            {n.label}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{n.type}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {n.amount ? currency(n.amount) : "—"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{n.risk ?? "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{connections}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </ApexSection>

        <aside className="space-y-3">
          {selected && (
            <Card className="border-border/70 p-4">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                {selected.type}
              </div>
              <div className="text-[15px] font-semibold text-foreground">{selected.label}</div>
              <div className="mt-2">
                {typeof selected.amount === "number" && (
                  <KVRow k="Amount" v={currency(selected.amount)} />
                )}
                {selected.status && <KVRow k="Status" v={selected.status} />}
                {selected.risk && <KVRow k="Risk" v={selected.risk} />}
                {selected.owner && <KVRow k="Owner" v={selected.owner} />}
              </div>
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
                {selected.relatedDna && (
                  <Link
                    to="/apex/financial-dna/$id"
                    params={{ id: selected.relatedDna }}
                    className="rounded-full border border-border/60 px-2 py-1 hover:bg-info/5"
                  >
                    View DNA
                  </Link>
                )}
                {selected.relatedOpportunity && (
                  <Link
                    to="/apex/opportunities/$id"
                    params={{ id: selected.relatedOpportunity }}
                    className="rounded-full border border-border/60 px-2 py-1 hover:bg-info/5"
                  >
                    Open opportunity
                  </Link>
                )}
                <Link
                  to="/apex/digital-twin"
                  className="rounded-full border border-border/60 px-2 py-1 hover:bg-info/5"
                >
                  Simulate decision
                </Link>
              </div>
            </Card>
          )}
          <AskLedgerOS prompts={ASK_LEDGEROS_GRAPH} />
        </aside>
      </div>
    </ApexPage>
  );
}
