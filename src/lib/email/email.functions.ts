// Typed server functions for the provider-agnostic email integration.
//
// SECURITY: this module ships to the client bundle, so it must NEVER import a
// mail library or a secret at the top level. Real SMTP/IMAP/POP work and the
// service-role config resolver are loaded with `await import("...server")`
// inside the production branch only. Passwords are write-only and never
// returned to the client.
//
// DATA MODE: `isDemoMode()` selects a network-free simulator; production uses
// the org's stored config (falling back to server-only env vars).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { isDemoMode } from "@/lib/app-mode";
import {
  DEMO_EMAIL_SETTINGS,
  simulateFetchMessage,
  simulateListInbox,
  simulateSend,
} from "@/integrations/email/demo";
import {
  emailSettingsInputSchema,
  sendEmailInputSchema,
  type EmailSettingsPublic,
  type SendEmailInput,
} from "@/integrations/email/types";

const orgId = z.string().uuid();

/** Guards service-role code paths: the caller must be a member of the org. */
async function assertOrgMember(
  context: { supabase: SupabaseClient<Database> },
  org: string,
): Promise<void> {
  const { data, error } = await context.supabase.rpc("is_org_member", { _org: org });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: not a member of this organization");
}

function rowToPublic(row: Record<string, unknown> | null): EmailSettingsPublic {
  const r = row ?? {};
  const str = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");
  const bool = (k: string, d = false) => (typeof r[k] === "boolean" ? (r[k] as boolean) : d);
  const num = (k: string, d: number) => (typeof r[k] === "number" ? (r[k] as number) : d);
  return {
    provider: (str("provider") || "custom") as EmailSettingsPublic["provider"],
    smtpEnabled: bool("smtp_enabled"),
    smtpHost: str("smtp_host"),
    smtpPort: num("smtp_port", 587),
    smtpSecure: bool("smtp_secure"),
    smtpUsername: str("smtp_username"),
    fromName: str("from_name"),
    fromAddress: str("from_address"),
    hasSmtpPassword: !!str("smtp_password"),
    inboundEnabled: bool("inbound_enabled"),
    inboundProtocol: (str("inbound_protocol") || "imap") as EmailSettingsPublic["inboundProtocol"],
    inboundHost: str("inbound_host"),
    inboundPort: num("inbound_port", 993),
    inboundSecure: bool("inbound_secure", true),
    inboundUsername: str("inbound_username"),
    hasInboundPassword: !!str("inbound_password"),
    updatedAt: typeof r["updated_at"] === "string" ? (r["updated_at"] as string) : null,
  };
}

export const getEmailSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId }).parse(v))
  .handler(async ({ data, context }): Promise<EmailSettingsPublic> => {
    if (isDemoMode()) return DEMO_EMAIL_SETTINGS;
    const { data: row, error } = await context.supabase
      .from("email_settings")
      .select("*")
      .eq("org_id", data.orgId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return rowToPublic(row as Record<string, unknown> | null);
  });

export const upsertEmailSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    emailSettingsInputSchema
      .extend({
        orgId,
        // Write-only secrets: only applied when a non-empty value is supplied.
        smtpPassword: z.string().optional(),
        inboundPassword: z.string().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }): Promise<EmailSettingsPublic> => {
    if (isDemoMode()) {
      return {
        ...DEMO_EMAIL_SETTINGS,
        provider: data.provider,
        smtpEnabled: data.smtpEnabled,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpSecure: data.smtpSecure,
        smtpUsername: data.smtpUsername,
        fromName: data.fromName,
        fromAddress: data.fromAddress,
        inboundEnabled: data.inboundEnabled,
        inboundProtocol: data.inboundProtocol,
        inboundHost: data.inboundHost,
        inboundPort: data.inboundPort,
        inboundSecure: data.inboundSecure,
        inboundUsername: data.inboundUsername,
      };
    }

    const patch: Database["public"]["Tables"]["email_settings"]["Insert"] = {
      org_id: data.orgId,
      provider: data.provider,
      smtp_enabled: data.smtpEnabled,
      smtp_host: data.smtpHost,
      smtp_port: data.smtpPort,
      smtp_secure: data.smtpSecure,
      smtp_username: data.smtpUsername,
      from_name: data.fromName,
      from_address: data.fromAddress,
      inbound_enabled: data.inboundEnabled,
      inbound_protocol: data.inboundProtocol,
      inbound_host: data.inboundHost,
      inbound_port: data.inboundPort,
      inbound_secure: data.inboundSecure,
      inbound_username: data.inboundUsername,
    };
    if (data.smtpPassword) patch.smtp_password = data.smtpPassword;
    if (data.inboundPassword) patch.inbound_password = data.inboundPassword;

    const { data: row, error } = await context.supabase
      .from("email_settings")
      .upsert(patch, { onConflict: "org_id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "email_settings.updated",
      action: "updated",
      target_type: "email_settings",
      target_id: (row as { id: string }).id,
      source: "ledgeros.ui",
    });

    return rowToPublic(row as Record<string, unknown>);
  });

