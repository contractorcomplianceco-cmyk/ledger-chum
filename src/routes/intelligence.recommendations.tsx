import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/intelligence/recommendation-card";
import { currency } from "@/lib/mock/finance";
import { RECOMMENDATIONS, REC_CATEGORY_META, type RecCategory } from "@/lib/mock/intelligence";

export const Route = createFileRoute("/intelligence/recommendations")({
  head: () => ({ meta: [{ title: "Executive Recommendations — LedgerOS" }] }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const [filter, setFilter] = useState<RecCategory | "all">("all");
  const recs =
    filter === "all" ? RECOMMENDATIONS : RECOMMENDATIONS.filter((r) => r.category === filter);
  const totalImpact = RECOMMENDATIONS.reduce((s, r) => s + Math.max(0, r.impact), 0);
  const categoriesUsed = Array.from(new Set(RECOMMENDATIONS.map((r) => r.category)));

  return (
    <IntelligencePage
      title="Executive Recommendations"
      description="Every recommendation includes evidence, expected impact, confidence, risks, and owner."
    >
      <section className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <Card className="border-border/70 p-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total recommendations
          </div>
          <div className="mt-1 font-tabular text-[22px] font-bold">{RECOMMENDATIONS.length}</div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Cumulative positive impact
          </div>
          <div className="mt-1 font-tabular text-[22px] font-bold text-success">
            {currency(totalImpact)}
          </div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Awaiting approval
          </div>
          <div className="mt-1 font-tabular text-[22px] font-bold">
            {RECOMMENDATIONS.filter((r) => r.status === "open").length}
          </div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Categories active
          </div>
          <div className="mt-1 font-tabular text-[22px] font-bold">{categoriesUsed.length}</div>
        </Card>
      </section>

      <section className="flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          className="h-7 text-[11.5px]"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {categoriesUsed.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={filter === c ? "default" : "outline"}
            className="h-7 text-[11.5px]"
            onClick={() => setFilter(c)}
          >
            {REC_CATEGORY_META[c].label}
          </Button>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {recs.map((r) => (
          <RecommendationCard key={r.id} rec={r} />
        ))}
      </section>
    </IntelligencePage>
  );
}
