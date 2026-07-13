import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { EXECUTIVE_WORKSPACES } from "@/lib/mock/nav-executive";

const PILLARS = [
  { q: "Can we safely spend money?", ws: "Money" },
  { q: "Did we make money?", ws: "Money" },
  { q: "Why did profit change?", ws: "Money" },
  { q: "What requires attention today?", ws: "Home" },
  { q: "Where are we leaking revenue or margin?", ws: "Growth" },
  { q: "What is financially unhealthy?", ws: "Home" },
  { q: "Can we hire?", ws: "People" },
  { q: "Can we expand?", ws: "Growth" },
  { q: "Can we afford a proposed decision?", ws: "Money" },
  { q: "What is the smartest next action?", ws: "Home" },
];

export const Route = createFileRoute("/apex/architecture")({
  head: () => ({ meta: [{ title: "Experience Architecture — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Experience Architecture"
      description="How LedgerOS becomes signal → explanation → decision → action → outcome. This surface documents the model before any UI rewrite."
    >
      <ApexSection title="Every major screen answers seven questions">
        <ol className="grid list-decimal gap-1 pl-5 text-[12.5px] text-muted-foreground sm:grid-cols-2">
          <li>What happened?</li>
          <li>Why did it happen?</li>
          <li>Why does it matter?</li>
          <li>What should the user do next?</li>
          <li>What evidence supports the recommendation?</li>
          <li>Who must approve the action?</li>
          <li>What financial impact will the action have?</li>
        </ol>
      </ApexSection>

      <ApexSection
        title="Explainability standard"
        description="Every metric, insight, and recommendation surfaces the same explainability contract."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Metric surface", "Current, prior, target, trend, why it changed, contributors, detractors, risk, action, evidence, confidence, freshness."],
            ["Insight surface", "Direct answer, period, entity, evidence, calculation method, confidence, freshness, assumptions, missing data, action, approval."],
            ["Recommendation surface", "Estimated impact, effort, horizon, risk, evidence, owner, next step, required approval, status, outcome."],
            ["Ask LedgerOS surface", "Persona, permitted data, prohibited actions, required evidence, demonstration label, escalation path."],
          ].map(([t, d]) => (
            <Card key={t} className="border-border/70 p-3">
              <div className="text-[13px] font-semibold">{t}</div>
              <div className="mt-1 text-[12px] text-muted-foreground">{d}</div>
            </Card>
          ))}
        </div>
      </ApexSection>

      <ApexSection
        title="Light/dark visual balance"
        description="Approximately 70% light workspace, 30% dark executive surfaces. Deep navy sidebar, cool-gray background, white operational cards, selective dark navy intelligence cards, electric blue / cyan / teal / violet accents."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="border-border/70 bg-background p-4">
            <div className="text-[12px] font-semibold text-muted-foreground">Operational surface</div>
            <div className="mt-2 text-[15px] font-semibold">White card, tabular data, high readability</div>
            <div className="mt-1 text-[12px] text-muted-foreground">Used for day-to-day accounting workflows.</div>
          </Card>
          <Card className="border-none bg-gradient-to-br from-slate-950 to-indigo-950 p-4 text-white">
            <div className="text-[12px] font-semibold text-white/60">Intelligence surface</div>
            <div className="mt-2 text-[15px] font-semibold">Dark navy card, controlled glow, executive tone</div>
            <div className="mt-1 text-[12px] text-white/70">Used selectively for pulses, briefings, and health.</div>
          </Card>
        </div>
      </ApexSection>

      <ApexSection
        title="Executive decision questions"
        description="Every major APEX surface answers one of these questions with evidence, confidence, and a recommended next action."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <Card key={p.q} className="border-border/70 p-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {p.ws} workspace
              </div>
              <div className="mt-1 text-[13.5px] font-semibold">{p.q}</div>
            </Card>
          ))}
        </div>
      </ApexSection>

      <ApexSection
        title="Five executive workspaces"
        description="Optional Navigation 3.0 overlay. Operational navigation remains the default."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {EXECUTIVE_WORKSPACES.filter((w) => w.id !== "admin").map((w) => (
            <Card key={w.id} className="border-border/70 p-4">
              <div className="flex items-center gap-2">
                <w.icon className="h-4 w-4 text-info" />
                <div className="text-[14px] font-semibold">{w.title}</div>
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">{w.decision}</div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                <span className="font-mono">{w.items.length}</span> curated routes ·
                landing at <span className="font-mono">{w.landing}</span>
              </div>
            </Card>
          ))}
        </div>
      </ApexSection>

      <ApexSection
        title="Implementation stages"
        description="Sequenced to protect the current build; each stage gates on green typecheck and build."
      >
        <ol className="list-decimal space-y-1 pl-5 text-[12.5px] text-muted-foreground">
          <li><span className="font-semibold text-foreground">APEX 1</span> — Experience architecture, docs, planning routes, Navigation 3.0 toggle.</li>
          <li><span className="font-semibold text-foreground">APEX 2</span> — Design-token refinement, Executive shell, Pulse widgets, explainability components.</li>
          <li><span className="font-semibold text-foreground">APEX 3</span> — Home workspace, Company Health, Executive Briefing, Today's Priorities.</li>
          <li><span className="font-semibold text-foreground">APEX 4</span> — Money, Growth, People, and Company workspace landings.</li>
          <li><span className="font-semibold text-foreground">APEX 5</span> — Opportunity Engine, Financial DNA, Timeline, Relationship Graph.</li>
          <li><span className="font-semibold text-foreground">APEX 6</span> — Digital Twin, AI personas, role-specific variants.</li>
          <li><span className="font-semibold text-foreground">APEX 7</span> — Responsive, accessibility, handoff docs, regression review.</li>
        </ol>
      </ApexSection>
    </ApexPage>
  ),
});
