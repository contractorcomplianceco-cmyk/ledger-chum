import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEMO_EVENTS,
  DEMO_SYSTEMS,
  EVENT_LABEL,
  currency,
  fmtRelative,
  type IntegrationEventType,
  type SyncStatus,
} from "@/lib/mock/accountant-workspace";
import { Search, RefreshCw, CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integration Inbox — LedgerOS" },
      {
        name: "description",
        content:
          "Never silent. Every source event — work orders, invoices, payments, refunds, inventory — surfaces here with status and audit trail.",
      },
      { property: "og:title", content: "Integration Inbox — LedgerOS" },
      {
        property: "og:description",
        content:
          "Never silent. Every source event surfaces here with status and audit trail.",
      },
    ],
  }),
  component: IntegrationInboxPage,
});

const TABS = ["Activity", "Health"] as const;
type Tab = (typeof TABS)[number];

const EVENT_FILTERS: Array<{ id: "all" | IntegrationEventType; label: string }> = [
  { id: "all", label: "All events" },
  { id: "work_order.completed", label: "Work orders" },
  { id: "invoice.created", label: "Invoices created" },
  { id: "invoice.posted", label: "Invoices posted" },
  { id: "payment.received", label: "Payments" },
  { id: "inventory.consumed", label: "Inventory" },
  { id: "refund.created", label: "Refunds" },
];

const STATUS_FILTERS: Array<{ id: "all" | SyncStatus; label: string }> = [
  { id: "all", label: "All status" },
  { id: "success", label: "Success" },
  { id: "pending", label: "Pending" },
  { id: "retrying", label: "Retrying" },
  { id: "failed", label: "Failed" },
];

function IntegrationInboxPage() {
  const [tab, setTab] = useState<Tab>("Activity");
  const [q, setQ] = useState("");
  const [evt, setEvt] = useState<"all" | IntegrationEventType>("all");
  const [status, setStatus] = useState<"all" | SyncStatus>("all");

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return DEMO_EVENTS.filter(
      (e) =>
        (evt === "all" || e.event === evt) &&
        (status === "all" || e.status === status) &&
        (!needle ||
          e.externalId.toLowerCase().includes(needle) ||
          e.customer.toLowerCase().includes(needle) ||
          e.source.toLowerCase().includes(needle)),
    );
  }, [q, evt, status]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 3"
        title="Integration Inbox"
        description="Never silent — every event that crosses the LedgerOS boundary is recorded, retried, and auditable."
        actions={
          <Button size="sm" variant="outline" className="h-9">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="border-b border-border px-6 sm:px-8">
        <nav className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative rounded-t-md px-3 py-2 text-[13px] font-medium transition",
                tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
              {tab === t && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-brand-cool" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <PageBody>
        {tab === "Activity" ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search external ID, customer, source"
                  className="h-9 w-80 pl-8 text-[13px]"
                />
              </div>
              <FilterGroup
                value={evt}
                onChange={(v) => setEvt(v as typeof evt)}
                options={EVENT_FILTERS}
              />
              <FilterGroup
                value={status}
                onChange={(v) => setStatus(v as typeof status)}
                options={STATUS_FILTERS}
              />
              <div className="ml-auto text-[12px] text-muted-foreground">
                {filtered.length} events
              </div>
            </div>

            <Card className="overflow-hidden border-border/70 bg-surface shadow-card">
              <div className="grid grid-cols-[130px_170px_140px_1fr_120px_130px_120px] gap-3 border-b border-border/60 bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div>Source</div>
                <div>Event</div>
                <div>External ID</div>
                <div>Customer / result</div>
                <div className="text-right">Amount</div>
                <div>Timestamp</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-border/60">
                {filtered.map((e) => (
                  <div
                    key={e.id}
                    className="grid grid-cols-[130px_170px_140px_1fr_120px_130px_120px] items-center gap-3 px-4 py-3 text-[13px]"
                  >
                    <div className="truncate font-medium text-foreground">{e.source}</div>
                    <div className="truncate text-muted-foreground">{EVENT_LABEL[e.event]}</div>
                    <div className="truncate font-mono text-[12px] text-foreground">
                      {e.externalId}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-foreground">{e.customer}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {e.syncResult}
                      </div>
                    </div>
                    <div className="text-right font-tabular font-semibold text-foreground">
                      {e.amount > 0 ? currency(e.amount) : "—"}
                    </div>
                    <div className="text-[12px] text-muted-foreground">{fmtRelative(e.timestamp)}</div>
                    <div><SyncBadge status={e.status} /></div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                    No events match these filters.
                  </div>
                )}
              </div>
            </Card>
          </>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {DEMO_SYSTEMS.map((s) => (
              <Card key={s.id} className="border-border/70 bg-surface p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[15px] font-semibold text-foreground">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {s.category} · {s.environment}
                    </div>
                  </div>
                  <HealthBadge status={s.status} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <MiniStat label="OK 24h" value={s.successCount24h.toString()} tone="ok" />
                  <MiniStat
                    label="Failed 24h"
                    value={s.failedCount24h.toString()}
                    tone={s.failedCount24h > 0 ? "warn" : "muted"}
                  />
                  <MiniStat
                    label="Pending"
                    value={s.pendingCount.toString()}
                    tone={s.pendingCount > 0 ? "warn" : "muted"}
                  />
                </div>

                <div className="mt-3 text-[12px] text-muted-foreground">
                  Last sync {fmtRelative(s.lastSync)}
                </div>
                {s.retryStatus && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-warning">
                    <RefreshCw className="h-3 w-3" />
                    {s.retryStatus}
                  </div>
                )}

                <div className="mt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Scopes
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.scopes.map((sc) => (
                      <Badge
                        key={sc}
                        variant="outline"
                        className="h-5 border-border/70 bg-background text-[10px] font-mono font-normal text-muted-foreground"
                      >
                        {sc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageBody>
    </AppShell>
  );
}

function FilterGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ id: T; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-md border px-2.5 py-1 text-[12px] font-medium transition",
            value === o.id
              ? "border-brand/40 bg-brand/10 text-brand"
              : "border-border/60 bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SyncBadge({ status }: { status: SyncStatus }) {
  const map = {
    success: { cls: "bg-success/10 text-success ring-success/20", Icon: CheckCircle2, label: "Success" },
    pending: { cls: "bg-muted text-muted-foreground ring-border", Icon: Clock, label: "Pending" },
    retrying: { cls: "bg-warning/15 text-warning ring-warning/25", Icon: RefreshCw, label: "Retrying" },
    failed: { cls: "bg-destructive/10 text-destructive ring-destructive/20", Icon: XCircle, label: "Failed" },
  } as const;
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        m.cls,
      )}
    >
      <m.Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function HealthBadge({ status }: { status: "healthy" | "degraded" | "failed" }) {
  const map = {
    healthy: { cls: "bg-success/10 text-success ring-success/20", Icon: CheckCircle2 },
    degraded: { cls: "bg-warning/15 text-warning ring-warning/25", Icon: AlertTriangle },
    failed: { cls: "bg-destructive/10 text-destructive ring-destructive/20", Icon: XCircle },
  } as const;
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        m.cls,
      )}
    >
      <m.Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "muted";
}) {
  const cls =
    tone === "ok" ? "text-success" : tone === "warn" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-md border border-border/60 bg-background px-2 py-2 text-center">
      <div className={cn("font-tabular text-[16px] font-bold", cls)}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
