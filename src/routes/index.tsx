import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, TrendingUp, Wallet, Sparkles, ArrowRight, ShieldAlert, CheckCircle2, Info } from "lucide-react";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  CASH_SERIES,
  AR_AGING,
  AP_AGING,
  RECENT_TRANSACTIONS,
  CLOSE_TASKS,
  INTEGRATION_EVENTS,
  ALERTS,
  currency,
  currencyPrecise,
} from "@/lib/mock/finance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — LedgerOS" },
      {
        name: "description",
        content:
          "LedgerOS executive dashboard: cash position, revenue, expenses, AR/AP aging, close status, and integration health.",
      },
      { property: "og:title", content: "LedgerOS — Executive Dashboard" },
      {
        property: "og:description",
        content: "Fortune-500-grade financial operating system for CCA leadership.",
      },
    ],
  }),
  component: ExecutiveDashboard,
});

const kpiIcons = [Wallet, TrendingUp, Banknote, Sparkles];

function ExecutiveDashboard() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Executive Overview · August 2026"
        title="Good afternoon, Morgan"
        description="A calm, verified view of company-wide financial health. All figures are demonstration data for design review."
        actions={
          <>
            <Button variant="outline" className="gap-2">
              This month <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button className="gap-2 bg-gradient-brand text-brand-foreground shadow-glow hover:opacity-95">
              Generate report
            </Button>
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
              icon={kpiIcons[i]}
            />
          ))}
        </section>

        {/* Cash + alerts */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="overflow-hidden border-border/60 p-0 shadow-elegant">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 p-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Cash & operating flow
                </div>
                <div className="mt-1 text-lg font-semibold">Trailing 8 months</div>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { k: "cash", label: "Cash", cls: "bg-brand" },
                  { k: "revenue", label: "Revenue", cls: "bg-brand-cyan" },
                  { k: "expenses", label: "Expenses", cls: "bg-brand-violet" },
                ].map((l) => (
                  <Badge key={l.k} variant="outline" className="gap-1.5 border-border/60 font-medium">
                    <span className={`h-2 w-2 rounded-full ${l.cls}`} />
                    {l.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="h-[280px] w-full p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CASH_SERIES} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-cyan)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--brand-cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => currency(v)}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--brand-cyan)" fill="url(#revGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cash" stroke="var(--brand)" fill="url(#cashGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="expenses" stroke="var(--brand-violet)" fillOpacity={0} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-border/60 p-5 shadow-elegant">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  System signals
                </div>
                <div className="text-lg font-semibold">Alerts & health</div>
              </div>
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                All feeds live
              </Badge>
            </div>
            <div className="space-y-2.5">
              {ALERTS.map((a) => {
                const Icon =
                  a.severity === "warning" ? ShieldAlert : a.severity === "success" ? CheckCircle2 : Info;
                const tone =
                  a.severity === "warning"
                    ? "bg-warning/10 text-warning ring-warning/20"
                    : a.severity === "success"
                      ? "bg-success/10 text-success ring-success/20"
                      : "bg-info/10 text-info ring-info/20";
                return (
                  <div
                    key={a.title}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/50 p-3"
                  >
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1 ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium leading-tight">{a.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{a.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Aging */}
        <section className="grid gap-4 lg:grid-cols-2">
          <AgingCard title="Accounts receivable aging" data={AR_AGING} color="var(--brand)" />
          <AgingCard title="Accounts payable aging" data={AP_AGING} color="var(--brand-violet)" />
        </section>

        {/* Transactions + close + integrations */}
        <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="border-border/60 p-0 shadow-elegant">
            <div className="flex items-center justify-between border-b border-border/60 p-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Banking · Live feed
                </div>
                <div className="text-lg font-semibold">Recent transactions</div>
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                Open banking <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wider">Description</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider">Account</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wider">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_TRANSACTIONS.map((t) => (
                  <TableRow key={t.id} className="border-border/60">
                    <TableCell>
                      <div className="font-medium">{t.desc}</div>
                      <div className="text-xs text-muted-foreground">{t.id}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.account}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.date}</TableCell>
                    <TableCell
                      className={`text-right font-tabular font-semibold ${
                        t.kind === "in" ? "text-success" : "text-foreground"
                      }`}
                    >
                      {t.kind === "in" ? "+" : ""}
                      {currencyPrecise(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="space-y-4">
            <Card className="border-border/60 p-5 shadow-elegant">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Monthly close · July
                  </div>
                  <div className="text-lg font-semibold">Close progress</div>
                </div>
                <Badge variant="outline" className="border-brand/30 bg-brand/10 text-brand">
                  Day 6 of 10
                </Badge>
              </div>
              <div className="space-y-2.5">
                {CLOSE_TASKS.slice(0, 5).map((t) => (
                  <div
                    key={t.task}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-2.5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{t.task}</div>
                      <div className="text-[11px] text-muted-foreground">{t.owner}</div>
                    </div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <StatusBadge status={t.status as any} />
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button variant="outline" size="sm" className="w-full gap-2">
                Open monthly close <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>

            <Card className="border-border/60 p-5 shadow-elegant">
              <div className="mb-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Integration inbox
                </div>
                <div className="text-lg font-semibold">Recent events</div>
              </div>
              <div className="space-y-2">
                {INTEGRATION_EVENTS.map((e) => (
                  <div key={e.event + e.when} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{e.event}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {e.source} · {e.when}
                      </div>
                    </div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <StatusBadge status={e.status as any} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <p className="pt-2 text-center text-[11px] text-muted-foreground">
          LedgerOS UI Design Lab — All values are demonstration data. No accounting records were created or modified.
        </p>
      </PageBody>
    </AppShell>
  );
}

function AgingCard({
  title,
  data,
  color,
}: {
  title: string;
  data: { bucket: string; value: number }[];
  color: string;
}) {
  const total = data.reduce((s, r) => s + r.value, 0);
  return (
    <Card className="border-border/60 p-5 shadow-elegant">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </div>
          <div className="mt-1 font-tabular text-2xl font-semibold tracking-tight">
            {currency(total)}
          </div>
        </div>
        <Badge variant="outline" className="border-border/60">
          {data.length} buckets
        </Badge>
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bucket" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v: number) => currency(v)}
              cursor={{ fill: "var(--muted)" }}
            />
            <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
