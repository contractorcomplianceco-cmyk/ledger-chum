import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

/**
 * M6 — Financial Event Engine
 *
 * Server functions for the accountant-facing side of the event bus:
 * listing / inspecting events, approving or rejecting them, and
 * managing the configurable rules that decide auto-approval.
 *
 * Ingestion (from external systems) happens through the public
 * integration route which calls the `ingest_financial_event` RPC —
 * external systems never write to `financial_events` or journal
 * entries directly. Approved events remain in `approved` status
 * until a human or a follow-on materialization step (out of scope
 * for M6) turns them into ledger objects using the existing posting
 * engine.
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

// ---------- events ----------------------------------------------------

const eventStatusEnum = z.enum([
  "received",
  "validated",
  "mapped",
  "pending_approval",
  "approved",
  "materialized",
  "rejected",
  "error",
  "all",
]);

export const listFinancialEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        status: eventStatusEnum.default("all"),
        limit: z.number().int().min(1).max(500).default(200),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("financial_events")
      .select(
        "id, source_id, source_system, external_event_type, external_id, idempotency_key, correlation_id, ledger_object, status, mapping_id, matched_rule_id, requires_approval, materialized_target_type, materialized_target_id, error, approved_at, rejected_at, created_at, updated_at",
      )
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getFinancialEvent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), id: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("financial_events")
      .select("*")
      .eq("id", data.id)
      .eq("org_id", data.orgId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const approveFinancialEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        id: z.string().uuid(),
        note: z.string().max(2000).optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc(
      "approve_financial_event",
      {
        _org_id: data.orgId,
        _event_id: data.id,
        _note: data.note ?? null,
      },
    );
    if (error) throw new Error(error.message);
    return res as { event_id: string; status: string };
  });

export const rejectFinancialEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        id: z.string().uuid(),
        reason: z.string().min(1).max(2000),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc(
      "reject_financial_event",
      {
        _org_id: data.orgId,
        _event_id: data.id,
        _reason: data.reason,
      },
    );
    if (error) throw new Error(error.message);
    return res as { event_id: string; status: string };
  });

// ---------- rules -----------------------------------------------------

export const listEventRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("financial_event_rules")
      .select("*")
      .eq("org_id", data.orgId)
      .order("priority", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertEventRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(200),
        description: z.string().max(2000).nullable().optional(),
        priority: z.number().int().min(0).max(10000).default(100),
        active: z.boolean().default(true),
        conditions: z.record(z.unknown()).default({}),
        actions: z.record(z.unknown()).default({}),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      name: data.name,
      description: data.description ?? null,
      priority: data.priority,
      active: data.active,
      conditions: data.conditions as Json,
      actions: data.actions as Json,
    };
    const table = context.supabase.from("financial_event_rules");
    const query = data.id
      ? table.update(payload).eq("id", data.id).eq("org_id", data.orgId).select().single()
      : table.insert(payload).select().single();
    const { data: row, error } = await query;
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: data.id
        ? "financial_event_rule.updated"
        : "financial_event_rule.created",
      action: data.id ? "updated" : "created",
      target_type: "financial_event_rule",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });
    return row;
  });

export const deleteEventRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), id: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("financial_event_rules")
      .delete()
      .eq("id", data.id)
      .eq("org_id", data.orgId);
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "financial_event_rule.deleted",
      action: "deleted",
      target_type: "financial_event_rule",
      target_id: data.id,
      source: "ledgeros.ui",
    });
    return { ok: true };
  });

// ---------- M7: materialization --------------------------------------

export const materializeFinancialEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), id: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc(
      "materialize_financial_event",
      { _org_id: data.orgId, _event_id: data.id },
    );
    if (error) throw new Error(error.message);
    return res as {
      materialization_id: string;
      event_id: string;
      status: string;
      target_object_type?: string;
      target_object_id?: string;
      error_code?: string;
      error_message?: string;
      duplicate?: boolean;
    };
  });

export const retryMaterialization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), id: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc(
      "retry_materialization",
      { _org_id: data.orgId, _event_id: data.id },
    );
    if (error) throw new Error(error.message);
    return res;
  });

const materializationStatusEnum = z.enum([
  "all",
  "pending",
  "processing",
  "completed",
  "failed",
  "requires_review",
  "cancelled",
]);

export const listMaterializations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        status: materializationStatusEnum.default("all"),
        limit: z.number().int().min(1).max(500).default(200),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("financial_event_materializations")
      .select(
        "id, event_id, materialization_type, target_object_type, target_object_id, status, error_code, error_message, retry_count, created_at, completed_at",
      )
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as Array<{
      id: string;
      event_id: string;
      materialization_type: string;
      target_object_type: string | null;
      target_object_id: string | null;
      status: string;
      error_code: string | null;
      error_message: string | null;
      retry_count: number;
      created_at: string;
      completed_at: string | null;
    }>;
  });

// ---------- financial account mappings ------------------------------

export const listFinancialAccountMappings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.from(
      "financial_account_mappings",
    )
      .select("*")
      .eq("org_id", data.orgId)
      .order("external_type", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertFinancialAccountMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        id: z.string().uuid().optional(),
        integrationSourceId: z.string().uuid().nullable().optional(),
        externalType: z.string().min(1).max(100),
        externalValue: z.string().min(1).max(200),
        ledgerObjectType: z.string().max(100).nullable().optional(),
        ledgerAccountId: z.string().uuid().nullable().optional(),
        status: z.enum(["active", "inactive"]).default("active"),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      integration_source_id: data.integrationSourceId ?? null,
      external_type: data.externalType,
      external_value: data.externalValue,
      ledger_object_type: data.ledgerObjectType ?? null,
      ledger_account_id: data.ledgerAccountId ?? null,
      status: data.status,
      notes: data.notes ?? null,
    };
    const table = context.supabase.from("financial_account_mappings");
    const q = data.id
      ? table.update(payload).eq("id", data.id).eq("org_id", data.orgId).select().single()
      : table.insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteFinancialAccountMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), id: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from(
      "financial_account_mappings",
    )
      .delete()
      .eq("id", data.id)
      .eq("org_id", data.orgId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
