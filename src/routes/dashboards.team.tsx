import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/dashboards/team")({
  head: () => ({
    meta: [
      { title: "Team Member — LedgerOS" },
      { name: "description", content: "Submit expenses, upload receipts, and track approvals" },
      { property: "og:title", content: "Team Member — LedgerOS" },
      { property: "og:description", content: "Submit expenses, upload receipts, and track approvals" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 1"
      title="Team Member"
      description="Submit expenses, upload receipts, and track approvals"
      phase="Phase 1 — In design"
    />
  ),
});
