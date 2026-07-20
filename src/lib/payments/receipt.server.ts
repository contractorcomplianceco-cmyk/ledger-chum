/**
 * Receipt sending seam.
 *
 * On a successful payment we want to email the customer a receipt. The email
 * provider (see the `email-integration` branch, PR #10, which exposes a
 * provider-agnostic `sendEmail` server fn) is NOT guaranteed to exist in this
 * branch. So receipts go through this thin interface:
 *
 *   - If an email sender has been registered (via {@link registerReceiptSender}),
 *     it is used.
 *   - Otherwise we attempt a best-effort dynamic import of the email module.
 *   - If neither is available, sending is a no-op that logs a TODO and returns
 *     `{ sent: false }`. Payment posting is NEVER blocked by receipt delivery.
 *
 * Once the email branch merges, wire it in one place — either import + register
 * its `sendEmail`, or let the dynamic-import fallback pick it up — and every
 * payment path emits receipts with no further changes.
 *
 * `.server.ts`: never bundled to the client.
 */

export interface ReceiptPayload {
  to: string;
  customerName?: string;
  invoiceRef?: string;
  amount: number;
  currency: string;
  method: string;
  providerTransactionId: string;
  paymentDate: string;
}

export interface ReceiptResult {
  sent: boolean;
  reason?: string;
}

/** The minimal shape a registered email sender must satisfy. */
export type EmailSender = (msg: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => Promise<unknown>;

let registered: EmailSender | null = null;

/** Wire up a concrete email sender (call once at startup after email merges). */
export function registerReceiptSender(sender: EmailSender): void {
  registered = sender;
}

/** Test helper. */
export function clearReceiptSender(): void {
  registered = null;
}

function renderReceipt(p: ReceiptPayload): {
  subject: string;
  text: string;
  html: string;
} {
  const amt = p.amount.toLocaleString("en-US", {
    style: "currency",
    currency: p.currency,
  });
  const ref = p.invoiceRef ? ` for invoice ${p.invoiceRef}` : "";
  const subject = `Payment receipt${p.invoiceRef ? ` — ${p.invoiceRef}` : ""}`;
  const text =
    `Hi ${p.customerName ?? "there"},\n\n` +
    `We received your ${p.method.toUpperCase()} payment of ${amt}${ref} on ${p.paymentDate}.\n` +
    `Transaction reference: ${p.providerTransactionId}\n\n` +
    `Thank you.`;
  const html = `<p>Hi ${p.customerName ?? "there"},</p><p>We received your ${p.method.toUpperCase()} payment of <strong>${amt}</strong>${ref} on ${p.paymentDate}.</p><p>Transaction reference: <code>${p.providerTransactionId}</code></p><p>Thank you.</p>`;
  return { subject, text, html };
}

/**
 * Attempt to resolve an email sender: registered first, then a best-effort
 * dynamic import of the (possibly absent) email module. Returns null if none.
 */
async function resolveSender(): Promise<EmailSender | null> {
  if (registered) return registered;
  try {
    // The email branch is expected to expose `sendEmail` at this path. The
    // specifier is built at runtime so the bundler/type-checker does not try to
    // resolve a module that may not exist in this branch — an absent module
    // simply yields the no-op path.
    const spec = ["@/integrations", "email", "send.server"].join("/");
    const mod = (await import(/* @vite-ignore */ spec).catch(() => null)) as {
      sendEmail?: EmailSender;
    } | null;
    if (mod?.sendEmail) return mod.sendEmail;
  } catch {
    /* module not present in this branch */
  }
  return null;
}

export async function sendPaymentReceipt(payload: ReceiptPayload): Promise<ReceiptResult> {
  if (!payload.to) return { sent: false, reason: "no_recipient" };
  const sender = await resolveSender();
  if (!sender) {
    // TODO(email): wire the email module's sendEmail via registerReceiptSender
    // once the email-integration branch merges. Until then this is a no-op.
    console.info(
      "[receipt] email sender unavailable — skipping receipt for",
      payload.providerTransactionId,
    );
    return { sent: false, reason: "email_unavailable" };
  }
  const { subject, text, html } = renderReceipt(payload);
  try {
    await sender({ to: payload.to, subject, text, html });
    return { sent: true };
  } catch (err) {
    console.error("[receipt] send failed", err);
    return { sent: false, reason: "send_failed" };
  }
}
