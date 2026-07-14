import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOrgId } from "@/hooks/use-current-org";
import { listBillPayments, recordVendorPayment } from "@/lib/accounting/bill-payments.functions";
import { listVendors } from "@/lib/accounting/vendors.functions";
import { listBills } from "@/lib/accounting/bills.functions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts-payable/payments")({
  head: () => ({
    meta: [
      { title: "Vendor Payments — LedgerOS" },
      { name: "description", content: "Record vendor payments and allocate them across open bills." },
      { property: "og:title", content: "Vendor Payments — LedgerOS" },
      { property: "og:description", content: "Post DR AP / CR Cash journals for outgoing vendor payments." },
    ],
  }),
  component: VendorPaymentsPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);

function VendorPaymentsPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const listFn = useServerFn(listBillPayments);
  const vendorsFn = useServerFn(listVendors);
  const billsFn = useServerFn(listBills);
  const payFn = useServerFn(recordVendorPayment);

  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [date, setDate] = useState(today());
  const [method, setMethod] = useState("default");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [alloc, setAlloc] = useState<Record<string, string>>({});

  const paymentsQ = useQuery({
    queryKey: ["ap.payments", orgId],
    queryFn: () => listFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const vendorsQ = useQuery({
    queryKey: ["ap.vendors.simple", orgId],
    queryFn: () => vendorsFn({ data: { orgId: orgId!, status: "active" } }),
    enabled: !!orgId,
  });
  const openBillsQ = useQuery({
    queryKey: ["ap.bills.openForVendor", orgId, vendorId],
    queryFn: () => billsFn({ data: { orgId: orgId!, vendorId } }),
    enabled: !!orgId && !!vendorId,
  });

  const openBills = useMemo(
    () => (openBillsQ.data ?? []).filter((b) => Number(b.balance) > 0 && b.status !== "void"),
    [openBillsQ.data],
  );
  const allocTotal = Object.values(alloc).reduce((a, s) => a + (Number(s) || 0), 0);
  const amt = Number(amount) || 0;
  const canPost = !!vendorId && amt > 0 && allocTotal <= amt + 0.005;

  const reset = () => {
    setVendorId(""); setDate(today()); setMethod("default"); setReference("");
    setAmount(""); setMemo(""); setAlloc({});
  };

  const postMut = useMutation({
    mutationFn: async () => {
      return await payFn({
        data: {
          orgId: orgId!,
          vendorId,
          paymentDate: date,
          method,
          reference,
          amount: amt,
          memo,
          applyTo: Object.entries(alloc)
            .map(([billId, s]) => ({ billId, amount: Number(s) || 0 }))
            .filter((a) => a.amount > 0),
        },
      });
    },
    onSuccess: (res) => {
      toast.success(
        `Payment recorded — unapplied ${fmt(Number(res.unapplied_amount ?? 0))}`,
      );
      setOpen(false); reset();
      qc.invalidateQueries({ queryKey: ["ap.payments"] });
      qc.invalidateQueries({ queryKey: ["ap.bills"] });
      qc.invalidateQueries({ queryKey: ["ap.vendorBalances"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <PageHeader
        title="Vendor Payments"
        description="Every payment posts DR Accounts Payable / CR Cash and re-derives each allocated bill's status."
        actions={
          <Button onClick={() => setOpen(true)} disabled={!orgId}>
            <Plus className="mr-1 size-4" /> Record payment
          </Button>
        }
      />
      <PageBody>
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Vendor</th>
                  <th className="py-2 pr-3">Method</th>
                  <th className="py-2 pr-3">Reference</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2 pr-3 text-right">Unapplied</th>
                </tr>
              </thead>
              <tbody>
                {(paymentsQ.data ?? []).map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 pr-3 tabular-nums">{p.payment_date}</td>
                    <td className="py-2 pr-3">
                      {(p as { vendors?: { name?: string } | null }).vendors?.name ?? "—"}
                    </td>
                    <td className="py-2 pr-3">{p.method ?? "—"}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{p.reference ?? "—"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(Number(p.amount))}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(Number(p.unapplied_amount))}</td>
                  </tr>
                ))}
                {paymentsQ.data && paymentsQ.data.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No payments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Record vendor payment</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vendor</Label>
                  <Select value={vendorId} onValueChange={(v) => { setVendorId(v); setAlloc({}); }}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>
                      {(vendorsQ.data ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Method</Label>
                  <Input value={method} onChange={(e) => setMethod(e.target.value)} />
                </div>
                <div>
                  <Label>Reference</Label>
                  <Input value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div>
                  <Label>Memo</Label>
                  <Textarea rows={1} value={memo} onChange={(e) => setMemo(e.target.value)} />
                </div>
              </div>

              {vendorId && (
                <div>
                  <Label>Apply to open bills</Label>
                  {openBills.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">No open bills for this vendor.</div>
                  ) : (
                    <div className="space-y-2">
                      {openBills.map((b) => (
                        <div key={b.id} className="grid grid-cols-12 gap-2 items-center text-sm">
                          <div className="col-span-3 font-medium">{b.bill_number}</div>
                          <div className="col-span-3 text-muted-foreground">Due {b.due_date}</div>
                          <div className="col-span-3 text-right tabular-nums">{fmt(Number(b.balance))}</div>
                          <div className="col-span-3">
                            <Input
                              inputMode="decimal" placeholder="0.00"
                              value={alloc[b.id] ?? ""}
                              onChange={(e) => setAlloc({ ...alloc, [b.id]: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-4 border-t pt-2 mt-2 text-sm">
                    <div>Applied <span className="tabular-nums font-medium ml-2">{fmt(allocTotal)}</span></div>
                    <div>Unapplied <span className="tabular-nums font-medium ml-2">{fmt(Math.max(0, amt - allocTotal))}</span></div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={!canPost || postMut.isPending} onClick={() => postMut.mutate()}>
                {postMut.isPending ? "Posting…" : "Post payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageBody>
    </AppShell>
  );
}
