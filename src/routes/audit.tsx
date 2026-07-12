import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Log — LedgerOS" },
      { name: "description", content: "Immutable audit trail across every financial change" },
      { property: "og:title", content: "Audit Log — LedgerOS" },
      { property: "og:description", content: "Immutable audit trail across every financial change" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 5"
      title="Audit Log"
      description="Immutable audit trail across every financial change"
      phase="Phase 5 — In design"
    />
  ),
});
