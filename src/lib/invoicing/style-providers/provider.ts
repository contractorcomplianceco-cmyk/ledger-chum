/**
 * Provider-agnostic contract for turning a free-text prompt into an `InvoiceStyle`.
 *
 * The UI depends only on this interface, never on a concrete provider. Today the
 * default implementation is a deterministic local heuristic (`LocalStyleProvider`);
 * a real model is wired later behind `LLMStyleProvider` as a config change, not a
 * rewrite. Whatever the source, the returned style is always validated and clamped
 * (see `invoice-style-schema`) before it can render.
 */

import type { InvoiceStyle } from "../invoice-theme";

/** Non-style context a provider may use to inform generation (never money data). */
export interface StyleContext {
  /** Issuer / company name — lets a provider seed initials, tone, etc. */
  companyName?: string;
  /** Style to treat as the starting point (e.g. the current or brand-default style). */
  base?: InvoiceStyle;
}

export interface InvoiceStyleProvider {
  /** Stable identifier for logging / diagnostics. */
  readonly id: string;
  /**
   * Produce a validated, print-legible `InvoiceStyle` from a natural-language
   * prompt. Implementations must never throw for style reasons — they clamp or fall
   * back to a safe style instead.
   */
  generate(prompt: string, context?: StyleContext): Promise<InvoiceStyle>;
}
