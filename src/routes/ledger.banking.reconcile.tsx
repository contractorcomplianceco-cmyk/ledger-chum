import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listBankAccounts,
  listBankTransactions,
  listReconciliations,
  startReconciliation,
  completeReconciliation,
} from "@/lib/accounting/banking.functions";

export const Route = createFileRoute("/ledger/banking/reconcile")({
  head: () => ({
    meta: [
      { title: "Bank Reconciliation — LedgerOS" },
      {
        name: "description",
        content: "Reconcile bank statements to posted ledger activity with cleared-item tracking.",
      },
      { property: "og:title", content: "Bank Reconciliation — LedgerOS" },
      {
        property: "og:description",
        content: "Complete a bank reconciliation and lock the statement period.",
      },
    ],
  }),
  component: ReconcilePage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function ReconcilePage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const listAcc = useServerFn(listBankAccounts);
  const listTxn = useServerFn(listBankTransactions);
  const listRec = useServerFn(listReconciliations);
  const startFn = useServerFn(startReconciliation);
  const completeFn = useServerFn(completeReconciliation);

  const accounts = useQuery({
    queryKey: ["bank.accounts", orgId],
    queryFn: () => listAcc({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const [bankAccountId, setBankAccountId] = useState<string | undefined>();
  const activeId = bankAccountId ?? accounts.data?.[0]?.id;

  const [start, setStart] = useState("");
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [endingBalance, setEndingBalance] = useState("0");
  const [cleared, setCleared] = useState<Set<string>>(new Set());

  const txns = useQuery({
    queryKey: ["bank.txns.unmatched", orgId, activeId, start, end],
    queryFn: () =>
      listTxn({
        data: {
          orgId: orgId!,
          bankAccountId: activeId,
          from: start || undefined,
          to: end || undefined,
        },
      }),
    enabled: !!orgId && !!activeId,
  });

  const history = useQuery({
    queryKey: ["reconciliations", orgId, activeId],
    queryFn: () => listRec({ data: { orgId: orgId!, bankAccountId: activeId! } }),
    enabled: !!orgId && !!activeId,
  });

  const clearedSum = (txns.data ?? [])
    .filter((t) => cleared.has(t.id))
    .reduce((s, t) => s + Number(t.amount), 0);
  const diff = Number(endingBalance) - clearedSum;

  const complete = async () => {
    if (!orgId || !activeId) return;
    try {
      const rec = await startFn({
        data: {
          orgId,
          bankAccountId: activeId,
          startDate: start || end,
          endDate: end,
          statementEndingBalance: Number(endingBalance),
        },
      });
      await completeFn({
        data: {
          orgId,
          reconciliationId: rec.id,
          statementEndingBalance: Number(endingBalance),
          clearedBankTxnIds: Array.from(cleared),
        },
      });
      toast.success("Reconciliation completed");
      setCleared(new Set());
      qc.invalidateQueries({ queryKey: ["reconciliations", orgId, activeId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Banking"
        title="Reconcile bank account"
        description="Clear imported transactions until the difference against the statement is zero."
      />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="p-4 space-y-3">
            <div>
              <Label>Bank account</Label>
              <select
                className="w-full mt-1 h-9 rounded border bg-background px-2 text-sm"
                value={activeId ?? ""}
                onChange={(e) => setBankAccountId(e.target.value)}
              >
                {(accounts.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Statement start</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label>Statement end</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div>
              <Label>Statement ending balance</Label>
              <Input
                type="number"
                step="0.01"
                value={endingBalance}
                onChange={(e) => setEndingBalance(e.target.value)}
              />
            </div>
            <div className="border-t pt-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cleared</span>
                <span className="tabular-nums">{fmt(clearedSum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ending</span>
                <span className="tabular-nums">{fmt(Number(endingBalance) || 0)}</span>
              </div>
              <div
                className={`flex justify-between font-semibold ${Math.abs(diff) < 0.005 ? "text-emerald-600" : "text-destructive"}`}
              >
                <span>Difference</span>
                <span className="tabular-nums">{fmt(diff)}</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={complete}
              disabled={!activeId || cleared.size === 0}
            >
              Complete reconciliation
            </Button>
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-sm font-medium mb-2">Transactions in period</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-3 w-8"></th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Description</th>
                      <th className="py-2 pr-3 text-right">Amount</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(txns.data ?? []).map((t) => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-2 pr-3">
                          <input
                            type="checkbox"
                            checked={cleared.has(t.id)}
                            onChange={(e) =>
                              setCleared((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(t.id);
                                else next.delete(t.id);
                                return next;
                              })
                            }
                          />
                        </td>
                        <td className="py-2 pr-3 tabular-nums">{t.txn_date}</td>
                        <td className="py-2 pr-3">{t.description}</td>
                        <td
                          className={`py-2 pr-3 text-right tabular-nums ${Number(t.amount) < 0 ? "text-destructive" : ""}`}
                        >
                          {fmt(Number(t.amount))}
                        </td>
                        <td className="py-2 pr-3 capitalize text-muted-foreground">{t.status}</td>
                      </tr>
                    ))}
                    {(txns.data ?? []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No transactions in range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm font-medium mb-2">History</div>
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-3">Period</th>
                    <th className="py-2 pr-3 text-right">Ending</th>
                    <th className="py-2 pr-3 text-right">Cleared</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(history.data ?? []).map((h) => (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        {h.statement_start_date} → {h.statement_end_date}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {fmt(Number(h.statement_ending_balance))}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {fmt(Number(h.cleared_balance))}
                      </td>
                      <td className="py-2 pr-3 capitalize">{h.status}</td>
                    </tr>
                  ))}
                  {(history.data ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        No completed reconciliations yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </PageBody>
    </AppShell>
  );
}
