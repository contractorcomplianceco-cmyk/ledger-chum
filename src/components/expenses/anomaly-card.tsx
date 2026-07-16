import { currency } from "@/lib/mock/finance";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Anomaly } from "@/lib/mock/expenses";
import { AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SEV: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-warning/15 text-warning" },
  high: { label: "High", className: "bg-destructive/10 text-destructive" },
  critical: { label: "Critical", className: "bg-destructive text-destructive-foreground" },
};

export function AnomalyCard({ a }: { a: Anomaly }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="font-semibold">{a.vendor}</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide",
                SEV[a.severity].className,
              )}
            >
              {SEV[a.severity].label}
            </span>
          </div>
          <p className="text-[13px] text-foreground/85">{a.reason}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
            <span>Expected {currency(a.expected)}</span>
            <span>Actual {currency(a.actual)}</span>
            <span>Δ {a.variance}%</span>
            <span>Impact {currency(a.impact)}</span>
            <span>
              {a.department}
              {a.owner ? ` · ${a.owner}` : ""}
            </span>
            <span>Confidence {Math.round(a.confidence * 100)}%</span>
          </div>
          <div className="mt-2 flex items-start gap-1.5 rounded-md border border-brand/20 bg-brand/5 p-2 text-[12px] text-foreground/85">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <span>
              <strong className="font-semibold">Suggested:</strong> {a.suggested}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
          Approve as Normal
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
          Request Docs
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
          Reclassify
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
          Create Rule
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[11.5px]">
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
