import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceIndicator } from "@/components/banking/confidence-indicator";
import { DemoNotice, DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import { MATCH_CANDIDATES } from "@/lib/mock/banking";
import { currencyPrecise } from "@/lib/mock/finance";
import { toast } from "sonner";
import { useState } from "react";
import { Search } from "lucide-react";

export function MatchPicker({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = MATCH_CANDIDATES.filter(
    (c) => !query || c.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Match transaction</SheetTitle>
          <SheetDescription>
            Match against invoice payments, bill payments, expenses, journal entries, or transfers.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search records…"
                className="pl-9"
              />
            </div>
            <Badge variant="outline">Date ±5 days</Badge>
            <Badge variant="outline">Amount ±1%</Badge>
          </div>

          <div className="space-y-2">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {c.type}
                    </Badge>
                    <span className="truncate text-sm font-medium">{c.label}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{c.date}</span>
                    <span className="font-tabular">{currencyPrecise(c.amount)}</span>
                    {c.diff !== 0 && (
                      <span className="font-tabular text-warning">Δ {currencyPrecise(c.diff)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ConfidenceIndicator value={c.confidence} />
                  <Button
                    size="sm"
                    onClick={() => {
                      toast(`Matched to ${c.label}`, { description: DEMO_ACTION_MESSAGE });
                      onOpenChange(false);
                    }}
                  >
                    Match
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DemoNotice />
        </div>
      </SheetContent>
    </Sheet>
  );
}
