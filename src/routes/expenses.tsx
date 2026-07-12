import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — LedgerOS" },
      { name: "description", content: "Employee expense submission and approvals" },
      { property: "og:title", content: "Expenses — LedgerOS" },
      { property: "og:description", content: "Employee expense submission and approvals" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 3"
      title="Expenses"
      description="Employee expense submission and approvals"
      phase="Phase 3 — In design"
    />
  ),
});
