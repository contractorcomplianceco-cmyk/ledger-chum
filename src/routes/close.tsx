import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listPeriodsWithClose,
  getCloseRun,
  startPeriodClose,
  setCloseTaskStatus,
  approvePeriodClose,
  reopenPeriod,
} from "@/lib/accounting/close.functions";
import { CheckCircle2, Circle, XCircle, PlayCircle, Lock, Unlock, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/close")({
  head: () => ({
    meta: [
      { title: "Monthly Close — LedgerOS" },
      { name: "description", content: "Checklist-driven month-end close with approvals and period locking." },
      { property: "og:title", content: "Monthly Close — LedgerOS" },
      { property: "og:description", content: "Checklist-driven month-end close with approvals and period locking." },
    ],
  }),
  component: ClosePage,
});

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

function ClosePage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const listFn = useServerFn(listPeriodsWithClose);
  const runFn = useServerFn(getCloseRun);
  const startFn = useServerFn(startPeriodClose);
  const taskFn = useServerFn(setCloseTaskStatus);
  const approveFn = useServerFn(approvePeriodClose);
  const reopenFn = useServerFn(reopenPeriod);

  const periodsQ = useQuery({
    queryKey: ["close.periods", orgId],
    queryFn: () => listFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const runQ = useQuery({
    queryKey: ["close.run", selectedRunId],
    queryFn: () => runFn({ data: { closeRunId: selectedRunId! } }),
    enabled: !!selectedRunId,
  });

  const [approveNote, setApproveNote] = useState("");
  const [reopenReason, setReopenReason] = useState("");

  const start = async (periodId: string) => {
    if (!orgId) return;
    try {
      const res = await startFn({ data: { orgId, periodId } });
      toast.success("Close started");
      setSelectedRunId(res.close_run_id);
      qc.invalidateQueries({ queryKey: ["close.periods"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start close");
    }
  };

  const updateTask = async (taskId: string, status: "done" | "skipped" | "blocked" | "pending") => {
    try {
      await taskFn({ data: { taskId, status } });
      qc.invalidateQueries({ queryKey: ["close.run", selectedRunId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update task");
    }
  };

  const approve = async () => {
    if (!selectedRunId) return;
    try {
      await approveFn({ data: { closeRunId: selectedRunId, note: approveNote || undefined } });
      toast.success("Close approved — period locked");
      setApproveNote("");
      qc.invalidateQueries({ queryKey: ["close.periods"] });
      qc.invalidateQueries({ queryKey: ["close.run", selectedRunId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval failed");
    }
  };

  const reopen = async (periodId: string) => {
    if (!orgId || !reopenReason) return;
    try {
      await reopenFn({ data: { orgId, periodId, reason: reopenReason } });
      toast.success("Period reopened");
      setReopenReason("");
      qc.invalidateQueries({ queryKey: ["close.periods"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reopen failed");
    }
  };

  const periods = periodsQ.data ?? [];
  const currentRun = runQ.data;
  const tasks = currentRun?.tasks ?? [];
  const doneRequired = tasks.filter((t) => t.required && (t.status === "done" || t.status === "skipped")).length;
  const totalRequired = tasks.filter((t) => t.required).length;
  const progressPct = totalRequired > 0 ? Math.round((doneRequired / totalRequired) * 100) : 0;

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M4"
        title="Monthly Close"
        description="Checklist-driven close with approvals, trial-balance validation, and period locking."
      />
      <PageBody>
        {!orgId ? (
          <Card className="p-6 text-sm text-muted-foreground">Sign in to run the close workflow.</Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
            {/* Periods list */}
            <Card className="p-3">
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Fiscal periods
              </div>
              <div className="divide-y divide-border/60">
                {periods.map((p) => {
                  const active = p.close_run?.id === selectedRunId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => p.close_run && setSelectedRunId(p.close_run.id)}
                      className={`w-full text-left p-3 hover:bg-muted/50 rounded-md transition-colors ${
                        active ? "bg-muted/60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          Period {p.period_number}
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {fmtDate(p.start_date)} → {fmtDate(p.end_date)}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {!p.close_run && p.status === "open" && (
                          <Button size="sm" className="h-7 text-[12px]" onClick={(e) => { e.stopPropagation(); start(p.id); }}>
                            <PlayCircle className="mr-1 h-3 w-3" /> Start close
                          </Button>
                        )}
                        {p.close_run && (
                          <Badge variant="outline" className="text-[10px]">
                            Close run: {p.close_run.status.replace("_", " ")}
                          </Badge>
                        )}
                        {p.status === "closed" && (
                          <div className="flex items-center gap-1">
                            <Input
                              placeholder="Reason…"
                              value={reopenReason}
                              onChange={(e) => { e.stopPropagation(); setReopenReason(e.target.value); }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-7 text-[11px] w-24"
                            />
                            <Button
                              size="sm" variant="ghost" className="h-7 text-[12px]"
                              disabled={!reopenReason}
                              onClick={(e) => { e.stopPropagation(); reopen(p.id); }}
                            >
                              <Unlock className="mr-1 h-3 w-3" /> Reopen
                            </Button>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                {periods.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">
                    No fiscal periods yet. Create a fiscal year in Settings first.
                  </div>
                )}
              </div>
            </Card>

            {/* Close run detail */}
            <div className="space-y-4">
              {!currentRun ? (
                <Card className="p-8 text-sm text-muted-foreground text-center">
                  Select a period on the left to view or start its close.
                </Card>
              ) : (
                <>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Close run · {currentRun.run.status.replace("_", " ")}
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          Period {currentRun.run.fiscal_periods?.period_number}
                        </div>
                        <div className="text-[12px] text-muted-foreground">
                          Started {fmtDate(currentRun.run.started_at)}
                          {currentRun.run.completed_at && ` · Completed ${fmtDate(currentRun.run.completed_at)}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold tabular-nums">{progressPct}%</div>
                        <div className="text-[11px] text-muted-foreground">
                          {doneRequired}/{totalRequired} required tasks
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="overflow-hidden">
                    <div className="border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Close checklist
                    </div>
                    <div className="divide-y divide-border/60">
                      {tasks.map((t) => (
                        <div key={t.id} className="p-3 flex items-center gap-3">
                          <TaskIcon status={t.status} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium flex items-center gap-2">
                              {t.title}
                              {!t.required && <span className="text-[10px] text-muted-foreground uppercase">optional</span>}
                              <span className="text-[10px] text-muted-foreground uppercase">{t.category}</span>
                            </div>
                            {t.note && <div className="text-[11px] text-muted-foreground mt-0.5">{t.note}</div>}
                          </div>
                          <div className="flex items-center gap-1">
                            {t.status !== "done" && (
                              <Button size="sm" variant="ghost" className="h-7 text-[12px]"
                                onClick={() => updateTask(t.id, "done")}
                                disabled={currentRun.run.status !== "in_progress"}
                              >
                                Mark done
                              </Button>
                            )}
                            {t.status === "done" && (
                              <Button size="sm" variant="ghost" className="h-7 text-[12px]"
                                onClick={() => updateTask(t.id, "pending")}
                                disabled={currentRun.run.status !== "in_progress"}
                              >
                                Undo
                              </Button>
                            )}
                            {!t.required && t.status !== "skipped" && (
                              <Button size="sm" variant="ghost" className="h-7 text-[12px]"
                                onClick={() => updateTask(t.id, "skipped")}
                                disabled={currentRun.run.status !== "in_progress"}
                              >
                                Skip
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {currentRun.run.status === "in_progress" && (
                    <Card className="p-4">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4" /> Approve & lock period
                      </div>
                      <div className="text-[12px] text-muted-foreground mt-1">
                        All required tasks must be done and the trial balance must be balanced.
                      </div>
                      <Textarea
                        placeholder="Approval note (optional)…"
                        value={approveNote}
                        onChange={(e) => setApproveNote(e.target.value)}
                        className="mt-3 text-[12px]"
                        rows={2}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button onClick={approve} disabled={doneRequired < totalRequired}>
                          <Lock className="mr-2 h-4 w-4" /> Approve & lock
                        </Button>
                      </div>
                    </Card>
                  )}

                  {currentRun.approvals.length > 0 && (
                    <Card className="p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Approvals
                      </div>
                      {currentRun.approvals.map((a) => (
                        <div key={a.id} className="text-[12px] py-1">
                          <span className="font-semibold capitalize">{a.decision}</span>
                          {a.note && <span className="text-muted-foreground"> · {a.note}</span>}
                          <span className="text-muted-foreground"> · {fmtDate(a.created_at)}</span>
                        </div>
                      ))}
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </PageBody>
    </AppShell>
  );
}

function TaskIcon({ status }: { status: string }) {
  if (status === "done") return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
  if (status === "skipped") return <Circle className="h-5 w-5 text-muted-foreground shrink-0" />;
  if (status === "blocked") return <XCircle className="h-5 w-5 text-destructive shrink-0" />;
  return <Circle className="h-5 w-5 text-muted-foreground shrink-0" />;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    pending_close: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
    closed: "bg-slate-500/10 text-slate-700 ring-slate-500/20",
    locked: "bg-slate-800/10 text-slate-900 ring-slate-800/20",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ring-1 ring-inset ${map[status] ?? ""}`}>
      {status.replace("_", " ")}
    </Badge>
  );
}
