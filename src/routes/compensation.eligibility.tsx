import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type {
  CompensationParticipant,
  CompensationPlan,
  EligibilityResult,
} from "@/lib/api/services/compensation";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";

export const Route = createFileRoute("/compensation/eligibility")({
  head: () => ({ meta: [{ title: "Eligibility Engine — LedgerOS" }] }),
  component: EligibilityPage,
});

function StatusIcon({ status }: { status: "pass" | "fail" | "warn" | "n/a" }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-warning" />;
  if (status === "fail") return <XCircle className="h-4 w-4 text-destructive" />;
  return <MinusCircle className="h-4 w-4 text-muted-foreground" />;
}

function EligibilityPage() {
  const [plans, setPlans] = useState<CompensationPlan[]>([]);
  const [participants, setParticipants] = useState<CompensationParticipant[]>([]);
  const [planId, setPlanId] = useState<string>("cp_std_sales");
  const [participantId, setParticipantId] = useState<string>("pt_tara");
  const [opportunityId, setOpportunityId] = useState<string>("opp_axiom");
  const [result, setResult] = useState<EligibilityResult | undefined>();

  useEffect(() => {
    api.compensation.listPlans().then((r) => setPlans(r.data));
    api.compensation.listParticipants().then((r) => setParticipants(r.data));
  }, []);

  const run = useCallback(async () => {
    setResult(await api.compensation.checkEligibility({ planId, participantId, opportunityId }));
  }, [planId, participantId, opportunityId]);

  useEffect(() => { run(); }, [run]);

  return (
    <CompensationShell
      title="Eligibility engine"
      description="Check whether a participant is eligible under a plan for a given opportunity. The engine surfaces required reviews and blockers."
    >
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Plan</label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Participant</label>
            <select value={participantId} onChange={(e) => setParticipantId(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Opportunity</label>
            <select value={opportunityId} onChange={(e) => setOpportunityId(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              <option value="opp_axiom">Axiom Manufacturing</option>
              <option value="opp_helio">Helio Foods</option>
              <option value="opp_vireo">Vireo Tech</option>
              <option value="opp_lark">Lark Retail</option>
            </select>
          </div>
        </div>
        <Button size="sm" className="mt-3" onClick={run}>Run eligibility check</Button>
      </Card>

      {result && (
        <>
          <Card className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className={
                result.result === "eligible" ? "border-success/40 bg-success/10 text-success" :
                result.result === "ineligible" || result.result === "plan_not_effective" ? "border-destructive/40 bg-destructive/10 text-destructive" :
                "border-warning/40 bg-warning/10 text-warning"
              }>{result.result.replaceAll("_", " ")}</Badge>
              {result.requiredReviews.map((r) => (
                <Badge key={r} variant="outline">Requires {r} review</Badge>
              ))}
            </div>
            <p className="text-sm">{result.explanation}</p>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Checks</h3>
            <ul className="divide-y">
              {result.checks.map((c) => (
                <li key={c.label} className="flex items-start gap-3 py-2">
                  <StatusIcon status={c.status} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </CompensationShell>
  );
}
