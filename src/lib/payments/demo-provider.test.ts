import { describe, it, expect } from "vitest";
import { DemoPaymentProvider, demoWebhookSecret } from "./demo-provider";
import type { ChargeRequest } from "./types";

const baseCharge = (over: Partial<ChargeRequest> = {}): ChargeRequest => ({
  amount: 100,
  currency: "USD",
  method: "card",
  token: { token: "demo-nonce-123", method: "card" },
  customer: { id: "c1", name: "Acme" },
  idempotencyKey: "idem-1",
  ...over,
});

describe("DemoPaymentProvider.charge", () => {
  it("succeeds for a card charge", async () => {
    const p = new DemoPaymentProvider();
    const r = await p.charge(baseCharge());
    expect(r.success).toBe(true);
    expect(r.status).toBe("succeeded");
    expect(r.providerTransactionId).toMatch(/^demo_/);
  });

  it("returns pending for ACH (settles async)", async () => {
    const p = new DemoPaymentProvider();
    const r = await p.charge(baseCharge({ method: "ach", token: { token: "ok", method: "ach" } }));
    expect(r.success).toBe(true);
    expect(r.status).toBe("pending");
  });

  it("declines when the token starts with 'decline'", async () => {
    const p = new DemoPaymentProvider();
    const r = await p.charge(baseCharge({ token: { token: "decline-me", method: "card" } }));
    expect(r.success).toBe(false);
    expect(r.status).toBe("failed");
    expect(r.errorCode).toBe("card_declined");
  });

  it("declines when the amount cents are exactly .01", async () => {
    const p = new DemoPaymentProvider();
    const r = await p.charge(baseCharge({ amount: 10.01 }));
    expect(r.success).toBe(false);
  });

  it("rejects a non-positive amount", async () => {
    const p = new DemoPaymentProvider();
    const r = await p.charge(baseCharge({ amount: 0 }));
    expect(r.success).toBe(false);
    expect(r.errorCode).toBe("invalid_amount");
  });

  it("is deterministic for the same idempotency key + token", async () => {
    const p = new DemoPaymentProvider();
    const a = await p.charge(baseCharge());
    const b = await p.charge(baseCharge());
    expect(a.providerTransactionId).toBe(b.providerTransactionId);
  });
});

describe("DemoPaymentProvider.refund", () => {
  it("refunds a prior transaction", async () => {
    const p = new DemoPaymentProvider();
    const r = await p.refund({
      providerTransactionId: "demo_123",
      amount: 50,
      currency: "USD",
      method: "card",
      idempotencyKey: "r1",
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe("refunded");
  });

  it("fails without a transaction id", async () => {
    const p = new DemoPaymentProvider();
    const r = await p.refund({
      providerTransactionId: "",
      amount: 50,
      currency: "USD",
      method: "card",
      idempotencyKey: "r1",
    });
    expect(r.success).toBe(false);
    expect(r.errorCode).toBe("missing_transaction");
  });
});

describe("DemoPaymentProvider.verifyWebhook", () => {
  it("accepts a payload with the shared demo signature", () => {
    const p = new DemoPaymentProvider();
    const body = JSON.stringify({ id: "evt1", type: "payment.updated", status: "succeeded" });
    const evt = p.verifyWebhook(body, { "x-demo-signature": demoWebhookSecret });
    expect(evt).not.toBeNull();
    expect(evt?.status).toBe("succeeded");
  });

  it("rejects a bad signature", () => {
    const p = new DemoPaymentProvider();
    const evt = p.verifyWebhook("{}", { "x-demo-signature": "wrong" });
    expect(evt).toBeNull();
  });

  it("rejects an unparseable body", () => {
    const p = new DemoPaymentProvider();
    const evt = p.verifyWebhook("not-json", { "x-demo-signature": demoWebhookSecret });
    expect(evt).toBeNull();
  });
});

describe("DemoPaymentProvider.publicConfig", () => {
  it("exposes no secrets", () => {
    const cfg = new DemoPaymentProvider().publicConfig();
    expect(cfg.provider).toBe("demo");
    expect(cfg.card).toBe(true);
    expect(cfg.ach).toBe(true);
    expect(JSON.stringify(cfg)).not.toMatch(/secret|key/i);
  });
});
