import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const orgInput = z.object({ orgId: z.string().uuid() });

/**
 * Accounting Control Center — org-wide exceptions across sub-ledgers.
 * Powered by the `v_control_exceptions` view.
 */
export const listControlExceptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgInput.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("v_control_exceptions")
      .select("*")
      .eq("org_id", data.orgId)
      .order("occurred_on", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Top-level KPIs for the Control Center. */
export const getControlSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgInput.parse(v))
  .handler(async ({ data, context }) => {
    const [exceptions, currentPeriod, closeRuns, unmatched, drafts] = await Promise.all([
      context.supabase
        .from("v_control_exceptions")
        .select("category, severity")
        .eq("org_id", data.orgId),
      context.supabase
        .from("fiscal_periods")
        .select("id, period_number, start_date, end_date, status")
        .eq("org_id", data.orgId)
        .lte("start_date", new Date().toISOString().slice(0, 10))
        .gte("end_date", new Date().toISOString().slice(0, 10))
        .maybeSingle(),
      context.supabase
        .from("close_runs")
        .select("id, status, started_at, completed_at")
        .eq("org_id", data.orgId)
        .order("started_at", { ascending: false })
        .limit(5),
      context.supabase
        .from("bank_transactions")
        .select("id", { count: "exact", head: true })
        .eq("org_id", data.orgId)
        .eq("status", "unmatched"),
      context.supabase
        .from("journal_entries")
        .select("id", { count: "exact", head: true })
        .eq("org_id", data.orgId)
        .eq("status", "draft"),
    ]);

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = { warning: 0, critical: 0 };
    for (const e of exceptions.data ?? []) {
      if (e.category) byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
      if (e.severity) bySeverity[e.severity] = (bySeverity[e.severity] ?? 0) + 1;
    }

    return {
      currentPeriod: currentPeriod.data,
      recentCloseRuns: closeRuns.data ?? [],
      exceptionsTotal: (exceptions.data ?? []).length,
      byCategory,
      bySeverity,
      unmatchedBankTxns: unmatched.count ?? 0,
      draftJournals: drafts.count ?? 0,
    };
  });
