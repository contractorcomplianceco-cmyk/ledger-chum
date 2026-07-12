import { cn } from "@/lib/utils";

export function ConfidenceGauge({
  score,
  size = 140,
  label = "Financial Confidence",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const tone =
    clamped >= 85
      ? { stroke: "hsl(var(--success))", cls: "text-success" }
      : clamped >= 65
        ? { stroke: "hsl(var(--warning))", cls: "text-warning" }
        : { stroke: "hsl(var(--destructive))", cls: "text-destructive" };

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${clamped} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={10} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone.stroke}
          strokeWidth={10}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className={cn("font-tabular text-3xl font-bold leading-none", tone.cls)}>{clamped}</div>
          <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            of 100
          </div>
        </div>
      </div>
    </div>
  );
}
