import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BANK_ACCOUNTS } from "@/lib/mock/banking";

export type SavedView =
  | "all"
  | "needs_review"
  | "unmatched"
  | "missing_receipt"
  | "large"
  | "duplicates"
  | "transfers"
  | "ready_reconcile"
  | "flagged";

export const SAVED_VIEWS: { id: SavedView; label: string; count?: number }[] = [
  { id: "all", label: "All" },
  { id: "needs_review", label: "Needs Review", count: 3 },
  { id: "unmatched", label: "Unmatched", count: 5 },
  { id: "missing_receipt", label: "Missing Receipt", count: 4 },
  { id: "large", label: "Large Transactions", count: 3 },
  { id: "duplicates", label: "Possible Duplicates", count: 1 },
  { id: "transfers", label: "Transfers", count: 1 },
  { id: "ready_reconcile", label: "Ready to Reconcile", count: 6 },
  { id: "flagged", label: "Flagged", count: 1 },
];

export function TransactionFilterBar({
  search,
  onSearch,
  view,
  onView,
  accountId,
  onAccount,
  status,
  onStatus,
  onClear,
  activeCount,
}: {
  search: string;
  onSearch: (v: string) => void;
  view: SavedView;
  onView: (v: SavedView) => void;
  accountId: string;
  onAccount: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  onClear: () => void;
  activeCount: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search merchant, description, reference…"
            className="h-9 pl-9"
            aria-label="Search transactions"
          />
        </div>
        <Select value={accountId} onValueChange={onAccount}>
          <SelectTrigger className="h-9 w-[200px]" aria-label="Account filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {BANK_ACCOUNTS.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nickname} {a.mask}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={onStatus}>
          <SelectTrigger className="h-9 w-[180px]" aria-label="Status filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending_review">Pending review</SelectItem>
            <SelectItem value="suggested_match">Suggested match</SelectItem>
            <SelectItem value="categorized">Categorized</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="needs_receipt">Needs receipt</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="reconciled">Reconciled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-9">
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          More filters
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="h-9" onClick={onClear}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear ({activeCount})
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {SAVED_VIEWS.map((v) => {
          const active = v.id === view;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onView(v.id)}
              aria-pressed={active}
              className={
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                (active
                  ? "border-brand/40 bg-brand text-brand-foreground shadow-elegant"
                  : "border-border bg-card text-muted-foreground hover:bg-muted")
              }
            >
              {v.label}
              {v.count !== undefined && (
                <Badge
                  variant="outline"
                  className={
                    "h-4 border-transparent px-1 font-tabular text-[10px] " +
                    (active
                      ? "bg-brand-foreground/20 text-brand-foreground"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {v.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
