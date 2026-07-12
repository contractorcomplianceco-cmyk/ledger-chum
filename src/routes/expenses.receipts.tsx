import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReceiptCard } from "@/components/expenses/receipt-card";
import { RECEIPTS, type ReceiptStatus } from "@/lib/mock/expenses";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/receipts")({
  component: ReceiptInboxPage,
});

const VIEWS: Array<{ id: "all" | ReceiptStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "processing", label: "Processing" },
  { id: "ready", label: "Ready to Match" },
  { id: "low_confidence", label: "Low Confidence" },
  { id: "possible_duplicate", label: "Possible Duplicate" },
  { id: "missing_expense", label: "Missing Expense" },
  { id: "matched", label: "Matched" },
  { id: "rejected", label: "Rejected" },
];

function ReceiptInboxPage() {
  const [view, setView] = useState<"all" | ReceiptStatus>("all");
  const filtered = view === "all" ? RECEIPTS : RECEIPTS.filter((r) => r.status === view);

  return (
    <div className="space-y-4">
      <Card className="border-border/70 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                view === v.id
                  ? "border-transparent bg-gradient-brand-cool text-white shadow-sm"
                  : "border-border bg-surface text-foreground/80 hover:border-foreground/20",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        <span>Forward receipts to <strong className="font-semibold text-foreground">receipts@ledgeros.demo</strong>, upload from mobile, or import via integration.</span>
        <Button size="sm" variant="outline" className="h-8">Bulk match</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <ReceiptCard key={r.id} r={r} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border p-10 text-center text-[13px] text-muted-foreground">
            No receipts in this view.
          </div>
        )}
      </div>
    </div>
  );
}
