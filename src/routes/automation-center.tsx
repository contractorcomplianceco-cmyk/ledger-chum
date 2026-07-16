import { createFileRoute, Link } from "@tanstack/react-router";
import { AutomationPage } from "@/components/automation/automation-page";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mock/finance";
import {
  AUTOMATION_KPIS,
  AUTOMATION_RULES,
  APPROVAL_ITEMS,
  EXCEPTIONS,
  ACTION_PLANS,
  DECISION_LOG,
  GUARDRAILS,
  INTEGRATIONS_HEALTH,
  RULE_STATUS_META,
} from "@/lib/mock/automation";
import { cn } from "@/lib/utils";
import { ArrowRight, ShieldCheck, AlertTriangle, Bot, Coins } from "lucide-react";

export const Route = createFileRoute("/automation-center")({
  head: () => ({
    meta: [
      { title: "Automation Center — LedgerOS" },
      {
        name: "description",
        content: "Turn insight into recommendation, approval, action, result, and audit record.",
      },
    ],
  }),
  component: AutomationCenter,
});

function AutomationCenter() {
  const k = AUTOMATION_KPIS;
  return (
    <AutomationPage
      title="Automation & Controls Command Center"
      description="Insight → Recommendation → Approval → Action → Result → Audit. One control plane."
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Active rules"
          value={String(k.activeRules)}
          sub={`${k.testRules} in test mode`}
          icon={<Bot className="h-4 w-4" />}
        />
        <Kpi
          label="Pending approvals"
          value={String(k.pendingApprovals)}
          sub="Cross-source queue"
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="brand"
        />
        <Kpi
          label="Open exceptions"
          value={String(k.openExceptions)}
          sub={`${k.guardrailBreaches} guardrail breach`}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="warning"
        />
        <Kpi
          label="Expected savings"
          value={currency(k.expectedSavings)}
          sub={`${currency(k.realizedSavings)} realized`}
          icon={<Coins className="h-4 w-4" />}
          tone="success"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="Recent rule executions" to="/automation/rules">
          <ul className="divide-y divide-border text-[12.5px]">
            {AUTOMATION_RULES.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.lastRun} · {r.successCount} ok · {r.failureCount} err
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
                    RULE_STATUS_META[r.status].tone,
                  )}
                >
                  {RULE_STATUS_META[r.status].label}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Approvals awaiting review" to="/automation/approvals">
          <ul className="divide-y divide-border text-[12.5px]">
            {APPROVAL_ITEMS.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {a.approver} · due {a.deadline}
                  </div>
                </div>
                <div className="font-tabular text-[12px]">{currency(a.amount)}</div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Top exceptions by dollar impact" to="/automation/exceptions">
          <ul className="divide-y divide-border text-[12.5px]">
            {[...EXCEPTIONS]
              .sort((a, b) => b.dollarImpact - a.dollarImpact)
              .slice(0, 5)
              .map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{e.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {e.owner} · {e.age}d old · conf {e.confidence}%
                    </div>
                  </div>
                  <div className="font-tabular text-[12px] text-destructive">
                    {currency(e.dollarImpact)}
                  </div>
                </li>
              ))}
          </ul>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="Active action plans" to="/automation/action-plans">
          <ul className="space-y-3 text-[12.5px]">
            {ACTION_PLANS.slice(0, 3).map((p) => (
              <li key={p.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{p.objective}</span>
                  <span className="text-[11px] text-muted-foreground">{p.progressPct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-brand-cool"
                    style={{ width: `${p.progressPct}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {p.owner} · Expected {currency(p.expectedSavings)} · Realized{" "}
                  {currency(p.realizedSavings)}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Cash guardrails" to="/automation/cash-controls">
          <ul className="divide-y divide-border text-[12.5px]">
            {GUARDRAILS.slice(0, 5).map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{g.label}</div>
                  <div className="text-[11px] text-muted-foreground">{g.description}</div>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
                    g.status === "healthy" && "border-success/30 bg-success/10 text-success",
                    g.status === "watch" && "border-warning/30 bg-warning/10 text-warning",
                    g.status === "breach" &&
                      "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {g.status}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Integration health" to="/automation/integration-health">
          <ul className="divide-y divide-border text-[12.5px]">
            {INTEGRATIONS_HEALTH.slice(0, 5).map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{i.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {i.lastSync} · {i.errors24h} err/24h
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
                    i.status === "healthy" && "border-success/30 bg-success/10 text-success",
                    i.status === "degraded" && "border-warning/30 bg-warning/10 text-warning",
                    i.status === "down" &&
                      "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {i.status}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section>
        <Panel title="Latest leadership decisions" to="/automation/decision-log">
          <ul className="divide-y divide-border text-[12.5px]">
            {DECISION_LOG.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{d.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {d.date} · {d.decidedBy} · {d.rationale}
                  </div>
                </div>
                <div className="font-tabular text-[12px]">{currency(d.amount)}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </AutomationPage>
  );
}

function Kpi({
  label,
  value,
  sub,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "default" | "brand" | "warning" | "success";
}) {
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div
        className={cn(
          "mt-1 font-tabular text-[22px] font-bold",
          tone === "brand" && "text-brand",
          tone === "warning" && "text-warning",
          tone === "success" && "text-success",
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </Card>
  );
}

function Panel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold">{title}</h3>
        <Link
          to={to as "/automation-center"}
          className="inline-flex items-center gap-1 text-[11.5px] text-brand hover:underline"
        >
          Open <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {children}
    </Card>
  );
}
