import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * M8 — Fixed Assets
 *
 * Master data + depreciation schedule framework. Depreciation is
 * generated as scheduled rows; journal entries are created only via
 * the existing manual journal RPC on user action.
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

export const listFixedAssetCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("fixed_asset_categories")
      .select("*")
      .eq("org_id", data.orgId)
      .order("name");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertFixedAssetCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      id: z.string().uuid().optional(),
      orgId: z.string().uuid(),
      name: z.string().min(1).max(200),
      defaultUsefulLifeMonths: z.number().int().nullable().optional(),
      defaultDepreciationMethod: z.enum([
        "straight_line", "declining_balance", "units_of_production", "none",
      ]).default("straight_line"),
      assetAccountId: z.string().uuid().nullable().optional(),
      accumulatedDepreciationAccountId: z.string().uuid().nullable().optional(),
      depreciationExpenseAccountId: z.string().uuid().nullable().optional(),
      isActive: z.boolean().default(true),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      name: data.name,
      default_useful_life_months: data.defaultUsefulLifeMonths ?? null,
      default_depreciation_method: data.defaultDepreciationMethod,
      asset_account_id: data.assetAccountId ?? null,
      accumulated_depreciation_account_id: data.accumulatedDepreciationAccountId ?? null,
      depreciation_expense_account_id: data.depreciationExpenseAccountId ?? null,
      is_active: data.isActive,
    };
    const q = data.id
      ? context.supabase.from("fixed_asset_categories").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("fixed_asset_categories").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const listFixedAssets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      status: z.enum(["active", "disposed", "impaired", "pending", "all"]).default("all"),
      limit: z.number().int().min(1).max(500).default(200),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("fixed_assets")
      .select("*")
      .eq("org_id", data.orgId)
      .order("acquisition_date", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertFixedAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      id: z.string().uuid().optional(),
      orgId: z.string().uuid(),
      assetNumber: z.string().min(1).max(64),
      name: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
      categoryId: z.string().uuid().nullable().optional(),
      acquisitionDate: z.string(),
      inServiceDate: z.string().nullable().optional(),
      acquisitionCost: z.number().min(0),
      salvageValue: z.number().min(0).default(0),
      usefulLifeMonths: z.number().int().min(1).nullable().optional(),
      depreciationMethod: z.enum([
        "straight_line", "declining_balance", "units_of_production", "none",
      ]).default("straight_line"),
      status: z.enum(["active", "disposed", "impaired", "pending"]).default("active"),
      vendorId: z.string().uuid().nullable().optional(),
      location: z.string().max(200).optional(),
      notes: z.string().max(2000).optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      asset_number: data.assetNumber,
      name: data.name,
      description: data.description ?? null,
      category_id: data.categoryId ?? null,
      acquisition_date: data.acquisitionDate,
      in_service_date: data.inServiceDate ?? null,
      acquisition_cost: data.acquisitionCost,
      salvage_value: data.salvageValue,
      useful_life_months: data.usefulLifeMonths ?? null,
      depreciation_method: data.depreciationMethod,
      status: data.status,
      vendor_id: data.vendorId ?? null,
      location: data.location ?? null,
      notes: data.notes ?? null,
    };
    const q = data.id
      ? context.supabase.from("fixed_assets").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("fixed_assets").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const listDepreciationSchedule = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), assetId: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("fixed_asset_depreciation")
      .select("*")
      .eq("org_id", data.orgId)
      .eq("asset_id", data.assetId)
      .order("period_start");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/**
 * Generate a straight-line depreciation schedule as SCHEDULED rows only.
 * No journal entries are created. Existing schedule rows for the asset
 * are removed first (only `scheduled` status; posted rows are preserved).
 */
export const generateDepreciationSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), assetId: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: asset, error: aErr } = await context.supabase
      .from("fixed_assets")
      .select("id, acquisition_cost, salvage_value, useful_life_months, in_service_date, acquisition_date, depreciation_method")
      .eq("id", data.assetId)
      .eq("org_id", data.orgId)
      .single();
    if (aErr) throw new Error(aErr.message);
    if (!asset.useful_life_months || asset.useful_life_months < 1) {
      throw new Error("Asset must have a useful_life_months value to schedule depreciation");
    }
    if (asset.depreciation_method !== "straight_line") {
      throw new Error("Only straight_line schedules can be auto-generated in M8");
    }

    const depreciable = Number(asset.acquisition_cost) - Number(asset.salvage_value ?? 0);
    const monthly = Math.round((depreciable / asset.useful_life_months) * 100) / 100;
    const start = new Date(asset.in_service_date ?? asset.acquisition_date);

    // Remove existing scheduled (non-posted) rows first
    await context.supabase
      .from("fixed_asset_depreciation")
      .delete()
      .eq("org_id", data.orgId)
      .eq("asset_id", data.assetId)
      .eq("status", "scheduled");

    const rows: Array<{
      org_id: string; asset_id: string; period_start: string; period_end: string;
      depreciation_amount: number; status: string;
    }> = [];
    let running = 0;
    for (let i = 0; i < asset.useful_life_months; i++) {
      const s = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const e = new Date(start.getFullYear(), start.getMonth() + i + 1, 0);
      const remaining = depreciable - running;
      const amt = i === asset.useful_life_months - 1 ? Math.round(remaining * 100) / 100 : monthly;
      running += amt;
      rows.push({
        org_id: data.orgId,
        asset_id: data.assetId,
        period_start: s.toISOString().slice(0, 10),
        period_end: e.toISOString().slice(0, 10),
        depreciation_amount: amt,
        status: "scheduled",
      });
    }
    if (rows.length === 0) return { inserted: 0 };
    const { error } = await context.supabase.from("fixed_asset_depreciation").insert(rows);
    if (error) throw new Error(error.message);
    return { inserted: rows.length };
  });
