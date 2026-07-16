import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrgId } from "@/hooks/use-current-org";
import { listFinancialEvents, listMaterializations } from "@/lib/accounting/financial-events.functions";
import { listFailedSyncHistory } from "@/lib/accounting/integrations.functions";
import { listMetrics } from "@/lib/intelligence/metrics.functions";
import { listAnomalies, listRecommendations, listExplanations } from "@/lib/intelligence/services.functions";
import {
  Workflow,
  Boxes,
  BookOpenCheck,
  ScrollText,
  AlertTriangle,
  ShieldCheck,
  Brain,
} from "lucide-react";

/**
 * M12 — Pilot Success Dashboard.
 *
 * Advisory rollup of how the pilot is performing against the mandated
 * lifecycle. Numbers come from the existing bus, materialization,
 * intelligence, and sync-history surfaces — no direct ledger access.
 */

export const Route = createFileRoute("/admin/pilot-success")({
  head: () => ({
    meta: [
      { title: "Pilot Success — LedgerOS" },
      {
        name: "description",
        content:
          "Advisory dashboard tracking pilot progress: events, objects, journals, reports, exceptions, audit, intelligence.",
      },
      { property: "og:title", content: "Pilot Success — LedgerOS" },
    ],
  }),
  component: PilotSuccessPage,
});

