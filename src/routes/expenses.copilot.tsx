import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currency } from "@/lib/mock/finance";
import { COPILOT_ANSWERS, COPILOT_QUESTIONS } from "@/lib/mock/expenses";
import { Sparkles, Send, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/expenses/copilot")({
  component: CopilotPage,
});

const DEFAULT_ANSWER = {
  summary: "Ask about expenses, subscriptions, budgets, anomalies, reimbursements, client recovery, or vendor pricing. Every response includes evidence and a suggested action.",
  evidence: [] as string[],
  confidence: 0,
  impact: 0,
  action: "Pick a question below to see an example response backed by mock data.",
};

function CopilotPage() {
  const [q, setQ] = useState<string>("Why did expenses increase this month?");
  const answer = COPILOT_ANSWERS[q] ?? DEFAULT_ANSWER;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Card className="border-border/70 p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand-cool text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold">Expense Copilot</h3>
              <div className="text-[11.5px] text-muted-foreground">Demonstration insight — based on mock data</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="h-10 flex-1 text-[13px]" />
            <Button className="h-10"><Send className="mr-1.5 h-3.5 w-3.5" /> Ask</Button>
          </div>
        </Card>

        <Card className="border-border/70 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Answer</div>
          <p className="mt-2 text-[14px] leading-relaxed">{answer.summary}</p>

          {answer.evidence.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Evidence</div>
              <ul className="mt-2 space-y-1 text-[12.5px]">
                {answer.evidence.map((e) => (
                  <li key={e} className="rounded-md border border-border/70 bg-muted/30 px-2 py-1 font-mono text-[11.5px]">{e}</li>
                ))}
              </ul>
            </div>
          )}

          {answer.confidence > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
              <Cell label="Confidence" value={`${Math.round(answer.confidence * 100)}%`} />
              <Cell label="Estimated impact" value={currency(answer.impact)} />
              <Cell label="Requires approval" value="Yes" />
            </div>
          )}

          {answer.action && (
            <div className="mt-4 rounded-md border border-brand/20 bg-brand/5 p-3 text-[12.5px]">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-brand">Suggested action</div>
              <div className="mt-1">{answer.action}</div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-2 text-[11.5px] text-warning">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Copilot is read-only. It suggests — humans approve.</span>
          </div>
        </Card>
      </div>

      <aside>
        <Card className="border-border/70 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Example questions</div>
          <ul className="mt-2 space-y-1">
            {COPILOT_QUESTIONS.map((question) => (
              <li key={question}>
                <button
                  onClick={() => setQ(question)}
                  className="w-full rounded-md border border-transparent px-2 py-1.5 text-left text-[12.5px] hover:border-border hover:bg-muted/40"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-2">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-tabular font-semibold">{value}</div>
    </div>
  );
}
