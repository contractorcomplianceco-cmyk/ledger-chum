import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — LedgerOS" },
      { name: "description", content: "Server-side RBAC, sensitive-data restrictions" },
      { property: "og:title", content: "Users & Roles — LedgerOS" },
      { property: "og:description", content: "Server-side RBAC, sensitive-data restrictions" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="LedgerOS · Phase 5"
      title="Users & Roles"
      description="Server-side RBAC, sensitive-data restrictions"
      phase="Phase 5 — In design"
    />
  ),
});
