import { cn } from "@/lib/utils";

/**
 * Confidence indicator for extraction / matching / anomaly.
 * Non-color-only — includes a text percentage and a labeled bar.
 */
export function ConfidenceBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.round(value * 100);
  const tone = pct >= 90 ? "bg-success" : pct >= 70 ? "bg-brand" : pct >= 50 ? "bg-warning" : "bg-destructive";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Confidence"}
      >
        <div className={cn("h-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-tabular text-[11px] text-muted-foreground">{pct}%</span>
    </div>
  );
}
