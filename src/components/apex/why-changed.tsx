import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendChip } from "./chips";

export type ChangeContributor = { label: string; amount: string; direction: "up" | "down" };

export function WhyDidThisChange({
  metric,
  current,
  prior,
  target,
  delta,
  invert,
  contributors,
  narrative,
  className,
}: {
  metric: string;
  current: string;
  prior: string;
  target?: string;
  delta: number;
  invert?: boolean;
  contributors: ChangeContributor[];
  narrative: string;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/70 p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Why did this change · {metric}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-[20px] font-semibold tabular-nums">{current}</div>
            <TrendChip delta={delta} invertColors={invert} />
          </div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            Prior <span className="font-mono">{prior}</span>
            {target && (
              <>
                {" · "}Target <span className="font-mono">{target}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/90">{narrative}</p>

      <div className="mt-3 grid gap-1 text-[12px]">
        {contributors.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-between gap-2 border-b border-border/50 py-1 last:border-b-0"
          >
            <span className="truncate">{c.label}</span>
            <span
              className={cn(
                "font-mono tabular-nums",
                c.direction === "up" ? "text-success" : "text-destructive",
              )}
            >
              {c.direction === "up" ? "+" : "−"}
              {c.amount}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
