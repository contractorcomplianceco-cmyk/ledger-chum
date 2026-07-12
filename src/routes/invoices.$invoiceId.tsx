import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AllocationPreviewCard } from "@/components/invoicing/allocation-preview-card";
import { MarginPreviewCard } from "@/components/invoicing/margin-preview-card";
import { InvoiceTimeline } from "@/components/invoicing/invoice-timeline";
import { InvoiceStatusBadge } from "@/components/invoicing/invoice-status-badge";
import { PaymentLikelihoodChip } from "@/components/invoicing/payment-likelihood-chip";
import { TreatmentBadge } from "@/components/cash/treatment-badge";
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
import { ArrowLeft, Paperclip, Send, Download, MessageSquare, Sparkles } from "lucide-react";

export const Route = createFileRoute("/invoices/$invoiceId")({
  head: ({ params }) => ({
    meta: [
      { title: `Invoice ${params.invoiceId} — LedgerOS` },
      { name: "description", content: "Invoice detail with allocation, margin, and payment intelligence." },
    ],
  }),
  component: InvoiceDetailPage,
});

function InvoiceDetailPage() {
  const { invoice: inv, customer } = Route.useLoaderData();
  const c = computeInvoice(inv.lines);
  const balance = c.total - inv.paid;
  const lk = LIKELIHOOD_META[inv.likelihood];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/invoices"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to invoices</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" /> PDF</Button>
          <Button variant="outline" size="sm"><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Remind</Button>
          <Button size="sm"><Send className="mr-1.5 h-3.5 w-3.5" /> Record payment</Button>
        </div>
      </div>

      <Card className="border border-border/70 bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {inv.terms} · Issued {inv.issued} · Due {inv.due}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[24px] font-bold text-foreground">
              {inv.number}
              <InvoiceStatusBadge status={inv.status} />
            </div>
            <div className="mt-1 text-[14px] text-muted-foreground">
              {inv.customerName}{inv.notes ? ` · ${inv.notes}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total</div>
            <div className="font-tabular text-[28px] font-bold text-foreground">{currencyPrecise(c.total)}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">
              Paid {currencyPrecise(inv.paid)} · Balance {currencyPrecise(balance)}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card className="border border-border/70 bg-surface p-4 shadow-card">
            <div className="text-[13.5px] font-semibold text-foreground">Line items</div>
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
                  {inv.lines.map((l) => {
                    const meta = TREATMENT_META[l.treatment];
                    const total = l.qty * l.rate - l.discount + l.tax;
                    return (
                      <tr key={l.id}>
                        <td className="px-3 py-2">
                          <div className="font-medium text-foreground">{l.service}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {[l.department, l.jurisdiction, l.commissionOwner].filter(Boolean).join(" · ")}
                          </div>
                        </td>
                        <td className="px-2 py-2"><TreatmentBadge spendability={meta.spendability} /></td>
                        <td className="px-2 py-2 text-[11.5px] text-muted-foreground">{meta.glAccount}</td>
                        <td className="px-2 py-2 text-right font-tabular text-foreground">{l.qty}</td>
                        <td className="px-2 py-2 text-right font-tabular text-foreground">{currencyPrecise(l.rate)}</td>
                        <td className="px-2 py-2 text-right font-tabular font-semibold text-foreground">{currencyPrecise(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/30 text-[13px]">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right text-muted-foreground">Subtotal</td>
                    <td className="px-2 py-2 text-right font-tabular font-semibold">{currencyPrecise(c.subtotal)}</td>
                  </tr>
                  {c.discount > 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right text-muted-foreground">Discount</td>
                      <td className="px-2 py-2 text-right font-tabular">−{currencyPrecise(c.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={5} className="px-3 py-3 text-right text-[14px] font-semibold">Total</td>
                    <td className="px-2 py-3 text-right font-tabular text-[16px] font-bold">{currencyPrecise(c.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <Card className="border border-border/70 bg-surface p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <div className="text-[13.5px] font-semibold text-foreground">Payment likelihood</div>
              <PaymentLikelihoodChip likelihood={inv.likelihood} className="ml-auto" />
            </div>
            <div className="mt-2 text-[12.5px] text-muted-foreground">{lk.label}</div>
            <ul className="mt-3 space-y-1.5 text-[12.5px]">
              {inv.likelihoodReasons.map((r, i) => (
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
                <div className="text-muted-foreground">{customer.primaryContact} · {customer.email}</div>
                <div className="text-muted-foreground">{customer.phone}</div>
                <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                  <Link to="/customers/$customerId" params={{ customerId: customer.id }}>Open customer profile</Link>
                </Button>
              </div>
            )}
          </Card>

          <Card className="border border-border/70 bg-surface p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <div className="text-[13.5px] font-semibold text-foreground">Attachments</div>
              <span className="ml-auto text-[11.5px] text-muted-foreground">{inv.attachments}</span>
            </div>
            <div className="mt-2 text-[12px] text-muted-foreground">
              {inv.attachments === 0 ? "No supporting documents" : `${inv.attachments} supporting document${inv.attachments === 1 ? "" : "s"} uploaded`}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
