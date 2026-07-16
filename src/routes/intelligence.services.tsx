import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { MarginIndicator } from "@/components/intelligence/margin-indicator";
import { currency } from "@/lib/mock/finance";
import { SERVICE_PROFITABILITY } from "@/lib/mock/intelligence";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence/services")({
  head: () => ({ meta: [{ title: "Service Profitability — LedgerOS" }] }),
  component: ServiceProfitPage,
});

function ServiceProfitPage() {
  const warnings = SERVICE_PROFITABILITY.filter((s) => s.contribution / s.avgPrice < 0.2);

  return (
    <IntelligencePage
      title="Service Profitability"
      description="Unit economics for every service — pricing, cost, rework, refunds, and chargebacks."
    >
      {warnings.length > 0 && (
        <Card className="border-warning/40 bg-warning/[0.06] p-3">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            {warnings.length} service{warnings.length === 1 ? "" : "s"} below 20% contribution
            margin — consider pricing or scope review
          </div>
          <div className="mt-1 text-[11.5px] text-warning/90">
            {warnings.map((w) => w.name).join(" · ")}
          </div>
        </Card>
      )}

      <Card className="border-border/70 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Service</th>
                <th className="px-3 py-2 text-right">Avg price</th>
                <th className="px-3 py-2 text-right">Pass-thru</th>
                <th className="px-3 py-2 text-right">Commission</th>
                <th className="px-3 py-2 text-right">Labor</th>
                <th className="px-3 py-2 text-right">Tech</th>
                <th className="px-3 py-2 text-right">Marketing</th>
                <th className="px-3 py-2 text-right">Gross</th>
                <th className="px-3 py-2 text-right">Contribution</th>
                <th className="px-3 py-2 text-left">Margin</th>
                <th className="px-3 py-2 text-right">Days</th>
                <th className="px-3 py-2 text-right">Rework</th>
                <th className="px-3 py-2 text-right">Refunds</th>
                <th className="px-3 py-2 text-right">Chargebacks</th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_PROFITABILITY.map((s) => {
                const margin = (s.contribution / s.avgPrice) * 100;
                return (
                  <tr key={s.id} className="border-t border-border/70 hover:bg-muted/30">
                    <td className="px-3 py-2 font-semibold">{s.name}</td>
                    <td className="px-3 py-2 text-right font-tabular">{currency(s.avgPrice)}</td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(s.passthrough)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(s.commission)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(s.labor)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(s.tech)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                      {currency(s.marketing)}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular">{currency(s.gross)}</td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right font-tabular font-semibold",
                        s.contribution < 0 ? "text-destructive" : "text-success",
                      )}
                    >
                      {currency(s.contribution)}
                    </td>
                    <td className="px-3 py-2 min-w-[160px]">
                      <MarginIndicator value={margin} target={25} compact />
                    </td>
                    <td className="px-3 py-2 text-right font-tabular">{s.completionDays}</td>
                    <td className="px-3 py-2 text-right font-tabular">
                      {s.reworkRate.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right font-tabular">
                      {s.refundRate.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right font-tabular">
                      {s.chargebackRate.toFixed(1)}%
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
