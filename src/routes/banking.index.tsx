import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { BankAccountCard } from "@/components/banking/bank-account-card";
import { BankingAlert } from "@/components/banking/banking-alert";
import { DemoNotice } from "@/components/banking/demo-notice";
import {
  BANK_ACCOUNTS,
  BANKING_ALERTS,
  IMPORT_HISTORY,
  TRANSACTIONS,
} from "@/lib/mock/banking";
import { currencyPrecise } from "@/lib/mock/finance";
import { isProductionMode } from "@/lib/app-mode";
import { ProductionUnavailable } from "@/components/production-unavailable";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  ArrowLeftRight,
  Banknote,
  Download,
  MoreHorizontal,
  Plus,
  Upload,
  Wallet,
  AlertTriangle,
  BookOpenCheck,
} from "lucide-react";

export const Route = createFileRoute("/banking/")({
  head: () => ({
    meta: [
      { title: "Banking — LedgerOS UI Design Lab" },
      {
        name: "description",
        content:
          "Monitor balances, imported activity, and reconciliation health across all connected accounts.",
      },
      { property: "og:title", content: "Banking — LedgerOS" },
      {
        property: "og:description",
        content: "Consolidated banking operations for CCA finance teams.",
      },
    ],
  }),
  component: BankingOverview,
});

