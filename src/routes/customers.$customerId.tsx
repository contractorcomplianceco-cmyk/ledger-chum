import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CUSTOMERS, INVOICES, computeInvoice, type Invoice } from "@/lib/mock/invoicing";
import { CustomerSummaryCard } from "@/components/invoicing/customer-summary-card";
import { InvoiceStatusBadge } from "@/components/invoicing/invoice-status-badge";
import { PaymentLikelihoodChip } from "@/components/invoicing/payment-likelihood-chip";
import { currency } from "@/lib/mock/finance";
import { ArrowLeft, Plus, Send, Copy } from "lucide-react";

export const Route = createFileRoute("/customers/$customerId")({
  head: ({ params }) => ({
    meta: [{ title: `Customer ${params.customerId} — LedgerOS` }],
  }),
  component: CustomerDetailPage,
});

function CustomerDetailPage() {
  const { customerId } = Route.useParams();
  const customer = CUSTOMERS.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <AppShell>
        <PageBody>
          <div className="p-8">
            <div className="text-lg font-semibold">Customer not found</div>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to="/customers">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
              </Link>
            </Button>
          </div>
        </PageBody>
      </AppShell>
    );
  }

  const invoices: Invoice[] = INVOICES.filter((i) => i.customerId === customerId);
  const totalBilled = invoices.reduce((s, i) => s + computeInvoice(i.lines).total, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paid, 0);
  const openBalance = totalBilled - totalCollected;

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Customer"
        title={customer.name}
        description={`${customer.industry} · ${customer.states.join(", ")} · customer since ${customer.createdAt}`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link to="/customers">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> All customers
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Send className="mr-1.5 h-3.5 w-3.5" /> Statement
            </Button>
            <Button size="sm" className="h-9" asChild>
              <Link to="/invoices/new">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New invoice
              </Link>
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Total billed" value={currency(totalBilled)} />
              <StatTile label="Collected" value={currency(totalCollected)} />
              <StatTile
                label="Open balance"
                value={currency(openBalance)}
                tone={openBalance > 0 ? "warn" : "ok"}
              />
            </div>

            <Card className="border border-border/70 bg-surface p-4 shadow-card">
              <div className="text-[13.5px] font-semibold text-foreground">Invoices</div>
              <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-[13px]">
                  <thead className="bg-muted/40 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Invoice</th>
                      <th className="px-2 py-2 text-left">Issued</th>
                      <th className="px-2 py-2 text-right">Total</th>
                      <th className="px-2 py-2 text-right">Balance</th>
                      <th className="px-2 py-2 text-left">Status</th>
                      <th className="px-2 py-2 text-left">Likelihood</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {invoices.map((inv) => {
                      const c = computeInvoice(inv.lines);
                      const balance = c.total - inv.paid;
                      return (
                        <tr key={inv.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2">
                            <Link
                              to="/invoices/$invoiceId"
                              params={{ invoiceId: inv.id }}
                              className="font-semibold text-foreground hover:underline"
                            >
                              {inv.number}
                            </Link>
                          </td>
                          <td className="px-2 py-2 text-muted-foreground">{inv.issued}</td>
                          <td className="px-2 py-2 text-right font-tabular">{currency(c.total)}</td>
                          <td className="px-2 py-2 text-right font-tabular font-semibold">
                            {currency(balance)}
                          </td>
                          <td className="px-2 py-2">
                            <InvoiceStatusBadge status={inv.status} />
                          </td>
                          <td className="px-2 py-2">
                            <PaymentLikelihoodChip likelihood={inv.likelihood} compact />
                          </td>
                        </tr>
                      );
                    })}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                          No invoices yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="border border-border/70 bg-surface p-4 shadow-card">
              <div className="text-[13.5px] font-semibold text-foreground">Billing contacts</div>
              <div className="mt-3 divide-y divide-border/60">
                {customer.billingContacts.map((bc) => (
                  <div key={bc.email} className="flex items-center justify-between gap-2 py-2">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">{bc.name}</div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {bc.email} · {bc.role}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <CustomerSummaryCard customer={{ ...customer, balance: openBalance }} />

            <Card className="border border-border/70 bg-surface p-4 shadow-card">
              <div className="text-[13.5px] font-semibold text-foreground">Payment methods</div>
              <ul className="mt-2 space-y-1.5 text-[12.5px]">
                {customer.paymentMethods.map((m) => (
                  <li key={m.type + m.last4} className="flex items-center justify-between">
                    <span className="text-foreground">{m.type}</span>
                    <span className="text-muted-foreground">•••• {m.last4}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="border border-border/70 bg-surface p-4 shadow-card">
              <div className="text-[13.5px] font-semibold text-foreground">Client portal</div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Share a portal link where {customer.name} can view invoices, download PDFs, and pay
                online.
              </p>
              <div className="mt-2 rounded-md bg-muted/40 p-2 font-mono text-[11px] text-foreground/80">
                portal.ledgeros.app/{customer.id}
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy portal link
              </Button>
            </Card>
          </aside>
        </div>
      </PageBody>
    </AppShell>
  );
}

function StatTile({
  label,
  value,
  tone = "ok",
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <Card className="border border-border/70 bg-surface p-4 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-tabular text-[22px] font-bold ${tone === "warn" ? "text-warning" : "text-foreground"}`}
      >
        {value}
      </div>
    </Card>
  );
}
