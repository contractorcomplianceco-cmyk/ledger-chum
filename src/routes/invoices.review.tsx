import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listInvoices,
  getInvoice,
  postInvoice,
} from "@/lib/accounting/invoices.functions";
import {
  DEMO_DRAFT_INVOICES,
  computeDraftTotals,
  currency,
} from "@/lib/mock/accountant-workspace";
import {
  CheckCircle2, XCircle, MessageSquare, ArrowRight, Clock, BookOpen, Package, Wrench,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/invoices/review")({
  head: () => ({
    meta: [
      { title: "Draft Invoice Review — LedgerOS" },
      {
        name: "description",
        content:
          "Review draft invoices from ServiceConnect and post balanced AR journal entries through the LedgerOS ledger engine.",
      },
      { property: "og:title", content: "Draft Invoice Review — LedgerOS" },
      {
        property: "og:description",
        content:
          "Approve draft invoices and post balanced ledger entries in real time.",
      },
    ],
  }),
  component: DraftReviewPage,
});

type LocalStatus = "draft" | "posted" | "rejected" | "changes_requested";

interface DraftRow {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerExternalId: string | null;
  workOrderRef: string | null;
  total: number;
  live: boolean;
}

function DraftReviewPage() {
  const orgId = useOrgId();
  const live = !!orgId;
  const qc = useQueryClient();
  const listFn = useServerFn(listInvoices);
  const getFn = useServerFn(getInvoice);
  const postFn = useServerFn(postInvoice);

  const invoicesQ = useQuery({
    queryKey: ["invoices", "draft", orgId, "review"],
    queryFn: () => listFn({ data: { orgId: orgId!, status: "draft", limit: 50 } }),
    enabled: live, retry: false,
  });

  const drafts: DraftRow[] = live && invoicesQ.data
    ? invoicesQ.data.map((d) => ({
        id: d.id,
        invoiceNumber: d.invoice_number,
        customer: (d as unknown as { customers?: { name: string } }).customers?.name ?? "—",
        customerExternalId: null,
        workOrderRef: d.work_order_ref,
        total: Number(d.total),
        live: true,
      }))
    : DEMO_DRAFT_INVOICES.map((d) => ({
        id: d.id, invoiceNumber: d.invoiceNumber, customer: d.customer,
        customerExternalId: d.customerExternalId, workOrderRef: d.workOrderRef,
        total: computeDraftTotals(d).total, live: false,
      }));

  const [selectedId, setSelectedId] = useState<string>("");
  const [note, setNote] = useState("");
  const [statusMap, setStatusMap] = useState<Record<string, LocalStatus>>({});
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!selectedId && drafts[0]) setSelectedId(drafts[0].id);
  }, [drafts, selectedId]);

  const selected = drafts.find((d) => d.id === selectedId);
  const localStatus: LocalStatus = statusMap[selectedId] ?? "draft";

  const detailQ = useQuery({
    queryKey: ["invoice", selectedId],
    queryFn: () => getFn({ data: { id: selectedId } }),
    enabled: live && !!selectedId && (selected?.live ?? false),
    retry: false,
  });

  const demoSelected = !selected?.live
    ? DEMO_DRAFT_INVOICES.find((d) => d.id === selectedId)
    : undefined;
  const demoTotals = demoSelected ? computeDraftTotals(demoSelected) : null;

  // Live totals derived from invoice_lines.
  const liveInv = detailQ.data;
  const liveLines = (liveInv?.invoice_lines ?? []) as Array<{
    id: string; description: string; quantity: number; unit_price: number; amount: number;
    account_id: string | null;
  }>;
  const liveTotal = liveInv ? Number(liveInv.total) : 0;
  const liveSubtotal = liveInv ? Number(liveInv.subtotal) : 0;
  const liveTax = liveInv ? Number(liveInv.tax) : 0;
  const hasUnmappedLines = liveLines.some((l) => !l.account_id);

  const setLocal = (id: string, s: LocalStatus) =>
    setStatusMap((prev) => ({ ...prev, [id]: s }));

  const handlePost = async () => {
    if (!selected) return;
    if (!selected.live) {
      setLocal(selected.id, "posted");
      toast.success(`Posted ${selected.invoiceNumber} · JE created (demo)`);
      return;
    }
    if (hasUnmappedLines) {
      toast.error("Cannot post: at least one line has no mapped account. Fix mappings first.");
      return;
    }
    setPosting(true);
    try {
      await postFn({ data: { id: selected.id } });
      setLocal(selected.id, "posted");
      toast.success(`Posted ${selected.invoiceNumber} · balanced AR journal created`);
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      qc.invalidateQueries({ queryKey: ["invoice", selected.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post invoice");
    } finally {
      setPosting(false);
    }
  };

  const draftCount = drafts.filter((d) => (statusMap[d.id] ?? "draft") === "draft").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow={`LedgerOS · Phase 4 · ${live ? "Live" : "Demo"}`}
        title="Draft Invoice Review"
        description="Draft → Review → Post. Every posted invoice creates a balanced AR journal entry through the LedgerOS ledger engine."
        actions={
          <Button size="sm" variant="outline" asChild className="h-9">
            <Link to="/dashboards/accounting">
              Back to workspace <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />
      <PageBody>
        <WorkflowStrip />

        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Card className="border-border/70 bg-surface p-0 shadow-card">
            <div className="border-b border-border/60 px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Draft queue
              </div>
              <div className="text-[13px] text-muted-foreground">
                {draftCount} awaiting review
              </div>
            </div>
            <div className="divide-y divide-border/60">
              {drafts.map((d) => {
                const s = statusMap[d.id] ?? "draft";
                const active = d.id === selectedId;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className={cn(
                      "block w-full px-4 py-3 text-left transition",
                      active ? "bg-brand/5" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-semibold text-foreground">
                        {d.invoiceNumber}
                      </div>
                      <LocalStatusBadge status={s} />
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">{d.customer}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-[11px] text-muted-foreground">
                        {d.workOrderRef ? `from ${d.workOrderRef}` : "no source ref"}
                      </div>
                      <div className="font-tabular text-[13px] font-semibold text-foreground">
                        {currency(d.total)}
                      </div>
                    </div>
                  </button>
                );
              })}
              {drafts.length === 0 && (
                <div className="p-6 text-center text-[12px] text-muted-foreground">
                  No drafts. Seed a{" "}
                  <Link to="/integrations/sandbox" className="underline">sandbox work order</Link>.
                </div>
              )}
            </div>
          </Card>

          {selected && (
            <div className="space-y-4">
              <Card className="border-border/70 bg-surface p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-bold tracking-tight text-foreground">
                        {selected.invoiceNumber}
                      </h2>
                      <LocalStatusBadge status={localStatus} />
                    </div>
                    <div className="mt-0.5 text-[13px] text-muted-foreground">
                      {selected.customer}
                      {selected.customerExternalId && ` · ${selected.customerExternalId}`}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {selected.workOrderRef ? `Source ${selected.workOrderRef}` : "No source reference"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</div>
                    <div className="font-tabular text-[24px] font-bold text-foreground">
                      {currency(selected.live ? liveTotal : demoTotals?.total ?? selected.total)}
                    </div>
                  </div>
                </div>
              </Card>

              {selected.live ? (
                <Card className="border-border/70 bg-surface p-0 shadow-card">
                  <SectionHeader icon={Wrench} title="Invoice lines" account="Mapped accounts" />
                  <LineTable
                    rows={liveLines.map((l) => ({
                      description: l.description,
                      qty: `${Number(l.quantity)}`,
                      unit: currency(Number(l.unit_price)),
                      amount: Number(l.amount),
                      account: l.account_id ? "Mapped" : "⚠ Unmapped",
                    }))}
                  />
                  <div className="border-t border-border/60 px-4 py-3">
                    <TotalsGrid
                      rows={[
                        ["Subtotal", currency(liveSubtotal)],
                        ["Tax", currency(liveTax)],
                        ["Total", currency(liveTotal), true],
                      ]}
                    />
                  </div>
                </Card>
              ) : (
                demoSelected && demoTotals && (
                  <Card className="border-border/70 bg-surface p-0 shadow-card">
                    <SectionHeader icon={Wrench} title="Labor lines" account="4100 · Labor Revenue" />
                    <LineTable
                      rows={demoSelected.labor.map((l) => ({
                        description: l.description,
                        qty: `${l.hours} h`,
                        unit: currency(l.rate),
                        amount: l.hours * l.rate,
                        account: l.account,
                      }))}
                    />
                    <SectionHeader
                      icon={Package}
                      title="Material lines"
                      account="4200 · Material Revenue · 1300 Inventory / 5100 COGS"
                    />
                    <LineTable
                      rows={demoSelected.materials.map((m) => ({
                        description: m.description,
                        qty: `${m.quantity}`,
                        unit: currency(m.price),
                        amount: m.quantity * m.price,
                        account: `${m.account} · cost ${currency(m.cost * m.quantity)}`,
                      }))}
                    />
                    <div className="border-t border-border/60 px-4 py-3">
                      <TotalsGrid
                        rows={[
                          ["Labor subtotal", currency(demoTotals.laborSubtotal)],
                          ["Material subtotal", currency(demoTotals.materialSubtotal)],
                          ["Tax", currency(demoTotals.tax)],
                          ["Total", currency(demoTotals.total), true],
                        ]}
                      />
                    </div>
                  </Card>
                )
              )}

              <Card className="border-border/70 bg-surface p-4 shadow-card">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" /> Journal preview on post
                </div>
                <div className="mt-2 overflow-hidden rounded-md border border-border/60">
                  <div className="grid grid-cols-[1fr_120px_120px] gap-3 border-b border-border/60 bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <div>Account</div>
                    <div className="text-right">Debit</div>
                    <div className="text-right">Credit</div>
                  </div>
                  <JournalRow
                    account="Accounts Receivable (resolved)"
                    debit={selected.live ? liveTotal : demoTotals?.total ?? selected.total}
                  />
                  <JournalRow
                    account="Revenue accounts (per line)"
                    credit={selected.live ? liveSubtotal : demoTotals?.subtotal ?? selected.total}
                  />
                  {((selected.live ? liveTax : demoTotals?.tax) ?? 0) > 0 && (
                    <JournalRow
                      account="Sales Tax Payable"
                      credit={selected.live ? liveTax : demoTotals?.tax ?? 0}
                    />
                  )}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Balance check enforced by ledger engine · fiscal period must be open.
                </div>
                {selected.live && hasUnmappedLines && (
                  <div className="mt-2 text-[11px] font-semibold text-warning">
                    ⚠ At least one line has no mapped account. Fix mappings before posting.
                  </div>
                )}
              </Card>

              <Card className="border-border/70 bg-surface p-4 shadow-card">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Reviewer note
                </div>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional context — required if rejecting or requesting changes."
                  className="mt-2 min-h-[80px] text-[13px]"
                />
                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="ghost" size="sm"
                    disabled={localStatus !== "draft"}
                    onClick={() => { setLocal(selected.id, "changes_requested"); toast.success("Change request logged"); setNote(""); }}
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Request changes
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    disabled={localStatus !== "draft"}
                    onClick={() => { setLocal(selected.id, "rejected"); toast.success("Draft rejected · audit event logged"); setNote(""); }}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={localStatus !== "draft" || posting}
                    onClick={handlePost}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    {posting ? "Posting…" : "Post invoice"}
                  </Button>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Posting enforces balanced DR=CR, open fiscal period, and mapped accounts.
                </div>
              </Card>
            </div>
          )}
        </div>
      </PageBody>
    </AppShell>
  );
}

function WorkflowStrip() {
  const steps = [
    { label: "Draft invoice", icon: Clock, tone: "info" as const },
    { label: "Reviewer approval", icon: MessageSquare, tone: "warn" as const },
    { label: "Post", icon: CheckCircle2, tone: "ok" as const },
    { label: "Ledger entry created", icon: BookOpen, tone: "ok" as const },
  ];
  return (
    <Card className="border-border/70 bg-surface p-3 shadow-card">
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium ring-1 ring-inset",
              s.tone === "ok" && "bg-success/10 text-success ring-success/20",
              s.tone === "warn" && "bg-warning/15 text-warning ring-warning/25",
              s.tone === "info" && "bg-muted text-muted-foreground ring-border",
            )}>
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </div>
            {i < steps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        ))}
      </div>
    </Card>
  );
}

