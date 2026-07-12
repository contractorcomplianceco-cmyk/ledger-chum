import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COLLECTIONS } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";
import { Phone, Mail, ShieldAlert, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/automation/collections")({
  head: () => ({ meta: [{ title: "Smart Collections — LedgerOS" }] }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const total = COLLECTIONS.reduce((s, c) => s + c.amount, 0);
  const expectedThisWeek = COLLECTIONS.filter((c) => c.probability >= 70).reduce((s, c) => s + c.amount, 0);

  return (
    <AutomationPage
      title="Smart Collections"
      description="Payment-likelihood signals turned into a prioritized collections workspace with recommended contact timing and escalation paths."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Outstanding" value={currency(total)} />
        <Kpi label="Expected next 7 days" value={currency(expectedThisWeek)} tone="success" />
        <Kpi label="At risk (< 50% prob)" value={currency(COLLECTIONS.filter((c) => c.probability < 50).reduce((s, c) => s + c.amount, 0))} tone="destructive" />
      </section>

      <div className="space-y-3">
        {COLLECTIONS.sort((a, b) => b.daysOverdue - a.daysOverdue).map((c) => (
          <Card key={c.id} className="border-border/70 p-4">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.client}</span>
                  <span className="text-[11px] text-muted-foreground">{c.invoice}</span>
                  {c.dispute && <span className="rounded-full border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">Dispute</span>}
                  {c.serviceHold && <span className="rounded-full border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning">Service hold</span>}
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">Behavior · {c.paymentBehavior.replace("_", " ")}</div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Amount</div>
                <div className="font-tabular text-lg font-bold">{currency(c.amount)}</div>
                <div className={cn("text-[11px] font-tabular", c.daysOverdue > 30 ? "text-destructive" : c.daysOverdue > 15 ? "text-warning" : "text-muted-foreground")}>
                  {c.daysOverdue}d overdue
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Probability</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full", c.probability > 70 ? "bg-success" : c.probability > 40 ? "bg-warning" : "bg-destructive")} style={{ width: `${c.probability}%` }} />
                </div>
                <div className="mt-0.5 font-tabular text-[11px]">{c.probability}% · {c.expectedCollection}</div>
              </div>

              <div className="text-[12px]">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Recommended</div>
                <div>{c.recommendedContact}</div>
                <div className="text-[11px] text-muted-foreground">
                  {c.remindersSent} sent · last {c.lastReminder}
                  {c.promiseDate && <> · promise {c.promiseDate}</>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Button size="sm" variant="outline" className="h-7"><Phone className="mr-1 h-3 w-3" /> Call</Button>
                <Button size="sm" variant="outline" className="h-7"><Mail className="mr-1 h-3 w-3" /> Email</Button>
                <Button size="sm" variant="outline" className="h-7"><ShieldAlert className="mr-1 h-3 w-3" /> Hold</Button>
                <Button size="sm" className="h-7"><ArrowUpRight className="mr-1 h-3 w-3" /> Escalate</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AutomationPage>
  );
}

function Kpi({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "destructive" }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-tabular text-[22px] font-bold", tone === "success" && "text-success", tone === "destructive" && "text-destructive")}>{value}</div>
    </Card>
  );
}
