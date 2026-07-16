import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CompensationShell,
  DemoActionNotice,
  showDemoToast,
} from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/mock/finance";
import { CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/compensation/calculations/new")({
  head: () => ({ meta: [{ title: "New Calculation — LedgerOS" }] }),
  component: NewCalcPage,
});

const STEPS = [
  { key: "source", label: "Source Records" },
  { key: "collection", label: "Collection Status" },
  { key: "revenue", label: "Revenue Allocation" },
  { key: "plans", label: "Applicable Plans" },
  { key: "participants", label: "Participants & Pools" },
  { key: "calc", label: "Calculation" },
  { key: "margin", label: "Margin & Cash" },
  { key: "policy", label: "Policy Snapshot" },
  { key: "explain", label: "Explanation" },
  { key: "submit", label: "Submit" },
];

function NewCalcPage() {
  const [step, setStep] = useState(0);
  const advance = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <CompensationShell
      title="New Calculation"
      description="Guided workflow — invariants enforced (pass-through excluded, collection required, stacked pools kept separate)."
    >
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(i)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${i === step ? "bg-brand/10 text-brand" : "text-muted-foreground"}`}
            >
              {i < step ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
              <span>
                {i + 1}. {s.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </div>
        <div className="text-lg font-semibold">{STEPS[step].label}</div>

        {step === 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Client", "Meridian Advisors"],
              ["Opportunity", "Compliance Onboarding"],
              ["Invoice", "#4402"],
              ["Payment", "#9911"],
              ["Subscription", "Compliance Suite Pro"],
              ["Service", "Advisory Retainer"],
              ["Product", "—"],
              ["Event / Milestone", "Enterprise onboarding"],
              ["Renewal / Expansion", "—"],
              ["Strategic relationship", "Tara Casella"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border/60 bg-surface p-3 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
                <div className="mt-1 font-medium">{v}</div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Invoice amount", currency(12000)],
              ["Amount collected", currency(12000)],
              ["Amount cleared", currency(12000)],
              ["Collection date", "2026-07-05"],
              ["Clearance date", "2026-07-08"],
              ["Payment method", "ACH"],
              ["Partial payment?", "No"],
              ["Refunds / Credits / Chargebacks", currency(0)],
              ["Reversals", "None"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border/60 bg-surface p-3 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
                <div className="mt-1 font-tabular">{v}</div>
              </div>
            ))}
            <div className="md:col-span-2 rounded-lg border border-success/40 bg-success/10 p-3 text-xs text-success">
              Payment collected and cleared — eligible to progress. Progression blocked for
              uncollected revenue unless plan is fixed / milestone.
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2 text-sm">
            {[
              ["Gross amount", 12000, ""],
              ["Pass-through funds", -1200, "excluded from base"],
              ["Government fees", 0, ""],
              ["Third-party costs", 0, ""],
              ["Taxes", 0, ""],
              ["Discounts / Credits", 0, ""],
              ["Refunds", 0, ""],
              ["Chargebacks", 0, ""],
              ["Non-commissionable items", 0, ""],
            ].map(([k, v, note]) => (
              <div
                key={String(k)}
                className="flex items-center justify-between border-b border-border/40 py-2 last:border-0"
              >
                <div>
                  {String(k)} <span className="text-xs text-muted-foreground">{String(note)}</span>
                </div>
                <div className="font-tabular font-semibold">{currency(Number(v))}</div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-md bg-brand/5 p-3">
              <div className="font-semibold">Realized service revenue</div>
              <div className="font-tabular text-lg font-bold text-brand">{currency(10800)}</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-border/60 p-3">
              <div className="font-semibold">Standard Sales Pool — v3</div>
              <div className="text-xs text-muted-foreground">
                Basis: collected_and_cleared_nrsr · Effective 2026-01-01 · House rule: suppress ·
                Survival: 12 months
              </div>
              <Badge
                variant="outline"
                className="mt-2 border-success/40 bg-success/10 text-success"
              >
                Invariants pass
              </Badge>
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <div className="font-semibold">Tara — Brand Ambassador (5%) — v2</div>
              <div className="text-xs text-muted-foreground">
                Carved from standard 10% pool. Stacking: elect per milestone. Legal review: cleared.
              </div>
              <Badge
                variant="outline"
                className="mt-2 border-success/40 bg-success/10 text-success"
              >
                Attribution eligible
              </Badge>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold">Sales Pool (10%)</div>
                <Badge variant="outline">Total: 100%</Badge>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Tara Casella — brand ambassador</span>
                  <span>50%</span>
                </div>
                <div className="flex justify-between">
                  <span>Jamie Rivera — closer</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold">Software Participation Pool (3%)</div>
                <Badge variant="outline">Separate pool</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Not applied on this transaction — services only.
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-border/40 py-1">
              <span>Base (realized)</span>
              <span className="font-tabular">{currency(10800)}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 py-1">
              <span>Applied rate</span>
              <span>10%</span>
            </div>
            <div className="flex justify-between border-b border-border/40 py-1">
              <span>Pool amount</span>
              <span className="font-tabular">{currency(1080)}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 py-1">
              <span>Tara (5%)</span>
              <span className="font-tabular">{currency(540)}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 py-1">
              <span>Jamie (5%)</span>
              <span className="font-tabular">{currency(540)}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 py-1">
              <span>Holdback (10%)</span>
              <span className="font-tabular">-{currency(108)}</span>
            </div>
            <div className="flex justify-between rounded-md bg-brand/5 p-2 font-semibold">
              <span>Net payable</span>
              <span className="font-tabular">{currency(972)}</span>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="grid gap-3 md:grid-cols-2 text-sm">
            {[
              ["Collected revenue", currency(12000)],
              ["Pass-through exclusions", `-${currency(1200)}`],
              ["Direct costs", `-${currency(4200)}`],
              ["Tech allocation", `-${currency(180)}`],
              ["Marketing allocation", `-${currency(240)}`],
              ["Compensation cost", `-${currency(1080)}`],
              ["Gross profit after comp", currency(5100)],
              ["Contribution profit after comp", currency(4860)],
              ["Margin %", "45%"],
              ["Target margin", "48%"],
              ["Available cash effect", `-${currency(972)}`],
              ["Reserve effect", currency(108)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border/60 bg-surface p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
                <div className="mt-1 font-tabular font-semibold">{v}</div>
              </div>
            ))}
            <div className="md:col-span-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
              Below-target margin (45% vs 48% target) — will require Owner review before approval.
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-2 text-xs">
            <div className="rounded-lg border border-border/60 p-3">
              <div className="font-semibold text-sm">Resolved Policy Snapshot</div>
              <div className="mt-2 grid gap-1 text-muted-foreground">
                <div>attribution.requiredTotal: 100% (±0.01%)</div>
                <div>revenueRecognition.requireCollected: true</div>
                <div>revenueRecognition.excludePassThrough: true</div>
                <div>revenueRecognition.paymentClearingLagDays: 3</div>
                <div>riskReserve.chargebackWindowDays: 90</div>
                <div>riskReserve.defaultHoldbackPct: 10%</div>
                <div>stacking.brandAmbassadorMilestoneStack: elect_per_milestone</div>
                <div>salesPool.houseAccountRule: suppress</div>
                <div>postTermination.survivalMonthsDefault: 12</div>
                <div>invariants.requirePassThroughExclusion: true</div>
                <div>invariants.requireCollectedRevenue: true</div>
              </div>
            </div>
            <div className="rounded-md border border-border/60 p-3">
              Calculation version 1 · Plan v3 · Rule version 2026.07
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="rounded-lg border border-brand/40 bg-brand/5 p-4 text-sm">
            <div className="font-semibold text-brand">Plain-language explanation</div>
            <p className="mt-2 text-foreground/90">
              CCA collected and cleared $12,000 from Meridian Advisors. After excluding $1,200 in
              pass-through fees, the realized commissionable revenue is $10,800. Tara qualifies for
              5% through the Brand Ambassador pool, and the salesperson receives the remaining 5% of
              the standard 10% sales pool. Total compensation is $1,080; a 10% holdback ($108) is
              applied leaving $972 net payable.
            </p>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-3 text-sm">
            <div>
              Required verification: attribution, pass-through, split validation, margin guardrail
            </div>
            <div>Required approvers: Accounting Lead, Owner</div>
            <div>Legal review: not required · Accounting review: cleared</div>
            <div>Missing evidence: none</div>
            <div>Risk flags: below-target margin</div>
            <div>Expected payable date: 2026-07-20</div>
            <DemoActionNotice />
            <div className="flex gap-2">
              <Button onClick={() => showDemoToast("Calculation submitted for review")}>
                Submit
              </Button>
              <Button variant="outline" onClick={() => showDemoToast("Saved as draft")}>
                Save Draft
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={back} disabled={step === 0}>
            Back
          </Button>
          <Button onClick={advance} disabled={step === STEPS.length - 1}>
            Next
          </Button>
        </div>
      </Card>
    </CompensationShell>
  );
}
