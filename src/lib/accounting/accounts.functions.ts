import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Chart of Accounts — server functions backing the /ledger/accounts UI.
 * All queries are RLS-scoped via requireSupabaseAuth.
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export const listAccountTree = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("v_account_balances")
      .select(
        "account_id, code, name, type, normal_balance, parent_id, is_active, is_system, sort_order, debit_total, credit_total, balance",
      )
      .eq("org_id", data.orgId)
      .order("type")
      .order("sort_order")
      .order("code");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      code: z.string().min(1).max(32),
      name: z.string().min(1).max(200),
      type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
      normalBalance: z.enum(["debit", "credit"]),
      parentId: z.string().uuid().nullable().optional(),
      sortOrder: z.number().int().default(0),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("accounts")
      .insert({
        org_id: data.orgId,
        code: data.code,
        name: data.name,
        type: data.type,
        normal_balance: data.normalBalance,
        parent_id: data.parentId ?? null,
        sort_order: data.sortOrder,
        is_active: true,
        is_system: false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(200).optional(),
      code: z.string().min(1).max(32).optional(),
      parentId: z.string().uuid().nullable().optional(),
      sortOrder: z.number().int().optional(),
      isActive: z.boolean().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.code !== undefined) patch.code = data.code;
    if (data.parentId !== undefined) patch.parent_id = data.parentId;
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder;
    if (data.isActive !== undefined) patch.is_active = data.isActive;
    const { error } = await context.supabase.from("accounts").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
