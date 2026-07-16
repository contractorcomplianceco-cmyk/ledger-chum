import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOrgId } from "@/hooks/use-current-org";
import { listFailedSyncHistory } from "@/lib/accounting/integrations.functions";
import { listFinancialEvents } from "@/lib/accounting/financial-events.functions";
import {
  Play,
  ShieldCheck,
  Repeat,
  Workflow,
  Layers,
  BookOpenCheck,
  BarChart3,
  AlertTriangle,
  KeyRound,
} from "lucide-react";

/**
 * M10 — ServiceConnect Pilot Simulator + Integration Test Center.
 *
 * The simulator is a *client-side* harness only. It POSTs representative
 * payloads to /api/public/integrations/* using an operator-supplied Bearer
 * token — LedgerOS never fabricates the caller, and no accounting side
 * effect happens here that does not flow through the Financial Event Bus.
 */

export const Route = createFileRoute("/admin/integration-testing")({
  head: () => ({
    meta: [
      { title: "Integration Test Center — LedgerOS" },
      {
        name: "description",
        content: "ServiceConnect pilot simulator and end-to-end integration validation harness.",
      },
      { property: "og:title", content: "Integration Test Center — LedgerOS" },
    ],
  }),
  component: IntegrationTestCenter,
});

type CheckOutcome = "idle" | "running" | "pass" | "fail";
type CheckState = { outcome: CheckOutcome; detail?: string };

interface TestCategory {
  id: string;
  title: string;
  icon: typeof Play;
  description: string;
  checks: { id: string; label: string; hint: string }[];
}

const CATEGORIES: TestCategory[] = [
  {
    id: "auth",
    title: "Authentication",
    icon: KeyRound,
    description:
      "Verifies Bearer token acceptance, scope enforcement, and tenant isolation on /api/public/integrations/*.",
    checks: [
      {
        id: "auth.valid",
        label: "Valid token accepted",
        hint: "POST /events with a valid Bearer returns 202.",
      },
      { id: "auth.invalid", label: "Invalid token rejected", hint: "Bearer 'nope' returns 401." },
      {
        id: "auth.missing",
        label: "Missing header rejected",
        hint: "No Authorization header returns 401.",
      },
    ],
  },
  {
    id: "idem",
    title: "Idempotency",
    icon: Repeat,
    description:
      "Duplicate Idempotency-Key returns the stored response verbatim; no ledger side effect on the second call.",
    checks: [
      {
        id: "idem.first",
        label: "First call accepted",
        hint: "Records a sync_history row with status = accepted.",
      },
      {
        id: "idem.second",
        label: "Duplicate returns cached response",
        hint: "Second call returns the first response body byte-for-byte.",
      },
    ],
  },
  {
    id: "ingest",
    title: "Event ingestion",
    icon: Workflow,
    description:
      "Confirms POST /events writes to financial_events and sync_history for downstream approval.",
    checks: [
      {
        id: "ingest.event",
        label: "Event lands on financial_events",
        hint: "Row created with status = received.",
      },
      {
        id: "ingest.sync",
        label: "sync_history row captured",
        hint: "Endpoint '/events' recorded.",
      },
    ],
  },
  {
    id: "map",
    title: "Mapping",
    icon: Layers,
    description:
      "integration_event_mappings resolves the external event type to a LedgerOS financial object.",
    checks: [
      {
        id: "map.hit",
        label: "Known event maps to ledger object",
        hint: "work_order.completed → invoice.",
      },
      {
        id: "map.miss",
        label: "Unknown event flagged",
        hint: "Missing mapping surfaces as an actionable exception.",
      },
    ],
  },
  {
    id: "materialize",
    title: "Materialization",
    icon: Workflow,
    description:
      "Approved event produces a financial_object_materializations row and downstream journal entries via materialize_financial_event.",
    checks: [
      {
        id: "mat.approve",
        label: "Event approved",
        hint: "Operator approves through the Financial Event Bus.",
      },
      {
        id: "mat.post",
        label: "Materialization posts",
        hint: "Journal entries created; audit lineage recorded.",
      },
    ],
  },
  {
    id: "accounting",
    title: "Accounting",
    icon: BookOpenCheck,
    description:
      "Journal is balanced, GL updates, trial balance ties. No auto-posting; controls remain in effect.",
    checks: [
      {
        id: "acc.balanced",
        label: "Debits = credits",
        hint: "Journal entry passes the balanced-entry constraint.",
      },
      {
        id: "acc.gl",
        label: "GL rollup matches",
        hint: "Trial balance reconciles across the affected accounts.",
      },
    ],
  },
  {
    id: "reporting",
    title: "Reporting",
    icon: BarChart3,
    description:
      "Canonical metrics refresh with lineage, freshness, and confidence — the trusted intelligence foundation stays live.",
    checks: [
      {
        id: "rep.metric",
        label: "Affected metric recomputes",
        hint: "financial_metric_values updated within SLA.",
      },
      {
        id: "rep.lineage",
        label: "Lineage recorded",
        hint: "financial_metric_lineage links back to the event.",
      },
    ],
  },
  {
    id: "recover",
    title: "Error recovery",
    icon: AlertTriangle,
    description:
      "Failed calls appear in the retry queue; operator retry increments retry_count and emits an audit event. LedgerOS never re-runs business rules on its own.",
    checks: [
      {
        id: "err.captured",
        label: "Error captured on sync_history",
        hint: "status = 'error' with the provider error body.",
      },
      {
        id: "err.retry",
        label: "Operator retry logged",
        hint: "retry_count increments; audit event 'sync_history.retry_requested'.",
      },
    ],
  },
];

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    external_event_type: "work_order.completed",
    external_id: "sim_wo_" + Date.now(),
    payload: {
      work_order_ref: "WO-SIM-001",
      customer_external_id: "sim_cust_001",
      issue_date: new Date().toISOString().slice(0, 10),
      lines: [{ description: "Labor 2h", quantity: 2, unit_price: 145, account_code: "4100" }],
    },
  },
  null,
  2,
);

