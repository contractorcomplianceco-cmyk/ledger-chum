import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ConfidenceChip, DemoBadge, FreshnessChip } from "./chips";

export type ExplainabilityPayload = {
  title: string;
  question: string;
  answer: string;
  period: string;
  entity: string;
  calculation: string[];
  evidence: Array<{ label: string; ref: string }>;
  assumptions: string[];
  missingData?: string[];
  action: string;
  approval: string;
  confidence: number;
  freshness: string;
};

export function ExplainabilityDrawer({
  open,
  onOpenChange,
  payload,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payload: ExplainabilityPayload;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-[15px]">{payload.title}</SheetTitle>
            <DemoBadge />
          </div>
          <SheetDescription className="text-[12px]">{payload.question}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4 px-1 text-[12.5px]">
          <Section label="Direct answer">
            <p className="leading-relaxed">{payload.answer}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ConfidenceChip value={payload.confidence} />
              <FreshnessChip label={payload.freshness} />
              <Meta label="Period" value={payload.period} />
              <Meta label="Entity" value={payload.entity} />
            </div>
          </Section>

          <Section label="Calculation method">
            <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
              {payload.calculation.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
          </Section>

          <Section label="Supporting evidence">
            <ul className="space-y-1">
              {payload.evidence.map((e) => (
                <li key={e.ref} className="flex justify-between gap-2 rounded-md border border-border/70 px-2 py-1">
                  <span>{e.label}</span>
                  <code className="font-mono text-[11px] text-muted-foreground">{e.ref}</code>
                </li>
              ))}
            </ul>
          </Section>

          <Section label="Assumptions">
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {payload.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Section>

          {payload.missingData && payload.missingData.length > 0 && (
            <Section label="Missing data">
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {payload.missingData.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </Section>
          )}

          <Section label="Recommended action">
            <p className="rounded-md bg-accent/60 p-2 leading-relaxed">{payload.action}</p>
          </Section>

          <Section label="Required approval">
            <p className="text-muted-foreground">{payload.approval}</p>
          </Section>

          <p className="rounded-md border border-warning/40 bg-warning/10 p-2 text-[11.5px] text-warning-foreground">
            Demonstration insight — advisory only, based on mock financial data. No records were modified.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10.5px] text-muted-foreground">
      <span className="font-semibold text-foreground/70">{label}:</span> {value}
    </span>
  );
}
