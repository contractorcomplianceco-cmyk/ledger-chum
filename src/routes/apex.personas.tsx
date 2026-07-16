import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

const PERSONAS: Array<{ name: string; purpose: string; roles: string }> = [
  {
    name: "LedgerOS CFO",
    purpose: "Strategic financial guidance for owner/executive decisions.",
    roles: "Owner, Sales Leadership",
  },
  {
    name: "LedgerOS Controller",
    purpose: "Close-readiness, exceptions, verification, and reconciliation.",
    roles: "Accounting Lead, Systems Reviewer",
  },
  {
    name: "LedgerOS Revenue Architect",
    purpose: "Attribution, pricing, and revenue recognition guidance.",
    roles: "Sales Leadership, Owner",
  },
  {
    name: "LedgerOS Growth Advisor",
    purpose: "Marketing, expansion, and customer profitability guidance.",
    roles: "Owner, Marketing",
  },
  {
    name: "LedgerOS Cash Advisor",
    purpose: "True available cash, obligations, restricted vs available.",
    roles: "Owner, Accounting Lead",
  },
  {
    name: "LedgerOS Operations Advisor",
    purpose: "Exceptions, action plans, collections, and vendor issues.",
    roles: "Operations",
  },
  {
    name: "LedgerOS Tax Opportunity Advisor",
    purpose: "Potential tax exposures and opportunities for professional review.",
    roles: "Owner, Accounting Advisor",
  },
  {
    name: "LedgerOS Risk Advisor",
    purpose: "Compliance, governance, integration health, and data quality.",
    roles: "Systems Reviewer, Owner",
  },
  {
    name: "LedgerOS Executive Advisor",
    purpose: "Cross-cutting executive summary and next-best-action guidance.",
    roles: "Owner",
  },
];

export const Route = createFileRoute("/apex/personas")({
  head: () => ({ meta: [{ title: "AI Personas — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="AI Persona System"
      description="One governed AI system, presented through specialized advisors. All personas are advisory — never autonomous."
    >
      <ApexSection title="Personas">
        <div className="grid gap-3 md:grid-cols-2">
          {PERSONAS.map((p) => (
            <Card key={p.name} className="border-border/70 p-3">
              <div className="text-[13px] font-semibold">{p.name}</div>
              <div className="mt-1 text-[12px] text-muted-foreground">{p.purpose}</div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Intended roles: <span className="text-foreground">{p.roles}</span>
              </div>
            </Card>
          ))}
        </div>
      </ApexSection>

      <ApexSection title="Governance contract (every persona)">
        <Card className="border-border/70 p-3 text-[12px] text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>Permitted data · prohibited data</li>
            <li>Permitted recommendations · prohibited actions</li>
            <li>Required evidence · required approvals</li>
            <li>Intended roles · escalation path</li>
            <li>Persistent demonstration labeling</li>
          </ul>
        </Card>
      </ApexSection>
    </ApexPage>
  ),
});
