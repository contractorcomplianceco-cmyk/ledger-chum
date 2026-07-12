import { useMemo } from "react";
import type { RoleKey } from "@/lib/api/types";

/**
 * Design Lab permission hook.
 *
 * In production this will read the current session from a server-provided
 * context or a `/api/auth/session` fetch. For the Design Lab we expose a
 * mockable current-user so restricted-state screens can be demonstrated.
 */

export interface CurrentUserLite {
  id: string;
  name: string;
  role: RoleKey;
  permissions: string[];
  sensitiveAccess: boolean;
}

const DEFAULT_USER: CurrentUserLite = {
  id: "u_1",
  name: "Rose Delacroix",
  role: "owner",
  permissions: ["*"],
  sensitiveAccess: true,
};

let currentUser: CurrentUserLite = DEFAULT_USER;

export function setDesignLabUser(user: CurrentUserLite) {
  currentUser = user;
}

export function useCurrentUser(): CurrentUserLite {
  return currentUser;
}

function matches(permission: string, held: string[]): boolean {
  if (held.includes("*")) return true;
  if (held.includes(permission)) return true;
  const [group] = permission.split(".");
  if (held.includes(`${group}.*`)) return true;
  return false;
}

export function usePermission(permission: string): { allowed: boolean; reason?: string; role: RoleKey } {
  const user = useCurrentUser();
  return useMemo(() => {
    const allowed = matches(permission, user.permissions);
    return {
      allowed,
      reason: allowed ? undefined : `Requires ${permission} (current role: ${user.role})`,
      role: user.role,
    };
  }, [permission, user]);
}
