import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LedgerOS" },
      { name: "description", content: "Organization, fiscal calendar, integrations, and policies" },
      { property: "og:title", content: "Settings — LedgerOS" },
      { property: "og:description", content: "Organization, fiscal calendar, integrations, and policies" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 5"
      title="Settings"
      description="Organization, fiscal calendar, integrations, and policies"
      phase="Phase 5 — In design"
    />
  ),
});
