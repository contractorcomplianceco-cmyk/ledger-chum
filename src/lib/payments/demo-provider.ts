/**
 * DemoPaymentProvider — a fully offline gateway used in demo mode and tests.
 *
 * Deterministic: the outcome is derived from the token string so tests and the
 * Design Lab behave predictably with no network, no secrets, no SDK.
 *
 *   token starting "decline" / amount ending in .01  -> decline
 *   method === "ach"                                  -> pending (settles async)
 *   otherwise                                         -> succeeded
 *
 * Webhook verification accepts a shared demo secret so the async-settlement
 * path can be exercised end to end.
 */

import type {
  ChargeRequest,
  PaymentProvider,
  PaymentResult,
  PaymentWebhookEvent,
  PublicPaymentConfig,
  RefundRequest,
} from "./types";

const DEMO_WEBHOOK_SECRET = "demo-webhook-secret";

function pseudoTxnId(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return `demo_${Math.abs(h)}`;
}

function isDecline(req: ChargeRequest): boolean {
  const t = req.token.token.toLowerCase();
  if (t.startsWith("decline") || t.includes("fail")) return true;
  // Convention: any amount whose cents are exactly .01 simulates a decline.
  return Math.round((req.amount % 1) * 100) === 1;
}

export class DemoPaymentProvider implements PaymentProvider {
  readonly name = "demo";

  async charge(req: ChargeRequest): Promise<PaymentResult> {
    if (req.amount <= 0) {
      return {
        success: false,
        status: "failed",
        providerTransactionId: "",
        amount: req.amount,
        currency: req.currency,
        method: req.method,
        errorCode: "invalid_amount",
        errorMessage: "Amount must be greater than zero.",
      };
    }

    if (isDecline(req)) {
      return {
        success: false,
        status: "failed",
        providerTransactionId: "",
        amount: req.amount,
        currency: req.currency,
        method: req.method,
        errorCode: "card_declined",
        errorMessage: "The payment was declined (simulated).",
        raw: { simulated: true, idempotencyKey: req.idempotencyKey },
      };
    }

    // ACH clears asynchronously — mirror the real world by returning pending.
    const status = req.method === "ach" ? "pending" : "succeeded";
    return {
      success: true,
      status,
      providerTransactionId: pseudoTxnId(req.idempotencyKey + req.token.token),
      amount: req.amount,
      currency: req.currency,
      method: req.method,
      raw: { simulated: true, idempotencyKey: req.idempotencyKey },
    };
  }

  async refund(req: RefundRequest): Promise<PaymentResult> {
    if (!req.providerTransactionId) {
      return {
        success: false,
        status: "failed",
        providerTransactionId: "",
        amount: req.amount,
        currency: req.currency,
        method: req.method,
        errorCode: "missing_transaction",
        errorMessage: "A provider transaction id is required to refund.",
      };
    }
    return {
      success: true,
      status: "refunded",
      providerTransactionId: req.providerTransactionId,
      amount: req.amount,
      currency: req.currency,
      method: req.method,
      raw: { simulated: true, refunded: true },
    };
  }

  verifyWebhook(rawBody: string, headers: Record<string, string>): PaymentWebhookEvent | null {
    const sig = headers["x-demo-signature"] ?? headers["X-Demo-Signature"];
    if (sig !== DEMO_WEBHOOK_SECRET) return null;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return null;
    }
    return {
      id: String(parsed.id ?? pseudoTxnId(rawBody)),
      type: String(parsed.type ?? "payment.updated"),
      providerTransactionId: parsed.providerTransactionId
        ? String(parsed.providerTransactionId)
        : null,
      status: (parsed.status as PaymentWebhookEvent["status"]) ?? null,
      amount: typeof parsed.amount === "number" ? parsed.amount : null,
      raw: parsed,
    };
  }

  publicConfig(): PublicPaymentConfig {
    return {
      provider: this.name,
      environment: "sandbox",
      card: true,
      ach: true,
    };
  }
}

export const demoWebhookSecret = DEMO_WEBHOOK_SECRET;
