import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrgId } from "@/hooks/use-current-org";
import { getBalanceSheetAsOf } from "@/lib/accounting/financial-reports.functions";

export const Route = createFileRoute("/reports/balance-sheet")({
  head: () => ({
    meta: [
      { title: "Balance Sheet — LedgerOS" },
      { name: "description", content: "Assets, liabilities, and equity as of a date, from posted journal lines." },
      { property: "og:title", content: "Balance Sheet — LedgerOS" },
      { property: "og:description", content: "Assets = Liabilities + Equity, computed from the posting engine." },
    ],
  }),
  component: BalanceSheetPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function Column({ title, rows, total, extra }: {
  title: string;
  rows: Array<{ account_id: string; code: string; name: string; amount: number }>;
  total: number;
  extra?: { label: string; amount: number };
}) {
  return (
    <div>
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
          {extra && (
            <tr className="border-b">
              <td colSpan={2} className="py-1.5 italic text-muted-foreground">{extra.label}</td>
              <td className="py-1.5 text-right tabular-nums">{fmt(extra.amount)}</td>
            </tr>
          )}
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

function BalanceSheetPage() {
  const orgId = useOrgId();
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));
  const fn = useServerFn(getBalanceSheetAsOf);
  const q = useQuery({
    queryKey: ["report.bs", orgId, asOf],
    queryFn: () => fn({ data: { orgId: orgId!, asOf } }),
    enabled: !!orgId,
  });

  return (
    <AppShell>
      <PageHeader eyebrow="LedgerOS · Reporting" title="Balance Sheet" description="Assets = Liabilities + Equity." />
      <PageBody>
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div><Label>As of</Label><Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} /></div>
            {q.data && (
              <div className="ml-auto text-sm">
                <span className={q.data.balanced ? "text-emerald-600" : "text-destructive"}>
                  {q.data.balanced ? "Balanced ✓" : "Unbalanced"}
                </span>
              </div>
            )}
          </div>
        </Card>
        <Card className="p-6">
          {!q.data ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              <Column title="Assets" rows={q.data.asset} total={q.data.totals.asset} />
              <div className="space-y-6">
                <Column title="Liabilities" rows={q.data.liability} total={q.data.totals.liability} />
                <Column
                  title="Equity"
                  rows={q.data.equity}
                  total={q.data.totals.equity}
                  extra={{ label: "Retained earnings (period)", amount: q.data.retainedEarnings }}
                />
                <div className="border-t-2 pt-3 flex justify-between font-bold">
                  <span>Total Liabilities + Equity</span>
                  <span>{fmt(q.data.totals.liabAndEquity)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </PageBody>
    </AppShell>
  );
}
