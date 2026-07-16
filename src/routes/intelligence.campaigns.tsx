import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/mock/finance";
import { CAMPAIGNS } from "@/lib/mock/intelligence";
import { cn } from "@/lib/utils";

const STATUS_CLS = {
  active: "bg-success/10 text-success",
  paused: "bg-muted text-muted-foreground",
  ended: "bg-muted text-muted-foreground",
  review: "bg-warning/10 text-warning",
} as const;

export const Route = createFileRoute("/intelligence/campaigns")({
  head: () => ({ meta: [{ title: "Campaign Economics — LedgerOS" }] }),
  component: CampaignEconomics,
});

function CampaignEconomics() {
  return (
    <IntelligencePage
      title="Campaign Economics"
      description="Every campaign shows collected revenue, pass-through, commission, fulfillment cost, and contribution profit."
    >
      <Card className="border-border/70 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Campaign</th>
                <th className="px-3 py-2 text-left">Channel</th>
                <th className="px-3 py-2 text-left">Owner</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Spend</th>
                <th className="px-3 py-2 text-right">Leads</th>
                <th className="px-3 py-2 text-right">Qualified</th>
                <th className="px-3 py-2 text-right">Deals</th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-right">Pass-thru</th>
                <th className="px-3 py-2 text-right">Commission</th>
                <th className="px-3 py-2 text-right">Fulfill</th>
                <th className="px-3 py-2 text-right">Contribution</th>
                <th className="px-3 py-2 text-right">Profit ROI</th>
                <th className="px-3 py-2 text-right">Payback</th>
                <th className="px-3 py-2 text-right">Chargeback</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c) => (
                <tr key={c.id} className="border-t border-border/70 hover:bg-muted/30">
                  <td className="px-3 py-2 font-semibold">{c.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.channel}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.owner}</td>
                  <td className="px-3 py-2">
                    <Badge
                      className={cn("h-5 border-0 px-1.5 text-[10.5px]", STATUS_CLS[c.status])}
                      variant="secondary"
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right font-tabular">{currency(c.spend)}</td>
                  <td className="px-3 py-2 text-right font-tabular">{c.leads}</td>
                  <td className="px-3 py-2 text-right font-tabular">{c.qualified}</td>
                  <td className="px-3 py-2 text-right font-tabular">{c.deals}</td>
                  <td className="px-3 py-2 text-right font-tabular">{currency(c.revenue)}</td>
                  <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                    {currency(c.passthrough)}
                  </td>
                  <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                    {currency(c.commission)}
                  </td>
                  <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                    {currency(c.fulfillment)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right font-tabular font-semibold",
                      c.contribution < 0 ? "text-destructive" : "text-success",
                    )}
                  >
                    {currency(c.contribution)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right font-tabular font-semibold",
                      c.profitRoi >= 2
                        ? "text-success"
                        : c.profitRoi >= 1
                          ? "text-warning"
                          : "text-destructive",
                    )}
                  >
                    {c.profitRoi.toFixed(2)}x
                  </td>
                  <td className="px-3 py-2 text-right font-tabular">
                    {c.payback > 0 ? `${c.payback}d` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-tabular">
                    {c.chargebackRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-[11px] italic text-muted-foreground">
        Chargeback-adjusted profit ROI already applied. Attribution model: last-touch weighted with
        30-day window (demonstration values).
      </p>
    </IntelligencePage>
  );
}
