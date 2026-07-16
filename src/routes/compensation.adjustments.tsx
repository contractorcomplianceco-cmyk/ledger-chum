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
import type { CompensationAdjustment, CompensationReversal } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/adjustments")({
  head: () => ({ meta: [{ title: "Adjustments & Reversals — LedgerOS" }] }),
  component: Adjustments,
});

function Adjustments() {
  const [adj, setAdj] = useState<CompensationAdjustment[]>([]);
  const [rev, setRev] = useState<CompensationReversal[]>([]);
  useEffect(() => {
    api.compensationOps.listAdjustments().then(setAdj);
    api.compensationOps.listReversals().then(setRev);
  }, []);

  return (
    <CompensationShell
      title="Adjustments & Reversals"
      description="Paid calculations are never directly edited — corrections use Adjustment (open period) or Reversal (full/partial) with audit history preserved."
      actions={
        <div className="flex gap-2">
          <Button size="sm" onClick={() => showDemoToast("Adjustment drafted")}>
            New Adjustment
          </Button>
          <Button size="sm" variant="outline" onClick={() => showDemoToast("Reversal drafted")}>
            New Reversal
          </Button>
        </div>
      }
    >
      <Card className="p-4">
        <div className="mb-2 text-sm font-semibold">Adjustments</div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Original Calc</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Approver</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Accounting preview</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {adj.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell className="font-mono text-xs">{a.originalCalculationId}</TableCell>
                  <TableCell>{a.participantName}</TableCell>
                  <TableCell className="text-xs">{a.type.replace(/_/g, " ")}</TableCell>
                  <TableCell className="text-right font-tabular font-semibold">
                    {currency(a.amount)}
                  </TableCell>
                  <TableCell className="text-xs">{a.reason}</TableCell>
                  <TableCell className="text-xs">{a.requiredApprover}</TableCell>
                  <TableCell className="text-xs">{a.effectivePeriod}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {a.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {a.accountingPreview}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => showDemoToast("Approved adjustment")}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-2 text-sm font-semibold">Reversals</div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Original Calc</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Impacts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rev.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-mono text-xs">{r.originalCalculationId}</TableCell>
                  <TableCell className="text-xs">{r.reversalScope}</TableCell>
                  <TableCell className="text-xs">{r.reason}</TableCell>
                  <TableCell className="text-right font-tabular">{currency(r.amount)}</TableCell>
                  <TableCell className="text-xs">{r.effectivePeriod}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {r.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    Accounting: {r.accountingImpact}
                    <br />
                    Statement: {r.statementImpact}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <DemoActionNotice />
    </CompensationShell>
  );
}
