import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { AccountingImpactPreview, CompensationCalculation } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/calculations/$id")({
  head: () => ({ meta: [{ title: "Calculation — LedgerOS" }] }),
  component: CalcDetail,
});

function CalcDetail() {
  const { id } = Route.useParams();
  const [calc, setCalc] = useState<CompensationCalculation | undefined>();
  const [preview, setPreview] = useState<AccountingImpactPreview | undefined>();

  useEffect(() => {
    api.compensationOps.getCalculation(id).then(setCalc);
    api.compensationOps.getAccountingImpactPreview(id, "reserve").then(setPreview);
  }, [id]);

  if (!calc) {
    return (
      <CompensationShell title="Calculation">
        <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
      </CompensationShell>
    );
  }

  const readOnly = calc.status === "paid";

  return (
    <CompensationShell
      eyebrow={`Calculation · v${calc.version}`}
      title={`${calc.participantName}`}
      description={`${calc.planName} v${calc.planVersion} · ${calc.opportunityName ?? ""}`}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild><Link to="/compensation/calculations/$id/preview" params={{ id }}>Preview</Link></Button>
          <Button size="sm" disabled={readOnly} onClick={() => showDemoToast("Approved")}>Approve</Button>
        </div>
      }
    >
      {readOnly && (
        <Card className="border-warning/40 bg-warning/10 p-3 text-xs text-warning">
          Paid calculations are read-only. Use an Adjustment or Reversal to make corrections.
        </Card>
      )}

      <Tabs defaultValue="summary">
        <TabsList className="flex-wrap">
          {["summary", "source", "revenue", "plans", "participants", "lines", "policy", "margin", "verification", "approvals", "holdbacks", "adjustments", "clawbacks", "disputes", "accounting", "audit"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="summary">
          <Card className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 text-sm">
              <Field label="ID" value={calc.id} />
              <Field label="Status" value={calc.status.replace(/_/g, " ")} />
              <Field label="Version" value={`v${calc.version}`} />
              <Field label="Idempotency key" value={calc.sourceIdempotencyKey} mono />
              <Field label="Gross payment" value={currency(calc.grossPayment)} />
              <Field label="Pass-through" value={currency(calc.passThroughExcluded)} />
              <Field label="Realized" value={currency(calc.realizedRevenue)} />
              <Field label="Total net" value={currency(calc.totalNetPayable)} />
              <Field label="Expected payable" value={calc.expectedPayableDate ?? "—"} />
              <Field label="Legal review" value={calc.legalReviewStatus} />
              <Field label="Accounting review" value={calc.accountingReviewStatus} />
              <Field label="Margin impact" value={`${(calc.marginImpact * 100).toFixed(1)}%`} />
            </div>
            <div className="rounded-lg border border-brand/40 bg-brand/5 p-3 text-sm">{calc.explanation}</div>
            {calc.riskFlags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {calc.riskFlags.map((f) => <Badge key={f} variant="outline" className="border-warning/40 bg-warning/10 text-warning">{f}</Badge>)}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="source">
          <Card className="p-5 text-sm space-y-2">
            <Field label="Source" value={`${calc.source.type} · ${calc.source.label}`} />
            <Field label="Amount" value={currency(calc.source.amount)} />
            <Field label="Collection status" value={calc.source.collectionStatus.replace(/_/g, " ")} />
            <Field label="Clearance date" value={calc.source.clearanceDate ?? "—"} />
            <Field label="Pass-through" value={currency(calc.source.passThroughAmount)} />
            <Field label="Refunds / Credits / Chargebacks" value={`${currency(calc.source.refunds)} / ${currency(calc.source.credits)} / ${currency(calc.source.chargebacks)}`} />
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="p-5 text-sm space-y-1">
            <Row k="Gross" v={currency(calc.grossPayment)} />
            <Row k="Pass-through (excluded)" v={`-${currency(calc.passThroughExcluded)}`} />
            <Row k="Refunds" v={`-${currency(calc.source.refunds)}`} />
            <Row k="Credits" v={`-${currency(calc.source.credits)}`} />
            <Row k="Chargebacks" v={`-${currency(calc.source.chargebacks)}`} />
            <Row k="Non-commissionable" v={`-${currency(calc.source.noncommissionable)}`} />
            <div className="my-2 border-t border-border/60" />
            <Row k="Realized revenue" v={currency(calc.realizedRevenue)} bold />
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card className="p-5 text-sm">
            <Field label="Plan" value={`${calc.planName} v${calc.planVersion}`} />
            <Field label="Compensation classes" value={calc.compensationClasses.join(", ")} />
            <Field label="Approval route" value={calc.approvalRoute.join(" → ")} />
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Participant</TableHead><TableHead>Pool</TableHead><TableHead>Class</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {calc.lines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.participantName}</TableCell>
                    <TableCell className="text-xs">{l.poolName}</TableCell>
                    <TableCell className="text-xs">{l.compensationClass}</TableCell>
                    <TableCell className="text-right font-tabular">{currency(l.netPayable)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="lines">
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line</TableHead><TableHead>Participant</TableHead><TableHead>Class</TableHead><TableHead>Plan</TableHead><TableHead>Pool</TableHead>
                  <TableHead>Basis</TableHead><TableHead className="text-right">Base</TableHead><TableHead>Rate</TableHead><TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Holdback</TableHead><TableHead className="text-right">Adj</TableHead><TableHead className="text-right">Net</TableHead>
                  <TableHead>Dest</TableHead><TableHead>GL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calc.lines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{l.id}</TableCell>
                    <TableCell>{l.participantName}</TableCell>
                    <TableCell className="text-xs">{l.compensationClass}</TableCell>
                    <TableCell className="text-xs">{l.planName}</TableCell>
                    <TableCell className="text-xs">{l.poolName}</TableCell>
                    <TableCell className="text-xs">{l.basis.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-right font-tabular">{currency(l.baseAmount)}</TableCell>
                    <TableCell className="text-xs">{l.rate ? `${(l.rate * 100).toFixed(1)}%` : "—"}</TableCell>
                    <TableCell className="text-right font-tabular">{currency(l.grossAmount)}</TableCell>
                    <TableCell className="text-right font-tabular text-muted-foreground">{currency(l.holdback)}</TableCell>
                    <TableCell className="text-right font-tabular">{currency(l.adjustment)}</TableCell>
                    <TableCell className="text-right font-tabular font-semibold">{currency(l.netPayable)}</TableCell>
                    <TableCell className="text-xs">{l.payDestination}</TableCell>
                    <TableCell className="text-xs">{l.glExpenseAccount}<div className="text-muted-foreground">{l.glPayableAccount}</div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="policy">
          <Card className="p-5 text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(calc.policySnapshot.resolvedPolicy, null, 2)}
          </Card>
        </TabsContent>

        <TabsContent value="margin">
          <Card className="p-5 text-sm">
            <Row k="Margin impact" v={`${(calc.marginImpact * 100).toFixed(2)}%`} />
            <Row k="Cash impact" v={currency(calc.cashImpact)} />
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card className="p-5 text-sm text-muted-foreground">See <Link to="/compensation/verification" className="underline">Verification queue</Link> for review status.</Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card className="p-5 text-sm">Approval route: {calc.approvalRoute.join(" → ")}. See <Link to="/compensation/approvals" className="underline">Approval center</Link>.</Card>
        </TabsContent>

        <TabsContent value="holdbacks">
          <Card className="p-5 text-sm">Total holdback: <span className="font-tabular font-semibold">{currency(calc.totalHoldback)}</span>. See <Link to="/compensation/holdbacks" className="underline">Holdback center</Link>.</Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card className="p-5 text-sm">Total adjustments: <span className="font-tabular font-semibold">{currency(calc.totalAdjustment)}</span>. See <Link to="/compensation/adjustments" className="underline">Adjustments</Link>.</Card>
        </TabsContent>

        <TabsContent value="clawbacks">
          <Card className="p-5 text-sm">No open clawbacks on this calculation.</Card>
        </TabsContent>

        <TabsContent value="disputes">
          <Card className="p-5 text-sm">No active disputes on this calculation.</Card>
        </TabsContent>

        <TabsContent value="accounting">
          <Card className="p-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-warning">
              Proposed accounting treatment — requires backend validation and accountant approval.
            </div>
            {preview && (
              <Table>
                <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead><TableHead>Memo</TableHead></TableRow></TableHeader>
                <TableBody>
                  {preview.entries.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.account}</TableCell>
                      <TableCell className="text-right font-tabular">{e.debit ? currency(e.debit) : ""}</TableCell>
                      <TableCell className="text-right font-tabular">{e.credit ? currency(e.credit) : ""}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.memo ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="p-5 text-sm">
            <ul className="space-y-1.5">
              {calc.auditTimeline.map((e, i) => (
                <li key={i} className="flex justify-between border-b border-border/40 py-1">
                  <span>{e.action}</span>
                  <span className="text-xs text-muted-foreground">{e.actor} · {new Date(e.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
      <DemoActionNotice />
    </CompensationShell>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${bold ? "font-semibold" : ""}`}>
      <span>{k}</span>
      <span className="font-tabular">{v}</span>
    </div>
  );
}
