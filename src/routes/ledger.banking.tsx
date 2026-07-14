import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useOrgId } from "@/hooks/use-current-org";
import { listAccountTree } from "@/lib/accounting/accounts.functions";
import {
  listBankAccounts, createBankAccount,
  listBankTransactions, importBankTransactions,
} from "@/lib/accounting/banking.functions";

export const Route = createFileRoute("/ledger/banking")({
  head: () => ({
    meta: [
      { title: "Banking — LedgerOS" },
      { name: "description", content: "Bank accounts and imported transactions from the LedgerOS posting engine." },
      { property: "og:title", content: "Banking — LedgerOS" },
      { property: "og:description", content: "Manage bank accounts, import CSV transactions, and reconcile." },
    ],
  }),
  component: BankingPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/** Parse a simple CSV: expects header row with date,description,amount[,reference,external_id]. */
function parseCsv(text: string): Array<{ txnDate: string; description: string; amount: number; reference?: string; externalId?: string }> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const dCol = idx("date");
  const descCol = idx("description");
  const amtCol = idx("amount");
  const refCol = idx("reference");
  const extCol = idx("external_id");
  if (dCol < 0 || descCol < 0 || amtCol < 0) throw new Error("CSV must have headers: date, description, amount");
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    return {
      txnDate: cells[dCol]?.trim() ?? "",
      description: cells[descCol]?.trim() ?? "",
      amount: Number(cells[amtCol]?.trim() ?? "0"),
      reference: refCol >= 0 ? cells[refCol]?.trim() : undefined,
      externalId: extCol >= 0 ? cells[extCol]?.trim() : undefined,
    };
  }).filter((r) => r.txnDate && r.description && !Number.isNaN(r.amount));
}

function BankingPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const listFn = useServerFn(listBankAccounts);
  const listTxnFn = useServerFn(listBankTransactions);
  const createFn = useServerFn(createBankAccount);
  const listAccFn = useServerFn(listAccountTree);
  const importFn = useServerFn(importBankTransactions);

  const accounts = useQuery({
    queryKey: ["bank.accounts", orgId],
    queryFn: () => listFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });

  const [selected, setSelected] = useState<string | undefined>();
  const activeAccountId = selected ?? accounts.data?.[0]?.id;

  const txns = useQuery({
    queryKey: ["bank.txns", orgId, activeAccountId],
    queryFn: () => listTxnFn({ data: { orgId: orgId!, bankAccountId: activeAccountId } }),
    enabled: !!orgId && !!activeAccountId,
  });

  const chart = useQuery({
    queryKey: ["accounts.tree", orgId],
    queryFn: () => listAccFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const cashAccounts = useMemo(
    () => (chart.data ?? []).filter((a) => a.type === "asset" && a.is_active),
    [chart.data],
  );

  // Create account dialog
  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState({ name: "", bankName: "", last4: "", glAccountId: "", openingBalance: "0" });

  const submitNew = async () => {
    if (!orgId || !form.name || !form.glAccountId) return;
    try {
      await createFn({ data: {
        orgId, glAccountId: form.glAccountId, name: form.name,
        bankName: form.bankName || undefined, last4: form.last4 || undefined,
        openingBalance: Number(form.openingBalance) || 0,
      }});
      toast.success("Bank account created");
      setOpenNew(false);
      setForm({ name: "", bankName: "", last4: "", glAccountId: "", openingBalance: "0" });
      qc.invalidateQueries({ queryKey: ["bank.accounts", orgId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  // CSV import
  const fileRef = useRef<HTMLInputElement>(null);
  const onImport = async (file: File) => {
    if (!orgId || !activeAccountId) return;
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) throw new Error("No valid rows");
      const res = await importFn({ data: { orgId, bankAccountId: activeAccountId, sourceSystem: "csv_import", rows } });
      toast.success(`Imported ${res.imported} of ${res.requested} transactions`);
      qc.invalidateQueries({ queryKey: ["bank.txns", orgId, activeAccountId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Banking"
        title="Bank accounts"
        description="Live accounts linked to GL cash accounts. Import CSVs and match to journal lines."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={!activeAccountId}>Import CSV</Button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
            <Button size="sm" onClick={() => setOpenNew(true)}>New account</Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="p-3">
            <div className="text-xs uppercase text-muted-foreground mb-2 px-2">Accounts</div>
            <div className="space-y-1">
              {(accounts.data ?? []).map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  className={`w-full text-left px-2 py-2 rounded text-sm hover:bg-muted ${activeAccountId === a.id ? "bg-muted font-medium" : ""}`}
                >
                  <div>{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.bank_name ?? "—"}{a.account_number_last4 ? ` ····${a.account_number_last4}` : ""}
                  </div>
                </button>
              ))}
              {(accounts.data ?? []).length === 0 && (
                <div className="text-sm text-muted-foreground p-3">No bank accounts yet.</div>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Recent transactions</div>
              <Link to="/ledger/banking/reconcile" className="text-sm text-primary hover:underline">Reconcile →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Description</th>
                    <th className="py-2 pr-3">Ref</th>
                    <th className="py-2 pr-3 text-right">Amount</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(txns.data ?? []).map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 tabular-nums">{t.txn_date}</td>
                      <td className="py-2 pr-3">{t.description}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{t.reference ?? "—"}</td>
                      <td className={`py-2 pr-3 text-right tabular-nums ${Number(t.amount) < 0 ? "text-destructive" : ""}`}>{fmt(Number(t.amount))}</td>
                      <td className="py-2 pr-3 capitalize">{t.status}</td>
                    </tr>
                  ))}
                  {(txns.data ?? []).length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No transactions. Import a CSV to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogContent>
            <DialogHeader><DialogTitle>New bank account</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Bank name</Label><Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></div>
              <div><Label>Last 4</Label><Input maxLength={4} value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} /></div>
              <div>
                <Label>Linked GL account (cash asset)</Label>
                <Select value={form.glAccountId} onValueChange={(v) => setForm({ ...form, glAccountId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick a cash account" /></SelectTrigger>
                  <SelectContent>
                    {cashAccounts.map((a) => (
                      <SelectItem key={a.account_id} value={a.account_id}>{a.code} · {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Opening balance</Label><Input type="number" step="0.01" value={form.openingBalance} onChange={(e) => setForm({ ...form, openingBalance: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpenNew(false)}>Cancel</Button>
                <Button onClick={submitNew} disabled={!form.name || !form.glAccountId}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageBody>
    </AppShell>
  );
}
