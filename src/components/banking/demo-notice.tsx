import { FlaskConical, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoNotice({
  message = "Demonstration data only. No live banking connection is active.",
  variant = "soft",
  className,
}: {
  message?: string;
  variant?: "soft" | "inline";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-[11px] text-muted-foreground",
          className,
        )}
      >
        <Info className="h-3 w-3" />
        {message}
      </div>
    );
  }
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning-foreground",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
      <span className="text-warning">{message}</span>
    </div>
  );
}

export const DEMO_ACTION_MESSAGE = "UI demonstration only — no accounting record was modified.";
