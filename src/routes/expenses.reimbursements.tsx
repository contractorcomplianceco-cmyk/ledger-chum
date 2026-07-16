import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { REIMBURSEMENTS, type Reimbursement } from "@/lib/mock/expenses";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/reimbursements")({
  component: ReimbursementsPage,
});

const VIEWS: Array<{ id: "all" | Reimbursement["status"]; label: string }> = [
  { id: "all", label: "All" },
  { id: "awaiting", label: "Awaiting Approval" },
  { id: "approved_for_payment", label: "Approved for Payment" },
  { id: "scheduled", label: "Scheduled" },
  { id: "paid", label: "Paid" },
  { id: "returned", label: "Returned" },
  { id: "rejected", label: "Rejected" },
];

const TONE: Record<Reimbursement["status"], string> = {
  awaiting: "bg-warning/15 text-warning",
  approved_for_payment: "bg-brand/10 text-brand",
  scheduled: "bg-brand/10 text-brand",
  paid: "bg-success/10 text-success",
  returned: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

function ReimbursementsPage() {
  const [view, setView] = useState<"all" | Reimbursement["status"]>("all");
  const rows = view === "all" ? REIMBURSEMENTS : REIMBURSEMENTS.filter((r) => r.status === view);
  const outstanding = REIMBURSEMENTS.filter(
    (r) => r.status !== "paid" && r.status !== "rejected",
  ).reduce((a, r) => a + r.amount, 0);
  const total = REIMBURSEMENTS.reduce((a, r) => a + r.amount, 0);
  const paid = REIMBURSEMENTS.filter((r) => r.status === "paid").reduce((a, r) => a + r.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total" value={currency(total)} />
        <StatCard label="Outstanding" value={currency(outstanding)} tone="warning" />
        <StatCard label="Paid this period" value={currency(paid)} tone="success" />
      </div>

      <Card className="border-border/70 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                view === v.id
                  ? "border-transparent bg-gradient-brand-cool text-white shadow-sm"
                  : "border-border bg-surface text-foreground/80 hover:border-foreground/20",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden border-border/70 p-0">
        <table className="w-full text-[13px]">
          <thead className="bg-muted/40 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Employee</th>
              <th className="px-3 py-2">Expense report</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2">Approved</th>
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2">Scheduled</th>
              <th className="px-3 py-2">Paid</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{r.employee}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.report}</td>
                <td className="px-3 py-2 text-right font-tabular font-semibold">
                  {currency(r.amount)}
                </td>
                <td className="px-3 py-2 font-tabular text-[12px] text-muted-foreground">
                  {r.approvedDate ?? "—"}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{r.paymentMethod}</td>
                <td className="px-3 py-2 font-tabular text-[12px] text-muted-foreground">
                  {r.scheduledDate ?? "—"}
                </td>
                <td className="px-3 py-2 font-tabular text-[12px] text-muted-foreground">
                  {r.paidDate ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${TONE[r.status]} capitalize whitespace-nowrap`}
                  >
                    {r.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "success" | "warning";
}) {
  const t =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 font-tabular text-2xl font-bold ${t}`}>{value}</div>
    </Card>
  );
}
