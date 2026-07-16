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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { CompensationReconciliation } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/reconciliation")({
  head: () => ({ meta: [{ title: "Compensation Reconciliation — LedgerOS" }] }),
  component: Reconciliation,
});

function Reconciliation() {
  const [r, setR] = useState<CompensationReconciliation | undefined>();
  useEffect(() => {
    api.compensationOps.getCompensationReconciliation().then(setR);
  }, []);

  if (!r)
    return (
      <CompensationShell title="Reconciliation">
        <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
      </CompensationShell>
    );

  const rows: Array<[string, number]> = [
    ["Calculated", r.calculated],
    ["Approved", r.approved],
    ["Reserved", r.reserved],
    ["Payable", r.payable],
    ["Exported", r.exported],
    ["Paid externally", r.paidExternally],
    ["Cleared in bank", r.clearedInBank],
    ["Recorded in ledger", r.recordedInLedger],
    ["Reflected on statement", r.reflectedOnStatement],
  ];

  return (
    <CompensationShell
      title="Compensation Reconciliation"
      description={`Period ${r.periodStart} → ${r.periodEnd}. Reconciles calculation → approval → reserve → payable → export → paid → cleared → ledger → statement.`}
    >
      <Card className="p-5">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
          {rows.map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border/60 bg-surface p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
              <div className="mt-1 font-tabular font-semibold">{currency(v)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <div className="p-4 text-sm font-semibold">Exceptions</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Suggested resolution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {r.exceptions.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs">{e.type.replace(/_/g, " ")}</TableCell>
                <TableCell>{e.participantName}</TableCell>
                <TableCell className="text-right font-tabular">{currency(e.amount)}</TableCell>
                <TableCell className="text-xs">{e.description}</TableCell>
                <TableCell className="text-xs">{e.suggestedResolution}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {e.status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => showDemoToast("Exception resolved")}
                  >
                    Resolve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <DemoActionNotice />
    </CompensationShell>
  );
}
