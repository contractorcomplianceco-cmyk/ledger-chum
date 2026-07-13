import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { resolveCompensationPolicy } from "@/lib/api/services/compensation";
import type { CompensationPlan } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/plans/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Plan ${params.id} — LedgerOS` }],
  }),
  component: PlanDetailPage,
});

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function PlanDetailPage() {
  const { id } = useParams({ from: "/compensation/plans/$id" });
  const [plan, setPlan] = useState<CompensationPlan | undefined>();

  useEffect(() => {
    api.compensation.getPlan(id).then(setPlan);
  }, [id]);

  if (!plan) {
    return (
      <CompensationShell title="Plan" description="Loading…">
        <Card className="p-6 text-sm text-muted-foreground">Loading plan…</Card>
      </CompensationShell>
    );
  }

  const policy = resolveCompensationPolicy(plan.policyOverrides);

  return (
    <CompensationShell
      title={plan.name}
      description={plan.description}
      actions={
        <>
          <Button size="sm" variant="outline" asChild>
            <Link to="/compensation/plans/$id/versions" params={{ id }}>Versions</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/compensation/plans/$id/participants" params={{ id }}>Participants</Link>
          </Button>
          <Button size="sm" onClick={() => showDemoToast("Plan edit opened")}>Edit</Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Plain-language summary</h3>
          <p className="text-sm">{plan.plainLanguageSummary}</p>
          <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
            <span className="font-semibold">Formula:</span> {plan.formulaText}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Status</h3>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{plan.status.replaceAll("_", " ")}</Badge>
            <Badge variant="outline">v{plan.currentVersion}</Badge>
            {plan.active ? (
              <Badge variant="outline" className="border-success/40 bg-success/10 text-success">Active</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
            {plan.legalReviewRequired && (
              <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
                Legal: {plan.legalReviewStatus}
              </Badge>
            )}
            {plan.accountingReviewRequired && (
              <Badge variant="outline">Accounting: {plan.accountingReviewStatus}</Badge>
            )}
          </div>
          <div className="mt-4 space-y-1">
            <KV label="Owner" value={plan.owner} />
            <KV label="Updated" value={plan.lastUpdatedAt.slice(0, 10)} />
            <KV label="Updated by" value={plan.updatedBy} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Calculation</h3>
          <KV label="Family" value={plan.family.replaceAll("_", " ")} />
          <KV label="Disbursement class" value={plan.disbursementClass.replaceAll("_", " ")} />
          <KV label="Basis" value={plan.basis.replaceAll("_", " ")} />
          <KV label="Default rate" value={plan.defaultRate ? `${(plan.defaultRate * 100).toFixed(2)}%` : "—"} />
          <KV label="Fixed amount" value={plan.fixedAmount ? currency(plan.fixedAmount) : "—"} />
          <KV label="Effective" value={plan.effectiveDate} />
          <KV label="Expires" value={plan.expirationDate ?? "—"} />
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Eligibility</h3>
          <KV label="Services" value={plan.eligibleServices.join(", ") || "—"} />
          <KV label="Products" value={plan.eligibleProducts.join(", ") || "—"} />
          <KV label="Apps" value={plan.eligibleApps.join(", ") || "—"} />
          <KV label="Departments" value={plan.eligibleDepartments.join(", ") || "—"} />
          <KV label="Channels" value={plan.eligibleChannels.join(", ") || "—"} />
          <KV label="Entities" value={plan.eligibleEntities.join(", ") || "—"} />
          <KV label="Customer types" value={plan.eligibleCustomerTypes.join(", ") || "—"} />
          <KV label="Geography" value={plan.geographicScope.join(", ") || "—"} />
          <KV label="House-account rule" value={plan.houseAccountRule} />
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Deductions & invariants</h3>
          <KV label="Pass-through treatment" value={plan.passThroughTreatment.replaceAll("_", " ")} />
          <KV label="Collection requirement" value={plan.collectionRequirement.replaceAll("_", " ")} />
          <KV label="Refunds" value="deducted" />
          <KV label="Chargebacks" value="deducted" />
          <KV label="Credits" value="deducted" />
          <KV label="Chargeback window" value={`${plan.chargebackWindowDays} days`} />
          <KV label="Holdback %" value={`${(plan.holdbackPercent * 100).toFixed(0)}%`} />
          <KV label="Survival" value={`${plan.survivalMonths}`} />
          <div className="mt-3 rounded-md border border-warning/40 bg-warning/5 p-2 text-xs">
            Any relaxation of pass-through or uncollected-revenue exclusion requires attached legal review + Owner approval, a written reason, an audit event, and a calculation snapshot.
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Approval & GL</h3>
          <KV label="Approval route" value={plan.approvalRoute.join(" → ")} />
          <KV label="Expense GL" value={plan.glExpenseAccount} />
          <KV label="Payable GL" value={plan.glPayableAccount} />
          <KV label="Reserve GL" value={plan.glReserveAccount} />
          <KV label="Clawback GL" value={plan.glClawbackAccount} />
          <KV label="Entity" value={plan.entityAssignment} />
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resolved policy snapshot</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Snapshot resolved from §11 defaults + this plan's overrides. Snapshotted at calculation time on every line for audit reproducibility.
        </p>
        <pre className="max-h-72 overflow-auto rounded-md border border-border/60 bg-muted/30 p-3 text-[11px]">
{JSON.stringify(policy, null, 2)}
        </pre>
      </Card>

      <DemoActionNotice />
    </CompensationShell>
  );
}
