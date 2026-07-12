import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/close")({
  head: () => ({
    meta: [
      { title: "Monthly Close — LedgerOS" },
      { name: "description", content: "Checklist-driven close with locking and sign-off" },
      { property: "og:title", content: "Monthly Close — LedgerOS" },
      { property: "og:description", content: "Checklist-driven close with locking and sign-off" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 4"
      title="Monthly Close"
      description="Checklist-driven close with locking and sign-off"
      phase="Phase 4 — In design"
    />
  ),
});
