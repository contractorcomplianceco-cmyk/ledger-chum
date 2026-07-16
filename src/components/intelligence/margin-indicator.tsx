import { cn } from "@/lib/utils";

export function MarginIndicator({
  value,
  target,
  compact,
}: {
  value: number;
  target: number;
  compact?: boolean;
}) {
  const below = value < target;
  const pct = Math.min(150, Math.max(0, (value / Math.max(target, 1)) * 100));
  return (
    <div className={cn("flex items-center gap-2", compact ? "text-[11px]" : "text-[12px]")}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all", below ? "bg-destructive" : "bg-success")}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span
        className={cn("font-tabular font-semibold", below ? "text-destructive" : "text-success")}
      >
        {value.toFixed(1)}%
      </span>
      <span className="text-muted-foreground">/ {target.toFixed(0)}%</span>
    </div>
  );
}
