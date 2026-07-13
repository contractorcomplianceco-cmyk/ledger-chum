import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, ShieldCheck, Sparkles, AlertTriangle, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { DemoNotice, DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RoleWorkspace, RoleMetric, RolePriority, RoleRisk, RoleOpportunity, RoleRecommendation, RoleAdvisor, RoleQuickAction } from "@/lib/mock/apex-role-workspaces";

function demo(label: string) {
  toast(label, { description: DEMO_ACTION_MESSAGE });
}

function ToneIcon({ tone }: { tone?: "up" | "down" | "flat" }) {
  if (tone === "up") return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />;
  if (tone === "down") return <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export function DecisionQuestion({ question, theme }: { question: string; theme: RoleWorkspace["theme"] }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-gradient-to-r p-4 text-white", theme.soft)}>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/60">
        Primary decision question
      </div>
      <div className="mt-1 text-[15px] font-semibold">{question}</div>
    </div>
  );
}

export function RoleWorkspaceHeader({ ws }: { ws: RoleWorkspace }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-6 text-white", ws.theme.soft)}>
      <div
        aria-hidden
        className={cn("pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl bg-gradient-to-br", ws.theme.gradient)}
      />
      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
          Role Workspace · Demonstration
        </div>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight">
          {ws.title}
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] text-white/80">{ws.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className={cn("rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[12px]", ws.theme.accent)}>
            Health {ws.healthScore.value} · {ws.healthScore.label}
          </div>
          <div className="text-[11.5px] text-white/60">Signed in as {ws.name}</div>
        </div>
      </div>
    </div>
  );
}

