// Server-only. Resolves the effective email configuration for an org by
// merging the stored `email_settings` row (read with the service role, scoped
// by org_id) over server-only environment-variable defaults. Includes secrets,
// so this module must never be imported from client code or `*.functions.ts`
// at top level — load it with `await import(...)` inside a server handler.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { EmailConfigResolved } from "./types";

function envInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : fallback;
}

function envBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

/** Environment-variable defaults (system-wide fallback for single-tenant setups). */
function envDefaults(): EmailConfigResolved {
  const e = process.env;
  const inboundProtocol = e.INBOUND_PROTOCOL === "pop3" ? "pop3" : "imap";
  return {
    provider: "custom",
    smtpEnabled: !!e.SMTP_HOST,
    smtpHost: e.SMTP_HOST ?? "",
    smtpPort: envInt(e.SMTP_PORT, 587),
    smtpSecure: envBool(e.SMTP_SECURE, false),
    smtpUsername: e.SMTP_USERNAME ?? "",
    smtpPassword: e.SMTP_PASSWORD ?? "",
    fromName: e.SMTP_FROM_NAME ?? "",
    fromAddress: e.SMTP_FROM_ADDRESS ?? e.SMTP_USERNAME ?? "",
    inboundEnabled: !!e.INBOUND_HOST,
    inboundProtocol,
    inboundHost: e.INBOUND_HOST ?? "",
    inboundPort: envInt(e.INBOUND_PORT, inboundProtocol === "pop3" ? 995 : 993),
    inboundSecure: envBool(e.INBOUND_SECURE, true),
    inboundUsername: e.INBOUND_USERNAME ?? "",
    inboundPassword: e.INBOUND_PASSWORD ?? "",
  };
}

/**
 * Effective config = stored row (if any) layered over env defaults. A stored
 * value wins only when non-empty, so a partially-filled row still inherits
 * env-provided secrets/hosts. Throws only on a real DB error, not a missing row.
 */
export async function resolveEmailConfig(orgId: string): Promise<EmailConfigResolved> {
  const base = envDefaults();

  const { data, error } = await supabaseAdmin
    .from("email_settings")
    .select("*")
    .eq("org_id", orgId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return base;

  const s = (v: string | null | undefined, fallback: string) => (v && v.length ? v : fallback);
  return {
    provider: (data.provider as EmailConfigResolved["provider"]) ?? base.provider,
    smtpEnabled: data.smtp_enabled ?? base.smtpEnabled,
    smtpHost: s(data.smtp_host, base.smtpHost),
    smtpPort: data.smtp_port ?? base.smtpPort,
    smtpSecure: data.smtp_secure ?? base.smtpSecure,
    smtpUsername: s(data.smtp_username, base.smtpUsername),
    smtpPassword: s(data.smtp_password, base.smtpPassword),
    fromName: s(data.from_name, base.fromName),
    fromAddress: s(data.from_address, base.fromAddress),
    inboundEnabled: data.inbound_enabled ?? base.inboundEnabled,
    inboundProtocol:
      (data.inbound_protocol as EmailConfigResolved["inboundProtocol"]) ?? base.inboundProtocol,
    inboundHost: s(data.inbound_host, base.inboundHost),
    inboundPort: data.inbound_port ?? base.inboundPort,
    inboundSecure: data.inbound_secure ?? base.inboundSecure,
    inboundUsername: s(data.inbound_username, base.inboundUsername),
    inboundPassword: s(data.inbound_password, base.inboundPassword),
  };
}
