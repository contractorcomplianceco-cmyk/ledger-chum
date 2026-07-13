import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type { AttributionConflict } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/attribution/conflicts")({
  head: () => ({ meta: [{ title: "Attribution Conflicts — LedgerOS" }] }),
  component: ConflictsPage,
});

const STATUS_TONE: Record<string, string> = {
  open: "border-warning/40 bg-warning/10 text-warning",
  leadership_review: "border-destructive/40 bg-destructive/10 text-destructive",
  legal_review: "border-destructive/40 bg-destructive/10 text-destructive",
  accounting_review: "border-warning/40 bg-warning/10 text-warning",
  resolved: "border-success/40 bg-success/10 text-success",
};

function ConflictsPage() {
  const [rows, setRows] = useState<AttributionConflict[]>([]);

  useEffect(() => {
    api.compensation.listConflicts().then(setRows);
  }, []);

  return (
    <CompensationShell
      title="Attribution conflicts"
      description="Every conflict routes to the correct approver — leadership, legal, or accounting. UI does not silently decide disputed claims."
    >
      <div className="grid gap-4">
        {rows.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{c.opportunityName}</h3>
                  <Badge variant="outline">{c.type.replaceAll("_", " ")}</Badge>
                  <Badge variant="outline" className={STATUS_TONE[c.status] ?? ""}>{c.status.replaceAll("_", " ")}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{c.competingClaims}</div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <span><span className="text-muted-foreground">Participants:</span> {c.participants.join(", ")}</span>
                  <span><span className="text-muted-foreground">Evidence:</span> {c.evidenceCount}</span>
                  <span><span className="text-muted-foreground">Impact:</span> {currency(c.financialImpact)}</span>
                  <span><span className="text-muted-foreground">Approver:</span> {c.requiredApprover}</span>
                </div>
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Suggested resolution: </span>{c.suggestedResolution}
                </div>
                <div className="mt-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timeline</div>
                  <ul className="ml-4 mt-1 list-disc space-y-0.5 text-xs">
                    {c.timeline.map((t, i) => (
                      <li key={i}>{t.at.slice(0, 10)} — {t.actor}: {t.action}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button size="sm" onClick={() => { api.compensation.resolveConflict(c.id, "resolved"); showDemoToast("Conflict resolved"); }}>Resolve</Button>
                <Button size="sm" variant="outline" onClick={() => showDemoToast("Requested evidence")}>Request evidence</Button>
                <Button size="sm" variant="outline" onClick={() => showDemoToast("Escalated")}>Escalate</Button>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <Card className="p-6 text-sm text-muted-foreground">No open conflicts.</Card>}
      </div>
    </CompensationShell>
  );
}
