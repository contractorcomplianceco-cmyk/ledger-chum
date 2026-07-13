import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TIMELINE_EVENTS, TIMELINE_SUBJECTS } from "@/lib/mock/apex-timeline";
import { currency } from "@/lib/mock/finance";
import { CrossExperienceLinks, AskLedgerOS, KVRow } from "@/components/apex/experience-kit";

export const Route = createFileRoute("/apex/timeline/$id")({
  head: () => ({ meta: [{ title: "Timeline Event — Project APEX" }] }),
  component: TimelineDetail,
});

function TimelineDetail() {
  const { id } = Route.useParams();
  const allEvents = Object.values(TIMELINE_EVENTS).flat();
  const event = allEvents.find((e) => e.id === id);
  const subject = event ? TIMELINE_SUBJECTS.find((s) => s.id === event.subjectId) : undefined;

  return (
    <ApexPage
      title={event?.title ?? "Timeline event"}
      description={event ? `${event.kind} · ${event.date} ${event.time} · ${subject?.label}` : "Event not found."}
      actions={
        <Link to="/apex/timeline">
          <Button size="sm" variant="outline"><ArrowLeft className="mr-1 h-3 w-3" /> All timelines</Button>
        </Link>
      }
    >
      {event && (
        <>
          <ApexSection title="Event">
            <Card className="border-border/70 p-4 text-[12.5px]">
              <KVRow k="Kind" v={event.kind} />
              <KVRow k="Status" v={event.status} />
              <KVRow k="Amount" v={typeof event.amount === "number" ? currency(event.amount) : "—"} />
              <KVRow k="Source" v={event.source} />
              <KVRow k="Actor" v={event.actor} />
              <KVRow k="Audit" v={event.auditLink} />
              <p className="mt-3 text-[12px] text-muted-foreground">{event.explanation}</p>
            </Card>
          </ApexSection>
          {event.evidence.length > 0 && (
            <ApexSection title="Evidence">
              <Card className="border-border/70 p-4">
                <ul className="list-disc space-y-1 pl-5 text-[12px] text-muted-foreground">
                  {event.evidence.map((ev) => <li key={ev}>{ev}</li>)}
                </ul>
              </Card>
            </ApexSection>
          )}
          <ApexSection title="Cross-experience">
            <CrossExperienceLinks
              dnaId="DNA-CLIENT-ALD"
              graphNodeId="client:ald"
              opportunityId={event.relatedIds.find((r) => r.startsWith("OPP-"))}
              scenarioId="SC-01"
            />
          </ApexSection>
        </>
      )}
      <AskLedgerOS
        prompts={[
          "What changed here?",
          "Was this event expected?",
          "What is still pending on this subject?",
          "Show the audit trail.",
        ]}
      />
    </ApexPage>
  );
}
