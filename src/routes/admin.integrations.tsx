import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listIntegrationSources,
  upsertIntegrationSource,
  setIntegrationSourceActive,
  listIntegrationEventMappings,
  upsertIntegrationEventMapping,
  deleteIntegrationEventMapping,
  listFailedSyncHistory,
  markSyncRetry,
} from "@/lib/accounting/integrations.functions";
import { Plug, RefreshCw, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations Admin — LedgerOS" },
      {
        name: "description",
        content: "Configure source systems, event mappings, and retry failed inbound calls.",
      },
      { property: "og:title", content: "Integrations Admin — LedgerOS" },
    ],
  }),
  component: IntegrationsAdminPage,
});

const LEDGER_OBJECTS = [
  "customer",
  "invoice",
  "payment",
  "refund",
  "inventory_consumption",
  "bill",
  "credit",
] as const;

const KINDS = ["inbound_api", "outbound_api", "webhook", "file_feed", "manual"] as const;

function IntegrationsAdminPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();

  const listSourcesFn = useServerFn(listIntegrationSources);
  const listMappingsFn = useServerFn(listIntegrationEventMappings);
  const listSyncFn = useServerFn(listFailedSyncHistory);

  const sourcesQ = useQuery({
    queryKey: ["integration-sources", orgId],
    queryFn: () => listSourcesFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const mappingsQ = useQuery({
    queryKey: ["integration-event-mappings", orgId],
    queryFn: () => listMappingsFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const syncQ = useQuery({
    queryKey: ["sync-history-failed", orgId],
    queryFn: () => listSyncFn({ data: { orgId: orgId!, status: "error", limit: 100 } }),
    enabled: !!orgId,
  });

  const upsertSource = useServerFn(upsertIntegrationSource);
  const toggleSource = useServerFn(setIntegrationSourceActive);
  const upsertMapping = useServerFn(upsertIntegrationEventMapping);
  const deleteMapping = useServerFn(deleteIntegrationEventMapping);
  const retryFn = useServerFn(markSyncRetry);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["integration-sources"] });
    qc.invalidateQueries({ queryKey: ["integration-event-mappings"] });
    qc.invalidateQueries({ queryKey: ["sync-history-failed"] });
  };

  // ---- New source form
  const [srcKey, setSrcKey] = useState("");
  const [srcName, setSrcName] = useState("");
  const [srcKind, setSrcKind] = useState<(typeof KINDS)[number]>("inbound_api");
  const [srcEmail, setSrcEmail] = useState("");
  const [srcNotes, setSrcNotes] = useState("");

  const submitSource = async () => {
    if (!orgId || !srcKey || !srcName) return;
    try {
      await upsertSource({
        data: {
          orgId,
          sourceKey: srcKey,
          name: srcName,
          kind: srcKind,
          active: true,
          contactEmail: srcEmail || null,
          notes: srcNotes || null,
        },
      });
      toast.success(`Source ${srcName} saved`);
      setSrcKey("");
      setSrcName("");
      setSrcEmail("");
      setSrcNotes("");
      invalidateAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  };

  // ---- New mapping form
  const [mSource, setMSource] = useState<string>("");
  const [mEvent, setMEvent] = useState<string>("");
  const [mObject, setMObject] = useState<(typeof LEDGER_OBJECTS)[number]>("invoice");
  const [mPurpose, setMPurpose] = useState<string>("");
  const [mDesc, setMDesc] = useState<string>("");

  const submitMapping = async () => {
    if (!orgId || !mSource || !mEvent) return;
    try {
      await upsertMapping({
        data: {
          orgId,
          sourceId: mSource,
          externalEventType: mEvent,
          ledgerObject: mObject,
          accountPurpose: mPurpose || null,
          active: true,
          description: mDesc || null,
        },
      });
      toast.success(`Mapping saved for ${mEvent}`);
      setMEvent("");
      setMPurpose("");
      setMDesc("");
      invalidateAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  };

  const sources = sourcesQ.data ?? [];
  const mappings = mappingsQ.data ?? [];
  const sync = syncQ.data ?? [];

  const sourceById = useMemo(() => new Map(sources.map((s: any) => [s.id, s])), [sources]);

  return (
    <AppShell>
      <PageHeader
        title="Integrations Admin"
        description="Register source systems, map external events to LedgerOS financial objects, and manage retry queues."
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* --- Sources --- */}
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Plug className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Source Systems</h2>
              <Badge variant="outline" className="ml-auto">
                {sources.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {sources.map((s: any) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded border border-border/60 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {s.source_key} · {s.kind}
                    </div>
                  </div>
                  <Badge variant={s.active ? "default" : "secondary"}>
                    {s.active ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={s.active}
                    onCheckedChange={async (v) => {
                      try {
                        await toggleSource({ data: { orgId: orgId!, id: s.id, active: v } });
                        invalidateAll();
                      } catch (e: any) {
                        toast.error(e.message);
                      }
                    }}
                  />
                </div>
              ))}
              {sources.length === 0 && !sourcesQ.isLoading && (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  No source systems yet.
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
              <div className="text-xs font-medium text-muted-foreground">Register new source</div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="source_key (e.g. serviceconnect)"
                  value={srcKey}
                  onChange={(e) => setSrcKey(e.target.value.toLowerCase())}
                />
                <Input
                  placeholder="Display name"
                  value={srcName}
                  onChange={(e) => setSrcName(e.target.value)}
                />
                <Select value={srcKind} onValueChange={(v) => setSrcKind(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Contact email (optional)"
                  value={srcEmail}
                  onChange={(e) => setSrcEmail(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Notes (optional)"
                value={srcNotes}
                onChange={(e) => setSrcNotes(e.target.value)}
                rows={2}
              />
              <Button size="sm" onClick={submitSource} disabled={!srcKey || !srcName}>
                Register source
              </Button>
            </div>
          </Card>

          {/* --- Event mappings --- */}
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Plug className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Event Mappings</h2>
              <Badge variant="outline" className="ml-auto">
                {mappings.length}
              </Badge>
            </div>
            <div className="space-y-2 max-h-80 overflow-auto">
              {mappings.map((m: any) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded border border-border/60 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono truncate">{m.external_event_type}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {(sourceById.get(m.source_id) as any)?.name ?? "—"} → {m.ledger_object}
                      {m.account_purpose ? ` · ${m.account_purpose}` : ""}
                    </div>
                  </div>
                  <Badge variant={m.active ? "default" : "secondary"}>
                    {m.active ? "on" : "off"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        await deleteMapping({ data: { orgId: orgId!, id: m.id } });
                        invalidateAll();
                      } catch (e: any) {
                        toast.error(e.message);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {mappings.length === 0 && !mappingsQ.isLoading && (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  No mappings yet.
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
              <div className="text-xs font-medium text-muted-foreground">Add mapping</div>
              <Select value={mSource} onValueChange={setMSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Source system" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="external_event_type (e.g. work_order.completed)"
                value={mEvent}
                onChange={(e) => setMEvent(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={mObject} onValueChange={(v) => setMObject(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEDGER_OBJECTS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="account_purpose (optional)"
                  value={mPurpose}
                  onChange={(e) => setMPurpose(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Description (optional)"
                rows={2}
                value={mDesc}
                onChange={(e) => setMDesc(e.target.value)}
              />
              <Button size="sm" onClick={submitMapping} disabled={!mSource || !mEvent}>
                Save mapping
              </Button>
            </div>
          </Card>
        </div>

        {/* --- Sync history / retry queue --- */}
        <Card className="mt-6 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold">Failed Inbound Calls</h2>
            <Badge variant="outline" className="ml-auto">
              {sync.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => qc.invalidateQueries({ queryKey: ["sync-history-failed"] })}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Refresh
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/60">
                  <th className="pb-2 pr-4">When</th>
                  <th className="pb-2 pr-4">Source</th>
                  <th className="pb-2 pr-4">Endpoint</th>
                  <th className="pb-2 pr-4">External ID</th>
                  <th className="pb-2 pr-4">Error</th>
                  <th className="pb-2 pr-4">Retries</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {sync.map((r: any) => (
                  <tr key={r.id} className="border-b border-border/40">
                    <td className="py-2 pr-4 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{r.source}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{r.endpoint}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{r.external_id ?? "—"}</td>
                    <td
                      className="py-2 pr-4 text-xs text-destructive max-w-xs truncate"
                      title={r.error ?? ""}
                    >
                      {r.error ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-xs">{r.retry_count ?? 0}</td>
                    <td className="py-2 pr-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await retryFn({ data: { orgId: orgId!, id: r.id } });
                            toast.success(
                              "Retry signal recorded — re-post with same Idempotency-Key.",
                            );
                            invalidateAll();
                          } catch (e: any) {
                            toast.error(e.message);
                          }
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Retry
                      </Button>
                    </td>
                  </tr>
                ))}
                {sync.length === 0 && !syncQ.isLoading && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-xs text-muted-foreground">
                      <CheckCircle2 className="inline h-4 w-4 mr-1 text-emerald-500" />
                      No failed inbound calls.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Retry signals record an operator request in the audit log and stamp
            <code className="mx-1">retry_count</code>. The upstream integrator replays the call
            using the same <code>Idempotency-Key</code>; LedgerOS never re-executes business logic
            on its own.
          </p>
        </Card>
      </PageBody>
    </AppShell>
  );
}
