/**
 * LedgerOS Read API — bearer-auth helpers for /api/public/read/v1/*.
 *
 * Reuses public.api_clients (SHA-256 key_hash, scopes[]) for auth.
 * Read endpoints do NOT require Idempotency-Key. Exposed only to internal
 * CCA systems bound via api_clients.consumer_slug.
 */

import { createHash } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ReadScope =
  | "read.metrics"
  | "read.journals"
  | "read.close"
  | "read.intelligence"
  | "read.health";

export interface ReadClient {
  clientId: string;
  orgId: string;
  clientName: string;
  consumerSlug: string | null;
  scopes: string[];
  environment: "sandbox" | "production";
}

export class ReadApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function verifyReadClient(request: Request): Promise<ReadClient> {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) throw new ReadApiError(401, "Missing Bearer token");
  const token = auth.slice(7).trim();
  if (!token) throw new ReadApiError(401, "Empty Bearer token");

  const { data, error } = await supabaseAdmin
    .from("api_clients")
    .select("*")
    .eq("key_hash", hashKey(token))
    .maybeSingle();

  if (error) throw new ReadApiError(500, `Auth lookup failed: ${error.message}`);
  const row = data as {
    id: string;
    org_id: string;
    name: string;
    active: boolean;
    scopes: string[] | null;
    environment: string | null;
    consumer_slug: string | null;
    revoked_at: string | null;
    expires_at: string | null;
  } | null;
  if (!row || !row.active) throw new ReadApiError(401, "Invalid or inactive API key");
  if (row.revoked_at) throw new ReadApiError(401, "API key revoked");
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    throw new ReadApiError(401, "API key expired");
  }

  supabaseAdmin
    .from("api_clients")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id)
    .then(() => {}, () => {});

  return {
    clientId: row.id,
    orgId: row.org_id,
    clientName: row.name,
    consumerSlug: row.consumer_slug,
    scopes: row.scopes ?? [],
    environment: (row.environment ?? "production") as "sandbox" | "production",
  };
}

export function requireReadScope(client: ReadClient, scope: ReadScope): void {
  if (!client.scopes.includes(scope)) {
    throw new ReadApiError(403, `Missing required scope: ${scope}`);
  }
}

export function readResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(
    JSON.stringify({
      contract_version: "v1",
      served_at: new Date().toISOString(),
      ...payload,
    }),
    {
      status,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    },
  );
}

export function readErrorResponse(err: unknown): Response {
  if (err instanceof ReadApiError) {
    return new Response(
      JSON.stringify({ contract_version: "v1", error: err.message }),
      { status: err.status, headers: { "content-type": "application/json" } },
    );
  }
  console.error("[LedgerOS Read API] unhandled", err);
  return new Response(
    JSON.stringify({ contract_version: "v1", error: "Internal server error" }),
    { status: 500, headers: { "content-type": "application/json" } },
  );
}
