import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { REC_CATEGORY_META, type Recommendation } from "@/lib/mock/intelligence";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const meta = REC_CATEGORY_META[rec.category];
  const positive = rec.impact >= 0;
  const Trend = meta.tone === "up" ? TrendingUp : meta.tone === "down" ? TrendingDown : Sparkles;

  return (
    <Card className="border-border/70 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Trend className="h-3.5 w-3.5 text-info" />
            <span className="rounded-md bg-info/10 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-info">
              {meta.label}
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
              {rec.horizon}
            </span>
          </div>
          <div className="mt-1.5 text-[13px] font-semibold leading-tight text-foreground">
            {rec.title}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Est. impact
          </div>
          <div
            className={cn(
              "font-tabular text-[15px] font-bold",
              positive ? "text-success" : "text-destructive",
            )}
          >
            {positive ? "+" : "−"}
            {currency(Math.abs(rec.impact))}
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-md bg-muted/40 p-2 text-[11.5px] leading-relaxed text-muted-foreground">
        <div className="font-semibold text-foreground">Evidence</div>
        <div>{rec.evidence}</div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <div className="text-muted-foreground">Confidence</div>
          <div className="font-tabular font-semibold text-foreground">{rec.confidence}%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Owner</div>
          <div className="font-semibold text-foreground">{rec.owner}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Approval</div>
          <div className="font-semibold text-foreground">{rec.approval}</div>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">Risks: </span>
        {rec.risks}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10.5px] italic text-muted-foreground">
          Demonstration recommendation — based on mock financial data.
        </span>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
          Open <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}
