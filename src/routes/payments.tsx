import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — LedgerOS" },
      { name: "description", content: "Incoming and outgoing payment application" },
      { property: "og:title", content: "Payments — LedgerOS" },
      { property: "og:description", content: "Incoming and outgoing payment application" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 3"
      title="Payments"
      description="Incoming and outgoing payment application"
      phase="Phase 3 — In design"
    />
  ),
});
