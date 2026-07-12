import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/ledger/journals")({
  head: () => ({
    meta: [
      { title: "Journal Entries — LedgerOS" },
      { name: "description", content: "Balanced double-entry journals, approvals, and reversals" },
      { property: "og:title", content: "Journal Entries — LedgerOS" },
      { property: "og:description", content: "Balanced double-entry journals, approvals, and reversals" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 4"
      title="Journal Entries"
      description="Balanced double-entry journals, approvals, and reversals"
      phase="Phase 4 — In design"
    />
  ),
});
