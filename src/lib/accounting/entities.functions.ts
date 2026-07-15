import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * M8 — Multi-Entity Foundation
 *
 * Legal entities and intercompany transactions. Consolidation and
 * intercompany elimination logic are deferred to a future milestone.
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

export const listLegalEntities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("legal_entities").select("*").eq("org_id", data.orgId).order("code");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertLegalEntity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      id: z.string().uuid().optional(),
      orgId: z.string().uuid(),
      code: z.string().min(1).max(64),
      name: z.string().min(1).max(200),
      entityType: z.enum([
        "llc","corporation","partnership","sole_proprietor","nonprofit","branch","division","other",
      ]).default("llc"),
      parentEntityId: z.string().uuid().nullable().optional(),
      country: z.string().max(64).optional(),
      taxId: z.string().max(64).optional(),
      functionalCurrency: z.string().min(3).max(3).default("USD"),
      isConsolidated: z.boolean().default(true),
      isActive: z.boolean().default(true),
      intercompanyArAccountId: z.string().uuid().nullable().optional(),
      intercompanyApAccountId: z.string().uuid().nullable().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      code: data.code, name: data.name,
      entity_type: data.entityType,
      parent_entity_id: data.parentEntityId ?? null,
      country: data.country ?? null,
      tax_id: data.taxId ?? null,
      functional_currency: data.functionalCurrency,
      is_consolidated: data.isConsolidated,
      is_active: data.isActive,
      intercompany_ar_account_id: data.intercompanyArAccountId ?? null,
      intercompany_ap_account_id: data.intercompanyApAccountId ?? null,
    };
    const q = data.id
      ? context.supabase.from("legal_entities").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("legal_entities").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const listIntercompanyTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      status: z.enum(["pending","posted","settled","void","all"]).default("all"),
      limit: z.number().int().min(1).max(500).default(200),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("intercompany_transactions").select("*")
      .eq("org_id", data.orgId)
      .order("txn_date", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const recordIntercompanyTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      fromEntityId: z.string().uuid(),
      toEntityId: z.string().uuid(),
      txnDate: z.string(),
      amount: z.number(),
      currency: z.string().min(3).max(3).default("USD"),
      description: z.string().max(1000).optional(),
      memo: z.string().max(1000).optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    if (data.fromEntityId === data.toEntityId) {
      throw new Error("from_entity and to_entity must differ");
    }
    const { data: row, error } = await context.supabase
      .from("intercompany_transactions")
      .insert({
        org_id: data.orgId,
        from_entity_id: data.fromEntityId,
        to_entity_id: data.toEntityId,
        txn_date: data.txnDate,
        amount: data.amount,
        currency: data.currency,
        description: data.description ?? null,
        memo: data.memo ?? null,
        status: "pending",
      })
      .select().single();
    if (error) throw new Error(error.message);
    return row;
  });

/**
 * Due-to/from balance summary. This is a live aggregation of posted
 * intercompany transactions. Consolidated eliminations are out of scope for M8.
 */
export const getIntercompanyBalances = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("intercompany_transactions")
      .select("from_entity_id, to_entity_id, amount, status")
      .eq("org_id", data.orgId)
      .in("status", ["posted", "settled"]);
    if (error) throw new Error(error.message);

    const map = new Map<string, { from: string; to: string; net: number }>();
    for (const r of rows ?? []) {
      const key = `${r.from_entity_id}->${r.to_entity_id}`;
      const cur = map.get(key) ?? { from: r.from_entity_id, to: r.to_entity_id, net: 0 };
      cur.net += r.status === "settled" ? 0 : Number(r.amount);
      map.set(key, cur);
    }
    return Array.from(map.values());
  });
