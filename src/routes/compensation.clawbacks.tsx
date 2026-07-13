import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import type { CompensationClawback } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/clawbacks")({
  head: () => ({ meta: [{ title: "Clawback Center — LedgerOS" }] }),
  component: Clawbacks,
});

function Clawbacks() {
  const [rows, setRows] = useState<CompensationClawback[]>([]);
  useEffect(() => { api.compensationOps.listClawbacks().then(setRows); }, []);

  return (
    <CompensationShell
      title="Clawback Center"
      description="Clawbacks require an approved recovery workflow. Recovery never automatically touches already-paid amounts."
      actions={<Button size="sm" onClick={() => showDemoToast("Clawback drafted")}>New Clawback</Button>}
    >
      <div className="grid gap-3">
        {rows.map((c) => (
          <Card key={c.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{c.participantName}</div>
                <div className="text-xs text-muted-foreground">
                  Trigger: {c.trigger.replace(/_/g, " ")} · Original calc {c.originalCalculationId}
                </div>
              </div>
              <Badge variant="outline">{c.approvalStatus.replace(/_/g, " ")}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div><div className="text-xs text-muted-foreground">Gross</div><div className="font-tabular font-semibold">{currency(c.grossClawback)}</div></div>
              <div><div className="text-xs text-muted-foreground">Recovered</div><div className="font-tabular">{currency(c.amountRecovered)}</div></div>
              <div><div className="text-xs text-muted-foreground">Remaining</div><div className="font-tabular font-semibold">{currency(c.remainingAmount)}</div></div>
              <div><div className="text-xs text-muted-foreground">Method</div><div className="text-xs">{c.recoveryMethod?.replace(/_/g, " ") ?? "—"}</div></div>
            </div>
            <div className="text-xs text-muted-foreground">
              Accounting: {c.accountingImpact}<br />
              Payroll/AP: {c.payrollApImpact}
            </div>
            {c.recoveries.length > 0 && (
              <div className="rounded-md border border-border/60 p-2 text-xs">
                <div className="font-semibold mb-1">Recoveries</div>
                {c.recoveries.map((r) => (
                  <div key={r.id} className="flex justify-between">
                    <span>{r.method.replace(/_/g, " ")}</span>
                    <span className="font-tabular">{currency(r.amount)} · {new Date(r.recordedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" onClick={() => showDemoToast("Clawback approved")}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => showDemoToast("Recovery recorded")}>Record Recovery</Button>
              <Button size="sm" variant="ghost" onClick={() => showDemoToast("Written off")}>Write-off</Button>
              <Button size="sm" variant="ghost" onClick={() => showDemoToast("Sent to legal")}>Legal collection</Button>
            </div>
          </Card>
        ))}
      </div>
      <DemoActionNotice />
    </CompensationShell>
  );
}
