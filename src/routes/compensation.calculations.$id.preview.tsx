import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import type { CompensationCalculation } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/calculations/$id/preview")({
  head: () => ({ meta: [{ title: "Calculation Preview — LedgerOS" }] }),
  component: CalcPreview,
});

function CalcPreview() {
  const { id } = Route.useParams();
  const [calc, setCalc] = useState<CompensationCalculation | undefined>();
  useEffect(() => { api.compensationOps.getCalculation(id).then(setCalc); }, [id]);

  if (!calc) return <CompensationShell title="Preview"><Card className="p-6 text-sm text-muted-foreground">Loading…</Card></CompensationShell>;

  return (
    <CompensationShell
      eyebrow="Snapshot preview"
      title={`Preview · ${calc.participantName}`}
      description="Preview of resolved policy, invariants, and calculation lines — read only."
    >
      <Card className="p-5 space-y-3 text-sm">
        <div className="rounded-lg border border-brand/40 bg-brand/5 p-3">{calc.explanation}</div>

        <div className="grid gap-3 md:grid-cols-4">
          <Stat label="Gross" value={currency(calc.grossPayment)} />
          <Stat label="Pass-through" value={`-${currency(calc.passThroughExcluded)}`} />
          <Stat label="Realized" value={currency(calc.realizedRevenue)} />
          <Stat label="Net payable" value={currency(calc.totalNetPayable)} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border/60 p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Invariants</div>
            <ul className="mt-2 space-y-1 text-xs">
              <li>✓ Pass-through excluded from base</li>
              <li>✓ Collected &amp; cleared revenue</li>
              <li>✓ No double-dip on same basis</li>
              <li>✓ Stacked pools kept separate</li>
              <li>✓ Attribution total 100% per pool</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Approvals required</div>
            <ul className="mt-2 space-y-1 text-xs">
              {calc.approvalRoute.map((a) => <li key={a}>· {a}</li>)}
            </ul>
          </div>
        </div>
      </Card>
    </CompensationShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-tabular text-lg font-bold">{value}</div>
    </div>
  );
}
