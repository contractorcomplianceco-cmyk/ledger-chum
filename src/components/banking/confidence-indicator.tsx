import { cn } from "@/lib/utils";

export function ConfidenceIndicator({ value, className }: { value: number; className?: string }) {
  const bucket = value >= 90 ? "high" : value >= 70 ? "med" : "low";
  const label = bucket === "high" ? "High" : bucket === "med" ? "Medium" : "Low";
  const color =
    bucket === "high"
      ? "text-success bg-success/10 border-success/30"
      : bucket === "med"
        ? "text-info bg-info/10 border-info/30"
        : "text-warning bg-warning/10 border-warning/40";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium font-tabular",
        color,
        className,
      )}
      aria-label={`Match confidence: ${value} percent, ${label}`}
    >
      <span className="flex items-center gap-0.5">
        <span
          className={cn("h-2 w-0.5 rounded-full", value > 0 ? "bg-current" : "bg-current/30")}
        />
        <span
          className={cn("h-2.5 w-0.5 rounded-full", value >= 40 ? "bg-current" : "bg-current/30")}
        />
        <span
          className={cn("h-3 w-0.5 rounded-full", value >= 80 ? "bg-current" : "bg-current/30")}
        />
      </span>
      {value}% · {label}
    </span>
  );
}
