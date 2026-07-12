import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { EXPENSES, type Expense } from "@/lib/mock/expenses";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/list")({
  component: ExpenseListPage,
});

const VIEWS: Array<{ id: string; label: string; test: (e: Expense) => boolean }> = [
  { id: "all", label: "All Expenses", test: () => true },
  { id: "mine", label: "My Expenses", test: (e) => e.employee === "Rose Taylor" },
  { id: "pending", label: "Pending Approval", test: (e) => e.status.startsWith("pending") || e.status === "submitted" },
  { id: "approved", label: "Approved", test: (e) => e.status === "approved" },
  { id: "rejected", label: "Rejected", test: (e) => e.status === "rejected" },
  { id: "needs_changes", label: "Needs Changes", test: (e) => e.status === "needs_changes" },
  { id: "missing", label: "Missing Receipt", test: (e) => !e.hasReceipt },
  { id: "reimbursable", label: "Reimbursable", test: (e) => e.reimbursable },
  { id: "unmatched", label: "Unmatched", test: (e) => e.match === "none" || e.match === "possible" },
  { id: "duplicate", label: "Possible Duplicate", test: (e) => e.match === "duplicate" || e.policy === "possible_duplicate" },
  { id: "policy", label: "Policy Exception", test: (e) => e.policy !== "compliant" },
  { id: "anomaly", label: "Anomaly Detected", test: (e) => !!e.anomaly },
  { id: "subscription", label: "Subscription", test: (e) => ["technology", "ai"].includes(e.category) },
  { id: "ready", label: "Ready for Reimbursement", test: (e) => e.reimbursable && e.status === "approved" && e.reimbursement !== "paid" },
  { id: "paid", label: "Paid", test: (e) => e.status === "paid" || e.reimbursement === "paid" },
  { id: "non_reimbursable", label: "Non-Reimbursable", test: (e) => !e.reimbursable },
];

function ExpenseListPage() {
  const [view, setView] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const v = VIEWS.find((x) => x.id === view)!;
    return EXPENSES.filter(v.test).filter((e) => {
      if (!q) return true;
      return `${e.vendor} ${e.employee} ${e.description} ${e.department} ${e.client ?? ""}`.toLowerCase().includes(q.toLowerCase());
    });
  }, [view, q]);

  return (
    <div className="space-y-4">
      <Card className="border-border/70 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[12px] text-muted-foreground">
          Showing <strong className="text-foreground">{filtered.length}</strong> of {EXPENSES.length} expenses
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vendor, employee, note" className="h-9 w-64 pl-8 text-[13px]" />
          </div>
          <Button size="sm" variant="outline" className="h-9">Bulk actions</Button>
        </div>
      </div>

      <ExpenseTable rows={filtered} />
    </div>
  );
}
