# LedgerOS API Contract Map

**Version:** 1.0
**Scope:** Every API surface LedgerOS exposes, grouped by audience.

Wire-level detail for external contracts lives in
`docs/production-handoff/serviceconnect-api.md`. This file is the index and
audience-boundary map.

## 1. Audience Model

| Audience             | Transport                       | Auth                                | Notes |
| -------------------- | ------------------------------- | ----------------------------------- | ----- |
| LedgerOS UI (users)  | TanStack server functions       | Supabase session (bearer attacher)  | RLS applies as the user. |
| Operational systems  | HTTPS `/api/public/integrations/*` | Bearer against `api_clients`     | Idempotent, audited. |
| Automations & cron   | HTTPS `/api/public/*`           | Shared secret or Bearer             | Signature verified per handler. |
| Reporting readers (future) | HTTPS `/api/public/reports/*` | Bearer (read-only api_client) | Rate-limited. |

External callers NEVER call server functions directly; server functions are
TanStack RPC and not a stable HTTP contract.

## 2. Public Integration Endpoints (external)

All under `/api/public/integrations/`. Shared headers:
`Authorization: Bearer <token>`, `Idempotency-Key: <uuid>`,
`Content-Type: application/json`.

| Method | Path                     | Purpose                          | Status |
| ------ | ------------------------ | -------------------------------- | ------ |
| POST   | `/customers`             | Upsert customer                  | Live   |
| POST   | `/work-orders/completed` | Supervisor-approved WO → draft invoice | Live |
| POST   | `/invoices`              | Direct invoice push              | Live   |
| POST   | `/payments`              | Record payment + optional apply  | Live   |
| POST   | `/inventory-consumption` | Parts/materials consumed         | Live (reporting only in Phase 1) |
| GET    | `/sync-status`           | Look up prior response by key    | Planned Phase 1 |
| POST   | `/vendors`               | Upsert vendor                    | Planned Phase 4 |
| POST   | `/bills`                 | Push a vendor bill               | Planned Phase 4 |
| POST   | `/vendor-payments`       | Record a vendor payment          | Planned Phase 4 |
| POST   | `/bank-transactions`     | Push a bank transaction          | Planned Phase 5 |
| GET    | `/invoices/:external_id` | Read invoice status              | Planned Phase 3 |

## 3. Internal Server Functions (UI)

Grouped by domain. All authenticated via `requireSupabaseAuth`.

### Accounting foundation

- `openPeriod`, `beginClose`, `closePeriod`, `listPeriods`
- `assignRole`, `revokeRole`, `listMembers`

### Chart of accounts

- `listAccounts`, `getAccount`, `createAccount`, `updateAccount`,
  `deactivateAccount`

### Journals

- `postJournal(header, lines)`
- `reverseJournal(journalId, reason)`
- `getJournal(id)`, `listJournals(filter)`

### Customers

- `listCustomers`, `getCustomer`, `createCustomer`, `updateCustomer`,
  `deactivateCustomer`

### Invoices

- `listInvoices`, `getInvoice`, `createInvoice`, `updateDraftInvoice`,
  `postInvoice`, `voidInvoice`

### Payments / Credits / Refunds

- `recordPayment`, `applyPayment`, `unapplyPayment`
- `issueCreditMemo`, `applyCredit`
- `issueRefund`

### Vendors / Bills (Phase 4)

- `listVendors`, `createVendor`, `updateVendor`
- `createBill`, `postBill`, `voidBill`, `recordVendorPayment`

### Banking (Phase 5)

- `listBankAccounts`, `importBankTransactions`, `proposeMatches`,
  `confirmMatch`, `startReconciliation`, `finishReconciliation`

### Reports

- `getTrialBalance(from, to)`
- `getBalanceSheet(asOf)`
- `getIncomeStatement(from, to)`
- `getARAging(asOf)`, `getAPAging(asOf)`
- `getCustomerStatement(customerId, from, to)`
- `getJobProfitability(work_order_ref)`
- `getCustomerProfitability(customerId, from, to)`

### Admin

- `issueApiClientKey({ orgId, name })` — returns raw once, stores hash.
- `rotateApiClientKey(clientId)`
- `deactivateApiClient(clientId)`
- `listApiClients(orgId)`
- `listSyncHistory(filter)`

## 4. Response Conventions

- Internal server functions return plain DTOs (no `Response`, no streams).
- External endpoints return `application/json` with:
  ```json
  {
    "id": "uuid",
    "external_id": "...",
    "idempotency_key": "...",
    "correlation_id": "...",
    "audit_event_id": "..."   // when a mutation was recorded
  }
  ```
- Errors return `{ "error": "message", "correlation_id": "..." }` with the
  status code table in `04-integration-architecture.md`.

## 5. Versioning

- The wire contract for `/api/public/integrations/*` is v1 (implicit).
- Breaking changes ship under `/api/public/integrations/v2/...` and the old
  path is maintained for a deprecation window.
- Internal server functions have no version guarantees; they may change
  freely with the UI.
