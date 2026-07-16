import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  APPROVAL_ITEMS,
  APPROVAL_SOURCE_META,
  type ApprovalItem,
  type ApprovalSource,
} from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, MessageSquare, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/automation/approvals")({
  head: () => ({ meta: [{ title: "Approval Center — LedgerOS" }] }),
  component: ApprovalsPage,
});

const SOURCES: (ApprovalSource | "all")[] = [
  "all",
  "invoice",
  "expense",
  "bill",
  "bonus",
  "pre_spend",
  "subscription",
  "budget_exception",
  "cash_override",
  "leakage_recovery",
  "reconciliation",
  "journal",
];

function ApprovalsPage() {
  const [source, setSource] = useState<ApprovalSource | "all">("all");
  const [selected, setSelected] = useState<ApprovalItem | null>(APPROVAL_ITEMS[0] ?? null);
  const rows =
    source === "all" ? APPROVAL_ITEMS : APPROVAL_ITEMS.filter((a) => a.source === source);

  const totals = {
    count: rows.length,
    amount: rows.reduce((s, r) => s + r.amount, 0),
    cash: rows.reduce((s, r) => s + r.cashImpact, 0),
  };

  return (
    <AutomationPage
      title="Unified Approval Center"
      description="Every invoice, expense, bill, bonus, override, and exception in one queue with financial impact, cash impact, margin impact, and recommendations."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/70 p-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Pending items
          </div>
          <div className="mt-1 font-tabular text-[22px] font-bold">{totals.count}</div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total amount
          </div>
          <div className="mt-1 font-tabular text-[22px] font-bold">{currency(totals.amount)}</div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Net cash impact
          </div>
          <div
            className={cn(
              "mt-1 font-tabular text-[22px] font-bold",
              totals.cash < 0 ? "text-destructive" : "text-success",
            )}
          >
            {currency(totals.cash)}
          </div>
        </Card>
      </section>

      <Card className="border-border/70 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                source === s
                  ? "border-transparent bg-gradient-brand-cool text-white shadow-sm"
                  : "border-border bg-surface text-foreground/80 hover:border-foreground/20",
              )}
            >
              {s === "all" ? "All" : APPROVAL_SOURCE_META[s].label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-2">
          {rows.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition",
                selected?.id === a.id
                  ? "border-brand bg-brand/5"
                  : "border-border bg-surface hover:border-foreground/20",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-wide",
                        APPROVAL_SOURCE_META[a.source].color,
                      )}
                    >
                      {APPROVAL_SOURCE_META[a.source].label}
                    </span>
                    <RiskChip risk={a.risk} />
                  </div>
                  <div className="mt-0.5 font-medium">{a.title}</div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {a.requestor} · Approver {a.approver} · Due {a.deadline}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-tabular font-semibold">{currency(a.amount)}</div>
                  <div
                    className={cn(
                      "text-[11px] font-tabular",
                      a.cashImpact < 0
                        ? "text-destructive"
                        : a.cashImpact > 0
                          ? "text-success"
                          : "text-muted-foreground",
                    )}
                  >
                    Cash {currency(a.cashImpact)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <ApprovalDetail item={selected} />
      </div>
    </AutomationPage>
  );
}

function ApprovalDetail({ item }: { item: ApprovalItem | null }) {
  if (!item)
    return (
      <Card className="border-border/70 p-6 text-center text-[13px] text-muted-foreground">
        Select an item to review.
      </Card>
    );
  return (
    <Card className="border-border/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.id} · {APPROVAL_SOURCE_META[item.source].label}
          </div>
          <div className="font-semibold">{item.title}</div>
        </div>
        <RiskChip risk={item.risk} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px]">
        <Field label="Amount" value={currency(item.amount)} />
        <Field
          label="Cash impact"
          value={currency(item.cashImpact)}
          tone={item.cashImpact < 0 ? "destructive" : "success"}
        />
        <Field
          label="Margin impact"
          value={`${item.marginImpactPct > 0 ? "+" : ""}${item.marginImpactPct}%`}
          tone={item.marginImpactPct < 0 ? "destructive" : "success"}
        />
        <Field label="Approver" value={item.approver} />
        <Field label="Requestor" value={item.requestor} />
        <Field label="Deadline" value={item.deadline} />
      </div>

      <div className="mt-3 rounded-md border border-border/70 bg-muted/30 p-2 text-[12px]">
        <strong className="font-semibold">Supporting</strong>
        <ul className="mt-0.5 space-y-0.5 text-muted-foreground">
          {item.supporting.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-2 text-[12px]">
        <strong className="font-semibold text-brand">LedgerOS recommends</strong>
        <div className="text-muted-foreground">{item.recommendation}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1.5">
        <Button size="sm" className="h-8">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
        </Button>
        <Button size="sm" variant="outline" className="h-8">
          <MessageSquare className="mr-1 h-3.5 w-3.5" /> Approve with note
        </Button>
        <Button size="sm" variant="outline" className="h-8">
          Request info
        </Button>
        <Button size="sm" variant="outline" className="h-8">
          <ArrowUpRight className="mr-1 h-3.5 w-3.5" /> Escalate
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-destructive col-span-2">
          <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
        </Button>
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "destructive" | "success";
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-tabular",
          tone === "destructive" && "text-destructive",
          tone === "success" && "text-success",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function RiskChip({ risk }: { risk: "low" | "medium" | "high" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide",
        risk === "low" && "border-success/30 bg-success/10 text-success",
        risk === "medium" && "border-warning/30 bg-warning/10 text-warning",
        risk === "high" && "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {risk} risk
    </span>
  );
}
