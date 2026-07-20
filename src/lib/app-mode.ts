/**
 * Application data mode — the single seam that decides whether a feature draws
 * from simulated demo data or real production server functions / gateways.
 *
 * DEMO — the client-facing showcase. Sample/mock fixtures and speculative
 *   "design lab" surfaces (apex, intelligence, automation, feature-registry,
 *   implementation, the mock /banking trio, ComingSoon pages) are visible,
 *   clearly badged as "Demo". Fully self-contained: no network or secrets.
 * PRODUCTION — the shipping product. Mock/sample data must NOT render anywhere,
 *   speculative surfaces are hidden from navigation, and real server functions,
 *   the live payment gateway, and real email connections are wired in.
 *
 * Toggle with the Vite env var `VITE_APP_MODE` (`demo` | `production`).
 * Defaults to `demo`. This module is client-safe: it only reads a build-time
 * Vite env var and never imports server-only code. Server code reads the same
 * value from `process.env.APP_MODE` via {@link resolveServerMode}.
 */

export type AppMode = "demo" | "production";

function normalize(raw: string | undefined | null): AppMode {
  return (raw ?? "").toString().toLowerCase() === "production" ? "production" : "demo";
}

/** Build-time mode for the client bundle. */
export const APP_MODE: AppMode = normalize(
  typeof import.meta !== "undefined" ? import.meta.env?.VITE_APP_MODE : undefined,
);

export const isDemoMode = (): boolean => APP_MODE === "demo";
export const isProductionMode = (): boolean => APP_MODE === "production";

/**
 * Pick a value by the current mode. Keeps call sites terse and makes the
 * demo/production fork explicit and greppable:
 *
 *   const data = pickByMode({ demo: () => MOCK, production: () => fetchReal() });
 */
export function pickByMode<T>(opts: { demo: () => T; production: () => T }): T {
  return isProductionMode() ? opts.production() : opts.demo();
}

/**
 * Server-side mode resolution. Server functions and route handlers run under
 * Node, where `import.meta.env` is not the source of truth; they read
 * `APP_MODE` (falling back to the Vite var if the bundler inlined it).
 */
export function resolveServerMode(): AppMode {
  const fromEnv =
    typeof process !== "undefined"
      ? (process.env.APP_MODE ?? process.env.VITE_APP_MODE)
      : undefined;
  return normalize(fromEnv);
}
