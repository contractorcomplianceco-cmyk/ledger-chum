import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integration Inbox — LedgerOS" },
      { name: "description", content: "Never silent — every source event surfaces here" },
      { property: "og:title", content: "Integration Inbox — LedgerOS" },
      { property: "og:description", content: "Never silent — every source event surfaces here" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 5"
      title="Integration Inbox"
      description="Never silent — every source event surfaces here"
      phase="Phase 5 — In design"
    />
  ),
});
