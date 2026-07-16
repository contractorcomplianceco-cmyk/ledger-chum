import { createFileRoute, Link } from "@tanstack/react-router";
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
import type { CompensationPaymentBatch } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/payment-batches/")({
  head: () => ({ meta: [{ title: "Payment Batches — LedgerOS" }] }),
  component: BatchList,
});

function BatchList() {
  const [rows, setRows] = useState<CompensationPaymentBatch[]>([]);
  useEffect(() => {
    api.compensationOps.listPaymentBatches().then(setRows);
  }, []);

  return (
    <CompensationShell
      title="Payment Batches"
      description="Batches export payroll and AP references — external systems remain mock-only."
    >
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Participants</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Adj</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead>Prepared by</TableHead>
              <TableHead>Approved by</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recon</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">
                  <Link
                    to="/compensation/payment-batches/$id"
                    params={{ id: b.id }}
                    className="hover:underline"
                  >
                    {b.id}
                  </Link>
                </TableCell>
                <TableCell className="text-xs">{b.destination.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-xs">
                  {b.periodStart} → {b.periodEnd}
                </TableCell>
                <TableCell className="text-right">{b.participantCount}</TableCell>
                <TableCell className="text-right font-tabular">{currency(b.grossAmount)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(b.adjustments)}</TableCell>
                <TableCell className="text-right font-tabular font-semibold">
                  {currency(b.netAmount)}
                </TableCell>
                <TableCell className="text-xs">{b.preparedBy}</TableCell>
                <TableCell className="text-xs">{b.approvedBy ?? "—"}</TableCell>
                <TableCell className="text-xs">{b.scheduledDate ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {b.status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{b.reconciliationState}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => showDemoToast("Approved batch")}>
                    Approve
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
