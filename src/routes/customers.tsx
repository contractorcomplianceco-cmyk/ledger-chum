import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CUSTOMERS, INVOICES, computeInvoice } from "@/lib/mock/invoicing";
import { currency } from "@/lib/mock/finance";
import { CustomerSummaryCard } from "@/components/invoicing/customer-summary-card";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — LedgerOS" },
      { name: "description", content: "Customer accounts, receivables, and billing profiles." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      CUSTOMERS.filter((c) =>
        `${c.name} ${c.primaryContact} ${c.email}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );

  const totalBalance = CUSTOMERS.reduce((s, c) => s + c.balance, 0);
  const totalLtv = CUSTOMERS.reduce((s, c) => s + c.ltv, 0);
  const atRisk = CUSTOMERS.filter((c) => c.status === "at_risk" || c.status === "past_due").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Sales"
        title="Customers"
        description="Every customer profile links to their invoices, statements, and cash-availability contribution."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              Import
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New customer
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Customers" value={CUSTOMERS.length.toString()} sub="Active accounts" />
          <StatTile
            label="Total open balance"
            value={currency(totalBalance)}
            sub="AR across all customers"
          />
          <StatTile
            label="Lifetime revenue"
            value={currency(totalLtv)}
            sub={`${atRisk} at risk or past due`}
            tone={atRisk > 0 ? "warn" : "ok"}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search customers"
              className="h-9 w-72 pl-8 text-[13px]"
            />
          </div>
          <div className="text-[12px] text-muted-foreground">{filtered.length} results</div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const invoiceCount = INVOICES.filter((i) => i.customerId === c.id).length;
            const openInvoices = INVOICES.filter(
              (i) =>
                i.customerId === c.id &&
                (i.status === "sent" ||
                  i.status === "partial" ||
                  i.status === "overdue" ||
                  i.status === "viewed"),
            );
            const openBalance = openInvoices.reduce(
              (s, i) => s + (computeInvoice(i.lines).total - i.paid),
              0,
            );
            return (
              <Link
                key={c.id}
                to="/customers/$customerId"
                params={{ customerId: c.id }}
                className="block transition hover:opacity-95"
              >
                <CustomerSummaryCard customer={{ ...c, balance: openBalance || c.balance }} />
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {invoiceCount} invoices · {openInvoices.length} open
                </div>
              </Link>
            );
          })}
        </div>
      </PageBody>
    </AppShell>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone = "ok",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "ok" | "warn";
}) {
  return (
    <Card className="border border-border/70 bg-surface p-4 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-tabular text-[24px] font-bold text-foreground">{value}</div>
      <div
        className={`mt-1 text-[12px] ${tone === "warn" ? "text-warning" : "text-muted-foreground"}`}
      >
        {sub}
      </div>
    </Card>
  );
}
