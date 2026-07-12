import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ACTION_PLANS } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";
import { Plus, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/automation/action-plans")({
  head: () => ({ meta: [{ title: "Action Plans — LedgerOS" }] }),
  component: ActionPlansPage,
});

function ActionPlansPage() {
  const expected = ACTION_PLANS.reduce((s, a) => s + a.expectedSavings, 0);
  const realized = ACTION_PLANS.reduce((s, a) => s + a.realizedSavings, 0);

  return (
    <AutomationPage
      title="Action Plans"
      description="Turn any insight into a leadership action plan — objective, owner, tasks, expected vs realized savings, approval, and outcome."
      actions={<Button size="sm" className="h-9"><Plus className="mr-1.5 h-3.5 w-3.5" /> New action plan</Button>}
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Active plans" value={String(ACTION_PLANS.filter((a) => a.status !== "done").length)} />
        <Kpi label="Expected savings" value={currency(expected)} tone="success" />
        <Kpi label="Realized savings" value={currency(realized)} tone="success" />
      </section>

      <div className="grid gap-3 xl:grid-cols-2">
        {ACTION_PLANS.map((p) => (
          <Card key={p.id} className="border-border/70 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{p.id} · {p.owner}</div>
                <div className="font-semibold">{p.objective}</div>
                <div className="text-[11.5px] text-muted-foreground">Due {p.due} · Sources: {p.sources.join(", ")}</div>
              </div>
              <span className={cn(
                "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase",
                p.status === "done" && "border-success/30 bg-success/10 text-success",
                p.status === "in_progress" && "border-brand/30 bg-brand/10 text-brand",
                p.status === "at_risk" && "border-warning/30 bg-warning/10 text-warning",
                p.status === "not_started" && "border-border bg-muted/40 text-muted-foreground",
              )}>{p.status.replace("_", " ")}</span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-tabular">{p.progressPct}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-gradient-brand-cool" style={{ width: `${p.progressPct}%` }} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
              <Cell label="Expected" value={currency(p.expectedSavings)} tone="success" />
              <Cell label="Realized" value={currency(p.realizedSavings)} tone="success" />
              <Cell label="Approval" value={p.approval === "approved" ? "Approved" : "Pending"} />
            </div>

            <ul className="mt-3 space-y-1 text-[12.5px]">
              {p.tasks.map((t) => (
                <li key={t.title} className="flex items-center gap-2">
                  {t.done ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className={cn(t.done && "text-muted-foreground line-through")}>{t.title}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex gap-1.5">
              <Button size="sm" variant="outline" className="h-7">Add task</Button>
              <Button size="sm" variant="outline" className="h-7">Reassign</Button>
              <Button size="sm" className="h-7">Mark milestone</Button>
            </div>
          </Card>
        ))}
      </div>
    </AutomationPage>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-tabular text-[22px] font-bold", tone === "success" && "text-success")}>{value}</div>
    </Card>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="rounded-md border border-border/70 bg-muted/30 p-2">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-tabular font-semibold", tone === "success" && "text-success")}>{value}</div>
    </div>
  );
}
