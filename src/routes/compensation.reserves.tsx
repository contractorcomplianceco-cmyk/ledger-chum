import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/kpi-card";
import { api } from "@/lib/api/client";
import type { CompensationReserve } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";
import { PiggyBank, Timer, ScrollText, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/compensation/reserves")({
  head: () => ({ meta: [{ title: "Compensation Reserves — LedgerOS" }] }),
  component: Reserves,
});

function Reserves() {
  const [rows, setRows] = useState<CompensationReserve[]>([]);
  useEffect(() => { api.compensationOps.listReserves().then(setRows); }, []);

  const sum = (f: (r: CompensationReserve) => number) => rows.reduce((a, r) => a + f(r), 0);
  const total = sum((r) => r.approvedNotPayable + r.reserved + r.holdbacks);
  const w7 = sum((r) => r.payableWithin7Days);
  const w30 = sum((r) => r.payableWithin30Days);
  const held = sum((r) => r.holdbacks);
  const exposure = sum((r) => r.chargebackExposure);

  return (
    <CompensationShell title="Compensation Reserves" description="Reserves reflect approved-but-not-payable, holdbacks, and disputed amounts. Never blends with cash.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Reserve" value={total} delta={1.4} trend="up" icon={PiggyBank} tone="mint" />
        <KpiCard label="Payable ≤ 7d" value={w7} delta={0.3} trend="up" icon={Timer} tone="cyan" />
        <KpiCard label="Payable ≤ 30d" value={w30} delta={0.5} trend="up" icon={Timer} tone="blue" />
        <KpiCard label="Held" value={held} delta={0.2} trend="down" icon={ScrollText} tone="violet" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Clawback Exposure" value={exposure} delta={0.3} trend="down" icon={AlertTriangle} tone="cyan" />
        <KpiCard label="Reserve vs Available Cash" value={451510} delta={11.4} trend="up" icon={PiggyBank} tone="mint" />
        <KpiCard label="Shortfall" value={0} delta={0} trend="up" icon={AlertTriangle} tone="blue" />
      </div>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead><TableHead>Plan</TableHead><TableHead>Class</TableHead>
              <TableHead className="text-right">Approved</TableHead><TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Holdback</TableHead><TableHead className="text-right">Draw Offset</TableHead>
              <TableHead className="text-right">Disputed</TableHead><TableHead className="text-right">Exposure</TableHead>
              <TableHead>Destination</TableHead><TableHead>Payable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.participantName}</TableCell>
                <TableCell className="text-xs">{r.planName}</TableCell>
                <TableCell className="text-xs">{r.compensationClass}</TableCell>
                <TableCell className="text-right font-tabular">{currency(r.approvedNotPayable)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(r.reserved)}</TableCell>
                <TableCell className="text-right font-tabular text-muted-foreground">{currency(r.holdbacks)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(r.drawOffset)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(r.disputed)}</TableCell>
                <TableCell className="text-right font-tabular">{currency(r.chargebackExposure)}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{r.destination.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell className="text-xs">{r.expectedPayableDate ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </CompensationShell>
  );
}
