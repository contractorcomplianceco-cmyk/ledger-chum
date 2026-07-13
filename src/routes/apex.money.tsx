import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceShell } from "@/components/apex/workspace-shell";
import { MONEY_WORKSPACE } from "@/lib/mock/apex-workspaces";

export const Route = createFileRoute("/apex/money")({
  head: () => ({
    meta: [
      { title: "Money Workspace — LedgerOS" },
      {
        name: "description",
        content:
          "Money — the APEX executive workspace for cash, revenue, profit, collections, payables, and financial risk.",
      },
    ],
  }),
  component: () => <WorkspaceShell def={MONEY_WORKSPACE} />,
});
