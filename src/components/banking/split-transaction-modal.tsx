import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoNotice, DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import { currencyPrecise } from "@/lib/mock/finance";
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SplitLine = {
  id: string;
  account: string;
  description: string;
  tag: string;
  amount: number;
};

export function SplitTransactionModal({
  open,
  onOpenChange,
  originalAmount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalAmount: number;
}) {
  const [lines, setLines] = useState<SplitLine[]>([
    {
      id: "l1",
      account: "6210 Software & Infrastructure",
      description: "",
      tag: "",
      amount: originalAmount * 0.6,
    },
    { id: "l2", account: "6820 Bank Fees", description: "", tag: "", amount: originalAmount * 0.4 },
  ]);

  const allocated = useMemo(() => lines.reduce((s, l) => s + l.amount, 0), [lines]);
  const remaining = originalAmount - allocated;
  const balanced = Math.abs(remaining) < 0.005;

  const update = (id: string, patch: Partial<SplitLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const remove = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));
  const add = () =>
    setLines((prev) => [
      ...prev,
      {
        id: `l${Date.now()}`,
        account: "",
        description: "",
        tag: "",
        amount: Math.max(remaining, 0),
      },
    ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Split transaction</DialogTitle>
          <DialogDescription>
            Allocate the full transaction amount across multiple accounts. The split cannot be
            confirmed until the balance is zero.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-xs">
          <div>
            <div className="text-muted-foreground">Original amount</div>
            <div className="mt-0.5 font-tabular text-lg font-semibold">
              {currencyPrecise(originalAmount)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Allocated</div>
            <div className="mt-0.5 font-tabular text-lg font-semibold">
              {currencyPrecise(allocated)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Remaining</div>
            <div
              className={cn(
                "mt-0.5 font-tabular text-lg font-semibold",
                balanced ? "text-success" : "text-destructive",
              )}
            >
              {currencyPrecise(remaining)}
            </div>
          </div>
        </div>

        <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
          {lines.map((line, i) => {
            const pct = originalAmount > 0 ? (line.amount / originalAmount) * 100 : 0;
            return (
              <div
                key={line.id}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border p-2"
              >
                <div className="min-w-0">
                  <label className="sr-only" htmlFor={`acct-${line.id}`}>
                    Account line {i + 1}
                  </label>
                  <Input
                    id={`acct-${line.id}`}
                    value={line.account}
                    onChange={(e) => update(line.id, { account: e.target.value })}
                    placeholder="Account"
                    className="h-9"
                  />
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <Input
                      value={line.description}
                      onChange={(e) => update(line.id, { description: e.target.value })}
                      placeholder="Description"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={line.tag}
                      onChange={(e) => update(line.id, { tag: e.target.value })}
                      placeholder="Client / project"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Description &amp; tag apply to this split only.
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    value={line.amount}
                    onChange={(e) => update(line.id, { amount: Number(e.target.value) })}
                    className="h-9 text-right font-tabular"
                  />
                  <div className="mt-1 text-right text-[10px] text-muted-foreground font-tabular">
                    {pct.toFixed(1)}%
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(line.id)}
                  disabled={lines.length <= 2}
                  aria-label={`Remove split line ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <Button variant="outline" size="sm" onClick={add}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add split line
          </Button>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
            balanced
              ? "border-success/30 bg-success/5 text-success"
              : "border-destructive/40 bg-destructive/5 text-destructive",
          )}
        >
          {balanced ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {balanced
            ? "Split is balanced."
            : "Split is out of balance — allocate the full amount to continue."}
        </div>

        <DemoNotice />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!balanced}
            onClick={() => {
              toast("Split saved", { description: DEMO_ACTION_MESSAGE });
              onOpenChange(false);
            }}
          >
            Save split
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
