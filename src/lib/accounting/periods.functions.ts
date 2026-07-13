import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const orgInput = z.object({ orgId: z.string().uuid() });

export const listFiscalYears = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgInput.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("fiscal_years")
      .select("*")
      .eq("org_id", data.orgId)
      .order("year", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listFiscalPeriods = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      fiscalYearId: z.string().uuid().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("fiscal_periods")
      .select("*")
      .eq("org_id", data.orgId)
      .order("start_date", { ascending: true });
    if (data.fiscalYearId) q = q.eq("fiscal_year_id", data.fiscalYearId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createFiscalYear = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      year: z.number().int().min(1900).max(2200),
      startDate: z.string(),
      endDate: z.string(),
      generateMonthlyPeriods: z.boolean().default(true),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: fy, error } = await context.supabase
      .from("fiscal_years")
      .insert({
        org_id: data.orgId,
        year: data.year,
        start_date: data.startDate,
        end_date: data.endDate,
        status: "open",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (data.generateMonthlyPeriods) {
      const start = new Date(data.startDate);
      const periods = Array.from({ length: 12 }, (_, i) => {
        const s = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
        const e = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i + 1, 0));
        return {
          org_id: data.orgId,
          fiscal_year_id: fy.id,
          period_number: i + 1,
          start_date: s.toISOString().slice(0, 10),
          end_date: e.toISOString().slice(0, 10),
          status: "open" as const,
        };
      });
      const { error: pErr } = await context.supabase.from("fiscal_periods").insert(periods);
      if (pErr) throw new Error(pErr.message);
    }

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "fiscal_year.created",
      action: "created",
      target_type: "fiscal_year",
      target_id: fy.id,
      after: fy,
      source: "ledgeros.ui",
    });

    return fy;
  });

export const setPeriodStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      periodId: z.string().uuid(),
      status: z.enum(["open", "pending_close", "closed", "locked"]),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: before } = await context.supabase
      .from("fiscal_periods")
      .select("*")
      .eq("id", data.periodId)
      .single();

    const patch: { status: typeof data.status; closed_at?: string; closed_by?: string } = {
      status: data.status,
    };
    if (data.status === "closed" || data.status === "locked") {
      patch.closed_at = new Date().toISOString();
      patch.closed_by = context.userId;
    }

    const { data: after, error } = await context.supabase
      .from("fiscal_periods")
      .update(patch)
      .eq("id", data.periodId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: after.org_id,
      actor_type: "user",
      actor_id: context.userId,
      event_type: `fiscal_period.${data.status}`,
      action: data.status,
      target_type: "fiscal_period",
      target_id: after.id,
      before,
      after,
      source: "ledgeros.ui",
    });

    return after;
  });
