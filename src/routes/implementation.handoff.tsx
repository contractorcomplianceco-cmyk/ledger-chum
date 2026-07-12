import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { HANDOFF_PACKAGE } from "@/lib/mock/implementation";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed } from "lucide-react";

export const Route = createFileRoute("/implementation/handoff")({
  head: () => ({ meta: [{ title: "Handoff Package — LedgerOS" }] }),
  component: HandoffPage,
});

function HandoffPage() {
  const ready = HANDOFF_PACKAGE.filter((d) => d.ready).length;
  return (
    <ImplementationPage
      title="Handoff Package"
      description="Everything that must ship to the backend team before real API wiring begins. Do not connect real endpoints ad-hoc from Lovable — the design lab has grown too broad."
    >
      <Card className="border-border/70 p-5">
        <div className="flex items-baseline gap-2">
          <div className="font-tabular text-[26px] font-bold">{ready} / {HANDOFF_PACKAGE.length}</div>
          <div className="text-[12px] text-muted-foreground">documents ready to hand off.</div>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          Ad-hoc backend wiring from this design lab would create duplicate business logic, inconsistent permissions,
          unsafe automatic posting, conflicting financial formulas, and diverging definitions of revenue, margin, and
          available cash. Phase 5 exists specifically to prevent that.
        </p>
      </Card>

      <Card className="border-border/70 p-0">
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,1.6fr)_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Document</span>
          <span>Owner</span>
          <span>Format</span>
          <span>Status</span>
        </div>
        {HANDOFF_PACKAGE.map((d) => (
          <div key={d.doc} className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,1.6fr)_auto] items-center gap-2 border-b border-border px-4 py-2.5 text-[12px] last:border-b-0">
            <span className="font-medium">{d.doc}</span>
            <span className="text-muted-foreground">{d.owner}</span>
            <span className="text-muted-foreground">{d.format}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
                d.ready
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-warning/40 bg-warning/10 text-warning",
              )}
            >
              {d.ready ? <CheckCircle2 className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
              {d.ready ? "Ready" : "In progress"}
            </span>
          </div>
        ))}
      </Card>

      <Card className="border-border/70 p-4 text-[12px] text-muted-foreground">
        <div className="font-semibold text-foreground">Rules for the next phase</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>No real endpoint is wired from Lovable without an approved API map entry.</li>
          <li>No mutation ships without an audit event and a permission string.</li>
          <li>No screen swaps from mock to live until its lineage disclosures are populated.</li>
          <li>No automation is promoted from draft-only to auto-post without a Decision Log entry.</li>
        </ul>
      </Card>
    </ImplementationPage>
  );
}
