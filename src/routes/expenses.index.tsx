import { createFileRoute, Link } from "@tanstack/react-router";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { AnomalyCard } from "@/components/expenses/anomaly-card";
import { SubscriptionCard } from "@/components/expenses/subscription-card";
import { currency } from "@/lib/mock/finance";
import {
  ANOMALIES,
  APPROVAL_QUEUE,
  EXPENSES,
  RECOVERIES,
  SPEND_BY_CATEGORY,
  SPEND_BY_DEPT,
  SPEND_TREND,
  SUBSCRIPTIONS,
  VENDOR_SPEND,
  expenseKpis,
} from "@/lib/mock/expenses";
import { Wallet, Clock, RefreshCw, LinkIcon, ReceiptText, AlertOctagon, Sparkles, AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/expenses/")({
  component: ExpensesDashboard,
});

function ExpensesDashboard() {
  const k = expenseKpis();

  const kpiCards = [
    { label: "Total Expenses", value: k.total, icon: Wallet, tone: "blue" as const, delta: 5.2, trend: "up" as const, to: "/expenses/list", compareLabel: "vs prior month" },
    { label: "Pending Approval", value: k.pending, icon: Clock, tone: "violet" as const, delta: 12.6, trend: "up" as const, to: "/expenses/approvals", compareLabel: `${k.pendingCount} items` },
    { label: "Reimbursable", value: k.reimbursable, icon: RefreshCw, tone: "cyan" as const, delta: 3.1, trend: "up" as const, to: "/expenses/reimbursements", compareLabel: "employee expenses" },
    { label: "Unmatched", value: k.unmatched, icon: LinkIcon, tone: "mint" as const, delta: -8.3, trend: "down" as const, to: "/expenses/matching", format: "number" as const, compareLabel: "need review" },
    { label: "Missing Receipts", value: k.missing, icon: ReceiptText, tone: "violet" as const, delta: -2.0, trend: "down" as const, to: "/expenses/receipts", format: "number" as const, compareLabel: "receipt required" },
    { label: "Policy Exceptions", value: k.exceptions, icon: AlertOctagon, tone: "blue" as const, delta: 14.0, trend: "up" as const, to: "/expenses/policies", format: "number" as const, compareLabel: "vs policy" },
    { label: "Subscription Spend", value: k.subscriptions, icon: Sparkles, tone: "cyan" as const, delta: 6.4, trend: "up" as const, to: "/expenses/subscriptions", compareLabel: "recurring" },
    { label: "Anomalies", value: k.anomalies, icon: AlertTriangle, tone: "mint" as const, delta: 1, trend: "up" as const, to: "/expenses/intelligence", format: "number" as const, compareLabel: "AI flagged" },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((c) => (
          <Link key={c.label} to={c.to as "/expenses"} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-2xl">
            <KpiCard {...c} />
          </Link>
        ))}
      </section>

      {/* Charts row */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 p-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Spend trend</h3>
            <span className="text-[11.5px] text-muted-foreground">Current · Prior · Budget · Forecast</span>
          </div>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SPEND_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="m" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="prior" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Prior" />
                <Line type="monotone" dataKey="budget" stroke="#22d3ee" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Budget" />
                <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeDasharray="2 2" strokeWidth={1.5} dot={false} name="Forecast" />
                <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2.25} dot={{ r: 3 }} name="Current" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Spend by category</h3>
          <div className="mt-3 space-y-2">
            {SPEND_BY_CATEGORY.filter((c) => c.value > 0).sort((a, b) => b.value - a.value).map((c) => {
              const total = SPEND_BY_CATEGORY.reduce((s, x) => s + x.value, 0);
              const pct = total > 0 ? (c.value / total) * 100 : 0;
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                      {c.label}
                    </span>
                    <span className="font-tabular text-muted-foreground">{currency(c.value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full" style={{ width: `${pct}%`, background: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Spend by department</h3>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPEND_BY_DEPT} layout="vertical" margin={{ top: 4, right: 8, left: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false} />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="label" fontSize={11} tickLine={false} axisLine={false} width={90} />
                <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Approval queue</h3>
            <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" asChild>
              <Link to="/expenses/approvals">View all →</Link>
            </Button>
          </div>
          <div className="mt-2 space-y-1.5">
            {APPROVAL_QUEUE.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-md border border-border/70 px-2.5 py-1.5 text-[12px]">
                <div className="min-w-0">
                  <div className="truncate font-medium">{e.vendor} · {e.employee}</div>
                  <div className="text-[11px] text-muted-foreground">{e.description}</div>
                </div>
                <div className="text-right font-tabular font-semibold">{currency(e.amount)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Anomaly alerts</h3>
            <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" asChild>
              <Link to="/expenses/intelligence">Review →</Link>
            </Button>
          </div>
          <div className="mt-2 space-y-1.5">
            {ANOMALIES.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-md border border-border/70 px-2.5 py-1.5 text-[12px]">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  <span className="font-medium">{a.vendor}</span>
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{a.reason}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Subscription renewals</h3>
            <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" asChild>
              <Link to="/expenses/subscriptions">Manage →</Link>
            </Button>
          </div>
          <div className="mt-3 space-y-3">
            {SUBSCRIPTIONS.slice(0, 2).map((s) => (
              <SubscriptionCard key={s.id} s={s} />
            ))}
          </div>
        </Card>

        <Card className="border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Reimbursable — not yet billed</h3>
            <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" asChild>
              <Link to="/expenses/recovery">Recover →</Link>
            </Button>
          </div>
          <div className="mt-2 space-y-1.5">
            {RECOVERIES.filter((r) => r.status === "eligible" || r.status === "on_draft" || r.status === "at_risk").map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-border/70 px-2.5 py-1.5 text-[12px]">
                <div className="min-w-0">
                  <div className="truncate font-medium">{r.client} · {r.vendor}</div>
                  <div className="text-[11px] text-muted-foreground">{r.expense} · {r.contractRule}</div>
                </div>
                <div className="text-right font-tabular font-semibold">{currency(r.recoverable)}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <Card className="border-border/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Recent expense activity</h3>
            <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" asChild>
              <Link to="/expenses/list">Open list →</Link>
            </Button>
          </div>
          <ExpenseTable rows={EXPENSES.slice(0, 8)} compact />
        </Card>
      </section>

      <section>
        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">Top vendors</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {VENDOR_SPEND.slice(0, 6).map((v) => (
              <div key={v.vendor} className="rounded-md border border-border/70 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{v.vendor}</div>
                  <div className="font-tabular font-semibold">{currency(v.total)}</div>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{v.department} · {v.subscription ? "Subscription" : "One-off"}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Anomalies feed */}
      <section className="grid gap-3 xl:grid-cols-2">
        {ANOMALIES.slice(0, 2).map((a) => (
          <AnomalyCard key={a.id} a={a} />
        ))}
      </section>
    </div>
  );
}
