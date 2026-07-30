/**
 * Mode-aware navigation gating.
 *
 * In production the speculative "design lab" and mock surfaces are hidden from
 * navigation entirely; only real, shipping routes remain. In demo they stay
 * visible but are badged "Demo" so it is obvious they are showcase surfaces.
 *
 * Gating is expressed by route path (not per-item flags) so it stays correct as
 * nav labels/grouping change. See the LedgerOS UX audit for the surface list.
 */
import { isProductionMode } from "@/lib/app-mode";
import type { NavGroup, NavItem } from "@/lib/mock/nav";

/** Route families that only exist as demo/design-lab or unbuilt placeholders. */
const DEMO_ONLY_PREFIXES = [
  "/apex",
  "/intelligence",
  "/automation",
  "/automation-center",
  "/feature-registry",
  "/implementation",
  "/banking", // mock banking trio — the real one is /ledger/banking
];

/** Exact placeholder / mock routes (ComingSoon or mock-only content). */
const DEMO_ONLY_EXACT = new Set<string>([
  "/dashboard", // mock "operational" dashboard — real home is /dashboards/accounting
  "/payments",
  "/bills",
  "/vendors",
  "/audit",
  "/admin/users",
  "/readiness/migration",
  "/readiness/production",
  "/dashboards/reviewer",
  "/dashboards/team",
]);

export function isDemoOnlyRoute(to: string): boolean {
  if (DEMO_ONLY_EXACT.has(to)) return true;
  return DEMO_ONLY_PREFIXES.some((p) => to === p || to.startsWith(p + "/"));
}

/**
 * Filter + annotate nav groups for the active mode.
 * - production: drop demo-only items (and any group left empty).
 * - demo: keep everything, adding a "Demo" badge to demo-only items that don't
 *   already carry a badge.
 */
export function applyModeToNavGroups(groups: NavGroup[]): NavGroup[] {
  if (isProductionMode()) {
    return groups
      .map((g) => ({ ...g, items: g.items.filter((i) => !isDemoOnlyRoute(i.to)) }))
      .filter((g) => g.items.length > 0);
  }
  return groups.map((g) => ({
    ...g,
    items: g.items.map((i) =>
      isDemoOnlyRoute(i.to) && !i.badge
        ? ({ ...i, badge: "Demo", badgeTone: "violet" } as NavItem)
        : i,
    ),
  }));
}

/** Flat variant for command palette / breadcrumb search. */
export function applyModeToNavItems(items: NavItem[]): NavItem[] {
  if (isProductionMode()) return items.filter((i) => !isDemoOnlyRoute(i.to));
  return items;
}
