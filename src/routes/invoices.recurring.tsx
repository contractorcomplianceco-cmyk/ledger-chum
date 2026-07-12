import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RECURRING } from "@/lib/mock/invoicing";
import { TREATMENT_META } from "@/lib/mock/cash-availability";
import { TreatmentBadge } from "@/components/cash/treatment-badge";
import { currency } from "@/lib/mock/finance";
import { Play, Pause, Plus, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/invoices/recurring")({
  component: RecurringPage,
});

function RecurringPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-foreground">Recurring invoices</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Subscriptions, retainers, and monthly compliance schedules.</p>
        </div>
        <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New schedule</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {RECURRING.map((r) => {
          const meta = TREATMENT_META[r.treatment];
          return (
            <Card key={r.id} className={cn("border border-border/70 bg-surface p-4 shadow-card", !r.active && "opacity-70")}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-foreground">{r.customerName}</div>
                  <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{r.template}</div>
                </div>
                <span className={cn(
                  "rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                  r.active ? "bg-success/10 text-success ring-success/20" : "bg-muted text-muted-foreground ring-border",
                )}>
                  {r.active ? "Active" : "Paused"}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Amount</div>
                  <div className="font-tabular text-[20px] font-bold text-foreground">{currency(r.amount)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Frequency</div>
                  <div className="text-[13px] font-medium text-foreground">{r.frequency}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" /> Next run {r.nextRun} · {r.runCount} runs completed
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                <TreatmentBadge spendability={meta.spendability} />
                <span className="text-[11px] text-muted-foreground">{meta.label}</span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  {r.active ? <><Pause className="mr-1.5 h-3.5 w-3.5" /> Pause</> : <><Play className="mr-1.5 h-3.5 w-3.5" /> Resume</>}
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">Edit</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