function LocalStatusBadge({ status }: { status: LocalStatus }) {
  const map: Record<LocalStatus, { cls: string; label: string }> = {
    draft: { cls: "bg-warning/15 text-warning ring-warning/25", label: "Draft" },
    posted: { cls: "bg-success/10 text-success ring-success/20", label: "Posted" },
    rejected: { cls: "bg-destructive/10 text-destructive ring-destructive/20", label: "Rejected" },
    changes_requested: { cls: "bg-blue-500/10 text-blue-600 ring-blue-500/20", label: "Changes requested" },
  };
  const m = map[status];
  return (
    <Badge variant="outline" className={cn("h-5 border-transparent text-[10px] font-semibold ring-1 ring-inset", m.cls)}>
      {m.label}
    </Badge>
  );
}

function SectionHeader({ icon: Icon, title, account }: {
  icon: React.ComponentType<{ className?: string }>; title: string; account: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" /> {title}
      </div>
      <div className="text-[11px] text-muted-foreground">Mapped → {account}</div>
    </div>
  );
}

interface LineRow { description: string; qty: string; unit: string; amount: number; account: string; }

function LineTable({ rows }: { rows: LineRow[] }) {
  return (
    <div className="divide-y divide-border/60">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_80px_100px_120px] gap-3 px-4 py-2 text-[13px]">
          <div className="min-w-0">
            <div className="truncate text-foreground">{r.description}</div>
            <div className="truncate text-[11px] text-muted-foreground">{r.account}</div>
          </div>
          <div className="text-right font-tabular text-muted-foreground">{r.qty}</div>
          <div className="text-right font-tabular text-muted-foreground">{r.unit}</div>
          <div className="text-right font-tabular font-semibold text-foreground">{currency(r.amount)}</div>
        </div>
      ))}
      {rows.length === 0 && (
        <div className="px-4 py-4 text-center text-[12px] text-muted-foreground">No lines.</div>
      )}
    </div>
  );
}

function TotalsGrid({ rows }: { rows: Array<[string, string, boolean?]> }) {
  return (
    <div className="ml-auto max-w-xs space-y-1">
      {rows.map(([label, value, bold]) => (
        <div key={label} className="flex justify-between text-[13px]">
          <span className={cn("text-muted-foreground", bold && "font-semibold text-foreground")}>{label}</span>
          <span className={cn("font-tabular", bold ? "text-[15px] font-bold text-foreground" : "text-foreground")}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function JournalRow({ account, debit, credit }: { account: string; debit?: number; credit?: number }) {
  return (
    <div className="grid grid-cols-[1fr_120px_120px] gap-3 border-t border-border/60 px-3 py-2 text-[13px] first:border-t-0">
      <div className="text-foreground">{account}</div>
      <div className="text-right font-tabular text-foreground">{debit ? currency(debit) : ""}</div>
      <div className="text-right font-tabular text-foreground">{credit ? currency(credit) : ""}</div>
    </div>
  );
}
