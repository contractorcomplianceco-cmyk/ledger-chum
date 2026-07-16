import { useState } from "react";
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
  listAnomalies,
  updateAnomalyStatus,
  listRecommendations,
  updateRecommendationState,
  listExplanations,
  getRefreshStatus,
  getFinancialHealthScore,
  getCloseCompletionScore,
  getIntelligenceGovernance,
} from "@/lib/intelligence/services.functions";
import {
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Gauge,
} from "lucide-react";

export const Route = createFileRoute("/admin/intelligence")({
  head: () => ({
    meta: [
      { title: "Intelligence Center — LedgerOS" },
      {
        name: "description",
        content:
          "Advisory-only financial intelligence: explanations, anomalies, recommendations, refresh status, and AI governance.",
      },
      { property: "og:title", content: "Intelligence Center — LedgerOS" },
    ],
  }),
  component: IntelligenceCenterPage,
});

const SEV_TONE: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-500",
  medium: "bg-amber-500/10 text-amber-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};
const FRESH_TONE: Record<string, string> = {
  fresh: "bg-emerald-500/10 text-emerald-500",
  delayed: "bg-amber-500/10 text-amber-500",
  stale: "bg-orange-500/10 text-orange-500",
  unavailable: "bg-red-500/10 text-red-500",
};

function IntelligenceCenterPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const [tab, setTab] = useState("explanations");

  const anomaliesFn = useServerFn(listAnomalies);
  const updateAnomaly = useServerFn(updateAnomalyStatus);
  const recsFn = useServerFn(listRecommendations);
  const updateRec = useServerFn(updateRecommendationState);
  const explFn = useServerFn(listExplanations);
  const refreshFn = useServerFn(getRefreshStatus);
  const healthFn = useServerFn(getFinancialHealthScore);
  const closeScoreFn = useServerFn(getCloseCompletionScore);
  const govFn = useServerFn(getIntelligenceGovernance);

  const anomaliesQ = useQuery({
    queryKey: ["intel-anomalies", orgId],
    queryFn: () => anomaliesFn({ data: { orgId: orgId!, status: "all", severity: "all" } }),
    enabled: !!orgId,
  });
  const recsQ = useQuery({
    queryKey: ["intel-recs", orgId],
    queryFn: () => recsFn({ data: { orgId: orgId!, state: "all", persona: "all" } }),
    enabled: !!orgId,
  });
  const explQ = useQuery({
    queryKey: ["intel-expl", orgId],
    queryFn: () => explFn({ data: { orgId: orgId!, subject_type: "all" } }),
    enabled: !!orgId,
  });
  const refreshQ = useQuery({
    queryKey: ["intel-refresh", orgId],
    queryFn: () => refreshFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const healthQ = useQuery({
    queryKey: ["intel-health", orgId],
    queryFn: () => healthFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const closeQ = useQuery({
    queryKey: ["intel-close", orgId],
    queryFn: () => closeScoreFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const govQ = useQuery({
    queryKey: ["intel-gov", orgId],
    queryFn: () => govFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });

  async function ackAnomaly(id: string, status: "acknowledged" | "dismissed" | "resolved") {
    if (!orgId) return;
    try {
      await updateAnomaly({ data: { id, orgId, status } });
      toast.success(`Anomaly ${status}`);
      qc.invalidateQueries({ queryKey: ["intel-anomalies", orgId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function reviewRec(id: string, state: "accepted" | "dismissed" | "needs_review") {
    if (!orgId) return;
    try {
      await updateRec({ data: { id, orgId, state } });
      toast.success(`Recommendation ${state}`);
      qc.invalidateQueries({ queryKey: ["intel-recs", orgId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Intelligence Center"
        description="Advisory-only. AI explains, detects, and recommends — humans decide. Every output carries evidence, confidence, and freshness."
      />
      <PageBody>
        {!orgId ? (
          <Card className="p-6 text-sm text-muted-foreground">
            Sign in to an organization to view intelligence.
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <ScoreCard
                title="Financial Health"
                score={healthQ.data?.score}
                confidence={healthQ.data?.confidence}
                freshness={healthQ.data?.freshness}
                icon={<Gauge className="h-4 w-4" />}
              />
              <ScoreCard
                title="Close Completion"
                score={closeQ.data?.score}
                confidence={closeQ.data?.confidence}
                freshness={closeQ.data?.freshness}
                icon={<ShieldCheck className="h-4 w-4" />}
              />
              <Card className="p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <RefreshCw className="h-4 w-4" /> Metric Refresh
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="font-tabular text-2xl font-bold">
                    {(refreshQ.data ?? []).filter((r) => r.freshness === "fresh").length}
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      / {refreshQ.data?.length ?? 0}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">metrics fresh</div>
                </div>
              </Card>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="explanations">
                  <MessageSquare className="mr-1 h-3.5 w-3.5" /> Explanations
                </TabsTrigger>
                <TabsTrigger value="anomalies">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Anomalies
                </TabsTrigger>
                <TabsTrigger value="recommendations">
                  <Lightbulb className="mr-1 h-3.5 w-3.5" /> Recommendations
                </TabsTrigger>
                <TabsTrigger value="refresh">
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh Status
                </TabsTrigger>
                <TabsTrigger value="governance">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" /> AI Governance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explanations" className="pt-3">
                <Card className="p-4">
                  <div className="text-sm font-semibold">Financial Explanations</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Human-readable AI answers with evidence, confidence, and assumptions.
                    Append-only.
                  </div>
                  <div className="mt-3 space-y-2">
                    {(explQ.data ?? []).map((e) => (
                      <div key={e.id} className="rounded-md border border-border/60 p-3">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <Badge variant="outline">{e.subject_type}</Badge>
                          <span className="font-mono text-muted-foreground">
                            {new Date(e.created_at).toLocaleString()}
                          </span>
                        </div>
                        {e.question && (
                          <div className="mt-2 text-xs font-medium text-muted-foreground">
                            Q: {e.question}
                          </div>
                        )}
                        <div className="mt-1 text-sm">{e.answer}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10.5px]">
                          <Badge className={FRESH_TONE[e.freshness]}>{e.freshness}</Badge>
                          <Badge variant="outline">
                            {Math.round(Number(e.confidence) * 100)}% confidence
                          </Badge>
                          {e.advisory_only && <Badge variant="outline">advisory only</Badge>}
                          {e.recommended_action && (
                            <Badge variant="outline">action: {e.recommended_action}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {(explQ.data ?? []).length === 0 && (
                      <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                        No explanations yet. Scheduled AI processes will populate this log.
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="anomalies" className="pt-3">
                <Card className="p-4">
                  <div className="text-sm font-semibold">Detected Anomalies</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Every anomaly is advisory. Narrative and evidence are immutable — you can
                    acknowledge, dismiss, or resolve.
                  </div>
                  <div className="mt-3 space-y-2">
                    {(anomaliesQ.data ?? []).map((a) => (
                      <div key={a.id} className="rounded-md border border-border/60 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge className={SEV_TONE[a.severity]}>{a.severity}</Badge>
                              <span className="text-sm font-semibold">{a.title}</span>
                              <Badge variant="outline" className="text-[10px]">
                                {a.status}
                              </Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">{a.narrative}</div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[10.5px]">
                              <Badge variant="outline">metric: {a.metric_key}</Badge>
                              <Badge className={FRESH_TONE[a.freshness]}>{a.freshness}</Badge>
                              <Badge variant="outline">
                                {Math.round(Number(a.confidence) * 100)}% confidence
                              </Badge>
                              {a.recommended_action && (
                                <Badge variant="outline">action: {a.recommended_action}</Badge>
                              )}
                              {a.approval_requirement && (
                                <Badge variant="outline">approval: {a.approval_requirement}</Badge>
                              )}
                            </div>
                          </div>
                          {a.status === "open" && (
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ackAnomaly(a.id, "acknowledged")}
                              >
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => ackAnomaly(a.id, "dismissed")}
                              >
                                Dismiss
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => ackAnomaly(a.id, "resolved")}
                              >
                                Resolve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {(anomaliesQ.data ?? []).length === 0 && (
                      <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                        No anomalies detected. Scheduled detectors will populate this queue.
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="pt-3">
                <Card className="p-4">
                  <div className="text-sm font-semibold">AI Recommendations</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Advisory only. AI cannot execute — every recommendation requires a human
                    reviewer and (where applicable) an approver before conversion.
                  </div>
                  <div className="mt-3 space-y-2">
                    {(recsQ.data ?? []).map((r) => (
                      <div key={r.id} className="rounded-md border border-border/60 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{r.category}</Badge>
                              <Badge variant="outline">{r.persona}</Badge>
                              <span className="text-sm font-semibold">{r.title}</span>
                              <Badge variant="outline" className="text-[10px]">
                                {r.state}
                              </Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">{r.narrative}</div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[10.5px]">
                              <Badge className={FRESH_TONE[r.freshness]}>{r.freshness}</Badge>
                              <Badge variant="outline">
                                {Math.round(Number(r.confidence) * 100)}% confidence
                              </Badge>
                              <Badge variant="outline">risk: {r.risk}</Badge>
                              {r.estimated_impact && (
                                <Badge variant="outline">impact: {r.estimated_impact}</Badge>
                              )}
                              {r.time_horizon && (
                                <Badge variant="outline">horizon: {r.time_horizon}</Badge>
                              )}
                              <Badge variant="outline">approval: {r.approval_requirement}</Badge>
                            </div>
                          </div>
                          {["generated", "needs_review"].includes(r.state) && (
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => reviewRec(r.id, "accepted")}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => reviewRec(r.id, "needs_review")}
                              >
                                Needs review
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => reviewRec(r.id, "dismissed")}
                              >
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {(recsQ.data ?? []).length === 0 && (
                      <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                        No recommendations yet.
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="refresh" className="pt-3">
                <Card className="p-4">
                  <div className="text-sm font-semibold">Metric Refresh Status</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Freshness of the latest calculated value per canonical metric.
                  </div>
                  <div className="mt-3 overflow-hidden rounded-md border border-border/60">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="p-2">Metric</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Freq</th>
                          <th className="p-2">Last calculated</th>
                          <th className="p-2">Freshness</th>
                          <th className="p-2">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(refreshQ.data ?? []).map((r) => (
                          <tr key={r.metric_id} className="border-t border-border/40">
                            <td className="p-2 font-medium">{r.metric_name}</td>
                            <td className="p-2 text-muted-foreground">
                              {r.category.replace(/_/g, " ")}
                            </td>
                            <td className="p-2">{r.refresh_frequency}</td>
                            <td className="p-2 font-mono text-[10.5px]">
                              {r.last_calculated_at
                                ? new Date(r.last_calculated_at).toLocaleString()
                                : "—"}
                            </td>
                            <td className="p-2">
                              <Badge className={FRESH_TONE[r.freshness]}>{r.freshness}</Badge>
                            </td>
                            <td className="p-2">{Math.round(r.confidence * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="governance" className="pt-3">
                <Card className="p-4">
                  <div className="text-sm font-semibold">AI Governance</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Advisory-only guardrails and the AI response contract.
                  </div>
                  {govQ.data && (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
                        <div className="text-xs font-semibold text-emerald-500">Allowed</div>
                        <ul className="mt-1 space-y-1 text-xs">
                          {govQ.data.ai_capabilities.allowed.map((c) => (
                            <li key={c}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3">
                        <div className="text-xs font-semibold text-red-500">Forbidden</div>
                        <ul className="mt-1 space-y-1 text-xs">
                          {govQ.data.ai_capabilities.forbidden.map((c) => (
                            <li key={c}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-md border border-border/60 p-3 md:col-span-2">
                        <div className="text-xs font-semibold">Response contract</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {govQ.data.response_contract.map((f) => (
                            <Badge key={f} variant="outline" className="text-[10px]">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-md border border-border/60 p-3 md:col-span-2">
                        <div className="text-xs font-semibold">
                          Immutability enforcement (DB triggers)
                        </div>
                        <ul className="mt-1 space-y-1 text-xs font-mono">
                          <li>anomalies · {govQ.data.immutability.anomalies}</li>
                          <li>recommendations · {govQ.data.immutability.recommendations}</li>
                          <li>explanations · {govQ.data.immutability.explanations}</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </PageBody>
    </AppShell>
  );
}

function ScoreCard({
  title,
  score,
  confidence,
  freshness,
  icon,
}: {
  title: string;
  score?: number;
  confidence?: number;
  freshness?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-2 font-tabular text-3xl font-bold">
        {score !== undefined ? `${score}` : "—"}
        <span className="text-sm text-muted-foreground"> / 100</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {freshness && <Badge className={FRESH_TONE[freshness]}>{freshness}</Badge>}
        {confidence !== undefined && (
          <Badge variant="outline" className="text-[10px]">
            {Math.round(confidence * 100)}% confidence
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px]">
          advisory only
        </Badge>
      </div>
    </Card>
  );
}
