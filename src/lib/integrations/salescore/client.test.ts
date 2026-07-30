import { describe, it, expect, vi } from "vitest";
import { SalesCoreClient } from "./client";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("SalesCoreClient", () => {
  it("lists library resources under /cca/library with Bearer auth", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse([{ id: "res-1", title: "Objection handling" }]),
    );
    const client = new SalesCoreClient({
      baseUrl: "https://sales.example.com",
      apiKey: "sales-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const out = await client.listLibraryResources();
    expect(out[0].id).toBe("res-1");
    expect(fetchImpl.mock.calls[0][0]).toBe("https://sales.example.com/cca/library");
    const headers = fetchImpl.mock.calls[0][1]!.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer sales-key");
  });

  it("reads certifications", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse([{ id: 1 }, { id: 2 }]),
    );
    const client = new SalesCoreClient({
      baseUrl: "https://sales.example.com",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const out = await client.listCertifications();
    expect(out).toHaveLength(2);
    expect(fetchImpl.mock.calls[0][0]).toContain("/cca/certifications");
  });
});
