// Server-only SMTP send + connection verify via nodemailer. Provider-agnostic:
// every setting comes from the resolved config, nothing is hardwired. Must only
// run on the server — nodemailer relies on node:net/tls. Load with `await
// import(...)` inside a server handler; never import from client code.
import nodemailer from "nodemailer";
import type { EmailConfigResolved, SendEmailInput, SendEmailResult } from "./types";

function buildTransport(cfg: EmailConfigResolved) {
  if (!cfg.smtpHost) throw new Error("SMTP is not configured (missing host)");
  return nodemailer.createTransport({
    host: cfg.smtpHost,
    port: cfg.smtpPort,
    secure: cfg.smtpSecure,
    auth: cfg.smtpUsername ? { user: cfg.smtpUsername, pass: cfg.smtpPassword } : undefined,
  });
}

function fromHeader(cfg: EmailConfigResolved): string {
  const address = cfg.fromAddress || cfg.smtpUsername;
  return cfg.fromName ? `"${cfg.fromName}" <${address}>` : address;
}

/** Verifies the SMTP connection and credentials. Throws with the provider error. */
export async function verifySmtp(cfg: EmailConfigResolved): Promise<{ ok: true }> {
  const transport = buildTransport(cfg);
  await transport.verify();
  return { ok: true };
}

export async function sendMail(
  cfg: EmailConfigResolved,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const transport = buildTransport(cfg);
  const info = await transport.sendMail({
    from: fromHeader(cfg),
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments?.map((a) => ({
      filename: a.filename,
      content: Buffer.from(a.contentBase64, "base64"),
      contentType: a.contentType,
    })),
  });
  return {
    messageId: info.messageId,
    accepted: (info.accepted ?? []).map(String),
    rejected: (info.rejected ?? []).map(String),
    simulated: false,
  };
}
