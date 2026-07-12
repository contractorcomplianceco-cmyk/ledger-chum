import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/status-badge";
import { ConfidenceIndicator } from "@/components/banking/confidence-indicator";
import { TxKindIcon } from "@/components/banking/transaction-icons";
import { DemoNotice, DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import { BANK_ACCOUNTS, type Tx } from "@/lib/mock/banking";
import { currencyPrecise } from "@/lib/mock/finance";
import {
  Check,
  Split,
  ArrowLeftRight,
  Paperclip,
  Flag,
  StickyNote,
  Wand2,
  Send,
  Copy,
  AlertTriangle,
  History,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TransactionDetailPanel({
  tx,
  onCategorize,
  onMatch,
  onSplit,
}: {
  tx: Tx | undefined;
  onCategorize: () => void;
  onMatch: () => void;
  onSplit: () => void;
}) {
  if (!tx) {
    return (
      <Card className="grid h-full min-h-[400px] place-items-center border-dashed border-border p-8 text-center">
        <div className="max-w-xs">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-muted">
            <Wand2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-sm font-medium">Select a transaction</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick a row from the list to review details, suggested categorization, and matching candidates.
          </p>
        </div>
      </Card>
    );
  }

  const positive = tx.amount > 0;
  const account = BANK_ACCOUNTS.find((a) => a.id === tx.accountId);

  const demoAction = (label: string) =>
    toast(`${label}`, { description: DEMO_ACTION_MESSAGE });

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/60 bg-gradient-surface shadow-elegant">
      <header className="border-b border-border/60 p-5">
        <div className="flex items-start gap-3">
          <TxKindIcon kind={tx.kind} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={tx.status} />
              {tx.reconciled && <StatusBadge status="reconciled" />}
              {tx.possibleDuplicateOf && (
                <Badge variant="outline" className="gap-1 border-destructive/40 bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-3 w-3" /> Possible duplicate
                </Badge>
              )}
            </div>
            <h2 className="mt-1.5 truncate text-lg font-semibold tracking-tight">{tx.merchant}</h2>
            <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              {tx.bankDescription}
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "font-tabular text-2xl font-semibold tracking-tight",
                positive ? "text-success" : "text-foreground",
              )}
            >
              {positive ? "+" : "−"}
              {currencyPrecise(Math.abs(tx.amount))}
            </div>
            <div className="text-[11px] text-muted-foreground">{tx.date}</div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="space-y-5 p-5">
          {tx.possibleDuplicateOf && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="text-xs">
                  <div className="font-medium text-destructive">Possible duplicate detected</div>
                  <div className="mt-0.5 text-muted-foreground">{tx.reason}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => demoAction("Marked as duplicate")}>
                      Mark as duplicate
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => demoAction("Kept as separate transaction")}>
                      Keep both
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(tx.suggestedCategory || tx.suggestedMatch) && (
            <section aria-labelledby="ai-suggest">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                <h3 id="ai-suggest" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Suggested by LedgerOS
                </h3>
              </div>
              <div className="space-y-2">
                {tx.suggestedMatch && (
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-info/30 bg-info/5 p-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-info">
                        Match candidate
                      </div>
                      <div className="mt-0.5 truncate text-sm font-medium">{tx.suggestedMatch.label}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{tx.reason}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {tx.confidence && <ConfidenceIndicator value={tx.confidence} />}
                      <Button size="sm" onClick={() => demoAction("Match accepted")}>Accept</Button>
                    </div>
                  </div>
                )}
                {tx.suggestedCategory && (
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-brand/30 bg-brand/5 p-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                        Category suggestion
                      </div>
                      <div className="mt-0.5 truncate text-sm font-medium">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {tx.suggestedCategory.code}
                        </span>{" "}
                        {tx.suggestedCategory.name}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{tx.reason}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {tx.confidence && <ConfidenceIndicator value={tx.confidence} />}
                      <Button size="sm" onClick={() => demoAction("Category applied")}>Apply</Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <section aria-labelledby="details">
            <h3 id="details" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Details
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Account</dt>
                <dd className="font-medium">
                  {account ? `${account.nickname} ${account.mask}` : tx.accountId}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium capitalize">{tx.kind}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Posted</dt>
                <dd className="font-tabular font-medium">{tx.postedDate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Source</dt>
                <dd className="font-medium">{tx.source}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Import batch</dt>
                <dd className="font-mono font-medium">{tx.importBatch}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Bank reference</dt>
                <dd className="font-mono font-medium">{tx.bankRef}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Receipt</dt>
                <dd className="font-medium capitalize">{tx.receipt.replace("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Reconciled</dt>
                <dd className="font-medium">{tx.reconciled ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </section>

          <Separator />

          <section aria-labelledby="impact">
            <h3 id="impact" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Accounting impact preview
            </h3>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Account</th>
                    <th className="px-3 py-2 text-right">Debit</th>
                    <th className="px-3 py-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="font-tabular">
                  <tr className="border-t border-border">
                    <td className="px-3 py-2">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {positive ? "1010" : (tx.suggestedCategory?.code ?? "1099")}
                      </span>{" "}
                      {positive ? "Cash — Operating" : (tx.suggestedCategory?.name ?? "Suspense")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {positive ? currencyPrecise(Math.abs(tx.amount)) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {positive ? "—" : currencyPrecise(Math.abs(tx.amount))}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {positive ? (tx.suggestedCategory?.code ?? "1099") : "1010"}
                      </span>{" "}
                      {positive ? (tx.suggestedCategory?.name ?? "Suspense") : "Cash — Operating"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {positive ? "—" : currencyPrecise(Math.abs(tx.amount))}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {positive ? currencyPrecise(Math.abs(tx.amount)) : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <DemoNotice variant="inline" className="mt-2" />
          </section>

          <Separator />

          <section aria-labelledby="memo">
            <h3 id="memo" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Internal memo
            </h3>
            <Textarea
              placeholder="Add a note for reviewers…"
              defaultValue={tx.memo}
              className="min-h-[70px] resize-none text-xs"
            />
          </section>

          <section aria-labelledby="audit">
            <div className="mb-2 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 id="audit" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Audit timeline
              </h3>
            </div>
            <ol className="space-y-2 border-l border-border pl-3 text-xs">
              <li>
                <div className="font-medium">Imported from {tx.source}</div>
                <div className="text-muted-foreground">System · {tx.postedDate}</div>
              </li>
              <li>
                <div className="font-medium">AI suggestion generated</div>
                <div className="text-muted-foreground">RoseOS · same day</div>
              </li>
              <li>
                <div className="font-medium">Assigned to K. Chen</div>
                <div className="text-muted-foreground">M. Rose · 2 days ago</div>
              </li>
            </ol>
          </section>
        </div>
      </ScrollArea>

      <footer className="border-t border-border/60 bg-card/50 p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button size="sm" onClick={onMatch}>
            <Check className="mr-1.5 h-3.5 w-3.5" /> Match
          </Button>
          <Button size="sm" variant="outline" onClick={onCategorize}>
            Categorize
          </Button>
          <Button size="sm" variant="outline" onClick={onSplit}>
            <Split className="mr-1.5 h-3.5 w-3.5" /> Split
          </Button>
          <Button size="sm" variant="outline" onClick={() => demoAction("Marked as transfer")}>
            <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" /> Transfer
          </Button>
          <Button size="sm" variant="ghost" onClick={() => demoAction("Receipt attached")}>
            <Paperclip className="mr-1.5 h-3.5 w-3.5" /> Receipt
          </Button>
          <Button size="sm" variant="ghost" onClick={() => demoAction("Memo saved")}>
            <StickyNote className="mr-1.5 h-3.5 w-3.5" /> Note
          </Button>
          <Button size="sm" variant="ghost" onClick={() => demoAction("Flagged for review")}>
            <Flag className="mr-1.5 h-3.5 w-3.5" /> Flag
          </Button>
          <Button size="sm" variant="ghost" onClick={() => demoAction("Sent for approval")}>
            <Send className="mr-1.5 h-3.5 w-3.5" /> Approve
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="inline-flex items-center gap-1">
            <Copy className="h-3 w-3" /> {tx.id}
          </div>
          <DemoNotice variant="inline" message="Mock actions — no accounting record modified." />
        </div>
      </footer>
    </Card>
  );
}
