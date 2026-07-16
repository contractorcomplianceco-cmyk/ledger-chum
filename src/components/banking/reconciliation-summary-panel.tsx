import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { currencyPrecise } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function ReconciliationSummaryPanel({
  statementEnding,
  clearedBalance,
  unclearedAmount,
  clearedCount,
  unclearedCount,
}: {
  statementEnding: number;
  clearedBalance: number;
  unclearedAmount: number;
  clearedCount: number;
  unclearedCount: number;
}) {
  const difference = statementEnding - clearedBalance;
  const balanced = Math.abs(difference) < 0.005;
  const total = clearedCount + unclearedCount;
  const progress = total > 0 ? Math.round((clearedCount / total) * 100) : 0;

  return (
    <Card className="sticky top-16 space-y-4 border-border/60 bg-gradient-surface p-5 shadow-elegant">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Reconciliation progress
        </div>
        <div className="mt-1 flex items-end justify-between">
          <div className="font-tabular text-3xl font-semibold tracking-tight">{progress}%</div>
          <div className="text-[11px] text-muted-foreground">
            {clearedCount} of {total} cleared
          </div>
        </div>
        <Progress value={progress} className="mt-2 h-2" />
      </div>

      <dl className="space-y-2 border-t border-border/60 pt-3 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Statement ending balance</dt>
          <dd className="font-tabular font-semibold">{currencyPrecise(statementEnding)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Cleared balance</dt>
          <dd className="font-tabular font-semibold">{currencyPrecise(clearedBalance)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Uncleared amount</dt>
          <dd className="font-tabular">{currencyPrecise(unclearedAmount)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <dt className="font-semibold">Difference</dt>
          <dd
            className={cn(
              "font-tabular font-semibold",
              balanced ? "text-success" : "text-destructive",
            )}
          >
            {currencyPrecise(difference)}
          </dd>
        </div>
      </dl>

      <div
        className={cn(
          "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
          balanced
            ? "border-success/30 bg-success/5 text-success"
            : "border-warning/40 bg-warning/5 text-warning",
        )}
      >
        {balanced ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <span>
          {balanced
            ? "Balanced. Ready to submit for approval."
            : "Variance detected. Reconciliation cannot complete while difference is nonzero."}
        </span>
      </div>
    </Card>
  );
}
