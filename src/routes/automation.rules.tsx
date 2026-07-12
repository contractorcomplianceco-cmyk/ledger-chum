import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AUTOMATION_RULES, RULE_CATEGORY_META, RULE_STATUS_META, type AutomationRule } from "@/lib/mock/automation";
import { cn } from "@/lib/utils";
import { Plus, Play, Pause, History } from "lucide-react";

export const Route = createFileRoute("/automation/rules")({
  head: () => ({ meta: [{ title: "Automation Rules — LedgerOS" }] }),
  component: RulesPage,
});

function RulesPage() {
  const [selected, setSelected] = useState<AutomationRule>(AUTOMATION_RULES[0]);
  return (
    <AutomationPage
      title="Automation Rule Builder"
      description="No-code triggers, conditions, actions, approvals and audit — everything Rose and Christin need to codify how CCA handles money."
      actions={<Button size="sm" className="h-9"><Plus className="mr-1.5 h-3.5 w-3.5" /> New rule</Button>}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-border/70 p-0">
          <div className="grid grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Rule</span>
            <span>Category</span>
            <span>Owner</span>
            <span>Runs</span>
            <span>Status</span>
          </div>
          {AUTOMATION_RULES.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className={cn(
                "grid w-full grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_auto] items-center gap-2 border-b border-border px-4 py-3 text-left text-[12.5px] transition last:border-b-0",
                selected.id === r.id ? "bg-brand/5" : "hover:bg-muted/30",
              )}
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{r.name}</div>
                <div className="text-[11px] text-muted-foreground">Last run · {r.lastRun}</div>
              </div>
              <span className={cn("text-[11.5px] font-medium", RULE_CATEGORY_META[r.category].tone)}>
                {RULE_CATEGORY_META[r.category].label}
              </span>
              <span className="text-[11.5px] text-muted-foreground">{r.owner}</span>
              <span className="font-tabular text-[11.5px]">
                <span className="text-success">{r.successCount}</span>
                <span className="text-muted-foreground"> / </span>
                <span className="text-destructive">{r.failureCount}</span>
              </span>
              <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-semibold", RULE_STATUS_META[r.status].tone)}>
                {RULE_STATUS_META[r.status].label}
              </span>
            </button>
          ))}
        </Card>

        <RuleDetail rule={selected} />
      </div>
    </AutomationPage>
  );
}

function RuleDetail({ rule }: { rule: AutomationRule }) {
  return (
    <Card className="border-border/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Rule {rule.id}</div>
          <div className="font-semibold">{rule.name}</div>
        </div>
        <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-semibold", RULE_STATUS_META[rule.status].tone)}>
          {RULE_STATUS_META[rule.status].label}
        </span>
      </div>

      <dl className="mt-4 space-y-2 text-[12.5px]">
        <Field label="Trigger" value={rule.trigger} />
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Conditions</div>
          <ul className="mt-0.5 space-y-0.5">
            {rule.conditions.map((c) => (
              <li key={c} className="text-foreground">• {c}</li>
            ))}
          </ul>
        </div>
        <Field label="Action" value={rule.action} />
        <Field label="Approval requirement" value={rule.approval === "none" ? "None (system runs)" : rule.approval === "rose" ? "Rose" : rule.approval === "manager" ? "Manager" : "Dual approval"} />
        <Field label="Owner" value={rule.owner} />
        <Field label="Effective date" value={rule.effective} />
        <Field label="Last execution" value={rule.lastRun} />
        <div className="flex gap-4 pt-1">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Success</div>
            <div className="font-tabular text-lg font-bold text-success">{rule.successCount}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Failures</div>
            <div className="font-tabular text-lg font-bold text-destructive">{rule.failureCount}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Audit entries</div>
            <div className="font-tabular text-lg font-bold">{rule.auditCount}</div>
          </div>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-1.5">
        <Button size="sm" variant="outline" className="h-8"><Play className="mr-1 h-3.5 w-3.5" /> Test mode</Button>
        <Button size="sm" variant="outline" className="h-8"><Pause className="mr-1 h-3.5 w-3.5" /> Pause</Button>
        <Button size="sm" variant="outline" className="h-8"><History className="mr-1 h-3.5 w-3.5" /> Audit history</Button>
        <Button size="sm" className="h-8">Edit rule</Button>
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-foreground">{value}</div>
    </div>
  );
}
