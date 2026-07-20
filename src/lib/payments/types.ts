/**
 * Processor-agnostic payment abstraction.
 *
 * Every gateway (Authorize.net today; Stripe, Adyen, etc. tomorrow) implements
 * {@link PaymentProvider}. Application code — server functions, the /payments
 * page, invoice collect flow — depends only on this interface, never on a
 * concrete gateway. To add a processor later you implement this interface and
 * register it in `get-provider.server.ts`; nothing else changes.
 *
 * This file is pure types + enums. It imports nothing server-only, so it is
 * safe to reference from client code (e.g. to type a form's method toggle).
 */

/** How the customer is paying. Hosted/tokenized flows only — raw PAN/bank
 * numbers never reach our server. */
export type PaymentMethod = "card" | "ach";

/** Lifecycle of a single charge, normalized across gateways. */
export type PaymentStatus =
  | "pending" // accepted by gateway, not yet settled (common for ACH)
  | "authorized" // funds held, not captured
  | "succeeded" // captured / settled
  | "failed" // hard decline or gateway error
  | "refunded" // fully refunded
  | "partially_refunded"
  | "voided";

/** A tokenized payment instrument produced client-side by the gateway SDK
 * (Accept.js opaque data, a Stripe PaymentMethod id, etc.). The raw token is
 * opaque to us and single-use. */
export interface PaymentToken {
  /** Gateway-scoped opaque token / nonce / descriptor. */
  token: string;
  /** Optional second field some gateways split the token into (Accept.js
   * returns `dataDescriptor` + `dataValue`). */
  descriptor?: string;
  method: PaymentMethod;
}

export interface ChargeCustomer {
  /** Our internal customer id (for correlation / receipts). */
  id: string;
  name?: string;
  email?: string;
}

export interface ChargeRequest {
  amount: number;
  currency: string;
  method: PaymentMethod;
  token: PaymentToken;
  customer: ChargeCustomer;
  /** Invoice this charge settles, when applicable. */
  invoiceRef?: string;
  /** Human-readable description shown on statements / gateway dashboard. */
  description?: string;
  /**
   * Caller-supplied key that makes the charge safe to retry. The provider must
   * not create a second charge for the same key. Mirrors the repo's existing
   * Idempotency-Key convention on public integration routes.
   */
  idempotencyKey: string;
}

export interface RefundRequest {
  /** Provider transaction id returned by the original {@link PaymentResult}. */
  providerTransactionId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reason?: string;
  idempotencyKey: string;
}

export interface PaymentResult {
  /** True only on a captured/authorized/pending success — never on decline. */
  success: boolean;
  status: PaymentStatus;
  /** Gateway transaction id; store this to reconcile webhooks + issue refunds. */
  providerTransactionId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  /** Present when success is false: normalized, user-safe decline/error text. */
  errorCode?: string;
  errorMessage?: string;
  /** Provider-specific extras (auth code, avs result, etc.) for the audit log. */
  raw?: Record<string, unknown>;
}

/** A normalized webhook/notification after signature verification. */
export interface PaymentWebhookEvent {
  /** Gateway's unique event id — used for idempotent processing. */
  id: string;
  type: string;
  providerTransactionId: string | null;
  status: PaymentStatus | null;
  amount: number | null;
  raw: Record<string, unknown>;
}

/**
 * Non-secret configuration the client SDK needs to tokenize a payment in the
 * browser (e.g. Accept.js public client key + API login id). Deliberately
 * contains NO secret keys. Returned to the client by a server function.
 */
export interface PublicPaymentConfig {
  provider: string;
  /** Gateway environment the tokenizer should target. */
  environment: "sandbox" | "production";
  /** Public client key (safe to expose). */
  clientKey?: string;
  /** Public API login id (safe to expose). */
  apiLoginId?: string;
  /** Whether card entry is available. */
  card: boolean;
  /** Whether ACH / eCheck entry is available. */
  ach: boolean;
}

/**
 * The seam every gateway implements. Methods are async and throw only on
 * unexpected/transport errors; expected declines are returned as a
 * {@link PaymentResult} with `success: false` so callers handle them uniformly.
 */
export interface PaymentProvider {
  /** Stable identifier, e.g. "authorize_net" | "demo". */
  readonly name: string;

  /** Charge a tokenized instrument (card or ACH). */
  charge(req: ChargeRequest): Promise<PaymentResult>;

  /** Refund a prior charge, in full or in part. */
  refund(req: RefundRequest): Promise<PaymentResult>;

  /**
   * Verify a raw webhook payload's authenticity (signature/HMAC) and normalize
   * it. Returns null when the signature is invalid — callers MUST treat null as
   * "reject, do not process".
   */
  verifyWebhook(rawBody: string, headers: Record<string, string>): PaymentWebhookEvent | null;

  /** Non-secret config the browser SDK needs to tokenize. */
  publicConfig(): PublicPaymentConfig;
}
