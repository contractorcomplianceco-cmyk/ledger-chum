import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { ConfidenceGauge } from "@/components/intelligence/confidence-gauge";
import { CONFIDENCE_COMPONENTS, INTEL_KPIS } from "@/lib/mock/intelligence";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence/confidence")({
  head: () => ({ meta: [{ title: "Financial Confidence — LedgerOS" }] }),
  component: FinancialConfidencePage,
});

function FinancialConfidencePage() {
  const gapItems = CONFIDENCE_COMPONENTS.filter((c) => c.impact > 0);
  const projected = INTEL_KPIS.confidence + gapItems.reduce((s, g) => s + g.impact, 0);

  return (
    <IntelligencePage
      title="Financial Confidence"
      description="A single score that summarizes whether the company's financial picture is trustworthy right now."
    >
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 p-4 xl:col-span-1">
          <div className="flex flex-col items-center">
            <ConfidenceGauge score={INTEL_KPIS.confidence} />
            <div className="mt-3 text-center">
              <div className="text-[12px] font-semibold text-foreground">Prior period: 84</div>
              <div className="text-[11.5px] text-success">▲ 3 points</div>
            </div>
            <div className="mt-3 w-full rounded-md bg-info/[0.08] p-2 text-[11px] text-info">
              Estimated score after resolving all open items:{" "}
              <span className="font-tabular font-bold">{Math.min(100, projected)}</span> / 100
            </div>
          </div>
        </Card>

        <Card className="border-border/70 p-4 xl:col-span-2">
          <h3 className="text-[13px] font-semibold">Score components</h3>
          <div className="mt-3 space-y-1.5">
            {CONFIDENCE_COMPONENTS.map((c) => {
              const ok = c.current === c.max;
              return (
                <div key={c.key} className="grid grid-cols-[24px_1fr_140px_60px] items-center gap-2">
                  {ok ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-foreground">{c.label}</div>
                    <div className="text-[11px] text-muted-foreground">{c.gap}</div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full", ok ? "bg-success" : "bg-warning")}
                      style={{ width: `${(c.current / c.max) * 100}%` }}
                    />
                  </div>
                  <div className="text-right font-tabular text-[11.5px] font-semibold">
                    {c.current}/{c.max}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section>
        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Items lowering the score</h3>
          <ul className="mt-2 space-y-1 text-[12px] text-foreground">
            {gapItems.map((g) => (
              <li key={g.key} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                <span>
                  <span className="font-semibold">{g.label}:</span>{" "}
                  <span className="text-muted-foreground">{g.gap}</span>{" "}
                  <span className="font-tabular text-warning">(−{g.impact} pts)</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10.5px] italic text-muted-foreground">
            Recommended actions are surfaced on the Executive Recommendations screen. All values are demonstration data.
          </p>
        </Card>
      </section>
    </IntelligencePage>
  );
}
