import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SystemConsumer = {
  id: string;
  slug: string;
  name: string;
  category: string;
  purpose: string;
  homepage: string | null;
  contract_version: string;
  default_scopes: string[];
  status: string;
  notes: string | null;
};

export type ConsumerClient = {
  id: string;
  name: string;
  consumer_slug: string | null;
  scopes: string[] | null;
  environment: string | null;
  active: boolean;
  key_prefix: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type IssuedClient = ConsumerClient & { token: string };

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

export const listSystemConsumers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SystemConsumer[]> => {
    const { data, error } = await context.supabase
      .from("system_consumers" as never)
      .select("id, slug, name, category, purpose, homepage, contract_version, default_scopes, status, notes")
      .order("name");
    if (error) throw new Error((error as { message: string }).message);
    return (data ?? []) as unknown as SystemConsumer[];
  });

export const listConsumerClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }): Promise<ConsumerClient[]> => {
    const { data: rows, error } = await context.supabase
      .from("api_clients")
      .select("id, name, consumer_slug, scopes, environment, active, key_prefix, last_used_at, expires_at, revoked_at, created_at")
      .eq("org_id", data.orgId)
      .not("consumer_slug", "is", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as ConsumerClient[];
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
  .handler(async ({ data, context }): Promise<IssuedClient> => {
    const { data: ok, error: rErr } = await context.supabase.rpc("has_role", {
      _user: context.userId, _org: data.orgId, _role: "owner",
    });
    if (rErr) throw new Error(rErr.message);
    if (!ok) throw new Error("Forbidden: owner role required");

    const raw = randomToken(32);
    const token = `los_${raw}`;
    const keyHash = await sha256Hex(token);
    const keyPrefix = token.slice(0, 10);

    const { data: row, error } = await context.supabase
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
      } as never)
      .select("id, name, consumer_slug, scopes, environment, active, key_prefix, last_used_at, expires_at, revoked_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { ...(row as unknown as ConsumerClient), token };
  });
