import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { IntegrationHttpClient, IntegrationError } from "./http-client";

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

const schema = z.object({ ok: z.boolean() });

describe("IntegrationHttpClient", () => {
  it("sends Bearer auth, JSON headers, and validates the response", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({ ok: true }),
    );
    const client = new IntegrationHttpClient({
      service: "svc",
      baseUrl: "https://api.example.com/",
      apiKey: "secret-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const out = await client.request({ path: "/thing", schema });
    expect(out).toEqual({ ok: true });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.example.com/thing");
    const headers = init!.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer secret-key");
    expect(headers.get("accept")).toBe("application/json");
  });

  it("appends query params, skipping null/undefined", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({ ok: true }),
    );
    const client = new IntegrationHttpClient({
      service: "svc",
      baseUrl: "https://api.example.com",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await client.request({
      path: "/q",
      schema,
      query: { a: "1", b: undefined, c: null, d: 5 },
    });
    expect(fetchImpl.mock.calls[0][0]).toBe("https://api.example.com/q?a=1&d=5");
  });

  it("attaches Idempotency-Key on writes", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({ ok: true }),
    );
    const client = new IntegrationHttpClient({
      service: "svc",
      baseUrl: "https://api.example.com",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await client.request({
      method: "POST",
      path: "/w",
      body: { x: 1 },
      idempotencyKey: "idem-123",
      schema,
    });
    const init = fetchImpl.mock.calls[0][1]!;
    expect((init.headers as Headers).get("idempotency-key")).toBe("idem-123");
    expect(init.body).toBe(JSON.stringify({ x: 1 }));
  });

  it("retries transient 503 then succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: "busy" }, 503))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    const client = new IntegrationHttpClient({
      service: "svc",
      baseUrl: "https://api.example.com",
      backoffBaseMs: 1,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const out = await client.request({ path: "/retry", schema });
    expect(out).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 4xx and throws IntegrationError", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({ error: "nope" }, 403),
    );
    const client = new IntegrationHttpClient({
      service: "svc",
      baseUrl: "https://api.example.com",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.request({ path: "/f", schema })).rejects.toBeInstanceOf(IntegrationError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("throws a contract violation when the response fails the schema", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({ ok: "not-a-bool" }),
    );
    const client = new IntegrationHttpClient({
      service: "svc",
      baseUrl: "https://api.example.com",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(client.request({ path: "/c", schema })).rejects.toThrow(/contract violation/i);
  });

  it("throws when baseUrl is empty (misconfigured env)", () => {
    expect(() => new IntegrationHttpClient({ service: "svc", baseUrl: "" })).toThrow(
      IntegrationError,
    );
  });
});
