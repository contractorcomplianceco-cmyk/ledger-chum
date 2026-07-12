import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mock/finance";

export function KpiCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  format = "currency",
  hint,
}: {
  label: string;
  value: number;
  delta: number;
  trend: "up" | "down";
  icon?: LucideIcon;
  format?: "currency" | "number" | "percent";
  hint?: string;
}) {
  const positive = trend === "up";
  const formatted =
    format === "currency"
      ? currency(value)
      : format === "percent"
        ? `${value.toFixed(2)}%`
        : value.toLocaleString();

  return (
    <Card className="relative overflow-hidden border-border/60 bg-gradient-surface p-5 shadow-elegant transition-shadow hover:shadow-lifted">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-40" />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-tabular text-3xl font-semibold tracking-tight text-foreground">
            {formatted}
          </div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div
        className={cn(
          "relative mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          positive
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive",
        )}
      >
        {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(delta).toFixed(1)}% vs prior
      </div>
    </Card>
  );
}
