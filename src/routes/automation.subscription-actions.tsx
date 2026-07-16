import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUB_ACTIONS, SUB_ACTION_META } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/automation/subscription-actions")({
  head: () => ({ meta: [{ title: "Subscription Actions — LedgerOS" }] }),
  component: SubscriptionActionsPage,
});

function SubscriptionActionsPage() {
  const expected = SUB_ACTIONS.reduce((s, a) => s + a.expectedSavings, 0);
  const realized = SUB_ACTIONS.reduce((s, a) => s + a.realizedSavings, 0);

  return (
    <AutomationPage
      title="Subscription Action Center"
      description="Convert subscription recommendations into tracked workflows — reduce, cancel, renegotiate, consolidate — with expected vs realized savings."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Expected annual savings" value={currency(expected)} tone="success" />
        <Kpi label="Realized to date" value={currency(realized)} tone="success" />
        <Kpi
          label="Open actions"
          value={String(SUB_ACTIONS.filter((a) => a.status !== "done").length)}
        />
      </section>

      <Card className="border-border/70 p-0">
        <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr_1fr_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Vendor</span>
          <span>Action</span>
          <span>Owner</span>
          <span>Due</span>
          <span>Expected</span>
          <span>Realized</span>
          <span>Status</span>
        </div>
        {SUB_ACTIONS.map((a) => (
          <div
            key={a.id}
            className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 border-b border-border px-4 py-3 text-[12.5px] last:border-b-0"
          >
            <div>
              <div className="font-medium">{a.vendor}</div>
              <div className="text-[11px] text-muted-foreground">{a.notes}</div>
            </div>
            <span className="text-[11.5px]">{SUB_ACTION_META[a.recommendation]}</span>
            <span className="text-[11.5px] text-muted-foreground">{a.owner}</span>
            <span className="text-[11.5px] text-muted-foreground">{a.due}</span>
            <span className="font-tabular text-success">{currency(a.expectedSavings)}</span>
            <span className="font-tabular">{currency(a.realizedSavings)}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase",
                a.status === "open" && "border-border bg-muted/40 text-muted-foreground",
                a.status === "in_progress" && "border-brand/30 bg-brand/10 text-brand",
                a.status === "done" && "border-success/30 bg-success/10 text-success",
                a.status === "blocked" &&
                  "border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              {a.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </Card>

      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          Assign owner
        </Button>
        <Button size="sm" variant="outline">
          Bulk mark done
        </Button>
        <Button size="sm">Create renewal task</Button>
      </div>
    </AutomationPage>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-tabular text-[22px] font-bold",
          tone === "success" && "text-success",
        )}
      >
        {value}
      </div>
    </Card>
  );
}
