import type { ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Zap,
  BadgeCheck,
  MessageSquare,
  Send,
} from "lucide-react";
import { AppShell, PageBody } from "@/components/app-shell";
import { DemoNotice } from "@/components/banking/demo-notice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfidenceChip, DemoBadge, FreshnessChip } from "@/components/apex/chips";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import type {
  WorkspaceDefinition,
  WorkspaceMetric,
  WorkspaceRecommendation,
  WorkspaceSection as WSection,
  WorkspaceTimelineEntry,
  WorkspaceInsight,
  WorkspaceAdvisor,
  WorkspaceQuickAction,
  WorkspaceTheme,
} from "@/lib/mock/apex-workspaces";

function demo(label: string) {
  toast(label, { description: DEMO_ACTION_MESSAGE });
}

function ToneIcon({ tone }: { tone?: "up" | "down" | "flat" }) {
  if (tone === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (tone === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

/* ------------------------------------------------------------------ */
/* WorkspaceHero                                                       */
/* ------------------------------------------------------------------ */

export function WorkspaceHero({ theme, summary }: { theme: WorkspaceTheme; summary: string }) {
  const titleNode = theme.highlight ? (
    <>
      {theme.title.split(theme.highlight)[0]}
      <span className={cn("bg-clip-text text-transparent bg-gradient-to-r", theme.gradient)}>
        {theme.highlight}
      </span>
      {theme.title.split(theme.highlight)[1]}
    </>
  ) : (
    theme.title
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60",
        "bg-gradient-to-br",
        theme.soft,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl opacity-40 bg-gradient-to-br",
          theme.gradient,
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full blur-3xl opacity-30 bg-gradient-to-tr",
          theme.gradient,
        )}
      />
      <div className="relative flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {theme.eyebrow}
          </span>
          <DemoBadge />
        </div>
        <h1 className="text-[30px] font-bold leading-tight tracking-tight sm:text-[36px]">
          {titleNode}
        </h1>
        <p className="max-w-2xl text-[14.5px] text-muted-foreground">{theme.question}</p>
        <div className="mt-1 flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm bg-gradient-to-br",
              theme.gradient,
            )}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 text-[13.5px] leading-relaxed text-foreground">{summary}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceHealthBar                                                  */
/* ------------------------------------------------------------------ */

export function WorkspaceHealthBar({
  theme,
  health,
  priorities,
}: {
  theme: WorkspaceTheme;
  health: WorkspaceDefinition["health"];
  priorities: string[];
}) {
  return (
    <Card className="grid gap-4 border-border/70 p-5 md:grid-cols-[minmax(0,240px)_1fr]">
      <div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace health
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[38px] font-bold leading-none tracking-tight tabular-nums">
            {health.score}
          </span>
          <span className="text-[13px] text-muted-foreground">/100</span>
        </div>
        <div className="mt-1 text-[13px] font-medium text-foreground">{health.label}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <ConfidenceChip value={health.confidence} />
          <FreshnessChip label={health.freshness} />
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r", theme.gradient)}
            style={{ width: `${Math.min(100, Math.max(0, health.score))}%` }}
          />
        </div>
      </div>
      <div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Today's priorities
        </div>
        <ul className="mt-2 space-y-2">
          {priorities.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px]">
              <span
                className={cn(
                  "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r",
                  theme.gradient,
                )}
              />
              <span className="text-foreground">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceMetricsStrip                                               */
/* ------------------------------------------------------------------ */

export function WorkspaceMetricsStrip({
  theme,
  metrics,
}: {
  theme: WorkspaceTheme;
  metrics: WorkspaceMetric[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((m) => (
        <Card key={m.label} className="relative overflow-hidden border-border/70 p-4">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r",
              theme.gradient,
            )}
          />
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {m.label}
          </div>
          <div className="mt-1 text-[22px] font-bold tabular-nums leading-tight">{m.value}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            {m.delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  m.tone === "up" && "text-success",
                  m.tone === "down" && "text-destructive",
                  m.tone === "flat" && "text-muted-foreground",
                )}
              >
                <ToneIcon tone={m.tone} />
                {m.delta}
              </span>
            )}
            {m.hint && <span className="truncate">· {m.hint}</span>}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceSection                                                    */
/* ------------------------------------------------------------------ */

export function WorkspaceSectionCard({
  theme,
  section,
}: {
  theme: WorkspaceTheme;
  section: WSection;
}) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/70 p-4 transition",
        "hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br",
          theme.gradient,
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[12.5px] font-semibold text-foreground">{section.title}</div>
          {section.delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[11px] font-semibold",
                section.tone === "up" && "text-success",
                section.tone === "down" && "text-destructive",
                section.tone === "flat" && "text-muted-foreground",
              )}
            >
              <ToneIcon tone={section.tone} />
              {section.delta}
            </span>
          )}
        </div>
        {section.value && (
          <div className="mt-1 text-[16px] font-bold tabular-nums">{section.value}</div>
        )}
        <div className="mt-1 text-[11.5px] text-muted-foreground">{section.caption}</div>
      </div>
    </Card>
  );
}

