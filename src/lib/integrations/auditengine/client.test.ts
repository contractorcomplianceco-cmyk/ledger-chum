import { describe, it, expect, vi } from "vitest";
import { AuditEngineClient } from "./client";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function makeClient(fetchImpl: ReturnType<typeof vi.fn>) {
  return new AuditEngineClient({
    baseUrl: "https://audit.example.com",
    apiKey: "audit-key",
    fetchImpl: fetchImpl as unknown as typeof fetch,
  });
}

describe("AuditEngineClient", () => {
  it("registers LedgerOS as a read-only consumer and pins a snapshot", () => {
    const client = makeClient(vi.fn());
    const reg = client.registerConsumer("2026-07-16");
    expect(reg).toMatchObject({
      consumer: "ledgeros",
      mode: "read-only",
      pinnedSnapshot: "2026-07-16",
    });
    expect(client.snapshotPin).toBe("2026-07-16");
  });

  it("sends the consumer header and validates cca-rf-library", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({
        ok: true,
        source: "audit_cca_rf_library",
        total: 1,
        records: [
          { id: 1, factorCode: "RF-1", title: "Licensing", category: "legal", isActive: true },
        ],
      }),
    );
    const client = makeClient(fetchImpl);
    const out = await client.getCcaRfLibrary();
    expect(out.records[0].factorCode).toBe("RF-1");
    const headers = fetchImpl.mock.calls[0][1]!.headers as Headers;
    expect(headers.get("x-cca-consumer")).toBe("ledgeros");
  });

  it("pulls only human-approved jurisdiction rules", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({
        ok: true,
        source: "audit_jurisdiction_rules",
        phase: "1.3",
        state: "CA",
        total: 0,
        count: 0,
        records: [],
      }),
    );
    const client = makeClient(fetchImpl);
    await client.listApprovedJurisdictionRules({ state: "CA", limit: 10 });
    const url = fetchImpl.mock.calls[0][0] as string;
    expect(url).toContain("human_approved=true");
    expect(url).toContain("state=CA");
    expect(url).toContain("limit=10");
  });
});
