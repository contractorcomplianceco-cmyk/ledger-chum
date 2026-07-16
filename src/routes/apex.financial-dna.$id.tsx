import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DNA_SUBJECTS, DNA_NODES } from "@/lib/mock/apex-financial-dna";
import { currency } from "@/lib/mock/finance";
import { CrossExperienceLinks, AskLedgerOS } from "@/components/apex/experience-kit";

export const Route = createFileRoute("/apex/financial-dna/$id")({
  head: () => ({ meta: [{ title: "Financial DNA Path — Project APEX" }] }),
  component: DnaDetail,
});

function DnaDetail() {
  const { id } = Route.useParams();
  const subject = DNA_SUBJECTS.find((s) => s.id === id);

  return (
    <ApexPage
      title={subject?.label ?? "Financial DNA path"}
      description={
        subject
          ? `${subject.type} DNA trace — demonstration data.`
          : "Path not found in demo dataset."
      }
      actions={
        <Link to="/apex/financial-dna">
          <Button size="sm" variant="outline">
            <ArrowLeft className="mr-1 h-3 w-3" /> All DNA subjects
          </Button>
        </Link>
      }
    >
      <ApexSection title="Origin → Outcome">
        <Card className="border-border/70 p-4">
          <ol className="space-y-2 text-[12.5px]">
            {DNA_NODES.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-0"
              >
                <span className="text-muted-foreground">
                  {n.stage} · {n.label}
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {currency(n.amount)}{" "}
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    {n.pctOfOrigin.toFixed(1)}%
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </ApexSection>

      <ApexSection title="Cross-experience">
        <CrossExperienceLinks
          timelineId="TL-INVOICE-0501"
          graphNodeId="client:ald"
          scenarioId="SC-01"
          opportunityId="OPP-1042"
        />
      </ApexSection>

      <AskLedgerOS
        prompts={[
          "Where did this payment go?",
          "What portion is restricted?",
          "Who was paid from this revenue?",
          "Why is contribution profit lower than expected?",
        ]}
      />
    </ApexPage>
  );
}
