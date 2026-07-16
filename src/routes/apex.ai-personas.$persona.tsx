import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { AIQuestionExamples, AIGovernancePanel } from "@/components/apex/ai-persona-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPersona } from "@/lib/mock/apex-ai-personas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apex/ai-personas/$persona")({
  head: ({ params }) => ({
    meta: [{ title: `${params.persona} — LedgerOS AI Persona` }],
  }),
  loader: ({ params }) => {
    const persona = getPersona(params.persona);
    if (!persona) throw notFound();
    return { persona };
  },
  component: PersonaDetail,
  notFoundComponent: () => (
    <div className="p-8 text-[13px] text-muted-foreground">
      Unknown persona. Return to{" "}
      <Link to="/apex/ai-personas" className="text-primary underline">
        AI Personas
      </Link>
      .
    </div>
  ),
});

function PersonaDetail() {
  const { persona: personaSlug } = Route.useParams();
  const persona = getPersona(personaSlug);
  if (!persona) return null;
  return (
    <ApexPage title={persona.name} description={persona.tagline} decision={persona.questions[0]}>
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-gradient-to-r p-5 text-white",
          persona.theme.gradient,
        )}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
          Governed AI persona
        </div>
        <div className="mt-1 text-[22px] font-semibold">{persona.name}</div>
        <div className="mt-1 text-[13px] text-white/85">{persona.purpose}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {persona.intendedRoles.map((r: string) => (
            <Badge
              key={r}
              variant="outline"
              className="border-white/40 bg-white/10 text-[10.5px] text-white"
            >
              {r}
            </Badge>
          ))}
        </div>
      </div>

      <ApexSection title="Questions this persona supports">
        <Card className="border-border/70 p-3">
          <AIQuestionExamples questions={persona.questions} />
        </Card>
      </ApexSection>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-border/70 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
            Allowed data
          </div>
          <ul className="mt-2 space-y-1 text-[12.5px]">
            {persona.allowedData.map((d: string) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </Card>
        <Card className="border-border/70 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">
            Restricted data
          </div>
          <ul className="mt-2 space-y-1 text-[12.5px]">
            {persona.restrictedData.map((d: string) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </Card>
        <Card className="border-border/70 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Recommendations supported
          </div>
          <ul className="mt-2 space-y-1 text-[12.5px]">
            {persona.recommendations.map((d: string) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </Card>
        <Card className="border-border/70 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Approval requirements
          </div>
          <ul className="mt-2 space-y-1 text-[12.5px]">
            {persona.approvalRequired.map((d: string) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
          <div className="mt-3 text-[11.5px] text-muted-foreground">
            Escalation: <span className="text-foreground">{persona.escalation}</span>
          </div>
        </Card>
      </div>

      <ApexSection title="Universal AI governance">
        <AIGovernancePanel />
      </ApexSection>
    </ApexPage>
  );
}
