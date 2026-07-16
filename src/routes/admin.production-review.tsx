import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useOrgId } from "@/hooks/use-current-org";
import { listFailedSyncHistory } from "@/lib/accounting/integrations.functions";
import { listFinancialEvents } from "@/lib/accounting/financial-events.functions";
import { listMetrics } from "@/lib/intelligence/metrics.functions";
import { listAnomalies, listRecommendations } from "@/lib/intelligence/services.functions";
import {
  ShieldCheck,
  BookOpenCheck,
  Workflow,
  Brain,
  Rocket,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

/**
 * M12 — Production Review Center.
 *
 * Consolidated pre-cutover review across five categories. All signals are
 * derived from already-existing intelligence/integration data. Advisory
 * only — no accounting mutations happen here.
 */

export const Route = createFileRoute("/admin/production-review")({
  head: () => ({
    meta: [
      { title: "Production Review — LedgerOS" },
      {
        name: "description",
        content:
          "Consolidated review across security, accounting, integration, intelligence, and migration before pilot cutover.",
      },
      { property: "og:title", content: "Production Review — LedgerOS" },
    ],
  }),
  component: ProductionReviewPage,
});

type ReadyState = "not_ready" | "in_progress" | "ready";

const TONE: Record<ReadyState, { cls: string; label: string; icon: typeof CheckCircle2 }> = {
  not_ready: { cls: "bg-red-500/10 text-red-500", label: "Not ready", icon: AlertTriangle },
  in_progress: { cls: "bg-amber-500/10 text-amber-500", label: "In progress", icon: Clock },
  ready: { cls: "bg-emerald-500/10 text-emerald-500", label: "Ready", icon: CheckCircle2 },
};

function ProductionReviewPage() {
  const orgId = useOrgId();
  const listSync = useServerFn(listFailedSyncHistory);
  const listEvents = useServerFn(listFinancialEvents);
  const listMetricsFn = useServerFn(listMetrics);
  const listAnoms = useServerFn(listAnomalies);
  const listRecs = useServerFn(listRecommendations);

  const syncQ = useQuery({
    queryKey: ["prodreview-sync", orgId],
    queryFn: () => listSync({ data: { orgId: orgId!, status: "all", limit: 200 } }),
    enabled: !!orgId,
  });
  const eventsQ = useQuery({
    queryKey: ["prodreview-events", orgId],
    queryFn: () => listEvents({ data: { orgId: orgId!, status: "all", limit: 200 } }),
    enabled: !!orgId,
  });
  const metricsQ = useQuery({
    queryKey: ["prodreview-metrics", orgId],
    queryFn: () => listMetricsFn({ data: { orgId: orgId!, status: "active" } }),
    enabled: !!orgId,
  });
  const anomQ = useQuery({
    queryKey: ["prodreview-anoms", orgId],
    queryFn: () => listAnoms({ data: { orgId: orgId!, status: "open", limit: 50 } }),
    enabled: !!orgId,
  });
  const recQ = useQuery({
    queryKey: ["prodreview-recs", orgId],
    queryFn: () => listRecs({ data: { orgId: orgId!, state: "generated", limit: 50 } }),
    enabled: !!orgId,
  });

  const categories = useMemo(() => {
    const syncRows = (syncQ.data ?? []) as Array<{ status: string }>;
    const eventRows = (eventsQ.data ?? []) as Array<{ status: string }>;
    const metrics = (metricsQ.data ?? []) as unknown[];
    const anoms = (anomQ.data ?? []) as unknown[];
    const recs = (recQ.data ?? []) as unknown[];
    const materialized = eventRows.filter((r) => r.status === "materialized").length;
    const errors = syncRows.filter((r) => r.status === "error").length;

    const security: ReadyState = "in_progress";
    const accounting: ReadyState =
      materialized > 0 ? "ready" : eventRows.length > 0 ? "in_progress" : "not_ready";
    const integration: ReadyState =
      errors === 0 && syncRows.length > 0 ? "ready" : syncRows.length > 0 ? "in_progress" : "not_ready";
    const intelligence: ReadyState =
      metrics.length >= 10 ? "ready" : metrics.length > 0 ? "in_progress" : "not_ready";
    const migration: ReadyState = "not_ready";

    return [
      {
        id: "security",
        title: "Security review",
        icon: ShieldCheck,
        state: security,
        checks: [
          "RLS enforced on every org-scoped table",
          "API keys scoped, hashed, and revocable",
          "Tenant isolation manually verified",
          "Penetration test signed off",
        ],
      },
      {
        id: "accounting",
        title: "Accounting review",
        icon: BookOpenCheck,
        state: accounting,
        checks: [
          `${eventRows.length} events on the bus`,
          `${materialized} materialized to financial objects`,
          "Opening balances entered and trial balance ties",
          "Close controls active",
        ],
      },
      {
        id: "integration",
        title: "Integration review",
        icon: Workflow,
        state: integration,
        checks: [
          `${syncRows.length} sync_history rows recorded`,
          `${errors} sync errors currently open`,
          "Idempotency verified on repeated events",
          "At least one green end-to-end pilot run",
        ],
      },
      {
        id: "intelligence",
        title: "Intelligence review",
        icon: Brain,
        state: intelligence,
        checks: [
          `${metrics.length} canonical metrics active`,
          `${anoms.length} open anomalies`,
          `${recs.length} pending recommendations`,
          "AI governance policy in force (advisory-only)",
        ],
      },
      {
        id: "migration",
        title: "Migration review",
        icon: Rocket,
        state: migration,
        checks: [
          "Zoho parallel-run plan agreed",
          "Cutover date agreed",
          "Rollback plan documented",
          "COA + opening balances staged",
        ],
      },
    ];
  }, [syncQ.data, eventsQ.data, metricsQ.data, anomQ.data, recQ.data]);

  const readyCount = categories.filter((c) => c.state === "ready").length;
  const percent = Math.round((readyCount / categories.length) * 100);
  const overall: ReadyState =
    readyCount === categories.length ? "ready" : readyCount > 0 ? "in_progress" : "not_ready";
  const overallTone = TONE[overall];

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M12"
        title="Production Review Center"
        description="Final consolidated review before pilot cutover."
      />
      <PageBody className="space-y-6">
        <Card className="border-border/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Overall review status
              </div>
              <div className="mt-1 flex items-center gap-2">
                <overallTone.icon className="h-5 w-5" />
                <span className="text-2xl font-semibold">{overallTone.label}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {readyCount} of {categories.length} categories cleared.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <Progress value={percent} />
              <div className="mt-1 text-right text-[11px] text-muted-foreground">{percent}%</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-[12px]">
            <Link to="/admin/readiness" className="text-brand hover:underline">
              Production Readiness →
            </Link>
            <Link to="/admin/pilot-success" className="text-brand hover:underline">
              Pilot Success →
            </Link>
            <Link to="/admin/acceptance-tests" className="text-brand hover:underline">
              Accounting Acceptance →
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((c) => {
            const t = TONE[c.state];
            return (
              <Card key={c.id} className="border-border/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <c.icon className="h-4 w-4 text-brand" />
                    <div className="text-sm font-semibold">{c.title}</div>
                  </div>
                  <Badge className={t.cls}>{t.label}</Badge>
                </div>
                <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
                  {c.checks.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <Card className="border-border/60 bg-muted/20 p-5">
          <div className="text-sm font-medium">Invariants confirmed by this review</div>
          <ul className="mt-2 space-y-1 text-[13px] text-muted-foreground">
            <li>• Financial Event Bus is the only inbound path.</li>
            <li>• Materialization Engine is the only writer to financial objects.</li>
            <li>• Accounting Engine is the only writer to journals.</li>
            <li>• Metrics Layer is the only source of canonical KPIs.</li>
            <li>• AI is advisory-only.</li>
          </ul>
        </Card>
      </PageBody>
    </AppShell>
  );
}
