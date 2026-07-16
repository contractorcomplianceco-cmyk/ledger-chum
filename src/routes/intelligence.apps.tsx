import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { AppValueScore } from "@/components/intelligence/app-value-score";
import { currency } from "@/lib/mock/finance";
import { APPS, APP_STATUS_META } from "@/lib/mock/intelligence";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence/apps")({
  head: () => ({ meta: [{ title: "App Profitability — LedgerOS" }] }),
  component: AppsProfitability,
});

function AppsProfitability() {
  return (
    <IntelligencePage
      title="App Profitability"
      description="Every CCA-built application scored on revenue, adoption, labor savings, and strategic value."
    >
      <section className="grid gap-3 xl:grid-cols-3">
        {APPS.map((a) => {
          const meta = APP_STATUS_META[a.status];
          return (
            <Card key={a.id} className="border-border/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-foreground">{a.name}</div>
                  <span
                    className={cn(
                      "mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
                      meta.className,
                    )}
                  >
                    {meta.label}
                  </span>
                </div>
                <AppValueScore score={a.score} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
                <Cell label="Dev cost" value={currency(a.devCost)} />
                <Cell
                  label="Monthly run cost"
                  value={currency(a.monthly + a.hosting + a.aiUsage + a.laborSupport)}
                />
                <Cell label="Direct revenue" value={currency(a.directRevenue)} />
                <Cell label="Revenue influenced" value={currency(a.revenueInfluenced)} />
                <Cell label="Active users" value={`${a.activeUsers}/${a.users}`} />
                <Cell label="Clients supported" value={String(a.clients)} />
                <Cell label="Time saved / mo" value={`${a.timeSaved} hr`} />
                <Cell label="Risk reduced" value={a.riskReduced} />
                <Cell label="Payback" value={a.payback > 0 ? `${a.payback} mo` : "—"} />
                <Cell label="ROI" value={`${a.roi.toFixed(1)}x`} />
              </div>
            </Card>
          );
        })}
      </section>
    </IntelligencePage>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-tabular font-semibold text-foreground">{value}</div>
    </div>
  );
}
