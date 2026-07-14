import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrgId } from "@/hooks/use-current-org";
import { getProfitAndLoss } from "@/lib/accounting/financial-reports.functions";

export const Route = createFileRoute("/reports/profit-loss")({
  head: () => ({
    meta: [
      { title: "Profit & Loss — LedgerOS" },
      { name: "description", content: "Revenue, expense, and net income for a fiscal period, from posted journal lines." },
      { property: "og:title", content: "Profit & Loss — LedgerOS" },
      { property: "og:description", content: "Period income statement driven by the LedgerOS posting engine." },
    ],
  }),
  component: PnlPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function Section({ title, rows, total }: { title: string; rows: Array<{ account_id: string; code: string; name: string; amount: number }>; total: number }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.account_id} className="border-b last:border-0">
              <td className="py-1.5 font-mono text-xs w-20">{r.code}</td>
              <td className="py-1.5">{r.name}</td>
              <td className="py-1.5 text-right tabular-nums">{fmt(r.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t font-semibold">
            <td colSpan={2} className="py-2">Total {title}</td>
            <td className="py-2 text-right tabular-nums">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function PnlPage() {
  const orgId = useOrgId();
  const today = new Date();
  const [from, setFrom] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(today.toISOString().slice(0, 10));
  const fn = useServerFn(getProfitAndLoss);
  const q = useQuery({
    queryKey: ["report.pnl", orgId, from, to],
    queryFn: () => fn({ data: { orgId: orgId!, from, to } }),
    enabled: !!orgId,
  });

  return (
    <AppShell>
      <PageHeader eyebrow="LedgerOS · Reporting" title="Profit & Loss" description="Revenue − Expense = Net Income." />
      <PageBody>
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
        </Card>
        <Card className="p-6">
          {!q.data ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              <Section title="Revenue" rows={q.data.revenue} total={q.data.revenueTotal} />
              <Section title="Expense" rows={q.data.expense} total={q.data.expenseTotal} />
              <div className="border-t-2 pt-3 flex justify-between font-bold text-lg">
                <span>Net Income</span>
                <span className={q.data.netIncome >= 0 ? "text-emerald-600" : "text-destructive"}>{fmt(q.data.netIncome)}</span>
              </div>
            </>
          )}
        </Card>
      </PageBody>
    </AppShell>
  );
}
