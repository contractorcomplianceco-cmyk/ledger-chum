import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Wallet,
  ChevronDown,
  MoreVertical,
  FileText,
  Receipt,
  NotebookPen,
  Landmark,
  CreditCard,
  ArrowLeftRight,
  ChevronRight,
  Calendar,
  ArrowUp,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KPIS,
  FIN_OVERVIEW,
  CASH_FLOW,
  RECENT_TRANSACTIONS,
  INTEGRATION_INBOX,
  ALERTS,
  currency,
  currencyPrecise,
  type TxnType,
} from "@/lib/mock/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — LedgerOS" },
      {
        name: "description",
        content:
          "LedgerOS executive dashboard — revenue, profit, cash balance, financial overview, cash flow, and recent transactions.",
      },
      { property: "og:title", content: "LedgerOS — Executive Dashboard" },
      {
        property: "og:description",
        content: "Fortune-500-grade financial operating system for modern accounting teams.",
      },
    ],
  }),
  component: ExecutiveDashboard,
});

const kpiVisuals = [
  { icon: DollarSign, tone: "blue" as const },
  { icon: LineChartIcon, tone: "cyan" as const },
  { icon: PieChartIcon, tone: "violet" as const },
  { icon: Wallet, tone: "mint" as const },
];

const quickActions = [
  { label: "New Invoice", icon: FileText },
  { label: "New Bill", icon: Receipt },
  { label: "New Journal Entry", icon: NotebookPen },
  { label: "Bank Reconciliation", icon: Landmark },
  { label: "Record Payment", icon: CreditCard },
  { label: "Transfer Funds", icon: ArrowLeftRight },
];

function ExecutiveDashboard() {
  return (
    <AppShell>
      <PageHeader
        title="Welcome back, Rose 👋"
        highlight="Rose"
        description="Here's what's happening with your finances today."
        actions={
          <>
            <button
              type="button"
              className="hidden h-10 items-center gap-2 rounded-xl border border-border/70 bg-surface px-3 text-[13px] font-medium text-foreground shadow-card sm:inline-flex"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              This Month
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </>
        }
      />

      <PageBody>
        {/* KPI Row */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((k, i) => (
            <KpiCard
              key={k.label}
              label={k.label}
              value={k.value}
              delta={k.delta}
              trend={k.trend}
              icon={kpiVisuals[i].icon}
              tone={kpiVisuals[i].tone}
              sparkline={k.spark}
            />
          ))}
        </section>

        {/* Main analytics row: Financial Overview | Cash Flow | Utility column */}
        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,0.85fr)]">
          <FinancialOverviewCard />
          <CashFlowCard />
          <UtilityColumn />
        </section>

        {/* Recent Transactions full width */}
        <RecentTransactionsCard />

        <p className="pt-2 text-center text-[11px] text-muted-foreground">
          LedgerOS UI Design Lab — All values are demonstration data. No accounting records were created or modified.
        </p>
      </PageBody>
    </AppShell>
  );
}

