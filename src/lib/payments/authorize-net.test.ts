import { describe, it, expect, beforeEach } from "vitest";
import { createHmac } from "node:crypto";
import {
  verifyAuthorizeNetSignature,
  loadAuthorizeNetConfig,
  AuthorizeNetProvider,
} from "./authorize-net.server";

const KEY = "test-signature-key";
const sign = (body: string) => createHmac("sha512", KEY).update(body, "utf8").digest("hex");

describe("verifyAuthorizeNetSignature", () => {
  it("accepts a valid sha512= signature (case-insensitive)", () => {
    const body = JSON.stringify({
      notificationId: "n1",
      eventType: "net.authorize.payment.authcapture.created",
    });
    const header = `sha512=${sign(body).toUpperCase()}`;
    expect(verifyAuthorizeNetSignature(body, header, KEY)).toBe(true);
  });

  it("accepts a bare hex signature without the prefix", () => {
    const body = "raw";
    expect(verifyAuthorizeNetSignature(body, sign(body), KEY)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const body = "raw";
    const header = `sha512=${sign(body)}`;
    expect(verifyAuthorizeNetSignature("raw-tampered", header, KEY)).toBe(false);
  });

  it("rejects a wrong key", () => {
    const body = "raw";
    expect(verifyAuthorizeNetSignature(body, sign(body), "other-key")).toBe(false);
  });

  it("rejects a missing header or key", () => {
    expect(verifyAuthorizeNetSignature("raw", undefined, KEY)).toBe(false);
    expect(verifyAuthorizeNetSignature("raw", "sha512=abc", "")).toBe(false);
  });
});

describe("loadAuthorizeNetConfig", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    process.env = { ...saved };
    delete process.env.AUTHORIZENET_API_LOGIN_ID;
    delete process.env.AUTHORIZENET_TRANSACTION_KEY;
  });

  it("throws listing the missing secrets", () => {
    expect(() => loadAuthorizeNetConfig()).toThrow(/AUTHORIZENET_API_LOGIN_ID/);
  });

  it("loads and defaults to sandbox", () => {
    process.env.AUTHORIZENET_API_LOGIN_ID = "login";
    process.env.AUTHORIZENET_TRANSACTION_KEY = "txn";
    const cfg = loadAuthorizeNetConfig();
    expect(cfg.environment).toBe("sandbox");
    expect(cfg.apiLoginId).toBe("login");
  });

  it("selects production when AUTHORIZENET_ENV=production", () => {
    process.env.AUTHORIZENET_API_LOGIN_ID = "login";
    process.env.AUTHORIZENET_TRANSACTION_KEY = "txn";
    process.env.AUTHORIZENET_ENV = "production";
    expect(loadAuthorizeNetConfig().environment).toBe("production");
  });
});

describe("AuthorizeNetProvider.verifyWebhook", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    process.env = { ...saved };
    process.env.AUTHORIZENET_API_LOGIN_ID = "login";
    process.env.AUTHORIZENET_TRANSACTION_KEY = "txn";
    process.env.AUTHORIZENET_SIGNATURE_KEY = KEY;
  });

  it("maps a settled capture event to succeeded", () => {
    const p = new AuthorizeNetProvider();
    const body = JSON.stringify({
      notificationId: "n1",
      eventType: "net.authorize.payment.authcapture.created",
      payload: { id: 40000001, authAmount: 100 },
    });
    const evt = p.verifyWebhook(body, { "x-anet-signature": `sha512=${sign(body)}` });
    expect(evt).not.toBeNull();
    expect(evt?.status).toBe("succeeded");
    expect(evt?.providerTransactionId).toBe("40000001");
    expect(evt?.amount).toBe(100);
  });

  it("maps a refund event to refunded", () => {
    const p = new AuthorizeNetProvider();
    const body = JSON.stringify({
      notificationId: "n2",
      eventType: "net.authorize.payment.refund.created",
      payload: { id: 5 },
    });
    const evt = p.verifyWebhook(body, { "x-anet-signature": `sha512=${sign(body)}` });
    expect(evt?.status).toBe("refunded");
  });

  it("returns null on an invalid signature", () => {
    const p = new AuthorizeNetProvider();
    const body = JSON.stringify({ eventType: "x" });
    expect(p.verifyWebhook(body, { "x-anet-signature": "sha512=deadbeef" })).toBeNull();
  });
});

describe("AuthorizeNetProvider.publicConfig", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    process.env = { ...saved };
    process.env.AUTHORIZENET_API_LOGIN_ID = "login";
    process.env.AUTHORIZENET_TRANSACTION_KEY = "txn-secret";
    process.env.AUTHORIZENET_CLIENT_KEY = "client-pub";
    process.env.AUTHORIZENET_SIGNATURE_KEY = KEY;
  });

  it("exposes only public fields, never the transaction/signature keys", () => {
    const cfg = new AuthorizeNetProvider().publicConfig();
    const serialized = JSON.stringify(cfg);
    expect(cfg.apiLoginId).toBe("login");
    expect(cfg.clientKey).toBe("client-pub");
    expect(serialized).not.toContain("txn-secret");
    expect(serialized).not.toContain(KEY);
  });
});
