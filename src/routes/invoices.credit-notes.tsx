import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CREDIT_NOTES } from "@/lib/mock/invoicing";
import { currency } from "@/lib/mock/finance";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/invoices/credit-notes")({
  component: CreditNotesPage,
});

const statusTone = {
  open: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
  applied: "bg-success/10 text-success ring-success/20",
  refunded: "bg-muted text-muted-foreground ring-border",
} as const;

function CreditNotesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-foreground">Credit notes</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Adjustments, goodwill credits, and refund records.</p>
        </div>
        <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New credit note</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left">Number</th>
              <th className="px-2 py-2.5 text-left">Customer</th>
              <th className="px-2 py-2.5 text-left">Issued</th>
              <th className="px-2 py-2.5 text-right">Amount</th>
              <th className="px-2 py-2.5 text-left">Reason</th>
              <th className="px-2 py-2.5 text-left">Applied to</th>
              <th className="px-2 py-2.5 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {CREDIT_NOTES.map((n) => (
              <tr key={n.id} className="hover:bg-muted/30">
                <td className="px-3 py-2.5 font-semibold text-foreground">{n.number}</td>
                <td className="px-2 py-2.5">{n.customerName}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{n.issued}</td>
                <td className="px-2 py-2.5 text-right font-tabular font-semibold">{currency(n.amount)}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{n.reason}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{n.appliedTo ?? "—"}</td>
                <td className="px-2 py-2.5">
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset capitalize",
                    statusTone[n.status],
                  )}>
                    {n.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
