import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — LedgerOS" },
      { name: "description", content: "CRM-lite view of customer accounts and receivables" },
      { property: "og:title", content: "Customers — LedgerOS" },
      { property: "og:description", content: "CRM-lite view of customer accounts and receivables" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 3"
      title="Customers"
      description="CRM-lite view of customer accounts and receivables"
      phase="Phase 3 — In design"
    />
  ),
});
