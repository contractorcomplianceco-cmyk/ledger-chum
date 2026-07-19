/**
 * Model-backed `InvoiceStyleProvider`. It delegates to the `generateInvoiceStyle`
 * server function, which is itself gated on server config: with a real model wired
 * it returns an AI-generated (validated) style; otherwise the server transparently
 * returns the local-heuristic style. Either way the client receives a safe style.
 *
 * As an extra belt-and-suspenders, if the server call fails outright (network, etc.)
 * this provider falls back to the in-browser local heuristic so the feature never
 * hard-fails for a styling error.
 */

import type { InvoiceStyle } from "../invoice-theme";
import { generateInvoiceStyle } from "../invoice-style.functions";
import type { InvoiceStyleProvider, StyleContext } from "./provider";
import { heuristicStyleFromPrompt } from "./local-provider";

export class LLMStyleProvider implements InvoiceStyleProvider {
  readonly id = "llm";

  async generate(prompt: string, context?: StyleContext): Promise<InvoiceStyle> {
    try {
      const res = await generateInvoiceStyle({ data: { prompt, context } });
      return res.style;
    } catch (err) {
      console.warn(
        `[invoice-style] LLM provider call failed, using local heuristic: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return heuristicStyleFromPrompt(prompt, context);
    }
  }
}
