import { useState } from "react";
import { ChevronDown, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { currencyPrecise } from "@/lib/mock/finance";
import { TREATMENT_META, type ClientPayment, type Spendability } from "@/lib/mock/cash-availability";
import { TreatmentBadge } from "./treatment-badge";

function splitByBucket(p: ClientPayment) {
  const buckets: Record<Spendability, number> = { restricted: 0, reserved: 0, operating: 0 };
  for (const l of p.lines) {
    buckets[TREATMENT_META[l.treatment].spendability] += l.amount;
  }
  return buckets;
}

export function AllocationRow({
  payment,
  defaultOpen = false,
}: {
  payment: ClientPayment;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const buckets = splitByBucket(payment);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto_auto] items-center gap-4 px-4 py-3 text-left transition hover:bg-muted/30"
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand-cool text-white">
          <Receipt className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold text-foreground">
            {payment.client}
          </div>
          <div className="truncate text-[11.5px] text-muted-foreground">
            {payment.date} · {payment.invoice} · {payment.service}
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {buckets.restricted > 0 && <BucketPill spendability="restricted" amount={buckets.restricted} />}
          {buckets.reserved > 0 && <BucketPill spendability="reserved" amount={buckets.reserved} />}
          {buckets.operating > 0 && <BucketPill spendability="operating" amount={buckets.operating} />}
        </div>
        <div className="text-right">
          <div className="font-tabular text-[15px] font-bold text-foreground">
            {currencyPrecise(payment.gross)}
          </div>
          <div className="text-[10.5px] text-muted-foreground">{payment.method}</div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border/70 bg-muted/20 px-4 py-3">
          <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Allocation
          </div>
          <div className="divide-y divide-border/60">
            {payment.lines.map((line, i) => {
              const meta = TREATMENT_META[line.treatment];
              return (
                <div
                  key={i}
                  className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto_auto] items-center gap-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium text-foreground">
                      {line.label}
                    </div>
                    {line.payeeHint && (
                      <div className="truncate text-[10.5px] text-muted-foreground">
                        Payee: {line.payeeHint}
                      </div>
                    )}
                  </div>
                  <div className="truncate text-[11.5px] text-muted-foreground">
                    {meta.label} · {meta.glAccount}
                  </div>
                  <TreatmentBadge spendability={meta.spendability} />
                  <div className="min-w-[90px] text-right font-tabular text-[12.5px] font-semibold text-foreground">
                    {currencyPrecise(line.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BucketPill({ spendability, amount }: { spendability: Spendability; amount: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <TreatmentBadge spendability={spendability} />
      <span className="font-tabular text-[11.5px] font-semibold text-foreground/80">
        {currencyPrecise(amount)}
      </span>
    </div>
  );
}
