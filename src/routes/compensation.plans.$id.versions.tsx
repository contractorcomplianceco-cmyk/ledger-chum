import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { CompensationPlanVersion } from "@/lib/api/services/compensation";

export const Route = createFileRoute("/compensation/plans/$id/versions")({
  head: () => ({ meta: [{ title: "Plan Versions — LedgerOS" }] }),
  component: PlanVersionsPage,
});

function PlanVersionsPage() {
  const { id } = useParams({ from: "/compensation/plans/$id/versions" });
  const [versions, setVersions] = useState<CompensationPlanVersion[]>([]);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    api.compensation.listPlanVersions(id).then(setVersions);
  }, [id]);

  const createDraft = async () => {
    await api.compensation.createPlanVersion(id, summary || "Draft version");
    showDemoToast("Draft version created");
    setSummary("");
  };

  return (
    <CompensationShell
      title="Plan versions"
      description="Every plan change creates a new version. Active historical versions cannot be silently edited."
    >
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Change summary…"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="max-w-md"
          />
          <Button size="sm" onClick={createDraft}>
            Create new version
          </Button>
          <Button size="sm" variant="outline" onClick={() => showDemoToast("Compare versions")}>
            Compare
          </Button>
          <Button size="sm" variant="outline" onClick={() => showDemoToast("Scheduled")}>
            Schedule
          </Button>
          <Button size="sm" variant="outline" onClick={() => showDemoToast("Restored draft")}>
            Restore Draft
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => showDemoToast("Cancelled future version")}
          >
            Cancel Future Version
          </Button>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead>Active window</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Prior</TableHead>
              <TableHead>Impacted calcs</TableHead>
              <TableHead>Created by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">v{v.version}</TableCell>
                <TableCell>{v.effectiveDate}</TableCell>
                <TableCell className="text-xs">
                  {v.activeFrom ?? "—"} →{" "}
                  {v.activeTo ?? (v.approvalStatus === "approved" ? "current" : "—")}
                </TableCell>
                <TableCell className="text-xs">{v.changeSummary}</TableCell>
                <TableCell>{v.priorVersion ? `v${v.priorVersion}` : "—"}</TableCell>
                <TableCell>{v.impactedCalculations}</TableCell>
                <TableCell className="text-xs">{v.createdBy}</TableCell>
                <TableCell>
                  <Badge variant="outline">{v.approvalStatus}</Badge>
                </TableCell>
                <TableCell className="space-x-1 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => showDemoToast(`Activated v${v.version}`)}
                  >
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => showDemoToast(`Retired v${v.version}`)}
                  >
                    Retire
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </CompensationShell>
  );
}
