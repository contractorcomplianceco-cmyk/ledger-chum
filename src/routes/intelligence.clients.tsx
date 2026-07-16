import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { MarginIndicator } from "@/components/intelligence/margin-indicator";
import { currency } from "@/lib/mock/finance";
import { CLIENT_PROFITABILITY, PROFIT_STATUS_META } from "@/lib/mock/intelligence";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence/clients")({
  head: () => ({ meta: [{ title: "Client Profitability — LedgerOS" }] }),
  component: ClientProfitPage,
});

function ClientProfitPage() {
  return (
    <IntelligencePage
      title="Client Profitability"
      description="Contribution profit per client — including pass-through, commission, labor, tech, marketing, and refunds."
    >
      <Card className="border-border/70 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Client</th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-right">Pass-thru</th>
                <th className="px-3 py-2 text-right">Commission</th>
                <th className="px-3 py-2 text-right">Labor</th>
                <th className="px-3 py-2 text-right">Direct exp</th>
                <th className="px-3 py-2 text-right">Tech alloc</th>
                <th className="px-3 py-2 text-right">Marketing</th>
                <th className="px-3 py-2 text-right">Refunds</th>
                <th className="px-3 py-2 text-right">Contribution</th>
                <th className="px-3 py-2 text-left">Margin</th>
                <th className="px-3 py-2 text-left">Payment</th>
                <th className="px-3 py-2 text-left">Burden</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {CLIENT_PROFITABILITY.map((c) => {
                const meta = PROFIT_STATUS_META[c.status];
                return (
                  <tr key={c.id} className="border-t border-border/70 hover:bg-muted/30">
                    <td className="px-3 py-2 font-semibold">{c.client}</td>
                    <td className="px-3 py-2 text-right font-tabular">{currency(c.revenue)}</td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(c.passthrough)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(c.commission)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(c.labor)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(c.expenses)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(c.tech)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(c.marketing)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(c.refunds)}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right font-tabular font-semibold",
                        c.contribution < 0 ? "text-destructive" : "text-success",
                      )}
                    >
                      {currency(c.contribution)}
                    </td>
                    <td className="px-3 py-2 min-w-[160px]">
                      <MarginIndicator value={c.margin} target={30} compact />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{c.payment}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.burden}</td>
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
    </IntelligencePage>
  );
}
