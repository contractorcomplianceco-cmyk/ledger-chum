import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/status-badge";
import { ConfidenceIndicator } from "@/components/banking/confidence-indicator";
import { TxKindIcon } from "@/components/banking/transaction-icons";
import { BANK_ACCOUNTS, type Tx } from "@/lib/mock/banking";
import { currencyPrecise } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";
import { Paperclip, Copy, MoreVertical, AlertTriangle, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function accountLabel(id: string) {
  const a = BANK_ACCOUNTS.find((b) => b.id === id);
  return a ? `${a.nickname} ${a.mask}` : id;
}

export function TransactionTable({
  transactions,
  selectedId,
  onSelect,
  bulkSelection,
  onBulkToggle,
}: {
  transactions: Tx[];
  selectedId?: string;
  onSelect: (id: string) => void;
  bulkSelection: Set<string>;
  onBulkToggle: (id: string) => void;
}) {
  if (transactions.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-border p-12 text-center">
        <div className="text-sm font-medium">No transactions match these filters</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Try clearing the search or expanding the date range.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-elegant">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th scope="col" className="w-8 px-3 py-2.5"></th>
              <th scope="col" className="px-2 py-2.5 text-left">
                Date
              </th>
              <th scope="col" className="px-2 py-2.5 text-left">
                Description
              </th>
              <th scope="col" className="px-2 py-2.5 text-left">
                Account
              </th>
              <th scope="col" className="px-2 py-2.5 text-left">
                Category / match
              </th>
              <th scope="col" className="px-2 py-2.5 text-right">
                Amount
              </th>
              <th scope="col" className="px-2 py-2.5 text-left">
                Confidence
              </th>
              <th scope="col" className="px-2 py-2.5 text-left">
                Status
              </th>
              <th scope="col" className="w-10 px-2 py-2.5"></th>
              <th scope="col" className="w-8 px-2 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const positive = tx.amount > 0;
              const isSelected = selectedId === tx.id;
              return (
                <tr
                  key={tx.id}
                  onClick={() => onSelect(tx.id)}
                  className={cn(
                    "cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/40",
                    isSelected && "bg-brand/5 hover:bg-brand/10",
                  )}
                >
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={bulkSelection.has(tx.id)}
                      onCheckedChange={() => onBulkToggle(tx.id)}
                      aria-label={`Select transaction ${tx.id}`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 font-tabular text-xs text-muted-foreground">
                    {tx.date}
                  </td>
                  <td className="max-w-[260px] px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <TxKindIcon kind={tx.kind} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium">{tx.merchant}</span>
                          {tx.possibleDuplicateOf && (
                            <AlertTriangle
                              className="h-3 w-3 shrink-0 text-destructive"
                              aria-label="Possible duplicate"
                            />
                          )}
                        </div>
                        <div className="truncate font-mono text-[10px] text-muted-foreground">
                          {tx.bankDescription}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-xs text-muted-foreground">
                    {accountLabel(tx.accountId)}
                  </td>
                  <td className="max-w-[220px] px-2 py-2.5 text-xs">
                    {tx.suggestedMatch ? (
                      <span className="truncate text-info">→ {tx.suggestedMatch.label}</span>
                    ) : tx.suggestedCategory ? (
                      <span className="truncate">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {tx.suggestedCategory.code}
                        </span>{" "}
                        {tx.suggestedCategory.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-right font-tabular font-medium">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        positive ? "text-success" : "text-foreground",
                      )}
                    >
                      <span aria-hidden>{positive ? "+" : "−"}</span>
                      {currencyPrecise(Math.abs(tx.amount))}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    {tx.confidence ? (
                      <ConfidenceIndicator value={tx.confidence} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-2 py-2.5">
                    {tx.receipt === "attached" ? (
                      <Paperclip
                        className="h-3.5 w-3.5 text-success"
                        aria-label="Receipt attached"
                      />
                    ) : tx.receipt === "missing" ? (
                      <CircleAlert
                        className="h-3.5 w-3.5 text-warning"
                        aria-label="Missing receipt"
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label="Row actions"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Categorize</DropdownMenuItem>
                        <DropdownMenuItem>Match</DropdownMenuItem>
                        <DropdownMenuItem>Split</DropdownMenuItem>
                        <DropdownMenuItem>Flag for review</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-3.5 w-3.5" /> Copy details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
