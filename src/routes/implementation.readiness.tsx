import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { READINESS_SCORECARD } from "@/lib/mock/implementation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/implementation/readiness")({
  head: () => ({ meta: [{ title: "Readiness Scorecard — LedgerOS" }] }),
  component: ReadinessPage,
});

function ReadinessPage() {
  const avg = Math.round(READINESS_SCORECARD.reduce((s, r) => s + r.score, 0) / READINESS_SCORECARD.length);
  return (
    <ImplementationPage
      title="Readiness Scorecard"
      description="Ten dimensions scored 0–100. A green board is required before any real API mutation is enabled."
    >
      <Card className="border-border/70 p-5">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Overall readiness</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="font-tabular text-[36px] font-bold">{avg}%</div>
          <div className="text-[12px] text-muted-foreground">Target 85% before draft-only mutations, 95% before cutover.</div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {READINESS_SCORECARD.map((r) => {
          const tone = r.score >= 80 ? "success" : r.score >= 60 ? "warning" : "destructive";
          return (
            <Card key={r.area} className="border-border/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[13px] font-semibold">{r.area}</div>
                <div className={cn(
                  "font-tabular text-[14px] font-bold",
                  tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-destructive",
                )}>
                  {r.score}%
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-destructive",
                  )}
                  style={{ width: `${r.score}%` }}
                />
              </div>
              <div className="mt-2 text-[12px] text-muted-foreground">{r.note}</div>
            </Card>
          );
        })}
      </div>
    </ImplementationPage>
  );
}
