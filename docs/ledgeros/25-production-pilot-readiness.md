# 25 — Production Pilot Readiness (M10)

M10 is the **validation milestone**. It does not add new financial capabilities
— it proves the LedgerOS pipeline end-to-end and gates production cutover.

Required lifecycle (unchanged):

```
ServiceConnect Work Order
   → Financial Event
   → Validation
   → Mapping
   → Approval
   → Materialization
   → Financial Object
   → Accounting Engine
   → Reports
   → Metrics
   → Intelligence
   → APEX Insight
```

No shortcut is permitted at any step. The Financial Event Bus is the ONLY
inbound path.

---

## 1. Deliverables

| Surface | Route | Purpose |
| --- | --- | --- |
| ServiceConnect Pilot Simulator | `/admin/integration-testing` | Fires representative payloads at `/api/public/integrations/*` using an operator-supplied API key. Read-only from LedgerOS's perspective — the simulator only presents outcomes the pipeline produced. |
| Integration Test Center | `/admin/integration-testing` | Structured checklist: authentication, idempotency, event ingestion, mapping, materialization, accounting, reporting, error recovery. |
| Production Readiness Dashboard | `/admin/readiness` | Five readiness categories: accounting, security, integration, intelligence, migration. |
| Data Migration Framework | `/admin/migration` | Prepares (does NOT execute) imports for chart of accounts, customers, vendors, opening balances, historical transactions. |
| Observability Framework | `/admin/observability` | Live view of integration failures, processing time, event volume, retry queue, audit events, system health. |

---

## 2. Test Categories

Each category is a distinct panel in the Test Center. Each check is a
description + a demonstration action; no check bypasses the ledger.

1. **Authentication** — Bearer token accepted / rejected, scope enforcement, tenant isolation.
2. **Idempotency** — Duplicate `Idempotency-Key` returns the stored response verbatim, no side effect.
3. **Event ingestion** — POST `/api/public/integrations/events` writes to `financial_events` and `sync_history`.
4. **Mapping** — `integration_event_mappings` resolves external event → ledger object.
5. **Materialization** — Approved event produces `financial_object_materializations` and downstream journal entries via `materialize_financial_event`.
6. **Accounting** — Journal is balanced, GL updated, trial balance ties.
7. **Reporting** — Metric refresh updates canonical metric values (freshness, confidence, lineage).
8. **Error recovery** — Failed row appears in retry queue; operator retry increments `retry_count` + emits audit event.

---

## 3. Readiness Categories

Each category is scored `not_ready | in_progress | ready` and rolls up to an
overall go/no-go state. Scoring is manual today and driven by advisory
signals from the intelligence layer.

- **Accounting readiness** — chart of accounts loaded, opening balances entered, close controls active.
- **Security readiness** — RLS enabled everywhere, tenant isolation validated, secrets stored via `add_secret`, API keys scoped.
- **Integration readiness** — `integration_sources` + `integration_event_mappings` configured, at least one successful end-to-end run recorded.
- **Intelligence readiness** — canonical metrics active with fresh values, anomaly detection online, recommendations generated, AI governance policy in place.
- **Migration readiness** — Zoho parallel run agreed, cutover date agreed, rollback plan documented.

---

## 4. Data Migration Framework

Files staged only; no writes to the ledger occur from this surface. Each
import has:

- Template schema
- Row count (staged)
- Validation status (pending, validated, blocked)
- Owner
- Blocking notes

The intended migrations are:

1. Chart of Accounts
2. Customers
3. Vendors
4. Opening balances (per-account debit/credit as of cutover date)
5. Historical transactions (last N months, ledger-preserving)

Actual execution is a separate operator run under the existing accounting
engine — not a shortcut in the migration UI.

---

## 5. Observability

- **Integration failures** — `sync_history.status = 'error'` grouped by endpoint.
- **Processing time** — median + p95 handler latency (log-derived).
- **Event volume** — accepted vs errored, per hour.
- **Retry queue** — rows with `retry_count > 0` and `last_retry_at`.
- **Audit events** — recent `audit_events` cross-referenced with correlation IDs.
- **System health** — advisory rollup of the above.

Observability is read-only. No mitigations happen here — operators act
through the Financial Event Bus, Integration Inbox, or accountant workspace.

---

## 6. Invariants Preserved

- No UI queries raw accounting tables directly.
- No auto-posting of journal entries.
- No ServiceConnect-specific accounting rules — ServiceConnect remains a
  configuration of `integration_sources` + `integration_event_mappings`.
- AI cannot post, approve, or override controls.
- LedgerOS remains the independent financial operating system.
