import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apex/opportunities")({
  head: () => ({ meta: [{ title: "Opportunity Engine — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Opportunity Engine"
      description="Continuously surfaces revenue, margin, technology, vendor, tax, and compensation opportunities with financial impact and required approvals."
      decision="What is the highest-leverage next action?"
    >
      <ApexSection title="Opportunity categories">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-[12.5px]">
          {[
            "Missed invoices",
            "Unbilled work",
            "Missed markups",
            "Underpriced services",
            "Dormant clients",
            "Renewal opportunities",
            "Expansion / upsell / cross-sell",
            "Unused subscriptions",
            "Duplicate vendors",
            "Vendor negotiation",
            "Better payment terms",
            "Recoverable expenses",
            "Tax review opportunities",
            "Commission-plan improvements",
            "Cash improvements",
            "Marketing budget",
            "Technology consolidation",
          ].map((c) => (
            <Card key={c} className="border-border/70 p-2 px-3">
              {c}
            </Card>
          ))}
        </div>
      </ApexSection>

      <ApexSection title="Opportunity record contract">
        <Card className="border-border/70 p-3 text-[12px] text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>Title · category · workspace hint</li>
            <li>Evidence records · confidence · effort · horizon · risk</li>
            <li>Estimated financial impact</li>
            <li>Owner · recommended next step · required approval</li>
            <li>Status: new → under review → accepted → converted → approved → in progress → completed → outcome measured → dismissed</li>
            <li>Outcome ref once measured</li>
          </ul>
        </Card>
      </ApexSection>
    </ApexPage>
  ),
});
