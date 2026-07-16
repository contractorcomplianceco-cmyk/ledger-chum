import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mock/finance";
import { TECH_PORTFOLIO, TECH_STATUS_META } from "@/lib/mock/intelligence";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence/tech-portfolio")({
  head: () => ({ meta: [{ title: "Technology Portfolio — LedgerOS" }] }),
  component: TechPortfolioPage,
});

function TechPortfolioPage() {
  return (
    <IntelligencePage
      title="Technology Portfolio"
      description="Every product, seat, and renewal — mapped to owner, utilization, revenue supported, and recommendation."
    >
      <Card className="border-border/70 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Vendor</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Owner</th>
                <th className="px-3 py-2 text-right">Monthly</th>
                <th className="px-3 py-2 text-right">Annualized</th>
                <th className="px-3 py-2 text-right">Seats</th>
                <th className="px-3 py-2 text-right">Active</th>
                <th className="px-3 py-2 text-right">Utilization</th>
                <th className="px-3 py-2 text-right">Cost / active user</th>
                <th className="px-3 py-2 text-left">Renewal</th>
                <th className="px-3 py-2 text-right">Revenue supported</th>
                <th className="px-3 py-2 text-right">Labor saved (hr)</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {TECH_PORTFOLIO.map((t) => {
                const meta = TECH_STATUS_META[t.status];
                const util = t.utilization * 100;
                const utilTone =
                  util >= 80 ? "text-success" : util >= 50 ? "text-warning" : "text-destructive";
                return (
                  <tr key={t.id} className="border-t border-border/70 hover:bg-muted/30">
                    <td className="px-3 py-2 font-semibold">{t.vendor}</td>
                    <td className="px-3 py-2 text-muted-foreground">{t.product}</td>
                    <td className="px-3 py-2 text-muted-foreground">{t.category}</td>
                    <td className="px-3 py-2">{t.owner}</td>
                    <td className="px-3 py-2 text-right font-tabular font-semibold">
                      {currency(t.monthly)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(t.annual)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular">{t.seats}</td>
                    <td className="px-3 py-2 text-right font-tabular">{t.activeUsers}</td>
                    <td className={cn("px-3 py-2 text-right font-tabular font-semibold", utilTone)}>
                      {util.toFixed(0)}%
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(t.costPerActiveUser)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{t.renewal}</td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(t.revenueSupported)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {t.laborSaved}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold whitespace-nowrap",
                          meta.className,
                        )}
                      >
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-[11px] italic text-muted-foreground">
        Recommendations column omitted from the table for width — hover a row (or open the vendor
        detail) to view. Alternatives considered: duplicates flagged automatically; renewal-soon
        rows highlight cancellation windows.
      </p>
    </IntelligencePage>
  );
}
