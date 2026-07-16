import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
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
import type { CompensationStatement } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/statements/")({
  head: () => ({ meta: [{ title: "Participant Statements — LedgerOS" }] }),
  component: StatementList,
});

function StatementList() {
  const [rows, setRows] = useState<CompensationStatement[]>([]);
  useEffect(() => {
    api.compensationOps.listStatements().then(setRows);
  }, []);

  return (
    <CompensationShell
      title="Participant Statements"
      description="Statements keep compensation classes strictly separate — retainer, brand ambassador, software participation, milestone, event stipend, investor, and equity are never blended."
    >
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Earned</TableHead>
              <TableHead className="text-right">Approved</TableHead>
              <TableHead className="text-right">Payable</TableHead>
              <TableHead className="text-right">Held</TableHead>
              <TableHead className="text-right">Ending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Link
                    to="/compensation/statements/$id"
                    params={{ id: s.id }}
                    className="font-medium hover:underline"
                  >
                    {s.participantName}
                  </Link>
                </TableCell>
                <TableCell className="text-xs">{s.participantType.replace(/_/g, " ")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {s.statementKind.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {s.periodStart} → {s.periodEnd}
                </TableCell>
                <TableCell className="text-right font-tabular">{currency(s.earned)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(s.approved)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(s.payable)}</TableCell>
                <TableCell className="text-right font-tabular text-muted-foreground">
                  {currency(s.holdbacks)}
                </TableCell>
                <TableCell className="text-right font-tabular font-semibold">
                  {currency(s.endingBalance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </CompensationShell>
  );
}
