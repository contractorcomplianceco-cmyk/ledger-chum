import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apex/handoff")({
  head: () => ({ meta: [{ title: "Production Handoff — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Project APEX — Production Handoff"
      description="Acceptance matrix, backend requirements, and validation gates before Project APEX moves toward production."
    >
      <ApexSection title="Acceptance matrix (must hold at every stage)">
        <Card className="border-border/70 p-3">
          <ul className="list-disc space-y-1 pl-5 text-[12.5px] text-muted-foreground">
            <li>All existing routes remain functional.</li>
            <li>Operational navigation remains available and is the default.</li>
            <li>Executive navigation mode works and persists locally.</li>
            <li>Every major metric explains why it changed.</li>
            <li>Every recommendation carries evidence, confidence, and freshness.</li>
            <li>Company Health is fully explainable.</li>
            <li>Opportunity Engine reports estimated financial impact.</li>
            <li>Financial DNA traces complete mock paths.</li>
            <li>Relationship Graph has an accessible list alternative.</li>
            <li>Digital Twin is labeled demonstration-only.</li>
            <li>Role-specific screens protect sensitive values.</li>
            <li>Mobile, tablet, and reduced-motion layouts pass QA.</li>
            <li>Typecheck and production build stay green.</li>
            <li>No backend, Supabase, or auth changes are introduced by APEX work.</li>
          </ul>
        </Card>
      </ApexSection>

      <ApexSection title="Handoff documents">
        <Card className="border-border/70 p-3 text-[12px] text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>docs/production-handoff/apex-vision.md</li>
            <li>docs/production-handoff/apex-experience-architecture.md</li>
            <li>docs/production-handoff/apex-navigation-3.md</li>
            <li>docs/production-handoff/apex-decision-map.md</li>
            <li>docs/production-handoff/apex-widget-system.md</li>
            <li>docs/production-handoff/apex-ai-interaction-model.md</li>
            <li>docs/production-handoff/apex-company-health.md</li>
            <li>docs/production-handoff/apex-opportunity-engine.md</li>
            <li>docs/production-handoff/apex-financial-dna.md</li>
            <li>docs/production-handoff/apex-relationship-graph.md</li>
            <li>docs/production-handoff/apex-financial-timeline.md</li>
            <li>docs/production-handoff/apex-digital-twin.md</li>
            <li>docs/production-handoff/apex-executive-briefing.md</li>
            <li>docs/production-handoff/apex-role-workspaces.md</li>
            <li>docs/production-handoff/apex-ai-personas.md</li>
            <li>docs/production-handoff/apex-design-system.md</li>
            <li>docs/production-handoff/apex-backend-requirements.md</li>
            <li>docs/production-handoff/apex-acceptance-matrix.md</li>
            <li>docs/production-handoff/apex-production-handoff.md</li>
          </ul>
        </Card>
      </ApexSection>
    </ApexPage>
  ),
});
