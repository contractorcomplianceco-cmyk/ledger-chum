import { Link } from "@tanstack/react-router";
import { currency } from "@/lib/mock/finance";
import { computeInvoice, type Invoice } from "@/lib/mock/invoicing";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { PaymentLikelihoodChip } from "./payment-likelihood-chip";
import { cn } from "@/lib/utils";

export function InvoiceListTable({ invoices }: { invoices: Invoice[] }) {
  if (!invoices.length) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-border p-12 text-center">
        <div className="text-sm font-medium">No invoices match these filters</div>
        <div className="mt-1 text-xs text-muted-foreground">Try clearing the search.</div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-elegant">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left">Invoice</th>
              <th className="px-2 py-2.5 text-left">Client</th>
              <th className="px-2 py-2.5 text-left">Issued</th>
              <th className="px-2 py-2.5 text-left">Due</th>
              <th className="px-2 py-2.5 text-right">Total</th>
              <th className="px-2 py-2.5 text-right">CCA revenue</th>
              <th className="px-2 py-2.5 text-right">Pass-through</th>
              <th className="px-2 py-2.5 text-right">Commission</th>
              <th className="px-2 py-2.5 text-left">Status</th>
              <th className="px-2 py-2.5 text-left">Payment likelihood</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {invoices.map((inv) => {
              const c = computeInvoice(inv.lines);
              const balance = c.total - inv.paid;
              return (
                <tr key={inv.id} className="group cursor-pointer hover:bg-muted/30">
                  <td className="px-3 py-2.5">
                    <Link
                      to="/invoices/$invoiceId"
                      params={{ invoiceId: inv.id }}
                      className="font-semibold text-foreground hover:underline"
                    >
                      {inv.number}
                    </Link>
                    <div className="text-[11px] text-muted-foreground">{inv.terms}</div>
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="font-medium text-foreground">{inv.customerName}</div>
                    {inv.notes && <div className="max-w-[220px] truncate text-[11px] text-muted-foreground">{inv.notes}</div>}
                  </td>
                  <td className="px-2 py-2.5 text-muted-foreground">{inv.issued}</td>
                  <td className={cn("px-2 py-2.5", inv.status === "overdue" ? "font-semibold text-destructive" : "text-muted-foreground")}>{inv.due}</td>
                  <td className="px-2 py-2.5 text-right">
                    <div className="font-tabular font-semibold text-foreground">{currency(c.total)}</div>
                    {balance > 0 && inv.status !== "draft" && (
                      <div className="text-[11px] text-muted-foreground">bal {currency(balance)}</div>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-right font-tabular text-foreground/85">{currency(c.ccaRevenue)}</td>
                  <td className="px-2 py-2.5 text-right font-tabular text-destructive/80">{currency(c.passThrough)}</td>
                  <td className="px-2 py-2.5 text-right font-tabular text-warning">{currency(c.commission)}</td>
                  <td className="px-2 py-2.5"><InvoiceStatusBadge status={inv.status} /></td>
                  <td className="px-2 py-2.5"><PaymentLikelihoodChip likelihood={inv.likelihood} compact /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
