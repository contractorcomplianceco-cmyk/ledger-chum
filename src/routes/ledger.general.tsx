import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/ledger/general")({
  head: () => ({
    meta: [
      { title: "General Ledger — LedgerOS" },
      { name: "description", content: "Every posted transaction, by account and period" },
      { property: "og:title", content: "General Ledger — LedgerOS" },
      { property: "og:description", content: "Every posted transaction, by account and period" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 4"
      title="General Ledger"
      description="Every posted transaction, by account and period"
      phase="Phase 4 — In design"
    />
  ),
});
