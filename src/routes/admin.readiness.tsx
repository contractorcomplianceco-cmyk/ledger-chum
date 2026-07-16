import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
  BookOpenCheck,
  ShieldCheck,
  Workflow,
  Brain,
  Rocket,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

/**
 * M10 — Production Readiness Dashboard.
 *
 * Advisory rollup only. No accounting mutations happen here. Each category
 * derives its state from existing intelligence / integration signals.
 */

export const Route = createFileRoute("/admin/readiness")({
  head: () => ({
    meta: [
      { title: "Production Readiness — LedgerOS" },
      {
        name: "description",
        content:
          "Cutover checklist: accounting, security, integration, intelligence, and migration readiness for the ServiceConnect pilot.",
      },
      { property: "og:title", content: "Production Readiness — LedgerOS" },
    ],
  }),
  component: ReadinessDashboard,
});

type ReadyState = "not_ready" | "in_progress" | "ready";

const TONE: Record<ReadyState, { cls: string; label: string; icon: typeof CheckCircle2 }> = {
  not_ready: { cls: "bg-red-500/10 text-red-500", label: "Not ready", icon: AlertTriangle },
  in_progress: { cls: "bg-amber-500/10 text-amber-500", label: "In progress", icon: Clock },
  ready: { cls: "bg-emerald-500/10 text-emerald-500", label: "Ready", icon: CheckCircle2 },
};

function ReadinessDashboard() {
  const orgId = useOrgId();
  const listSync = useServerFn(listFailedSyncHistory);
  const listEvents = useServerFn(listFinancialEvents);
  const listMetricsFn = useServerFn(listMetrics);
  const listAnoms = useServerFn(listAnomalies);
  const listRecs = useServerFn(listRecommendations);

  const syncQ = useQuery({
    queryKey: ["readiness-sync", orgId],
    queryFn: () => listSync({ data: { orgId: orgId!, status: "all", limit: 200 } }),
    enabled: !!orgId,
  });
  const eventsQ = useQuery({
    queryKey: ["readiness-events", orgId],
    queryFn: () => listEvents({ data: { orgId: orgId!, status: "all", limit: 200 } }),
    enabled: !!orgId,
  });
  const metricsQ = useQuery({
    queryKey: ["readiness-metrics", orgId],
    queryFn: () => listMetricsFn({ data: { orgId: orgId!, status: "active" } }),
    enabled: !!orgId,
  });
  const anomQ = useQuery({
    queryKey: ["readiness-anoms", orgId],
    queryFn: () => listAnoms({ data: { orgId: orgId!, status: "open", limit: 50 } }),
    enabled: !!orgId,
  });
  const recQ = useQuery({
    queryKey: ["readiness-recs", orgId],
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

    const accounting: ReadyState =
      materialized > 0 ? "ready" : eventRows.length > 0 ? "in_progress" : "not_ready";
    const security: ReadyState = "in_progress"; // requires manual sign-off
    const integration: ReadyState =
      errors === 0 && syncRows.length > 0
        ? "ready"
        : syncRows.length > 0
          ? "in_progress"
          : "not_ready";
    const intelligence: ReadyState =
      metrics.length > 0 && recs.length >= 0
        ? metrics.length >= 10
          ? "ready"
          : "in_progress"
        : "not_ready";
    const migration: ReadyState = "not_ready";

    return [
      {
        id: "accounting",
        title: "Accounting readiness",
        icon: BookOpenCheck,
        state: accounting,
        signals: [
          `${eventRows.length} events on the bus`,
          `${materialized} materialized`,
          "Chart of accounts + opening balances required before cutover",
        ],
      },
      {
        id: "security",
        title: "Security readiness",
        icon: ShieldCheck,
        state: security,
        signals: [
          "RLS enforced on all org-scoped tables",
          "API keys scoped and hashed",
          "Manual sign-off required: penetration test + tenant-isolation review",
        ],
      },
      {
        id: "integration",
        title: "Integration readiness",
        icon: Workflow,
        state: integration,
        signals: [
          `${syncRows.length} sync_history rows`,
          `${errors} errors currently open`,
          "At least one green end-to-end pilot run required",
        ],
      },
      {
        id: "intelligence",
        title: "Intelligence readiness",
        icon: Brain,
        state: intelligence,
        signals: [
          `${metrics.length} canonical metrics active`,
          `${anoms.length} open anomalies`,
          `${recs.length} pending recommendations`,
          "AI governance policy required (advisory-only enforced)",
        ],
      },
      {
        id: "migration",
        title: "Migration readiness",
        icon: Rocket,
        state: migration,
        signals: [
          "Zoho parallel run not yet started",
          "Cutover date not set",
          "Rollback plan pending",
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
        eyebrow="LedgerOS · Phase 5 · M10"
        title="Production Readiness"
        description="Cutover checklist and go/no-go criteria for the ServiceConnect pilot."
      />
      <PageBody className="space-y-6">
        <Card className="border-border/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Overall
              </div>
              <div className="mt-1 flex items-center gap-2">
                <overallTone.icon className="h-5 w-5" />
                <span className="text-2xl font-semibold">{overallTone.label}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {readyCount} of {categories.length} categories ready.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <Progress value={percent} />
              <div className="mt-1 text-right text-[11px] text-muted-foreground">{percent}%</div>
            </div>
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
                  {c.signals.map((s, i) => (
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
          <div className="text-sm font-medium">Invariants</div>
          <ul className="mt-2 space-y-1 text-[13px] text-muted-foreground">
            <li>• No direct external → journal path.</li>
            <li>• No ServiceConnect-specific accounting rules in the ledger core.</li>
            <li>• No auto-posting; controls remain in effect.</li>
            <li>• AI is advisory-only — it cannot post, approve, or override controls.</li>
            <li>• LedgerOS remains the independent financial operating system.</li>
          </ul>
        </Card>
      </PageBody>
    </AppShell>
  );
}
