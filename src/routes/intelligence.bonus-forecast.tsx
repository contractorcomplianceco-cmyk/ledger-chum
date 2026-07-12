import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { BONUS_FORECAST } from "@/lib/mock/intelligence";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

const SCENARIOS = [
  "Revenue +10%",
  "Collections −10%",
  "Chargebacks +5%",
  "Team goal achieved",
  "Margin threshold missed",
  "New bonus plan begins",
];

export const Route = createFileRoute("/intelligence/bonus-forecast")({
  head: () => ({ meta: [{ title: "Bonus Forecast — LedgerOS" }] }),
  component: BonusForecastPage,
});

function BonusForecastPage() {
  const [active, setActive] = useState<string[]>([]);
  const toggle = (s: string) =>
    setActive((a) => (a.includes(s) ? a.filter((x) => x !== s) : [...a, s]));

  return (
    <IntelligencePage
      title="Bonus Forecast"
      description="Look ahead at bonus obligations, reserve coverage, and clawback risk."
    >
      <section className="grid gap-4 xl:grid-cols-4">
        {BONUS_FORECAST.map((h) => {
          const shortfall = h.shortfall > 0;
          return (
            <Card key={h.horizon} className="border-border/70 p-4">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                {h.horizon}
              </div>
              <div className="mt-1 font-tabular text-[22px] font-bold">{currency(h.obligation)}</div>
              <div className="mt-1 text-[11.5px] text-muted-foreground">
                Reserve <span className="font-tabular font-semibold text-foreground">{currency(h.reserve)}</span>
              </div>
              <div
                className={cn(
                  "mt-2 rounded-md px-2 py-1 text-[11px] font-semibold",
                  shortfall ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success",
                )}
              >
                {shortfall ? `Shortfall ${currency(h.shortfall)}` : "Reserve covers obligation"}
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Obligation vs reserve</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BONUS_FORECAST}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="horizon" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="obligation" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Obligation" />
                <Bar dataKey="reserve" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Reserve" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Scenario adjustments</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Toggle scenarios to preview impact. Demonstration only.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SCENARIOS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={active.includes(s) ? "default" : "outline"}
                className="h-7 text-[11.5px]"
                onClick={() => toggle(s)}
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 text-[12px]">
            <ImpactRow label="Payroll (next cycle)" value={currency(12_400 + active.length * 1_800)} />
            <ImpactRow label="Available cash" value={currency(451_510 - active.length * 1_800)} />
            <ImpactRow label="Department profit" value={currency(288_800 - active.length * 900)} />
            <ImpactRow label="Company profit" value={currency(326_870 - active.length * 900)} />
            <ImpactRow
              label="Cash guardrail status"
              value={active.length >= 3 ? "Warning" : "Healthy"}
              tone={active.length >= 3 ? "destructive" : "success"}
            />
          </div>
        </Card>
      </section>
    </IntelligencePage>
  );
}

function ImpactRow({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "destructive" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-tabular font-semibold",
          tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
