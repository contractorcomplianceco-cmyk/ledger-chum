import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/bills")({
  head: () => ({
    meta: [
      { title: "Bills — LedgerOS" },
      { name: "description", content: "Vendor bills with approval and audit trail" },
      { property: "og:title", content: "Bills — LedgerOS" },
      { property: "og:description", content: "Vendor bills with approval and audit trail" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 3"
      title="Bills"
      description="Vendor bills with approval and audit trail"
      phase="Phase 3 — In design"
    />
  ),
});
