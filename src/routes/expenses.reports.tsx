import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { REPORTS, type ExpenseReport } from "@/lib/mock/expenses";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/expenses/reports")({
  component: ExpenseReportsPage,
});

const TONE: Record<ExpenseReport["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-brand/10 text-brand",
  needs_changes: "bg-warning/15 text-warning",
  approved: "bg-success/10 text-success",
  scheduled: "bg-brand/10 text-brand",
  paid: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

function ExpenseReportsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-muted-foreground">
          Group expenses into reports for streamlined approval, reimbursement, and client billing.
        </div>
        <Button size="sm" className="h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New report
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {REPORTS.map((r) => (
          <Card key={r.id} className="border-border/70 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{r.title}</div>
                <div className="text-[12px] text-muted-foreground">
                  {r.employee} · {r.department} · {r.range}
                </div>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${TONE[r.status]} whitespace-nowrap capitalize`}
              >
                {r.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 text-[12px]">
              <Cell label="Total" value={currency(r.total)} strong />
              <Cell label="Reimbursable" value={currency(r.reimbursable)} />
              <Cell label="Company-paid" value={currency(r.companyPaid)} />
              <Cell
                label="Missing"
                value={String(r.missingReceipts)}
                tone={r.missingReceipts > 0 ? "warning" : "muted"}
              />
            </div>

            {r.exceptions > 0 && (
              <div className="mt-2 rounded-md border border-warning/30 bg-warning/5 px-2 py-1 text-[11.5px] text-warning">
                {r.exceptions} policy exception{r.exceptions === 1 ? "" : "s"} — review before
                submission
              </div>
            )}

            <div className="mt-3 flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
                Open report
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-[11.5px]">
                Export
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  strong,
  tone = "muted",
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "muted" | "warning";
}) {
  const t = tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-md bg-muted/40 p-2">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={`font-tabular ${strong ? "font-bold" : "font-semibold"} ${t}`}>{value}</div>
    </div>
  );
}
