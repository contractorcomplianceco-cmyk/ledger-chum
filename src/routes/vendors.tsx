import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/vendors")({
  head: () => ({
    meta: [
      { title: "Vendors — LedgerOS" },
      { name: "description", content: "Vendor master, terms, and payable history" },
      { property: "og:title", content: "Vendors — LedgerOS" },
      { property: "og:description", content: "Vendor master, terms, and payable history" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 3"
      title="Vendors"
      description="Vendor master, terms, and payable history"
      phase="Phase 3 — In design"
    />
  ),
});
