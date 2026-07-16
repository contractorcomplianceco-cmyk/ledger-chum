import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReconStep = {
  id: number;
  label: string;
};

export function ReconciliationStepHeader({
  steps,
  current,
  onStepClick,
}: {
  steps: ReconStep[];
  current: number;
  onStepClick?: (n: number) => void;
}) {
  return (
    <ol
      className="flex w-full items-center gap-2 overflow-x-auto py-2"
      aria-label="Reconciliation steps"
    >
      {steps.map((s, i) => {
        const state = s.id < current ? "done" : s.id === current ? "active" : "todo";
        const clickable = onStepClick && s.id <= current;
        return (
          <li key={s.id} className="flex min-w-0 shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(s.id)}
              aria-current={state === "active" ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                state === "active" && "border-brand bg-brand text-brand-foreground shadow-glow",
                state === "done" &&
                  "border-success/40 bg-success/10 text-success hover:bg-success/15",
                state === "todo" && "border-border bg-card text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold",
                  state === "active" && "bg-brand-foreground/20",
                  state === "done" && "bg-success/20",
                  state === "todo" && "bg-muted",
                )}
              >
                {state === "done" ? <Check className="h-3 w-3" /> : s.id}
              </span>
              <span className="whitespace-nowrap font-medium">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={cn("h-px w-6 shrink-0", s.id < current ? "bg-success/40" : "bg-border")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
