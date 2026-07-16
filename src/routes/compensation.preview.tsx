import { createFileRoute } from "@tanstack/react-router";
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
import type { PlanPreviewResponse } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";
import { CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/compensation/preview")({
  head: () => ({ meta: [{ title: "Plan Preview — LedgerOS" }] }),
  component: PreviewPage,
});

function PreviewPage() {
  const [scenarios, setScenarios] = useState<PlanPreviewResponse[]>([]);
  const [activeKey, setActiveKey] = useState<string>("tara_plus_sales");

  useEffect(() => {
    api.compensation.listPreviewScenarios().then(setScenarios);
  }, []);

  const active = scenarios.find((s) => s.scenarioKey === activeKey) ?? scenarios[0];

  return (
    <CompensationShell
      title="Plan preview"
      description="Twelve reference scenarios covering the stacked-plan model, house accounts, renewals, expansions, milestones, software participation, and post-termination survival."
    >
      <Card className="p-3">
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map((s) => (
            <button
              key={s.scenarioKey}
              onClick={() => setActiveKey(s.scenarioKey)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                active?.scenarioKey === s.scenarioKey
                  ? "border-brand bg-brand/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s.scenarioLabel}
            </button>
          ))}
        </div>
      </Card>

      {active && (
        <>
          <Card className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-semibold">{active.scenarioLabel}</h3>
              {active.legalReviewRequired && (
                <Badge
                  variant="outline"
                  className="border-destructive/40 bg-destructive/10 text-destructive"
                >
                  Legal review required
                </Badge>
              )}
              {active.accountingReviewRequired && (
                <Badge variant="outline">Accounting review</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{active.narrative}</p>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5">
              <div className="text-xs text-muted-foreground">Gross payment</div>
              <div className="text-lg font-semibold">{currency(active.grossPayment)}</div>
              <div className="mt-2 text-xs text-muted-foreground">Excluded pass-through</div>
              <div className="font-medium">{currency(active.excludedPassThrough)}</div>
              <div className="mt-2 text-xs text-muted-foreground">Realized revenue</div>
              <div className="font-medium">{currency(active.realizedRevenue)}</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted-foreground">Total compensation</div>
              <div className="text-lg font-semibold">{currency(active.totalCompensation)}</div>
              <div className="mt-2 text-xs text-muted-foreground">Margin impact</div>
              <div className="font-medium">{(active.marginImpact * 100).toFixed(1)}%</div>
              <div className="mt-2 text-xs text-muted-foreground">Cash impact</div>
              <div className="font-medium">{currency(active.cashImpact)}</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted-foreground">Applicable plans</div>
              <ul className="mt-1 ml-4 list-disc text-sm">
                {active.applicablePlans.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-muted-foreground">Required approvals</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {active.requiredApprovals.map((r) => (
                  <Badge key={r} variant="outline">
                    {r}
                  </Badge>
                ))}
                {active.requiredApprovals.length === 0 && (
                  <span className="text-sm text-muted-foreground">None</span>
                )}
              </div>
            </Card>
          </div>

          <Card className="overflow-x-auto">
            <div className="p-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pools & participants
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.pools.map((p) => (
                  <TableRow key={p.poolName}>
                    <TableCell>{p.poolName}</TableCell>
                    <TableCell>{currency(p.poolAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Pool</TableHead>
                  <TableHead>Split</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.participants.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs">{p.role}</TableCell>
                    <TableCell className="text-xs">{p.poolName}</TableCell>
                    <TableCell>{(p.splitPercent * 100).toFixed(0)}%</TableCell>
                    <TableCell>{currency(p.amount)}</TableCell>
                  </TableRow>
                ))}
                {active.participants.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-4 text-center text-sm text-muted-foreground"
                    >
                      No participants — pool suppressed.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Invariant checks
            </h3>
            <ul className="space-y-1 text-sm">
              {active.invariantChecks.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  {c.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span>{c.label}</span>
                  {c.note && <span className="text-xs text-muted-foreground">— {c.note}</span>}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Resolved policy snapshot
            </h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Snapshotted at calculation time and stored on the calculation line for audit
              reproducibility.
            </p>
            <pre className="max-h-60 overflow-auto rounded-md border border-border/60 bg-muted/30 p-3 text-[11px]">
              {JSON.stringify(active.resolvedPolicySnapshot, null, 2)}
            </pre>
          </Card>
        </>
      )}
    </CompensationShell>
  );
}
