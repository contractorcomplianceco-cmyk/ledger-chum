import { createFileRoute, Link } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mock/finance";
import { MARKETING_KPIS, MARKETING_TREND, MARKETING_ALERTS, CAMPAIGNS } from "@/lib/mock/intelligence";
import { Megaphone, DollarSign, Percent, Timer, TrendingUp, Users2, Target, AlertTriangle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence/marketing")({
  head: () => ({ meta: [{ title: "Marketing ROI — LedgerOS" }] }),
  component: MarketingRoiPage,
});

const funnel = [
  { label: "Leads", value: MARKETING_KPIS.leads },
  { label: "Qualified", value: MARKETING_KPIS.qualified },
  { label: "Consultations", value: MARKETING_KPIS.consultations },
  { label: "Deals", value: MARKETING_KPIS.deals },
];

function MarketingRoiPage() {
  return (
    <IntelligencePage
      title="Marketing ROI Command Center"
      description="Revenue ROI is not profit. This center reports both — and distinguishes them everywhere."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Marketing spend" value={MARKETING_KPIS.spend} icon={Megaphone} tone="blue" delta={3.4} trend="up" />
        <KpiCard label="Collected revenue" value={MARKETING_KPIS.collectedRevenue} icon={DollarSign} tone="cyan" delta={5.6} trend="up" />
        <KpiCard label="Attributed gross profit" value={MARKETING_KPIS.attributedGross} icon={TrendingUp} tone="mint" delta={6.8} trend="up" />
        <KpiCard label="Attributed contribution profit" value={MARKETING_KPIS.attributedContribution} icon={Target} tone="violet" delta={8.4} trend="up" />
        <KpiCard label="Cost per acquisition" value={MARKETING_KPIS.cpa} icon={Users2} tone="blue" delta={-1.2} trend="down" />
        <KpiCard label="Profit ROI (contribution)" value={MARKETING_KPIS.profitRoi} icon={Percent} tone="cyan" delta={8.4} trend="up" format="number" compareLabel="contribution / $" />
        <KpiCard label="Payback period" value={MARKETING_KPIS.paybackDays} icon={Timer} tone="mint" delta={-4.2} trend="down" format="number" compareLabel="days" />
        <KpiCard label="Chargeback-adjusted ROI" value={MARKETING_KPIS.profitRoi * 0.98} icon={AlertTriangle} tone="violet" delta={0.4} trend="up" format="number" compareLabel="after chargebacks" />
      </section>

      <section>
        <Card className="rounded-xl border-info/30 bg-info/[0.06] p-3 text-[11.5px] text-info">
          <div className="font-semibold">Revenue ROI vs Profit ROI</div>
          <div className="mt-0.5">
            Revenue ROI: <span className="font-tabular font-bold">{MARKETING_KPIS.revenueRoi.toFixed(2)}x</span> ·
            Gross-profit ROI: <span className="font-tabular font-bold">{MARKETING_KPIS.grossRoi.toFixed(2)}x</span> ·
            Contribution-profit ROI: <span className="font-tabular font-bold">{MARKETING_KPIS.profitRoi.toFixed(2)}x</span>.
            LedgerOS uses contribution-profit ROI everywhere marketing performance is reported.
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 p-4 xl:col-span-2">
          <h3 className="text-[13px] font-semibold">Spend vs contribution profit</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MARKETING_TREND}>
                <defs>
                  <linearGradient id="ms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="m" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" fill="url(#ms)" name="Spend" />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="none" name="Collected revenue" />
                <Area type="monotone" dataKey="contribution" stroke="#22d3ee" fill="url(#mc)" name="Contribution profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Lead → revenue funnel</h3>
          <div className="mt-3 space-y-2">
            {funnel.map((f, i) => {
              const prev = i === 0 ? funnel[0].value : funnel[i - 1].value;
              const rate = i === 0 ? 100 : (f.value / prev) * 100;
              const widthPct = (f.value / funnel[0].value) * 100;
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="font-medium text-foreground">{f.label}</span>
                    <span className="font-tabular text-muted-foreground">
                      {f.value.toLocaleString()} · {rate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-brand-cool" style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border/70 pt-2 text-[11.5px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">CPL</span>
              <span className="font-tabular font-semibold">{currency(MARKETING_KPIS.cpl)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CPA</span>
              <span className="font-tabular font-semibold">{currency(MARKETING_KPIS.cpa)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LTV</span>
              <span className="font-tabular font-semibold">{currency(MARKETING_KPIS.ltv)}</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Smart marketing alerts</h3>
            <Link to="/intelligence/campaigns" className="text-[11.5px] text-muted-foreground hover:text-foreground">
              Campaigns →
            </Link>
          </div>
          <div className="mt-2 space-y-2">
            {MARKETING_ALERTS.map((a, i) => (
              <div key={i} className="rounded-md border border-border/70 p-2.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    className={cn(
                      "h-3.5 w-3.5",
                      a.severity === "high" ? "text-destructive" : a.severity === "medium" ? "text-warning" : "text-info",
                    )}
                  />
                  <span className="text-[12.5px] font-semibold">{a.vendor}</span>
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">{a.detail}</div>
                <div className="mt-1 text-[11px]">
                  <span className="text-muted-foreground">Suggested: </span>
                  <span className="font-medium text-foreground">{a.action}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">ROI by campaign</h3>
          <div className="mt-2 space-y-1.5 text-[12px]">
            {[...CAMPAIGNS].sort((a, b) => b.profitRoi - a.profitRoi).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border border-border/70 px-2.5 py-1.5">
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.channel} · {c.platform}</div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "font-tabular font-semibold",
                      c.profitRoi >= 2 ? "text-success" : c.profitRoi >= 1 ? "text-warning" : "text-destructive",
                    )}
                  >
                    {c.profitRoi.toFixed(2)}x
                  </div>
                  <div className="text-[10.5px] text-muted-foreground">Profit ROI</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </IntelligencePage>
  );
}
