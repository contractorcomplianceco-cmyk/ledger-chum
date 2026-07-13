import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { AttributionEvidence } from "@/lib/api/services/compensation";

export const Route = createFileRoute("/compensation/attribution/evidence")({
  head: () => ({ meta: [{ title: "Attribution Evidence — LedgerOS" }] }),
  component: EvidencePage,
});

function EvidencePage() {
  const [rows, setRows] = useState<AttributionEvidence[]>([]);
  useEffect(() => {
    api.compensation.listEvidence().then(setRows);
  }, []);

  return (
    <CompensationShell
      title="Evidence library"
      description="CRM, email, calendar, event, meeting, contract, and leadership-confirmation records supporting attribution claims."
      actions={<Button size="sm" onClick={() => showDemoToast("Uploaded evidence")}>Add evidence</Button>}
    >
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Uploaded by</TableHead>
              <TableHead>Opportunity</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Relevance</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs">{e.type.replaceAll("_", " ")}</TableCell>
                <TableCell className="text-xs">{e.date}</TableCell>
                <TableCell className="text-xs">{e.source}</TableCell>
                <TableCell className="text-xs">{e.uploadedBy}</TableCell>
                <TableCell className="text-xs">{e.opportunityId ?? "—"}</TableCell>
                <TableCell className="text-xs">{e.participantId ?? "—"}</TableCell>
                <TableCell><Badge variant="outline">{e.relevance}</Badge></TableCell>
                <TableCell>{(e.confidence * 100).toFixed(0)}%</TableCell>
                <TableCell>
                  {e.verified ? (
                    <Badge variant="outline" className="border-success/40 bg-success/10 text-success">Verified</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs max-w-[200px] truncate" title={e.notes}>{e.notes ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {!e.verified && (
                    <Button size="sm" variant="ghost" onClick={() => { api.compensation.verifyEvidence(e.id); showDemoToast("Verified"); }}>Verify</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </CompensationShell>
  );
}
