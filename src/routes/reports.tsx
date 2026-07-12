import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — LedgerOS" },
      { name: "description", content: "P&L, balance sheet, cash flow, and management packs" },
      { property: "og:title", content: "Reports — LedgerOS" },
      { property: "og:description", content: "P&L, balance sheet, cash flow, and management packs" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 4"
      title="Reports"
      description="P&L, balance sheet, cash flow, and management packs"
      phase="Phase 4 — In design"
    />
  ),
});