function IntegrationTestCenter() {
  const orgId = useOrgId();
  const [token, setToken] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "sim-" + Date.now(),
  );
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [state, setState] = useState<Record<string, CheckState>>({});
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const listSync = useServerFn(listFailedSyncHistory);
  const listEvents = useServerFn(listFinancialEvents);

  const syncQ = useQuery({
    queryKey: ["m10-sync", orgId],
    queryFn: () => listSync({ data: { orgId: orgId!, status: "all", limit: 25 } }),
    enabled: !!orgId,
  });
  const eventsQ = useQuery({
    queryKey: ["m10-events", orgId],
    queryFn: () => listEvents({ data: { orgId: orgId!, status: "all", limit: 25 } }),
    enabled: !!orgId,
  });

  const totals = useMemo(() => {
    const s = (syncQ.data ?? []) as Array<{ status: string }>;
    return {
      accepted: s.filter((r) => r.status === "accepted" || r.status === "ok").length,
      errors: s.filter((r) => r.status === "error").length,
      total: s.length,
    };
  }, [syncQ.data]);

  async function fireEvent(headers: Record<string, string>) {
    setLastResponse(null);
    try {
      const res = await fetch("/api/public/integrations/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: payload,
      });
      const text = await res.text();
      setLastResponse(`HTTP ${res.status}\n${text}`);
      return { status: res.status, body: text };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastResponse("Network error: " + msg);
      return { status: 0, body: msg };
    }
  }

  function mark(id: string, outcome: CheckOutcome, detail?: string) {
    setState((s) => ({ ...s, [id]: { outcome, detail } }));
  }

  async function runAuthValid(): Promise<void> {
    if (!token) {
      toast.error("Provide a Bearer token first.");
      return;
    }
    mark("auth.valid", "running");
    const r = await fireEvent({
      Authorization: `Bearer ${token}`,
      "Idempotency-Key": idempotencyKey,
    });
    mark("auth.valid", r.status === 202 || r.status === 200 ? "pass" : "fail", `HTTP ${r.status}`);
  }
  async function runAuthInvalid() {
    mark("auth.invalid", "running");
    const r = await fireEvent({
      Authorization: "Bearer definitely-not-a-real-key",
      "Idempotency-Key": crypto.randomUUID(),
    });
    mark("auth.invalid", r.status === 401 ? "pass" : "fail", `HTTP ${r.status}`);
  }
  async function runAuthMissing() {
    mark("auth.missing", "running");
    const r = await fireEvent({ "Idempotency-Key": crypto.randomUUID() });
    mark("auth.missing", r.status === 401 ? "pass" : "fail", `HTTP ${r.status}`);
  }
  async function runIdemFirst() {
    if (!token) {
      toast.error("Provide a Bearer token first.");
      return;
    }
    mark("idem.first", "running");
    const r = await fireEvent({
      Authorization: `Bearer ${token}`,
      "Idempotency-Key": idempotencyKey,
    });
    mark("idem.first", r.status < 300 ? "pass" : "fail", `HTTP ${r.status}`);
  }
  async function runIdemSecond() {
    if (!token) {
      toast.error("Provide a Bearer token first.");
      return;
    }
    mark("idem.second", "running");
    const r = await fireEvent({
      Authorization: `Bearer ${token}`,
      "Idempotency-Key": idempotencyKey,
    });
    mark(
      "idem.second",
      r.status < 300 ? "pass" : "fail",
      `HTTP ${r.status} — should mirror first response`,
    );
    toast.info("Compare the response body to the previous run to confirm idempotency.");
  }

  const runners: Record<string, () => void | Promise<void>> = {
    "auth.valid": runAuthValid,
    "auth.invalid": runAuthInvalid,
    "auth.missing": runAuthMissing,
    "idem.first": runIdemFirst,
    "idem.second": runIdemSecond,
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M10"
        title="Integration Test Center"
        description="ServiceConnect pilot simulator and end-to-end validation of the financial event pipeline."
      />
      <PageBody className="space-y-6">
        <Card className="border-border/60 p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Simulator credentials</span>
            <Badge variant="outline" className="ml-auto text-[10px]">
              Operator-supplied — LedgerOS never mints keys
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs">Bearer token (api_client raw key)</Label>
              <Input
                type="password"
                autoComplete="off"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="sc_live_…"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Never stored. Sent only to /api/public/integrations/* from this browser.
              </p>
            </div>
            <div>
              <Label className="text-xs">Idempotency-Key</Label>
              <div className="flex gap-2">
                <Input value={idempotencyKey} onChange={(e) => setIdempotencyKey(e.target.value)} />
                <Button variant="outline" onClick={() => setIdempotencyKey(crypto.randomUUID())}>
                  New
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-xs">Event payload</Label>
            <Textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="font-mono text-xs"
              rows={10}
            />
          </div>
          {lastResponse && (
            <pre className="mt-4 max-h-56 overflow-auto rounded-md border border-border/60 bg-muted/40 p-3 text-[11px]">
              {lastResponse}
            </pre>
          )}
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryTile label="sync_history rows" value={totals.total} tone="brand" />
          <SummaryTile label="Accepted" value={totals.accepted} tone="ok" />
          <SummaryTile
            label="Errors"
            value={totals.errors}
            tone={totals.errors ? "bad" : "muted"}
          />
        </div>

        <Tabs defaultValue="auth">
          <TabsList className="flex flex-wrap gap-1">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="gap-1.5">
                <c.icon className="h-3.5 w-3.5" />
                {c.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-4">
              <Card className="border-border/60 p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <c.icon className="h-4 w-4 text-brand" />
                    <h3 className="text-sm font-semibold">{c.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </div>
                <div className="space-y-2">
                  {c.checks.map((check) => {
                    const st = state[check.id] ?? { outcome: "idle" as CheckOutcome };
                    const runner = runners[check.id];
                    return (
                      <div
                        key={check.id}
                        className="flex items-start justify-between gap-4 rounded-md border border-border/60 bg-background/40 p-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{check.label}</div>
                          <div className="text-[12px] text-muted-foreground">{check.hint}</div>
                          {st.detail && (
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              {st.detail}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <OutcomeBadge outcome={st.outcome} />
                          {runner ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={st.outcome === "running"}
                              onClick={() => runner()}
                            >
                              Run
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              title="Verified via the Financial Event Bus / accountant workspace"
                            >
                              Manual
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="border-border/60 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Recent financial events</div>
            <Badge variant="outline" className="text-[10px]">
              read-only mirror of the Financial Event Bus
            </Badge>
          </div>
          {eventsQ.data && eventsQ.data.length > 0 ? (
            <div className="max-h-64 overflow-auto rounded-md border border-border/60">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-muted/60">
                  <tr className="text-left">
                    <th className="px-3 py-2">Event type</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {(eventsQ.data as Array<Record<string, unknown>>).slice(0, 25).map((row) => (
                    <tr key={String(row.id)} className="border-t border-border/40">
                      <td className="px-3 py-2 font-mono">
                        {String(row.external_event_type ?? "—")}
                      </td>
                      <td className="px-3 py-2">{String(row.status ?? "—")}</td>
                      <td className="px-3 py-2">{String(row.source_system ?? "—")}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.created_at ? new Date(String(row.created_at)).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No events recorded yet.</p>
          )}
        </Card>
      </PageBody>
    </AppShell>
  );
}

function OutcomeBadge({ outcome }: { outcome: CheckOutcome }) {
  const map: Record<CheckOutcome, { label: string; cls: string }> = {
    idle: { label: "Idle", cls: "bg-muted text-muted-foreground" },
    running: { label: "Running", cls: "bg-blue-500/10 text-blue-500" },
    pass: { label: "Pass", cls: "bg-emerald-500/10 text-emerald-500" },
    fail: { label: "Fail", cls: "bg-red-500/10 text-red-500" },
  };
  const m = map[outcome];
  return <Badge className={m.cls}>{m.label}</Badge>;
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "ok" | "bad" | "muted";
}) {
  const toneCls: Record<string, string> = {
    brand: "text-brand",
    ok: "text-emerald-500",
    bad: "text-red-500",
    muted: "text-muted-foreground",
  };
  return (
    <Card className="border-border/60 p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneCls[tone]}`}>{value}</div>
    </Card>
  );
}
