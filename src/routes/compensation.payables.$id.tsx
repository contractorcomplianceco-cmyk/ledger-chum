import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import type { CompensationPayable } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/payables/$id")({
  head: () => ({ meta: [{ title: "Payable — LedgerOS" }] }),
  component: PayableDetail,
});

function PayableDetail() {
  const { id } = Route.useParams();
  const [p, setP] = useState<CompensationPayable | undefined>();
  useEffect(() => { api.compensationOps.getPayable(id).then(setP); }, [id]);

  if (!p) return <CompensationShell title="Payable"><Card className="p-6 text-sm text-muted-foreground">Loading…</Card></CompensationShell>;

  return (
    <CompensationShell eyebrow="Payable" title={p.participantName} description={`${p.periodStart} → ${p.periodEnd} · ${p.destination.replace(/_/g, " ")}`}
      actions={
        <div className="flex gap-2">
          <Button size="sm" onClick={() => showDemoToast("Approved payable")}>Approve</Button>
          <Button size="sm" variant="outline" onClick={() => showDemoToast("Scheduled")}>Schedule</Button>
          <Button size="sm" variant="ghost" onClick={() => showDemoToast("Marked paid")}>Mark paid</Button>
        </div>
      }
    >
      <Card className="p-5 grid gap-3 md:grid-cols-4 text-sm">
        <F label="Status" value={<Badge variant="outline">{p.status.replace(/_/g, " ")}</Badge>} />
        <F label="Type" value={p.participantType} />
        <F label="Classes" value={p.compensationClasses.join(", ")} />
        <F label="Scheduled" value={p.scheduledDate ?? "—"} />
        <F label="Gross" value={currency(p.grossAmount)} />
        <F label="Adjustments" value={currency(p.adjustments)} />
        <F label="Holdbacks" value={currency(p.holdbacks)} />
        <F label="Draw offset" value={currency(p.drawOffset)} />
        <F label="Clawback offset" value={currency(p.clawbackOffset)} />
        <F label="Net payable" value={<span className="text-lg font-bold">{currency(p.netPayable)}</span>} />
        <F label="GL expense" value={p.glExpenseAccount} />
        <F label="GL payable" value={p.glPayableAccount} />
      </Card>

      <Card className="p-5">
        <div className="mb-2 text-sm font-semibold">Audit timeline</div>
        <ul className="space-y-1 text-xs">
          {p.auditTimeline.map((e, i) => (
            <li key={i} className="flex justify-between border-b border-border/40 py-1"><span>{e.action}</span><span className="text-muted-foreground">{e.actor} · {new Date(e.at).toLocaleString()}</span></li>
          ))}
        </ul>
      </Card>
      <DemoActionNotice />
    </CompensationShell>
  );
}

function F({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-0.5 font-tabular">{value}</div></div>;
}
