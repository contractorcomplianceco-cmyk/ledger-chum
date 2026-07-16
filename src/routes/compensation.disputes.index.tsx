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
import type { CompensationDispute } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/disputes/")({
  head: () => ({ meta: [{ title: "Compensation Disputes — LedgerOS" }] }),
  component: DisputesList,
});

function DisputesList() {
  const [rows, setRows] = useState<CompensationDispute[]>([]);
  useEffect(() => {
    api.compensationOps.listDisputes().then(setRows);
  }, []);

  return (
    <CompensationShell
      title="Compensation Disputes"
      description="Every dispute preserves evidence, timeline, and required approvals. Owner or Legal review required for post-termination and investor claims."
      actions={
        <Button size="sm" onClick={() => showDemoToast("Dispute filed")}>
          File Dispute
        </Button>
      }
    >
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Filed</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">
                  <Link
                    to="/compensation/disputes/$id"
                    params={{ id: d.id }}
                    className="hover:underline"
                  >
                    {d.id}
                  </Link>
                </TableCell>
                <TableCell>{d.participantName}</TableCell>
                <TableCell className="text-xs">{d.type.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-right font-tabular">
                  {currency(d.amountInDispute)}
                </TableCell>
                <TableCell className="text-xs">{d.filedDate}</TableCell>
                <TableCell className="text-xs">{d.assignedReviewer ?? "—"}</TableCell>
                <TableCell className="text-xs">{d.slaDueDate ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {d.status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to="/compensation/disputes/$id" params={{ id: d.id }}>
                      Open
                    </Link>
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