function BankingOverview() {
  if (isProductionMode()) {
    return (
      <ProductionUnavailable
        title="Banking"
        description="This is the design-lab banking preview. The live banking workspace is under Ledger."
        to="/ledger/banking"
        toLabel="Go to live banking"
      />
    );
  }

  const totalBank = BANK_ACCOUNTS.reduce((s, a) => s + a.bankBalance, 0);
  const totalLedger = BANK_ACCOUNTS.reduce((s, a) => s + a.ledgerBalance, 0);
  const pending = BANK_ACCOUNTS.reduce((s, a) => s + a.pendingReview, 0);
  const unmatched = BANK_ACCOUNTS.reduce((s, a) => s + a.unmatched, 0);
  const dueRecon = BANK_ACCOUNTS.filter((a) =>
    ["not_started", "in_progress", "overdue", "needs_review", "variance"].includes(a.reconciliation),
  ).length;
  const importErrors = IMPORT_HISTORY.reduce((s, i) => s + i.errors, 0);

  const cashByAccount = BANK_ACCOUNTS.map((a) => ({
    name: `${a.nickname}`,
    value: a.bankBalance,
  }));
  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
  ];

  const statusCounts = TRANSACTIONS.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusRows: { label: string; key: string; count: number }[] = [
    { label: "Pending review", key: "pending_review", count: statusCounts.pending_review ?? 0 },
    { label: "Matched", key: "matched", count: statusCounts.matched ?? 0 },
    { label: "Categorized", key: "categorized", count: statusCounts.categorized ?? 0 },
    { label: "Split", key: "split", count: statusCounts.split ?? 0 },
    { label: "Transfer", key: "transfer", count: statusCounts.transfer ?? 0 },
    { label: "Reconciled", key: "reconciled", count: TRANSACTIONS.filter((t) => t.reconciled).length },
    { label: "Flagged", key: "flagged", count: statusCounts.flagged ?? 0 },
  ];

  const reconHealth = {
    reconciled: BANK_ACCOUNTS.filter((a) => a.reconciliation === "reconciled").length,
    due: BANK_ACCOUNTS.filter((a) => ["not_started", "in_progress", "needs_review"].includes(a.reconciliation)).length,
    overdue: BANK_ACCOUNTS.filter((a) => a.reconciliation === "overdue").length,
    variance: BANK_ACCOUNTS.filter((a) => a.reconciliation === "variance").length,
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Banking"
        title="Banking"
        description="Monitor balances, imported activity, and reconciliation health"
        actions={
          <>
            <Select defaultValue="all-inst">
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-inst">All institutions</SelectItem>
                <SelectItem value="nfcu">Navy Federal Credit Union</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-acct">
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-acct">All accounts</SelectItem>
                {BANK_ACCOUNTS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nickname} {a.mask}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="mtd">
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtd">Month to date</SelectItem>
                <SelectItem value="qtd">Quarter to date</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9">
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Import transactions
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add bank account
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export banking snapshot</DropdownMenuItem>
                <DropdownMenuItem>Manage import mappings</DropdownMenuItem>
                <DropdownMenuItem>Notification preferences</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <PageBody>
        <DemoNotice />

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-6">
          <SummaryCell label="Total cash (bank)" value={currencyPrecise(totalBank)} icon={Banknote} tone="brand" />
          <SummaryCell label="Ledger cash" value={currencyPrecise(totalLedger)} icon={Wallet} />
          <SummaryCell label="Pending transactions" value={pending.toString()} tone="warning" />
          <SummaryCell label="Unmatched" value={unmatched.toString()} tone="warning" />
          <SummaryCell label="Accounts to reconcile" value={dueRecon.toString()} tone="info" />
          <SummaryCell label="Import errors" value={importErrors.toString()} tone={importErrors > 0 ? "danger" : "neutral"} />
        </div>

        {/* Account cards */}
        <section aria-labelledby="accounts">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="accounts" className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Connected accounts
            </h2>
            <span className="text-xs text-muted-foreground">
              {BANK_ACCOUNTS.length} accounts · Fictional Navy Federal demo data
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {BANK_ACCOUNTS.map((a) => (
              <BankAccountCard key={a.id} account={a} />
            ))}
          </div>
        </section>

        {/* Charts row */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Cash by account
                </div>
                <div className="text-lg font-semibold">Account contribution to total cash</div>
              </div>
              <Badge variant="outline">{currencyPrecise(totalBank)}</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={cashByAccount} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="2 4" />
                  <XAxis
                    type="number"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={120} />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => currencyPrecise(v)}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {cashByAccount.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Transaction status
              </div>
              <div className="text-lg font-semibold">Distribution across imports</div>
            </div>
            <ul className="space-y-2">
              {statusRows.map((row) => {
                const pct = TRANSACTIONS.length > 0 ? (row.count / TRANSACTIONS.length) * 100 : 0;
                return (
                  <li key={row.key} className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{row.label}</span>
                        <span className="font-tabular text-muted-foreground">{row.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${Math.max(pct, 3)}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        {/* Reconciliation health + recent imports */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <div className="mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Reconciliation health
              </div>
              <div className="text-lg font-semibold">By account</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HealthTile label="Reconciled" value={reconHealth.reconciled} tone="success" />
              <HealthTile label="Due" value={reconHealth.due} tone="info" />
              <HealthTile label="Overdue" value={reconHealth.overdue} tone="danger" />
              <HealthTile label="Variance" value={reconHealth.variance} tone="danger" />
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              <BookOpenCheck className="mr-1.5 h-3.5 w-3.5" /> Open reconciliation workspace
            </Button>
          </Card>

          <Card className="p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Recent imports
                </div>
                <div className="text-lg font-semibold">Last 4 batches</div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="pb-2 text-left">File</th>
                    <th className="pb-2 text-left">Account</th>
                    <th className="pb-2 text-left">Imported</th>
                    <th className="pb-2 text-right">Rows</th>
                    <th className="pb-2 text-right">Dup</th>
                    <th className="pb-2 text-right">Err</th>
                    <th className="pb-2 text-left">By</th>
                    <th className="pb-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {IMPORT_HISTORY.map((i) => {
                    const acct = BANK_ACCOUNTS.find((a) => a.id === i.accountId);
                    return (
                      <tr key={i.id} className="border-t border-border/60">
                        <td className="py-2 pr-3 font-mono text-xs">{i.fileName}</td>
                        <td className="py-2 pr-3 text-xs">
                          {acct?.nickname} <span className="text-muted-foreground">{acct?.mask}</span>
                        </td>
                        <td className="py-2 pr-3 font-tabular text-xs text-muted-foreground">
                          {i.importedAt}
                        </td>
                        <td className="py-2 pr-3 text-right font-tabular text-xs">{i.imported}</td>
                        <td className="py-2 pr-3 text-right font-tabular text-xs">
                          {i.duplicates > 0 ? (
                            <span className="text-warning">{i.duplicates}</span>
                          ) : (
                            "0"
                          )}
                        </td>
                        <td className="py-2 pr-3 text-right font-tabular text-xs">
                          {i.errors > 0 ? (
                            <span className="text-destructive">{i.errors}</span>
                          ) : (
                            "0"
                          )}
                        </td>
                        <td className="py-2 pr-3 text-xs">{i.importedBy}</td>
                        <td className="py-2">
                          <StatusBadge status={i.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Alerts */}
        <section aria-labelledby="alerts">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 id="alerts" className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Banking alerts
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {BANKING_ALERTS.map((a) => (
              <BankingAlert
                key={a.id}
                severity={a.severity}
                title={a.title}
                detail={a.detail}
                account={a.account}
              />
            ))}
          </div>
        </section>
      </PageBody>
    </AppShell>
  );
}

function SummaryCell({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon?: typeof ArrowLeftRight;
  tone?: "neutral" | "brand" | "warning" | "info" | "danger";
}) {
  const toneClass =
    tone === "brand"
      ? "text-brand"
      : tone === "warning"
        ? "text-warning"
        : tone === "info"
          ? "text-info"
          : tone === "danger"
            ? "text-destructive"
            : "text-foreground";
  return (
    <Card className="min-w-0 p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </div>
        {Icon && <Icon className={"h-3.5 w-3.5 shrink-0 " + toneClass} />}
      </div>
      <div className={"mt-1 min-w-0 truncate font-tabular text-lg font-semibold sm:text-xl " + toneClass}>
        {value}
      </div>
    </Card>
  );
}

function HealthTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "info" | "danger";
}) {
  const cls =
    tone === "success"
      ? "text-success bg-success/10 border-success/30"
      : tone === "info"
        ? "text-info bg-info/10 border-info/30"
        : "text-destructive bg-destructive/10 border-destructive/30";
  return (
    <div className={"rounded-xl border p-3 " + cls}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">{label}</div>
      <div className="mt-1 font-tabular text-2xl font-semibold">{value}</div>
    </div>
  );
}
