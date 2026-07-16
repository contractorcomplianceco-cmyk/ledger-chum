import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrgId } from "@/hooks/use-current-org";
import { listBills, postBill } from "@/lib/accounting/bills.functions";
import { listVendors } from "@/lib/accounting/vendors.functions";
import { listAccountTree } from "@/lib/accounting/accounts.functions";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts-payable/bills")({
  head: () => ({
    meta: [
      { title: "Bills — LedgerOS" },
      {
        name: "description",
        content: "Vendor bills with fiscal-period checks, balanced posting, and audit trail.",
      },
      { property: "og:title", content: "Bills — LedgerOS" },
      {
        property: "og:description",
        content: "Post vendor bills and drive the accounts-payable ledger.",
      },
    ],
  }),
  component: BillsPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

type LineDraft = {
  accountId: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  open: "Open",
  partial: "Partial",
  paid: "Paid",
  void: "Void",
};

function BillsPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const listFn = useServerFn(listBills);
  const vendorsFn = useServerFn(listVendors);
  const accountsFn = useServerFn(listAccountTree);
  const postFn = useServerFn(postBill);

  const [newOpen, setNewOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(addDays(today(), 30));
  const [memo, setMemo] = useState("");
  const [taxStr, setTaxStr] = useState("0");
  const [lines, setLines] = useState<LineDraft[]>([
    { accountId: "", description: "", quantity: "1", unitPrice: "" },
  ]);

  const billsQ = useQuery({
    queryKey: ["ap.bills", orgId],
    queryFn: () => listFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const vendorsQ = useQuery({
    queryKey: ["ap.vendors.simple", orgId],
    queryFn: () => vendorsFn({ data: { orgId: orgId!, status: "active" } }),
    enabled: !!orgId,
  });
  const accountsQ = useQuery({
    queryKey: ["accounts.tree", orgId],
    queryFn: () => accountsFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });

  const expenseAccounts = useMemo(
    () => (accountsQ.data ?? []).filter((a) => a.type === "expense" && a.is_active && a.account_id),
    [accountsQ.data],
  );

  const lineAmounts = lines.map((l) => {
    const q = Number(l.quantity) || 0;
    const p = Number(l.unitPrice) || 0;
    return Math.round(q * p * 100) / 100;
  });
  const subtotal = lineAmounts.reduce((a, b) => a + b, 0);
  const tax = Number(taxStr) || 0;
  const total = Math.round((subtotal + tax) * 100) / 100;
  const canPost =
    !!vendorId &&
    !!billNumber &&
    lines.length > 0 &&
    lines.every((l, i) => l.accountId && lineAmounts[i] > 0) &&
    total > 0;

  const reset = () => {
    setVendorId("");
    setBillNumber("");
    setMemo("");
    setTaxStr("0");
    setIssueDate(today());
    setDueDate(addDays(today(), 30));
    setLines([{ accountId: "", description: "", quantity: "1", unitPrice: "" }]);
  };

  const postMut = useMutation({
    mutationFn: async () => {
      return await postFn({
        data: {
          orgId: orgId!,
          vendorId,
          billNumber,
          issueDate,
          dueDate,
          memo,
          tax,
          lines: lines.map((l, i) => ({
            accountId: l.accountId,
            description: l.description,
            quantity: Number(l.quantity) || 0,
            unitPrice: Number(l.unitPrice) || 0,
            amount: lineAmounts[i],
          })),
        },
      });
    },
    onSuccess: (res) => {
      toast.success(`Bill posted — journal ${res.journal_id.slice(0, 8)}…`);
      setNewOpen(false);
      reset();
      qc.invalidateQueries({ queryKey: ["ap.bills"] });
      qc.invalidateQueries({ queryKey: ["ap.vendorBalances"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <PageHeader
        title="Bills"
        description="Vendor bills post a balanced DR expense / CR AP journal within an open fiscal period."
        actions={
          <Button onClick={() => setNewOpen(true)} disabled={!orgId}>
            <Plus className="mr-1 size-4" /> New bill
          </Button>
        }
      />
      <PageBody>
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2 pr-3">Bill #</th>
                  <th className="py-2 pr-3">Vendor</th>
                  <th className="py-2 pr-3">Issued</th>
                  <th className="py-2 pr-3">Due</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Total</th>
                  <th className="py-2 pr-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(billsQ.data ?? []).map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 pr-3 font-medium">{b.bill_number}</td>
                    <td className="py-2 pr-3">
                      {(b as { vendors?: { name?: string } | null }).vendors?.name ?? "—"}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{b.issue_date}</td>
                    <td className="py-2 pr-3 tabular-nums">{b.due_date}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={b.status === "paid" ? "default" : "secondary"}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(Number(b.total))}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(Number(b.balance))}</td>
                  </tr>
                ))}
                {billsQ.data && billsQ.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No bills yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>New bill</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vendor</Label>
                  <Select value={vendorId} onValueChange={setVendorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {(vendorsQ.data ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bill #</Label>
                  <Input value={billNumber} onChange={(e) => setBillNumber(e.target.value)} />
                </div>
                <div>
                  <Label>Issue date</Label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Due date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Lines</Label>
                <div className="space-y-2">
                  {lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Select
                          value={l.accountId}
                          onValueChange={(v) => {
                            const next = [...lines];
                            next[i] = { ...next[i], accountId: v };
                            setLines(next);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Expense account" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseAccounts.map((a) => (
                              <SelectItem key={a.account_id!} value={a.account_id!}>
                                {a.code} · {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Description"
                          value={l.description}
                          onChange={(e) => {
                            const next = [...lines];
                            next[i] = { ...next[i], description: e.target.value };
                            setLines(next);
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          inputMode="decimal"
                          placeholder="Qty"
                          value={l.quantity}
                          onChange={(e) => {
                            const next = [...lines];
                            next[i] = { ...next[i], quantity: e.target.value };
                            setLines(next);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          inputMode="decimal"
                          placeholder="Unit price"
                          value={l.unitPrice}
                          onChange={(e) => {
                            const next = [...lines];
                            next[i] = { ...next[i], unitPrice: e.target.value };
                            setLines(next);
                          }}
                        />
                      </div>
                      <div className="col-span-1 text-right tabular-nums text-sm py-2">
                        {fmt(lineAmounts[i])}
                      </div>
                      <div className="col-span-1 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={lines.length === 1}
                          onClick={() => setLines(lines.filter((_, j) => j !== i))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() =>
                    setLines([
                      ...lines,
                      { accountId: "", description: "", quantity: "1", unitPrice: "" },
                    ])
                  }
                >
                  <Plus className="mr-1 size-4" /> Add line
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tax</Label>
                  <Input
                    inputMode="decimal"
                    value={taxStr}
                    onChange={(e) => setTaxStr(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Memo</Label>
                  <Textarea rows={2} value={memo} onChange={(e) => setMemo(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-4 border-t pt-3 text-sm">
                <div>
                  Subtotal <span className="tabular-nums font-medium ml-2">{fmt(subtotal)}</span>
                </div>
                <div>
                  Tax <span className="tabular-nums font-medium ml-2">{fmt(tax)}</span>
                </div>
                <div>
                  Total <span className="tabular-nums font-semibold ml-2">{fmt(total)}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!canPost || postMut.isPending} onClick={() => postMut.mutate()}>
                {postMut.isPending ? "Posting…" : "Post bill"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageBody>
    </AppShell>
  );
}
