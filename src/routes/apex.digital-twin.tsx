import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apex/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Twin — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Digital Twin Framework"
      description="Demonstration scenario modeling. Not a production financial forecast."
      decision="If we made this change, what would happen?"
    >
      <ApexSection title="Example scenarios">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-[12.5px]">
          {[
            "Revenue drops 20%",
            "Hire five employees",
            "Add one executive",
            "Open a new state",
            "Acquire another company",
            "Raise service pricing",
            "Increase marketing spend",
            "Cancel software",
            "Add a new product",
            "Lose the largest client",
            "Increase chargebacks",
            "Attend three national conferences",
          ].map((s) => (
            <Card key={s} className="border-border/70 p-2 px-3">
              {s}
            </Card>
          ))}
        </div>
      </ApexSection>

      <ApexSection title="Impact axes (modeled, demonstration-only)">
        <Card className="border-border/70 p-3 text-[12px] text-muted-foreground">
          <ul className="grid list-disc gap-x-6 gap-y-1 pl-5 sm:grid-cols-2">
            <li>Cash · true available cash</li>
            <li>Revenue · gross profit · contribution · net income</li>
            <li>Payroll · commission obligations · bonus obligations</li>
            <li>Tax reserves</li>
            <li>Runway (months)</li>
            <li>Hiring capacity</li>
            <li>Company Health delta</li>
            <li>Risk delta</li>
          </ul>
        </Card>
      </ApexSection>
    </ApexPage>
  ),
});
