import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCurrentOrg } from "@/lib/accounting/workspace.functions";

/**
 * Returns the caller's primary org. When the user is not signed in — or
 * has no membership yet — the query resolves to null (state: success),
 * so the Phase 3 UI can fall back to demo data.
 */
export function useCurrentOrg() {
  const fn = useServerFn(getCurrentOrg);
  return useQuery({
    queryKey: ["current-org"],
    queryFn: async () => {
      try {
        return await fn();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useOrgId(): string | null {
  const { data } = useCurrentOrg();
  return data?.orgId ?? null;
}
