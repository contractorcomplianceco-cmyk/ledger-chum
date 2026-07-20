import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { isDemoMode } from "@/lib/app-mode";
import { useOrgId } from "@/hooks/use-current-org";
import { DEMO_PAYMENTS, type DemoPayment } from "@/lib/mock/payments";
import { DemoPaymentProvider } from "@/lib/payments/demo-provider";
import {
  CollectPaymentDialog,
  type CollectResult,
} from "@/components/payments/collect-payment-dialog";
import {
  listCustomerPayments,
  collectPayment,
  recordManualPayment,
} from "@/lib/accounting/customer-payments.functions";
import { listCustomers } from "@/lib/accounting/customers.functions";
import { listInvoices } from "@/lib/accounting/invoices.functions";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — LedgerOS" },
      { name: "description", content: "Incoming customer payments — collect, record, reconcile." },
      { property: "og:title", content: "Payments — LedgerOS" },
      {
        property: "og:description",
        content: "Collect card & ACH payments and record offline receipts.",
      },
    ],
  }),
  component: PaymentsPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const STATUS_TONE: Record<string, string> = {
  succeeded: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  failed: "bg-red-500/10 text-red-700 border-red-500/20",
  refunded: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  partially_refunded: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  authorized: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  voided: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

type Row = {
  id: string;
  date: string;
  customerName: string;
  invoiceNumber: string | null;
  method: string;
  status: string;
  amount: number;
  reference: string;
  type: string;
};

function PaymentsPage() {
  const orgId = useOrgId();
  const production = !isDemoMode() && !!orgId;

  return production ? <ProductionPayments orgId={orgId!} /> : <DemoPayments />;
}

/* ---------------------------- Demo (simulated) ---------------------------- */

function DemoPayments() {
  const [rows, setRows] = useState<DemoPayment[]>(DEMO_PAYMENTS);
  const [dialog, setDialog] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(r: CollectResult) {
    setBusy(true);
    try {
      let status: DemoPayment["status"] = "succeeded";
      let method: DemoPayment["method"];
      let reference = r.reference;

      if (r.mode === "gateway") {
        // Exercise the real DemoPaymentProvider decision logic client-side.
        const provider = new DemoPaymentProvider();
        const result = await provider.charge({
          amount: r.amount,
          currency: "USD",
          method: r.gatewayMethod,
          token: { token: r.token, method: r.gatewayMethod },
          customer: { id: "demo", name: r.customerName },
          invoiceRef: r.invoiceNumber || undefined,
          idempotencyKey: r.idempotencyKey,
        });
        if (!result.success) {
          toast.error(result.errorMessage ?? "Payment declined");
          setBusy(false);
          return;
        }
        status = result.status === "pending" ? "pending" : "succeeded";
        method = r.gatewayMethod;
        reference = result.providerTransactionId;
      } else {
        method = r.manualMethod;
      }

      setRows((prev) => [
        {
          id: `pay-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          customerName: r.customerName || "Walk-in customer",
          invoiceNumber: r.invoiceNumber || null,
          method,
          status,
          amount: r.amount,
          reference,
          type: r.mode === "gateway" ? "gateway" : "manual",
        },
        ...prev,
      ]);
      toast.success(
        status === "pending" ? "Payment submitted — awaiting settlement" : "Payment recorded",
      );
      setDialog(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PaymentsView
      rows={rows}
      onCollect={() => setDialog(true)}
      dialog={dialog}
      setDialog={setDialog}
      onSubmit={onSubmit}
      busy={busy}
      demo
    />
  );
}

/* --------------------------- Production (live) --------------------------- */

function ProductionPayments({ orgId }: { orgId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCustomerPayments);
  const customersFn = useServerFn(listCustomers);
  const invoicesFn = useServerFn(listInvoices);
  const collectFn = useServerFn(collectPayment);
  const manualFn = useServerFn(recordManualPayment);
  const [dialog, setDialog] = useState(false);

  const paymentsQ = useQuery({
    queryKey: ["customer.payments", orgId],
    queryFn: () => listFn({ data: { orgId } }),
  });
  const customersQ = useQuery({
    queryKey: ["customers.min", orgId],
    queryFn: () => customersFn({ data: { orgId } }),
  });
  const invoicesQ = useQuery({
    queryKey: ["invoices.min", orgId],
    queryFn: () => invoicesFn({ data: { orgId } }),
  });

  const rows: Row[] = useMemo(
    () =>
      (paymentsQ.data ?? []).map((p) => {
        const rec = p as typeof p & {
          customers?: { name?: string } | null;
          provider_txn_id?: string | null;
        };
        return {
          id: rec.id,
          date: rec.payment_date,
          customerName: rec.customers?.name ?? "—",
          invoiceNumber: null,
          method: rec.method ?? "—",
          status: rec.status ?? "succeeded",
          amount: Number(rec.amount),
          reference: rec.reference ?? rec.provider_txn_id ?? "",
          type: rec.payment_type ?? "manual",
        };
      }),
    [paymentsQ.data],
  );

  const collectMut = useMutation({
    mutationFn: async (r: CollectResult) => {
      const customer = (customersQ.data ?? []).find(
        (c) => (c as { name?: string }).name?.toLowerCase() === r.customerName.toLowerCase(),
      ) as { id?: string } | undefined;
      if (!customer?.id) {
        throw new Error(`Unknown customer "${r.customerName}". Pick an existing customer.`);
      }
      const invoice = r.invoiceNumber
        ? ((invoicesQ.data ?? []).find(
            (i) =>
              (i as { invoice_number?: string }).invoice_number?.toLowerCase() ===
              r.invoiceNumber.toLowerCase(),
          ) as { id?: string } | undefined)
        : undefined;

      if (r.mode === "gateway") {
        const res = await collectFn({
          data: {
            orgId,
            customerId: customer.id,
            amount: r.amount,
            currency: "USD",
            method: r.gatewayMethod,
            token: r.token,
            invoiceId: invoice?.id,
            idempotencyKey: r.idempotencyKey,
          },
        });
        if (!res.ok) throw new Error(res.errorMessage ?? "Payment declined");
        return res;
      }
      return manualFn({
        data: {
          orgId,
          customerId: customer.id,
          amount: r.amount,
          currency: "USD",
          method: r.manualMethod,
          reference: r.reference || undefined,
          paymentDate: new Date().toISOString().slice(0, 10),
          invoiceId: invoice?.id,
        },
      });
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      setDialog(false);
      qc.invalidateQueries({ queryKey: ["customer.payments", orgId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to record payment"),
  });

  return (
    <PaymentsView
      rows={rows}
      loading={paymentsQ.isLoading}
      onCollect={() => setDialog(true)}
      dialog={dialog}
      setDialog={setDialog}
      onSubmit={(r) => collectMut.mutate(r)}
      busy={collectMut.isPending}
    />
  );
}

/* -------------------------------- Shared -------------------------------- */

function PaymentsView({
  rows,
  loading,
  onCollect,
  dialog,
  setDialog,
  onSubmit,
  busy,
  demo,
}: {
  rows: Row[];
  loading?: boolean;
  onCollect: () => void;
  dialog: boolean;
  setDialog: (v: boolean) => void;
  onSubmit: (r: CollectResult) => void;
  busy?: boolean;
  demo?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [method, setMethod] = useState<string>("all");

  const filtered = rows.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (method !== "all" && r.method !== method) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !r.customerName.toLowerCase().includes(q) &&
        !(r.invoiceNumber ?? "").toLowerCase().includes(q) &&
        !r.reference.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const total = filtered
    .filter((r) => r.status === "succeeded" || r.status === "pending")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Receivables"
        title="Payments"
        description="Incoming customer payments — collect card & ACH, record offline receipts, and reconcile settlements."
        actions={
          <Button onClick={onCollect}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Collect payment
          </Button>
        }
      />
      <PageBody>
        {demo && (
          <div className="mb-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
            Demo mode — simulated payments. Set <code>VITE_APP_MODE=production</code> to process
            live via the configured gateway.
          </div>
        )}

        <Card className="border border-border/70 bg-surface p-4 shadow-card">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, invoice, reference"
                className="w-64 pl-8"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="ach">ACH</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="wire">Wire</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto text-[12.5px] text-muted-foreground">
              {filtered.length} payment{filtered.length === 1 ? "" : "s"} ·{" "}
              <span className="font-semibold text-foreground">{fmt(total)}</span> received
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border/60">
            <table className="w-full text-[13px]">
              <thead className="bg-muted/40 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Invoice</th>
                  <th className="px-3 py-2 text-left">Method</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Reference</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      Loading payments…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      <CreditCard className="mx-auto mb-2 h-6 w-6 opacity-40" />
                      No payments match your filters.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-3 py-2 font-tabular text-muted-foreground">{r.date}</td>
                    <td className="px-3 py-2 font-medium text-foreground">{r.customerName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.invoiceNumber ?? "—"}</td>
                    <td className="px-3 py-2 capitalize text-foreground">{r.method}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant="outline"
                        className={STATUS_TONE[r.status] ?? "bg-muted text-muted-foreground"}
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-tabular text-[12px] text-muted-foreground">
                      {r.reference || "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-tabular font-semibold text-foreground">
                      {fmt(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>

      <CollectPaymentDialog
        open={dialog}
        onOpenChange={setDialog}
        onSubmit={onSubmit}
        submitting={busy}
      />
    </AppShell>
  );
}
