import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceShell } from "@/components/apex/workspace-shell";
import { PEOPLE_WORKSPACE } from "@/lib/mock/apex-workspaces";

export const Route = createFileRoute("/apex/people")({
  head: () => ({
    meta: [
      { title: "People Workspace — LedgerOS" },
      {
        name: "description",
        content:
          "People — the APEX executive workspace for payroll, commissions, bonuses, hiring, capacity, and workforce health.",
      },
    ],
  }),
  component: () => <WorkspaceShell def={PEOPLE_WORKSPACE} />,
});
