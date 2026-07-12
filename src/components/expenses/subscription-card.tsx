import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { SUB_STATUS_META, type Subscription } from "@/lib/mock/expenses";
import { cn } from "@/lib/utils";
import { Users, Calendar, TrendingUp } from "lucide-react";

const TONE: Record<string, string> = {
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/15 text-warning ring-warning/25",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  brand: "bg-brand/10 text-brand ring-brand/20",
  violet: "bg-violet-500/10 text-violet-500 ring-violet-500/20",
  muted: "bg-muted text-muted-foreground ring-border",
};

export function SubscriptionCard({ s }: { s: Subscription }) {
  const priceDelta = s.priorCost > 0 ? ((s.currentCost - s.priorCost) / s.priorCost) * 100 : 0;
  const utilization = s.seats > 0 ? Math.round((s.activeUsers / s.seats) * 100) : 0;
  const meta = SUB_STATUS_META[s.status];
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{s.vendor}</span>
            <span className="text-[12px] text-muted-foreground">· {s.product}</span>
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            {s.department}{s.owner ? ` · ${s.owner}` : " · No owner"}
          </div>
        </div>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap",
            TONE[meta.tone],
          )}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-md bg-muted/40 p-2">
          <div className="text-muted-foreground">Cost</div>
          <div className="font-tabular font-semibold">{currency(s.currentCost)}<span className="text-[10.5px] font-normal text-muted-foreground">/{s.frequency === "annual" ? "yr" : "mo"}</span></div>
          {priceDelta !== 0 && (
            <div className={cn("text-[10.5px]", priceDelta > 0 ? "text-destructive" : "text-success")}>
              {priceDelta > 0 ? "↑" : "↓"} {Math.abs(priceDelta).toFixed(0)}% vs prior
            </div>
          )}
        </div>
        <div className="rounded-md bg-muted/40 p-2">
          <div className="text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Utilization</div>
          <div className="font-tabular font-semibold">{s.activeUsers}/{s.seats}</div>
          <div className="text-[10.5px] text-muted-foreground">{utilization}% used</div>
        </div>
        <div className="rounded-md bg-muted/40 p-2">
          <div className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Renews</div>
          <div className="font-tabular font-semibold">{s.renewalDate}</div>
          <div className="text-[10.5px] text-muted-foreground">Cancel by {s.cancelDeadline}</div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-1.5 rounded-md border border-brand/20 bg-brand/5 p-2 text-[12px]">
        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
        <span><strong className="font-semibold">Recommendation:</strong> {s.recommendation}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">Adjust seats</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">Assign owner</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">Cancel</Button>
        <Button size="sm" variant="ghost" className="h-7 text-[11.5px]">Details</Button>
      </div>
    </Card>
  );
}
