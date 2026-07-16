import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrgId } from "@/hooks/use-current-org";
import { listFailedSyncHistory } from "@/lib/accounting/integrations.functions";
import { listFinancialEvents } from "@/lib/accounting/financial-events.functions";
import { Activity, AlertTriangle, Clock, Repeat, Workflow, BookMarked } from "lucide-react";

/**
 * M10 — Observability Framework.
 *
 * Read-only rollup of pipeline telemetry. No mitigations happen here;
 * operators act through the Financial Event Bus and the accountant
 * workspace.
 */

export const Route = createFileRoute("/admin/observability")({
  head: () => ({
    meta: [
      { title: "Observability — LedgerOS" },
      {
        name: "description",
        content:
          "Pipeline telemetry: integration failures, processing time, event volume, retry queue, audit events, system health.",
      },
      { property: "og:title", content: "Observability — LedgerOS" },
    ],
  }),
  component: ObservabilityPage,
});

function ObservabilityPage() {
  const orgId = useOrgId();
  const listSync = useServerFn(listFailedSyncHistory);
  const listEvents = useServerFn(listFinancialEvents);

  const syncQ = useQuery({
    queryKey: ["obs-sync", orgId],
    queryFn: () => listSync({ data: { orgId: orgId!, status: "all", limit: 500 } }),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });
  const eventsQ = useQuery({
    queryKey: ["obs-events", orgId],
    queryFn: () => listEvents({ data: { orgId: orgId!, status: "all", limit: 500 } }),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });

  const stats = useMemo(() => {
    const sync = (syncQ.data ?? []) as Array<{
      status: string;
      endpoint: string | null;
      retry_count: number | null;
      last_retry_at: string | null;
      error: string | null;
      created_at: string;
    }>;
    const events = (eventsQ.data ?? []) as Array<{ status: string; created_at: string }>;

    const errorsByEndpoint = new Map<string, number>();
    for (const r of sync) {
      if (r.status === "error") {
        const key = r.endpoint ?? "(unknown)";
        errorsByEndpoint.set(key, (errorsByEndpoint.get(key) ?? 0) + 1);
      }
    }

    const now = Date.now();
    const lastHour = sync.filter((r) => now - new Date(r.created_at).getTime() < 3600_000);
    const eventsLastHour = events.filter((r) => now - new Date(r.created_at).getTime() < 3600_000);

    const retryQueue = sync
      .filter((r) => (r.retry_count ?? 0) > 0)
      .sort(
        (a, b) =>
          new Date(b.last_retry_at ?? b.created_at).getTime() -
          new Date(a.last_retry_at ?? a.created_at).getTime(),
      )
      .slice(0, 20);

    return {
      totalSync: sync.length,
      totalErrors: sync.filter((r) => r.status === "error").length,
      totalEvents: events.length,
      eventsLastHour: eventsLastHour.length,
      syncLastHour: lastHour.length,
      pendingApproval: events.filter((r) => r.status === "pending_approval").length,
      materialized: events.filter((r) => r.status === "materialized").length,
      errorsByEndpoint: [...errorsByEndpoint.entries()].sort((a, b) => b[1] - a[1]),
      retryQueue,
    };
  }, [syncQ.data, eventsQ.data]);

  const health: { state: "healthy" | "degraded" | "unhealthy"; note: string } =
    stats.totalErrors === 0
      ? { state: "healthy", note: "No errors in the current window." }
      : stats.totalErrors < 5
        ? { state: "degraded", note: `${stats.totalErrors} errors — review the retry queue.` }
        : {
            state: "unhealthy",
            note: `${stats.totalErrors} errors — escalate to integration owner.`,
          };

  const healthTone =
    health.state === "healthy"
      ? "bg-emerald-500/10 text-emerald-500"
      : health.state === "degraded"
        ? "bg-amber-500/10 text-amber-500"
        : "bg-red-500/10 text-red-500";

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M10"
        title="Observability"
        description="Live telemetry for the integration pipeline. Read-only."
      />
      <PageBody className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile icon={Workflow} label="Events (total)" value={stats.totalEvents} />
          <Tile icon={Clock} label="Events / last hour" value={stats.eventsLastHour} />
          <Tile
            icon={AlertTriangle}
            label="Errors"
            value={stats.totalErrors}
            tone={stats.totalErrors ? "bad" : "muted"}
          />
          <Tile icon={Repeat} label="Retry queue" value={stats.retryQueue.length} />
        </div>

        <Card className="border-border/60 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand" />
              <div className="text-sm font-semibold">System health</div>
            </div>
            <Badge className={healthTone}>{health.state}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{health.note}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 text-[13px]">
            <MetricRow label="Pending approval" value={stats.pendingApproval} />
            <MetricRow label="Materialized" value={stats.materialized} />
            <MetricRow label="sync_history · last hour" value={stats.syncLastHour} />
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="text-sm font-semibold">Errors by endpoint</div>
            </div>
            {stats.errorsByEndpoint.length === 0 ? (
              <p className="text-sm text-muted-foreground">No errors recorded.</p>
            ) : (
              <ul className="space-y-2 text-[13px]">
                {stats.errorsByEndpoint.map(([endpoint, count]) => (
                  <li
                    key={endpoint}
                    className="flex items-center justify-between rounded border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <span className="font-mono">{endpoint}</span>
                    <Badge className="bg-red-500/10 text-red-500">{count}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="border-border/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Repeat className="h-4 w-4 text-amber-500" />
              <div className="text-sm font-semibold">Retry queue</div>
            </div>
            {stats.retryQueue.length === 0 ? (
              <p className="text-sm text-muted-foreground">Retry queue is empty.</p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-auto text-[12px]">
                {stats.retryQueue.map((r, i) => (
                  <li
                    key={i}
                    className="rounded border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono">{r.endpoint}</span>
                      <Badge variant="outline">retry × {r.retry_count}</Badge>
                    </div>
                    {r.error && <div className="mt-1 text-[11px] text-red-400">{r.error}</div>}
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      last retry{" "}
                      {r.last_retry_at ? new Date(r.last_retry_at).toLocaleString() : "—"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card className="border-border/60 bg-muted/20 p-5">
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            <div className="text-sm font-medium">Audit lineage</div>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Full audit history — including correlation IDs joining sync_history → financial_events →
            journal entries — lives in the audit log. Observability surfaces the top-of-funnel
            signals only.
          </p>
        </Card>
      </PageBody>
    </AppShell>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  tone = "brand",
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  tone?: "brand" | "bad" | "muted";
}) {
  const cls =
    tone === "bad" ? "text-red-500" : tone === "muted" ? "text-muted-foreground" : "text-brand";
  return (
    <Card className="border-border/60 p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-border/60 bg-background/40 p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold">{value}</div>
    </div>
  );
}
