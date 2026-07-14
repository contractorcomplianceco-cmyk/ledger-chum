import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrgId } from "@/hooks/use-current-org";
import {
  getDashboardMetrics,
  listIntegrationEvents,
} from "@/lib/accounting/workspace.functions";
import { listInvoices } from "@/lib/accounting/invoices.functions";
import {
  DEMO_EVENTS,
  DEMO_DRAFT_INVOICES,
  DEMO_SYSTEMS,
  EVENT_LABEL,
  currency,
  fmtRelative,
  computeDraftTotals,
} from "@/lib/mock/accountant-workspace";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Package,
  Wallet,
  Undo2,
  Beaker,
} from "lucide-react";

export const Route = createFileRoute("/dashboards/accounting")({
  head: () => ({
    meta: [
      { title: "Accountant Workspace — LedgerOS" },
      {
        name: "description",
        content:
          "Live financial dashboard powered by real LedgerOS APIs — draft invoices, posted AR journals, payments, and sync health.",
      },
      { property: "og:title", content: "Accountant Workspace — LedgerOS" },
      {
        property: "og:description",
        content:
          "Every ServiceConnect job that completes lands here — as a draft invoice, a payment, or a sync exception.",
      },
    ],
  }),
  component: AccountingDashboard,
});

const AUDIT_EVENT_KIND: Record<string, keyof typeof EVENT_LABEL | undefined> = {
  "invoice.created": "invoice.created",
  "invoice.posted": "invoice.posted",
  "payment.recorded": "payment.received",
  "payment.received": "payment.received",
  "inventory.consumed": "inventory.consumed",
  "refund.recorded": "refund.created",
  "refund.created": "refund.created",
  "sandbox.work_order.completed": "work_order.completed",
  "work_order.completed": "work_order.completed",
};

