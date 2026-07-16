import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrgId } from "@/hooks/use-current-org";
import { getTrialBalanceRanged } from "@/lib/accounting/financial-reports.functions";

export const Route = createFileRoute("/reports/trial-balance")({
  head: () => ({
    meta: [
      { title: "Trial Balance — LedgerOS" },
      { name: "description", content: "Debits and credits per account for a date range, from posted journal lines." },
      { property: "og:title", content: "Trial Balance — LedgerOS" },
      { property: "og:description", content: "Balanced double-entry check across the chart of accounts." },
    ],
  }),
  component: TrialBalancePage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function TrialBalancePage() {
  const orgId = useOrgId();
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(today);
  const fn = useServerFn(getTrialBalanceRanged);
  const q = useQuery({
    queryKey: ["report.tb", orgId, from, to],
    queryFn: () => fn({ data: { orgId: orgId!, from: from || undefined, to: to || undefined } }),
    enabled: !!orgId,
  });

  return (
    <AppShell>
      <PageHeader eyebrow="LedgerOS · Reporting" title="Trial Balance" description="Sum of debits and credits per account. Must balance." />
      <PageBody>
        <Card data-tour="trial-balance" className="p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            {q.data && (
              <div className="ml-auto text-sm">
                <span className={q.data.balanced ? "text-emerald-600" : "text-destructive"}>
                  {q.data.balanced ? "Balanced ✓" : "Unbalanced"}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          {!q.data ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-3">Code</th>
                    <th className="py-2 pr-3">Account</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3 text-right">Debit</th>
                    <th className="py-2 pr-3 text-right">Credit</th>
                    <th className="py-2 pr-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.rows.map((r) => (
                    <tr key={r.account_id} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-mono text-xs">{r.code}</td>
                      <td className="py-2 pr-3">{r.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground capitalize">{r.type}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmt(r.debit)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmt(r.credit)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium">{fmt(r.balance)}</td>
                    </tr>
                  ))}
                  {q.data.rows.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No posted activity in range.</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t font-semibold">
                    <td colSpan={3} className="py-2 pr-3">Totals</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(q.data.totals.debit)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(q.data.totals.credit)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(q.data.totals.debit - q.data.totals.credit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      </PageBody>
    </AppShell>
  );
}
