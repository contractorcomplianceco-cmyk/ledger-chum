import { createFileRoute, Link } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mock/finance";
import { TECH_PORTFOLIO, INTEL_KPIS } from "@/lib/mock/intelligence";
import { Brain, Cpu, Percent, TrendingUp, Users2, AlertTriangle, DollarSign } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence/tech")({
  head: () => ({ meta: [{ title: "Tech & AI Economics — LedgerOS" }] }),
  component: TechEconomics,
});

const CATEGORY_ORDER = [
  "AI",
  "CRM",
  "Development",
  "Hosting",
  "Communications",
  "HR/Payroll",
  "Design",
  "Data",
  "Productivity",
];

function TechEconomics() {
  const totalMonthly = TECH_PORTFOLIO.reduce((s, t) => s + t.monthly, 0);
  const aiMonthly = TECH_PORTFOLIO.filter((t) => t.category === "AI").reduce(
    (s, t) => s + t.monthly,
    0,
  );
  const nonAi = totalMonthly - aiMonthly;
  const infra = TECH_PORTFOLIO.filter((t) => ["Hosting", "Data"].includes(t.category)).reduce(
    (s, t) => s + t.monthly,
    0,
  );
  const unusedSeatCost = TECH_PORTFOLIO.reduce(
    (s, t) => s + (t.seats - t.activeUsers) * (t.monthly / Math.max(t.seats, 1)),
    0,
  );
  const laborSaved = TECH_PORTFOLIO.reduce((s, t) => s + t.laborSaved, 0);

  const byCategory = CATEGORY_ORDER.map((k) => ({
    category: k,
    spend: TECH_PORTFOLIO.filter((t) => t.category === k).reduce((s, t) => s + t.monthly, 0),
  }));

  return (
    <IntelligencePage
      title="Tech & AI Economics"
      description="Understand whether technology and AI spending creates measurable value."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Monthly tech spend"
          value={totalMonthly}
          icon={Cpu}
          tone="blue"
          delta={4.2}
          trend="up"
        />
        <KpiCard
          label="Monthly AI spend"
          value={aiMonthly}
          icon={Brain}
          tone="violet"
          delta={22.4}
          trend="up"
        />
        <KpiCard
          label="Tech % of revenue"
          value={(totalMonthly / (1_248_750 / 12)) * 100}
          icon={Percent}
          tone="cyan"
          delta={0.4}
          trend="up"
          format="percent"
        />
        <KpiCard
          label="Revenue per tech $"
          value={INTEL_KPIS.techRoi}
          icon={TrendingUp}
          tone="mint"
          delta={4.2}
          trend="up"
          format="number"
          compareLabel="vs prior period"
        />
        <KpiCard
          label="Labor value saved / mo"
          value={laborSaved * 85}
          icon={Users2}
          tone="blue"
          delta={11.8}
          trend="up"
        />
        <KpiCard
          label="Unused seat cost"
          value={unusedSeatCost}
          icon={AlertTriangle}
          tone="violet"
          delta={-4.2}
          trend="down"
        />
        <KpiCard
          label="Non-AI software"
          value={nonAi}
          icon={Cpu}
          tone="cyan"
          delta={1.4}
          trend="up"
        />
        <KpiCard
          label="Infrastructure"
          value={infra}
          icon={DollarSign}
          tone="mint"
          delta={2.2}
          trend="up"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Spend by technology category</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            AI, CRM, and Development represent{" "}
            {(
              ((aiMonthly + byCategory[1].spend + byCategory[2].spend) / totalMonthly) *
              100
            ).toFixed(0)}
            % of monthly tech spend.
          </p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.4}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={110}
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
                <Bar dataKey="spend" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Value produced (per dollar)</h3>
          <div className="mt-3 space-y-2 text-[12px]">
            <ValueRow
              label="Revenue directly supported"
              value={TECH_PORTFOLIO.reduce((s, t) => s + t.revenueSupported, 0)}
            />
            <ValueRow label="Estimated labor hours saved / mo" value={laborSaved} suffix="hrs" />
            <ValueRow label="Estimated labor value saved / mo (@ $85/hr)" value={laborSaved * 85} />
            <ValueRow label="Utilization (weighted)" value={0.79} format="percent" />
            <ValueRow
              label="Cost per active user / mo"
              value={totalMonthly / TECH_PORTFOLIO.reduce((s, t) => s + t.activeUsers, 0)}
            />
          </div>
          <p className="mt-3 rounded-md bg-info/[0.08] p-2 text-[11px] text-info">
            Revenue-per-tech-dollar is defined as attributed revenue divided by monthly tech spend.
            Demonstration ratios use mock labor-savings estimates.
          </p>
          <div className="mt-3">
            <Link
              to="/intelligence/tech-portfolio"
              className="text-[11.5px] font-semibold text-info hover:underline"
            >
              Open technology portfolio →
            </Link>
          </div>
        </Card>
      </section>

      <section>
        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Renewal calendar</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[...TECH_PORTFOLIO]
              .sort((a, b) => a.renewal.localeCompare(b.renewal))
              .slice(0, 8)
              .map((t) => (
                <div key={t.id} className="rounded-md border border-border/70 p-2.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold">{t.vendor}</span>
                    <span className="font-tabular text-muted-foreground">{t.renewal}</span>
                  </div>
                  <div className={cn("mt-0.5 text-[11px]", "text-muted-foreground")}>
                    Cancel by {t.cancelBy} · {currency(t.annual)} / yr
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </section>
    </IntelligencePage>
  );
}

function ValueRow({
  label,
  value,
  suffix,
  format = "currency",
}: {
  label: string;
  value: number;
  suffix?: string;
  format?: "currency" | "percent" | "number";
}) {
  const formatted =
    format === "currency"
      ? currency(value)
      : format === "percent"
        ? `${(value * 100).toFixed(1)}%`
        : `${value.toLocaleString()}${suffix ? ` ${suffix}` : ""}`;
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-tabular font-semibold text-foreground">{formatted}</span>
    </div>
  );
}
