import { describe, it, expect, vi } from "vitest";
import { DocumentCollectionClient } from "./client";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function page(items: unknown[], next: string | null) {
  return jsonResponse({
    items,
    next_cursor: next,
    generated_at: "2026-07-19T00:00:00.000Z",
  });
}

describe("DocumentCollectionClient", () => {
  it("lists requests with pagination + watermark query", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      page([{ request_id: "REQ-1", updated_at: "2026-07-18T00:00:00.000Z" }], null),
    );
    const client = new DocumentCollectionClient({
      baseUrl: "https://docs.example.com",
      apiKey: "export-token",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const out = await client.listRequests({ limit: 50, updatedSince: "2026-07-01" });
    expect(out.items[0].request_id).toBe("REQ-1");
    const url = fetchImpl.mock.calls[0][0] as string;
    expect(url).toContain("/export/docs-collect/v1/requests");
    expect(url).toContain("limit=50");
    expect(url).toContain("updated_since=2026-07-01");
  });

  it("iterates across pages via cursor", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        page([{ request_id: "REQ-1", updated_at: "2026-07-18T00:00:00.000Z" }], "c2"),
      )
      .mockResolvedValueOnce(
        page([{ request_id: "REQ-2", updated_at: "2026-07-19T00:00:00.000Z" }], null),
      );
    const client = new DocumentCollectionClient({
      baseUrl: "https://docs.example.com",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const ids: string[] = [];
    for await (const item of client.iterateRequests()) ids.push(item.request_id);
    expect(ids).toEqual(["REQ-1", "REQ-2"]);
    expect(fetchImpl.mock.calls[1][0]).toContain("cursor=c2");
  });
});
