import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CashLandscape,
  ProfitLandscape,
  CollectionsLandscape,
  RunwayRocket,
  AIAssistant,
  FinancialHealthVisual,
  CashPulseBackdrop,
  ProfitPulseBackdrop,
  type ApexIllustrationProps,
} from "@/components/apex/illustrations";
import type { ComponentType } from "react";

type Entry = {
  name: string;
  Component: ComponentType<ApexIllustrationProps>;
  usage: string;
  backdrop?: boolean;
};

const ENTRIES: Entry[] = [
  { name: "CashLandscape", Component: CashLandscape, usage: "Cash KPI card — lower third" },
  { name: "ProfitLandscape", Component: ProfitLandscape, usage: "Profit KPI card — lower third" },
  { name: "CollectionsLandscape", Component: CollectionsLandscape, usage: "AR / collections cards" },
  { name: "RunwayRocket", Component: RunwayRocket, usage: "Runway / growth KPI accent" },
  { name: "AIAssistant", Component: AIAssistant, usage: "AI briefing panel / persona chips" },
  { name: "FinancialHealthVisual", Component: FinancialHealthVisual, usage: "Company Health gauge accent" },
  { name: "CashPulseBackdrop", Component: CashPulseBackdrop, usage: "Behind Cash Pulse donut", backdrop: true },
  { name: "ProfitPulseBackdrop", Component: ProfitPulseBackdrop, usage: "Behind Profit Pulse chart", backdrop: true },
];

function Row({ entry, reducedMotion }: { entry: Entry; reducedMotion: boolean }) {
  const { Component, name, usage, backdrop } = entry;
  return (
    <Card className="overflow-hidden border-border/70">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
        <div>
          <div className="text-[13px] font-semibold text-foreground">{name}</div>
          <div className="text-[11.5px] text-muted-foreground">{usage}</div>
        </div>
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          Demonstration
        </span>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-4">
        {/* Light card */}
        <div className="rounded-xl border border-border/70 bg-surface p-3">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Light card
          </div>
          <div className="relative h-24 overflow-hidden rounded-md bg-white">
            {backdrop ? (
              <div className="absolute inset-0">
                <Component reducedMotion={reducedMotion} width="100%" height="100%" />
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0">
                <Component reducedMotion={reducedMotion} width="100%" height="70%" />
              </div>
            )}
          </div>
        </div>
        {/* Dark card */}
        <div className="rounded-xl border border-border/70 bg-gradient-briefing p-3">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-white/60">
            Dark card
          </div>
          <div className="relative h-24 overflow-hidden rounded-md">
            {backdrop ? (
              <div className="absolute inset-0">
                <Component reducedMotion={reducedMotion} width="100%" height="100%" />
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0">
                <Component reducedMotion={reducedMotion} width="100%" height="70%" />
              </div>
            )}
          </div>
        </div>
        {/* Compact KPI */}
        <div className="rounded-xl border border-border/70 bg-surface p-3">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Compact KPI
          </div>
          <div className="relative h-16 overflow-hidden rounded-md bg-white">
            <div className="absolute bottom-0 right-0 w-24">
              <Component reducedMotion={reducedMotion} variant="compact" width="100%" height="60px" />
            </div>
          </div>
        </div>
        {/* Large */}
        <div className="rounded-xl border border-border/70 bg-surface p-3">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Large preview
          </div>
          <div className="relative h-32 overflow-hidden rounded-md bg-white">
            <Component reducedMotion={reducedMotion} width="100%" height="100%" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function AssetsPage() {
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <ApexPage
      title="Illustration Asset Kit"
      description="Reusable Project APEX illustrations. All components are transparent-background SVG, no baked text or numbers, decorative by default."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReducedMotion((v) => !v)}
          aria-pressed={reducedMotion}
        >
          {reducedMotion ? "Motion: off" : "Motion: on"}
        </Button>
      }
    >
      <ApexSection
        title="Usage examples"
        description="Decorative illustrations are aria-hidden. Provide title + decorative={false} to use as a meaningful image."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="border-border/70 p-4">
            <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Decorative (default)
            </div>
            <div className="relative h-24 overflow-hidden rounded-md bg-white">
              <div className="absolute bottom-0 left-0 right-0">
                <CashLandscape width="100%" height="70%" />
              </div>
            </div>
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              aria-hidden, focusable=false. Meant to sit under live KPI text.
            </div>
          </Card>
          <Card className="border-border/70 p-4">
            <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Meaningful (role=img, titled)
            </div>
            <div className="flex h-24 items-center justify-center rounded-md bg-white">
              <FinancialHealthVisual
                decorative={false}
                title="Company financial health indicator"
                width={110}
                height={110}
              />
            </div>
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              Announced by screen readers as its title.
            </div>
          </Card>
        </div>
      </ApexSection>

      <ApexSection title="Asset previews">
        <div className="grid gap-3">
          {ENTRIES.map((e) => (
            <Row key={e.name} entry={e} reducedMotion={reducedMotion} />
          ))}
        </div>
      </ApexSection>
    </ApexPage>
  );
}

export const Route = createFileRoute("/apex/assets")({
  head: () => ({ meta: [{ title: "APEX Illustrations — Project APEX" }] }),
  component: AssetsPage,
});
