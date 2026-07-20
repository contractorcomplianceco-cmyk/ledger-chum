/**
 * Client-safe email configuration helpers: provider presets and validation
 * used by both the settings UI and server functions. No secrets, no mail libs.
 */
import type { EmailProviderPreset, EmailSettingsInput, InboundProtocol } from "./types";

export interface ProviderPreset {
  label: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  inboundProtocol: InboundProtocol;
  inboundHost: string;
  inboundPort: number;
  inboundSecure: boolean;
  /** Guidance shown in the UI (e.g. app-password requirements). */
  note?: string;
}

/**
 * Provider-agnostic by design: these are convenience starting points only. An
 * admin can pick "custom" and enter any host/port. Nothing here is hardwired
 * into the send/fetch path — the persisted config is always authoritative.
 */
export const PROVIDER_PRESETS: Record<EmailProviderPreset, ProviderPreset> = {
  zoho: {
    label: "Zoho Mail",
    smtpHost: "smtp.zoho.com",
    smtpPort: 465,
    smtpSecure: true,
    inboundProtocol: "imap",
    inboundHost: "imap.zoho.com",
    inboundPort: 993,
    inboundSecure: true,
    note: "Use an app-specific password if two-factor auth is enabled on the mailbox.",
  },
  gmail: {
    label: "Gmail / Google Workspace",
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpSecure: true,
    inboundProtocol: "imap",
    inboundHost: "imap.gmail.com",
    inboundPort: 993,
    inboundSecure: true,
    note: "Requires an app password; IMAP access must be enabled in the mailbox settings.",
  },
  custom: {
    label: "Custom / other SMTP host",
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    inboundProtocol: "imap",
    inboundHost: "",
    inboundPort: 993,
    inboundSecure: true,
    note: "Enter the host, port and TLS settings supplied by your mail provider.",
  },
};

/** Applies a preset's host/port/TLS defaults over the current form values. */
export function applyPreset(
  provider: EmailProviderPreset,
  current: EmailSettingsInput,
): EmailSettingsInput {
  const p = PROVIDER_PRESETS[provider];
  return {
    ...current,
    provider,
    smtpHost: p.smtpHost || current.smtpHost,
    smtpPort: p.smtpPort,
    smtpSecure: p.smtpSecure,
    inboundProtocol: p.inboundProtocol,
    inboundHost: p.inboundHost || current.inboundHost,
    inboundPort: p.inboundPort,
    inboundSecure: p.inboundSecure,
  };
}

/** Masks a secret for display, never revealing its value. */
export function maskSecret(hasSecret: boolean): string {
  return hasSecret ? "••••••••" : "";
}

/**
 * Validates that a config has the minimum fields needed to actually send mail.
 * Returns a list of human-readable problems (empty = ready).
 */
export function smtpReadinessErrors(cfg: {
  smtpEnabled: boolean;
  smtpHost: string;
  smtpUsername: string;
  fromAddress: string;
  hasSmtpPassword: boolean;
}): string[] {
  if (!cfg.smtpEnabled) return [];
  const errs: string[] = [];
  if (!cfg.smtpHost) errs.push("SMTP host is required");
  if (!cfg.smtpUsername) errs.push("SMTP username is required");
  if (!cfg.hasSmtpPassword) errs.push("SMTP password is required");
  if (!cfg.fromAddress) errs.push("From address is required");
  return errs;
}

export function inboundReadinessErrors(cfg: {
  inboundEnabled: boolean;
  inboundHost: string;
  inboundUsername: string;
  hasInboundPassword: boolean;
}): string[] {
  if (!cfg.inboundEnabled) return [];
  const errs: string[] = [];
  if (!cfg.inboundHost) errs.push("Inbound host is required");
  if (!cfg.inboundUsername) errs.push("Inbound username is required");
  if (!cfg.hasInboundPassword) errs.push("Inbound password is required");
  return errs;
}
