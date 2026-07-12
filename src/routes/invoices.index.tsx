import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InvoiceListTable } from "@/components/invoicing/invoice-list-table";
import { INVOICES, invoiceKpis, INVOICE_STATUS_META, type InvoiceStatus } from "@/lib/mock/invoicing";
import { CircleDollarSign, Clock4, FileText, CheckCheck, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/invoices/")({
  component: InvoicesIndex,
});

const FILTERS: Array<{ id: "all" | InvoiceStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "partial", label: "Partial" },
  { id: "paid", label: "Paid" },
  { id: "overdue", label: "Overdue" },
];

function InvoicesIndex() {
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const [q, setQ] = useState("");

  const kpis = useMemo(() => invoiceKpis(INVOICES), []);
  const filtered = useMemo(() => {
    return INVOICES.filter((i) => {
      if (filter !== "all" && i.status !== filter) return false;
      if (q && !`${i.number} ${i.customerName} ${i.notes ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [filter, q]);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Outstanding" value={kpis.outstanding} delta={4.8} trend="up" icon={CircleDollarSign} tone="blue" compareLabel="AR balance" />
        <KpiCard label="Overdue" value={kpis.overdue} delta={12.4} trend="up" icon={Clock4} tone="violet" compareLabel="past due date" />
        <KpiCard label="Draft" value={kpis.draft} delta={0} trend="up" icon={FileText} tone="cyan" compareLabel="awaiting send" />
        <KpiCard label="Paid this period" value={kpis.paidThisPeriod} delta={18.2} trend="up" icon={CheckCheck} tone="mint" compareLabel={`${kpis.paidCount} invoices · avg ${kpis.avgPayDays}d to pay`} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] font-medium transition",
                filter === f.id
                  ? "border-transparent bg-gradient-brand-cool text-white shadow-sm"
                  : "border-border bg-surface text-foreground/80 hover:border-foreground/20",
              )}
            >
              {f.id === "all" ? "All" : INVOICE_STATUS_META[f.id as InvoiceStatus].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search invoice, client, or note"
              className="h-9 w-64 pl-8 text-[13px]"
            />
          </div>
          <Button size="sm" className="h-9" asChild>
            <Link to="/invoices/new"><Plus className="mr-1.5 h-3.5 w-3.5" /> New</Link>
          </Button>
        </div>
      </div>

      <InvoiceListTable invoices={filtered} />
    </div>
  );
}
