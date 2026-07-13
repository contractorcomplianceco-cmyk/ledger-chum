import { createFileRoute, notFound } from "@tanstack/react-router";
import { RoleWorkspaceShell } from "@/components/apex/role-workspace-shell";
import { getRoleWorkspace } from "@/lib/mock/apex-role-workspaces";

export const Route = createFileRoute("/apex/workspaces/$role")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.role} workspace — Project APEX` },
    ],
  }),
  loader: ({ params }) => {
    const ws = getRoleWorkspace(params.role);
    if (!ws) throw notFound();
    return { ws };
  },
  component: RoleWorkspaceRoute,
  notFoundComponent: () => (
    <div className="p-8 text-[13px] text-muted-foreground">
      Unknown role. Return to <a className="text-primary underline" href="/apex/workspaces">Role Workspaces</a>.
    </div>
  ),
});

function RoleWorkspaceRoute() {
  const { ws } = Route.useLoaderData();
  return <RoleWorkspaceShell ws={ws} />;
}