export function RoleMetricGrid({ metrics, sensitiveVisible }: { metrics: RoleMetric[]; sensitiveVisible: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => {
        const masked = m.sensitive && !sensitiveVisible;
        return (
          <Card key={m.label} className="border-border/70 p-3">
            <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
              <span>{m.label}</span>
              {m.sensitive && (
                <Badge variant="outline" className="text-[10px]">Sensitive</Badge>
              )}
            </div>
            <div className="mt-1 text-[20px] font-semibold text-foreground">
              {masked ? "•••" : m.value}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11.5px] text-muted-foreground">
              {m.delta && !masked && (
                <>
                  <ToneIcon tone={m.tone} />
                  <span>{m.delta}</span>
                </>
              )}
              {m.hint && <span className="ml-auto">{m.hint}</span>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function RolePriorityList({ priorities }: { priorities: RolePriority[] }) {
  if (!priorities.length) return null;
  return (
    <div className="space-y-2">
      {priorities.map((p) => (
        <Card key={p.title} className="border-border/70 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold">{p.title}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    p.urgency === "high" && "border-rose-400/60 text-rose-500",
                    p.urgency === "medium" && "border-amber-400/60 text-amber-600",
                    p.urgency === "low" && "border-muted-foreground/40 text-muted-foreground",
                  )}
                >
                  {p.urgency}
                </Badge>
                {p.requiresApproval && (
                  <Badge variant="outline" className="text-[10px]">
                    <ShieldCheck className="mr-1 h-3 w-3" /> Approval
                  </Badge>
                )}
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">{p.detail}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => demo(`Open: ${p.title}`)}>
              Open
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function RoleRiskPanel({ risks }: { risks: RoleRisk[] }) {
  if (!risks.length) return null;
  return (
    <div className="space-y-2">
      {risks.map((r) => (
        <Card key={r.title} className="border-border/70 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-[13px] font-semibold">{r.title}</span>
            <Badge variant="outline" className="ml-auto text-[10px]">{r.category}</Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                r.severity === "high" && "border-rose-400/60 text-rose-500",
                r.severity === "medium" && "border-amber-400/60 text-amber-600",
              )}
            >
              {r.severity}
            </Badge>
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">{r.detail}</div>
        </Card>
      ))}
    </div>
  );
}

export function RoleOpportunityPanel({ opportunities }: { opportunities: RoleOpportunity[] }) {
  if (!opportunities.length) return null;
  return (
    <div className="space-y-2">
      {opportunities.map((o) => (
        <Card key={o.title} className="border-border/70 p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-500" />
            <span className="text-[13px] font-semibold">{o.title}</span>
            <Badge variant="outline" className="ml-auto text-[10px]">{o.category}</Badge>
            <span className="text-[12px] font-semibold text-emerald-600">{o.potential}</span>
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">{o.detail}</div>
        </Card>
      ))}
    </div>
  );
}

export function RoleRecommendationList({ items }: { items: RoleRecommendation[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      {items.map((r) => (
        <Card key={r.title} className="border-border/70 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">{r.title}</div>
              <div className="mt-1 text-[12px] text-muted-foreground">{r.rationale}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">Impact: {r.impact}</Badge>
                <Badge variant="outline" className="text-[10px]">Confidence {Math.round(r.confidence * 100)}%</Badge>
                <Badge variant="outline" className="text-[10px]">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {r.approval}
                </Badge>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => demo(`Consider: ${r.title}`)}>
              Consider
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function RoleAdvisorCard({ advisor }: { advisor: RoleAdvisor }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
        <Sparkles className="h-4 w-4 text-violet-500" />
        {advisor.persona}
        <Badge variant="outline" className="ml-auto text-[10px]">Advisory only</Badge>
      </div>
      <div className="mt-2 text-[12.5px] italic text-muted-foreground">"{advisor.question}"</div>
      <div className="mt-2 text-[13px] text-foreground">{advisor.summary}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {advisor.actions.map((a) => (
          <Button key={a} size="sm" variant="outline" onClick={() => demo(a)}>
            {a}
          </Button>
        ))}
      </div>
      <div className="mt-3 text-[10.5px] text-muted-foreground">
        Every response carries: answer · evidence · confidence · freshness · assumptions · missing data · impact · recommended action · required approval.
      </div>
    </Card>
  );
}

export function RoleQuickActions({ actions }: { actions: RoleQuickAction[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Button key={a.label} size="sm" variant="outline" onClick={() => demo(a.label)}>
          {a.label}
        </Button>
      ))}
    </div>
  );
}

export function PermissionPreview({ ws }: { ws: RoleWorkspace }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card className="border-border/70 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Visible modules</div>
        <ul className="mt-2 space-y-1 text-[12px] text-foreground">
          {ws.visibleModules.map((m) => <li key={m}>• {m}</li>)}
        </ul>
      </Card>
      <Card className="border-border/70 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">Hidden modules</div>
        {ws.hiddenModules.length ? (
          <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
            {ws.hiddenModules.map((m) => <li key={m}>• {m}</li>)}
          </ul>
        ) : (
          <div className="mt-2 text-[12px] text-muted-foreground">No restrictions — full companywide access.</div>
        )}
        <div className="mt-3 text-[11px] text-muted-foreground">
          Sensitive-data access: <span className={ws.sensitiveVisible ? "text-emerald-600" : "text-rose-600"}>
            {ws.sensitiveVisible ? "Permitted" : "Masked"}
          </span>
        </div>
      </Card>
    </div>
  );
}

export function RoleSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        {description && <p className="text-[12.5px] text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function RoleWorkspaceShell({ ws }: { ws: RoleWorkspace }) {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Project APEX · Role Workspace"
        title={ws.title}
        description={ws.subtitle}
      />
      <div className="px-6 sm:px-8">
        <DemoNotice message="Role workspace — demonstration only. Sensitive modules are masked per role permissions." />
      </div>
      <PageBody>
        <div className="space-y-6">
          <RoleWorkspaceHeader ws={ws} />
          <DecisionQuestion question={ws.decisionQuestion} theme={ws.theme} />

          <RoleSection title="What matters today" description="Signal metrics for this role.">
            <RoleMetricGrid metrics={ws.metrics} sensitiveVisible={ws.sensitiveVisible} />
          </RoleSection>

          <RoleSection title="What needs attention">
            <RolePriorityList priorities={ws.priorities} />
          </RoleSection>

          {ws.recommendations.length > 0 && (
            <RoleSection title="What should I do — Recommendations" description="AI advisory only. Approval always required.">
              <RoleRecommendationList items={ws.recommendations} />
            </RoleSection>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {ws.risks.length > 0 && (
              <RoleSection title="Top risks">
                <RoleRiskPanel risks={ws.risks} />
              </RoleSection>
            )}
            {ws.opportunities.length > 0 && (
              <RoleSection title="Top opportunities">
                <RoleOpportunityPanel opportunities={ws.opportunities} />
              </RoleSection>
            )}
          </div>

          <RoleSection title="AI Advisor">
            <RoleAdvisorCard advisor={ws.advisor} />
          </RoleSection>

          <RoleSection title="Quick actions">
            <RoleQuickActions actions={ws.quickActions} />
          </RoleSection>

          <RoleSection title="Permission preview" description="What this role sees and what is intentionally hidden.">
            <PermissionPreview ws={ws} />
          </RoleSection>
        </div>
      </PageBody>
    </AppShell>
  );
}
