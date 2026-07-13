import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { CompensationHoldback } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/holdbacks")({
  head: () => ({ meta: [{ title: "Holdback Center — LedgerOS" }] }),
  component: Holdbacks,
});

function Holdbacks() {
  const [rows, setRows] = useState<CompensationHoldback[]>([]);
  useEffect(() => { api.compensationOps.listHoldbacks().then(setRows); }, []);

  const risk = (s: CompensationHoldback["riskStatus"]) =>
    s === "high" ? "border-destructive/40 bg-destructive/10 text-destructive"
    : s === "medium" ? "border-warning/40 bg-warning/10 text-warning"
    : "border-success/40 bg-success/10 text-success";

  return (
    <CompensationShell
      title="Holdback Center"
      description="Automatic release when the chargeback window expires without risk triggers. Rose approval required for medium/high risk or missing evidence."
    >
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead><TableHead>Plan</TableHead><TableHead>Calc</TableHead>
              <TableHead className="text-right">Original</TableHead><TableHead className="text-right">Hold %</TableHead>
              <TableHead className="text-right">Amount</TableHead><TableHead>Start</TableHead><TableHead>Window end</TableHead>
              <TableHead>Risk</TableHead><TableHead>Release</TableHead><TableHead>Status</TableHead>
              <TableHead className="text-right">Remaining</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.participantName}</TableCell>
                <TableCell className="text-xs">{h.planName}</TableCell>
                <TableCell className="font-mono text-xs">{h.calculationId}</TableCell>
                <TableCell className="text-right font-tabular">{currency(h.originalCompensation)}</TableCell>
                <TableCell className="text-right text-xs">{(h.holdbackPercent * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-right font-tabular">{currency(h.holdbackAmount)}</TableCell>
                <TableCell className="text-xs">{h.holdStart}</TableCell>
                <TableCell className="text-xs">{h.chargebackWindowEnd}</TableCell>
                <TableCell><Badge variant="outline" className={risk(h.riskStatus)}>{h.riskStatus}</Badge></TableCell>
                <TableCell className="text-xs">{h.releaseMethod.replace(/_/g, " ")}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{h.status.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell className="text-right font-tabular">{currency(h.remainingAmount)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => showDemoToast("Released holdback")} disabled={h.status !== "eligible_for_release" && h.releaseMethod !== "manual" && h.riskStatus === "high"}>Release</Button>
                    <Button size="sm" variant="ghost" onClick={() => showDemoToast("Extended hold")}>Extend</Button>
                    <Button size="sm" variant="ghost" onClick={() => showDemoToast("Converted to clawback")}>Convert</Button>
                  </div>
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
