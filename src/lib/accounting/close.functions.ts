import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const orgInput = z.object({ orgId: z.string().uuid() });

/** List fiscal periods with their active close run summary. */
export const listPeriodsWithClose = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgInput.parse(v))
  .handler(async ({ data, context }) => {
    const { data: periods, error } = await context.supabase
      .from("fiscal_periods")
      .select("id, period_number, start_date, end_date, status, closed_at, fiscal_year_id")
      .eq("org_id", data.orgId)
      .order("start_date", { ascending: false })
      .limit(24);
    if (error) throw new Error(error.message);

    const periodIds = (periods ?? []).map((p) => p.id);
    if (periodIds.length === 0) return [];

    const { data: runs } = await context.supabase
      .from("close_runs")
      .select("id, fiscal_period_id, status, started_at, completed_at, started_by, completed_by")
      .in("fiscal_period_id", periodIds);

    const runByPeriod = new Map((runs ?? []).map((r) => [r.fiscal_period_id, r]));
    return (periods ?? []).map((p) => ({
      ...p,
      close_run: runByPeriod.get(p.id) ?? null,
    }));
  });

/** Get close run detail + tasks + approvals. */
export const getCloseRun = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ closeRunId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: run, error } = await context.supabase
      .from("close_runs")
      .select("*, fiscal_periods!inner(id, period_number, start_date, end_date, status)")
      .eq("id", data.closeRunId)
      .single();
    if (error) throw new Error(error.message);

    const [tasks, approvals] = await Promise.all([
      context.supabase
        .from("close_tasks")
        .select("*")
        .eq("close_run_id", data.closeRunId)
        .order("order_index", { ascending: true }),
      context.supabase
        .from("close_approvals")
        .select("*")
        .eq("close_run_id", data.closeRunId)
        .order("created_at", { ascending: false }),
    ]);
    if (tasks.error) throw new Error(tasks.error.message);
    if (approvals.error) throw new Error(approvals.error.message);

    return {
      run,
      tasks: tasks.data ?? [],
      approvals: approvals.data ?? [],
    };
  });

export const startPeriodClose = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), periodId: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("start_period_close", {
      _org_id: data.orgId,
      _period_id: data.periodId,
    });
    if (error) throw new Error(error.message);
    return res as { close_run_id: string; existing: boolean };
  });

export const setCloseTaskStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      taskId: z.string().uuid(),
      status: z.enum(["pending", "in_progress", "done", "skipped", "blocked"]),
      note: z.string().max(1000).optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("set_close_task_status", {
      _task_id: data.taskId,
      _status: data.status,
      _note: data.note ?? "",
    });
    if (error) throw new Error(error.message);
    return res;
  });

export const approvePeriodClose = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      closeRunId: z.string().uuid(),
      note: z.string().max(2000).optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("approve_period_close", {
      _close_run_id: data.closeRunId,
      _note: data.note ?? "",
    });
    if (error) throw new Error(error.message);
    return res as { close_run_id: string; period_id: string; status: string };
  });

export const reopenPeriod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      periodId: z.string().uuid(),
      reason: z.string().min(1).max(2000),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("reopen_period", {
      _org_id: data.orgId,
      _period_id: data.periodId,
      _reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return res;
  });
