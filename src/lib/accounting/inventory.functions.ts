import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * M8 — Inventory & Cost Accounting
 *
 * Read/write server functions for inventory master data and movement
 * transactions. NO journal entries are created here. All ledger postings
 * continue to flow through the existing accounting engine RPCs.
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

// ---------- categories ----------

export const listInventoryCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("inventory_categories")
      .select("*")
      .eq("org_id", data.orgId)
      .order("name");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertInventoryCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      id: z.string().uuid().optional(),
      orgId: z.string().uuid(),
      name: z.string().min(1).max(200),
      parentId: z.string().uuid().nullable().optional(),
      cogsAccountId: z.string().uuid().nullable().optional(),
      assetAccountId: z.string().uuid().nullable().optional(),
      isActive: z.boolean().default(true),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      name: data.name,
      parent_id: data.parentId ?? null,
      cogs_account_id: data.cogsAccountId ?? null,
      asset_account_id: data.assetAccountId ?? null,
      is_active: data.isActive,
    };
    const q = data.id
      ? context.supabase.from("inventory_categories").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("inventory_categories").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- locations ----------

export const listInventoryLocations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("inventory_locations")
      .select("*")
      .eq("org_id", data.orgId)
      .order("code");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertInventoryLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      id: z.string().uuid().optional(),
      orgId: z.string().uuid(),
      code: z.string().min(1).max(32),
      name: z.string().min(1).max(200),
      address: z.string().max(500).optional(),
      isActive: z.boolean().default(true),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      code: data.code,
      name: data.name,
      address: data.address ?? null,
      is_active: data.isActive,
    };
    const q = data.id
      ? context.supabase.from("inventory_locations").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("inventory_locations").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- items ----------

export const listInventoryItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      search: z.string().optional(),
      limit: z.number().int().min(1).max(500).default(200),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("inventory_items")
      .select("*")
      .eq("org_id", data.orgId)
      .order("sku")
      .limit(data.limit);
    if (data.search) q = q.or(`sku.ilike.%${data.search}%,name.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertInventoryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      id: z.string().uuid().optional(),
      orgId: z.string().uuid(),
      sku: z.string().min(1).max(64),
      name: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
      categoryId: z.string().uuid().nullable().optional(),
      unitOfMeasure: z.string().min(1).max(32).default("each"),
      costMethod: z.enum(["average", "fifo", "standard", "specific"]).default("average"),
      standardCost: z.number().nullable().optional(),
      isTracked: z.boolean().default(true),
      isActive: z.boolean().default(true),
      cogsAccountId: z.string().uuid().nullable().optional(),
      assetAccountId: z.string().uuid().nullable().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      sku: data.sku,
      name: data.name,
      description: data.description ?? null,
      category_id: data.categoryId ?? null,
      unit_of_measure: data.unitOfMeasure,
      cost_method: data.costMethod,
      standard_cost: data.standardCost ?? null,
      is_tracked: data.isTracked,
      is_active: data.isActive,
      cogs_account_id: data.cogsAccountId ?? null,
      asset_account_id: data.assetAccountId ?? null,
    };
    const q = data.id
      ? context.supabase.from("inventory_items").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("inventory_items").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- transactions ----------

export const listInventoryTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      itemId: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(500).default(200),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("inventory_transactions")
      .select("*")
      .eq("org_id", data.orgId)
      .order("occurred_at", { ascending: false })
      .limit(data.limit);
    if (data.itemId) q = q.eq("item_id", data.itemId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const recordInventoryTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      itemId: z.string().uuid(),
      locationId: z.string().uuid().nullable().optional(),
      txnType: z.enum([
        "receipt", "issue", "adjustment", "transfer_in", "transfer_out", "consumption", "revaluation",
      ]),
      quantity: z.number(),
      unitCost: z.number().default(0),
      referenceType: z.string().max(64).optional(),
      referenceId: z.string().uuid().optional(),
      memo: z.string().max(1000).optional(),
      occurredAt: z.string().datetime().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const totalCost = Math.round(data.quantity * data.unitCost * 10000) / 10000;
    const { data: row, error } = await context.supabase
      .from("inventory_transactions")
      .insert({
        org_id: data.orgId,
        item_id: data.itemId,
        location_id: data.locationId ?? null,
        txn_type: data.txnType,
        quantity: data.quantity,
        unit_cost: data.unitCost,
        total_cost: totalCost,
        reference_type: data.referenceType ?? null,
        reference_id: data.referenceId ?? null,
        memo: data.memo ?? null,
        occurred_at: data.occurredAt ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
