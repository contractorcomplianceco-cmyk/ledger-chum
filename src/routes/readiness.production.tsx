import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/readiness/production")({
  head: () => ({
    meta: [
      { title: "Production Readiness — LedgerOS" },
      { name: "description", content: "Cutover checklist and go/no-go criteria" },
      { property: "og:title", content: "Production Readiness — LedgerOS" },
      { property: "og:description", content: "Cutover checklist and go/no-go criteria" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 5"
      title="Production Readiness"
      description="Cutover checklist and go/no-go criteria"
      phase="Phase 5 — In design"
    />
  ),
});
