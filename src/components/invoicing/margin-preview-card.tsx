import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mock/finance";
import { computeMargin, type Invoice } from "@/lib/mock/invoicing";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarginPreviewCard({
  invoice,
}: {
  invoice: Pick<Invoice, "lines" | "laborCost" | "techAllocation" | "marketingCac">;
}) {
  const m = computeMargin(invoice);

  const rows = [
    { label: "Earned revenue", amount: m.earnedRevenue },
    { label: "Fulfillment cost", amount: -invoice.lines.filter((l) => l.estCost > 0).reduce((s, l) => s + l.estCost, 0) },
    { label: "Commission", amount: -invoice.lines.filter((l) => l.treatment === "commissionable").reduce((s, l) => s + l.qty * l.rate - l.discount, 0) },
    { label: "Labor", amount: -invoice.laborCost },
    { label: "Technology allocation", amount: -invoice.techAllocation },
    { label: "Marketing acquisition", amount: -invoice.marketingCac },
  ];

  return (
    <Card className="border border-border/70 bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[13.5px] font-semibold text-foreground">Margin preview</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            Contribution margin against target for these services
          </div>
        </div>
        <div
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg text-white",
            m.belowTarget ? "bg-destructive" : "bg-gradient-brand-mint",
          )}
        >
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">{r.label}</span>
            <span className={cn("font-tabular font-semibold", r.amount < 0 ? "text-foreground/80" : "text-foreground")}>
              {r.amount < 0 ? "−" : ""}
              {currency(Math.abs(r.amount))}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg bg-gradient-brand-cool/[0.07] p-3 ring-1 ring-inset ring-blue-500/15">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-foreground">Contribution margin</span>
          <span className="font-tabular text-[18px] font-bold text-foreground">{currency(m.contribution)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            {m.marginPct.toFixed(1)}% actual · {m.target.toFixed(0)}% target
          </span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 font-semibold",
              m.belowTarget ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success",
            )}
          >
            {m.marginPct >= m.target ? "On target" : `${(m.target - m.marginPct).toFixed(1)}% below`}
          </span>
        </div>
      </div>

      {m.belowTarget && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-destructive/[0.06] p-2.5 text-[11px] leading-relaxed text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            This invoice is priced below the target margin. Consider adjusting rate or scope before sending.
          </span>
        </div>
      )}
    </Card>
  );
}
