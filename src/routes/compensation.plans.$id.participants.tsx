import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { CompensationPlanParticipant } from "@/lib/api/services/compensation";

export const Route = createFileRoute("/compensation/plans/$id/participants")({
  head: () => ({ meta: [{ title: "Plan Participants — LedgerOS" }] }),
  component: PlanParticipantsPage,
});

function PlanParticipantsPage() {
  const { id } = useParams({ from: "/compensation/plans/$id/participants" });
  const [rows, setRows] = useState<CompensationPlanParticipant[]>([]);

  useEffect(() => {
    api.compensation.listPlanParticipants(id).then(setRows);
  }, [id]);

  return (
    <CompensationShell
      title="Plan participants"
      description="Participants assigned to this plan. Individual overrides are per-assignment; the resolved policy still governs invariants."
      actions={
        <Button size="sm" onClick={() => showDemoToast("Assign participant")}>
          Assign participant
        </Button>
      }
    >
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead>Override %</TableHead>
              <TableHead>Override fixed</TableHead>
              <TableHead>Active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <Link
                    to="/compensation/participants/$id"
                    params={{ id: r.participantId }}
                    className="hover:underline"
                  >
                    {r.participantName}
                  </Link>
                </TableCell>
                <TableCell className="text-xs">{r.role}</TableCell>
                <TableCell className="text-xs">
                  {r.effectiveFrom}
                  {r.effectiveTo ? ` → ${r.effectiveTo}` : ""}
                </TableCell>
                <TableCell>
                  {r.overridePercent ? `${(r.overridePercent * 100).toFixed(1)}%` : "—"}
                </TableCell>
                <TableCell>{r.overrideFixed ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={r.active ? "border-success/40 bg-success/10 text-success" : ""}
                  >
                    {r.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => showDemoToast("Edit assignment")}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                  No participants assigned to this plan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </CompensationShell>
  );
}
