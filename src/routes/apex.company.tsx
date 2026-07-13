import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceShell } from "@/components/apex/workspace-shell";
import { COMPANY_WORKSPACE } from "@/lib/mock/apex-workspaces";

export const Route = createFileRoute("/apex/company")({
  head: () => ({
    meta: [
      { title: "Company Workspace — LedgerOS" },
      {
        name: "description",
        content:
          "Company — the APEX executive workspace for governance, compliance, technology, AI spend, risk, and enterprise health.",
      },
    ],
  }),
  component: () => <WorkspaceShell def={COMPANY_WORKSPACE} />,
});
