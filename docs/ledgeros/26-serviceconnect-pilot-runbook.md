# 26 · ServiceConnect Pilot Runbook

Status: **M11 — pilot launch preparation**.

Operational runbook for taking the first ServiceConnect customer live on LedgerOS. This document is the single source of truth used by the accounting lead, the integration lead, and the pilot operator during activation.

## Guardrails

- LedgerOS is an independent financial operating system. ServiceConnect (or any external system) NEVER posts journal entries directly.
- Every external event enters through the Financial Event Bus, is validated and mapped, materialized into a financial object, and only then posted by the accounting engine.
- AI capabilities (AI Controller, Close Assistant, Accountant Assistant) are advisory-only. No AI action can post entries, override controls, or approve transactions.

## Activation workflow

```
Organization creation
        ↓
Configuration
        ↓
Accounting setup
        ↓
Integration setup
        ↓
Testing
        ↓
Activation
```

Each phase is tracked in the Customer Implementation Workspace at `/admin/customer-onboarding`.

### 1. Organization creation

- Create the tenant with legal entity, base currency, and fiscal year.
- Invite users and assign roles (`owner`, `accountant`, `reviewer`, `integration_operator`).
- Complete organization profile (legal name, tax IDs, address).

### 2. Configuration

- Set fiscal year start and monthly period cadence.
- Enable required feature flags: `financial_event_bus`, `materialization_engine`, `close_ai_advisor`.
- Configure notification recipients for approvals and exceptions.

### 3. Accounting setup

- Import Chart of Accounts via `/admin/migration` and validate.
- Post balanced opening balances through the accounting engine.
- Confirm purpose-based account mappings (AR, cash, labor revenue, material revenue, COGS, inventory, refund clearing, credit liability).
- Verify fiscal periods are open and the first period is active.

### 4. Integration setup

- Provision the ServiceConnect API client and scopes on the API Clients admin surface.
- Share the customer-facing integration docs at `/docs/integrations`.
- Map ServiceConnect customer, vendor, and item IDs to LedgerOS entities.
- Send a `work_order.completed` event to the sandbox endpoint and confirm it lands in the Financial Event Bus.

### 5. Testing

- Run the Integration Test Center at `/admin/integration-testing`. All 8 categories must pass:
  - Auth
  - Idempotency
  - Event Ingestion
  - Mapping
  - Materialization
  - Posting
  - Error Recovery
  - Audit lineage
- Rehearse the full lifecycle: WO → event → validation → mapping → approval → materialization → posting → report → metric → APEX insight.
- Perform a trial period close with the AI Controller advisory review.

### 6. Activation

- All categories on `/admin/readiness` must be green.
- Accounting lead and integration lead sign the cutover go/no-go.
- Flip environment to production, enable live event ingestion, and monitor `/admin/observability` for the first 24 hours.

## Rollback

- Disable the ServiceConnect API client to stop ingestion.
- Held drafts and exceptions remain queued — no posting occurs without accountant approval.
- Reopen the period only through the accounting engine (`reopen_period` RPC) with a reason.

## On-call

| Signal                     | Surface                     | First responder    |
| -------------------------- | --------------------------- | ------------------ |
| Ingestion failures         | `/admin/observability`      | Integration lead   |
| Materialization exceptions | `/admin/financial-events`   | Accountant on duty |
| Reconciliation drift       | `/ledger/banking/reconcile` | Accountant on duty |
| Advisory anomalies         | `/admin/intelligence`       | Controller         |

## Success criteria

- Zero direct external → journal posts.
- 100% of pilot revenue enters via the Financial Event Bus.
- Trial period closes within advisory tolerances.
- Accountant workspace at `/accounting-center` is the primary daily surface.
