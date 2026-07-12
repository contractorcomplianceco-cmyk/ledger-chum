import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExplainabilityPanel({
  title = "Why this recommendation",
  reasons,
  confidence,
  className,
}: {
  title?: string;
  reasons: string[];
  confidence?: number;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/70 bg-surface p-3", className)}>
      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-foreground">
        <Info className="h-3.5 w-3.5 text-info" />
        {title}
        {typeof confidence === "number" && (
          <span className="ml-auto rounded-md bg-info/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-info">
            {confidence}% confidence
          </span>
        )}
      </div>
      <ul className="mt-2 space-y-1 text-[11.5px] text-muted-foreground">
        {reasons.map((r, i) => (
          <li key={i} className="flex gap-1.5">
            <span aria-hidden className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
