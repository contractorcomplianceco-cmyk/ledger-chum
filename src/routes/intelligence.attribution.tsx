import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { ATTRIBUTION_EXPENSES } from "@/lib/mock/intelligence";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const METHOD_LABEL = {
  direct: "Direct",
  fixed: "Fixed amount",
  percentage: "Percentage",
  headcount: "Headcount",
  revenue_share: "Revenue share",
  usage: "Usage",
  employee_time: "Employee time",
  client_count: "Client count",
  manual: "Manual",
} as const;

export const Route = createFileRoute("/intelligence/attribution")({
  head: () => ({ meta: [{ title: "Expense Attribution — LedgerOS" }] }),
  component: AttributionPage,
});

function AttributionPage() {
  return (
    <IntelligencePage
      title="Expense Attribution"
      description="Allocate every expense to clients, projects, services, products, apps, campaigns, or shared overhead."
    >
      <section>
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Allocation targets</div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11.5px]">
            {[
              "Client",
              "Project",
              "Service",
              "Product",
              "App",
              "Department",
              "Campaign",
              "Strategic initiative",
              "Shared overhead",
              "R&D",
              "Compliance",
            ].map((t) => (
              <span
                key={t}
                className="rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {ATTRIBUTION_EXPENSES.map((e) => {
          const partial = e.allocated < 100;
          return (
            <Card key={e.id} className="border-border/70 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold">{e.vendor}</div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {METHOD_LABEL[e.method]} allocation · confidence{" "}
                    <span className="font-tabular font-semibold text-foreground">
                      {e.confidence}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Amount
                  </div>
                  <div className="font-tabular text-[15px] font-bold">{currency(e.amount)}</div>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {e.targets.length === 0 ? (
                  <div className="rounded-md bg-destructive/[0.08] p-2 text-[11.5px] text-destructive">
                    No revenue or strategic purpose assigned
                  </div>
                ) : (
                  e.targets.map((t, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="font-medium">{t.label}</span>
                        <span className="font-tabular font-semibold">{t.pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-brand-cool"
                          style={{ width: `${t.pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/70 pt-2 text-[11px]">
                <div>
                  <div className="text-muted-foreground">Allocated</div>
                  <div className="font-tabular font-semibold">{e.allocated}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Unallocated</div>
                  <div
                    className={cn(
                      "font-tabular font-semibold",
                      e.unallocated > 0 ? "text-destructive" : "text-success",
                    )}
                  >
                    {currency(e.unallocated)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Margin impact</div>
                  <div className="font-tabular font-semibold">{e.marginImpact.toFixed(1)}%</div>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Evidence: </span>
                {e.evidence}
              </div>

              {partial && (
                <div className="mt-2 flex items-center gap-1.5 rounded-md bg-warning/[0.08] p-2 text-[11.5px] text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Expense not fully allocated
                </div>
              )}

              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="outline" className="h-7 text-[11px]">
                  Edit allocation
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
    </IntelligencePage>
  );
}
