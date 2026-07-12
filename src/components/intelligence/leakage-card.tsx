import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { LEAKAGE_STATUS_META, type LeakageOpportunity } from "@/lib/mock/intelligence";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export function LeakageCard({ opp }: { opp: LeakageOpportunity }) {
  const meta = LEAKAGE_STATUS_META[opp.status];
  return (
    <Card className="border-border/70 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-warning" />
            <span className="text-[12.5px] font-semibold text-foreground">{opp.client}</span>
          </div>
          <div className="text-[11.5px] text-muted-foreground">{opp.service}</div>
        </div>
        <span className={cn("rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold", meta.className)}>
          {meta.label}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <div className="text-muted-foreground">Recoverable</div>
          <div className="font-tabular text-[13px] font-bold text-foreground">{currency(opp.amount)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Confidence</div>
          <div className="font-tabular text-[13px] font-bold text-foreground">{opp.confidence}%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Age</div>
          <div className="font-tabular text-[13px] font-bold text-foreground">{opp.ageDays}d</div>
        </div>
      </div>

      <div className="mt-2 rounded-md bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
        <div className="font-semibold text-foreground">{opp.reason}</div>
        <div className="mt-0.5">{opp.evidence}</div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground">
          Suggested: <span className="text-foreground">{opp.action}</span> · Owner {opp.owner}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
          Review
        </Button>
      </div>
    </Card>
  );
}
