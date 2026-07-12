import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { FORECAST_SCENARIOS, forecastFor, type ForecastScenario } from "@/lib/mock/intelligence";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

const HORIZONS = ["7 days", "30 days", "60 days", "90 days", "6 months", "12 months"];

export const Route = createFileRoute("/intelligence/forecasting")({
  head: () => ({ meta: [{ title: "Forecasting — LedgerOS" }] }),
  component: ForecastingPage,
});

function ForecastingPage() {
  const [scenario, setScenario] = useState<ForecastScenario>("base");
  const [horizon, setHorizon] = useState("90 days");
  const data = forecastFor(scenario);
  const endCash = data[data.length - 1].cash;
  const endProfit = data.reduce((s, r) => s + r.profit, 0);
  const runway = Math.round(endCash / (data[0].expenses / 30));

  return (
    <IntelligencePage
      title="Forecasting"
      description="Preview revenue, collections, expenses, cash, and profit across 10 scenarios and 6 horizons."
    >
      <section className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FORECAST_SCENARIOS.map((s) => (
            <Button
              key={s.key}
              size="sm"
              variant={scenario === s.key ? "default" : "outline"}
              className="h-7 text-[11.5px]"
              onClick={() => setScenario(s.key)}
            >
              {s.label}
            </Button>
          ))}
        </div>
        <span className="mx-2 h-4 w-px bg-border" />
        <div className="flex flex-wrap gap-1.5">
          {HORIZONS.map((h) => (
            <Button
              key={h}
              size="sm"
              variant={horizon === h ? "default" : "outline"}
              className="h-7 text-[11.5px]"
              onClick={() => setHorizon(h)}
            >
              {h}
            </Button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <SummaryCard label="6-month revenue" value={currency(data.reduce((s, r) => s + r.revenue, 0))} />
        <SummaryCard label="6-month profit" value={currency(endProfit)} tone={endProfit >= 0 ? "success" : "destructive"} />
        <SummaryCard label="Ending cash" value={currency(endCash)} />
        <SummaryCard label="Runway" value={`${runway} days`} />
      </section>

      <Card className="border-border/70 p-4">
        <h3 className="text-[13px] font-semibold">
          Forecast · {FORECAST_SCENARIOS.find((s) => s.key === scenario)?.label} · {horizon}
        </h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Text summary: revenue trend {scenario === "revenue_decline" ? "declines" : "grows"}, expenses{" "}
          {scenario === "tech_reduction" ? "decline" : "grow modestly"}, profit ends at {currency(endProfit)}.
        </p>
        <div className="mt-3 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="m" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Revenue" />
              <Line dataKey="collections" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Collections" />
              <Line dataKey="expenses" stroke="#f97316" strokeWidth={2} dot={false} name="Expenses" />
              <Line dataKey="profit" stroke="#22d3ee" strokeWidth={2} dot={false} name="Profit" />
              <Line dataKey="cash" stroke="#84cc16" strokeWidth={2} dot={false} name="Cash" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border/70 p-4">
        <h3 className="text-[13px] font-semibold">Line items forecasted</h3>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11.5px]">
          {["Revenue", "Collections", "Expenses", "Overhead", "Technology", "Marketing", "Payroll", "Bonus obligations", "Pass-through obligations", "Restricted cash", "Available cash", "Profit", "Runway"].map((l) => (
            <span key={l} className="rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-muted-foreground">
              {l}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] italic text-muted-foreground">Forecast values are demonstration mock data.</p>
      </Card>
    </IntelligencePage>
  );
}

function SummaryCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "destructive" }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-tabular text-[20px] font-bold",
          tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground",
        )}
      >
        {value}
      </div>
    </Card>
  );
}
