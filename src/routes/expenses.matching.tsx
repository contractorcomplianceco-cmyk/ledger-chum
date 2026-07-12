import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfidenceBar } from "@/components/expenses/confidence-bar";
import { currency } from "@/lib/mock/finance";
import { EXPENSES, RECEIPTS } from "@/lib/mock/expenses";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/expenses/matching")({
  component: MatchingPage,
});

type Match = {
  expenseId: string;
  target: string;
  targetKind: "Bank transaction" | "Card charge" | "Receipt" | "Bill" | "Invoice" | "Subscription";
  confidence: number;
  amountVar: number;
  dateVar: number;
  reasons: string[];
  status: "Exact" | "High" | "Possible" | "None" | "Duplicate";
};

const MATCHES: Match[] = [
  { expenseId: "EXP-1042", target: "TXN-2211 · Amex 1004 · $480", targetKind: "Card charge", confidence: 0.99, amountVar: 0, dateVar: 0, reasons: ["Same vendor", "Exact amount", "Same date", "Same card"], status: "Exact" },
  { expenseId: "EXP-1043", target: "RCP-502 · Delta Air Lines $812.40", targetKind: "Receipt", confidence: 0.95, amountVar: 0, dateVar: 0, reasons: ["Same vendor", "Exact amount", "Same day"], status: "High" },
  { expenseId: "EXP-1044", target: "None found", targetKind: "Card charge", confidence: 0.32, amountVar: 0, dateVar: 0, reasons: ["Personal card — no company transaction to match", "Receipt missing"], status: "None" },
  { expenseId: "EXP-1046", target: "TXN-2245 · Amex 1004 · $2,400", targetKind: "Card charge", confidence: 0.94, amountVar: 0, dateVar: 0, reasons: ["Same vendor", "Exact amount", "Recurring pattern (annual)"], status: "Exact" },
  { expenseId: "EXP-1049", target: "TXN-2251 · Amex 1004 · $1,980", targetKind: "Card charge", confidence: 0.88, amountVar: 0, dateVar: 1, reasons: ["Same vendor", "Exact amount", "Date variance 1 day"], status: "High" },
  { expenseId: "EXP-1054", target: "SUB-03 · Replit Teams", targetKind: "Subscription", confidence: 0.72, amountVar: 0, dateVar: 0, reasons: ["Same vendor", "Recurring pattern"], status: "Possible" },
  { expenseId: "EXP-1055", target: "INV-D-2211 · ALD retainer", targetKind: "Invoice", confidence: 0.86, amountVar: 0, dateVar: 0, reasons: ["Pass-through — client attribution", "Same client"], status: "High" },
  { expenseId: "EXP-1043", target: "RCP-510 · Delta duplicate", targetKind: "Receipt", confidence: 0.71, amountVar: 0, dateVar: 0, reasons: ["Same vendor+date+amount ×2"], status: "Duplicate" },
];

const STATUS_TONE: Record<Match["status"], string> = {
  Exact: "bg-success/10 text-success ring-success/20",
  High: "bg-brand/10 text-brand ring-brand/20",
  Possible: "bg-warning/15 text-warning ring-warning/25",
  None: "bg-muted text-muted-foreground ring-border",
  Duplicate: "bg-destructive/10 text-destructive ring-destructive/20",
};

function MatchingPage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/70 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand" />
          <h3 className="text-[13px] font-semibold">Smart matching queue</h3>
          <span className="text-[11.5px] text-muted-foreground">· {EXPENSES.length} expenses · {RECEIPTS.length} receipts</span>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Every match includes confidence, reasoning, and an accounting-impact preview. Approve or reclassify — actions are demonstration only.
        </p>
      </Card>

      <div className="space-y-2">
        {MATCHES.map((m, i) => (
          <Card key={i} className="border-border/70 p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Expense</div>
                <div className="mt-0.5 font-medium">{m.expenseId}</div>
                <div className="text-[11.5px] text-muted-foreground">
                  {EXPENSES.find((e) => e.id === m.expenseId)?.vendor} · {currency(EXPENSES.find((e) => e.id === m.expenseId)?.amount ?? 0)}
                </div>
              </div>

              <div className="hidden items-center justify-center xl:flex">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{m.targetKind}</div>
                <div className="mt-0.5 font-medium">{m.target}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                  {m.reasons.map((r) => (
                    <span key={r} className="rounded-md bg-muted px-1.5 py-0.5">{r}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONE[m.status]}`}>{m.status}</span>
                <ConfidenceBar value={m.confidence} label="Match confidence" />
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 text-[11.5px]">Accept</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[11.5px]">Change</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
