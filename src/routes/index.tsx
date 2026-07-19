import { createFileRoute, redirect } from "@tanstack/react-router";
import { isProductionMode } from "@/lib/app-mode";

/**
 * Default landing route.
 *
 * Production: land on the real, server-function-backed accountant dashboard
 * (`/dashboards/accounting`) — the only live-wired home. Demo: land on the
 * executive `/apex` showcase.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: isProductionMode() ? "/dashboards/accounting" : "/apex" });
  },
});
