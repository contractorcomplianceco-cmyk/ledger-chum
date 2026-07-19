/**
 * Resolves which `InvoiceStyleProvider` the UI should use.
 *
 * The client env `VITE_INVOICE_AI_PROVIDER` selects the provider:
 *   • unset / `local` → `LocalStyleProvider` (deterministic, offline; the default).
 *   • any other value → `LLMStyleProvider`, which routes through the server function.
 *     The server independently decides whether a real model is configured, and falls
 *     back to the local heuristic if not — so flipping this on before the key is set
 *     is harmless.
 *
 * Swapping in a real model is therefore a config change: set the client flag and the
 * server-side `INVOICE_AI_*` env (see `invoice-style.functions.ts`).
 */

import type { InvoiceStyleProvider } from "./provider";
import { LocalStyleProvider } from "./local-provider";
import { LLMStyleProvider } from "./llm-provider";

export type { InvoiceStyleProvider, StyleContext } from "./provider";
export { LocalStyleProvider, heuristicStyleFromPrompt } from "./local-provider";
export { LLMStyleProvider } from "./llm-provider";

const rawProvider = (import.meta.env.VITE_INVOICE_AI_PROVIDER ?? "local")
  .toString()
  .trim()
  .toLowerCase();

/** `true` when the app is configured to route prompts through the model server fn. */
export const isAiStyleProviderEnabled = rawProvider !== "" && rawProvider !== "local";

let cached: InvoiceStyleProvider | null = null;

/** The singleton provider selected by config. */
export function getStyleProvider(): InvoiceStyleProvider {
  if (!cached) {
    cached = isAiStyleProviderEnabled ? new LLMStyleProvider() : new LocalStyleProvider();
  }
  return cached;
}
