import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/expenses/status-badge";
import { PolicyBadge } from "@/components/expenses/policy-badge";
import { currency } from "@/lib/mock/finance";
import { APPROVAL_QUEUE, EXPENSES, type Expense } from "@/lib/mock/expenses";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, MessageSquare, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/expenses/approvals")({
  component: ApprovalsPage,
});

const TABS = [
  { id: "mine", label: "Awaiting My Approval", test: (e: Expense) => e.status === "pending_manager" || e.status === "submitted" },
  { id: "clarify", label: "Needs Clarification", test: (e: Expense) => e.status === "needs_changes" },
  { id: "highvalue", label: "High Value", test: (e: Expense) => e.amount >= 2000 },
  { id: "policy", label: "Policy Exception", test: (e: Expense) => e.policy !== "compliant" },
  { id: "missing", label: "Missing Receipt", test: (e: Expense) => !e.hasReceipt },
  { id: "duplicate", label: "Possible Duplicate", test: (e: Expense) => e.policy === "possible_duplicate" },
  { id: "anomaly", label: "Anomaly", test: (e: Expense) => !!e.anomaly },
  { id: "approved", label: "Approved", test: (e: Expense) => e.status === "approved" || e.status === "paid" },
  { id: "rejected", label: "Rejected", test: (e: Expense) => e.status === "rejected" },
];

function ApprovalsPage() {
  const [tab, setTab] = useState("mine");
  const [selected, setSelected] = useState<Expense | null>(APPROVAL_QUEUE[0] ?? null);

  const active = TABS.find((t) => t.id === tab)!;
  const rows = EXPENSES.filter(active.test);

  return (
    <div className="space-y-4">
      <Card className="border-border/70 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                tab === t.id
                  ? "border-transparent bg-gradient-brand-cool text-white shadow-sm"
                  : "border-border bg-surface text-foreground/80 hover:border-foreground/20",
              )}
            >
              {t.label}
              <span className="ml-1.5 rounded-full bg-black/10 px-1 text-[10px]">{EXPENSES.filter(t.test).length}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-2">
          {rows.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition",
                selected?.id === e.id ? "border-brand bg-brand/5" : "border-border bg-surface hover:border-foreground/20",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{e.vendor}</span>
                    <StatusBadge status={e.status} />
                    <PolicyBadge result={e.policy} />
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">{e.employee} · {e.description} · {e.date}</div>
                </div>
                <div className="text-right font-tabular font-semibold">{currency(e.amount)}</div>
              </div>
            </button>
          ))}
          {rows.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-[13px] text-muted-foreground">
              Nothing to review in this queue.
            </div>
          )}
        </div>

        <ApprovalDetail e={selected} />
      </div>
    </div>
  );
}

function ApprovalDetail({ e }: { e: Expense | null }) {
  if (!e) return (
    <Card className="border-border/70 p-6 text-center text-[13px] text-muted-foreground">
      Select an expense to review.
    </Card>
  );
  return (
    <Card className="border-border/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{e.vendor}</div>
          <div className="text-[11.5px] text-muted-foreground">{e.id} · {e.date} · {e.employee}</div>
        </div>
        <div className="text-right font-tabular text-lg font-bold">{currency(e.amount)}</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px]">
        <Field label="Department" value={e.department} />
        <Field label="Category" value={e.category} />
        <Field label="Client" value={e.client ?? "—"} />
        <Field label="Payment" value={e.paymentMethod} />
        <Field label="Reimbursable" value={e.reimbursable ? "Yes" : "No"} />
        <Field label="Match" value={e.match} />
      </div>

      <div className="mt-3 rounded-md border border-border/70 bg-muted/30 p-2 text-[12px]">
        <strong className="font-semibold">Business purpose</strong>
        <div className="text-muted-foreground">{e.description}</div>
      </div>

      <div className="mt-3 space-y-1 text-[12.5px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Policy</span>
          <PolicyBadge result={e.policy} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Budget impact</span>
          <span className="font-tabular text-destructive">−{currency(e.amount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Spendable cash Δ</span>
          <span className="font-tabular text-destructive">−{currency(e.amount)}</span>
        </div>
        {e.client && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{e.client} margin</span>
            <span className="font-tabular">{e.reimbursable ? "Recoverable" : "Absorbed"}</span>
          </div>
        )}
      </div>

      {e.anomaly && (
        <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 p-2 text-[12px] text-warning-foreground">
          <div className="font-semibold text-warning">Anomaly · {e.anomaly.toUpperCase()}</div>
          <div className="text-muted-foreground">{e.note}</div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-1.5">
        <Button size="sm" className="h-8"><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve</Button>
        <Button size="sm" variant="outline" className="h-8"><MessageSquare className="mr-1 h-3.5 w-3.5" /> Approve with note</Button>
        <Button size="sm" variant="outline" className="h-8">Request receipt</Button>
        <Button size="sm" variant="outline" className="h-8">Reclassify</Button>
        <Button size="sm" variant="outline" className="h-8">Split</Button>
        <Button size="sm" variant="outline" className="h-8">Mark non-reimbursable</Button>
        <Button size="sm" variant="outline" className="h-8"><ArrowUpRight className="mr-1 h-3.5 w-3.5" /> Escalate to Rose</Button>
        <Button size="sm" variant="outline" className="h-8 text-destructive"><XCircle className="mr-1 h-3.5 w-3.5" /> Reject</Button>
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 capitalize">{value}</div>
    </div>
  );
}
