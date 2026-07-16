import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { WaterfallCard } from "@/components/cash/waterfall-card";
import { GuardrailStrip } from "@/components/cash/guardrail-strip";
import { ObligationList } from "@/components/cash/obligation-list";
import {
  CASH_POSITION,
  CASH_POSITION_DERIVED,
  AVAILABILITY_HISTORY,
  PERIOD_ALLOCATION,
} from "@/lib/mock/cash-availability";
import { Landmark, ShieldAlert, PiggyBank, Wallet } from "lucide-react";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/cash-availability/")({
  component: CashAvailabilityOverview,
});

function CashAvailabilityOverview() {
  const operatingPct = (PERIOD_ALLOCATION.operating / PERIOD_ALLOCATION.gross) * 100;
  const restrictedPct = (PERIOD_ALLOCATION.restricted / PERIOD_ALLOCATION.gross) * 100;
  const reservedPct = (PERIOD_ALLOCATION.reserved / PERIOD_ALLOCATION.gross) * 100;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total cash in bank"
          value={CASH_POSITION.bankTotal}
          delta={9.7}
          trend="up"
          icon={Landmark}
          tone="blue"
          compareLabel="vs last month"
        />
        <KpiCard
          label="Restricted obligations"
          value={CASH_POSITION_DERIVED.restricted}
          delta={4.2}
          trend="up"
          icon={ShieldAlert}
          tone="violet"
          compareLabel="pass-through held"
        />
        <KpiCard
          label="Reserved (tax · payroll · commission · deferred)"
          value={CASH_POSITION_DERIVED.reserved}
          delta={2.1}
          trend="up"
          icon={PiggyBank}
          tone="cyan"
          compareLabel="protected from op spend"
        />
        <KpiCard
          label="True available operating cash"
          value={CASH_POSITION_DERIVED.trueAvailable}
          delta={11.4}
          trend="up"
          icon={Wallet}
          tone="mint"
          compareLabel="what CCA can safely spend"
        />
      </section>

      <WaterfallCard />

      <GuardrailStrip />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Card className="border border-border/70 bg-surface p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-[15.5px] font-semibold text-foreground">
                Bank cash composition — trailing 12 months
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">
                How much of every dollar in the bank was actually spendable
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11.5px]">
              <Dot color="#22c55e" label="Available" />
              <Dot color="#f59e0b" label="Reserved" />
              <Dot color="#ef4444" label="Restricted" />
            </div>
          </div>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={AVAILABILITY_HISTORY}
                margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
              >
                <CartesianGrid stroke="#E5EAF1" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="m"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}K`}
                  width={56}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5EAF1",
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: "0 8px 24px -8px rgba(15,23,42,0.15)",
                  }}
                  formatter={(v: number) => `${currency(v * 1000)}`}
                />
                <Legend wrapperStyle={{ display: "none" }} />
                <Bar
                  dataKey="available"
                  name="Available"
                  stackId="c"
                  fill="#22c55e"
                  radius={[0, 0, 0, 0]}
                />
                <Bar dataKey="reserved" name="Reserved" stackId="c" fill="#f59e0b" />
                <Bar
                  dataKey="restricted"
                  name="Restricted"
                  stackId="c"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="border border-border/70 bg-surface p-5 shadow-card">
            <div className="text-[13.5px] font-semibold text-foreground">
              This period · allocation split
            </div>
            <div className="mt-1 text-[11.5px] text-muted-foreground">
              Of {currency(PERIOD_ALLOCATION.gross)} received across recent client payments
            </div>
            <div className="mt-4 space-y-3">
              <SplitBar
                color="#22c55e"
                label="Operating (CCA revenue)"
                amount={PERIOD_ALLOCATION.operating}
                pct={operatingPct}
              />
              <SplitBar
                color="#f59e0b"
                label="Reserved (tax · deferred · commission)"
                amount={PERIOD_ALLOCATION.reserved}
                pct={reservedPct}
              />
              <SplitBar
                color="#ef4444"
                label="Restricted (pass-through)"
                amount={PERIOD_ALLOCATION.restricted}
                pct={restrictedPct}
              />
            </div>
          </Card>
          <ObligationList />
        </div>
      </section>
    </div>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function SplitBar({
  color,
  label,
  amount,
  pct,
}: {
  color: string;
  label: string;
  amount: number;
  pct: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0 truncate text-[12.5px] font-medium text-foreground">{label}</div>
        <div className="font-tabular text-[12.5px] font-semibold text-foreground">
          {currency(amount)}
        </div>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="mt-1 text-right text-[10.5px] text-muted-foreground">{pct.toFixed(1)}%</div>
    </div>
  );
}
