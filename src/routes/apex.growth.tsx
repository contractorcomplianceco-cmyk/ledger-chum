import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceShell } from "@/components/apex/workspace-shell";
import { GROWTH_WORKSPACE } from "@/lib/mock/apex-workspaces";

export const Route = createFileRoute("/apex/growth")({
  head: () => ({
    meta: [
      { title: "Growth Workspace — LedgerOS" },
      {
        name: "description",
        content:
          "Growth — the APEX executive workspace for revenue growth, marketing ROI, pipeline, pricing, expansion, and forecasting.",
      },
    ],
  }),
  component: () => <WorkspaceShell def={GROWTH_WORKSPACE} />,
});
