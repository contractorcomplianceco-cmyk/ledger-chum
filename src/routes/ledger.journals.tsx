import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listJournals,
  getJournal,
  postManualJournal,
  reverseJournal,
} from "@/lib/accounting/journals.functions";
import { listAccountTree } from "@/lib/accounting/accounts.functions";
import { Plus, Trash2, CheckCircle2, AlertCircle, Undo2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/ledger/journals")({
  head: () => ({
    meta: [
      { title: "Journal Entries — LedgerOS" },
      {
        name: "description",
        content:
          "Create balanced manual journal entries, review posted journals, and issue reversals.",
      },
      { property: "og:title", content: "Journal Entries — LedgerOS" },
      {
        property: "og:description",
        content:
          "Post double-entry journals with balance enforcement, fiscal-period checks, and full audit trail.",
      },
    ],
  }),
  component: JournalsPage,
});

type LineDraft = { accountId: string; debit: string; credit: string; memo: string };

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function JournalsPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const listFn = useServerFn(listJournals);
  const accountsFn = useServerFn(listAccountTree);
  const postFn = useServerFn(postManualJournal);
  const reverseFn = useServerFn(reverseJournal);
  const getFn = useServerFn(getJournal);

  const [newOpen, setNewOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reverseTarget, setReverseTarget] = useState<{ id: string; memo: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"draft" | "posted" | "void" | undefined>(
    undefined,
  );

  const journalsQ = useQuery({
    queryKey: ["journals", orgId, statusFilter],
    queryFn: () => listFn({ data: { orgId: orgId!, status: statusFilter, limit: 100 } }),
    enabled: !!orgId,
    retry: false,
  });

  const accountsQ = useQuery({
    queryKey: ["accounts", orgId],
    queryFn: () => accountsFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
    retry: false,
  });

  const detailQ = useQuery({
    queryKey: ["journal", detailId],
    queryFn: () => getFn({ data: { id: detailId! } }),
    enabled: !!detailId,
    retry: false,
  });

  const postMut = useMutation({
    mutationFn: (input: {
      entryDate: string;
      memo: string;
      description: string;
      lines: Array<{ accountId: string; debit: number; credit: number; memo?: string }>;
    }) => postFn({ data: { orgId: orgId!, ...input } }),
    onSuccess: () => {
      toast.success("Journal posted");
      qc.invalidateQueries({ queryKey: ["journals", orgId] });
      qc.invalidateQueries({ queryKey: ["accounts", orgId] });
      setNewOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reverseMut = useMutation({
    mutationFn: (input: { journalId: string; reason: string }) =>
      reverseFn({ data: { orgId: orgId!, ...input } }),
    onSuccess: () => {
      toast.success("Reversal posted");
      qc.invalidateQueries({ queryKey: ["journals", orgId] });
      qc.invalidateQueries({ queryKey: ["accounts", orgId] });
      setReverseTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const journals = (journalsQ.data ?? []) as Array<{
    id: string;
    entry_date: string;
    memo: string | null;
    description: string | null;
    source_type: string | null;
    status: string;
    posted_at: string | null;
    reversal_of: string | null;
    reversed_by: string | null;
    total_debit: number;
    total_credit: number;
    line_count: number;
  }>;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Ledger"
        title="Journal Entries"
        description="Create balanced manual entries and issue reversals. Posted entries are immutable."
        actions={
          <>
            {orgId && (
              <Button onClick={() => setNewOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> New journal
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        {!orgId && (
          <Card className="border-dashed p-6 text-sm text-muted-foreground">
            Sign in to work with journals.
          </Card>
        )}
        {orgId && (
          <>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Status</Label>
              <Select
                value={statusFilter ?? "all"}
                onValueChange={(v) =>
                  setStatusFilter(v === "all" ? undefined : (v as "draft" | "posted" | "void"))
                }
              >
                <SelectTrigger className="h-9 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto text-xs text-muted-foreground">
                {journals.length} journal{journals.length === 1 ? "" : "s"}
              </div>
            </div>

            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Memo</th>
                    <th className="px-4 py-2 font-medium">Source</th>
                    <th className="px-4 py-2 text-right font-medium">Debit</th>
                    <th className="px-4 py-2 text-right font-medium">Credit</th>
                    <th className="px-4 py-2 text-right font-medium">Lines</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {journals.map((j) => (
                    <tr
                      key={j.id}
                      className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                      onClick={() => setDetailId(j.id)}
                    >
                      <td className="px-4 py-2 font-mono text-xs">{j.entry_date}</td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{j.memo}</div>
                        <div className="flex gap-1">
                          {j.reversal_of && (
                            <Badge variant="outline" className="mt-0.5 h-4 text-[9px]">
                              Reversal
                            </Badge>
                          )}
                          {j.reversed_by && (
                            <Badge
                              variant="outline"
                              className="mt-0.5 h-4 text-[9px] text-amber-500"
                            >
                              Reversed
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs uppercase text-muted-foreground">
                        {j.source_type}
                      </td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">
                        {fmt(Number(j.total_debit))}
                      </td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">
                        {fmt(Number(j.total_credit))}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">
                        {j.line_count}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={j.status === "posted" ? "default" : "outline"}
                          className={cn(j.status === "void" && "text-muted-foreground")}
                        >
                          {j.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right">
                        {j.status === "posted" && !j.reversed_by && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReverseTarget({ id: j.id, memo: j.memo ?? "" });
                            }}
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {journals.length === 0 && !journalsQ.isLoading && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        No journals.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </PageBody>

      {orgId && (
        <NewJournalDialog
          open={newOpen}
          onOpenChange={setNewOpen}
          accounts={
            (accountsQ.data ?? []) as Array<{
              account_id: string;
              code: string;
              name: string;
              type: string;
              is_active: boolean;
            }>
          }
          onSubmit={(v) => postMut.mutate(v)}
          busy={postMut.isPending}
        />
      )}

      <JournalDetailDialog
        journal={(detailQ.data as unknown as JournalDetail) ?? null}
        open={!!detailId}
        onOpenChange={(o) => {
          if (!o) setDetailId(null);
        }}
      />

      <ReverseDialog
        target={reverseTarget}
        onCancel={() => setReverseTarget(null)}
        onConfirm={(reason) =>
          reverseTarget && reverseMut.mutate({ journalId: reverseTarget.id, reason })
        }
        busy={reverseMut.isPending}
      />
    </AppShell>
  );
}

// ---------- New Journal dialog ----------

function NewJournalDialog({
  open,
  onOpenChange,
  accounts,
  onSubmit,
  busy,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  accounts: Array<{
    account_id: string;
    code: string;
    name: string;
    type: string;
    is_active: boolean;
  }>;
  onSubmit: (v: {
    entryDate: string;
    memo: string;
    description: string;
    lines: Array<{ accountId: string; debit: number; credit: number; memo?: string }>;
  }) => void;
  busy: boolean;
}) {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([
    { accountId: "", debit: "", credit: "", memo: "" },
    { accountId: "", debit: "", credit: "", memo: "" },
  ]);

  const totals = useMemo(() => {
    const d = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const c = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    return { d, c, diff: d - c };
  }, [lines]);

  const canSubmit =
    memo.trim().length > 0 &&
    lines.length >= 2 &&
    lines.every((l) => l.accountId && Number(l.debit) > 0 !== Number(l.credit) > 0) &&
    Math.abs(totals.diff) < 0.005 &&
    totals.d > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New journal entry</DialogTitle>
          <DialogDescription>
            Debits must equal credits. Posted journals are immutable — use a reversal to correct
            mistakes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>Memo</Label>
              <Input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Adjusting entry — depreciation"
              />
            </div>
            <div className="col-span-3">
              <Label>Description (optional)</Label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Account</th>
                  <th className="px-3 py-2 font-medium">Memo</th>
                  <th className="px-3 py-2 text-right font-medium">Debit</th>
                  <th className="px-3 py-2 text-right font-medium">Credit</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-2 py-1.5">
                      <Select
                        value={l.accountId}
                        onValueChange={(v) =>
                          setLines((prev) =>
                            prev.map((p, j) => (j === i ? { ...p, accountId: v } : p)),
                          )
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts
                            .filter((a) => a.is_active)
                            .map((a) => (
                              <SelectItem key={a.account_id} value={a.account_id}>
                                {a.code} — {a.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        className="h-8"
                        value={l.memo}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((p, j) => (j === i ? { ...p, memo: e.target.value } : p)),
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        className="h-8 text-right font-mono tabular-nums"
                        type="number"
                        step="0.01"
                        value={l.debit}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((p, j) =>
                              j === i
                                ? {
                                    ...p,
                                    debit: e.target.value,
                                    credit: e.target.value ? "" : p.credit,
                                  }
                                : p,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        className="h-8 text-right font-mono tabular-nums"
                        type="number"
                        step="0.01"
                        value={l.credit}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((p, j) =>
                              j === i
                                ? {
                                    ...p,
                                    credit: e.target.value,
                                    debit: e.target.value ? "" : p.debit,
                                  }
                                : p,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-1.5 py-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
                        disabled={lines.length <= 2}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/20 font-semibold">
                  <td className="px-3 py-2" colSpan={2}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setLines((p) => [...p, { accountId: "", debit: "", credit: "", memo: "" }])
                      }
                      className="gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add line
                    </Button>
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{fmt(totals.d)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{fmt(totals.c)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {Math.abs(totals.diff) < 0.005 && totals.d > 0 ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">Balanced</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-amber-500">Unbalanced by {fmt(Math.abs(totals.diff))}</span>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || busy}
            onClick={() =>
              onSubmit({
                entryDate,
                memo,
                description,
                lines: lines.map((l) => ({
                  accountId: l.accountId,
                  debit: Number(l.debit) || 0,
                  credit: Number(l.credit) || 0,
                  memo: l.memo || undefined,
                })),
              })
            }
          >
            Post journal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Detail dialog ----------

type JournalDetail = {
  id: string;
  entry_date: string;
  memo: string | null;
  description: string | null;
  source_type: string | null;
  source_id: string | null;
  status: string;
  posted_at: string | null;
  reversal_of: string | null;
  reversed_by: string | null;
  journal_lines: Array<{
    id: string;
    account_id: string;
    debit: number;
    credit: number;
    memo: string | null;
    line_order: number;
    accounts: { code: string; name: string; type: string };
  }>;
} | null;

function JournalDetailDialog({
  journal,
  open,
  onOpenChange,
}: {
  journal: JournalDetail;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{journal?.memo ?? "Journal"}</DialogTitle>
          <DialogDescription>
            {journal?.entry_date} · {journal?.source_type} · {journal?.status}
          </DialogDescription>
        </DialogHeader>
        {journal?.description && (
          <div className="rounded-md border bg-muted/20 p-3 text-sm">{journal.description}</div>
        )}
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Account</th>
                <th className="px-3 py-2 font-medium">Memo</th>
                <th className="px-3 py-2 text-right font-medium">Debit</th>
                <th className="px-3 py-2 text-right font-medium">Credit</th>
              </tr>
            </thead>
            <tbody>
              {(journal?.journal_lines ?? [])
                .slice()
                .sort((a, b) => a.line_order - b.line_order)
                .map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs">{l.accounts.code}</span> {l.accounts.name}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{l.memo}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {Number(l.debit) ? fmt(Number(l.debit)) : ""}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {Number(l.credit) ? fmt(Number(l.credit)) : ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {(journal?.reversal_of || journal?.reversed_by) && (
          <div className="text-xs text-muted-foreground">
            {journal.reversal_of && <div>Reverses journal {journal.reversal_of.slice(0, 8)}…</div>}
            {journal.reversed_by && (
              <div>Reversed by journal {journal.reversed_by.slice(0, 8)}…</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------- Reverse dialog ----------

function ReverseDialog({
  target,
  onCancel,
  onConfirm,
  busy,
}: {
  target: { id: string; memo: string } | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  busy: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reverse journal</DialogTitle>
          <DialogDescription>
            A new offsetting balanced entry will be posted today. The original stays as posted
            history.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>Reason</Label>
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this being reversed?"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={!reason.trim() || busy}
            onClick={() => onConfirm(reason)}
            className="gap-2"
          >
            <Undo2 className="h-4 w-4" /> Post reversal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
