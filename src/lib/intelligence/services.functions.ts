import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * M9B — Intelligence Services Layer
 *
 * Advisory-only intelligence built on top of the Canonical Metrics Layer.
 *
 * AI MUST return: answer, evidence, confidence, freshness, assumptions,
 * missing_data, recommended_action, approval_requirement.
 *
 * AI CANNOT:
 *  - modify metrics
 *  - post transactions
 *  - approve accounting actions
 *  - change financial records
 *  - override controls
 *
 * DB triggers enforce immutability of the narrative / evidence / confidence /
 * advisory_only flags on financial_anomalies and financial_recommendations.
 * intelligence_explanations is append-only.
 *
 * End users can only observe intelligence and update the status/state
 * (acknowledge / dismiss / accept / convert / resolve). Generation is
 * performed by scheduled service_role processes.
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

// ------------------------------------------------------------
// Anomalies
// ------------------------------------------------------------

export const listAnomalies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        status: z.enum(["open", "acknowledged", "dismissed", "resolved", "all"]).default("open"),
        severity: z.enum(["low", "medium", "high", "critical", "all"]).default("all"),
        limit: z.number().int().min(1).max(200).default(100),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("financial_anomalies")
      .select("*")
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.severity !== "all") q = q.eq("severity", data.severity);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const updateAnomalyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        id: z.string().uuid(),
        orgId: z.string().uuid(),
        status: z.enum(["open", "acknowledged", "dismissed", "resolved"]),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      status: typeof data.status;
      acknowledged_by?: string;
      acknowledged_at?: string;
    } = { status: data.status };
    if (data.status === "acknowledged") {
      patch.acknowledged_by = context.userId;
      patch.acknowledged_at = new Date().toISOString();
    }
    const { error } = await context.supabase
      .from("financial_anomalies")
      .update(patch)
      .eq("id", data.id)
      .eq("org_id", data.orgId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------------------------------------------------------------
// Recommendations
// ------------------------------------------------------------

export const listRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        state: z
          .enum([
            "generated",
            "needs_review",
            "accepted",
            "dismissed",
            "converted_to_task",
            "converted_to_draft",
            "approved_for_action",
            "completed",
            "outcome_measured",
            "all",
          ])
          .default("all"),
        persona: z
          .enum(["controller", "close_assistant", "accountant_assistant", "all"])
          .default("all"),
        limit: z.number().int().min(1).max(200).default(100),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("financial_recommendations")
      .select("*")
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.state !== "all") q = q.eq("state", data.state);
    if (data.persona !== "all") q = q.eq("persona", data.persona);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const updateRecommendationState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        id: z.string().uuid(),
        orgId: z.string().uuid(),
        state: z.enum([
          "generated",
          "needs_review",
          "accepted",
          "dismissed",
          "converted_to_task",
          "converted_to_draft",
          "approved_for_action",
          "completed",
          "outcome_measured",
        ]),
        outcome_note: z.string().max(2000).optional(),
        outcome_value: z.number().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      state: typeof data.state;
      reviewed_by: string;
      reviewed_at: string;
      outcome_note?: string;
      outcome_value?: number;
    } = {
      state: data.state,
      reviewed_by: context.userId,
      reviewed_at: new Date().toISOString(),
    };
    if (data.outcome_note !== undefined) patch.outcome_note = data.outcome_note;
    if (data.outcome_value !== undefined) patch.outcome_value = data.outcome_value;
    const { error } = await context.supabase
      .from("financial_recommendations")
      .update(patch)
      .eq("id", data.id)
      .eq("org_id", data.orgId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------------------------------------------------------------
// Explanations (append-only advisory answers)
// ------------------------------------------------------------

export const listExplanations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        subject_type: z
          .enum(["metric", "anomaly", "recommendation", "question", "all"])
          .default("all"),
        subject_key: z.string().optional(),
        limit: z.number().int().min(1).max(200).default(50),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("intelligence_explanations")
      .select("*")
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.subject_type !== "all") q = q.eq("subject_type", data.subject_type);
    if (data.subject_key) q = q.eq("subject_key", data.subject_key);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/**
 * Records an advisory explanation. Always advisory_only=true; the DB trigger
 * makes explanations append-only so users cannot rewrite history. AI cannot
 * use this to modify metrics — this table is a *log*, not a source of truth.
 */
