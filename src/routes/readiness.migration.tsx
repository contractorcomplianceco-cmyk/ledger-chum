import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/readiness/migration")({
  head: () => ({
    meta: [
      { title: "Migration Readiness — LedgerOS" },
      { name: "description", content: "Parallel-run status vs Zoho Books" },
      { property: "og:title", content: "Migration Readiness — LedgerOS" },
      { property: "og:description", content: "Parallel-run status vs Zoho Books" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 5"
      title="Migration Readiness"
      description="Parallel-run status vs Zoho Books"
      phase="Phase 5 — In design"
    />
  ),
});
