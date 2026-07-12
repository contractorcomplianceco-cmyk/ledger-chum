import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/dashboards/accounting")({
  head: () => ({
    meta: [
      { title: "Accounting Lead — LedgerOS" },
      { name: "description", content: "Close cadence, journal approvals, and reconciliation queue" },
      { property: "og:title", content: "Accounting Lead — LedgerOS" },
      { property: "og:description", content: "Close cadence, journal approvals, and reconciliation queue" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 1"
      title="Accounting Lead"
      description="Close cadence, journal approvals, and reconciliation queue"
      phase="Phase 1 — In design"
    />
  ),
});
