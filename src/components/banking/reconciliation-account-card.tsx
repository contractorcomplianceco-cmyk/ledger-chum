import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { currencyPrecise } from "@/lib/mock/finance";
import type { BankAccount } from "@/lib/mock/banking";
import { ArrowRight, BookOpenCheck, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReconciliationAccountCard({
  account,
  onStart,
  daysOverdue,
  unreconciledCount,
  period = "Jul 1 – Jul 31, 2026",
  owner = "K. Chen",
}: {
  account: BankAccount;
  onStart: () => void;
  daysOverdue?: number;
  unreconciledCount: number;
  period?: string;
  owner?: string;
}) {
  const diff = account.bankBalance - account.ledgerBalance;
  const overdue = (daysOverdue ?? 0) > 0;

  return (
    <Card className="flex flex-col gap-4 border-border/60 bg-gradient-surface p-5 shadow-elegant">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-navy-foreground">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold">{account.nickname}</h3>
              <span className="font-mono text-[11px] text-muted-foreground">{account.mask}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{period}</div>
          </div>
        </div>
        <StatusBadge status={account.reconciliation} />
      </header>

      <dl className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Ledger balance</dt>
          <dd className="mt-0.5 font-tabular font-semibold">
            {currencyPrecise(account.ledgerBalance)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Bank balance</dt>
          <dd className="mt-0.5 font-tabular font-semibold">
            {currencyPrecise(account.bankBalance)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Difference</dt>
          <dd
            className={cn(
              "mt-0.5 font-tabular font-semibold",
              Math.abs(diff) < 0.01 ? "text-success" : "text-destructive",
            )}
          >
            {currencyPrecise(diff)}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-3 gap-3 border-t border-border/60 pt-3 text-[11px]">
        <div>
          <div className="text-muted-foreground">Last reconciled</div>
          <div className="font-medium">{account.lastReconciledOn}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Unreconciled</div>
          <div className="font-tabular font-medium">{unreconciledCount}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Owner</div>
          <div className="font-medium">{owner}</div>
        </div>
      </div>

      {overdue && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[11px] text-destructive">
          Overdue by {daysOverdue} days
        </div>
      )}

      <div className="flex gap-2">
        <Button className="flex-1" onClick={onStart}>
          <BookOpenCheck className="mr-1.5 h-3.5 w-3.5" />
          {account.reconciliation === "in_progress"
            ? "Resume"
            : account.reconciliation === "reconciled"
              ? "Review"
              : "Start reconciliation"}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
