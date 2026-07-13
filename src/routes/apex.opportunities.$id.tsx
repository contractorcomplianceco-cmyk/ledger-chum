import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { OPPORTUNITIES } from "@/lib/mock/apex-opportunities";
import {
  OpportunityImpactBadge,
  OpportunityEffortBadge,
  OpportunityStatusBadge,
  CrossExperienceLinks,
  KVRow,
  EvidenceList,
  AskLedgerOS,
} from "@/components/apex/experience-kit";
import { ConfidenceChip, FreshnessChip } from "@/components/apex/chips";
import { toast } from "sonner";
import { DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";

export const Route = createFileRoute("/apex/opportunities/$id")({
  head: () => ({ meta: [{ title: "Opportunity — Project APEX" }] }),
  component: OpportunityDetail,
});

function OpportunityDetail() {
  const { id } = Route.useParams();
  const o = OPPORTUNITIES.find((x) => x.id === id);
  if (!o) throw notFound();

  const demo = (label: string) => toast(label, { description: DEMO_ACTION_MESSAGE });

  return (
    <ApexPage
      title={o.title}
      description={`${o.category} · ${o.subject}`}
      decision={o.recommendedAction}
      actions={
        <Link to="/apex/opportunities">
          <Button size="sm" variant="outline"><ArrowLeft className="mr-1 h-3 w-3" /> All opportunities</Button>
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <ApexSection title="Overview">
            <Card className="border-border/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <OpportunityImpactBadge impact={o.impactType} />
                <OpportunityEffortBadge effort={o.effort} />
                <OpportunityStatusBadge status={o.status} />
                <ConfidenceChip value={o.confidence} />
                <FreshnessChip label={`TTV ${o.timeToValue}`} />
                <span className="ml-auto text-right">
                  <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Estimated impact</div>
                  <div className="text-[20px] font-bold text-foreground tabular-nums">{currency(o.financialImpact)}</div>
                </span>
              </div>
              <p className="mt-3 text-[13px] text-muted-foreground">{o.description}</p>
            </Card>
          </ApexSection>

          <ApexSection title="Evidence">
            <Card className="border-border/70 p-4">
              <EvidenceList items={o.evidence} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {o.sources.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          </ApexSection>

          <ApexSection title="Recommended next step">
            <Card className="border-info/40 bg-info/5 p-4 text-[13px] text-foreground">
              {o.recommendedAction}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => demo("Opportunity accepted")}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => demo("Converted to task")}>Convert to task</Button>
                <Button size="sm" variant="outline" onClick={() => demo("Sent for approval")}>Send for approval</Button>
                <Button size="sm" variant="ghost" onClick={() => demo("Opportunity dismissed")}>Dismiss</Button>
              </div>
            </Card>
          </ApexSection>

          <ApexSection title="Cross-experience">
            <CrossExperienceLinks
              dnaId={o.relatedDnaPath}
              timelineId={o.relatedTimeline}
              graphNodeId={o.relatedGraphNode}
              scenarioId="SC-03"
            />
          </ApexSection>
        </div>

        <aside className="space-y-3">
          <Card className="border-border/70 p-4">
            <div className="text-[12.5px] font-semibold text-foreground">Details</div>
            <div className="mt-2">
              <KVRow k="Owner" v={o.owner} />
              <KVRow k="Approver" v={o.approver} />
              <KVRow k="Entity" v={o.entity} />
              <KVRow k="Created" v={o.createdAt} />
              <KVRow k="Target" v={o.targetDate} />
              <KVRow k="Urgency" v={o.urgency} />
              <KVRow k="Risk" v={o.risk} />
              <KVRow k="Confidence" v={`${o.confidence}%`} />
            </div>
          </Card>
          <AskLedgerOS
            prompts={[
              "Why is this recommended?",
              "What assumptions matter most?",
              "What could go wrong?",
              "Who needs to approve this?",
            ]}
          />
        </aside>
      </div>
    </ApexPage>
  );
}
