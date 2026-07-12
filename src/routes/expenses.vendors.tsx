import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { CATEGORY_META, VENDOR_SPEND } from "@/lib/mock/expenses";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/vendors")({
  component: VendorSpendPage,
});

function VendorSpendPage() {
  const total = VENDOR_SPEND.reduce((a, v) => a + v.total, 0);

  return (
    <div className="space-y-4">
      <div className="text-[13px] text-muted-foreground">
        Total tracked spend across <strong className="font-semibold text-foreground">{VENDOR_SPEND.length}</strong> vendors: <strong className="font-semibold text-foreground">{currency(total)}</strong>
      </div>

      <Card className="overflow-hidden border-border/70 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Vendor</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2 text-right">Current</th>
                <th className="px-3 py-2 text-right">Prior</th>
                <th className="px-3 py-2 text-right">YTD</th>
                <th className="px-3 py-2 text-right">Budget</th>
                <th className="px-3 py-2 text-right">Variance</th>
                <th className="px-3 py-2">Contract</th>
                <th className="px-3 py-2 text-right">Alerts</th>
                <th className="px-3 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {VENDOR_SPEND.map((v) => {
                const variance = v.budget > 0 ? ((v.ytd - v.budget) / v.budget) * 100 : 0;
                const over = variance > 0;
                return (
                  <tr key={v.vendor} className="hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <div className="font-medium">{v.vendor}</div>
                      {v.subscription && <div className="text-[10.5px] text-muted-foreground">Subscription</div>}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 text-[12px]">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_META[v.category].color }} />
                        {CATEGORY_META[v.category].label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{v.department}</td>
                    <td className="px-3 py-2 text-muted-foreground">{v.owner ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-tabular">{currency(v.current)}</td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{currency(v.prior)}</td>
                    <td className="px-3 py-2 text-right font-tabular font-semibold">{currency(v.ytd)}</td>
                    <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{currency(v.budget)}</td>
                    <td className={cn("px-3 py-2 text-right font-tabular", over ? "text-destructive" : "text-success")}>
                      {over ? "+" : ""}{variance.toFixed(0)}%
                    </td>
                    <td className="px-3 py-2 capitalize text-[12px] text-muted-foreground">{v.contract}</td>
                    <td className="px-3 py-2 text-right">
                      {v.anomalies > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] text-warning">
                          <AlertTriangle className="h-3 w-3" /> {v.anomalies}
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-[11.5px]"><ExternalLink className="h-3 w-3" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
