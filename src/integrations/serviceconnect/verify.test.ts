import { describe, it, expect } from "vitest";
import {
  IntegrationError,
  errorResponse,
  integrationResponse,
  requireScope,
  type ResolvedClient,
} from "./verify.server";

function client(scopes: string[]): ResolvedClient {
  return {
    clientId: "c1",
    orgId: "org1",
    clientName: "Test",
    scopes,
    environment: "sandbox",
  };
}

describe("public integration endpoint auth contract", () => {
  it("passes when the required scope is present", () => {
    expect(() => requireScope(client(["invoices.create"]), "invoices.create")).not.toThrow();
  });

  it("rejects a missing scope with 403", () => {
    try {
      requireScope(client(["invoices.read"]), "invoices.create");
      throw new Error("expected requireScope to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(IntegrationError);
      expect((err as IntegrationError).status).toBe(403);
    }
  });

  it("maps 401 (auth), 403 (scope), 409 (conflict) to the response status", async () => {
    for (const status of [401, 403, 409]) {
      const res = errorResponse(new IntegrationError(status, `err-${status}`));
      expect(res.status).toBe(status);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe(`err-${status}`);
    }
  });

  it("hides unexpected errors behind a 500", async () => {
    const res = errorResponse(new Error("boom"));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Internal server error");
  });

  it("integrationResponse defaults to 200 and serializes JSON", async () => {
    const res = integrationResponse({ hello: "world" });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/json");
    expect(await res.json()).toEqual({ hello: "world" });
  });
});