export function WorkspaceSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
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

/* ------------------------------------------------------------------ */
/* WorkspaceRecommendationCard                                         */
/* ------------------------------------------------------------------ */

export function WorkspaceRecommendationCard({
  theme,
  recommendation,
}: {
  theme: WorkspaceTheme;
  recommendation: WorkspaceRecommendation;
}) {
  return (
    <Card className="flex flex-col gap-3 border-border/70 p-4">
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white bg-gradient-to-br",
            theme.gradient,
          )}
        >
          <Zap className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-foreground">{recommendation.title}</div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">{recommendation.body}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white bg-gradient-to-r",
            theme.gradient,
          )}
        >
          <BadgeCheck className="h-3 w-3" />
          {recommendation.impact}
        </span>
        <ConfidenceChip value={recommendation.confidence} />
      </div>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => demo(recommendation.action)}>
          {recommendation.action}
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceQuickActions                                               */
/* ------------------------------------------------------------------ */

export function WorkspaceQuickActions({
  theme,
  actions,
}: {
  theme: WorkspaceTheme;
  actions: WorkspaceQuickAction[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={() => demo(a.label)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-[12.5px] font-medium transition",
            "hover:-translate-y-0.5 hover:shadow-sm hover:text-foreground",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full bg-gradient-to-r", theme.gradient)} />
          {a.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceAdvisor                                                    */
/* ------------------------------------------------------------------ */

export function WorkspaceAdvisorCard({
  theme,
  advisor,
}: {
  theme: WorkspaceTheme;
  advisor: WorkspaceAdvisor;
}) {
  return (
    <Card className="relative overflow-hidden border-border/70 bg-slate-950 p-5 text-white">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl bg-gradient-to-br",
          theme.gradient,
        )}
      />
      <div className="relative flex items-center gap-2">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl text-white bg-gradient-to-br",
            theme.gradient,
          )}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold">{advisor.name}</div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/60">
            {advisor.role}
          </div>
        </div>
      </div>
      <p className="relative mt-4 text-[13.5px] text-white/90">{advisor.greeting}</p>
      <ul className="relative mt-3 space-y-2">
        {advisor.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-[12.5px] text-white/85">
            <span
              className={cn(
                "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r",
                theme.gradient,
              )}
            />
            {b}
          </li>
        ))}
      </ul>
      <div className="relative mt-4">
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-white/60" />
          <Input
            placeholder={`Ask ${advisor.name.split(" ")[0]}…`}
            className="h-7 border-0 bg-transparent p-0 text-[12.5px] text-white placeholder:text-white/50 focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter") demo(`Ask ${advisor.name}`);
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => demo(`Ask ${advisor.name}`)}
            aria-label="Send"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {advisor.prompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => demo(p)}
              className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11.5px] text-white/80 hover:bg-white/10"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceTimeline                                                   */
/* ------------------------------------------------------------------ */