export const recordExplanation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        subject_type: z.enum(["metric", "anomaly", "recommendation", "question"]),
        subject_key: z.string().min(1).max(200),
        question: z.string().max(2000).optional(),
        answer: z.string().min(1).max(8000),
        evidence: z.array(z.any()).default([]),
        supporting_metric_keys: z.array(z.string()).default([]),
        confidence: z.number().min(0).max(1).default(0.5),
        freshness: z.enum(["fresh", "delayed", "stale", "unavailable"]).default("fresh"),
        assumptions: z.array(z.string()).default([]),
        missing_data: z.array(z.string()).default([]),
        recommended_action: z.string().max(2000).optional(),
        approval_requirement: z.string().max(200).optional(),
        demonstration_only: z.boolean().default(false),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("intelligence_explanations")
      .insert({
        org_id: data.orgId,
        subject_type: data.subject_type,
        subject_key: data.subject_key,
        question: data.question ?? null,
        answer: data.answer,
        evidence: data.evidence as never,
        supporting_metric_keys: data.supporting_metric_keys,
        confidence: data.confidence,
        freshness: data.freshness,
        assumptions: data.assumptions,
        missing_data: data.missing_data,
        recommended_action: data.recommended_action ?? null,
        approval_requirement: data.approval_requirement ?? null,
        advisory_only: true,
        demonstration_only: data.demonstration_only,
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ------------------------------------------------------------
// Refresh status (freshness of the latest metric values)
// ------------------------------------------------------------

export const getRefreshStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: metrics, error: e1 } = await context.supabase
      .from("financial_metrics")
      .select("id, metric_key, metric_name, refresh_frequency, status, category")
      .eq("org_id", data.orgId)
      .eq("status", "active");
    if (e1) throw new Error(e1.message);

    const results: Array<{
      metric_id: string;
      metric_key: string;
      metric_name: string;
      category: string;
      refresh_frequency: string;
      last_calculated_at: string | null;
      freshness: "fresh" | "delayed" | "stale" | "unavailable";
      confidence: number;
    }> = [];

    for (const m of metrics ?? []) {
      const { data: v } = await context.supabase
        .from("financial_metric_values")
        .select("calculation_timestamp, freshness_status, confidence_score")
        .eq("org_id", data.orgId)
        .eq("metric_id", m.id)
        .order("calculation_timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();
      results.push({
        metric_id: m.id,
        metric_key: m.metric_key,
        metric_name: m.metric_name,
        category: m.category,
        refresh_frequency: m.refresh_frequency,
        last_calculated_at: v?.calculation_timestamp ?? null,
        freshness: (v?.freshness_status as never) ?? "unavailable",
        confidence: Number(v?.confidence_score ?? 0),
      });
    }
    return results;
  });

// ------------------------------------------------------------
// Composite scores
// ------------------------------------------------------------

export const getFinancialHealthScore = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    // Sample the latest value for a curated set of drivers. Score is
    // a weighted, bounded composite — advisory and clearly labelled.
    const drivers = [
      { key: "true_available_cash", weight: 0.25, good: 50000, bad: 0 },
      { key: "gross_margin", weight: 0.2, good: 0.5, bad: 0.15 },
      { key: "operating_margin", weight: 0.2, good: 0.2, bad: -0.05 },
      { key: "working_capital", weight: 0.15, good: 100000, bad: 0 },
      { key: "ar_balance", weight: 0.1, good: 10000, bad: 100000, invert: true },
      { key: "cash_runway", weight: 0.1, good: 12, bad: 2 },
    ] as const;

    const evidence: unknown[] = [];
    const missing: string[] = [];
    let score = 0;
    let totalWeight = 0;

    for (const d of drivers) {
      const { data: m } = await context.supabase
        .from("financial_metrics")
        .select("id")
        .eq("org_id", data.orgId)
        .eq("metric_key", d.key)
        .maybeSingle();
      if (!m) {
        missing.push(`Metric ${d.key} not registered.`);
        continue;
      }
      const { data: v } = await context.supabase
        .from("financial_metric_values")
        .select("value, freshness_status, confidence_score")
        .eq("org_id", data.orgId)
        .eq("metric_id", m.id)
        .order("calculation_timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!v || v.value === null) {
        missing.push(`No calculated value for ${d.key}.`);
        continue;
      }
      const numeric = Number(v.value);
      const invert = "invert" in d && d.invert === true;
      const good = invert ? d.bad : d.good;
      const bad = invert ? d.good : d.bad;
      const ratio = good === bad ? 0.5 : Math.max(0, Math.min(1, (numeric - bad) / (good - bad)));
      score += ratio * 100 * d.weight;
      totalWeight += d.weight;
      evidence.push({
        metric_key: d.key,
        value: numeric,
        score: Math.round(ratio * 100),
        weight: d.weight,
        freshness: v.freshness_status,
      });
    }

    const normalized = totalWeight > 0 ? Math.round(score / totalWeight) : 0;
    return {
      score: normalized,
      confidence: totalWeight >= 0.7 ? 0.8 : totalWeight >= 0.4 ? 0.5 : 0.3,
      freshness: missing.length === 0 ? "fresh" : "delayed",
      evidence,
      assumptions: [
        "Composite driven by six canonical metrics.",
        "Sensitive metrics (e.g. payroll) excluded from public health score.",
      ],
      missing_data: missing,
      advisory_only: true,
    };
  });

