import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { CUTOVER_CHECKLIST } from "@/lib/mock/implementation";

export const Route = createFileRoute("/implementation/cutover")({
  head: () => ({ meta: [{ title: "Cutover Runbook — LedgerOS" }] }),
  component: CutoverPage,
});

function CutoverPage() {
  return (
    <ImplementationPage
      title="Cutover Runbook"
      description="T-30 → T+7 checklist for moving system of record from Zoho Books to LedgerOS. Every item has an owner. Every day has a go / no-go review."
    >
      <div className="space-y-3">
        {CUTOVER_CHECKLIST.map((c) => (
          <Card key={c.phase} className="border-border/70 p-4">
            <div className="text-[13px] font-semibold">{c.phase}</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-muted-foreground">
              {c.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 p-4 text-[12px] text-muted-foreground">
        <div className="font-semibold text-foreground">Go / no-go authority</div>
        <p className="mt-1">Rose is the sole go / no-go decision-maker on cutover day. Christin owns the reconciliation report; Carmen attests. A single failed acceptance test moves the cutover by 7 days by default.</p>
      </Card>
    </ImplementationPage>
  );
}
