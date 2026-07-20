import { describe, it, expect, beforeEach } from "vitest";
import { getPaymentProvider, resetPaymentProvider } from "./get-provider.server";

const saved = { ...process.env };

describe("getPaymentProvider", () => {
  beforeEach(() => {
    process.env = { ...saved };
    delete process.env.PAYMENT_PROVIDER;
    delete process.env.APP_MODE;
    delete process.env.VITE_APP_MODE;
    delete process.env.AUTHORIZENET_API_LOGIN_ID;
    resetPaymentProvider();
  });

  it("defaults to the demo provider in demo mode", () => {
    expect(getPaymentProvider().name).toBe("demo");
  });

  it("honors an explicit PAYMENT_PROVIDER=authorize_net override", () => {
    process.env.PAYMENT_PROVIDER = "authorize_net";
    resetPaymentProvider();
    expect(getPaymentProvider().name).toBe("authorize_net");
  });

  it("honors an explicit PAYMENT_PROVIDER=demo override even in production", () => {
    process.env.PAYMENT_PROVIDER = "demo";
    process.env.APP_MODE = "production";
    resetPaymentProvider();
    expect(getPaymentProvider().name).toBe("demo");
  });

  it("falls back to demo in production when Authorize.net secrets are absent", () => {
    process.env.APP_MODE = "production";
    resetPaymentProvider();
    expect(getPaymentProvider().name).toBe("demo");
  });

  it("selects Authorize.net in production once configured", () => {
    process.env.APP_MODE = "production";
    process.env.AUTHORIZENET_API_LOGIN_ID = "login";
    resetPaymentProvider();
    expect(getPaymentProvider().name).toBe("authorize_net");
  });

  it("caches the resolved provider until reset", () => {
    const first = getPaymentProvider();
    process.env.PAYMENT_PROVIDER = "authorize_net";
    expect(getPaymentProvider()).toBe(first);
    resetPaymentProvider();
    expect(getPaymentProvider().name).toBe("authorize_net");
  });
});
