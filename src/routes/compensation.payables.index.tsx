import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { CompensationPayable, PayableStatus } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

const STATUS_TABS: Array<"all" | PayableStatus> = ["all", "draft", "pending_approval", "approved", "ready_for_payroll", "ready_for_ap", "scheduled", "paid", "failed", "returned", "cancelled", "reversed"];

export const Route = createFileRoute("/compensation/payables/")({
  head: () => ({ meta: [{ title: "Compensation Payables — LedgerOS" }] }),
  component: PayablesList,
});

function PayablesList() {
  const [rows, setRows] = useState<CompensationPayable[]>([]);
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("all");

  useEffect(() => { api.compensationOps.listPayables().then((r) => setRows(r.data)); }, []);

  const filtered = tab === "all" ? rows : rows.filter((r) => r.status === tab);

  return (
    <CompensationShell title="Payables" description="Payables represent net disbursement obligations. No real money moves — mock demonstrations only.">
      <Card className="p-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((s) => (
            <Button key={s} size="sm" variant={tab === s ? "default" : "outline"} onClick={() => setTab(s)} className="h-8">{s.replace(/_/g, " ")}</Button>
          ))}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead><TableHead>Participant</TableHead><TableHead>Type</TableHead><TableHead>Classes</TableHead>
              <TableHead>Period</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">Adj</TableHead>
              <TableHead className="text-right">Holdback</TableHead><TableHead className="text-right">Draw Offset</TableHead>
              <TableHead className="text-right">Clawback Offset</TableHead><TableHead className="text-right">Net</TableHead>
              <TableHead>Destination</TableHead><TableHead>Scheduled</TableHead><TableHead>Status</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs"><Link to="/compensation/payables/$id" params={{ id: p.id }} className="hover:underline">{p.id}</Link></TableCell>
                <TableCell className="font-medium">{p.participantName}</TableCell>
                <TableCell className="text-xs">{p.participantType.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-xs">{p.compensationClasses.join(", ")}</TableCell>
                <TableCell className="text-xs">{p.periodStart} → {p.periodEnd}</TableCell>
                <TableCell className="text-right font-tabular">{currency(p.grossAmount)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(p.adjustments)}</TableCell>
                <TableCell className="text-right font-tabular text-muted-foreground">{currency(p.holdbacks)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(p.drawOffset)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(p.clawbackOffset)}</TableCell>
                <TableCell className="text-right font-tabular font-semibold">{currency(p.netPayable)}</TableCell>
                <TableCell className="text-xs">{p.destination.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-xs">{p.scheduledDate ?? "—"}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{p.status.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => showDemoToast("Approved")}>Approve</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <DemoActionNotice />
    </CompensationShell>
  );
}
