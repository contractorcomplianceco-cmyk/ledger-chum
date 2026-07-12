import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { RECOVERIES, type Recovery } from "@/lib/mock/expenses";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/expenses/recovery")({
  component: RecoveryPage,
});

const TONE: Record<Recovery["status"], string> = {
  eligible: "bg-brand/10 text-brand",
  on_draft: "bg-warning/15 text-warning",
  invoiced: "bg-brand/10 text-brand",
  collected: "bg-success/10 text-success",
  written_off: "bg-muted text-muted-foreground",
  disputed: "bg-destructive/10 text-destructive",
  at_risk: "bg-destructive/10 text-destructive",
};

const VIEWS: Array<{ id: "all" | Recovery["status"]; label: string }> = [
  { id: "all", label: "All" },
  { id: "eligible", label: "Eligible" },
  { id: "on_draft", label: "On invoice draft" },
  { id: "invoiced", label: "Invoiced" },
  { id: "collected", label: "Collected" },
  { id: "at_risk", label: "At risk" },
  { id: "disputed", label: "Disputed" },
  { id: "written_off", label: "Written off" },
];

function RecoveryPage() {
  const [view, setView] = useState<"all" | Recovery["status"]>("all");
  const rows = view === "all" ? RECOVERIES : RECOVERIES.filter((r) => r.status === view);
  const eligible = RECOVERIES.filter((r) => r.status === "eligible" || r.status === "on_draft").reduce((a, r) => a + r.recoverable, 0);
  const atRisk = RECOVERIES.filter((r) => r.status === "at_risk").reduce((a, r) => a + r.recoverable, 0);
  const collected = RECOVERIES.filter((r) => r.status === "collected").reduce((a, r) => a + r.recoverable, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Eligible for recovery" value={currency(eligible)} sub="not yet billed" tone="warning" icon={<TrendingUp className="h-4 w-4 text-warning" />} />
        <StatCard label="At risk" value={currency(atRisk)} sub="contract deadline near" tone="destructive" icon={<AlertTriangle className="h-4 w-4 text-destructive" />} />
        <StatCard label="Collected YTD" value={currency(collected)} sub="successfully recovered" tone="success" />
      </div>

      <Card className="border-warning/30 bg-warning/5 p-3">
        <div className="flex items-start gap-2 text-[12.5px]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <span><strong className="font-semibold">3 alerts</strong> — recoverable expenses not yet billed to ALD, missing markup on Chipotle onsite meal, and expense outside contract scope for Northstar.</span>
        </div>
      </Card>

      <Card className="border-border/70 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
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

      <Card className="overflow-hidden border-border/70 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Engagement</th>
                <th className="px-3 py-2">Expense</th>
                <th className="px-3 py-2">Vendor</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2 text-right">Markup</th>
                <th className="px-3 py-2 text-right">Recoverable</th>
                <th className="px-3 py-2">Rule</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{r.client}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.engagement}</td>
                  <td className="px-3 py-2">{r.expense}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.vendor}</td>
                  <td className="px-3 py-2 font-tabular text-[12px] text-muted-foreground">{r.date}</td>
                  <td className="px-3 py-2 text-right font-tabular">{currency(r.amount)}</td>
                  <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{(r.markup * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2 text-right font-tabular font-semibold">{currency(r.recoverable)}</td>
                  <td className="px-3 py-2 text-[11.5px] text-muted-foreground">{r.contractRule}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${TONE[r.status]} whitespace-nowrap capitalize`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="outline" className="h-7 text-[11.5px]">Add to invoice</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, sub, tone = "muted", icon }: { label: string; value: string; sub: string; tone?: "muted" | "success" | "warning" | "destructive"; icon?: React.ReactNode }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className={`mt-1 font-tabular text-2xl font-bold ${t}`}>{value}</div>
      <div className="mt-0.5 text-[11.5px] text-muted-foreground">{sub}</div>
    </Card>
  );
}
