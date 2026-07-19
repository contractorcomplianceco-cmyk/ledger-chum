import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllocationPreviewCard } from "@/components/invoicing/allocation-preview-card";
import { MarginPreviewCard } from "@/components/invoicing/margin-preview-card";
import { InvoiceTimeline } from "@/components/invoicing/invoice-timeline";
import { PaymentLikelihoodChip } from "@/components/invoicing/payment-likelihood-chip";
import { TreatmentBadge } from "@/components/cash/treatment-badge";
import { InvoiceDocument } from "@/components/invoicing/invoice-document";
import {
  CUSTOMERS,
  INVOICES,
  computeInvoice,
  LIKELIHOOD_META,
  type Invoice,
  type InvoiceLine,
  type PaymentLikelihood,
} from "@/lib/mock/invoicing";
import { TREATMENT_META, type Treatment } from "@/lib/mock/cash-availability";
import { currencyPrecise } from "@/lib/mock/finance";
import { fromInvoiceRow, fromMockInvoice, type InvoiceRow } from "@/lib/invoicing/invoice-document";
import { printInvoiceDocument } from "@/lib/invoicing/print-invoice";
import { CLASSIC_THEME, type InvoiceStyle } from "@/lib/invoicing/invoice-theme";
import { InvoiceStylePanel } from "@/components/invoicing/invoice-style-panel";
import { useBrandStyle } from "@/lib/invoicing/brand-style-store";
import { isProductionMode } from "@/lib/app-mode";
import { getInvoice } from "@/lib/accounting/invoices.functions";
import {
  ArrowLeft,
  Paperclip,
  Send,
  Download,
  Printer,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/invoices/$invoiceId")({
  head: ({ params }) => ({
    meta: [
      { title: `Invoice ${params.invoiceId} — LedgerOS` },
      {
        name: "description",
        content: "Client-facing invoice document with internal allocation & payment intelligence.",
      },
    ],
  }),
  component: InvoiceDetailPage,
});

