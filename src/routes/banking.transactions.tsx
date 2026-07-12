import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/banking/transactions")({
  head: () => ({
    meta: [
      { title: "Bank Transactions — LedgerOS" },
      { name: "description", content: "Review, categorize, and match feed transactions" },
      { property: "og:title", content: "Bank Transactions — LedgerOS" },
      { property: "og:description", content: "Review, categorize, and match feed transactions" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 2"
      title="Bank Transactions"
      description="Review, categorize, and match feed transactions"
      phase="Phase 2 — In design"
    />
  ),
});
