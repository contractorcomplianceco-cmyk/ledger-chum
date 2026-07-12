import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/banking/")({
  head: () => ({
    meta: [
      { title: "Banking Overview — LedgerOS" },
      { name: "description", content: "Connected accounts, balances, and cash movement" },
      { property: "og:title", content: "Banking Overview — LedgerOS" },
      { property: "og:description", content: "Connected accounts, balances, and cash movement" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 2"
      title="Banking Overview"
      description="Connected accounts, balances, and cash movement"
      phase="Phase 2 — In design"
    />
  ),
});
