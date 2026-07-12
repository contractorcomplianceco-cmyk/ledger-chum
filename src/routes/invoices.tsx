import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — LedgerOS" },
      { name: "description", content: "Create, send, and track double-entry invoices" },
      { property: "og:title", content: "Invoices — LedgerOS" },
      { property: "og:description", content: "Create, send, and track double-entry invoices" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 3"
      title="Invoices"
      description="Create, send, and track double-entry invoices"
      phase="Phase 3 — In design"
    />
  ),
});
