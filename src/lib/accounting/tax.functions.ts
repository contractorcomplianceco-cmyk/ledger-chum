import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * M8 — Tax Framework (framework only)
 *
 * Read/write for tax jurisdictions, categories, rates, and liabilities.
 * No tax calculation logic is implemented here — LedgerOS records the
 * amounts operators supply. Anything smarter belongs to a future
 * milestone or integration.
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

export const listJurisdictions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("tax_jurisdictions")
      .select("*")
      .eq("org_id", data.orgId)
      .order("code");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertJurisdiction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        id: z.string().uuid().optional(),
        orgId: z.string().uuid(),
        code: z.string().min(1).max(64),
        name: z.string().min(1).max(200),
        country: z.string().max(64).optional(),
        region: z.string().max(200).optional(),
        isActive: z.boolean().default(true),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      code: data.code,
      name: data.name,
      country: data.country ?? null,
      region: data.region ?? null,
      is_active: data.isActive,
    };
    const q = data.id
      ? context.supabase
          .from("tax_jurisdictions")
          .update(payload)
          .eq("id", data.id)
          .select()
          .single()
      : context.supabase.from("tax_jurisdictions").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const listTaxCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("tax_categories")
      .select("*")
      .eq("org_id", data.orgId)
      .order("code");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertTaxCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        id: z.string().uuid().optional(),
        orgId: z.string().uuid(),
        code: z.string().min(1).max(64),
        name: z.string().min(1).max(200),
        kind: z
          .enum(["sales", "use", "vat", "gst", "withholding", "payroll", "excise", "other"])
          .default("sales"),
        isActive: z.boolean().default(true),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      code: data.code,
      name: data.name,
      kind: data.kind,
      is_active: data.isActive,
    };
    const q = data.id
      ? context.supabase.from("tax_categories").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("tax_categories").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const listTaxRates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("tax_rates")
      .select("*")
      .eq("org_id", data.orgId)
      .order("effective_from", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertTaxRate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        id: z.string().uuid().optional(),
        orgId: z.string().uuid(),
        jurisdictionId: z.string().uuid(),
        categoryId: z.string().uuid(),
        rate: z.number().min(0).max(1),
        effectiveFrom: z.string(),
        effectiveTo: z.string().nullable().optional(),
        liabilityAccountId: z.string().uuid().nullable().optional(),
        expenseAccountId: z.string().uuid().nullable().optional(),
        isActive: z.boolean().default(true),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      jurisdiction_id: data.jurisdictionId,
      category_id: data.categoryId,
      rate: data.rate,
      effective_from: data.effectiveFrom,
      effective_to: data.effectiveTo ?? null,
      liability_account_id: data.liabilityAccountId ?? null,
      expense_account_id: data.expenseAccountId ?? null,
      is_active: data.isActive,
    };
    const q = data.id
      ? context.supabase.from("tax_rates").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("tax_rates").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const listTaxLiabilities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        status: z.enum(["open", "filed", "paid", "void", "all"]).default("all"),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("tax_liabilities")
      .select("*")
      .eq("org_id", data.orgId)
      .order("period_start", { ascending: false });
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const recordTaxLiability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        jurisdictionId: z.string().uuid(),
        categoryId: z.string().uuid(),
        periodStart: z.string(),
        periodEnd: z.string(),
        taxableAmount: z.number().min(0),
        taxAmount: z.number().min(0),
        status: z.enum(["open", "filed", "paid", "void"]).default("open"),
        memo: z.string().max(1000).optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("tax_liabilities")
      .insert({
        org_id: data.orgId,
        jurisdiction_id: data.jurisdictionId,
        category_id: data.categoryId,
        period_start: data.periodStart,
        period_end: data.periodEnd,
        taxable_amount: data.taxableAmount,
        tax_amount: data.taxAmount,
        status: data.status,
        memo: data.memo ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
