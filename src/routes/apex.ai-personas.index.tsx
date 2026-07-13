import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { AIPersonaCard, AIGovernancePanel } from "@/components/apex/ai-persona-card";
import { AI_PERSONAS, PERSONA_ORDER } from "@/lib/mock/apex-ai-personas";

export const Route = createFileRoute("/apex/ai-personas/")({
  head: () => ({
    meta: [
      { title: "AI Personas — Project APEX" },
      { name: "description", content: "One governed AI system, presented through specialized advisors — all advisory, never autonomous." },
    ],
  }),
  component: PersonasIndex,
});

function PersonasIndex() {
  return (
    <ApexPage
      title="LedgerOS AI Personas"
      description="One governed AI system, presented through specialized advisors. All personas are advisory — never autonomous."
      decision="Which advisor best fits the question in front of me?"
    >
      <ApexSection title="Personas">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PERSONA_ORDER.map((k) => (
            <AIPersonaCard key={k} persona={AI_PERSONAS[k]} />
          ))}
        </div>
      </ApexSection>
      <ApexSection title="AI governance — universal contract">
        <AIGovernancePanel />
      </ApexSection>
    </ApexPage>
  );
}
