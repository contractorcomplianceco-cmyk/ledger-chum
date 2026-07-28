import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function randomToken(len = 32): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function assertOwner(context: { supabase: unknown; userId: string }, orgId: string) {
  const sb = context.supabase as { rpc: (n: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> };
  const { data, error } = await sb.rpc("has_role", { _user: context.userId, _org: orgId, _role: "owner" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: owner role required");
}

export const listSystemConsumers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => { order: (c: string) => Promise<{ data: unknown[] | null; error: { message: string } | null }> };
      };
    };
    const { data, error } = await sb
      .from("system_consumers")
      .select("id, slug, name, category, purpose, homepage, contract_version, default_scopes, status, notes")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listConsumerClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (k: string, v: string) => {
            not: (k: string, o: string, v: unknown) => { order: (c: string, o?: unknown) => Promise<{ data: unknown[] | null; error: { message: string } | null }> };
          };
        };
      };
    };
    const { data: rows, error } = await sb
      .from("api_clients")
      .select("id, name, consumer_slug, scopes, environment, active, key_prefix, last_used_at, expires_at, revoked_at, created_at")
      .eq("org_id", data.orgId)
      .not("consumer_slug", "is", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const issueConsumerClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      consumerSlug: z.string().min(1),
      name: z.string().min(1).max(200),
      scopes: z.array(z.string()).min(1),
      environment: z.enum(["sandbox", "production"]).default("production"),
      expiresAt: z.string().datetime().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context, data.orgId);

    const sb = context.supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: { slug: string } | null; error: { message: string } | null }> };
        };
        insert: (row: unknown) => {
          select: (c: string) => { single: () => Promise<{ data: unknown; error: { message: string } | null }> };
        };
      };
    };

    const { data: consumer, error: cErr } = await sb
      .from("system_consumers")
      .select("slug")
      .eq("slug", data.consumerSlug)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!consumer) throw new Error(`Unknown consumer: ${data.consumerSlug}`);

    const raw = randomToken(32);
    const token = `los_${raw}`;
    const keyHash = await sha256Hex(token);
    const keyPrefix = token.slice(0, 10);

    const { data: row, error } = await sb
      .from("api_clients")
      .insert({
        org_id: data.orgId,
        name: data.name,
        provider: data.consumerSlug,
        consumer_slug: data.consumerSlug,
        description: `Read-API client for ${data.consumerSlug}`,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes: data.scopes,
        environment: data.environment,
        active: true,
        expires_at: data.expiresAt ?? null,
        created_by: context.userId,
      })
      .select("id, name, consumer_slug, scopes, environment, key_prefix, expires_at, active, created_at")
      .single();
    if (error) throw new Error(error.message);

    return { ...(row as Record<string, unknown>), token };
  });
