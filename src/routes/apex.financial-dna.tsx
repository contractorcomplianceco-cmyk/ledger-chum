import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apex/financial-dna")({
  head: () => ({ meta: [{ title: "Financial DNA — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Financial DNA"
      description="Trace every dollar from inbound payment through allocation, pass-through, revenue, cost, and profit to reserves and distributions."
      decision="Where did this dollar come from and where did it go?"
    >
      <ApexSection title="Example demonstration path">
        <Card className="border-border/70 p-4">
          <ol className="grid gap-1 text-[12.5px]">
            {[
              "Client Payment",
              "→ Invoice",
              "→ Service",
              "→ Pass-Through",
              "→ Realized Revenue",
              "→ Commission",
              "→ Payroll",
              "→ Direct Cost",
              "→ Overhead",
              "→ Profit",
              "→ Tax Reserve",
              "→ Owner Distribution",
              "→ Retained Earnings",
            ].map((s) => (
              <li key={s} className="font-mono text-foreground/90">{s}</li>
            ))}
          </ol>
        </Card>
      </ApexSection>

      <ApexSection title="Node contract">
        <Card className="border-border/70 p-3 text-[12px] text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>id · label · stage · amount · % of origin</li>
            <li>classification · restricted/available state</li>
            <li>source ref · evidence · confidence · audit event · explanation</li>
            <li>expand/collapse children</li>
          </ul>
        </Card>
      </ApexSection>
    </ApexPage>
  ),
});
