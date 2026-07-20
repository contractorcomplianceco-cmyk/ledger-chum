/**
 * Authorize.net implementation of {@link PaymentProvider}.
 *
 * Uses the Accept.js / Accept Hosted *tokenized* flow: the browser exchanges
 * raw card / bank data for an opaque `dataDescriptor` + `dataValue` nonce
 * directly with Authorize.net, and only that nonce reaches our server. Raw PAN
 * / routing+account numbers never touch this codebase — this is the
 * PCI-friendly path (SAQ A / A-EP).
 *
 * All secrets (transaction key, signature key) are read from server-only env
 * vars and never serialized to the client. Only {@link publicConfig} — the API
 * login id + public client key — is exposed to the browser tokenizer.
 *
 * `.server.ts` so it can never be pulled into the client bundle.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  ChargeRequest,
  PaymentProvider,
  PaymentResult,
  PaymentStatus,
  PaymentWebhookEvent,
  PublicPaymentConfig,
  RefundRequest,
} from "./types";

interface AuthorizeNetConfig {
  apiLoginId: string;
  transactionKey: string;
  clientKey: string;
  signatureKey: string;
  environment: "sandbox" | "production";
}

const ENDPOINTS = {
  sandbox: "https://apitest.authorize.net/xml/v1/request.api",
  production: "https://api.authorize.net/xml/v1/request.api",
} as const;

/** Read + validate config from env. Throws only when actually used, so the app
 * boots in demo mode without Authorize.net secrets present. */
export function loadAuthorizeNetConfig(): AuthorizeNetConfig {
  const apiLoginId = process.env.AUTHORIZENET_API_LOGIN_ID ?? "";
  const transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY ?? "";
  const clientKey = process.env.AUTHORIZENET_CLIENT_KEY ?? "";
  const signatureKey = process.env.AUTHORIZENET_SIGNATURE_KEY ?? "";
  const environment =
    (process.env.AUTHORIZENET_ENV ?? "sandbox") === "production" ? "production" : "sandbox";

  const missing: string[] = [];
  if (!apiLoginId) missing.push("AUTHORIZENET_API_LOGIN_ID");
  if (!transactionKey) missing.push("AUTHORIZENET_TRANSACTION_KEY");
  if (missing.length) {
    throw new Error(`Authorize.net not configured. Missing: ${missing.join(", ")}`);
  }
  return { apiLoginId, transactionKey, clientKey, signatureKey, environment };
}

/**
 * Verify an Authorize.net webhook signature. Authorize.net signs the raw body
 * with HMAC-SHA512 keyed by the Signature Key and sends it in the
 * `X-ANET-Signature` header as `sha512=<HEX>`. Pure + exported for tests.
 */
