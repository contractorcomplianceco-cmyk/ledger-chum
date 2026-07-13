import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apex/timeline")({
  head: () => ({ meta: [{ title: "Financial Timeline — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Financial Timeline"
      description="Chronological view of every financial event for a company, client, invoice, payment, employee, participant, campaign, service, app, event, vendor, investor, or owner transaction."
      decision="What is the financial history of this subject?"
    >
      <ApexSection title="Example client timeline">
        <Card className="border-border/70 p-4">
          <ol className="space-y-1 text-[12.5px]">
            {[
              "Lead Created",
              "Proposal Sent",
              "Invoice Issued",
              "Deposit Collected",
              "Pass-Through Reserved",
              "Work Completed",
              "Final Payment Collected",
              "Commission Earned",
              "Profit Recognized",
              "Renewal Opportunity",
              "Expansion Sold",
            ].map((s) => (
              <li key={s} className="border-l-2 border-info/40 pl-3 text-foreground/85">
                {s}
              </li>
            ))}
          </ol>
        </Card>
      </ApexSection>

      <ApexSection title="Event contract">
        <Card className="border-border/70 p-3 text-[12px] text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>subject ref · date/time · event kind · amount</li>
            <li>source system · related refs · actor · explanation · audit link</li>
            <li>Filterable by kind, date range, source system</li>
          </ul>
        </Card>
      </ApexSection>
    </ApexPage>
  ),
});
