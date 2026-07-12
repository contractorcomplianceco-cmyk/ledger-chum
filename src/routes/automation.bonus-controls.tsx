import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BONUS_CONTROLS } from "@/lib/mock/automation";
import { currency } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/automation/bonus-controls")({
  head: () => ({ meta: [{ title: "Bonus Controls — LedgerOS" }] }),
  component: BonusControlsPage,
});

const STATUS_TONE = {
  cleared: "border-brand/30 bg-brand/10 text-brand",
  partial_hold: "border-warning/30 bg-warning/10 text-warning",
  hold: "border-destructive/30 bg-destructive/10 text-destructive",
  released: "border-success/30 bg-success/10 text-success",
} as const;

function BonusControlsPage() {
  const earned = BONUS_CONTROLS.reduce((s, b) => s + b.earned, 0);
  const held = BONUS_CONTROLS.reduce((s, b) => s + b.held, 0);
  const released = BONUS_CONTROLS.reduce((s, b) => s + b.released, 0);

  return (
    <AutomationPage
      title="Bonus Controls"
      description="Bonus eligibility linked to invoice payment. Hold, release, or partial-release with full explanation and audit trail."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Total earned" value={currency(earned)} />
        <Kpi label="On hold (unpaid invoice)" value={currency(held)} tone="warning" />
        <Kpi label="Released" value={currency(released)} tone="success" />
      </section>

      <Card className="border-border/70 p-0">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_1.4fr_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Employee</span>
          <span>Plan</span>
          <span>Earned</span>
          <span>Eligible</span>
          <span>Held</span>
          <span>Released</span>
          <span>Reason</span>
          <span>Status</span>
        </div>
        {BONUS_CONTROLS.map((b) => (
          <div key={b.id} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_1.4fr_auto] items-center gap-2 border-b border-border px-4 py-3 text-[12.5px] last:border-b-0">
            <span className="font-medium">{b.employee}</span>
            <span className="text-[11.5px] text-muted-foreground">{b.plan}</span>
            <span className="font-tabular">{currency(b.earned)}</span>
            <span className="font-tabular">{currency(b.eligible)}</span>
            <span className="font-tabular text-warning">{currency(b.held)}</span>
            <span className="font-tabular text-success">{currency(b.released)}</span>
            <span className="text-[11.5px] text-muted-foreground">{b.reason}</span>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase", STATUS_TONE[b.status])}>{b.status.replace("_", " ")}</span>
          </div>
        ))}
      </Card>

      <div className="flex gap-2">
        <Button size="sm" variant="outline">Recompute eligibility</Button>
        <Button size="sm" variant="outline">Release cleared</Button>
        <Button size="sm">Request Rose approval</Button>
      </div>
    </AutomationPage>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-tabular text-[22px] font-bold", tone === "success" && "text-success", tone === "warning" && "text-warning")}>{value}</div>
    </Card>
  );
}
