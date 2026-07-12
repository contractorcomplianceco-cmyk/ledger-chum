import { cn } from "@/lib/utils";
import { POLICY_META, type PolicyResult } from "@/lib/mock/expenses";

const TONE: Record<string, string> = {
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/15 text-warning ring-warning/25",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  brand: "bg-brand/10 text-brand ring-brand/20",
  muted: "bg-muted text-muted-foreground ring-border",
};

export function PolicyBadge({ result, className }: { result: PolicyResult; className?: string }) {
  const meta = POLICY_META[result];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap",
        TONE[meta.tone],
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
