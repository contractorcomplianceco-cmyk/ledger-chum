import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ESTIMATES } from "@/lib/mock/invoicing";
import { currency } from "@/lib/mock/finance";
import { Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estimates")({
  head: () => ({
    meta: [
      { title: "Estimates — LedgerOS" },
      {
        name: "description",
        content: "Estimates that convert directly into fully-allocated invoices.",
      },
      { property: "og:title", content: "Estimates — LedgerOS" },
      {
        property: "og:description",
        content:
          "Draft estimates with automatic pass-through and commission preview before you send.",
      },
    ],
  }),
  component: EstimatesPage,
});

const statusTone = {
  draft: "bg-muted text-muted-foreground ring-border",
  sent: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
  viewed: "bg-violet-500/10 text-violet-600 ring-violet-500/20",
  accepted: "bg-success/10 text-success ring-success/20",
  declined: "bg-destructive/10 text-destructive ring-destructive/20",
  expired: "bg-warning/15 text-warning ring-warning/25",
} as const;

function EstimatesPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-foreground">Estimates & proposals</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Convert accepted estimates directly into pre-allocated invoices.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/estimates/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New estimate
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left">Number</th>
              <th className="px-2 py-2.5 text-left">Customer</th>
              <th className="px-2 py-2.5 text-left">Service</th>
              <th className="px-2 py-2.5 text-left">Issued</th>
              <th className="px-2 py-2.5 text-left">Expires</th>
              <th className="px-2 py-2.5 text-right">Total</th>
              <th className="px-2 py-2.5 text-left">Status</th>
              <th className="px-2 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {ESTIMATES.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30">
                <td className="px-3 py-2.5 font-semibold text-foreground">{e.number}</td>
                <td className="px-2 py-2.5">{e.customerName}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{e.service}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{e.issued}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{e.expires}</td>
                <td className="px-2 py-2.5 text-right font-tabular font-semibold text-foreground">
                  {currency(e.total)}
                </td>
                <td className="px-2 py-2.5">
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset capitalize",
                      statusTone[e.status],
                    )}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-right">
                  {e.status === "accepted" && (
                    <Button variant="ghost" size="sm" className="h-8 text-[12px]">
                      Convert <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
