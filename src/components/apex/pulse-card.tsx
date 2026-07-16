import { useState, type ReactNode } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfidenceChip, DemoBadge, FreshnessChip, TrendChip } from "./chips";
import { ExplainabilityDrawer, type ExplainabilityPayload } from "./explainability-drawer";

export type PulseDriver = { label: string; impact: string; positive?: boolean };

export type PulseData = {
  id: string;
  title: string;
  question: string;
  headline: string;
  headlineSub?: string;
  trendDelta: number;
  trendSuffix?: string;
  invertTrend?: boolean;
  drivers: PulseDriver[];
  detractors?: PulseDriver[];
  forecast?: string;
  risk?: string;
  action: string;
  confidence: number;
  freshness: string;
  tone?: "light" | "dark";
  explain: ExplainabilityPayload;
};

export function PulseCard({ pulse, className }: { pulse: PulseData; className?: string }) {
  const [open, setOpen] = useState(false);
  const dark = pulse.tone === "dark";
  return (
    <Card
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden p-4",
        dark
          ? "border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white"
          : "border-border/70 bg-card",
        className,
      )}
    >
      {dark && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-info/25 blur-3xl"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div
            className={cn(
              "text-[10.5px] font-semibold uppercase tracking-[0.18em]",
              dark ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {pulse.title}
          </div>
          <div
            className={cn("mt-0.5 text-[12px]", dark ? "text-white/80" : "text-muted-foreground")}
          >
            {pulse.question}
          </div>
        </div>
        <DemoBadge />
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-[22px] font-semibold tabular-nums leading-none">{pulse.headline}</div>
        <TrendChip
          delta={pulse.trendDelta}
          suffix={pulse.trendSuffix ?? "%"}
          invertColors={pulse.invertTrend}
        />
      </div>
      {pulse.headlineSub && (
        <div
          className={cn("-mt-1 text-[11.5px]", dark ? "text-white/60" : "text-muted-foreground")}
        >
          {pulse.headlineSub}
        </div>
      )}

      <div className="grid gap-2 text-[11.5px]">
        <div>
          <div
            className={cn(
              "mb-0.5 text-[10px] font-semibold uppercase tracking-wide",
              dark ? "text-white/50" : "text-muted-foreground",
            )}
          >
            Drivers
          </div>
          <ul className="space-y-0.5">
            {pulse.drivers.slice(0, 3).map((d) => (
              <li key={d.label} className="flex justify-between gap-2">
                <span className="truncate">{d.label}</span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    d.positive === false ? "text-destructive" : "text-success",
                  )}
                >
                  {d.impact}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {pulse.risk && (
          <div
            className={cn(
              "rounded-md border px-2 py-1 text-[11px]",
              dark ? "border-white/10 bg-white/5" : "border-destructive/20 bg-destructive/5",
            )}
          >
            <span className={cn("font-semibold", dark ? "text-white/90" : "text-destructive")}>
              Risk ·{" "}
            </span>
            <span className={cn(dark ? "text-white/80" : "text-foreground/80")}>{pulse.risk}</span>
          </div>
        )}
        {pulse.forecast && (
          <div className={cn("text-[11px]", dark ? "text-white/70" : "text-muted-foreground")}>
            <span className="font-semibold">Forecast · </span>
            {pulse.forecast}
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex items-start gap-2 rounded-lg p-2 text-[11.5px]",
          dark ? "bg-white/5" : "bg-accent/50",
        )}
      >
        <Sparkles className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", dark ? "text-info" : "text-info")} />
        <div>
          <div
            className={cn(
              "text-[9.5px] font-semibold uppercase tracking-[0.14em]",
              dark ? "text-white/60" : "text-muted-foreground",
            )}
          >
            Recommended action
          </div>
          <div className="mt-0.5 leading-snug">{pulse.action}</div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap gap-1.5">
          <ConfidenceChip value={pulse.confidence} />
          <FreshnessChip label={pulse.freshness} />
        </div>
        <Button
          size="sm"
          variant={dark ? "secondary" : "ghost"}
          className="h-7 px-2 text-[11.5px]"
          onClick={() => setOpen(true)}
        >
          Explain
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <ExplainabilityDrawer open={open} onOpenChange={setOpen} payload={pulse.explain} />
    </Card>
  );
}

export function PulseGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
