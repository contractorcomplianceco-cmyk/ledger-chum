import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listMetrics,
  getMetricValue,
  getMetricLineage,
  calculateMetric,
} from "@/lib/intelligence/metrics.functions";
import { RefreshCw, ShieldAlert, Gauge, BookMarked } from "lucide-react";

export const Route = createFileRoute("/admin/metrics")({
  head: () => ({
    meta: [
      { title: "Metric Center — LedgerOS" },
      {
        name: "description",
        content:
          "Canonical financial metric registry — definitions, formulas, lineage, freshness, and calculation history.",
      },
      { property: "og:title", content: "Metric Center — LedgerOS" },
    ],
  }),
  component: MetricCenterPage,
});

const FRESHNESS_TONE: Record<string, string> = {
  fresh: "bg-emerald-500/10 text-emerald-500",
  delayed: "bg-amber-500/10 text-amber-500",
  stale: "bg-orange-500/10 text-orange-500",
  unavailable: "bg-red-500/10 text-red-500",
};

function MetricCenterPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);

  const listFn = useServerFn(listMetrics);
  const valueFn = useServerFn(getMetricValue);
  const lineageFn = useServerFn(getMetricLineage);
  const calcFn = useServerFn(calculateMetric);

  const metricsQ = useQuery({
    queryKey: ["metrics", orgId],
    queryFn: () => listFn({ data: { orgId: orgId!, status: "active" } }),
    enabled: !!orgId,
  });

  const metrics = metricsQ.data ?? [];
  const active = useMemo(
    () => metrics.find((m) => m.metric_key === selected) ?? metrics[0],
    [metrics, selected],
  );

  const valueQ = useQuery({
    queryKey: ["metric-value", orgId, active?.id],
    queryFn: () => valueFn({ data: { orgId: orgId!, metricId: active.id, limit: 5 } }),
    enabled: !!orgId && !!active?.id,
  });

  const lineageQ = useQuery({
    queryKey: ["metric-lineage", orgId, active?.id],
    queryFn: () => lineageFn({ data: { orgId: orgId!, metricId: active.id } }),
    enabled: !!orgId && !!active?.id,
  });

  async function handleRecalc() {
    if (!orgId || !active) return;
    try {
      await calcFn({ data: { orgId, metricKey: active.metric_key } });
      toast.success(`Recalculated ${active.metric_name}`);
      qc.invalidateQueries({ queryKey: ["metric-value", orgId, active.id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Calculation failed");
    }
  }

  const latest = (valueQ.data ?? [])[0];
  const history = valueQ.data ?? [];

  const byCategory = useMemo(() => {
    const g: Record<string, (typeof metrics)[number][]> = {};
    for (const m of metrics) (g[m.category] ??= []).push(m);
    return g;
  }, [metrics]);

  return (
    <AppShell>
      <PageHeader
        title="Metric Center"
        description="Canonical financial metrics. Every value carries a formula, lineage, confidence, and freshness signal."
      />
      <PageBody>
        {!orgId ? (
          <Card className="p-6 text-sm text-muted-foreground">
            Sign in to an organization to view the metric registry.
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <Card className="p-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="text-sm font-semibold">Catalog</div>
                <Badge variant="outline" className="text-[10px]">{metrics.length}</Badge>
              </div>
              <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                {Object.entries(byCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {cat.replace(/_/g, " ")}
                    </div>
                    <div className="space-y-1">
                      {items.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelected(m.metric_key)}
                          className={`w-full rounded-md border px-2 py-1.5 text-left text-xs transition ${
                            active?.id === m.id
                              ? "border-primary bg-primary/5"
                              : "border-border/60 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-medium">{m.metric_name}</span>
                            {m.demonstration_only && (
                              <Badge variant="outline" className="text-[9px]">demo</Badge>
                            )}
                          </div>
                          <div className="truncate text-[10px] text-muted-foreground">
                            {m.metric_key}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-4">
              {active ? (
                <>
                  <Card className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          {active.category.replace(/_/g, " ")}
                        </div>
                        <h2 className="text-lg font-semibold">{active.metric_name}</h2>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {active.description}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button size="sm" onClick={handleRecalc}>
                          <RefreshCw className="mr-1 h-3.5 w-3.5" /> Recalculate
                        </Button>
                        {active.is_sensitive && (
                          <Badge variant="outline" className="text-[10px]">
                            <ShieldAlert className="mr-1 h-3 w-3" /> sensitive
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <div className="rounded-lg border border-border/60 bg-surface p-3">
                        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Latest Value
                        </div>
                        <div className="mt-1 font-tabular text-2xl font-bold">
                          {latest?.value !== null && latest?.value !== undefined
                            ? Number(latest.value).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })
                            : "—"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-surface p-3">
                        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Confidence
                        </div>
                        <div className="mt-1 font-tabular text-2xl font-bold">
                          {latest ? `${Math.round(Number(latest.confidence_score) * 100)}%` : "—"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-surface p-3">
                        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Freshness
                        </div>
                        <div className="mt-1">
                          <Badge className={FRESHNESS_TONE[latest?.freshness_status ?? "unavailable"]}>
                            {latest?.freshness_status ?? "unavailable"}
                          </Badge>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-surface p-3">
                        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Refresh
                        </div>
                        <div className="mt-1 text-sm font-medium">{active.refresh_frequency}</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5">
                    <Tabs defaultValue="overview">
                      <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="formula">Formula</TabsTrigger>
                        <TabsTrigger value="sources">Sources</TabsTrigger>
                        <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="space-y-2 pt-3 text-sm">
                        <div><span className="text-muted-foreground">Owner:</span> {active.owner_role}</div>
                        <div><span className="text-muted-foreground">Status:</span> {active.status}</div>
                        <div><span className="text-muted-foreground">Confidence rule:</span> {active.confidence_rule ?? "—"}</div>
                        {active.demonstration_only && (
                          <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-xs text-amber-600">
                            Demonstration calculation until forecasting/health engine is connected.
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="formula" className="pt-3">
                        <div className="rounded-md border border-border/60 bg-surface p-3 font-mono text-xs">
                          {active.formula_definition}
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          {active.calculation_method}
                        </div>
                      </TabsContent>
                      <TabsContent value="sources" className="pt-3">
                        <div className="space-y-2 text-sm">
                          {(lineageQ.data ?? [])
                            .filter((l) => !l.dependency_metric_key)
                            .map((l) => (
                              <div key={l.id} className="rounded-md border border-border/60 p-2">
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant="outline">{l.source_type}</Badge>
                                  <span className="font-mono">
                                    {l.source_table}
                                    {l.source_field ? `.${l.source_field}` : ""}
                                  </span>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {l.transformation_description}
                                </div>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="dependencies" className="pt-3">
                        <div className="space-y-2 text-sm">
                          {(lineageQ.data ?? [])
                            .filter((l) => l.dependency_metric_key)
                            .map((l) => (
                              <div key={l.id} className="rounded-md border border-border/60 p-2 text-xs">
                                <Badge variant="outline" className="mr-2">
                                  {l.dependency_metric_key}
                                </Badge>
                                {l.transformation_description}
                              </div>
                            ))}
                          {(lineageQ.data ?? []).filter((l) => l.dependency_metric_key)
                            .length === 0 && (
                            <div className="text-xs text-muted-foreground">
                              No dependencies — leaf metric.
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="permissions" className="pt-3 text-sm">
                        <div><span className="text-muted-foreground">Sensitive:</span> {active.is_sensitive ? "yes" : "no"}</div>
                        <div><span className="text-muted-foreground">Required permission:</span> {active.required_permission ?? "—"}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Organization isolation enforced via RLS on financial_metrics /
                          financial_metric_values / financial_metric_lineage.
                        </div>
                      </TabsContent>
                      <TabsContent value="history" className="pt-3">
                        <div className="space-y-1 text-xs">
                          {history.map((h) => (
                            <div
                              key={h.id}
                              className="flex items-center justify-between border-b border-border/40 py-1 last:border-0"
                            >
                              <span className="font-mono">
                                {new Date(h.calculation_timestamp).toLocaleString()}
                              </span>
                              <span>
                                <Badge className={FRESHNESS_TONE[h.freshness_status]}>
                                  {h.freshness_status}
                                </Badge>{" "}
                                {h.value !== null
                                  ? Number(h.value).toLocaleString(undefined, {
                                      maximumFractionDigits: 2,
                                    })
                                  : "—"}{" "}
                                · {Math.round(Number(h.confidence_score) * 100)}%
                              </span>
                            </div>
                          ))}
                          {history.length === 0 && (
                            <div className="text-muted-foreground">
                              No calculations recorded. Click Recalculate.
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </Card>

                  <Card className="p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <BookMarked className="h-4 w-4" /> Lineage Explorer
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-5">
                      <div className="rounded-md border border-border/60 bg-surface p-2">
                        <div className="text-[10px] uppercase text-muted-foreground">Metric</div>
                        <div className="font-medium">{active.metric_name}</div>
                      </div>
                      <div className="rounded-md border border-border/60 bg-surface p-2">
                        <div className="text-[10px] uppercase text-muted-foreground">Sources</div>
                        <div>
                          {(lineageQ.data ?? [])
                            .filter((l) => !l.dependency_metric_key).length}{" "}
                          tables/fields
                        </div>
                      </div>
                      <div className="rounded-md border border-border/60 bg-surface p-2">
                        <div className="text-[10px] uppercase text-muted-foreground">Dependencies</div>
                        <div>
                          {(lineageQ.data ?? [])
                            .filter((l) => l.dependency_metric_key)
                            .map((l) => l.dependency_metric_key)
                            .join(", ") || "—"}
                        </div>
                      </div>
                      <div className="rounded-md border border-border/60 bg-surface p-2">
                        <div className="text-[10px] uppercase text-muted-foreground">Reports</div>
                        <div>Trial Balance · P&amp;L · Balance Sheet</div>
                      </div>
                      <div className="rounded-md border border-border/60 bg-surface p-2">
                        <div className="text-[10px] uppercase text-muted-foreground">APEX Usage</div>
                        <div>Consumed via metric API only</div>
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-6 text-sm text-muted-foreground">
                  {metricsQ.isLoading ? "Loading metrics…" : "No metrics available."}
                </Card>
              )}
            </div>
          </div>
        )}
      </PageBody>
    </AppShell>
  );
}
