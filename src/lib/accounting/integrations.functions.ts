import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

/**
 * M5 — Integration Layer
 *
 * Generic, source-agnostic CRUD for integration sources, event mappings,
 * and sync-history operations (list + retry). No client-specific rules
 * live here; ServiceConnect is a *configuration* of these primitives,
 * not a code path.
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

// ---------- sources ---------------------------------------------------

const sourceKindEnum = z.enum([
  "inbound_api",
  "outbound_api",
  "webhook",
  "file_feed",
  "manual",
]);

export const listIntegrationSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.from(
      "integration_sources",
    )
      .select(
        "id, source_key, name, kind, active, contact_email, notes, config, created_at, updated_at",
      )
      .eq("org_id", data.orgId)
      .order("name");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertIntegrationSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        id: z.string().uuid().optional(),
        sourceKey: z
          .string()
          .min(2)
          .max(64)
          .regex(/^[a-z0-9_.-]+$/, "lowercase alphanumeric, _ . -"),
        name: z.string().min(1).max(200),
        kind: sourceKindEnum.default("inbound_api"),
        active: z.boolean().default(true),
        contactEmail: z.string().email().nullable().optional(),
        notes: z.string().max(2000).nullable().optional(),
        config: z.record(z.unknown()).optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      source_key: data.sourceKey,
      name: data.name,
      kind: data.kind,
      active: data.active,
      contact_email: data.contactEmail ?? null,
      notes: data.notes ?? null,
      config: (data.config ?? {}) as Json,
    };
    const { data: row, error } = await context.supabase.from(
      "integration_sources",
    )
      .upsert(payload, { onConflict: "org_id,source_key" })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: data.id
        ? "integration_source.updated"
        : "integration_source.created",
      action: data.id ? "updated" : "created",
      target_type: "integration_source",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });
    return row;
  });

export const setIntegrationSourceActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        id: z.string().uuid(),
        active: z.boolean(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from(
      "integration_sources",
    )
      .update({ active: data.active })
      .eq("id", data.id)
      .eq("org_id", data.orgId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: data.active
        ? "integration_source.activated"
        : "integration_source.deactivated",
      action: "updated",
      target_type: "integration_source",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });
    return row;
  });

// ---------- event mappings --------------------------------------------

const ledgerObjectEnum = z.enum([
  "customer",
  "invoice",
  "payment",
  "refund",
  "inventory_consumption",
  "bill",
  "credit",
]);

export const listIntegrationEventMappings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.from(
      "integration_event_mappings",
    )
      .select(
        "id, source_id, external_event_type, ledger_object, account_purpose, active, description, config, created_at, updated_at",
      )
      .eq("org_id", data.orgId)
      .order("external_event_type");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertIntegrationEventMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        id: z.string().uuid().optional(),
        sourceId: z.string().uuid(),
        externalEventType: z.string().min(1).max(200),
        ledgerObject: ledgerObjectEnum,
        accountPurpose: z.string().min(1).max(64).nullable().optional(),
        active: z.boolean().default(true),
        description: z.string().max(2000).nullable().optional(),
        config: z.record(z.unknown()).optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      org_id: data.orgId,
      source_id: data.sourceId,
      external_event_type: data.externalEventType,
      ledger_object: data.ledgerObject,
      account_purpose: data.accountPurpose ?? null,
      active: data.active,
      description: data.description ?? null,
      config: (data.config ?? {}) as Json,
    };
    const { data: row, error } = await context.supabase.from(
      "integration_event_mappings",
    )
      .upsert(payload, { onConflict: "org_id,source_id,external_event_type" })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "integration_event_mapping.upserted",
      action: "updated",
      target_type: "integration_event_mapping",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });
    return row;
  });

export const deleteIntegrationEventMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), id: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from(
      "integration_event_mappings",
    )
      .delete()
      .eq("id", data.id)
      .eq("org_id", data.orgId);
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "integration_event_mapping.deleted",
      action: "deleted",
      target_type: "integration_event_mapping",
      target_id: data.id,
      source: "ledgeros.ui",
    });
    return { ok: true };
  });

// ---------- sync history ---------------------------------------------

export const listFailedSyncHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        limit: z.number().int().min(1).max(500).default(200),
        status: z.enum(["error", "ok", "duplicate", "all"]).default("error"),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("sync_history")
      .select(
        "id, source, endpoint, external_id, idempotency_key, status, error, retry_count, last_retry_at, event_type, created_at",
      )
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/**
 * Mark a failed sync-history row for retry. This is an *operator signal*:
 * it increments retry_count and stamps last_retry_at + writes an audit
 * event. The actual replay is performed by the external integrator
 * re-posting with the same idempotency key — LedgerOS remains the
 * financial-truth boundary and does not re-execute business rules on its
 * own.
 */
export const markSyncRetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), id: z.string().uuid() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: existing, error: readErr } = await context.supabase
      .from("sync_history")
      .select("id, retry_count")
      .eq("id", data.id)
      .eq("org_id", data.orgId)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!existing) throw new Error("sync_history row not found");

    const { data: row, error } = await context.supabase.from(
      "sync_history",
    )
      .update({
        retry_count: (existing.retry_count ?? 0) + 1,
        last_retry_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("org_id", data.orgId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "sync_history.retry_requested",
      action: "updated",
      target_type: "sync_history",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });
    return row;
  });
