import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfidenceChip({ value, className }: { value: number; className?: string }) {
  const tone =
    value >= 85
      ? "bg-success/15 text-success"
      : value >= 65
        ? "bg-info/15 text-info"
        : "bg-warning/20 text-warning-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide",
        tone,
        className,
      )}
      title="Model / data confidence"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value}% conf
    </span>
  );
}

export function FreshnessChip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground",
        className,
      )}
      title="Data freshness"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
      {label}
    </span>
  );
}

export function TrendChip({
  delta,
  suffix = "%",
  invertColors = false,
  className,
}: {
  delta: number;
  suffix?: string;
  /** When true (e.g. expenses), positive delta is bad. */
  invertColors?: boolean;
  className?: string;
}) {
  const positive = delta > 0;
  const negative = delta < 0;
  const good = invertColors ? negative : positive;
  const bad = invertColors ? positive : negative;
  const tone = good
    ? "text-success"
    : bad
      ? "text-destructive"
      : "text-muted-foreground";
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11.5px] font-semibold tabular-nums", tone, className)}>
      <Icon className="h-3 w-3" />
      {delta > 0 ? "+" : ""}
      {delta}
      {suffix}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-warning-foreground",
        className,
      )}
    >
      Demo data
    </span>
  );
}
