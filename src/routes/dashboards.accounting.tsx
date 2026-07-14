import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export const Route = createFileRoute("/dashboards/accounting")({
  head: () => ({
    meta: [
      { title: "Accountant Workspace — LedgerOS" },
      {
        name: "description",
        content:
          "Financial dashboard: ServiceConnect work orders, draft invoices, posted invoices, payments, inventory consumption, and sync health.",
      },
      { property: "og:title", content: "Accountant Workspace — LedgerOS" },
      {
        property: "og:description",
        content:
          "See every operational event that touches the general ledger, in real time.",
      },
    ],
  }),
  component: AccountingDashboard,
});

function AccountingDashboard() {
  const draftCount = DEMO_DRAFT_INVOICES.length;
  const draftValue = DEMO_DRAFT_INVOICES.reduce(
    (s, d) => s + computeDraftTotals(d).total,
    0,
  );
  const wo24 = DEMO_EVENTS.filter((e) => e.event === "work_order.completed").length;
  const posted24 = DEMO_EVENTS.filter((e) => e.event === "invoice.posted").length;
  const payments24 = DEMO_EVENTS.filter((e) => e.event === "payment.received");
  const paymentsTotal = payments24.reduce((s, e) => s + e.amount, 0);
  const inv24 = DEMO_EVENTS.filter((e) => e.event === "inventory.consumed");
  const invTotal = inv24.reduce((s, e) => s + e.amount, 0);
  const failed = DEMO_EVENTS.filter(
    (e) => e.status === "failed" || e.status === "retrying",
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 3"
        title="Accountant Workspace"
        description="Every ServiceConnect job that completes lands here — as a draft invoice, a payment, or a sync exception."
        actions={
          <>
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
          <KpiTile
            icon={FileText}
            label="Work orders (24h)"
            value={wo24.toString()}
            sub="Synced from ServiceConnect"
          />
          <KpiTile
            icon={Clock}
            label="Draft invoices"
            value={draftCount.toString()}
            sub={`${currency(draftValue)} pending review`}
            tone="warn"
          />
          <KpiTile
            icon={CheckCircle2}
            label="Posted invoices (24h)"
            value={posted24.toString()}
            sub="AR journal entries created"
            tone="ok"
          />
          <KpiTile
            icon={Wallet}
            label="Payments received (24h)"
            value={payments24.length.toString()}
            sub={`${currency(paymentsTotal)} cash in`}
            tone="ok"
          />
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
              {DEMO_DRAFT_INVOICES.map((d) => {
                const t = computeDraftTotals(d);
                return (
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
                        {currency(t.total)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        margin {currency(t.grossMargin)}
                      </div>
                    </div>
                  </Link>
                );
              })}
              {DEMO_DRAFT_INVOICES.length === 0 && (
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
              <ActivityRow
                icon={Package}
                label="Inventory consumed"
                sub={`${inv24.length} events`}
                value={currency(invTotal)}
              />
              <ActivityRow
                icon={Wallet}
                label="Payments cleared"
                sub={`${payments24.length} events`}
                value={currency(paymentsTotal)}
              />
              <ActivityRow
                icon={Undo2}
                label="Refunds"
                sub={`${DEMO_EVENTS.filter((e) => e.event === "refund.created").length} events`}
                value={currency(
                  DEMO_EVENTS.filter((e) => e.event === "refund.created").reduce(
                    (s, e) => s + e.amount,
                    0,
                  ),
                )}
              />
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
              <div
                key={e.id}
                className="flex items-start justify-between rounded-md border border-border/60 bg-background p-3"
              >
                <div className="min-w-0 flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {EVENT_LABEL[e.event]} · {e.externalId}
                    </div>
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
                No sync failures in the last 24 hours.
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
              <div
                key={s.id}
                className="rounded-md border border-border/60 bg-background p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-foreground">
                    {s.name}
                  </div>
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
        </Card>
      </PageBody>
    </AppShell>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  sub,
  tone = "muted",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone?: "muted" | "ok" | "warn";
}) {
  const toneClass =
    tone === "ok"
      ? "text-success"
      : tone === "warn"
        ? "text-warning"
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
  icon: Icon,
  label,
  sub,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  value: string;
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
  const map = {
    healthy: "bg-success",
    degraded: "bg-warning",
    failed: "bg-destructive",
  } as const;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${map[status]}`} />
      {status}
    </span>
  );
}

function Stat({
  label,
  value,
  tone,
  mini,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "muted";
  mini?: boolean;
}) {
  const cls =
    tone === "ok" ? "text-success" : tone === "warn" ? "text-warning" : "text-muted-foreground";
  return (
    <div>
      <div className={`font-tabular ${mini ? "text-[14px]" : "text-[18px]"} font-bold ${cls}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
