/**
 * Production persistence for the per-company invoice brand default.
 *
 * Backed by `public.invoice_brand_styles` (org-scoped, RLS). One row per org: the
 * saved `InvoiceStyle` new invoices inherit unless overridden per invoice. The
 * stored style is validated/clamped on the way in, so a bad row can never poison
 * rendering. Demo mode never touches these — see `brand-style-store.ts`.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import type { InvoiceStyle } from "./invoice-theme";
import { invoiceStyleSchema, validateAndClampStyle } from "./invoice-style-schema";

export const getBrandStyle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }): Promise<InvoiceStyle | null> => {
    const { data: row, error } = await context.supabase
      .from("invoice_brand_styles")
      .select("style")
      .eq("org_id", data.orgId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row?.style) return null;
    // Clamp on read too: a style saved before a guardrail change stays safe.
    return validateAndClampStyle(row.style).style;
  });

export const saveBrandStyle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid(), style: invoiceStyleSchema }).parse(v))
  .handler(async ({ data, context }): Promise<{ ok: true; style: InvoiceStyle }> => {
    const { style } = validateAndClampStyle(data.style);
    const { error } = await context.supabase.from("invoice_brand_styles").upsert(
      {
        org_id: data.orgId,
        style: style as unknown as Json,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "org_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, style };
  });
