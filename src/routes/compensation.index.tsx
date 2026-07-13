import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { currency } from "@/lib/mock/finance";
import type { CompensationApproval, CompensationCalculation, CompensationHoldback, CompensationPayable, CompensationReserve } from "@/lib/api/services/compensation";
import { Coins, ShieldCheck, Wallet, Gauge, AlertTriangle, PiggyBank, ScrollText } from "lucide-react";

export const Route = createFileRoute("/compensation/")({
  head: () => ({
    meta: [
      { title: "Compensation Operations — LedgerOS" },
      { name: "description", content: "Compensation operations dashboard — calculations, approvals, payables, holdbacks, disputes, reconciliation." },
    ],
  }),
  component: OpsDashboard,
});

function OpsDashboard() {
  const [calcs, setCalcs] = useState<CompensationCalculation[]>([]);
  const [approvals, setApprovals] = useState<CompensationApproval[]>([]);
  const [payables, setPayables] = useState<CompensationPayable[]>([]);
  const [reserves, setReserves] = useState<CompensationReserve[]>([]);
  const [holdbacks, setHoldbacks] = useState<CompensationHoldback[]>([]);

  useEffect(() => {
    api.compensationOps.listCalculations().then((r) => setCalcs(r.data));
    api.compensationOps.listApprovals().then(setApprovals);
    api.compensationOps.listPayables().then((r) => setPayables(r.data));
    api.compensationOps.listReserves().then(setReserves);
    api.compensationOps.listHoldbacks().then(setHoldbacks);
  }, []);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const projected = sum(calcs.filter((c) => c.status === "projected" || c.status === "pending_clearance").map((c) => c.totalGross));
  const calculated = sum(calcs.filter((c) => c.status === "calculated" || c.status === "approved" || c.status === "reserved").map((c) => c.totalGross));
  const awaitingApproval = approvals.filter((a) => a.status === "awaiting").length;
  const reserved = sum(reserves.map((r) => r.reserved + r.holdbacks));
  const payable = sum(payables.filter((p) => p.status !== "paid").map((p) => p.netPayable));
  const held = sum(holdbacks.filter((h) => h.status === "held").map((h) => h.remainingAmount));
  const clawback = 300;

  return (
    <CompensationShell
      title="Compensation Operations"
      highlight="Operations"
      description="Command center for calculations, verifications, approvals, reserves, payables, holdbacks, adjustments, clawbacks, and disputes."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Projected" value={projected} delta={5.2} trend="up" icon={Gauge} tone="blue" />
        <KpiCard label="Calculated" value={calculated} delta={3.1} trend="up" icon={Coins} tone="cyan" />
        <KpiCard label="Reserved" value={reserved} delta={1.0} trend="up" icon={PiggyBank} tone="mint" />
        <KpiCard label="Payable (open)" value={payable} delta={0.8} trend="up" icon={Wallet} tone="violet" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Awaiting Approval" value={awaitingApproval} delta={2} trend="up" icon={ShieldCheck} tone="violet" format="number" />
        <KpiCard label="Held" value={held} delta={0.2} trend="down" icon={ScrollText} tone="blue" />
        <KpiCard label="Clawback Exposure" value={clawback} delta={1.4} trend="down" icon={AlertTriangle} tone="cyan" />
        <KpiCard label="Disputed" value={376} delta={0.3} trend="down" icon={AlertTriangle} tone="violet" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Compensation Lifecycle Funnel</div>
            <div className="text-xs text-muted-foreground">Every stage preserves policy snapshot, invariants, and audit trail.</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
          {[
            ["Projected", projected],
            ["Calculated", calculated],
            ["Verified", calculated * 0.9],
            ["Approved", calculated * 0.8],
            ["Reserved", reserved],
            ["Payable", payable],
            ["Scheduled", payable * 0.6],
            ["Paid", 0],
          ].map(([label, v]) => (
            <div key={String(label)} className="rounded-lg border border-border/60 bg-surface p-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{String(label)}</div>
              <div className="mt-1 font-tabular text-lg font-bold">{currency(Number(v))}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Upcoming Payables</div>
            <Button asChild size="sm" variant="ghost"><Link to="/compensation/payables">View all</Link></Button>
          </div>
          <div className="space-y-2 text-sm">
            {payables.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{p.participantName}</div>
                  <div className="text-xs text-muted-foreground">{p.destination.replace(/_/g, " ")} · {p.scheduledDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-tabular font-semibold">{currency(p.netPayable)}</div>
                  <Badge variant="outline" className="text-[10px]">{p.status.replace(/_/g, " ")}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">High-Value Approvals</div>
            <Button asChild size="sm" variant="ghost"><Link to="/compensation/approvals">Queue</Link></Button>
          </div>
          <div className="space-y-2 text-sm">
            {approvals.filter((a) => a.status === "awaiting").map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{a.participantName}</div>
                  <div className="text-xs text-muted-foreground">{a.planName} · {a.requiredApproval}</div>
                </div>
                <div className="text-right">
                  <div className="font-tabular font-semibold">{currency(a.amount)}</div>
                  <div className="text-[11px] text-muted-foreground">Due {a.deadline ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 text-sm font-semibold">Holdbacks Approaching Release</div>
          <div className="space-y-2 text-sm">
            {holdbacks.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{h.participantName}</div>
                  <div className="text-xs text-muted-foreground">Window ends {h.chargebackWindowEnd} · {h.status.replace(/_/g, " ")}</div>
                </div>
                <div className="font-tabular font-semibold">{currency(h.remainingAmount)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 text-sm font-semibold">Reserve vs Available Cash</div>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-xs text-muted-foreground">Compensation reserve</div><div className="font-tabular text-lg font-bold">{currency(reserved)}</div></div>
            <div><div className="text-xs text-muted-foreground">Available cash</div><div className="font-tabular text-lg font-bold">{currency(451510)}</div></div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Reserve headroom looks healthy. See <Link to="/cash-availability" className="underline">Cash Availability</Link> for full waterfall.</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="text-xs text-muted-foreground">
          Every calculated compensation excludes pass-through funds and uncollected revenue by default. Partial payments compute pro-rata. Stacked pools are shown separately — never blended.
        </div>
      </Card>
    </CompensationShell>
  );
}
