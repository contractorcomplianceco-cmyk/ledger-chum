import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { MetricAiResponse } from "./types";

/**
 * M9A — Canonical Financial Metrics Layer
 *
 * Server contract for the metric registry. Every function is:
 *  - authenticated (requireSupabaseAuth)
 *  - organization-scoped (RLS on financial_metrics / values / lineage)
 *  - audit-logged via financial_metric_values.calculated_by
 *
 * Metrics are the ONLY sanctioned way for APEX / AI / future APIs to
 * consume financial data. AI cannot mutate metrics; calculateMetric
 * always writes a NEW value row (never edits catalog definitions).
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

// ------------------------------------------------------------
// Catalog
// ------------------------------------------------------------

export const listMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        category: z.string().optional(),
        status: z.enum(["draft", "active", "deprecated", "all"]).default("active"),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    // Lazily seed canonical metrics for a new org (idempotent).
    const seed = await context.supabase
      .from("financial_metrics")
      .select("id", { count: "exact", head: true })
      .eq("org_id", data.orgId);
    if ((seed.count ?? 0) === 0) {
      await context.supabase.rpc("seed_canonical_metrics", { _org_id: data.orgId });
    }

    let q = context.supabase
      .from("financial_metrics")
      .select("*")
      .eq("org_id", data.orgId)
      .order("category", { ascending: true })
      .order("metric_name", { ascending: true });
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.category) q = q.eq("category", data.category as never);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getMetric = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), metricKey: z.string() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("financial_metrics")
      .select("*")
      .eq("org_id", data.orgId)
      .eq("metric_key", data.metricKey)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ------------------------------------------------------------
// Values
// ------------------------------------------------------------

export const getMetricValue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        metricId: z.string().uuid().optional(),
        metricKey: z.string().optional(),
        limit: z.number().int().min(1).max(200).default(1),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let metricId = data.metricId;
    if (!metricId && data.metricKey) {
      const { data: m, error: e1 } = await context.supabase
        .from("financial_metrics")
        .select("id")
        .eq("org_id", data.orgId)
        .eq("metric_key", data.metricKey)
        .maybeSingle();
      if (e1) throw new Error(e1.message);
      metricId = m?.id;
    }
    if (!metricId) return [];

    const { data: rows, error } = await context.supabase
      .from("financial_metric_values")
      .select("*")
      .eq("org_id", data.orgId)
      .eq("metric_id", metricId)
      .order("calculation_timestamp", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ------------------------------------------------------------
// Lineage
// ------------------------------------------------------------

export const getMetricLineage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), metricId: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("financial_metric_lineage")
      .select("*")
      .eq("org_id", data.orgId)
      .eq("metric_id", data.metricId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listMetricDependencies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("financial_metric_lineage")
      .select("metric_id, dependency_metric_key")
      .eq("org_id", data.orgId)
      .not("dependency_metric_key", "is", null);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ------------------------------------------------------------
// Calculation
//
// Each supported metric_key has a canonical calculation path. Unsupported
// keys record an "unavailable" value row so consumers see the freshness
// signal instead of a silent failure.
// ------------------------------------------------------------

type CalcInput = {
  orgId: string;
  from?: string;
  to?: string;
};

async function calcRevenue(ctx: { supabase: any }, i: CalcInput) {
  let q = ctx.supabase
    .from("journal_lines")
    .select(
      "credit, debit, account:accounts!inner(type, org_id), journal:journal_entries!inner(org_id, status, entry_date)",
    )
    .eq("account.org_id", i.orgId)
    .eq("journal.org_id", i.orgId)
    .eq("journal.status", "posted")
    .eq("account.type", "revenue");
  if (i.from) q = q.gte("journal.entry_date", i.from);
  if (i.to) q = q.lte("journal.entry_date", i.to);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const value = (data ?? []).reduce(
    (s: number, r: any) => s + Number(r.credit ?? 0) - Number(r.debit ?? 0),
    0,
  );
  return { value, sourceCount: data?.length ?? 0 };
}

async function calcAccountTypeTotal(
  ctx: { supabase: any },
  i: CalcInput,
  type: string,
  sign: 1 | -1,
) {
  let q = ctx.supabase
    .from("journal_lines")
    .select(
      "credit, debit, account:accounts!inner(type, org_id), journal:journal_entries!inner(org_id, status, entry_date)",
    )
    .eq("account.org_id", i.orgId)
    .eq("journal.org_id", i.orgId)
    .eq("journal.status", "posted")
    .eq("account.type", type);
  if (i.from) q = q.gte("journal.entry_date", i.from);
  if (i.to) q = q.lte("journal.entry_date", i.to);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const value = (data ?? []).reduce(
    (s: number, r: any) =>
      s + sign * (Number(r.debit ?? 0) - Number(r.credit ?? 0)),
    0,
  );
  return { value, sourceCount: data?.length ?? 0 };
}

async function calcTrueAvailableCash(ctx: { supabase: any }, i: CalcInput) {
  const bank = await ctx.supabase
    .from("bank_accounts")
    .select("current_balance, is_active")
    .eq("org_id", i.orgId);
  if (bank.error) throw new Error(bank.error.message);
  const cash = (bank.data ?? []).reduce(
    (s: number, r: any) => s + Number(r.current_balance ?? 0),
    0,
  );
  const ap = await ctx.supabase
    .from("bills")
    .select("balance_due, status")
    .eq("org_id", i.orgId)
    .neq("status", "paid");
  if (ap.error) throw new Error(ap.error.message);
  const obligations = (ap.data ?? []).reduce(
    (s: number, r: any) => s + Number(r.balance_due ?? 0),
    0,
  );
  return {
    value: cash - obligations,
    sourceCount: (bank.data?.length ?? 0) + (ap.data?.length ?? 0),
    assumptions: [
      "Restricted / reserved allocations not yet subtracted — Phase 5 hook.",
    ],
  };
}

async function calcArBalance(ctx: { supabase: any }, i: CalcInput) {
  const { data, error } = await ctx.supabase
    .from("invoices")
    .select("balance_due, status")
    .eq("org_id", i.orgId)
    .neq("status", "paid");
  if (error) throw new Error(error.message);
  const value = (data ?? []).reduce(
    (s: number, r: any) => s + Number(r.balance_due ?? 0),
    0,
  );
  return { value, sourceCount: data?.length ?? 0 };
}

async function calcApBalance(ctx: { supabase: any }, i: CalcInput) {
  const { data, error } = await ctx.supabase
    .from("bills")
    .select("balance_due, status")
    .eq("org_id", i.orgId)
    .neq("status", "paid");
  if (error) throw new Error(error.message);
  const value = (data ?? []).reduce(
    (s: number, r: any) => s + Number(r.balance_due ?? 0),
    0,
  );
  return { value, sourceCount: data?.length ?? 0 };
}

export const calculateMetric = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        metricKey: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: metric, error: e0 } = await context.supabase
      .from("financial_metrics")
      .select("*")
      .eq("org_id", data.orgId)
      .eq("metric_key", data.metricKey)
      .maybeSingle();
    if (e0) throw new Error(e0.message);
    if (!metric) throw new Error(`Metric not found: ${data.metricKey}`);

    // Sensitive metrics require the declared permission (owner always passes
    // via has_role in policies). Deny explicit non-privileged callers.
    if (metric.is_sensitive && metric.required_permission) {
      const { data: allowed } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: metric.required_permission,
      });
      if (!allowed) throw new Error("Forbidden: metric requires elevated permission");
    }

    const input: CalcInput = { orgId: data.orgId, from: data.from, to: data.to };
    let value: number | null = null;
    let sourceCount = 0;
    let assumptions: string[] = [];
    const missing_data: string[] = [];
    let confidence = 0.9;
    let freshness: "fresh" | "delayed" | "stale" | "unavailable" = "fresh";

    try {
      switch (metric.metric_key) {
        case "revenue": {
          const r = await calcRevenue(context, input);
          value = r.value;
          sourceCount = r.sourceCount;
          break;
        }
        case "gross_profit": {
          const [rev, cogs] = await Promise.all([
            calcRevenue(context, input),
            calcAccountTypeTotal(context, input, "cogs", 1),
          ]);
          value = rev.value - cogs.value;
          sourceCount = rev.sourceCount + cogs.sourceCount;
          break;
        }
        case "net_income": {
          const [rev, cogs, exp] = await Promise.all([
            calcRevenue(context, input),
            calcAccountTypeTotal(context, input, "cogs", 1),
            calcAccountTypeTotal(context, input, "expense", 1),
          ]);
          value = rev.value - cogs.value - exp.value;
          sourceCount = rev.sourceCount + cogs.sourceCount + exp.sourceCount;
          break;
        }
        case "gross_margin": {
          const [rev, cogs] = await Promise.all([
            calcRevenue(context, input),
            calcAccountTypeTotal(context, input, "cogs", 1),
          ]);
          value = rev.value > 0 ? (rev.value - cogs.value) / rev.value : null;
          sourceCount = rev.sourceCount + cogs.sourceCount;
          if (value === null) missing_data.push("No posted revenue in period.");
          break;
        }
        case "operating_margin": {
          const [rev, cogs, exp] = await Promise.all([
            calcRevenue(context, input),
            calcAccountTypeTotal(context, input, "cogs", 1),
            calcAccountTypeTotal(context, input, "expense", 1),
          ]);
          value = rev.value > 0 ? (rev.value - cogs.value - exp.value) / rev.value : null;
          sourceCount = rev.sourceCount + cogs.sourceCount + exp.sourceCount;
          if (value === null) missing_data.push("No posted revenue in period.");
          break;
        }
        case "true_available_cash": {
          const r = await calcTrueAvailableCash(context, input);
          value = r.value;
          sourceCount = r.sourceCount;
          assumptions = r.assumptions;
          confidence = 0.8;
          break;
        }
        case "ar_balance": {
          const r = await calcArBalance(context, input);
          value = r.value;
          sourceCount = r.sourceCount;
          break;
        }
        case "ap_balance": {
          const r = await calcApBalance(context, input);
          value = r.value;
          sourceCount = r.sourceCount;
          break;
        }
        case "working_capital": {
          const [ar, cash, ap] = await Promise.all([
            calcArBalance(context, input),
            calcTrueAvailableCash(context, input),
            calcApBalance(context, input),
          ]);
          value = ar.value + cash.value - ap.value;
          sourceCount = ar.sourceCount + cash.sourceCount + ap.sourceCount;
          assumptions.push("Simplified: cash + AR − AP. Full current-asset/liability rollup pending.");
          confidence = 0.7;
          break;
        }
        case "cash_runway": {
          const cash = await calcTrueAvailableCash(context, input);
          const exp = await calcAccountTypeTotal(context, input, "expense", 1);
          const monthly = exp.value / 3; // trailing 3m demo
          value = monthly > 0 ? cash.value / monthly : null;
          sourceCount = cash.sourceCount + exp.sourceCount;
          assumptions.push("Demonstration calculation until forecasting engine is connected.");
          confidence = 0.5;
          break;
        }
        default: {
          value = null;
          freshness = "unavailable";
          confidence = 0;
          missing_data.push(`Calculator not yet implemented for metric_key=${metric.metric_key}.`);
        }
      }
    } catch (err) {
      value = null;
      freshness = "unavailable";
      confidence = 0;
      missing_data.push(err instanceof Error ? err.message : "Calculation failed.");
    }

    if (sourceCount === 0 && value !== null) {
      freshness = "stale";
      confidence = Math.min(confidence, 0.4);
    }

    const { data: inserted, error } = await context.supabase
      .from("financial_metric_values")
      .insert({
        org_id: data.orgId,
        metric_id: metric.id,
        value,
        period_start: data.from ?? null,
        period_end: data.to ?? null,
        confidence_score: confidence,
        freshness_status: freshness,
        source_count: sourceCount,
        assumptions,
        missing_data,
        calculated_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    return inserted;
  });

export const refreshMetric = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), metricKey: z.string() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    // Delegate to calculateMetric; kept as a separate name for scheduler clarity.
    // Server functions cannot call each other's handlers directly, so we
    // inline the same shape via the underlying implementation.
    // For simplicity we call calculateMetric via its handler after resolving.
    const fn = calculateMetric as unknown as {
      __executeServer: (arg: { data: unknown; context: unknown }) => Promise<unknown>;
    };
    if (typeof fn.__executeServer === "function") {
      return fn.__executeServer({
        data: { orgId: data.orgId, metricKey: data.metricKey },
        context,
      });
    }
    return null;
  });

// ------------------------------------------------------------
// AI-ready contract
// ------------------------------------------------------------

export const getMetricAiResponse = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), metricKey: z.string() }).parse(v),
  )
  .handler(async ({ data, context }): Promise<MetricAiResponse | null> => {
    const { data: metric, error } = await context.supabase
      .from("financial_metrics")
      .select("*")
      .eq("org_id", data.orgId)
      .eq("metric_key", data.metricKey)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!metric) return null;

    const [{ data: values }, { data: lineage }] = await Promise.all([
      context.supabase
        .from("financial_metric_values")
        .select("*")
        .eq("org_id", data.orgId)
        .eq("metric_id", metric.id)
        .order("calculation_timestamp", { ascending: false })
        .limit(1),
      context.supabase
        .from("financial_metric_lineage")
        .select("*")
        .eq("org_id", data.orgId)
        .eq("metric_id", metric.id),
    ]);

    const value = (values ?? [])[0] ?? null;
    return {
      metric,
      value,
      formula: metric.formula_definition,
      evidence: lineage ?? [],
      confidence: {
        score: Number(value?.confidence_score ?? 0),
        rationale:
          metric.confidence_rule ??
          "Confidence reflects source freshness and completeness.",
      },
      freshness: (value?.freshness_status ?? "unavailable") as MetricAiResponse["freshness"],
      assumptions: value?.assumptions ?? [],
      missing_data: value?.missing_data ?? [],
      demonstration_only: metric.demonstration_only,
    };
  });
