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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listFinancialEvents,
  approveFinancialEvent,
  rejectFinancialEvent,
  listEventRules,
  upsertEventRule,
  deleteEventRule,
  materializeFinancialEvent,
  retryMaterialization,
  listMaterializations,
} from "@/lib/accounting/financial-events.functions";
import { CheckCircle2, XCircle, Trash2, Play, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/financial-events")({
  head: () => ({
    meta: [
      { title: "Financial Event Bus — LedgerOS" },
      { name: "description", content: "Review, approve, and reject financial events from external systems." },
      { property: "og:title", content: "Financial Event Bus — LedgerOS" },
    ],
  }),
  component: FinancialEventsPage,
});

const STATUS_TONE: Record<string, string> = {
  received: "bg-muted text-muted-foreground",
  validated: "bg-muted text-muted-foreground",
  mapped: "bg-blue-500/10 text-blue-500",
  pending_approval: "bg-amber-500/10 text-amber-500",
  approved: "bg-emerald-500/10 text-emerald-500",
  materialized: "bg-emerald-600/20 text-emerald-500",
  rejected: "bg-red-500/10 text-red-500",
  error: "bg-red-500/10 text-red-500",
};

const STATUS_OPTIONS = [
  "all", "received", "validated", "mapped",
  "pending_approval", "approved", "materialized", "rejected", "error",
] as const;

function FinancialEventsPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("pending_approval");
  const [ruleDraft, setRuleDraft] = useState({
    name: "", priority: 100, active: true,
    source_system: "", external_event_type: "", ledger_object: "",
    auto_approve: false, require_approval: false,
  });

  const listEventsFn = useServerFn(listFinancialEvents);
  const listRulesFn = useServerFn(listEventRules);
  const approveFn = useServerFn(approveFinancialEvent);
  const rejectFn = useServerFn(rejectFinancialEvent);
  const upsertRuleFn = useServerFn(upsertEventRule);
  const deleteRuleFn = useServerFn(deleteEventRule);
  const materializeFn = useServerFn(materializeFinancialEvent);
  const retryFn = useServerFn(retryMaterialization);
  const listMatFn = useServerFn(listMaterializations);

  const eventsQ = useQuery({
    queryKey: ["financial-events", orgId, status],
    queryFn: () => listEventsFn({ data: { orgId: orgId!, status, limit: 200 } }),
    enabled: !!orgId,
  });
  const rulesQ = useQuery({
    queryKey: ["financial-event-rules", orgId],
    queryFn: () => listRulesFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const materializationsQ = useQuery({
    queryKey: ["financial-event-materializations", orgId],
    queryFn: () => listMatFn({ data: { orgId: orgId!, status: "all", limit: 200 } }),
    enabled: !!orgId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["financial-events"] });
    qc.invalidateQueries({ queryKey: ["financial-event-rules"] });
    qc.invalidateQueries({ queryKey: ["financial-event-materializations"] });
  };

  const handleMaterialize = async (id: string) => {
    try {
      const res = await materializeFn({ data: { orgId: orgId!, id } });
      if (res.status === "completed") {
        toast.success(`Materialized → ${res.target_object_type}`);
      } else {
        toast.error(`Materialization ${res.status}: ${res.error_message ?? res.error_code ?? ""}`);
      }
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Materialization failed");
    }
  };

  const handleRetry = async (eventId: string) => {
    try {
      await retryFn({ data: { orgId: orgId!, id: eventId } });
      toast.success("Retry attempted");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Retry failed");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveFn({ data: { orgId: orgId!, id } });
      toast.success("Event approved");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval failed");
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await rejectFn({ data: { orgId: orgId!, id, reason } });
      toast.success("Event rejected");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Rejection failed");
    }
  };

  const handleCreateRule = async () => {
    if (!ruleDraft.name.trim()) return toast.error("Name is required");
    const conditions: Record<string, string> = {};
    if (ruleDraft.source_system) conditions.source_system = ruleDraft.source_system;
    if (ruleDraft.external_event_type) conditions.external_event_type = ruleDraft.external_event_type;
    if (ruleDraft.ledger_object) conditions.ledger_object = ruleDraft.ledger_object;
    const actions: Record<string, boolean> = {};
    if (ruleDraft.auto_approve) actions.auto_approve = true;
    if (ruleDraft.require_approval) actions.require_approval = true;
    try {
      await upsertRuleFn({
        data: {
          orgId: orgId!,
          name: ruleDraft.name,
          priority: ruleDraft.priority,
          active: ruleDraft.active,
          conditions,
          actions,
        },
      });
      toast.success("Rule saved");
      setRuleDraft({ name: "", priority: 100, active: true, source_system: "", external_event_type: "", ledger_object: "", auto_approve: false, require_approval: false });
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm("Delete this rule?")) return;
    try {
      await deleteRuleFn({ data: { orgId: orgId!, id } });
      toast.success("Rule deleted");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const rows = eventsQ.data ?? [];
  const rules = rulesQ.data ?? [];

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="M6"
        title="Financial Event Bus"
        description="External systems record events here — never journal entries. Approve, reject, or configure rules."
      />
      <PageBody>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={status} onValueChange={(v) => setStatus(v as typeof STATUS_OPTIONS[number])}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}{counts[s] ? ` (${counts[s]})` : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {rows.length} event{rows.length === 1 ? "" : "s"}
          </div>
        </div>

        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="p-3">Received</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">External ID</th>
                  <th className="p-3">Ledger Object</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No events at this status.</td></tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3">{r.source_system}</td>
                    <td className="p-3 font-mono text-xs">{r.external_event_type}</td>
                    <td className="p-3 font-mono text-xs">{r.external_id ?? "—"}</td>
                    <td className="p-3">{r.ledger_object ?? "—"}</td>
                    <td className="p-3">
                      <Badge className={STATUS_TONE[r.status] ?? "bg-muted"}>{r.status}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      {["pending_approval", "mapped", "validated"].includes(r.status) && (
                        <div className="inline-flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleApprove(r.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(r.id)}>
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Rules</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Highest priority (lowest number) wins. Match by any combination of source system, event type, and mapped ledger object.
          </p>
          <Card className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Rule name" value={ruleDraft.name} onChange={(e) => setRuleDraft({ ...ruleDraft, name: e.target.value })} />
              <Input placeholder="source_system (optional)" value={ruleDraft.source_system} onChange={(e) => setRuleDraft({ ...ruleDraft, source_system: e.target.value })} />
              <Input placeholder="external_event_type (optional)" value={ruleDraft.external_event_type} onChange={(e) => setRuleDraft({ ...ruleDraft, external_event_type: e.target.value })} />
              <Input placeholder="ledger_object (optional)" value={ruleDraft.ledger_object} onChange={(e) => setRuleDraft({ ...ruleDraft, ledger_object: e.target.value })} />
              <Input type="number" placeholder="priority" value={ruleDraft.priority} onChange={(e) => setRuleDraft({ ...ruleDraft, priority: Number(e.target.value) })} />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><Switch checked={ruleDraft.auto_approve} onCheckedChange={(v) => setRuleDraft({ ...ruleDraft, auto_approve: v, require_approval: v ? false : ruleDraft.require_approval })} /> auto_approve</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={ruleDraft.require_approval} onCheckedChange={(v) => setRuleDraft({ ...ruleDraft, require_approval: v, auto_approve: v ? false : ruleDraft.auto_approve })} /> require_approval</label>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateRule}>Add rule</Button>
            </div>
          </Card>

          <Card className="mt-4 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Conditions</th>
                  <th className="p-3">Actions</th>
                  <th className="p-3">Active</th>
                  <th className="p-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No rules configured — events default to <code>requires_approval=true</code>.</td></tr>
                ) : rules.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3">{r.priority}</td>
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 font-mono text-xs">{JSON.stringify(r.conditions)}</td>
                    <td className="p-3 font-mono text-xs">{JSON.stringify(r.actions)}</td>
                    <td className="p-3">{r.active ? <Badge>on</Badge> : <Badge variant="outline">off</Badge>}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteRule(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </PageBody>
    </AppShell>
  );
}
