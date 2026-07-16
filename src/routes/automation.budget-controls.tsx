import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BUDGETS, BUDGET_STATUS_META, type BudgetScope } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/automation/budget-controls")({
  head: () => ({ meta: [{ title: "Budget Control — LedgerOS" }] }),
  component: BudgetsPage,
});

const SCOPES: (BudgetScope | "all")[] = [
  "all",
  "department",
  "vendor",
  "category",
  "campaign",
  "product",
  "app",
  "employee",
  "project",
  "client",
  "initiative",
];

function BudgetsPage() {
  const [scope, setScope] = useState<BudgetScope | "all">("all");
  const rows = scope === "all" ? BUDGETS : BUDGETS.filter((b) => b.scope === scope);

  return (
    <AutomationPage
      title="Budget Control System"
      description="Track approved, committed, spent, forecast, and remaining across every dimension. Approvals for exceptions flow to the Approval Center."
      actions={
        <Button size="sm" className="h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New budget
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {SCOPES.map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11.5px] font-medium capitalize transition",
              scope === s
                ? "border-transparent bg-gradient-brand-cool text-white"
                : "border-border bg-surface text-foreground/80",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <Card className="border-border/70 p-0">
        <div className="grid grid-cols-[1.5fr_auto_1fr_1fr_1fr_1fr_1fr_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Name</span>
          <span>Scope</span>
          <span>Approved</span>
          <span>Committed</span>
          <span>Spent</span>
          <span>Forecast</span>
          <span>Remaining</span>
          <span>Status</span>
        </div>
        {rows.map((b) => {
          const spentPct = Math.min(100, (b.spent / b.approved) * 100);
          const meta = BUDGET_STATUS_META[b.status];
          return (
            <div
              key={b.id}
              className="grid grid-cols-[1.5fr_auto_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 border-b border-border px-4 py-3 text-[12.5px] last:border-b-0"
            >
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full",
                      b.status === "exceeded"
                        ? "bg-destructive"
                        : b.status === "at_risk"
                          ? "bg-warning"
                          : "bg-brand",
                    )}
                    style={{ width: `${spentPct}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {b.scope}
              </span>
              <span className="font-tabular">{currency(b.approved)}</span>
              <span className="font-tabular text-muted-foreground">{currency(b.committed)}</span>
              <span className="font-tabular">{currency(b.spent)}</span>
              <span className="font-tabular text-muted-foreground">{currency(b.forecast)}</span>
              <span
                className={cn(
                  "font-tabular",
                  b.remaining < 0 ? "text-destructive" : "text-foreground",
                )}
              >
                {currency(b.remaining)}
              </span>
              <span className={cn("text-[11.5px] font-semibold", meta.tone)}>{meta.label}</span>
            </div>
          );
        })}
      </Card>
    </AutomationPage>
  );
}
