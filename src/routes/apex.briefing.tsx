import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/apex/briefing")({
  head: () => ({ meta: [{ title: "Executive Briefing — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Executive Briefing System"
      description="Daily, weekly, month-to-date, month-end, quarterly, and custom period briefings for leadership."
      decision="What do I need to know right now?"
    >
      <ApexSection title="Briefing sections">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-[12.5px]">
          {[
            "What changed",
            "Why it changed",
            "Cash position",
            "Profit movement",
            "Collections",
            "Largest expense",
            "Largest risk",
            "Largest opportunity",
            "Marketing insight",
            "Technology insight",
            "Team insight",
            "Compensation obligations",
            "Upcoming deadlines",
            "Decisions required today",
            "Recommended actions",
            "Data-confidence issues",
          ].map((s) => (
            <Card key={s} className="border-border/70 p-2 px-3">
              {s}
            </Card>
          ))}
        </div>
      </ApexSection>

      <ApexSection title="Delivery variants (planned)">
        <ul className="list-disc space-y-1 pl-5 text-[12.5px] text-muted-foreground">
          <li>Morning briefing</li>
          <li>Weekly leadership briefing</li>
          <li>Month-end narrative</li>
          <li>Board-ready briefing</li>
        </ul>
      </ApexSection>
    </ApexPage>
  ),
});