function NotFound() {
  return (
    <div className="p-8">
      <div className="text-lg font-semibold">Invoice not found</div>
      <p className="mt-1 text-sm text-muted-foreground">
        This invoice may have been deleted or the link is out of date.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-3">
        <Link to="/invoices">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to invoices
        </Link>
      </Button>
    </div>
  );
}

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams();
  const production = isProductionMode();
  const printRef = useRef<HTMLDivElement>(null);

  // Style seam (Phase B). Active style = per-invoice override, else the saved
  // company brand default, else Classic. Numbers/content are independent of this.
  const { brandStyle, save: saveBrand, canSave } = useBrandStyle();
  const [override, setOverride] = useState<InvoiceStyle | null>(null);
  const activeStyle = override ?? brandStyle ?? CLASSIC_THEME;

  // Data-mode seam (Phase 1): production reads the live invoice via the real
  // server function; demo renders the mock fixture. Mock data never renders in
  // production because the mock branch is not consulted when `production` is true.
  const getInvoiceFn = useServerFn(getInvoice);
  const liveQuery = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => getInvoiceFn({ data: { id: invoiceId } }),
    enabled: production,
    retry: false,
  });

  const doPrint = () => printInvoiceDocument(printRef.current, activeStyle.paper);

  const stylePanel = (
    <InvoiceStylePanel
      style={activeStyle}
      onChange={setOverride}
      onSaveBrand={saveBrand}
      canSaveBrand={canSave}
    />
  );

  const header = (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/invoices">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to invoices
        </Link>
      </Button>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={doPrint}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
        </Button>
        <Button variant="outline" size="sm" onClick={doPrint}>
          <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Payment reminders arrive in a later phase"
        >
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Remind
        </Button>
        <Button size="sm" disabled title="Payment recording arrives in a later phase">
          <Send className="mr-1.5 h-3.5 w-3.5" /> Record payment
        </Button>
      </div>
    </div>
  );

  if (production) {
    if (liveQuery.isPending) {
      return (
        <div className="space-y-4">
          {header}
          <Card className="border border-border/70 bg-surface p-8 text-sm text-muted-foreground shadow-card">
            Loading invoice…
          </Card>
        </div>
      );
    }
    const row = liveQuery.data as InvoiceRow | null | undefined;
    if (liveQuery.isError || !row) return <NotFound />;
    const data = fromInvoiceRow(row);
    return (
      <div className="space-y-4">
        {header}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div ref={printRef}>
            <InvoiceDocument data={data} style={activeStyle} />
          </div>
          {stylePanel}
        </div>
      </div>
    );
  }

  const inv: Invoice | undefined = INVOICES.find((i) => i.id === invoiceId);
  if (!inv) return <NotFound />;

  const customer = CUSTOMERS.find((c) => c.id === inv.customerId);
  const doc = fromMockInvoice(inv, customer);
  const c = computeInvoice(inv.lines);
  const balance = c.total - inv.paid;
  const lk = LIKELIHOOD_META[inv.likelihood as PaymentLikelihood];

  return (
    <div className="space-y-4">
      {header}

      <Tabs defaultValue="document" className="space-y-4">
        <TabsList>
          <TabsTrigger value="document">Invoice</TabsTrigger>
          <TabsTrigger value="internal">Internal (CCA)</TabsTrigger>
        </TabsList>

        <TabsContent value="document">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div ref={printRef}>
              <InvoiceDocument data={doc} style={activeStyle} />
            </div>
            {stylePanel}
          </div>
        </TabsContent>

        <TabsContent value="internal">
          <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-[12px] text-warning">
            Internal view — allocation, margin, and payment intelligence. Never shown to the client.
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <Card className="border border-border/70 bg-surface p-4 shadow-card">
                <div className="text-[13.5px] font-semibold text-foreground">
                  Line items · treatment & GL
                </div>
                <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
                  <table className="w-full text-[13px]">
                    <thead className="bg-muted/40 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Service</th>
                        <th className="px-2 py-2 text-left">Treatment</th>
                        <th className="px-2 py-2 text-left">GL</th>
                        <th className="px-2 py-2 text-right">Qty</th>
                        <th className="px-2 py-2 text-right">Rate</th>
                        <th className="px-2 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {inv.lines.map((l: InvoiceLine) => {
                        const meta = TREATMENT_META[l.treatment as Treatment];
                        const total = l.qty * l.rate - l.discount + l.tax;
                        return (
                          <tr key={l.id}>
                            <td className="px-3 py-2">
                              <div className="font-medium text-foreground">{l.service}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {[l.department, l.jurisdiction, l.commissionOwner]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <TreatmentBadge spendability={meta.spendability} />
                            </td>
                            <td className="px-2 py-2 text-[11.5px] text-muted-foreground">
                              {meta.glAccount}
                            </td>
                            <td className="px-2 py-2 text-right font-tabular text-foreground">
                              {l.qty}
                            </td>
                            <td className="px-2 py-2 text-right font-tabular text-foreground">
                              {currencyPrecise(l.rate)}
                            </td>
                            <td className="px-2 py-2 text-right font-tabular font-semibold text-foreground">
                              {currencyPrecise(total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/30 text-[13px]">
                      <tr>
                        <td colSpan={5} className="px-3 py-3 text-right text-[14px] font-semibold">
                          Total
                        </td>
                        <td className="px-2 py-3 text-right font-tabular text-[16px] font-bold">
                          {currencyPrecise(c.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="mt-3 text-[12px] text-muted-foreground">
                  Paid {currencyPrecise(inv.paid)} · Balance {currencyPrecise(balance)}
                </div>
              </Card>

              <Card className="border border-border/70 bg-surface p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <div className="text-[13.5px] font-semibold text-foreground">
                    Payment likelihood
                  </div>
                  <PaymentLikelihoodChip likelihood={inv.likelihood} className="ml-auto" />
                </div>
                <div className="mt-2 text-[12.5px] text-muted-foreground">{lk.label}</div>
                <ul className="mt-3 space-y-1.5 text-[12.5px]">
                  {inv.likelihoodReasons.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                      <span className="text-foreground/80">{r}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground">
                  Advisory — this score guides prioritization, not decisions.
                </div>
              </Card>

              <InvoiceTimeline events={inv.timeline} />
            </div>

            <aside className="space-y-4">
              <AllocationPreviewCard lines={inv.lines} />
              <MarginPreviewCard invoice={inv} />

              <Card className="border border-border/70 bg-surface p-4 shadow-card">
                <div className="text-[13.5px] font-semibold text-foreground">Customer</div>
                {customer && (
                  <div className="mt-2 space-y-1 text-[12.5px]">
                    <div className="font-medium text-foreground">{customer.name}</div>
                    <div className="text-muted-foreground">
                      {customer.primaryContact} · {customer.email}
                    </div>
                    <div className="text-muted-foreground">{customer.phone}</div>
                    <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                      <Link to="/customers/$customerId" params={{ customerId: customer.id }}>
                        Open customer profile
                      </Link>
                    </Button>
                  </div>
                )}
              </Card>

              <Card className="border border-border/70 bg-surface p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <div className="text-[13.5px] font-semibold text-foreground">Attachments</div>
                  <span className="ml-auto text-[11.5px] text-muted-foreground">
                    {inv.attachments}
                  </span>
                </div>
                <div className="mt-2 text-[12px] text-muted-foreground">
                  {inv.attachments === 0
                    ? "No supporting documents"
                    : `${inv.attachments} supporting document${inv.attachments === 1 ? "" : "s"} uploaded`}
                </div>
              </Card>
            </aside>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
