import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { PulseCard, PulseGrid } from "@/components/apex/pulse-card";
import { WhyDidThisChange } from "@/components/apex/why-changed";
import { APEX_PULSES } from "@/lib/mock/apex-pulses";

export const Route = createFileRoute("/apex/widgets")({
  head: () => ({ meta: [{ title: "Intelligent Widgets — Project APEX" }] }),
  component: WidgetsPage,
});

function WidgetsPage() {
  return (
    <ApexPage
      title="Intelligent Widget System"
      description="Every pulse widget renders headline value, trend, drivers, risk, forecast, recommended action, confidence, freshness, and a link into full explainability."
      decision="What signal should turn into a decision right now?"
    >
      <ApexSection
        title="Twelve pulse widgets (demonstration)"
        description="Dark intelligence surfaces are reserved for executive pulses (Cash, AI, Opportunity). Operational pulses stay on the light workspace."
      >
        <PulseGrid>
          {APEX_PULSES.map((p) => (
            <PulseCard key={p.id} pulse={p} />
          ))}
        </PulseGrid>
      </ApexSection>

      <ApexSection
        title="Why-did-this-change component"
        description="Attachable to any metric across LedgerOS. Renders current, prior, target, delta, narrative, and contributor list."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <WhyDidThisChange
            metric="Operating Profit"
            current="$412K"
            prior="$382K"
            target="$400K"
            delta={8}
            narrative="Operating profit rose 8% MTD driven by enterprise renewals and Campaign 18 contribution, partially offset by software cost inflation."
            contributors={[
              { label: "Enterprise renewals", amount: "$96K", direction: "up" },
              { label: "Campaign 18 contribution", amount: "$41K", direction: "up" },
              { label: "Software cost inflation", amount: "$14K", direction: "down" },
              { label: "Deferred revenue release", amount: "$22K", direction: "up" },
            ]}
          />
          <WhyDidThisChange
            metric="Available Cash"
            current="$1.84M"
            prior="$1.96M"
            target="$1.90M"
            delta={-6}
            invert
            narrative="True available cash declined 6% as pass-through and commission reserves grew alongside the mid-month bill run."
            contributors={[
              { label: "Renewals collected", amount: "$412K", direction: "up" },
              { label: "Pass-through reserve growth", amount: "$185K", direction: "down" },
              { label: "Commission reserve", amount: "$92K", direction: "down" },
              { label: "Bill run 7/12", amount: "$96K", direction: "down" },
            ]}
          />
        </div>
      </ApexSection>
    </ApexPage>
  );
}
