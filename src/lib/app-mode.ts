/**
 * App-level data mode for LedgerOS.
 *
 * DEMO — the client-facing showcase. Sample/mock fixtures and speculative
 *   "design lab" surfaces (apex, intelligence, automation, feature-registry,
 *   implementation, the mock /banking trio, ComingSoon pages) are visible,
 *   clearly badged as "Demo".
 * PRODUCTION — the shipping product. Mock/sample data must NOT render anywhere
 *   and the speculative surfaces are hidden from navigation.
 *
 * Toggle with the Vite env var `VITE_APP_MODE` (`demo` | `production`).
 * Defaults to `demo`. Read via `import.meta.env`, which Vite inlines at build
 * time on both server and client, so the value is stable across SSR/hydration.
 */

export type AppMode = "demo" | "production";

const raw = (import.meta.env.VITE_APP_MODE ?? "demo").toString().trim().toLowerCase();

export const APP_MODE: AppMode = raw === "production" ? "production" : "demo";

export const isDemoMode = () => APP_MODE === "demo";
export const isProductionMode = () => APP_MODE === "production";

/**
 * Single data-access seam. Screens ask for a value by mode instead of importing
 * mock fixtures directly, so production never renders sample data.
 *
 *   const accounts = pickByMode({ demo: MOCK_ACCOUNTS, production: liveAccounts });
 */
export function pickByMode<T>(sources: { demo: T; production: T }): T {
  return isProductionMode() ? sources.production : sources.demo;
}
