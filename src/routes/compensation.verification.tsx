import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { CompensationVerification } from "@/lib/api/services/compensation";

export const Route = createFileRoute("/compensation/verification")({
  head: () => ({ meta: [{ title: "Verification Queue — LedgerOS" }] }),
  component: VerificationQueue,
});

function VerificationQueue() {
  const [rows, setRows] = useState<CompensationVerification[]>([]);
  useEffect(() => { api.compensationOps.listVerifications().then(setRows); }, []);

  const tone = (s: CompensationVerification["status"]) =>
    s === "verified" ? "border-success/40 bg-success/10 text-success"
    : s === "conflict" || s === "rejected" ? "border-destructive/40 bg-destructive/10 text-destructive"
    : s === "evidence_requested" ? "border-warning/40 bg-warning/10 text-warning"
    : "border-border bg-muted text-muted-foreground";

  return (
    <CompensationShell
      title="Verification Queue"
      description="Every verification action requires reviewer, date, note, evidence, result, and audit event."
    >
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Calculation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="text-xs">{v.category.replace(/_/g, " ")}</TableCell>
                <TableCell className="font-mono text-xs">{v.calculationId}</TableCell>
                <TableCell><Badge variant="outline" className={tone(v.status)}>{v.status.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell className="text-xs">{v.reviewer ?? "—"}</TableCell>
                <TableCell>{v.evidenceCount}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{v.note ?? ""}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => showDemoToast("Verified")}>Verify</Button>
                    <Button size="sm" variant="ghost" onClick={() => showDemoToast("Evidence requested")}>Request evidence</Button>
                    <Button size="sm" variant="ghost" onClick={() => showDemoToast("Flagged as conflict")}>Flag</Button>
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
