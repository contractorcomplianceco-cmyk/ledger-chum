import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { BonusStatusBadge } from "@/components/intelligence/bonus-status-badge";
import { currency } from "@/lib/mock/finance";
import { BONUS_KPIS, BONUSES } from "@/lib/mock/intelligence";
import { Gift, Check, Clock, ShieldCheck, Wallet2, Calendar, DollarSign, Landmark } from "lucide-react";

export const Route = createFileRoute("/intelligence/bonuses")({
  head: () => ({ meta: [{ title: "Bonus Center — LedgerOS" }] }),
  component: BonusCenter,
});

function BonusCenter() {
  return (
    <IntelligencePage
      title="Staff Bonus Center"
      description="Track bonuses from projected through paid — with holdbacks, chargeback holds, and clawbacks."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Projected bonuses" value={BONUS_KPIS.projected} icon={Gift} tone="violet" delta={4.2} trend="up" />
        <KpiCard label="Earned" value={BONUS_KPIS.earned} icon={DollarSign} tone="blue" delta={6.1} trend="up" />
        <KpiCard label="Awaiting verification" value={BONUS_KPIS.awaitingVerification} icon={Clock} tone="cyan" delta={1.2} trend="up" />
        <KpiCard label="Awaiting approval" value={BONUS_KPIS.awaitingApproval} icon={ShieldCheck} tone="mint" delta={-2.4} trend="down" />
        <KpiCard label="Approved unpaid" value={BONUS_KPIS.approvedUnpaid} icon={Check} tone="violet" delta={3.4} trend="up" />
        <KpiCard label="Scheduled" value={BONUS_KPIS.scheduled} icon={Calendar} tone="blue" delta={0.8} trend="up" />
        <KpiCard label="Paid this period" value={BONUS_KPIS.paidPeriod} icon={Landmark} tone="cyan" delta={12.6} trend="up" />
        <KpiCard label="Bonus reserve" value={BONUS_KPIS.reserve} icon={Wallet2} tone="mint" delta={2.2} trend="up" />
      </section>

      <Card className="border-border/70 p-0">
        <div className="border-b border-border/70 p-3">
          <h3 className="text-[13px] font-semibold">Bonus roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Employee</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">Plan</th>
                <th className="px-3 py-2 text-left">Period</th>
                <th className="px-3 py-2 text-left">Trigger</th>
                <th className="px-3 py-2 text-right">Projected</th>
                <th className="px-3 py-2 text-right">Earned</th>
                <th className="px-3 py-2 text-right">Approved</th>
                <th className="px-3 py-2 text-right">Payable</th>
                <th className="px-3 py-2 text-right">Paid</th>
                <th className="px-3 py-2 text-right">Holdback</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Approver</th>
              </tr>
            </thead>
            <tbody>
              {BONUSES.map((b) => (
                <tr key={b.id} className="border-t border-border/70 hover:bg-muted/30">
                  <td className="px-3 py-2 font-semibold">{b.employee}</td>
                  <td className="px-3 py-2 text-muted-foreground">{b.department}</td>
                  <td className="px-3 py-2 text-muted-foreground">{b.plan}</td>
                  <td className="px-3 py-2 text-muted-foreground">{b.period}</td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground">{b.trigger}</td>
                  <td className="px-3 py-2 text-right font-tabular">{currency(b.projected)}</td>
                  <td className="px-3 py-2 text-right font-tabular">{currency(b.earned)}</td>
                  <td className="px-3 py-2 text-right font-tabular">{currency(b.approved)}</td>
                  <td className="px-3 py-2 text-right font-tabular">{currency(b.payable)}</td>
                  <td className="px-3 py-2 text-right font-tabular font-semibold">{currency(b.paid)}</td>
                  <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{currency(b.holdback)}</td>
                  <td className="px-3 py-2"><BonusStatusBadge status={b.status} /></td>
                  <td className="px-3 py-2 text-muted-foreground">{b.approver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-[11px] italic text-muted-foreground">
        Projected, earned, approved, payable, and paid are tracked as distinct states. Chargebacks trigger holdback
        release delay; reversals produce clawback status.
      </p>
    </IntelligencePage>
  );
}