function AccountingDashboard() {
  const orgId = useOrgId();
  const live = !!orgId;

  const metrics = useQuery({
    queryKey: ["dashboard-metrics", orgId],
    queryFn: () => useServerFn(getDashboardMetrics)({ data: { orgId: orgId! } }),
    enabled: live,
    retry: false,
  });
  const drafts = useQuery({
    queryKey: ["invoices", "draft", orgId],
    queryFn: () =>
      useServerFn(listInvoices)({ data: { orgId: orgId!, status: "draft", limit: 20 } }),
    enabled: live,
    retry: false,
  });
  const events = useQuery({
    queryKey: ["integration-events", orgId, 50],
    queryFn: () =>
      useServerFn(listIntegrationEvents)({ data: { orgId: orgId!, limit: 50 } }),
    enabled: live,
    retry: false,
  });

  // Fallback to Phase 3 demo values if not signed in / not wired.
  const demoDraftValue = DEMO_DRAFT_INVOICES.reduce(
    (s, d) => s + computeDraftTotals(d).total, 0);
  const demoInv = DEMO_EVENTS.filter((e) => e.event === "inventory.consumed");
  const demoPayments = DEMO_EVENTS.filter((e) => e.event === "payment.received");

  const draftCount = metrics.data?.draftCount ?? DEMO_DRAFT_INVOICES.length;
  const draftValue = metrics.data?.draftValue ?? demoDraftValue;
  const wo24 = live
    ? (events.data ?? []).filter((e) => e.event_type.includes("work_order")).length
    : DEMO_EVENTS.filter((e) => e.event === "work_order.completed").length;
  const posted24 = metrics.data?.postedCount ??
    DEMO_EVENTS.filter((e) => e.event === "invoice.posted").length;
  const paymentsCount = metrics.data?.paymentsCount ?? demoPayments.length;
  const paymentsTotal = metrics.data?.paymentsTotal ??
    demoPayments.reduce((s, e) => s + e.amount, 0);
  const invCount = metrics.data?.consumptionCount ?? demoInv.length;
  const invTotal = metrics.data?.consumptionValue ??
    demoInv.reduce((s, e) => s + e.amount, 0);
  const refundsCount = metrics.data?.refundsCount ??
    DEMO_EVENTS.filter((e) => e.event === "refund.created").length;
  const refundsTotal = metrics.data?.refundsTotal ??
    DEMO_EVENTS.filter((e) => e.event === "refund.created").reduce((s, e) => s + e.amount, 0);

  const draftList = useMemo(() => {
    if (live && drafts.data) {
      return drafts.data.map((d) => ({
        id: d.id,
        invoiceNumber: d.invoice_number,
        customer: (d as unknown as { customers?: { name: string } }).customers?.name ?? "—",
        workOrderRef: d.work_order_ref ?? d.external_id ?? "—",
        total: Number(d.total),
        margin: null as number | null,
      }));
    }
    return DEMO_DRAFT_INVOICES.map((d) => {
      const t = computeDraftTotals(d);
      return {
        id: d.id, invoiceNumber: d.invoiceNumber, customer: d.customer,
        workOrderRef: d.workOrderRef, total: t.total, margin: t.grossMargin,
      };
    });
  }, [live, drafts.data]);

  const failed = live
    ? (events.data ?? [])
        .filter((e) => (e.event_type ?? "").endsWith(".failed"))
        .slice(0, 5)
        .map((e) => ({
          id: e.id,
          label: e.event_type,
          customer: e.source ?? "—",
          syncResult: (e.after as { message?: string } | null)?.message ?? "sync failure",
          timestamp: e.created_at,
        }))
    : DEMO_EVENTS.filter((e) => e.status === "failed" || e.status === "retrying").map((e) => ({
        id: e.id, label: EVENT_LABEL[e.event] + " · " + e.externalId,
        customer: e.customer, syncResult: e.syncResult, timestamp: e.timestamp,
      }));

  return (
    <AppShell>
      <PageHeader
        eyebrow={`LedgerOS · Phase 4 · ${live ? "Live" : "Demo"}`}
        title="Accountant Workspace"
        description={
          live
            ? "Live view of your LedgerOS org — draft invoices, posted journals, payments and sync exceptions."
            : "Sign in and connect an org to see live data. Demo values shown below."
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild className="h-9">
              <Link to="/integrations/sandbox">
                <Beaker className="mr-1.5 h-3.5 w-3.5" /> Sandbox
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-9">
              <Link to="/integrations">
                Integration health <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button size="sm" asChild className="h-9">
              <Link to="/invoices/review">
                Review drafts <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile icon={FileText} label="Work orders (24h)" value={wo24.toString()} sub="Synced from ServiceConnect" />
          <KpiTile icon={Clock} label="Draft invoices" value={draftCount.toString()} sub={`${currency(draftValue)} pending review`} tone="warn" />
          <KpiTile icon={CheckCircle2} label="Posted invoices (24h)" value={posted24.toString()} sub="AR journal entries created" tone="ok" />
          <KpiTile icon={Wallet} label="Payments received (24h)" value={paymentsCount.toString()} sub={`${currency(paymentsTotal)} cash in`} tone="ok" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/70 bg-surface p-4 shadow-card lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Draft invoices
                </div>
                <div className="mt-0.5 text-[15px] font-semibold text-foreground">
                  Awaiting accountant approval
                </div>
              </div>
              <Button size="sm" variant="ghost" asChild className="h-8 text-[12px]">
                <Link to="/invoices/review">Open review queue</Link>
              </Button>
            </div>
            <div className="mt-3 divide-y divide-border/60">
              {draftList.map((d) => (
                <Link
                  key={d.id}
                  to="/invoices/review"
                  className="flex items-center justify-between py-3 transition hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-foreground">
                        {d.invoiceNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className="h-5 border-warning/30 bg-warning/10 text-[10px] font-semibold text-warning"
                      >
                        Draft
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {d.customer} · from {d.workOrderRef}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-tabular text-[14px] font-semibold text-foreground">
                      {currency(d.total)}
                    </div>
                    {d.margin != null && (
                      <div className="text-[11px] text-muted-foreground">
                        margin {currency(d.margin)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              {draftList.length === 0 && (
                <div className="py-6 text-center text-[12px] text-muted-foreground">
                  No drafts awaiting review.
                </div>
              )}
            </div>
          </Card>

          <Card className="border-border/70 bg-surface p-4 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Ledger activity (24h)
            </div>
            <div className="mt-3 space-y-3">
              <ActivityRow icon={Package} label="Inventory consumed" sub={`${invCount} events`} value={currency(invTotal)} />
              <ActivityRow icon={Wallet} label="Payments cleared" sub={`${paymentsCount} events`} value={currency(paymentsTotal)} />
              <ActivityRow icon={Undo2} label="Refunds" sub={`${refundsCount} events`} value={currency(refundsTotal)} />
            </div>
          </Card>
        </div>

        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Sync exceptions
              </div>
              <div className="mt-0.5 text-[15px] font-semibold text-foreground">
                {failed.length} events need attention
              </div>
            </div>
            <Button size="sm" variant="ghost" asChild className="h-8 text-[12px]">
              <Link to="/integrations">Open integration inbox</Link>
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {failed.map((e) => (
              <div key={e.id} className="flex items-start justify-between rounded-md border border-border/60 bg-background p-3">
                <div className="min-w-0 flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">{e.label}</div>
                    <div className="text-[12px] text-muted-foreground">
                      {e.customer} · {e.syncResult}
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-muted-foreground">
                  {fmtRelative(e.timestamp)}
                </div>
              </div>
            ))}
            {failed.length === 0 && (
              <div className="rounded-md border border-border/60 bg-background p-4 text-center text-[12px] text-muted-foreground">
                No sync failures.
              </div>
            )}
          </div>
        </Card>

        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Connected systems
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {DEMO_SYSTEMS.map((s) => (
              <div key={s.id} className="rounded-md border border-border/60 bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-foreground">{s.name}</div>
                  <StatusDot status={s.status} />
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {s.category} · {s.environment}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <Stat mini label="OK" value={s.successCount24h.toString()} tone="ok" />
                  <Stat mini label="Failed" value={s.failedCount24h.toString()} tone={s.failedCount24h > 0 ? "warn" : "muted"} />
                  <Stat mini label="Pending" value={s.pendingCount.toString()} tone={s.pendingCount > 0 ? "warn" : "muted"} />
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Last sync {fmtRelative(s.lastSync)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Configure a real ServiceConnect API client in{" "}
            <Link to="/settings/serviceconnect" className="underline">
              Settings → ServiceConnect
            </Link>
            .
          </div>
        </Card>
      </PageBody>
    </AppShell>
  );
}

// Keep AUDIT_EVENT_KIND referenced (for future filter wiring).
void AUDIT_EVENT_KIND;

function KpiTile({
  icon: Icon, label, value, sub, tone = "muted",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub: string;
  tone?: "muted" | "ok" | "warn";
}) {
  const toneClass =
    tone === "ok" ? "text-success"
    : tone === "warn" ? "text-warning"
    : "text-muted-foreground";
  return (
    <Card className="border-border/70 bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </div>
        <Icon className={`h-4 w-4 ${toneClass}`} />
      </div>
      <div className="mt-1 font-tabular text-[26px] font-bold text-foreground">{value}</div>
      <div className={`mt-1 text-[12px] ${toneClass}`}>{sub}</div>
    </Card>
  );
}

function ActivityRow({
  icon: Icon, label, sub, value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; sub: string; value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-muted/60">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">{label}</div>
          <div className="text-[11px] text-muted-foreground">{sub}</div>
        </div>
      </div>
      <div className="font-tabular text-[13px] font-semibold text-foreground">{value}</div>
    </div>
  );
}

function StatusDot({ status }: { status: "healthy" | "degraded" | "failed" }) {
  const map = { healthy: "bg-success", degraded: "bg-warning", failed: "bg-destructive" } as const;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${map[status]}`} />
      {status}
    </span>
  );
}

function Stat({ label, value, tone, mini }: {
  label: string; value: string; tone: "ok" | "warn" | "muted"; mini?: boolean;
}) {
  const cls = tone === "ok" ? "text-success" : tone === "warn" ? "text-warning" : "text-muted-foreground";
  return (
    <div>
      <div className={`font-tabular ${mini ? "text-[14px]" : "text-[18px]"} font-bold ${cls}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
