/**
 * Server-side invoice-style generation.
 *
 * This is the seam where a real AI model plugs in. The `generateInvoiceStyle` server
 * function is provider-gated:
 *
 *   • When `INVOICE_AI_PROVIDER` is unset/`local` (or the API key is missing) it runs
 *     the deterministic local heuristic and tags the result `source: "local"`.
 *   • When `INVOICE_AI_PROVIDER` names a configured model backend, it calls that
 *     model (OpenAI-compatible chat completions), parses the returned JSON, and runs
 *     it through the SAME `validateAndClampStyle` trust boundary. Any error degrades
 *     gracefully to the local heuristic.
 *
 * TO CONNECT A REAL MODEL LATER (config change, not a rebuild):
 *   1. Set server env: INVOICE_AI_PROVIDER=openai (or any label),
 *      INVOICE_AI_API_KEY=<secret>, INVOICE_AI_BASE_URL=<https://api.…/v1>,
 *      INVOICE_AI_MODEL=<model-id>.
 *   2. Set the client env VITE_INVOICE_AI_PROVIDER to the same non-`local` label so
 *      the UI routes prompts through `LLMStyleProvider` → this server function.
 * No code changes required; the request/response contract and validation are fixed.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { InvoiceStyle } from "./invoice-theme";
import { invoiceStyleSchema, validateAndClampStyle } from "./invoice-style-schema";
import { heuristicStyleFromPrompt } from "./style-providers/local-provider";

export const styleGenerateRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
  context: z
    .object({
      companyName: z.string().trim().max(200).optional(),
      base: invoiceStyleSchema.optional(),
    })
    .optional(),
});

export type StyleGenerateRequest = z.infer<typeof styleGenerateRequestSchema>;

export interface StyleGenerateResponse {
  /** Which engine produced the style. */
  source: "llm" | "local";
  style: InvoiceStyle;
  /** Guardrail corrections applied during validation/clamping. */
  adjustments: string[];
}

/** True only when a real model backend is fully configured on the server. */
function isModelConfigured(): boolean {
  const provider = (process.env.INVOICE_AI_PROVIDER ?? "local").trim().toLowerCase();
  return provider !== "" && provider !== "local" && Boolean(process.env.INVOICE_AI_API_KEY);
}

const SYSTEM_PROMPT = [
  "You are an invoice styling engine. Given a natural-language request, return ONLY a",
  "JSON object matching the InvoiceStyle schema (id, label, paper, colors, typography,",
  "layout). Colors are #rrggbb hex. You control presentation only — never amounts,",
  "line items, or totals. Keep text legible and the document within one page.",
].join(" ");

/**
 * Call an OpenAI-compatible chat-completions endpoint and parse an InvoiceStyle from
 * the response. Throws on any failure so the caller can fall back to local.
 */
async function requestModelStyle(req: StyleGenerateRequest): Promise<InvoiceStyle> {
  const baseUrl = process.env.INVOICE_AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.INVOICE_AI_MODEL ?? "gpt-4o-mini";
  const apiKey = process.env.INVOICE_AI_API_KEY as string;

  const userPayload = {
    prompt: req.prompt,
    companyName: req.context?.companyName,
    base: req.context?.base,
  };

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Style model returned ${res.status}`);
  const body = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("Style model returned no content");

  // The trust boundary — the model's output is untrusted and fully clamped.
  return validateAndClampStyle(JSON.parse(content)).style;
}

export const generateInvoiceStyle = createServerFn({ method: "POST" })
  .inputValidator((v) => styleGenerateRequestSchema.parse(v))
  .handler(async ({ data }): Promise<StyleGenerateResponse> => {
    if (isModelConfigured()) {
      try {
        const style = await requestModelStyle(data);
        return { source: "llm", style, adjustments: [] };
      } catch (err) {
        // Deferred/failed model: degrade to the deterministic local engine.
        console.warn(
          `[invoice-style] model generation failed, falling back to local: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
    const style = heuristicStyleFromPrompt(data.prompt, data.context);
    return { source: "local", style, adjustments: [] };
  });