export const getCloseCompletionScore = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), runId: z.string().uuid().optional() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    // Score = % of tasks completed in the most recent open close run
    // (or the specified run). Advisory only; the close workflow remains
    // the source of truth.
    let runId = data.runId;
    if (!runId) {
      const { data: run } = await context.supabase
        .from("close_runs")
        .select("id")
        .eq("org_id", data.orgId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      runId = run?.id;
    }
    if (!runId) {
      return {
        score: 0,
        confidence: 0,
        freshness: "unavailable" as const,
        evidence: [],
        assumptions: [],
        missing_data: ["No close run found for this organization."],
        advisory_only: true,
      };
    }

    const { data: tasks, error } = await context.supabase
      .from("close_tasks")
      .select("id, status")
      .eq("org_id", data.orgId)
      .eq("close_run_id", runId);
    if (error) throw new Error(error.message);

    const total = tasks?.length ?? 0;
    const complete = (tasks ?? []).filter((t) => t.status === "completed").length;
    const score = total > 0 ? Math.round((complete / total) * 100) : 0;

    return {
      score,
      confidence: total > 0 ? 0.9 : 0.2,
      freshness: "fresh" as const,
      evidence: [{ run_id: runId, total_tasks: total, completed_tasks: complete }],
      assumptions: ["Score reflects task completion only; approvals tracked separately."],
      missing_data: total === 0 ? ["Close run has no tasks."] : [],
      advisory_only: true,
    };
  });

// ------------------------------------------------------------
// Governance snapshot
// ------------------------------------------------------------

export const getIntelligenceGovernance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const [anom, recs, expl] = await Promise.all([
      context.supabase
        .from("financial_anomalies")
        .select("status, severity, advisory_only")
        .eq("org_id", data.orgId),
      context.supabase
        .from("financial_recommendations")
        .select("state, persona, advisory_only")
        .eq("org_id", data.orgId),
      context.supabase
        .from("intelligence_explanations")
        .select("id, advisory_only")
        .eq("org_id", data.orgId),
    ]);

    return {
      advisory_only: true,
      ai_capabilities: {
        allowed: [
          "Explain",
          "Summarize",
          "Detect anomalies",
          "Rank",
          "Score",
          "Recommend",
          "Cite evidence",
        ],
        forbidden: [
          "Post journal entries",
          "Modify metrics",
          "Approve transactions",
          "Change financial records",
          "Override fiscal controls",
        ],
      },
      response_contract: [
        "answer",
        "evidence",
        "confidence",
        "freshness",
        "assumptions",
        "missing_data",
        "recommended_action",
        "approval_requirement",
      ],
      counts: {
        anomalies: anom.data?.length ?? 0,
        anomalies_open: (anom.data ?? []).filter((a) => a.status === "open").length,
        recommendations: recs.data?.length ?? 0,
        recommendations_open: (recs.data ?? []).filter((r) =>
          ["generated", "needs_review"].includes(r.state),
        ).length,
        explanations: expl.data?.length ?? 0,
      },
      immutability: {
        anomalies: "narrative/evidence/confidence enforced by tg_anomalies_advisory_guard",
        recommendations: "narrative/evidence/confidence enforced by tg_recs_advisory_guard",
        explanations: "append-only via tg_expl_immutable",
      },
    };
  });