export function WorkspaceTimeline({
  theme,
  entries,
}: {
  theme: WorkspaceTheme;
  entries: WorkspaceTimelineEntry[];
}) {
  return (
    <Card className="border-border/70 p-5">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Workspace timeline
      </div>
      <ol className="mt-3 space-y-3">
        {entries.map((e, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full bg-gradient-to-r",
                  theme.gradient,
                  e.tone === "warning" && "ring-2 ring-warning/50",
                )}
              />
              {i < entries.length - 1 && (
                <span className="mt-1 h-8 w-px bg-border/70" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                <span className="font-mono uppercase tracking-wider">{e.when}</span>
                <span>·</span>
                <span
                  className={cn(
                    "font-semibold",
                    e.tone === "positive" && "text-success",
                    e.tone === "warning" && "text-warning-foreground",
                    (!e.tone || e.tone === "neutral") && "text-foreground",
                  )}
                >
                  {e.label}
                </span>
              </div>
              <div className="mt-0.5 text-[12.5px] text-foreground">{e.detail}</div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceSummary & WorkspaceInsights                                */
/* ------------------------------------------------------------------ */

export function WorkspaceSummary({ theme, summary }: { theme: WorkspaceTheme; summary: string }) {
  return (
    <Card className="relative overflow-hidden border-border/70 p-5">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b",
          theme.gradient,
        )}
      />
      <div className="pl-3">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Executive summary
        </div>
        <p className="mt-1 text-[13.5px] leading-relaxed text-foreground">{summary}</p>
      </div>
    </Card>
  );
}

export function WorkspaceInsights({
  theme,
  insights,
}: {
  theme: WorkspaceTheme;
  insights: WorkspaceInsight[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {insights.map((i) => (
        <Card key={i.label} className="relative overflow-hidden border-border/70 p-4">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r",
              theme.gradient,
            )}
          />
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {i.label}
          </div>
          <div className="mt-1 text-[13px] text-foreground">{i.detail}</div>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceShell                                                      */
/* ------------------------------------------------------------------ */

export function WorkspaceShell({ def }: { def: WorkspaceDefinition }) {
  return (
    <AppShell>
      <main className="animate-in fade-in-50 duration-500">
        <div className="px-6 pt-6 sm:px-8">
          <DemoNotice message="Executive Workspace — demonstration data only. No live inference, no financial actions." />
        </div>
        <PageBody className="space-y-6">
          <WorkspaceHero theme={def.theme} summary={def.summary} />

          <WorkspaceHealthBar theme={def.theme} health={def.health} priorities={def.priorities} />

          <WorkspaceMetricsStrip theme={def.theme} metrics={def.metrics} />

          <WorkspaceSection title="Quick actions" description="One-click executive operations">
            <WorkspaceQuickActions theme={def.theme} actions={def.quickActions} />
          </WorkspaceSection>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <WorkspaceSection
                title="Workspace surfaces"
                description="Every corner of this workspace at a glance"
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {def.sections.map((s) => (
                    <WorkspaceSectionCard key={s.id} theme={def.theme} section={s} />
                  ))}
                </div>
              </WorkspaceSection>

              <WorkspaceSection
                title="Recommendations"
                description="What happens next · what should I do · what is the impact"
              >
                <div className="grid gap-3 md:grid-cols-3">
                  {def.recommendations.map((r) => (
                    <WorkspaceRecommendationCard key={r.id} theme={def.theme} recommendation={r} />
                  ))}
                </div>
              </WorkspaceSection>

              <WorkspaceSection title="Insights">
                <WorkspaceInsights theme={def.theme} insights={def.insights} />
              </WorkspaceSection>
            </div>

            <aside className="space-y-4">
              <WorkspaceAdvisorCard theme={def.theme} advisor={def.advisor} />
              <WorkspaceTimeline theme={def.theme} entries={def.timeline} />
              <WorkspaceSummary theme={def.theme} summary={def.summary} />
            </aside>
          </div>
        </PageBody>
      </main>
    </AppShell>
  );
}
