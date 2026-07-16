import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CompensationShell,
  DemoActionNotice,
  showDemoToast,
} from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import type { CompensationDispute } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/disputes/$id")({
  head: () => ({ meta: [{ title: "Dispute — LedgerOS" }] }),
  component: DisputeDetail,
});

function DisputeDetail() {
  const { id } = Route.useParams();
  const [d, setD] = useState<CompensationDispute | undefined>();
  useEffect(() => {
    api.compensationOps.getDispute(id).then(setD);
  }, [id]);

  if (!d)
    return (
      <CompensationShell title="Dispute">
        <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
      </CompensationShell>
    );

  return (
    <CompensationShell
      eyebrow="Dispute"
      title={`${d.participantName} · ${d.type.replace(/_/g, " ")}`}
      description={`Filed ${d.filedDate} by ${d.filedBy}. Assigned to ${d.assignedReviewer ?? "—"}.`}
      actions={
        <div className="flex gap-2">
          <Button size="sm" onClick={() => showDemoToast("Dispute resolved")}>
            Resolve
          </Button>
          <Button size="sm" variant="outline" onClick={() => showDemoToast("Evidence added")}>
            Add evidence
          </Button>
        </div>
      }
    >
      <Card className="p-5 grid gap-3 md:grid-cols-3 text-sm">
        <F label="Status" value={<Badge variant="outline">{d.status.replace(/_/g, " ")}</Badge>} />
        <F label="Amount in dispute" value={currency(d.amountInDispute)} />
        <F label="SLA due" value={d.slaDueDate ?? "—"} />
        <F label="Type" value={d.type.replace(/_/g, " ")} />
        <F label="Related calculation" value={d.calculationId ?? "—"} />
        <F label="Evidence attached" value={String(d.evidenceIds.length)} />
        <div className="md:col-span-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Proposed resolution
          </div>
          <div className="mt-1 text-sm">{d.proposedResolution ?? "Pending"}</div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-2 text-sm font-semibold">Audit timeline</div>
        <ul className="space-y-1 text-xs">
          {d.auditTimeline.map((e, i) => (
            <li key={i} className="flex justify-between border-b border-border/40 py-1">
              <span>
                {e.action}
                {e.note ? ` — ${e.note}` : ""}
              </span>
              <span className="text-muted-foreground">
                {e.actor} · {new Date(e.at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <DemoActionNotice />
    </CompensationShell>
  );
}

function F({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-tabular">{value}</div>
    </div>
  );
}
