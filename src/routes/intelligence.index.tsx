import { createFileRoute, Link } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfidenceGauge } from "@/components/intelligence/confidence-gauge";
import { RecommendationCard } from "@/components/intelligence/recommendation-card";
import { LeakageCard } from "@/components/intelligence/leakage-card";
import { currency } from "@/lib/mock/finance";
import {
  INTEL_KPIS,
  HEALTH_SUMMARY,
  OVERHEAD_TREND,
  MARKETING_TREND,
  BONUS_KPIS,
  CLIENT_PROFITABILITY,
  LEAKAGE_OPPS,
  RECOMMENDATIONS,
  EMERGING_RISKS,
  forecastFor,
  APPS,
} from "@/lib/mock/intelligence";
import {
  Wallet2,
  Building2,
  Brain,
  Megaphone,
  Gift,
  Search,
  Gauge,
  Percent,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence/")({
  head: () => ({
    meta: [
      { title: "Financial Intelligence — LedgerOS" },
      {
        name: "description",
        content: "Understand where money is going, what it produces, and what requires attention.",
      },
    ],
  }),
  component: FinancialIntelligencePage,
});

function FinancialIntelligencePage() {
  const forecast = forecastFor("base");
  const topRecs = RECOMMENDATIONS.slice(0, 3);
  const topLeaks = LEAKAGE_OPPS.slice(0, 3);
  const topClients = [...CLIENT_PROFITABILITY]
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);
  const worstClients = [...CLIENT_PROFITABILITY]
    .sort((a, b) => a.contribution - b.contribution)
    .slice(0, 3);

  const kpis = [
    {
      label: "True Available Cash",
      value: INTEL_KPIS.trueCash,
      icon: Wallet2,
      tone: "blue" as const,
      delta: 11.4,
      trend: "up" as const,
      to: "/cash-availability",
    },
    {
      label: "Overhead Spend",
      value: INTEL_KPIS.overhead,
      icon: Building2,
      tone: "violet" as const,
      delta: 5.8,
      trend: "up" as const,
      to: "/intelligence/overhead",
    },
    {
      label: "Overhead % of Revenue",
      value: INTEL_KPIS.overheadPctRevenue,
      icon: Percent,
      tone: "cyan" as const,
      delta: -0.4,
      trend: "down" as const,
      to: "/intelligence/overhead",
      format: "percent" as const,
    },
    {
      label: "Tech & AI Spend",
      value: INTEL_KPIS.techSpend,
      icon: Brain,
      tone: "violet" as const,
      delta: 12.4,
      trend: "up" as const,
      to: "/intelligence/tech",
    },
    {
      label: "Tech ROI",
      value: INTEL_KPIS.techRoi,
      icon: Activity,
      tone: "mint" as const,
      delta: 4.2,
      trend: "up" as const,
      to: "/intelligence/tech",
      format: "number" as const,
      compareLabel: "revenue per $",
    },
    {
      label: "Marketing Spend",
      value: INTEL_KPIS.marketingSpend,
      icon: Megaphone,
      tone: "blue" as const,
      delta: 3.4,
      trend: "up" as const,
      to: "/intelligence/marketing",
    },
    {
      label: "Marketing Profit ROI",
      value: INTEL_KPIS.marketingProfitRoi,
      icon: DollarSign,
      tone: "cyan" as const,
      delta: 8.4,
      trend: "up" as const,
      to: "/intelligence/marketing",
      format: "number" as const,
      compareLabel: "contribution / $",
    },
    {
      label: "Bonus Reserve",
      value: INTEL_KPIS.bonusReserve,
      icon: Gift,
      tone: "violet" as const,
      delta: 2.2,
      trend: "up" as const,
      to: "/intelligence/bonuses",
    },
    {
      label: "Revenue Leakage",
      value: INTEL_KPIS.leakage,
      icon: Search,
      tone: "mint" as const,
      delta: -8.1,
      trend: "down" as const,
      to: "/intelligence/leakage",
    },
    {
      label: "Financial Confidence",
      value: INTEL_KPIS.confidence,
      icon: Gauge,
      tone: "blue" as const,
      delta: 3,
      trend: "up" as const,
      to: "/intelligence/confidence",
      format: "number" as const,
      compareLabel: "of 100",
    },
  ];

  return (
    <IntelligencePage
      title="Financial Intelligence"
      description="Understand where money is going, what it produces, and what requires attention."
    >
      {/* KPI grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((c) => (
          <Link
            key={c.label}
            to={c.to as "/intelligence"}
            className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <KpiCard {...c} />
          </Link>
        ))}
      </section>

      {/* Health summary + Confidence */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 p-4 xl:col-span-2">
          <h3 className="text-[13px] font-semibold">Financial health summary</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {HEALTH_SUMMARY.map((h) => (
              <div
                key={h.label}
                className="flex items-center gap-2 rounded-md border border-border/70 p-2.5"
              >
                {h.status === "healthy" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                )}
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-foreground">{h.label}</div>
                  <div className="text-[11px] text-muted-foreground">{h.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Financial Confidence</h3>
            <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" asChild>
              <Link to="/intelligence/confidence">Details →</Link>
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <ConfidenceGauge score={INTEL_KPIS.confidence} />
          </div>
          <p className="mt-2 text-center text-[11.5px] text-muted-foreground">
            13 signals tracked · 8 fully healthy · 5 improvable
          </p>
        </Card>
      </section>

      {/* Charts */}
      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Overhead trend</h3>
            <Link
              to="/intelligence/overhead"
              className="text-[11.5px] text-muted-foreground hover:text-foreground"
            >
              Open →
            </Link>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Overhead is tracking $3.2k below budget through August. Ratio to revenue improved 0.4
            pts.
          </p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={OVERHEAD_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="m" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => currency(v)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="overhead"
                  stroke="#3b82f6"
                  strokeWidth={2.25}
                  dot={false}
                  name="Overhead"
                />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#22d3ee"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  name="Budget"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Marketing spend vs contribution profit</h3>
            <Link
              to="/intelligence/marketing"
              className="text-[11.5px] text-muted-foreground hover:text-foreground"
            >
              Open →
            </Link>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Profit ROI held at 2.09x · contribution grew 8.4% vs prior period.
          </p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MARKETING_TREND}>
                <defs>
                  <linearGradient id="mspend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mcontrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="m" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => currency(v)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#3b82f6"
                  fill="url(#mspend)"
                  name="Spend"
                />
                <Area
                  type="monotone"
                  dataKey="contribution"
                  stroke="#22d3ee"
                  fill="url(#mcontrib)"
                  name="Contribution profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Bonus + Profitability + Leakage + Risks */}
      <section className="grid gap-4 xl:grid-cols-4">
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Bonus obligations</h3>
            <Link
              to="/intelligence/bonuses"
              className="text-[11.5px] text-muted-foreground hover:text-foreground"
            >
              Open →
            </Link>
          </div>
          <div className="mt-2 space-y-1.5 text-[12px]">
            <Row label="Projected" value={currency(BONUS_KPIS.projected)} />
            <Row label="Earned" value={currency(BONUS_KPIS.earned)} />
            <Row label="Approved unpaid" value={currency(BONUS_KPIS.approvedUnpaid)} />
            <Row label="Reserve" value={currency(BONUS_KPIS.reserve)} strong />
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Top profitable clients</h3>
            <Link
              to="/intelligence/clients"
              className="text-[11.5px] text-muted-foreground hover:text-foreground"
            >
              Open →
            </Link>
          </div>
          <div className="mt-2 space-y-1.5 text-[12px]">
            {topClients.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="truncate text-foreground">{c.client}</span>
                <span className="font-tabular font-semibold text-success">
                  {currency(c.contribution)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Clients at risk</h3>
            <Link
              to="/intelligence/clients"
              className="text-[11.5px] text-muted-foreground hover:text-foreground"
            >
              Open →
            </Link>
          </div>
          <div className="mt-2 space-y-1.5 text-[12px]">
            {worstClients.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="truncate text-foreground">{c.client}</span>
                <span
                  className={cn(
                    "font-tabular font-semibold",
                    c.contribution < 0 ? "text-destructive" : "text-warning",
                  )}
                >
                  {currency(c.contribution)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Emerging financial risks</h3>
          </div>
          <div className="mt-2 space-y-1.5">
            {EMERGING_RISKS.map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11.5px]">
                <AlertTriangle
                  className={cn(
                    "mt-0.5 h-3 w-3 shrink-0",
                    r.severity === "high"
                      ? "text-destructive"
                      : r.severity === "medium"
                        ? "text-warning"
                        : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">{r.label}</div>
                  <div className="text-muted-foreground">{r.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Recommendations */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Recommended actions</h3>
          <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" asChild>
            <Link to="/intelligence/recommendations">See all {RECOMMENDATIONS.length} →</Link>
          </Button>
        </div>
        <div className="grid gap-3 xl:grid-cols-3">
          {topRecs.map((r) => (
            <RecommendationCard key={r.id} rec={r} />
          ))}
        </div>
      </section>

      {/* Leakage */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Revenue leakage opportunities</h3>
          <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" asChild>
            <Link to="/intelligence/leakage">See all {LEAKAGE_OPPS.length} →</Link>
          </Button>
        </div>
        <div className="grid gap-3 xl:grid-cols-3">
          {topLeaks.map((o) => (
            <LeakageCard key={o.id} opp={o} />
          ))}
        </div>
      </section>

      {/* Forecast */}
      <section>
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">30 / 60 / 90-day forecast · Base case</h3>
            <Link
              to="/intelligence/forecasting"
              className="text-[11.5px] text-muted-foreground hover:text-foreground"
            >
              Scenarios →
            </Link>
          </div>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="m" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => currency(v)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  name="Profit"
                />
                <Line
                  type="monotone"
                  dataKey="cash"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="Cash"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[10.5px] italic text-muted-foreground">
            Demonstration forecast — mock data. See Forecasting for scenarios.
          </p>
        </Card>
      </section>

      {/* Apps snapshot */}
      <section>
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">CCA app value snapshot</h3>
            <Link
              to="/intelligence/apps"
              className="text-[11.5px] text-muted-foreground hover:text-foreground"
            >
              Open →
            </Link>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {APPS.slice(0, 8).map((a) => (
              <div key={a.id} className="rounded-md border border-border/70 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-foreground">{a.name}</span>
                  <span className="font-tabular text-[12.5px] font-bold text-foreground">
                    {a.score}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  ROI {a.roi.toFixed(1)}x · Payback {a.payback > 0 ? `${a.payback}mo` : "—"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </IntelligencePage>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-tabular",
          strong ? "font-bold text-foreground" : "font-semibold text-foreground/90",
        )}
      >
        {value}
      </span>
    </div>
  );
}
