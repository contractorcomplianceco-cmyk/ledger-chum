import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/docs/read-api")({
  component: ReadApiDocs,
  head: () => ({
    meta: [
      { title: "LedgerOS Read API v1 — Consumer Contract" },
      {
        name: "description",
        content:
          "Contract reference for AuditEngine and internal CCA systems consuming LedgerOS canonical metrics, close status, journals, and intelligence.",
      },
      { property: "og:title", content: "LedgerOS Read API v1" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const ENDPOINTS = [
  {
    path: "GET /api/public/read/v1/metrics",
    scope: "read.metrics",
    query: "?key=<metric_key> (optional)",
    example: `{
  "contract_version": "v1",
  "served_at": "2026-07-27T12:00:00.000Z",
  "org_id": "…",
  "consumer": "auditengine",
  "count": 14,
  "metrics": [
    {
      "key": "true_available_cash",
      "name": "True Available Cash",
      "category": "cash",
      "refresh_frequency": "hourly",
      "description": "Cash minus reserves, holdbacks, and pending outflows.",
      "latest": { "value": 482300.12, "period_end": "2026-07-26", "freshness_status": "fresh", "confidence_score": 0.94 }
    }
  ]
}`,
  },
  {
    path: "GET /api/public/read/v1/health",
    scope: "read.health",
    query: "(no params)",
    example: `{
  "contract_version": "v1",
  "drivers": [
    { "key": "financial_health_score", "name": "Financial Health Score", "latest": { "value": 78 } },
    { "key": "cash_runway_days", "name": "Cash Runway (days)", "latest": { "value": 142 } }
  ]
}`,
  },
  {
    path: "GET /api/public/read/v1/close-status",
    scope: "read.close",
    query: "(no params) — returns last 12 close runs",
    example: `{
  "contract_version": "v1",
  "close_runs": [
    { "id": "…", "fiscal_period_id": "…", "status": "in_progress", "started_at": "…", "completed_at": null }
  ]
}`,
  },
  {
    path: "GET /api/public/read/v1/intelligence",
    scope: "read.intelligence",
    query: "?kind=anomalies|recommendations|explanations|all",
    example: `{
  "contract_version": "v1",
  "anomalies": [ { "id": "…", "metric_key": "revenue", "severity": "medium", "confidence": 0.82 } ],
  "recommendations": [],
  "explanations": []
}`,
  },
  {
    path: "GET /api/public/read/v1/journals",
    scope: "read.journals",
    query: "?limit=<1-200>&since=<ISO8601>",
    example: `{
  "contract_version": "v1",
  "count": 50,
  "limit": 50,
  "journals": [
    { "id": "…", "entry_date": "2026-07-26", "memo": "…", "status": "posted", "posted_at": "…", "correlation_id": "…" }
  ]
}`,
  },
];

function ReadApiDocs() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Read API v1"
        title="LedgerOS Consumer Contract"
        description="Reference for internal CCA systems (AuditEngine, ApplicationsOS, DocumentOS, ComplianceCoreOS, BidIntelligenceOS, CarmenOS, ComplianceConnect, TrustScore, Steel Link, Rose OS) that read LedgerOS financial data."
      />
      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>Contract principles</CardTitle>
            <CardDescription>Applies to every endpoint under <code>/api/public/read/v1/</code>.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <div className="font-medium">Read-only</div>
              <p className="text-muted-foreground">Consumers cannot mutate ledger data. Writes flow through the Financial Event Bus with a separate scope and idempotency contract.</p>
            </div>
            <div>
              <div className="font-medium">Canonical values only</div>
              <p className="text-muted-foreground">Every metric served is computed by the Canonical Metrics Layer. Direct accounting-table queries are forbidden.</p>
            </div>
            <div>
              <div className="font-medium">Envelope</div>
              <p className="text-muted-foreground">All responses include <code>contract_version</code>, <code>served_at</code>, and <code>consumer</code>. Consumers must fail closed on version mismatch.</p>
            </div>
            <div>
              <div className="font-medium">Scoped API keys</div>
              <p className="text-muted-foreground">Each key is bound to a consumer slug (e.g. <code>auditengine</code>) with an explicit scope set. Keys are issued from <code>/admin/contracts</code>.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">
{`GET /api/public/read/v1/metrics HTTP/1.1
Host: ledger-chum.lovable.app
Authorization: Bearer los_<40-hex-chars>
Accept: application/json`}
            </pre>
            <p className="text-muted-foreground">
              Missing or invalid key → <code>401</code>. Missing scope → <code>403</code>. Revoked or expired → <code>401</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ENDPOINTS.map((e) => (
              <div key={e.path} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-semibold">{e.path}</code>
                  <Badge variant="outline" className="text-[10px]">{e.scope}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Params: <code>{e.query}</code></div>
                <pre className="mt-2 rounded bg-muted p-2 text-[11px] overflow-x-auto">{e.example}</pre>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error format</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-md bg-muted p-3 text-xs">{`{ "contract_version": "v1", "error": "Missing required scope: read.metrics" }`}</pre>
          </CardContent>
        </Card>
      </PageBody>
    </AppShell>
  );
}
