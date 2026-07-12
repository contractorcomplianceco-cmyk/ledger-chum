import { Card } from "@/components/ui/card";
import { GUARDRAILS } from "@/lib/mock/cash-availability";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function GuardrailStrip() {
  return (
    <Card className="border border-border/70 bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[13.5px] font-semibold text-foreground">Cash guardrails</div>
        <div className="text-[11px] text-muted-foreground">Live · updated just now</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GUARDRAILS.map((g) => {
          const ok = g.status === "ok";
          const Icon = ok ? CheckCircle2 : AlertTriangle;
          return (
            <div
              key={g.label}
              className={cn(
                "rounded-lg border p-3",
                ok ? "border-success/20 bg-success/[0.04]" : "border-warning/25 bg-warning/[0.05]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11.5px] font-medium text-muted-foreground">{g.label}</div>
                  <div className="mt-1 font-tabular text-[19px] font-bold leading-none text-foreground">
                    {g.value}
                  </div>
                </div>
                <Icon className={cn("h-4 w-4 shrink-0", ok ? "text-success" : "text-warning")} />
              </div>
              <div className="mt-2 text-[10.5px] text-muted-foreground">{g.hint}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