function PilotSuccessPage() {
  const orgId = useOrgId();
  const listEvents = useServerFn(listFinancialEvents);
  const listMats = useServerFn(listMaterializations);
  const listSync = useServerFn(listFailedSyncHistory);
  const listMetricsFn = useServerFn(listMetrics);
  const listAnoms = useServerFn(listAnomalies);
  const listRecs = useServerFn(listRecommendations);
  const listExpl = useServerFn(listExplanations);

  const eventsQ = useQuery({
    queryKey: ["pilot-events", orgId],
    queryFn: () => listEvents({ data: { orgId: orgId!, status: "all", limit: 500 } }),
    enabled: !!orgId,
  });
  const matsQ = useQuery({
    queryKey: ["pilot-mats", orgId],
    queryFn: () => listMats({ data: { orgId: orgId!, status: "all", limit: 500 } }),
    enabled: !!orgId,
  });
  const syncQ = useQuery({
    queryKey: ["pilot-sync", orgId],
    queryFn: () => listSync({ data: { orgId: orgId!, status: "all", limit: 500 } }),
    enabled: !!orgId,
  });
  const metricsQ = useQuery({
    queryKey: ["pilot-metrics", orgId],
    queryFn: () => listMetricsFn({ data: { orgId: orgId!, status: "active" } }),
    enabled: !!orgId,
  });
  const anomQ = useQuery({
    queryKey: ["pilot-anoms", orgId],
    queryFn: () => listAnoms({ data: { orgId: orgId!, status: "open", limit: 200 } }),
    enabled: !!orgId,
  });
  const recQ = useQuery({
    queryKey: ["pilot-recs", orgId],
    queryFn: () => listRecs({ data: { orgId: orgId!, state: "generated", limit: 200 } }),
    enabled: !!orgId,
  });
  const explQ = useQuery({
    queryKey: ["pilot-expl", orgId],
    queryFn: () => listExpl({ data: { orgId: orgId!, limit: 200 } }),
    enabled: !!orgId,
  });

  const stats = useMemo(() => {
    const events = (eventsQ.data ?? []) as Array<{ status: string; materialized_target_type?: string | null }>;
    const mats = (matsQ.data ?? []) as Array<{ status: string; target_object_type: string | null }>;
    const sync = (syncQ.data ?? []) as Array<{ status: string }>;
    const metrics = (metricsQ.data ?? []) as unknown[];
    const anoms = (anomQ.data ?? []) as unknown[];
    const recs = (recQ.data ?? []) as unknown[];
    const expl = (explQ.data ?? []) as unknown[];

    const materialized = events.filter((e) => e.status === "materialized").length;
    const journalObjectTypes = new Set(["journal_entry", "journal", "invoice", "bill", "payment"]);
    const journalsPosted = mats.filter(
      (m) => m.status === "completed" && (m.target_object_type ? journalObjectTypes.has(m.target_object_type) : false),
    ).length;
    const syncErrors = sync.filter((r) => r.status === "error").length;

    return {
      eventsProcessed: events.length,
      objectsCreated: mats.filter((m) => m.status === "completed").length,
      journalsPosted,
      materialized,
      reportsAvailable: 4, // P&L, BS, TB, Cash Flow — canonical surfaces
      exceptions: syncErrors + anoms.length,
      auditCompleteness:
        events.length === 0 ? 0 : Math.round((materialized / events.length) * 100),
      metrics: metrics.length,
      anomalies: anoms.length,
      recommendations: recs.length,
      explanations: expl.length,
      syncErrors,
    };
  }, [eventsQ.data, matsQ.data, syncQ.data, metricsQ.data, anomQ.data, recQ.data, explQ.data]);

  const cards: Array<{
    id: string;
    title: string;
    icon: typeof Workflow;
    value: number | string;
    detail: string;
  }> = [
    {
      id: "events",
      title: "Events processed",
      icon: Workflow,
      value: stats.eventsProcessed,
      detail: `${stats.materialized} materialized to financial objects`,
    },
    {
      id: "objects",
      title: "Financial objects created",
      icon: Boxes,
      value: stats.objectsCreated,
      detail: "Materialization engine outputs only",
    },
    {
      id: "journals",
      title: "Journals posted",
      icon: BookOpenCheck,
      value: stats.journalsPosted,
      detail: "Via accounting engine (no direct writes)",
    },
    {
      id: "reports",
      title: "Canonical reports available",
      icon: ScrollText,
      value: stats.reportsAvailable,
      detail: "P&L, Balance Sheet, Trial Balance, Cash Flow",
    },
    {
      id: "exceptions",
      title: "Exceptions",
      icon: AlertTriangle,
      value: stats.exceptions,
      detail: `${stats.syncErrors} sync errors · ${stats.anomalies} open anomalies`,
    },
    {
      id: "audit",
      title: "Audit completeness",
      icon: ShieldCheck,
      value: `${stats.auditCompleteness}%`,
      detail: "Events fully materialized with lineage",
    },
    {
      id: "intelligence",
      title: "Intelligence generated",
      icon: Brain,
      value: stats.metrics + stats.recommendations + stats.explanations,
      detail: `${stats.metrics} metrics · ${stats.recommendations} recs · ${stats.explanations} explanations`,
    },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M12"
        title="Pilot Success Dashboard"
        description="Live advisory rollup of pilot progress against the mandated lifecycle."
      />
      <PageBody className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.id} className="border-border/60 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-muted-foreground">
                  <c.icon className="h-4 w-4 text-brand" />
                  {c.title}
                </div>
              </div>
              <div className="mt-2 text-3xl font-semibold tabular-nums">{c.value}</div>
              <p className="mt-1 text-[13px] text-muted-foreground">{c.detail}</p>
            </Card>
          ))}
        </div>

        <Card className="border-border/60 p-5">
          <div className="text-sm font-semibold">Lifecycle coverage</div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Every event must complete the mandatory lifecycle. Advisory only — no
            corrective action is taken from this surface.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
            <Badge variant="outline">Event Bus</Badge>
            <Badge variant="outline">Validation</Badge>
            <Badge variant="outline">Mapping</Badge>
            <Badge variant="outline">Approval</Badge>
            <Badge variant="outline">Materialization</Badge>
            <Badge variant="outline">Financial Object</Badge>
            <Badge variant="outline">Accounting Engine</Badge>
            <Badge variant="outline">Reports</Badge>
            <Badge variant="outline">Metrics</Badge>
            <Badge variant="outline">APEX Insight</Badge>
          </div>
        </Card>

        <Card className="border-border/60 bg-muted/20 p-5">
          <div className="text-sm font-medium">Invariants</div>
          <ul className="mt-2 space-y-1 text-[13px] text-muted-foreground">
            <li>• All numbers above derive from existing bus / materialization / intelligence surfaces.</li>
            <li>• No direct queries to accounting tables from this UI.</li>
            <li>• AI is advisory-only.</li>
            <li>• LedgerOS remains the independent financial operating system.</li>
          </ul>
        </Card>
      </PageBody>
    </AppShell>
  );
}
