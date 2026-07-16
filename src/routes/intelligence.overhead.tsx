import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mock/finance";
import {
  OVERHEAD_CATEGORIES,
  OVERHEAD_TREND,
  OVERHEAD_FIXED_VARIABLE,
  OVERHEAD_STATUS_META,
} from "@/lib/mock/intelligence";
import { Building2, TrendingUp, Percent, Users2, Wallet2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intelligence/overhead")({
  head: () => ({ meta: [{ title: "Overhead Intelligence — LedgerOS" }] }),
  component: OverheadIntelligence,
});

function OverheadIntelligence() {
  const total = OVERHEAD_CATEGORIES.reduce((s, c) => s + c.current, 0);
  const fixed = OVERHEAD_FIXED_VARIABLE[0].value;
  const variable = OVERHEAD_FIXED_VARIABLE[1].value;
  const revenue = 1_248_750;

  return (
    <IntelligencePage
      title="Overhead Intelligence"
      description="Track overhead by category, department, and vendor. Compare to budget and revenue."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Overhead"
          value={total}
          icon={Building2}
          tone="blue"
          delta={5.8}
          trend="up"
        />
        <KpiCard
          label="Fixed Overhead"
          value={fixed}
          icon={Wallet2}
          tone="violet"
          delta={2.1}
          trend="up"
        />
        <KpiCard
          label="Variable Overhead"
          value={variable}
          icon={TrendingUp}
          tone="cyan"
          delta={11.4}
          trend="up"
        />
        <KpiCard
          label="Overhead % Revenue"
          value={(total / revenue) * 100}
          icon={Percent}
          tone="mint"
          delta={-0.4}
          trend="down"
          format="percent"
        />
        <KpiCard
          label="Overhead / Employee"
          value={total / 22}
          icon={Users2}
          tone="violet"
          delta={1.2}
          trend="up"
        />
        <KpiCard
          label="Overhead / Client"
          value={total / 180}
          icon={Users2}
          tone="cyan"
          delta={-2.4}
          trend="down"
        />
        <KpiCard
          label="Budget Variance"
          value={-3_200}
          icon={Wallet2}
          tone="mint"
          delta={-3200}
          trend="down"
          compareLabel="under budget"
        />
        <KpiCard
          label="Forecasted Month-End"
          value={218_400}
          icon={TrendingUp}
          tone="blue"
          delta={1.6}
          trend="up"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 p-4 xl:col-span-2">
          <h3 className="text-[13px] font-semibold">Overhead vs revenue trend</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Text summary: overhead grew 18% while revenue grew 22% — ratio improved from 17.9% to
            17.2%.
          </p>
          <div className="mt-3 h-64">
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
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Revenue"
                />
                <Line
                  dataKey="overhead"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  name="Overhead"
                />
                <Line
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
          <h3 className="text-[13px] font-semibold">Fixed vs variable</h3>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={OVERHEAD_FIXED_VARIABLE}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {OVERHEAD_FIXED_VARIABLE.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => currency(v)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1 text-[11.5px]">
            {OVERHEAD_FIXED_VARIABLE.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="font-tabular font-semibold">{currency(s.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Overhead by category</h3>
            <span className="text-[11px] text-muted-foreground">
              {OVERHEAD_CATEGORIES.length} categories tracked
            </span>
          </div>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={OVERHEAD_CATEGORIES} layout="vertical" margin={{ left: 24 }}>
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
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={140}
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
                <Bar dataKey="current" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Current" />
                <Bar dataKey="budget" fill="#22d3ee" radius={[0, 4, 4, 0]} name="Budget" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section>
        <Card className="border-border/70 p-0">
          <div className="border-b border-border/70 p-3">
            <h3 className="text-[13px] font-semibold">Category detail</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-right">Current</th>
                  <th className="px-3 py-2 text-right">Prior</th>
                  <th className="px-3 py-2 text-right">Budget</th>
                  <th className="px-3 py-2 text-right">Variance</th>
                  <th className="px-3 py-2 text-right">YTD</th>
                  <th className="px-3 py-2 text-right">% Revenue</th>
                  <th className="px-3 py-2 text-left">Owner</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Anomalies</th>
                </tr>
              </thead>
              <tbody>
                {OVERHEAD_CATEGORIES.map((c) => {
                  const variance = c.current - c.budget;
                  const meta = OVERHEAD_STATUS_META[c.status];
                  return (
                    <tr key={c.key} className="border-t border-border/70">
                      <td className="px-3 py-2 font-medium">{c.label}</td>
                      <td className="px-3 py-2 text-right font-tabular font-semibold">
                        {currency(c.current)}
                      </td>
                      <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                        {currency(c.prior)}
                      </td>
                      <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                        {currency(c.budget)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right font-tabular font-semibold",
                          variance > 0 ? "text-destructive" : "text-success",
                        )}
                      >
                        {variance > 0 ? "+" : ""}
                        {currency(variance)}
                      </td>
                      <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                        {currency(c.ytd)}
                      </td>
                      <td className="px-3 py-2 text-right font-tabular text-muted-foreground">
                        {((c.current / revenue) * 100).toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{c.owner}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
                            meta.className,
                          )}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-tabular">{c.anomalies}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </IntelligencePage>
  );
}
