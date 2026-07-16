import { currency } from "@/lib/mock/finance";
import { CATEGORY_META, EXPENSES, type Expense } from "@/lib/mock/expenses";
import { PolicyBadge } from "./policy-badge";
import { StatusBadge } from "./status-badge";
import { Receipt, ReceiptText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExpenseTable({
  rows = EXPENSES,
  compact,
}: {
  rows?: Expense[];
  compact?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-muted/40 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Employee</th>
              <th className="px-3 py-2">Vendor</th>
              {!compact && <th className="px-3 py-2">Description</th>}
              <th className="px-3 py-2">Category</th>
              {!compact && <th className="px-3 py-2">Dept</th>}
              {!compact && <th className="px-3 py-2">Client</th>}
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2">Receipt</th>
              <th className="px-3 py-2">Policy</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30">
                <td className="whitespace-nowrap px-3 py-2 font-tabular text-[12px] text-muted-foreground">
                  {e.date}
                </td>
                <td className="px-3 py-2 font-medium">{e.employee}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span>{e.vendor}</span>
                    {e.anomaly && (
                      <AlertTriangle className="h-3 w-3 text-warning" aria-label="Anomaly" />
                    )}
                  </div>
                </td>
                {!compact && (
                  <td className="px-3 py-2 text-muted-foreground max-w-[240px] truncate">
                    {e.description}
                  </td>
                )}
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-[12px]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: CATEGORY_META[e.category].color }}
                      aria-hidden
                    />
                    {CATEGORY_META[e.category].label}
                  </span>
                </td>
                {!compact && <td className="px-3 py-2 text-muted-foreground">{e.department}</td>}
                {!compact && <td className="px-3 py-2 text-muted-foreground">{e.client ?? "—"}</td>}
                <td className="px-3 py-2 text-right font-tabular font-semibold">
                  {currency(e.amount)}
                </td>
                <td className="px-3 py-2">
                  {e.hasReceipt ? (
                    <Receipt className="h-4 w-4 text-success" aria-label="Receipt attached" />
                  ) : (
                    <span className={cn("inline-flex items-center gap-1 text-[11px] text-warning")}>
                      <ReceiptText className="h-3.5 w-3.5" /> missing
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <PolicyBadge result={e.policy} />
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={e.status} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="px-3 py-10 text-center text-[13px] text-muted-foreground"
                >
                  No expenses match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
