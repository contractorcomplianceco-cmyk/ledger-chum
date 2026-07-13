import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import type { CompensationPaymentBatch } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

const FLOW = ["draft", "reviewed", "approved", "export_ready", "sent_to_external", "reconciliation_pending", "reconciled", "closed"] as const;

export const Route = createFileRoute("/compensation/payment-batches/$id")({
  head: () => ({ meta: [{ title: "Payment Batch — LedgerOS" }] }),
  component: BatchDetail,
});

function BatchDetail() {
  const { id } = Route.useParams();
  const [b, setB] = useState<CompensationPaymentBatch | undefined>();
  useEffect(() => { api.compensationOps.getPaymentBatch(id).then(setB); }, [id]);

  if (!b) return <CompensationShell title="Batch"><Card className="p-6 text-sm text-muted-foreground">Loading…</Card></CompensationShell>;

  const currentIdx = FLOW.indexOf(b.status);

  return (
    <CompensationShell eyebrow="Payment Batch" title={id} description={`${b.destination.replace(/_/g, " ")} · ${b.periodStart} → ${b.periodEnd}`}
      actions={
        <div className="flex gap-2">
          <Button size="sm" onClick={() => showDemoToast("Batch approved")}>Approve</Button>
          <Button size="sm" variant="outline" onClick={() => showDemoToast("Marked exported")}>Mark exported</Button>
          <Button size="sm" variant="ghost" onClick={() => showDemoToast("Reconciled batch")}>Reconcile</Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 text-xs">
          {FLOW.map((s, i) => (
            <div key={s} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${i <= currentIdx ? "bg-brand/10 text-brand" : "border border-border/40 text-muted-foreground"}`}>
              <span>{i + 1}.</span><span className="capitalize">{s.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 grid gap-3 md:grid-cols-4 text-sm">
        <F label="Status" value={<Badge variant="outline">{b.status.replace(/_/g, " ")}</Badge>} />
        <F label="Destination" value={b.destination.replace(/_/g, " ")} />
        <F label="Participants" value={String(b.participantCount)} />
        <F label="Scheduled" value={b.scheduledDate ?? "—"} />
        <F label="Gross" value={currency(b.grossAmount)} />
        <F label="Adjustments" value={currency(b.adjustments)} />
        <F label="Net" value={<span className="font-semibold text-lg">{currency(b.netAmount)}</span>} />
        <F label="Reconciliation" value={b.reconciliationState} />
        <F label="Prepared by" value={b.preparedBy} />
        <F label="Approved by" value={b.approvedBy ?? "—"} />
        <F label="Payables in batch" value={String(b.payableIds.length)} />
      </Card>

      <Card className="p-5">
        <div className="mb-2 text-sm font-semibold">Audit timeline</div>
        <ul className="space-y-1 text-xs">
          {b.auditTimeline.map((e, i) => (
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
