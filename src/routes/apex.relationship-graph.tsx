import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apex/relationship-graph")({
  head: () => ({ meta: [{ title: "Relationship Graph — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Financial Relationship Graph"
      description="Visualize financial connections between clients, leads, campaigns, contracts, services, invoices, payments, allocations, expenses, employees, commissions, and decisions."
      decision="How are these records financially connected?"
    >
      <ApexSection title="Node types">
        <Card className="border-border/70 p-3">
          <div className="grid gap-1 text-[12px] sm:grid-cols-3 lg:grid-cols-4">
            {[
              "client","lead","campaign","contract","service","invoice","payment","allocation",
              "pass-through","expense","employee","commission","bonus","profit","tax","owner",
              "investor","entity","app","vendor","event","decision",
            ].map((n) => (
              <code key={n} className="font-mono text-foreground/80">{n}</code>
            ))}
          </div>
        </Card>
      </ApexSection>

      <ApexSection
        title="Accessibility"
        description="Every graph view ships with an equivalent list/table view for keyboard-only and screen-reader users. Nodes carry aria-labels; edges carry aria-descriptions."
      >
        <Card className="border-border/70 p-3 text-[12px] text-muted-foreground">
          Toggle: Graph View · List View · Timeline View. Force-directed SVG is capped to a
          visible neighborhood; expansion is user-driven.
        </Card>
      </ApexSection>
    </ApexPage>
  ),
});
