/**
 * ServiceConnect public-integration helpers.
 *
 * Every /api/public/integrations/* route:
 *   1. Verifies Bearer <api_client_key> against public.api_clients.key_hash.
 *   2. Requires an Idempotency-Key header.
 *   3. Returns the previously-stored response when the key has been seen.
 *   4. Records the accepted request in public.sync_history.
 *   5. Writes a public.audit_events row for the mutation.
 *
 * File is *.server.ts — client bundles cannot import it. Route handlers call
 * these helpers directly.
 */

import { createHash, randomUUID } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface ResolvedClient {
  clientId: string;
  orgId: string;
  clientName: string;
}

export interface IntegrationContext extends ResolvedClient {
  idempotencyKey: string;
  endpoint: string;
  correlationId: string;
}

export class IntegrationError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

async function verifyBearer(request: Request): Promise<ResolvedClient> {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    throw new IntegrationError(401, "Missing Bearer token");
  }
  const token = auth.slice(7).trim();
  if (!token) throw new IntegrationError(401, "Empty Bearer token");

  const { data, error } = await supabaseAdmin
    .from("api_clients")
    .select("id, org_id, name, active")
    .eq("key_hash", hashKey(token))
    .maybeSingle();

  if (error) throw new IntegrationError(500, `Auth lookup failed: ${error.message}`);
  if (!data || !data.active) throw new IntegrationError(401, "Invalid or inactive API key");

  // Fire-and-forget last_used_at update.
  supabaseAdmin
    .from("api_clients")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => {}, () => {});

  return { clientId: data.id, orgId: data.org_id, clientName: data.name };
}

export async function beginIntegrationCall(
  request: Request,
  endpoint: string,
): Promise<
  | { status: "new"; ctx: IntegrationContext; body: unknown }
  | { status: "duplicate"; response: unknown }
> {
  const client = await verifyBearer(request);

  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey) throw new IntegrationError(400, "Missing Idempotency-Key header");

  const body = await request.json().catch(() => {
    throw new IntegrationError(400, "Invalid JSON body");
  });

  // Check for a previous run of this key.
  const { data: prior } = await supabaseAdmin
    .from("sync_history")
    .select("status, response")
    .eq("org_id", client.orgId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (prior && prior.status === "accepted") {
    return { status: "duplicate", response: prior.response };
  }

  return {
    status: "new",
    ctx: {
      ...client,
      idempotencyKey,
      endpoint,
      correlationId: randomUUID(),
    },
    body,
  };
}

type Json = import("@/integrations/supabase/types").Json;

export async function finishIntegrationCall(
  ctx: IntegrationContext,
  externalId: string | null,
  request: unknown,
  response: unknown,
): Promise<void> {
  await supabaseAdmin.from("sync_history").insert({
    org_id: ctx.orgId,
    source: "serviceconnect",
    endpoint: ctx.endpoint,
    external_id: externalId,
    idempotency_key: ctx.idempotencyKey,
    status: "accepted",
    request: request as Json,
    response: response as Json,
  });
}

export async function recordIntegrationError(
  ctx: IntegrationContext | null,
  request: unknown,
  err: unknown,
): Promise<void> {
  if (!ctx) return;
  await supabaseAdmin.from("sync_history").insert({
    org_id: ctx.orgId,
    source: "serviceconnect",
    endpoint: ctx.endpoint,
    external_id: null,
    idempotency_key: ctx.idempotencyKey + ":err:" + randomUUID(),
    status: "error",
    request: request as Json,
    error: err instanceof Error ? err.message : String(err),
  });
}

export async function writeAudit(
  ctx: IntegrationContext,
  eventType: string,
  targetType: string,
  targetId: string,
  before: unknown,
  after: unknown,
): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("audit_events")
    .insert({
      org_id: ctx.orgId,
      actor_type: "api_client",
      actor_id: ctx.clientId,
      event_type: eventType,
      target_type: targetType,
      target_id: targetId,
      before: (before ?? null) as Json,
      after: (after ?? null) as Json,
      correlation_id: ctx.correlationId,
    })
    .select("id")
    .single();
  if (error) throw new IntegrationError(500, `Audit write failed: ${error.message}`);
  return data.id;
}

export function integrationResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function errorResponse(err: unknown): Response {
  if (err instanceof IntegrationError) {
    return integrationResponse({ error: err.message }, err.status);
  }
  console.error("[ServiceConnect] unhandled error", err);
  return integrationResponse({ error: "Internal server error" }, 500);
}