export function verifyAuthorizeNetSignature(
  rawBody: string,
  signatureHeader: string | undefined | null,
  signatureKey: string,
): boolean {
  if (!signatureHeader || !signatureKey) return false;
  const provided = signatureHeader
    .replace(/^sha512=/i, "")
    .trim()
    .toLowerCase();
  if (!provided) return false;
  const expected = createHmac("sha512", signatureKey)
    .update(rawBody, "utf8")
    .digest("hex")
    .toLowerCase();
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Map an Authorize.net responseCode to our normalized status. */
function statusFromResponseCode(code: string, method: string): PaymentStatus {
  // 1 = approved, 4 = held for review (treat as pending). ACH is never instantly
  // settled, so an approved eCheck is "pending" until the settlement webhook.
  if (code === "1") return method === "ach" ? "pending" : "succeeded";
  if (code === "4") return "pending";
  return "failed";
}

/** Normalize an Authorize.net webhook `eventType` to our status vocabulary. */
function statusFromEventType(eventType: string): PaymentStatus | null {
  if (eventType.includes("refund")) return "refunded";
  if (eventType.includes("void")) return "voided";
  if (eventType.includes("capture") || eventType.includes("authcapture")) return "succeeded";
  if (eventType.includes("settled")) return "succeeded";
  if (eventType.includes("held") || eventType.includes("fraud")) return "pending";
  if (eventType.includes("declined") || eventType.includes("void")) return "failed";
  return null;
}

interface AnetTransactionResponse {
  transactionResponse?: {
    responseCode?: string;
    transId?: string;
    authCode?: string;
    avsResultCode?: string;
    errors?: Array<{ errorCode?: string; errorText?: string }>;
    messages?: Array<{ code?: string; description?: string }>;
  };
  messages?: {
    resultCode?: string;
    message?: Array<{ code?: string; text?: string }>;
  };
}

export class AuthorizeNetProvider implements PaymentProvider {
  readonly name = "authorize_net";
  private config: AuthorizeNetConfig | null = null;

  private cfg(): AuthorizeNetConfig {
    if (!this.config) this.config = loadAuthorizeNetConfig();
    return this.config;
  }

  private async post(payload: unknown): Promise<AnetTransactionResponse> {
    const cfg = this.cfg();
    const res = await fetch(ENDPOINTS[cfg.environment], {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Authorize.net HTTP ${res.status}`);
    }
    // Authorize.net returns JSON with a BOM prefix that breaks JSON.parse.
    const text = (await res.text()).replace(/^\uFEFF/, "");
    return JSON.parse(text) as AnetTransactionResponse;
  }

  async charge(req: ChargeRequest): Promise<PaymentResult> {
    const cfg = this.cfg();
    const payment =
      req.method === "ach"
        ? {
            // For eCheck the opaque data still carries the tokenized bank info.
            opaqueData: {
              dataDescriptor: req.token.descriptor ?? "COMMON.ACCEPT.INAPP.PAYMENT",
              dataValue: req.token.token,
            },
          }
        : {
            opaqueData: {
              dataDescriptor: req.token.descriptor ?? "COMMON.ACCEPT.INAPP.PAYMENT",
              dataValue: req.token.token,
            },
          };

    const body = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: cfg.apiLoginId,
          transactionKey: cfg.transactionKey,
        },
        // Authorize.net dedupes on refId within a short window; we also enforce
        // idempotency in our own DB layer.
        refId: req.idempotencyKey.slice(0, 20),
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: req.amount.toFixed(2),
          payment,
          customer: req.customer.email
            ? { email: req.customer.email, id: req.customer.id }
            : { id: req.customer.id },
          order: req.invoiceRef
            ? { invoiceNumber: req.invoiceRef.slice(0, 20), description: req.description }
            : undefined,
        },
      },
    };

    let resp: AnetTransactionResponse;
    try {
      resp = await this.post(body);
    } catch (err) {
      return {
        success: false,
        status: "failed",
        providerTransactionId: "",
        amount: req.amount,
        currency: req.currency,
        method: req.method,
        errorCode: "gateway_error",
        errorMessage: err instanceof Error ? err.message : "Gateway error",
      };
    }

    const tr = resp.transactionResponse;
    const code = tr?.responseCode ?? "";
    const status = statusFromResponseCode(code, req.method);
    const ok = status === "succeeded" || status === "pending";

    if (!ok || !tr?.transId) {
      const err = tr?.errors?.[0] ?? {};
      return {
        success: false,
        status: "failed",
        providerTransactionId: tr?.transId ?? "",
        amount: req.amount,
        currency: req.currency,
        method: req.method,
        errorCode: err.errorCode ?? resp.messages?.message?.[0]?.code ?? "declined",
        errorMessage:
          err.errorText ?? resp.messages?.message?.[0]?.text ?? "The payment was declined.",
        raw: resp as unknown as Record<string, unknown>,
      };
    }

    return {
      success: true,
      status,
      providerTransactionId: tr.transId,
      amount: req.amount,
      currency: req.currency,
      method: req.method,
      raw: {
        authCode: tr.authCode,
        avsResultCode: tr.avsResultCode,
      },
    };
  }

  async refund(req: RefundRequest): Promise<PaymentResult> {
    const cfg = this.cfg();
    const body = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: cfg.apiLoginId,
          transactionKey: cfg.transactionKey,
        },
        refId: req.idempotencyKey.slice(0, 20),
        transactionRequest: {
          transactionType: "refundTransaction",
          amount: req.amount.toFixed(2),
          refTransId: req.providerTransactionId,
        },
      },
    };

    let resp: AnetTransactionResponse;
    try {
      resp = await this.post(body);
    } catch (err) {
      return {
        success: false,
        status: "failed",
        providerTransactionId: req.providerTransactionId,
        amount: req.amount,
        currency: req.currency,
        method: req.method,
        errorCode: "gateway_error",
        errorMessage: err instanceof Error ? err.message : "Gateway error",
      };
    }

    const tr = resp.transactionResponse;
    if ((tr?.responseCode ?? "") !== "1") {
      const err = tr?.errors?.[0] ?? {};
      return {
        success: false,
        status: "failed",
        providerTransactionId: req.providerTransactionId,
        amount: req.amount,
        currency: req.currency,
        method: req.method,
        errorCode: err.errorCode ?? "refund_failed",
        errorMessage: err.errorText ?? "Refund was not accepted.",
        raw: resp as unknown as Record<string, unknown>,
      };
    }

    return {
      success: true,
      status: "refunded",
      providerTransactionId: tr?.transId ?? req.providerTransactionId,
      amount: req.amount,
      currency: req.currency,
      method: req.method,
    };
  }

  verifyWebhook(rawBody: string, headers: Record<string, string>): PaymentWebhookEvent | null {
    const cfg = this.cfg();
    const header = headers["x-anet-signature"] ?? headers["X-ANET-Signature"] ?? null;
    if (!verifyAuthorizeNetSignature(rawBody, header, cfg.signatureKey)) {
      return null;
    }

    let parsed: {
      notificationId?: string;
      eventType?: string;
      payload?: { id?: string; responseCode?: number; authAmount?: number };
    };
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return null;
    }

    const eventType = (parsed.eventType ?? "").toLowerCase();
    return {
      id: parsed.notificationId ?? "",
      type: parsed.eventType ?? "unknown",
      providerTransactionId: parsed.payload?.id ? String(parsed.payload.id) : null,
      status: statusFromEventType(eventType),
      amount: typeof parsed.payload?.authAmount === "number" ? parsed.payload.authAmount : null,
      raw: parsed as Record<string, unknown>,
    };
  }

  publicConfig(): PublicPaymentConfig {
    const cfg = this.cfg();
    return {
      provider: this.name,
      environment: cfg.environment,
      clientKey: cfg.clientKey,
      apiLoginId: cfg.apiLoginId,
      card: true,
      ach: true,
    };
  }
}
