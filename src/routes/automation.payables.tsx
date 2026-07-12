import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PAYABLES, PRIORITY_META } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/automation/payables")({
  head: () => ({ meta: [{ title: "Payables Control — LedgerOS" }] }),
  component: PayablesPage,
});

function PayablesPage() {
  const groups: Array<{ key: keyof typeof PRIORITY_META; label: string }> = [
    { key: "must_pay", label: "Must pay this week" },
    { key: "critical_delivery", label: "Client-critical delivery" },
    { key: "restricted", label: "Restricted obligations (funded by pass-through)" },
    { key: "at_risk", label: "At risk — vendor penalty or campaign impact" },
    { key: "safe_delay", label: "Safe to delay" },
  ];

  const total = PAYABLES.reduce((s, p) => s + p.amount, 0);
  const cashHit = PAYABLES.reduce((s, p) => s + p.cashImpact, 0);
  const restricted = PAYABLES.filter((p) => p.priority === "restricted").reduce((s, p) => s + p.amount, 0);

  return (
    <AutomationPage
      title="Payables Control"
      description="What must be paid, what can be delayed safely, and which payments would violate cash guardrails — before the wire is sent."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Total due" value={currency(total)} />
        <Kpi label="Net cash impact" value={currency(cashHit)} tone="destructive" />
        <Kpi label="Restricted (funded)" value={currency(restricted)} tone="success" />
      </section>

      <div className="space-y-5">
        {groups.map((g) => {
          const rows = PAYABLES.filter((p) => p.priority === g.key);
          if (rows.length === 0) return null;
          return (
            <section key={g.key}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-[13px] font-semibold">{g.label}</h3>
                <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-semibold", PRIORITY_META[g.key].tone)}>
                  {PRIORITY_META[g.key].label}
                </span>
              </div>
              <Card className="border-border/70 p-0">
                <div className="grid grid-cols-[1.5fr_1fr_auto_1fr_auto_auto] items-center gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Vendor</span>
                  <span>Category</span>
                  <span>Due</span>
                  <span>Amount</span>
                  <span>Cash Δ</span>
                  <span>Action</span>
                </div>
                {rows.map((p) => (
                  <div key={p.id} className="grid grid-cols-[1.5fr_1fr_auto_1fr_auto_auto] items-center gap-2 border-b border-border px-4 py-3 text-[12.5px] last:border-b-0">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.vendor}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {p.bill}
                        {p.discount && <> · <span className="text-success">{p.discount} discount</span></>}
                        {p.penalty && <> · <span className="text-destructive">{p.penalty}</span></>}
                      </div>
                    </div>
                    <span className="text-[11.5px] text-muted-foreground">{p.category}</span>
                    <span className="text-[11.5px] text-muted-foreground">{p.due}</span>
                    <span className="font-tabular text-right">{currency(p.amount)}</span>
                    <span className={cn("font-tabular text-right text-[11.5px]", p.cashImpact === 0 ? "text-muted-foreground" : "text-destructive")}>{currency(p.cashImpact)}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7">Pay</Button>
                      <Button size="sm" variant="outline" className="h-7">Delay</Button>
                    </div>
                  </div>
                ))}
              </Card>
            </section>
          );
        })}
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
