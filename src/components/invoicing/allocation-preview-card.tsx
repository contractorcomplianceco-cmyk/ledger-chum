import { Card } from "@/components/ui/card";
import { currency, currencyPrecise } from "@/lib/mock/finance";
import { computeInvoice, type InvoiceLine } from "@/lib/mock/invoicing";
import { TreatmentBadge } from "@/components/cash/treatment-badge";
import { Wallet, ShieldAlert, PiggyBank, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Live "what will hit the bank vs what is truly available" preview.
 * Rendered next to an invoice builder so the invoice becomes a financial
 * decision surface, not merely a billing form.
 */
export function AllocationPreviewCard({ lines }: { lines: InvoiceLine[] }) {
  const c = computeInvoice(lines);

  const rows: Array<{
    label: string;
    amount: number;
    kind: "gross" | "op" | "restricted" | "reserved" | "net";
    hint?: string;
  }> = [
    {
      label: "Total client charge",
      amount: c.total,
      kind: "gross",
      hint: "What the customer owes.",
    },
    {
      label: "Expected CCA revenue",
      amount: c.ccaRevenue,
      kind: "op",
      hint: "Earned service revenue recognized to CCA.",
    },
    {
      label: "Restricted pass-through",
      amount: c.passThrough,
      kind: "restricted",
      hint: "Owed to state, agencies, or third parties. Never spendable.",
    },
    {
      label: "Commission reserve",
      amount: c.commission,
      kind: "reserved",
      hint: "Held for sales commission payout.",
    },
    {
      label: "Tax reserve",
      amount: c.taxReserve,
      kind: "reserved",
      hint: "Set aside for sales/income tax obligations.",
    },
    {
      label: "Deferred revenue",
      amount: c.deferredRevenue,
      kind: "reserved",
      hint: "Cash collected for work not yet delivered.",
    },
    {
      label: "Estimated fulfillment cost",
      amount: c.fulfillmentCost,
      kind: "reserved",
      hint: "Cost to deliver the services on this invoice.",
    },
    {
      label: "True available cash impact",
      amount: c.trueAvailableAfterCollection,
      kind: "net",
      hint: "Cash truly free to spend once this invoice is collected.",
    },
  ];

  return (
    <Card className="border border-border/70 bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[13.5px] font-semibold text-foreground">Allocation preview</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            Every line auto-routes to a spendability bucket
          </div>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand-cool text-white">
          <Wallet className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <Row key={r.label} {...r} />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat icon={ShieldAlert} tone="destructive" label="Restricted" value={c.restricted} />
        <MiniStat icon={PiggyBank} tone="warning" label="Reserved" value={c.reserved} />
        <MiniStat icon={TrendingUp} tone="success" label="Operating" value={c.operating} />
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          These allocations feed the Cash Availability Engine automatically when the invoice is
          collected — no journal entry required.
        </span>
      </div>
    </Card>
  );
}

function Row({
  label,
  amount,
  kind,
  hint,
}: {
  label: string;
  amount: number;
  kind: "gross" | "op" | "restricted" | "reserved" | "net";
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-md px-2 py-1.5",
        kind === "gross" && "bg-muted/40",
        kind === "net" && "bg-gradient-brand-cool/[0.07] ring-1 ring-inset ring-blue-500/15",
      )}
    >
      <div className="min-w-0">
        <div
          className={cn(
            "truncate text-[12.5px] font-medium",
            kind === "net" ? "text-foreground" : "text-foreground/85",
            kind === "gross" && "font-semibold",
          )}
        >
          {label}
        </div>
        {hint && <div className="truncate text-[10.5px] text-muted-foreground">{hint}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {kind === "restricted" && <TreatmentBadge spendability="restricted" />}
        {kind === "reserved" && <TreatmentBadge spendability="reserved" />}
        {kind === "op" && <TreatmentBadge spendability="operating" />}
        <div
          className={cn(
            "font-tabular text-[13px] font-bold",
            kind === "net" ? "text-foreground" : "text-foreground/90",
          )}
        >
          {kind === "restricted" || kind === "reserved" ? "−" : ""}
          {currencyPrecise(Math.abs(amount))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Wallet;
  tone: "destructive" | "warning" | "success";
  label: string;
  value: number;
}) {
  const toneClass = {
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/10 text-success",
  }[tone];
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 p-2">
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[10px] font-semibold",
          toneClass,
        )}
      >
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 font-tabular text-[13.5px] font-bold text-foreground">
        {currency(value)}
      </div>
    </div>
  );
}
