import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/ledger/accounts")({
  head: () => ({
    meta: [
      { title: "Chart of Accounts — LedgerOS" },
      { name: "description", content: "Hierarchical account plan with balances" },
      { property: "og:title", content: "Chart of Accounts — LedgerOS" },
      { property: "og:description", content: "Hierarchical account plan with balances" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 4"
      title="Chart of Accounts"
      description="Hierarchical account plan with balances"
      phase="Phase 4 — In design"
    />
  ),
});
