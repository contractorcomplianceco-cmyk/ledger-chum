import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { CompensationAttribution } from "@/lib/api/services/compensation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/compensation/attribution/")({
  head: () => ({ meta: [{ title: "Multi-Touch Attribution — LedgerOS" }] }),
  component: AttributionWorkspacePage,
});

function AttributionWorkspacePage() {
  const [rows, setRows] = useState<CompensationAttribution[]>([]);

  useEffect(() => {
    api.compensation.listAttributions().then((r) => setRows(r.data));
  }, []);

  return (
    <CompensationShell
      title="Multi-touch attribution"
      description="Each opportunity attributes contributors across role, pool, and evidence. Splits must total exactly 100% per pool by default."
      actions={
        <>
          <Button size="sm" variant="outline" asChild><Link to="/compensation/attribution/conflicts">Conflicts</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/compensation/attribution/evidence">Evidence</Link></Button>
        </>
      }
    >
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Contributors</TableHead>
              <TableHead>Pools</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">
                  <Link to="/compensation/attribution/$id" params={{ id: a.id }} className="hover:underline">{a.opportunityName}</Link>
                </TableCell>
                <TableCell className="text-xs">{a.customerName ?? "—"}</TableCell>
                <TableCell className="text-xs">{a.sourceSystem}</TableCell>
                <TableCell className="text-xs">
                  {a.contributions.map((c) => (
                    <div key={c.id}>{c.participantName} <span className="text-muted-foreground">· {c.role}</span> {c.splitPercent ? `${(c.splitPercent*100).toFixed(0)}%` : ""}</div>
                  ))}
                </TableCell>
                <TableCell className="text-xs">
                  {a.totalPools.map((p) => (
                    <div key={p.poolId} className="flex items-center gap-1">
                      {p.valid ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                      {p.poolName}: {(p.totalPercent * 100).toFixed(0)}%
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    a.overallStatus === "conflict" ? "border-destructive/40 bg-destructive/10 text-destructive" :
                    a.overallStatus === "approved" ? "border-success/40 bg-success/10 text-success" :
                    a.overallStatus === "verified" ? "border-info/40 bg-info/10 text-info" : ""
                  }>{a.overallStatus.replaceAll("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to="/compensation/attribution/$id" params={{ id: a.id }}>Open</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Attribution rules</h3>
        <ul className="ml-4 list-disc space-y-1 text-sm">
          <li>Splits must total exactly 100% per single pool by default.</li>
          <li>Multiple separate pools may each total 100%.</li>
          <li>Over-allocation within one pool is invalid.</li>
          <li>Stacked plan families may coexist across separate pools.</li>
          <li>Leadership override requires a separate pool or documented exception.</li>
          <li>Missing attribution, duplicate participants, and preexisting-pipeline conflicts must be flagged.</li>
        </ul>
      </Card>
    </CompensationShell>
  );
}
