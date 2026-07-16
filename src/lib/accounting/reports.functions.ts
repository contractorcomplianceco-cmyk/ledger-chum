import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Authenticated reporting server functions.
 * All reads are scoped by RLS via the caller's org_members membership.
 */

const orgIdInput = z.object({ orgId: z.string().uuid() });

export const getTrialBalance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgIdInput.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("v_trial_balance")
      .select("*")
      .eq("org_id", data.orgId)
      .order("code");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getARAging = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgIdInput.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("v_ar_aging")
      .select("*")
      .eq("org_id", data.orgId)
      .order("days_past_due", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getGeneralLedger = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().uuid().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("v_general_ledger")
      .select("*")
      .eq("org_id", data.orgId)
      .order("entry_date", { ascending: false })
      .limit(1000);
    if (data.from) q = q.gte("entry_date", data.from);
    if (data.to) q = q.lte("entry_date", data.to);
    if (data.accountId) q = q.eq("account_id", data.accountId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getIncomeStatement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgIdInput.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("v_trial_balance")
      .select("*")
      .eq("org_id", data.orgId)
      .in("type", ["revenue", "expense"]);
    if (error) throw new Error(error.message);
    const revenue = (rows ?? [])
      .filter((r) => r.type === "revenue")
      .reduce((s, r) => s + Number(r.total_credit) - Number(r.total_debit), 0);
    const expense = (rows ?? [])
      .filter((r) => r.type === "expense")
      .reduce((s, r) => s + Number(r.total_debit) - Number(r.total_credit), 0);
    return { revenue, expense, net_income: revenue - expense, rows: rows ?? [] };
  });

export const getBalanceSheet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgIdInput.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("v_trial_balance")
      .select("*")
      .eq("org_id", data.orgId)
      .in("type", ["asset", "liability", "equity"]);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });
