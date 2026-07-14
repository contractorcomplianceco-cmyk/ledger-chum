import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listControlExceptions,
  getControlSummary,
} from "@/lib/accounting/controls.functions";
import { AlertTriangle, Activity, ClipboardCheck, FileWarning } from "lucide-react";

export const Route = createFileRoute("/controls")({
  head: () => ({
    meta: [
      { title: "Accounting Control Center — LedgerOS" },
      {
        name: "description",
        content:
          "Close status, exceptions, reconciliation health, posting issues, and aging review in one workspace.",
      },
      { property: "og:title", content: "Accounting Control Center — LedgerOS" },
      { property: "og:description", content: "Real-time accounting exceptions and close readiness." },
    ],
  }),
  component: ControlsPage,
});

const CATEGORY_LABEL: Record<string, string> = {
  draft_journal: "Draft journals",
  unmatched_bank_txn: "Unmatched bank txns",
  past_due_invoice: "Past-due invoices",
  past_due_bill: "Past-due bills",
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

function ControlsPage() {
  const orgId = useOrgId();
  const summaryFn = useServerFn(getControlSummary);
  const excFn = useServerFn(listControlExceptions);

  const summaryQ = useQuery({
    queryKey: ["controls.summary", orgId],
    queryFn: () => summaryFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const excQ = useQuery({
    queryKey: ["controls.exceptions", orgId],
    queryFn: () => excFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M4"
        title="Accounting Control Center"
        description="Close readiness, posting issues, reconciliation health, and past-due aging — all rolled up from live ledger data."
      />
      <PageBody>
        {!orgId ? (
          <Card className="p-6 text-sm text-muted-foreground">Sign in to view the Control Center.</Card>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiTile
                icon={ClipboardCheck}
                label="Current period"
                value={summaryQ.data?.currentPeriod ? `#${summaryQ.data.currentPeriod.period_number}` : "—"}
                sub={summaryQ.data?.currentPeriod?.status ?? "no active period"}
              />
              <KpiTile
                icon={AlertTriangle}
                label="Exceptions"
                value={(summaryQ.data?.exceptionsTotal ?? 0).toString()}
                sub={`${summaryQ.data?.bySeverity?.critical ?? 0} critical · ${summaryQ.data?.bySeverity?.warning ?? 0} warning`}
                tone={summaryQ.data && summaryQ.data.exceptionsTotal > 0 ? "warn" : "ok"}
              />
              <KpiTile
                icon={Activity}
                label="Unmatched bank txns"
                value={(summaryQ.data?.unmatchedBankTxns ?? 0).toString()}
                sub="from posted bank imports"
              />
              <KpiTile
                icon={FileWarning}
                label="Draft journals"
                value={(summaryQ.data?.draftJournals ?? 0).toString()}
                sub="need post or void"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <Card className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Exceptions by category
                </div>
                <div className="space-y-2">
                  {Object.entries(summaryQ.data?.byCategory ?? {}).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between text-[13px]">
                      <span>{CATEGORY_LABEL[cat] ?? cat}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                  {(!summaryQ.data || Object.keys(summaryQ.data.byCategory).length === 0) && (
                    <div className="text-sm text-muted-foreground">No exceptions — books are clean.</div>
                  )}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Open exceptions
                </div>
                <div className="divide-y divide-border/60">
                  {(excQ.data ?? []).map((e, i) => (
                    <div key={i} className="p-3 flex items-start gap-3 text-[13px]">
                      <SeverityDot severity={e.severity ?? "warning"} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{e.message}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {CATEGORY_LABEL[e.category ?? ""] ?? e.category} · {fmtDate(e.occurred_on)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!excQ.data || excQ.data.length === 0) && (
                    <div className="p-6 text-sm text-muted-foreground text-center">
                      No open exceptions.
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Recent close runs
              </div>
              {(summaryQ.data?.recentCloseRuns ?? []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No close runs yet.</div>
              ) : (
                <div className="space-y-1 text-[13px]">
                  {summaryQ.data?.recentCloseRuns.map((r) => (
                    <div key={r.id} className="flex items-center justify-between">
                      <span className="capitalize">{r.status.replace("_", " ")}</span>
                      <span className="text-muted-foreground">
                        {fmtDate(r.started_at)}
                        {r.completed_at && ` → ${fmtDate(r.completed_at)}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </PageBody>
    </AppShell>
  );
}

function KpiTile({
  icon: Icon, label, value, sub, tone,
}: {
  icon: typeof AlertTriangle; label: string; value: string; sub?: string; tone?: "ok" | "warn";
}) {
  const cls = tone === "warn" ? "text-amber-600" : "text-foreground";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${cls}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const cls =
    severity === "critical"
      ? "bg-destructive"
      : severity === "warning"
      ? "bg-amber-500"
      : "bg-muted-foreground";
  return <div className={`h-2 w-2 rounded-full mt-1.5 ${cls}`} />;
}
