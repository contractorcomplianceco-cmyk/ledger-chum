import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/banking/reconciliation")({
  head: () => ({
    meta: [
      { title: "Reconciliation Workspace — LedgerOS" },
      { name: "description", content: "Match feed to ledger and lock reconciled periods" },
      { property: "og:title", content: "Reconciliation Workspace — LedgerOS" },
      { property: "og:description", content: "Match feed to ledger and lock reconciled periods" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 2"
      title="Reconciliation Workspace"
      description="Match feed to ledger and lock reconciled periods"
      phase="Phase 2 — In design"
    />
  ),
});