function FinancialOverviewCard() {
  return (
    <Card className="border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[15.5px] font-semibold text-foreground">Financial Overview</div>
          <div className="mt-2.5 flex items-center gap-4 text-[12.5px]">
            <LegendDot color="#3b82f6" label="Revenue" />
            <LegendDot color="#22d3ee" label="Expenses" />
            <LegendDot color="#8b5cf6" label="Net Profit" />
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 text-[12.5px] font-medium text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        >
          This Year <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={FIN_OVERVIEW} margin={{ top: 10, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="nnet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5EAF1" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="m"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={4}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v === 0 ? "$0" : `$${(v / 1000).toFixed(0)}K`)}
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
              formatter={(v: number) => currency(v)}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2.25}
              fill="url(#rev)"
              dot={{ r: 3, strokeWidth: 2, stroke: "#3b82f6", fill: "#fff" }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#22d3ee"
              strokeWidth={2.25}
              fill="url(#exp)"
              dot={{ r: 3, strokeWidth: 2, stroke: "#22d3ee", fill: "#fff" }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="#8b5cf6"
              strokeWidth={2.25}
              fill="url(#nnet)"
              dot={{ r: 3, strokeWidth: 2, stroke: "#8b5cf6", fill: "#fff" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function CashFlowCard() {
  const total = CASH_FLOW.reduce((s, r) => s + r.value, 0);
  return (
    <Card className="flex flex-col border border-border/70 bg-surface p-5 shadow-card">
      <div className="text-[15.5px] font-semibold text-foreground">Cash Flow Summary</div>

      <div className="mt-2 grid flex-1 grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] items-center gap-3">
        <div className="relative h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CASH_FLOW}
                dataKey="value"
                innerRadius="66%"
                outerRadius="96%"
                paddingAngle={2}
                stroke="none"
              >
                {CASH_FLOW.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-tabular text-[19px] font-bold tracking-tight text-foreground">
                {currency(total)}
              </div>
              <div className="text-[10.5px] text-muted-foreground">Total Cash</div>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {CASH_FLOW.map((s) => (
            <div key={s.name} className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="text-[12.5px] font-medium text-foreground">{s.name}</span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between gap-2 pl-3.5">
                <span className="font-tabular text-[13px] font-semibold text-foreground">
                  {currency(s.value)}
                </span>
                <span className="text-[11px] text-muted-foreground">{s.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
          Updated just now
        </div>
        <Button variant="outline" size="sm" className="h-8 rounded-lg border-border/70 text-[12px]">
          View Report
        </Button>
      </div>
    </Card>
  );
}

function UtilityColumn() {
  return (
    <div className="flex flex-col gap-4">
      {/* Quick Actions — dark navy card matching reference */}
      <Card className="overflow-hidden border-0 bg-gradient-quick-actions p-4 text-white shadow-[0_10px_28px_-12px_rgba(15,23,42,0.55)]">
        <div className="mb-2.5 text-[14.5px] font-semibold">Quick Actions</div>
        <div className="divide-y divide-white/8">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                type="button"
                className="group flex w-full items-center gap-2.5 py-2 text-left transition"
              >
                <Icon className="h-4 w-4 text-white/70 group-hover:text-white" />
                <span className="text-[13px] font-medium text-white/90 group-hover:text-white">
                  {a.label}
                </span>
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white/80" />
              </button>
            );
          })}
        </div>
      </Card>

      {/* Integration Inbox */}
      <Card className="border border-border/70 bg-surface p-4 shadow-card">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[14.5px] font-semibold text-foreground">Integration Inbox</div>
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand/10 px-1.5 text-[10.5px] font-semibold text-brand">
            {INTEGRATION_INBOX.length}
          </span>
        </div>
        <div className="space-y-2.5">
          {INTEGRATION_INBOX.map((e) => (
            <div key={e.event + e.date} className="flex items-center gap-2.5">
              <div
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
                style={{ background: e.color }}
              >
                {e.source[0]}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[12.5px] font-semibold text-foreground">
                  {e.event}{" "}
                  <span className="ml-1 font-tabular font-semibold text-foreground">
                    {currencyPrecise(e.amount)}
                  </span>
                </div>
                <div className="truncate text-[10.5px] text-muted-foreground">{e.date}</div>
              </div>
              <button
                type="button"
                className="rounded-md border border-border/70 px-2 py-1 text-[11px] font-medium text-foreground/80 transition hover:bg-muted"
              >
                Review
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-transparent py-1.5 text-[12px] font-semibold text-brand hover:bg-brand/5"
        >
          View All <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </Card>

      {/* Alerts */}
      <Card className="border border-border/70 bg-surface p-4 shadow-card">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[14.5px] font-semibold text-foreground">Alerts</div>
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-warning/15 px-1.5 text-[10.5px] font-semibold text-warning">
            {ALERTS.length}
          </span>
        </div>
        <div className="space-y-2.5">
          {ALERTS.map((a) => {
            const Icon = a.severity === "warning" ? AlertTriangle : AlertCircle;
            const tone = a.severity === "warning" ? "text-warning bg-warning/10" : "text-brand bg-brand/10";
            return (
              <div key={a.title} className="flex items-start gap-2.5">
                <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", tone)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[12.5px] font-semibold text-foreground">{a.title}</div>
                  <div className="mt-0.5 text-[10.5px] text-muted-foreground">{a.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-transparent py-1.5 text-[12px] font-semibold text-brand hover:bg-brand/5"
        >
          View All Alerts <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </Card>
    </div>
  );
}

function RecentTransactionsCard() {
  return (
    <Card className="border border-border/70 bg-surface p-0 shadow-card">
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <div className="text-[15.5px] font-semibold text-foreground">Recent Transactions</div>
        <button
          type="button"
          className="text-[12.5px] font-semibold text-brand hover:underline"
        >
          View All
        </button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Type
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Amount
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-10 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {RECENT_TRANSACTIONS.map((t) => (
            <TableRow key={t.id} className="border-border">
              <TableCell className="whitespace-nowrap pl-5 font-tabular text-[13px] text-foreground/90">
                {t.date}
              </TableCell>
              <TableCell>
                <TypeChip type={t.type as TxnType} />
              </TableCell>
              <TableCell className="text-[13px] font-medium text-foreground">
                {t.desc}
              </TableCell>
              <TableCell className="font-mono text-[12.5px] text-muted-foreground">
                {t.account}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-tabular text-[13px] font-semibold",
                  t.kind === "in" ? "text-success" : "text-foreground",
                )}
              >
                {t.kind === "in" ? "+" : ""}
                {currencyPrecise(t.amount)}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11.5px] font-semibold text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Posted
                </span>
              </TableCell>
              <TableCell className="pr-4">
                <button
                  type="button"
                  aria-label="More"
                  className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

const typeChipStyles: Record<TxnType, string> = {
  Invoice: "border-blue-300 bg-blue-50 text-blue-700",
  Bill: "border-violet-300 bg-violet-50 text-violet-700",
  Payment: "border-emerald-300 bg-emerald-50 text-emerald-700",
  "Journal Entry": "border-amber-300 bg-amber-50 text-amber-700",
  Refund: "border-rose-300 bg-rose-50 text-rose-700",
  Transfer: "border-cyan-300 bg-cyan-50 text-cyan-700",
};

function TypeChip({ type }: { type: TxnType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11.5px] font-semibold",
        typeChipStyles[type] ?? "border-border bg-muted text-foreground",
      )}
    >
      {type}
    </span>
  );
}

// Silence unused-import for icons re-exported for banking pages
void ArrowUp;
