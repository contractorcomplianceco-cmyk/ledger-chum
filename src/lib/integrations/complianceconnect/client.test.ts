import { describe, it, expect, vi } from "vitest";
import { ComplianceConnectClient } from "./client";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function makeClient(fetchImpl: ReturnType<typeof vi.fn>) {
  return new ComplianceConnectClient({
    baseUrl: "https://portal.example.com",
    apiKey: "cc-key",
    fetchImpl: fetchImpl as unknown as typeof fetch,
  });
}

describe("ComplianceConnectClient", () => {
  it("reads an approved compliance score", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({
        score: { locationId: "loc-1", posture: "stable", band: "green" },
        state: "approved",
      }),
    );
    const client = makeClient(fetchImpl);
    const out = await client.getComplianceScore({ locationId: "loc-1" });
    expect(out.state).toBe("approved");
    expect(out.score?.locationId).toBe("loc-1");
    expect(fetchImpl.mock.calls[0][0]).toContain("locationId=loc-1");
  });

  it("handles the no_approved_score state", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({ score: null, state: "no_approved_score", message: "in review" }),
    );
    const out = await makeClient(fetchImpl).getComplianceScore();
    expect(out.state).toBe("no_approved_score");
    expect(out.score).toBeNull();
  });

  it("sends idempotency key on monitoring ingest", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      jsonResponse({ written: 1 }),
    );
    const client = makeClient(fetchImpl);
    await client.ingestMonitoring(
      "loc-1",
      { rows: [{ riskId: "r1", complianceStatus: "compliant", monitored: true }] },
      "idem-xyz",
    );
    const init = fetchImpl.mock.calls[0][1]!;
    expect((init.headers as Headers).get("idempotency-key")).toBe("idem-xyz");
    expect(fetchImpl.mock.calls[0][0]).toContain("/admin/monitoring/ingest/loc-1");
  });
});
