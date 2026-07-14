import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Vendors — master data for AP.
 * All access flows through RLS scoped by `is_org_member`.
 */

export const listVendors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      status: z.enum(["active", "inactive"]).optional(),
      search: z.string().optional(),
      limit: z.number().int().min(1).max(500).default(200),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("vendors")
      .select("*")
      .eq("org_id", data.orgId)
      .order("name", { ascending: true })
      .limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getVendor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("vendors")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const upsertVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      id: z.string().uuid().optional(),
      orgId: z.string().uuid(),
      name: z.string().min(1),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
      termsDays: z.number().int().min(0).max(365).default(30),
      defaultExpenseAccountId: z.string().uuid().nullable().optional(),
      memo: z.string().optional(),
      status: z.enum(["active", "inactive"]).default("active"),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      terms_days: data.termsDays,
      default_expense_account_id: data.defaultExpenseAccountId ?? null,
      memo: data.memo || null,
      status: data.status,
    };
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("vendors")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await context.supabase
      .from("vendors")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/** Balance = sum of open/partial bill.balance for this vendor. */
export const getVendorBalances = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("bills")
      .select("vendor_id, balance, status")
      .eq("org_id", data.orgId)
      .in("status", ["open", "partial"]);
    if (error) throw new Error(error.message);
    const map = new Map<string, number>();
    for (const r of rows ?? []) {
      map.set(r.vendor_id, (map.get(r.vendor_id) ?? 0) + Number(r.balance ?? 0));
    }
    return Array.from(map, ([vendorId, balance]) => ({ vendorId, balance }));
  });
