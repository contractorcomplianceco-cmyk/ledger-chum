import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import type { CompensationCalculation } from "@/lib/api/services/compensation";

export const Route = createFileRoute("/compensation/audit")({
  head: () => ({ meta: [{ title: "Compensation Audit — LedgerOS" }] }),
  component: AuditHistory,
});

const AUDIT_EVENTS = [
  "Calculation created",
  "Calculation previewed",
  "Calculation submitted",
  "Verification completed",
  "Evidence requested",
  "Calculation approved",
  "Calculation rejected",
  "Calculation held",
  "Calculation released",
  "Reserve created",
  "Payable created",
  "Payable approved",
  "Payment scheduled",
  "Payment batch created",
  "Payment batch approved",
  "External export recorded",
  "Payment marked paid",
  "Statement generated",
  "Holdback created",
  "Holdback released",
  "Holdback extended",
  "Adjustment requested",
  "Adjustment approved",
  "Reversal created",
  "Clawback created",
  "Clawback approved",
  "Recovery recorded",
  "Dispute filed",
  "Dispute evidence added",
  "Dispute resolved",
  "Reconciliation exception found",
  "Reconciliation exception resolved",
];

function AuditHistory() {
  const [calcs, setCalcs] = useState<CompensationCalculation[]>([]);
  useEffect(() => {
    api.compensationOps.listCalculations().then((r) => setCalcs(r.data));
  }, []);

  const events = calcs.flatMap((c) =>
    c.auditTimeline.map((e) => ({ ...e, calc: c.id, participant: c.participantName })),
  );
  events.sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <CompensationShell
      title="Compensation Audit History"
      description="Immutable audit log across calculations, approvals, holdbacks, payables, batches, adjustments, clawbacks, disputes, and reconciliation."
    >
      <Card className="p-5">
        <div className="mb-3 text-sm font-semibold">Tracked event types</div>
        <div className="flex flex-wrap gap-1 text-[10.5px]">
          {AUDIT_EVENTS.map((e) => (
            <span
              key={e}
              className="rounded-md border border-border/40 bg-muted px-2 py-0.5 text-muted-foreground"
            >
              {e}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-2 text-sm font-semibold">Recent events</div>
        <ul className="space-y-1 text-sm">
          {events.map((e, i) => (
            <li
              key={i}
              className="flex items-start justify-between border-b border-border/40 py-1.5"
            >
              <div>
                <div>{e.action}</div>
                <div className="text-xs text-muted-foreground">
                  {e.participant} · calc {e.calc}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {e.actor} · {new Date(e.at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </CompensationShell>
  );
}
