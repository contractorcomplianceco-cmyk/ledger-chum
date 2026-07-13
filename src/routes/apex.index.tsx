import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { EXECUTIVE_WORKSPACES } from "@/lib/mock/nav-executive";

export const Route = createFileRoute("/apex/")({
  head: () => ({
    meta: [
      { title: "Project APEX — LedgerOS" },
      {
        name: "description",
        content:
          "The financial operating system for growth companies — executive intelligence experience planning surface.",
      },
    ],
  }),
  component: ApexOverview,
});

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

function ApexOverview() {
  return (
    <ApexPage
      title="Project APEX Overview"
      description="Transform LedgerOS from module → table → report into signal → explanation → decision → action → outcome."
    >
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
  );
}
