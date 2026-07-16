import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// SHA-256 hash of a token using WebCrypto (Workers-compatible).
async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(len = 40): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function assertOwner(
  context: { supabase: any; userId: string },
  orgId: string,
): Promise<void> {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user: context.userId,
    _org: orgId,
    _role: "owner",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: owner role required");
}

export const listApiClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("api_clients")
      .select(
        "id, name, provider, description, active, key_prefix, last_used_at, expires_at, revoked_at, created_at",
      )
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const issueApiClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        name: z.string().min(1).max(200),
        provider: z.string().min(1).max(100).default("generic"),
        description: z.string().max(1000).optional(),
        expiresAt: z.string().datetime().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context, data.orgId);

    const raw = randomToken(32);
    const token = `los_${raw}`;
    const keyHash = await sha256Hex(token);
    const keyPrefix = token.slice(0, 10);

    const { data: row, error } = await context.supabase
      .from("api_clients")
      .insert({
        org_id: data.orgId,
        name: data.name,
        provider: data.provider,
        description: data.description ?? null,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        active: true,
        expires_at: data.expiresAt ?? null,
        created_by: context.userId,
      })
      .select("id, name, provider, key_prefix, expires_at, active, created_at")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "api_client.issued",
      action: "created",
      target_type: "api_client",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });

    // Raw token returned exactly once.
    return { ...row, token };
  });

export const rotateApiClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid(), orgId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    await assertOwner(context, data.orgId);

    const raw = randomToken(32);
    const token = `los_${raw}`;
    const keyHash = await sha256Hex(token);
    const keyPrefix = token.slice(0, 10);

    const { data: row, error } = await context.supabase
      .from("api_clients")
      .update({ key_hash: keyHash, key_prefix: keyPrefix, active: true, revoked_at: null })
      .eq("id", data.id)
      .eq("org_id", data.orgId)
      .select("id, name, provider, key_prefix, expires_at, active")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "api_client.rotated",
      action: "updated",
      target_type: "api_client",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });

    return { ...row, token };
  });

export const revokeApiClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid(), orgId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    await assertOwner(context, data.orgId);

    const { data: row, error } = await context.supabase
      .from("api_clients")
      .update({ active: false, revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("org_id", data.orgId)
      .select("id, active, revoked_at")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "api_client.revoked",
      action: "updated",
      target_type: "api_client",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });

    return row;
  });
