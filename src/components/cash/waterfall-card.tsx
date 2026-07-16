import { Card } from "@/components/ui/card";
import { currency, currencyPrecise } from "@/lib/mock/finance";
import { WATERFALL_STEPS, CASH_POSITION } from "@/lib/mock/cash-availability";
import { ArrowDownRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const barTone = {
  start: "bg-gradient-brand-cool",
  restricted: "bg-destructive/80",
  reserved: "bg-warning/85",
  end: "bg-gradient-brand-full",
} as const;

export function WaterfallCard() {
  const max = CASH_POSITION.bankTotal;
  return (
    <Card className="overflow-hidden border-0 bg-gradient-quick-actions p-6 text-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.65)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/60">
            Cash Availability Engine
          </div>
          <div className="mt-1 flex items-center gap-2 text-[19px] font-semibold text-white">
            <Wallet className="h-5 w-5 text-white/70" />
            What's actually spendable today
          </div>
          <div className="mt-1 max-w-xl text-[12.5px] text-white/60">
            Bank balance is never fully available. Every incoming payment is classified into
            restricted (pass-through), reserved (commissions, tax, payroll, deferred), or operating
            cash.
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/50">
            True Available
          </div>
          <div className="mt-0.5 font-tabular text-[28px] font-bold leading-none text-white">
            {currency(WATERFALL_STEPS[WATERFALL_STEPS.length - 1].delta)}
          </div>
          <div className="mt-1 text-[11px] text-white/55">
            of {currency(CASH_POSITION.bankTotal)} in bank
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        {WATERFALL_STEPS.map((step) => {
          const pct = Math.min(100, (Math.abs(step.delta) / max) * 100);
          return (
            <div
              key={step.key}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-3"
            >
              <div
                className={cn(
                  "truncate text-[12.5px] font-medium",
                  step.kind === "end" ? "text-white" : "text-white/75",
                )}
              >
                {step.label}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn("h-full rounded-full", barTone[step.kind])}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div
                className={cn(
                  "min-w-[110px] text-right font-tabular text-[13px] font-semibold tabular-nums",
                  step.kind === "end"
                    ? "text-white"
                    : step.delta < 0
                      ? "text-white/70"
                      : "text-white",
                )}
              >
                {step.delta < 0 ? "−" : ""}
                {currencyPrecise(Math.abs(step.delta))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-white/70">
        <ArrowDownRight className="h-4 w-4 text-white/50" />
        Restricted + reserved buckets are protected from operating spend by LedgerOS Cash
        Guardrails.
      </div>
    </Card>
  );
}
