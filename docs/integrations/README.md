# LedgerOS external integrations

LedgerOS integrates with four external CCA platform services. Each has a typed
client under `src/lib/integrations/<service>/` with:

- a client class + `create<Service>Client()` env-driven factory (server-only),
- Zod schemas modeled on the **real** target-repo route contracts,
- a shared HTTP core (`shared/http-client.ts`) providing scoped Bearer auth,
  `Idempotency-Key` on writes, retry/backoff on transient failures, and
  response contract validation,
- the shared platform **Event Envelope** (`shared/event-envelope.ts`).

Config is read from environment variables (never hardcode secrets). An
integration with a blank `*_BASE_URL` is **stubbed/disabled**; set the URL (and
key) to go live. See `.env.example`.

> Security: the `create*Client()` factories read scoped API keys from
> `process.env` and must only be imported from server code (server functions /
> API routes / tests). Never import them into client components, and never
> expose these keys as `VITE_*` variables.

## Shared Event Envelope

All CCA apps exchange domain events with:

```
{ eventId, eventType, eventVersion, occurredAt, correlationId,
  causationId, actor, ruleVersion, payload }
```

AuditEngine emits `snapshot.published`, `knowledge.approved`,
`knowledge.superseded`. Apps may subscribe instead of polling. This mirrors the
existing LedgerOS public-integration lineage fields (`correlation_id`,
idempotency) so events flow in one shape in both directions.

## Services

### 1. AuditEngine — `Audit-Risk-Model`  (read-only consumer)

- **Role:** governed source of truth. LedgerOS is a **read-only** consumer and
  never writes. `registerConsumer(snapshotLabel)` records a local read-only
  registration and pins the knowledge version consumed for reproducibility
  (`"latest"` follows published).
- **Contracts referenced** (`artifacts/api-server/src/routes/`):
  - `reference.ts` → `GET /reference` (safe, weight-free governance metadata)
  - `jurisdictionRules.ts` → `GET /cca-rf-library`,
    `GET /jurisdiction-rules?state&limit&human_approved` — consumer always pulls
    `human_approved=true` (Approved + Published only)
  - `public.ts` → `GET /public/trust-reports/:slug` (public, no auth)
- **Env:** `AUDITENGINE_BASE_URL`, `AUDITENGINE_API_KEY`
- **Status:** stub (no base URL wired yet). Client + schemas live.
- **Contract note:** the platform brief references a versioned Public Snapshot
  API (`POST /public-snapshot`, `GET /v1/snapshots/current`,
  `GET /v1/records/{id}?asOf=`). Those routes are **not present** in the current
  Audit-Risk-Model server, so snapshot pinning is modeled client-side over the
  real governed-read endpoints above. Swap in the versioned endpoints if/when
  AuditEngine ships them.

### 2. SalesCoreOS — `CCA-SalesIntelligenceOS`

- **Contracts referenced** (`artifacts/api-server/src/routes/cca.ts`, under
  `/cca`, behind `requireAuth`):
  - `GET /cca/library`, `GET /cca/certifications`,
    `GET /cca/crm/activities` (manager/admin)
- **Env:** `SALESCORE_BASE_URL`, `SALESCORE_API_KEY`
- **Status:** stub. Response field lists are upstream-owned (`@workspace/api-zod`
  `List*Response`); schemas validate the array/record shape with passthrough and
  should be tightened once the SalesOS OpenAPI is vendored.

### 3. DocumentCollectionOS — `Document-Collection`

- **Contracts referenced**
  (`artifacts/api-server/src/routes/docsCollectExport.ts` +
  `lib/docsCollectExport.ts`):
  - `GET /export/docs-collect/v1/requests?limit&updated_since&cursor`
    → `{ items, next_cursor, generated_at }`
  - `GET /export/docs-collect/v1/requests/:requestId`
  - Auth: Bearer export token (`DOCS_COLLECT_EXPORT_TOKEN`) or staff session.
- **Env:** `DOCUMENTCOLLECTION_BASE_URL`, `DOCUMENTCOLLECTION_EXPORT_TOKEN`
- **Status:** stub. Export-fact top-level fields (`request_id`, `updated_at`)
  are asserted; nested detail uses passthrough for forward-compatibility.
  `iterateRequests()` walks all cursor pages for incremental sync.

### 4. ComplianceConnectOS — `Client-Portal`

- **Contracts referenced** (`artifacts/api-server/src/routes/`):
  - `compliance-scores.ts` → `GET /compliance/score?locationId`
    → `{ score, state }`, `state ∈ approved | no_locations | no_approved_score`
    (approved score view only — no source audit id / reviewer notes / formula
    internals)
  - `admin/monitoring-ingest.ts` → `POST /admin/monitoring/ingest/:locationId`
    (staff batch upsert; write path — sends an `Idempotency-Key`)
- **Env:** `COMPLIANCECONNECT_BASE_URL`, `COMPLIANCECONNECT_API_KEY`
- **Status:** stub. Read (`getComplianceScore`) + staff write (`ingestMonitoring`)
  implemented.

## Testing

Client unit tests mock `fetch` (injected via `fetchImpl`) and assert headers,
query building, idempotency keys, retry/backoff, and contract validation. Run:

```
npm test
```
