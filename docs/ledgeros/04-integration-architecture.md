# LedgerOS Integration Architecture

**Version:** 1.0
**Scope:** Contracts and controls the Financial Integration Layer enforces
for every operational system that connects to LedgerOS.

## 1. Principles

1. **Operational systems push financial events.** LedgerOS is not polled for
   operational state.
2. **One tenant per API key.** A key identifies both the organization and
   the external system.
3. **Idempotent by contract.** Every mutating call carries an
   `Idempotency-Key`. Duplicates return the original response.
4. **External identity preserved.** Every row that originates externally
   carries `(external_source, external_id)` and a unique index on that pair
   inside a tenant.
5. **Audit everything.** Every accepted write emits one `audit_event` and
   one `sync_history` row.
6. **Fail loudly, retry safely.** Errors return structured `4xx`/`5xx` with
   a machine-readable message; retries are safe with the same key.

## 2. Endpoint Surface

Base: `/api/public/integrations/*`. This prefix bypasses Lovable's
published-site auth gate; every handler verifies its own Bearer token.

| Method | Path                                    | Purpose |
| ------ | --------------------------------------- | ------- |
| POST   | `/api/public/integrations/customers`    | Upsert a customer |
| POST   | `/api/public/integrations/work-orders/completed` | Supervisor-approved WO → draft invoice |
| POST   | `/api/public/integrations/invoices`     | Direct invoice push |
| POST   | `/api/public/integrations/payments`     | Record customer payment, optional apply |
| POST   | `/api/public/integrations/inventory-consumption` | Parts/materials consumed on a WO |

Future contracts (roadmap): `/vendors`, `/bills`, `/vendor-payments`,
`/bank-transactions`, `/reconciliation-events`.

## 3. Authentication

- Header `Authorization: Bearer <token>`.
- Token verified against `api_clients.key_hash` (SHA-256, opaque token).
- Inactive keys return `401`.
- `last_used_at` is updated per call.
- One key per (organization, external system). Rotation issues a new key and
  deactivates the old one after a grace window.

## 4. Idempotency

- Header `Idempotency-Key` REQUIRED on every mutating request.
- Unique index on `(org_id, idempotency_key)` in `sync_history`.
- On duplicate key with `status='accepted'`, the original response is
  replayed verbatim.
- Failed attempts (`status='error'`) are stored under a suffixed key so
  retries with the original key are allowed.

## 5. Tenant Isolation

- Bearer token resolves to exactly one `org_id`.
- The handler NEVER trusts an `org_id` in the payload.
- All writes filter and insert with the resolved `org_id`.
- `supabaseAdmin` is only used inside verified handlers; RLS policies still
  scope end-user reads.

## 6. External Identity

- Every integration-owned row carries `external_source` and `external_id`.
- Upsert semantics: `insert` when not found, `update` when found.
- Referenced entities (customer for invoice, invoice for payment) are looked
  up by `(external_source, external_id)`; missing references return `422`.

## 7. Sync History

Every accepted call inserts one row:

```
sync_history(
  org_id, source, endpoint, external_id, idempotency_key,
  status, request jsonb, response jsonb, error, created_at
)
```

Used for: replay of duplicates, forensics, ServiceConnect side "did I send
this?" checks, retry decisions.

## 8. Error Model

| Status | Class         | Retry? |
| ------ | ------------- | ------ |
| 400    | Bad request   | Fix and retry with a new key |
| 401    | Auth failure  | Rotate/fix credentials |
| 404    | Not found     | Fix and retry |
| 422    | Validation or missing reference | Fix payload and retry |
| 429    | Rate limited  | Backoff + retry same key |
| 500    | Server error  | Safe to retry same key |

Body: `{ "error": "message", "correlation_id": "..." }`.

## 9. Ordering and Consistency

- The operational system MUST send referenced entities first (customer
  before invoice; invoice before payment application).
- Out-of-order calls receive `422` with `error: "unknown_reference"`; the
  operational system retries after sending the referenced entity.
- LedgerOS does not attempt to reorder or buffer.

## 10. Extending to New Operational Systems

To onboard a new operational platform:

1. Register the system name (e.g. `mycrm`) — currently a string literal per
   integration; a future `external_system` table will formalize it.
2. Provision an `api_client` row for the tenant with a fresh hashed key.
3. Reuse the same endpoint surface. Payload contracts are system-agnostic —
   only `external_source` differs.
4. Add system-specific mapping rules (e.g. account_code fallbacks) inside
   the handler if needed; keep the wire contract stable.

## 11. What the Integration Layer Does NOT Do

- Does not model operational entities (work orders, dispatch, technicians).
  It stores references only.
- Does not run business logic that belongs to the operational system.
- Does not expose GL primitives to external systems; operational systems
  send events, not journal lines.
