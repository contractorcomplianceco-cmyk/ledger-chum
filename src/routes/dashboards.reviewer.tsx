import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/dashboards/reviewer")({
  head: () => ({
    meta: [
      { title: "Systems Reviewer — LedgerOS" },
      { name: "description", content: "Controls, audit trail, and locked-period integrity checks" },
      { property: "og:title", content: "Systems Reviewer — LedgerOS" },
      { property: "og:description", content: "Controls, audit trail, and locked-period integrity checks" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 1"
      title="Systems Reviewer"
      description="Controls, audit trail, and locked-period integrity checks"
      phase="Phase 1 — In design"
    />
  ),
});
