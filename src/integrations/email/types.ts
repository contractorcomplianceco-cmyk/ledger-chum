/**
 * Shared, client-safe email integration types and validation schemas.
 *
 * SECURITY: This module must never import a mail library (nodemailer, imapflow,
 * pop3, mailparser) or read a secret. It ships to the client bundle. All real
 * network work lives in `*.server.ts` siblings; secrets live only server-side.
 */
import { z } from "zod";

export type InboundProtocol = "imap" | "pop3";

/** Well-known provider presets an admin can start from. "custom" = fill in by hand. */
export type EmailProviderPreset = "zoho" | "gmail" | "custom";

/**
 * Non-secret email configuration as exposed to the client. Passwords are NEVER
 * included here — only booleans indicating whether a secret is on file.
 */
export interface EmailSettingsPublic {
  provider: EmailProviderPreset;
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  fromName: string;
  fromAddress: string;
  hasSmtpPassword: boolean;
  inboundEnabled: boolean;
  inboundProtocol: InboundProtocol;
  inboundHost: string;
  inboundPort: number;
  inboundSecure: boolean;
  inboundUsername: string;
  hasInboundPassword: boolean;
  updatedAt: string | null;
}

/** Full server-side config including secrets. Server-only — never serialize to client. */
export interface EmailConfigResolved extends Omit<
  EmailSettingsPublic,
  "hasSmtpPassword" | "hasInboundPassword" | "updatedAt"
> {
  smtpPassword: string;
  inboundPassword: string;
}

export interface EmailAttachment {
  filename: string;
  /** Base64-encoded content, safe to send across the server-fn boundary. */
  contentBase64: string;
  contentType?: string;
}

export interface SendEmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  /** True when produced by the demo simulator rather than a real SMTP send. */
  simulated: boolean;
}

export interface InboxMessageSummary {
  uid: string;
  from: string;
  subject: string;
  date: string;
  seen: boolean;
  hasAttachments: boolean;
  snippet: string;
}

export interface InboxMessageDetail extends InboxMessageSummary {
  to: string;
  cc?: string;
  text: string;
  html: string | null;
  attachments: { filename: string; contentType: string; size: number }[];
}

// ---------------------------------------------------------------------------
// Validation schemas (shared by server fns and tests)
// ---------------------------------------------------------------------------

const port = z.number().int().min(1).max(65535);
const email = z.string().email();

export const emailAddressSchema = email;

export const sendEmailInputSchema = z
  .object({
    to: z.union([email, z.array(email).min(1)]),
    cc: z.array(email).optional(),
    bcc: z.array(email).optional(),
    subject: z.string().min(1).max(998),
    html: z.string().optional(),
    text: z.string().optional(),
    replyTo: email.optional(),
    attachments: z
      .array(
        z.object({
          filename: z.string().min(1).max(255),
          contentBase64: z.string().min(1),
          contentType: z.string().max(255).optional(),
        }),
      )
      .optional(),
  })
  .refine((v) => !!v.html || !!v.text, {
    message: "Provide at least one of `html` or `text` body",
    path: ["text"],
  });

export type SendEmailInput = z.infer<typeof sendEmailInputSchema>;

/**
 * Validates the persisted, non-secret settings shape. Passwords are validated
 * separately because they are write-only and optional on update.
 */
export const emailSettingsInputSchema = z.object({
  provider: z.enum(["zoho", "gmail", "custom"]).default("custom"),
  smtpEnabled: z.boolean().default(false),
  smtpHost: z.string().max(255).default(""),
  smtpPort: port.default(587),
  smtpSecure: z.boolean().default(false),
  smtpUsername: z.string().max(320).default(""),
  fromName: z.string().max(255).default(""),
  fromAddress: z.union([email, z.literal("")]).default(""),
  inboundEnabled: z.boolean().default(false),
  inboundProtocol: z.enum(["imap", "pop3"]).default("imap"),
  inboundHost: z.string().max(255).default(""),
  inboundPort: port.default(993),
  inboundSecure: z.boolean().default(true),
  inboundUsername: z.string().max(320).default(""),
});

export type EmailSettingsInput = z.infer<typeof emailSettingsInputSchema>;