export const testEmailConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId, target: z.enum(["smtp", "inbound"]).default("smtp") }).parse(v),
  )
  .handler(async ({ data, context }) => {
    if (isDemoMode()) {
      return { ok: true as const, simulated: true, latencyMs: 120, target: data.target };
    }
    await assertOrgMember(context, data.orgId);
    const started = Date.now();
    const { resolveEmailConfig } = await import("@/integrations/email/resolve.server");
    const cfg = await resolveEmailConfig(data.orgId);
    if (data.target === "smtp") {
      const { verifySmtp } = await import("@/integrations/email/mailer.server");
      await verifySmtp(cfg);
    } else {
      const { verifyInbound } = await import("@/integrations/email/inbox.server");
      await verifyInbound(cfg);
    }
    return {
      ok: true as const,
      simulated: false,
      latencyMs: Date.now() - started,
      target: data.target,
    };
  });

async function doSend(orgIdValue: string, input: SendEmailInput) {
  if (isDemoMode()) return simulateSend(input);
  const { resolveEmailConfig } = await import("@/integrations/email/resolve.server");
  const cfg = await resolveEmailConfig(orgIdValue);
  if (!cfg.smtpEnabled || !cfg.smtpHost) {
    throw new Error("SMTP is not enabled or configured for this organization");
  }
  const { sendMail } = await import("@/integrations/email/mailer.server");
  return sendMail(cfg, input);
}

/**
 * Reusable send API. Later phases (e.g. invoice "Remind" / send-invoice) call
 * this with a rendered body and optional PDF attachment.
 */
export const sendEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => sendEmailInputSchema.and(z.object({ orgId })).parse(v))
  .handler(async ({ data, context }) => {
    const { orgId: org, ...input } = data;
    if (!isDemoMode()) await assertOrgMember(context, org);
    return doSend(org, input as SendEmailInput);
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId, to: z.string().email() }).parse(v))
  .handler(async ({ data, context }) => {
    if (!isDemoMode()) await assertOrgMember(context, data.orgId);
    return doSend(data.orgId, {
      to: data.to,
      subject: "LedgerOS test email",
      text: "This is a test email from LedgerOS confirming your SMTP configuration works.",
      html: "<p>This is a test email from <strong>LedgerOS</strong> confirming your SMTP configuration works.</p>",
    });
  });

export const listInboxMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId,
        mailbox: z.string().min(1).max(255).default("INBOX"),
        limit: z.number().int().min(1).max(100).default(25),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    if (isDemoMode()) return simulateListInbox(data.limit);
    await assertOrgMember(context, data.orgId);
    const { resolveEmailConfig } = await import("@/integrations/email/resolve.server");
    const cfg = await resolveEmailConfig(data.orgId);
    if (!cfg.inboundEnabled || !cfg.inboundHost) {
      throw new Error("Inbound mail is not enabled or configured for this organization");
    }
    const { listInbox } = await import("@/integrations/email/inbox.server");
    return listInbox(cfg, data.mailbox, data.limit);
  });

export const fetchInboxMessage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId,
        mailbox: z.string().min(1).max(255).default("INBOX"),
        uid: z.string().min(1).max(128),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    if (isDemoMode()) return simulateFetchMessage(data.uid);
    await assertOrgMember(context, data.orgId);
    const { resolveEmailConfig } = await import("@/integrations/email/resolve.server");
    const cfg = await resolveEmailConfig(data.orgId);
    const { fetchInboxMessage: fetchOne } = await import("@/integrations/email/inbox.server");
    return fetchOne(cfg, data.mailbox, data.uid);
  });
