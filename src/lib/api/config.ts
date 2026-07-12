/**
 * LedgerOS API configuration.
 *
 * Reads Vite env vars. Never throws at import time so the Design Lab boots
 * regardless of what's configured. The Express adapter re-checks the base
 * URL at call time and throws NotConfiguredError if missing.
 */

export type ApiMode = "mock" | "production";

const rawMode = (import.meta.env.VITE_LEDGEROS_API_MODE ?? "mock").toString();
const rawBase = (import.meta.env.VITE_LEDGEROS_API_BASE_URL ?? "").toString();
const rawCreds = (import.meta.env.VITE_LEDGEROS_USE_CREDENTIALS ?? "true").toString();

export const apiConfig = {
  mode: (rawMode === "production" ? "production" : "mock") as ApiMode,
  baseUrl: rawBase.replace(/\/+$/, ""),
  useCredentials: rawCreds !== "false",
  /** Fake latency for the mock adapter (ms). */
  mockLatencyMs: 140,
} as const;

export const isMockMode = () => apiConfig.mode === "mock";
export const isProductionMode = () => apiConfig.mode === "production";
