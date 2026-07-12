import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { AllocationRow } from "@/components/cash/allocation-row";
import { CLIENT_PAYMENTS, TREATMENT_META, type Spendability } from "@/lib/mock/cash-availability";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export const Route = createFileRoute("/cash-availability/allocations")({
  head: () => ({
    meta: [
      { title: "Allocations — LedgerOS Cash Availability" },
      {
        name: "description",
        content:
          "Per-payment allocation breakdown: how each client payment splits into pass-through, commission, tax, and CCA operating revenue.",
      },
    ],
  }),
  component: AllocationsPage,
});

const FILTERS: Array<{ key: "all" | Spendability; label: string }> = [
  { key: "all", label: "All" },
  { key: "restricted", label: "Restricted" },
  { key: "reserved", label: "Reserved" },
  { key: "operating", label: "Operating" },
];

function AllocationsPage() {
  const [filter, setFilter] = useState<"all" | Spendability>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return CLIENT_PAYMENTS.filter((p) => {
      if (
        search &&
        !`${p.client} ${p.invoice} ${p.service}`.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (filter === "all") return true;
      return p.lines.some((l) => TREATMENT_META[l.treatment].spendability === filter);
    });
  }, [filter, search]);

  const totals = useMemo(() => {
    const t = { restricted: 0, reserved: 0, operating: 0, gross: 0 };
    for (const p of filtered) {
      for (const l of p.lines) {
        t[TREATMENT_META[l.treatment].spendability] += l.amount;
        t.gross += l.amount;
      }
    }
    return t;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <Card className="border border-border/70 bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition",
                    active
                      ? "border-brand/40 bg-brand/10 text-brand"
                      : "border-border/70 bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, invoice, service…"
              className="h-9 w-64 rounded-lg border border-border/70 bg-surface pl-8 pr-3 text-[12.5px] outline-none placeholder:text-muted-foreground focus:border-brand/50"
            />
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Stat label="Gross received" value={currency(totals.gross)} tone="foreground" />
          <Stat label="Restricted" value={currency(totals.restricted)} tone="destructive" />
          <Stat label="Reserved" value={currency(totals.reserved)} tone="warning" />
          <Stat label="Operating" value={currency(totals.operating)} tone="success" />
        </div>
      </Card>

      <div className="space-y-2.5">
        {filtered.map((p, i) => (
          <AllocationRow key={p.id} payment={p} defaultOpen={i === 0} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/70 bg-surface p-10 text-center text-[13px] text-muted-foreground">
            No payments match this filter.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "foreground" | "destructive" | "warning" | "success";
}) {
  const toneClass = {
    foreground: "text-foreground",
    destructive: "text-destructive",
    warning: "text-warning",
    success: "text-success",
  }[tone];
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-0.5 font-tabular text-[17px] font-bold", toneClass)}>{value}</div>
    </div>
  );
}
