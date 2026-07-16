import { Card } from "@/components/ui/card";
import type { Customer } from "@/lib/mock/invoicing";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin } from "lucide-react";

const statusTone = {
  active: "bg-success/10 text-success ring-success/20",
  at_risk: "bg-warning/15 text-warning ring-warning/25",
  past_due: "bg-destructive/10 text-destructive ring-destructive/20",
  prospect: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
} as const;

const statusLabel = {
  active: "Active",
  at_risk: "At risk",
  past_due: "Past due",
  prospect: "Prospect",
} as const;

export function CustomerSummaryCard({ customer }: { customer: Customer }) {
  return (
    <Card className="border border-border/70 bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-foreground">{customer.name}</div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            {customer.industry} · {customer.states.join(", ")}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
            statusTone[customer.status],
          )}
        >
          {statusLabel[customer.status]}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-[12px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> {customer.email}
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" /> {customer.phone}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {customer.address}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
        <MiniStat label="Open balance" value={currency(customer.balance)} />
        <MiniStat label="LTV" value={currency(customer.ltv)} />
        <MiniStat label="Avg pay" value={`${customer.avgPayDays}d`} />
      </div>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-tabular text-[14px] font-bold text-foreground">{value}</div>
    </div>
  );
}
