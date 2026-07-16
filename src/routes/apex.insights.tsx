import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useAnomalyAdapter,
  useRecommendationAdapter,
  useExplanationAdapter,
  useHealthAdapter,
  useCloseAdapter,
  filterByAudience,
  type ApexAudience,
  type IntelligenceItem,
} from "@/lib/intelligence/adapters";

export const Route = createFileRoute("/apex/insights")({
  head: () => ({
    meta: [
      { title: "APEX Insights — LedgerOS Intelligence" },
      {
        name: "description",
        content:
          "Unified intelligence feed: explanations, anomalies, recommendations, opportunities, and risks — every item carries evidence, confidence, and freshness.",
      },
    ],
  }),
  component: ApexInsightsPage,
});

const AUDIENCES: { id: ApexAudience; label: string }[] = [
  { id: "owner", label: "Owner" },
  { id: "accounting", label: "Accounting" },
  { id: "sales", label: "Sales" },
  { id: "systems", label: "Systems" },
  { id: "team", label: "Team" },
];

const KIND_FILTERS = [
  { id: "all", label: "All" },
  { id: "anomaly", label: "Anomalies" },
  { id: "recommendation", label: "Recommendations" },
  { id: "explanation", label: "Explanations" },
  { id: "health", label: "Company Health" },
  { id: "close", label: "Close" },
] as const;

function ApexInsightsPage() {
  const [audience, setAudience] = useState<ApexAudience>("owner");
  const [kind, setKind] = useState<(typeof KIND_FILTERS)[number]["id"]>("all");

  const anomalies = useAnomalyAdapter({ status: "open" });
  const recs = useRecommendationAdapter({ state: "all", limit: 100 });
  const expl = useExplanationAdapter({ limit: 30 });
  const health = useHealthAdapter();
  const close = useCloseAdapter();

  const merged: IntelligenceItem[] = useMemo(() => {
    const all: IntelligenceItem[] = [
      ...(health.data ? [health.data] : []),
      ...(close.data ? [close.data] : []),
      ...anomalies.data,
      ...recs.data,
      ...expl.data,
    ];
    const scoped = filterByAudience(all, audience);
    const byKind = kind === "all" ? scoped : scoped.filter((i) => i.kind === kind);
    return byKind.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  }, [audience, kind, anomalies.data, recs.data, expl.data, health.data, close.data]);

  const anyDemo = anomalies.isDemo || recs.isDemo || expl.isDemo || health.isDemo || close.isDemo;

  return (
    <ApexPage
      title="APEX Insights"
      description="Unified intelligence feed sourced through the LedgerOS Canonical Metrics + Intelligence Services layers. APEX never reads accounting tables directly."
      decision="What decisions do I need to make today — and what evidence do I have?"
    >
      <ApexSection title="Audience & filters">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Audience
          </span>
          {AUDIENCES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAudience(a.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] font-medium",
                audience === a.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border/70 text-foreground/70 hover:bg-muted",
              )}
            >
              {a.label}
            </button>
          ))}
          <span className="ml-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Kind
          </span>
          {KIND_FILTERS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] font-medium",
                kind === k.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border/70 text-foreground/70 hover:bg-muted",
              )}
            >
              {k.label}
            </button>
          ))}
          {anyDemo && (
            <span className="ml-auto rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              Demonstration mode — no active org context
            </span>
          )}
        </div>
      </ApexSection>

      <ApexSection title={`Feed · ${merged.length} items`}>
        <div className="grid gap-3">
          {merged.length === 0 && (
            <Card className="border-border/70 p-6 text-center text-[13px] text-muted-foreground">
              No intelligence items for this audience/kind combination.
            </Card>
          )}
          {merged.map((item) => (
            <InsightCard key={`${item.kind}:${item.id}`} item={item} />
          ))}
        </div>
      </ApexSection>
    </ApexPage>
  );
}

function InsightCard({ item }: { item: IntelligenceItem }) {
  const kindColor: Record<IntelligenceItem["kind"], string> = {
    metric: "bg-blue-50 text-blue-700 border-blue-200",
    anomaly: "bg-rose-50 text-rose-700 border-rose-200",
    recommendation: "bg-emerald-50 text-emerald-700 border-emerald-200",
    explanation: "bg-violet-50 text-violet-700 border-violet-200",
    health: "bg-indigo-50 text-indigo-700 border-indigo-200",
    close: "bg-amber-50 text-amber-800 border-amber-200",
  };
  const freshTone =
    item.freshness === "fresh"
      ? "text-success"
      : item.freshness === "delayed"
        ? "text-warning"
        : "text-destructive";

  return (
    <Card className="border-border/70 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide",
            kindColor[item.kind],
          )}
        >
          {item.kind}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-[14px] font-semibold text-foreground">{item.title}</div>
            {item.displayValue && (
              <div className="font-tabular text-[15px] font-bold text-foreground">
                {item.displayValue}
              </div>
            )}
          </div>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
            {item.summary}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <span className="text-muted-foreground">
              Confidence{" "}
              <span className="font-semibold text-foreground">
                {Math.round((item.confidence ?? 0) * 100)}%
              </span>
            </span>
            <span className={cn("font-semibold", freshTone)}>{item.freshness}</span>
            {item.sourceMetricKey && (
              <span className="text-muted-foreground">
                Source <span className="font-mono text-foreground">{item.sourceMetricKey}</span>
              </span>
            )}
            {item.severity && item.severity !== "info" && (
              <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground/80">
                {item.severity}
              </span>
            )}
            {item.demonstrationOnly && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                demo
              </span>
            )}
          </div>

          {item.evidence.length > 0 && (
            <div className="mt-2">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Evidence
              </div>
              <ul className="mt-1 grid gap-1 sm:grid-cols-2">
                {item.evidence.slice(0, 6).map((e, i) => (
                  <li
                    key={i}
                    className="truncate rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-[11.5px]"
                  >
                    <span className="text-foreground">{e.label}</span>
                    {e.value != null && (
                      <span className="ml-1 font-mono text-muted-foreground">· {e.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(item.recommendedAction || item.approvalRequirement) && (
            <div className="mt-2 rounded-md border border-border/70 bg-surface p-2 text-[12px]">
              {item.recommendedAction && (
                <div>
                  <span className="font-semibold text-foreground">Recommended action: </span>
                  {item.recommendedAction}
                </div>
              )}
              {item.approvalRequirement && (
                <div className="mt-0.5 text-muted-foreground">
                  Approval: {item.approvalRequirement}
                </div>
              )}
            </div>
          )}

          {(item.assumptions.length > 0 || item.missingData.length > 0) && (
            <div className="mt-2 grid gap-2 text-[11.5px] sm:grid-cols-2">
              {item.assumptions.length > 0 && (
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Assumptions
                  </div>
                  <ul className="mt-0.5 list-disc pl-4 text-muted-foreground">
                    {item.assumptions.slice(0, 4).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.missingData.length > 0 && (
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Missing data
                  </div>
                  <ul className="mt-0.5 list-disc pl-4 text-muted-foreground">
                    {item.missingData.slice(0, 4).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="h-8 text-[12px]" disabled>
          Advisory only
        </Button>
      </div>
    </Card>
  );
}
