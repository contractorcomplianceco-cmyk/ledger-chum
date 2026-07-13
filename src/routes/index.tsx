import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Default landing route.
 *
 * For Project APEX, the Owner (Rose) lands on the Executive Home Workspace
 * at `/apex`. The former operational dashboard remains fully available and
 * unchanged at `/dashboard`.
 *
 * Future role-aware landing map (to be wired once auth roles are live):
 *   - owner / Rose               → /apex
 *   - accounting_lead / Christin → /dashboard
 *   - accountant / tax advisor   → /dashboard
 *   - systems_reviewer           → /automation/integration-health
 *   - team_member                → /expenses
 *   - integration_service        → /automation/integration-health
 *
 * Until role-aware routing exists, `/` redirects everyone to `/apex` — the
 * minimum safe behavior requested by the product owner.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/apex" });
  },
});
