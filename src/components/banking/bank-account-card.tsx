import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { currencyPrecise } from "@/lib/mock/finance";
import type { BankAccount, ConnectionState, AccountHealth } from "@/lib/mock/banking";
import {
  ArrowLeftRight,
  BookOpenCheck,
  Download,
  Landmark,
  MoreHorizontal,
  Upload,
  Eye,
  CircleDot,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const CONNECTION_LABEL: Record<ConnectionState, string> = {
  csv_import: "CSV Import",
  manual_entry: "Manual Entry",
  future_secure: "Future Secure Connection",
  import_review: "Import Needs Review",
  current: "Current",
};

const HEALTH: Record<AccountHealth, { label: string; dot: string; text: string }> = {
  healthy: { label: "Healthy", dot: "bg-success", text: "text-success" },
  attention: { label: "Attention", dot: "bg-warning", text: "text-warning" },
  at_risk: { label: "At risk", dot: "bg-destructive", text: "text-destructive" },
};

export function BankAccountCard({ account }: { account: BankAccount }) {
  const diff = account.bankBalance - account.ledgerBalance;
  const health = HEALTH[account.health];

  return (
    <Card className="group relative flex flex-col gap-4 overflow-hidden border-border/60 bg-gradient-surface p-5 shadow-elegant transition-shadow hover:shadow-lifted">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-glow opacity-40" />

      <header className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-navy-foreground">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold tracking-tight">
                {account.nickname}
              </h3>
              <span className="font-mono text-[11px] text-muted-foreground">{account.mask}</span>
            </div>
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {account.institution} · {account.type}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Account actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" /> View account details
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/banking/transactions">
                <ArrowLeftRight className="mr-2 h-4 w-4" /> View transactions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Upload className="mr-2 h-4 w-4" /> Import activity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/banking/reconciliation">
                <BookOpenCheck className="mr-2 h-4 w-4" /> Start reconciliation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" /> Export activity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="relative grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Bank balance
          </div>
          <div className="mt-0.5 font-tabular text-2xl font-semibold tracking-tight">
            {currencyPrecise(account.bankBalance)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Ledger balance
          </div>
          <div className="mt-0.5 font-tabular text-2xl font-semibold tracking-tight text-muted-foreground">
            {currencyPrecise(account.ledgerBalance)}
          </div>
        </div>
      </div>

      <div className="relative flex flex-wrap items-center gap-2 text-[11px]">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium font-tabular",
            Math.abs(diff) < 0.01
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          Δ {currencyPrecise(diff)}
        </span>
        <Badge variant="outline" className="gap-1 font-normal">
          {CONNECTION_LABEL[account.connection]}
        </Badge>
        <span className={cn("inline-flex items-center gap-1.5 font-medium", health.text)}>
          <CircleDot className="h-3 w-3" />
          {health.label}
        </span>
      </div>

      <dl className="relative grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-[11px]">
        <div>
          <dt className="text-muted-foreground">Last import</dt>
          <dd className="font-medium">{account.lastImportedAt}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Import method</dt>
          <dd className="font-medium">{account.importMethod}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Pending review</dt>
          <dd className="font-tabular font-medium">{account.pendingReview}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Unmatched</dt>
          <dd className="font-tabular font-medium">{account.unmatched}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last reconciled</dt>
          <dd className="font-medium">{account.lastReconciledOn}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Reconciliation</dt>
          <dd>
            <StatusBadge status={account.reconciliation} />
          </dd>
        </div>
      </dl>

      <div className="relative flex flex-wrap gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link to="/banking/transactions">
            <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" /> Transactions
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to="/banking/reconciliation">
            <BookOpenCheck className="mr-1.5 h-3.5 w-3.5" /> Reconcile
          </Link>
        </Button>
      </div>
    </Card>
  );
}
