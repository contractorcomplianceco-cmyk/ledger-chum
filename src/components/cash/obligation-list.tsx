import { Card } from "@/components/ui/card";
import { UPCOMING_OBLIGATIONS } from "@/lib/mock/cash-availability";
import { currencyPrecise } from "@/lib/mock/finance";
import { CalendarClock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const urgencyTone = {
  high: "bg-destructive/10 text-destructive",
  med: "bg-warning/15 text-warning",
  low: "bg-muted text-muted-foreground",
} as const;

export function ObligationList() {
  const total = UPCOMING_OBLIGATIONS.reduce((s, o) => s + o.amount, 0);
  return (
    <Card className="border border-border/70 bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[13.5px] font-semibold text-foreground">Upcoming pass-through</div>
          <div className="text-[11px] text-muted-foreground">Money held for third parties</div>
        </div>
        <div className="text-right">
          <div className="font-tabular text-[14px] font-bold text-foreground">
            {currencyPrecise(total)}
          </div>
          <div className="text-[10.5px] text-muted-foreground">next 14 days</div>
        </div>
      </div>
      <div className="space-y-2">
        {UPCOMING_OBLIGATIONS.map((o) => (
          <div
            key={o.id}
            className="group flex items-center gap-2.5 rounded-lg border border-transparent p-2 transition hover:border-border hover:bg-muted/40"
          >
            <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", urgencyTone[o.urgency])}>
              <CalendarClock className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[12.5px] font-semibold text-foreground">{o.label}</div>
              <div className="truncate text-[10.5px] text-muted-foreground">
                {o.payee} · Due {o.due}
              </div>
            </div>
            <div className="text-right">
              <div className="font-tabular text-[12.5px] font-semibold text-foreground">
                {currencyPrecise(o.amount)}
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
        ))}
      </div>
    </Card>
  );
}
