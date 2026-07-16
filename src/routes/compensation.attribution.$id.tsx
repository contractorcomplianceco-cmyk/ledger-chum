import { createFileRoute, useParams } from "@tanstack/react-router";
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
import type { AttributionEvidence, CompensationAttribution } from "@/lib/api/services/compensation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/compensation/attribution/$id")({
  head: ({ params }) => ({ meta: [{ title: `Attribution ${params.id} — LedgerOS` }] }),
  component: AttributionDetailPage,
});

const TARA_STATES: Record<string, string> = {
  eligible: "Eligible",
  likely_eligible: "Likely Eligible",
  needs_evidence: "Needs Evidence",
  preexisting_pipeline_conflict: "Preexisting Pipeline Conflict",
  material_development_not_proven: "Material Development Not Proven",
  strategic_channel_eligible: "Strategic Channel Eligible",
  software_participation_eligible: "Software Participation Eligible",
  post_termination_survival_review: "Post-Termination Survival Review",
  not_eligible: "Not Eligible",
};

function AttributionDetailPage() {
  const { id } = useParams({ from: "/compensation/attribution/$id" });
  const [attr, setAttr] = useState<CompensationAttribution | undefined>();
  const [evidence, setEvidence] = useState<AttributionEvidence[]>([]);

  useEffect(() => {
    api.compensation.getAttribution(id).then(setAttr);
    api.compensation.listEvidence(id).then(setEvidence);
  }, [id]);

  if (!attr) {
    return (
      <CompensationShell title="Attribution" description="Loading…">
        <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
      </CompensationShell>
    );
  }

  return (
    <CompensationShell
      title={attr.opportunityName}
      description={`${attr.customerName ?? "—"} · Source: ${attr.sourceSystem}`}
      actions={
        <>
          <Button size="sm" variant="outline" onClick={() => showDemoToast("Attribution saved")}>
            Save
          </Button>
          <Button size="sm" onClick={() => showDemoToast("Submitted for verification")}>
            Submit for verification
          </Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Pools
          </h3>
          <Badge variant="outline">{attr.overallStatus}</Badge>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {attr.totalPools.map((p) => (
            <div
              key={p.poolId}
              className="flex items-center justify-between rounded-md border border-border/60 p-3"
            >
              <div className="flex items-center gap-2">
                {p.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm font-medium">{p.poolName}</span>
              </div>
              <span className="text-sm">{(p.totalPercent * 100).toFixed(0)}% / 100%</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <div className="p-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contributions
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Pool</TableHead>
              <TableHead>Split</TableHead>
              <TableHead>Fixed</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Effective</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attr.contributions.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.participantName}</TableCell>
                <TableCell className="text-xs">{c.role}</TableCell>
                <TableCell className="text-xs">{c.poolName}</TableCell>
                <TableCell>
                  {c.splitPercent ? `${(c.splitPercent * 100).toFixed(0)}%` : "—"}
                </TableCell>
                <TableCell>{c.fixedAmount ?? "—"}</TableCell>
                <TableCell>{c.evidenceCount}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      c.eligibility === "eligible" ||
                      c.eligibility === "software_participation_eligible" ||
                      c.eligibility === "strategic_channel_eligible"
                        ? "border-success/40 bg-success/10 text-success"
                        : c.eligibility === "preexisting_pipeline_conflict" ||
                            c.eligibility === "not_eligible"
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : "border-warning/40 bg-warning/10 text-warning"
                    }
                  >
                    {TARA_STATES[c.eligibility] ?? c.eligibility}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{c.approvalStatus}</Badge>
                </TableCell>
                <TableCell className="text-xs">{c.effectiveDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Evidence
          </h3>
          <Button size="sm" variant="outline" onClick={() => showDemoToast("Upload evidence")}>
            Add evidence
          </Button>
        </div>
        {evidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">No evidence uploaded.</p>
        ) : (
          <ul className="divide-y">
            {evidence.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-4 py-2 text-sm">
                <div>
                  <div className="font-medium">
                    {e.type.replaceAll("_", " ")} · {e.date}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.source} · uploaded by {e.uploadedBy}
                  </div>
                  {e.notes && <div className="mt-1 text-xs">{e.notes}</div>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline">{e.relevance}</Badge>
                  <span className="text-xs">Confidence {(e.confidence * 100).toFixed(0)}%</span>
                  {e.verified ? (
                    <Badge
                      variant="outline"
                      className="border-success/40 bg-success/10 text-success"
                    >
                      Verified
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        api.compensation.verifyEvidence(e.id);
                        showDemoToast("Evidence verified");
                      }}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </CompensationShell>
  );
}
