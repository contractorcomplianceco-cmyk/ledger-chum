# Phase 4 — Live Integration Wire-Up

_Status: Landed_

Phase 4 wires the Phase 3 accountant workspace UI to the real LedgerOS
back-end. No new accounting modules were added; no UI was redesigned. Every
mock read/write in `/dashboards/accounting`, `/integrations`,
`/invoices/review`, and `/settings/account-mappings` is now backed by real
`createServerFn` calls (or falls back to demo data when unauthenticated so
the marketing/preview surface stays usable).

## Scope

- **Live-data adapter**: replace `DEMO_*` reads on the four workspace pages
  with `useServerFn` + `useQuery` against real server functions.
- **Invoice review workflow**: `Draft → Review → Post` calls
  `postInvoice` and lets the ledger engine enforce balanced entries, open
  fiscal periods, and mapped accounts.
- **Account mappings CRUD**: `/settings/account-mappings` uses
  `listAccountMappings` + `upsertAccountMapping` and offers an in-line
  account picker from the live chart of accounts.
- **ServiceConnect connector settings**: new
  `/settings/serviceconnect` page for issuing / rotating / revoking API
  clients, test-connection, and viewing scopes.
- **Integration Sandbox Mode**: new `/integrations/sandbox` route that
  seeds a demo customer + draft invoice inside the caller's org, clearly
  labelled `SANDBOX-*`.
- **Docs**: this file.

Explicitly **out of scope** in Phase 4: AP, banking feeds, reconciliation,
tax, payroll, new visual design, migrating away from Phase 3 mock data
sources still in use for offline/preview.

## New server functions

All live in `src/lib/accounting/workspace.functions.ts` and go through
`requireSupabaseAuth` — the org id passed in is authorised by RLS via
`org_members` / `has_role`.

| Function                    | Purpose                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `getCurrentOrg`             | Returns the caller's primary org membership.                    |
| `listAccounts`              | Chart of accounts for the mapping selector.                     |
| `listIntegrationEvents`     | `audit_events` feed (Integration Inbox).                        |
| `listSyncHistory`           | `sync_history` rows (per-request idempotency).                  |
| `getDashboardMetrics`       | 24h rollups: drafts, posted, payments, consumption, refunds.    |
| `testIntegrationConnection` | Ping: verifies auth + mapping coverage + fiscal period.         |
| `seedSandboxWorkOrder`      | Creates a demo customer + draft invoice with `SANDBOX-*` marks. |

The Phase 2 functions already live and are now called from the UI:
`listInvoices`, `getInvoice`, `postInvoice`, `listAccountMappings`,
`upsertAccountMapping`, `listApiClients`, `issueApiClient`,
`rotateApiClient`, `revokeApiClient`.

## Auth + org context

- The React hook `useCurrentOrg()` (in `src/hooks/use-current-org.ts`) is
  the single source of truth for the caller's org.
- It calls `getCurrentOrg` behind `useQuery` with `retry: false`; if the
  caller is unauthenticated the promise is caught and the hook resolves
  to `null`. UI code then chooses live vs demo per surface.
- `useOrgId()` is a convenience wrapper returning `data?.orgId ?? null`.

## Live wire-up per page

### `/dashboards/accounting`

- Metrics tiles come from `getDashboardMetrics`.
- Draft list comes from `listInvoices({ status: "draft" })`.
- Sync-exceptions strip filters `listIntegrationEvents` on `*.failed`.
- Demo values remain as fallback for the preview surface.

### `/integrations`

- Activity tab reads `listIntegrationEvents` and classifies each audit
  event into the demo taxonomy (`work_order.completed`, `payment.received`,
  etc.) so filter chips keep working.
- Sync History tab reads `listSyncHistory` directly — endpoint,
  external id, idempotency key, source, status.
- Health tab keeps `DEMO_SYSTEMS` (not part of Phase 4 scope; real health
  telemetry lands later).

### `/invoices/review`

- Draft queue = `listInvoices({ status: "draft" })`.
- Detail = `getInvoice({ id })` — real `invoice_lines` including per-line
  `account_id`.
- Post button calls `postInvoice({ id })`. The server function:
  1. verifies caller org access (RLS),
  2. resolves AR through the mapping engine,
  3. builds a balanced journal (`AR debit = total`, revenue credits),
  4. flips `invoices.status` to `sent`,
  5. writes an `invoice.posted` audit event.
- The UI blocks Post when any line has `account_id = null` and surfaces a
  human-readable error when the ledger engine rejects a balance / period
  violation.

### `/settings/account-mappings`

- Reads `listAccountMappings` + `listAccounts`.
- Edit mode reveals a shadcn `<Select>` bound to the live chart of
  accounts, and calls `upsertAccountMapping` on save.
- All eight purposes are always rendered (`ar`, `cash_default`,
  `labor_revenue`, `material_revenue`, `inventory_asset`,
  `material_cogs`, `refund_clearing`, `credit_liability`), so
  unmapped purposes remain visible.
- Every save writes an `account_mapping.upserted` audit event.

## New pages

### `/settings/serviceconnect`

Read/write CRUD around `api_clients` for the ServiceConnect integration:

- **Endpoint / auth details**: shows the base URL (`origin +
/api/public/integrations`), required `Authorization: Bearer` header,
  required `Idempotency-Key` header.
- **Test connection**: calls `testIntegrationConnection` — reports
  latency, mapped-purpose count, active-client count, current fiscal
  period status.
- **Issue client**: `issueApiClient` (owner-only). The raw token is
  returned once and copied to the clipboard; only the hash is stored.
- **Rotate / revoke** existing clients.
- Displays required scopes (`customers.read`, `work_orders.completed`,
  `invoices.create`, `payments.create`, `inventory.consume`,
  `refunds.create`, etc.).

### `/integrations/sandbox`

Generates demo activity inside the caller's org so a full ServiceConnect
→ LedgerOS flow can be demoed without an external caller:

- Inserts one customer (`SANDBOX-CUST-*`), one draft invoice
  (`INV-SANDBOX-WO-*`), two lines (labor 4h × $125, material 1 × $150).
- Uses `resolve_account` RPC to pin line accounts.
- Writes a `sandbox.work_order.completed` audit event tagged
  `source = ledgeros.sandbox`.
- Sandbox-specific activity feed shows every SANDBOX event.
- Rows are clearly labelled `SANDBOX` throughout the UI.

## Authentication & posting invariants

All existing invariants remain enforced by the DB + Phase 2 posting engine:

- Tenant isolation: RLS via `is_org_member` and `has_role` on every table.
- No duplicate posting: `postInvoice` refuses any invoice not in
  `status = draft`, and journal-line inserts happen inside the same
  server-fn handler (single logical transaction from the client's
  perspective).
- Fiscal period validation: `is_period_open(org, date)` remains active on
  journal inserts.
- Audit trail: every mutation writes to `audit_events`; every integration
  request is recorded in `sync_history` by the existing public API routes.

## Demo workflow

1. Sign in as the pilot org owner.
2. Go to `/settings/serviceconnect` → **Test connection** — should return
   healthy with mapping coverage and the current fiscal period.
3. Go to `/settings/account-mappings` — confirm at least `ar`,
   `labor_revenue`, `material_revenue`, `inventory_asset`,
   `material_cogs` are mapped. Fix any red rows via the account picker.
4. Go to `/integrations/sandbox` → **Create work order + draft invoice**.
5. Go to `/invoices/review` — the new draft is selected. Review the
   journal preview, then click **Post invoice**.
6. Back on `/dashboards/accounting` the KPI tiles update: draft count
   drops, posted count increments, AR journal is visible under
   `/ledger/journals` (Phase 2 UI, unchanged).
7. `/integrations` shows the `invoice.posted` and
   `sandbox.work_order.completed` events with source
   `ledgeros.sandbox` / `ledgeros.ui`.

## Test matrix

Verify manually or through the existing Phase 2 API tests:

- [x] Real work-order POST creates a draft invoice via
      `/api/public/integrations/work-orders/completed`
- [x] Posting a draft creates a balanced journal (server enforced)
- [x] `/api/public/integrations/payments` posts cash / AR journal (Phase 2A)
- [x] Reports (`v_trial_balance`, `v_ar_aging`) update accordingly
- [x] `sync_history` records every public integration request
- [x] Duplicate `Idempotency-Key` returns the original response
- [x] Owner-only mutations (`issueApiClient`, `rotateApiClient`,
      `revokeApiClient`, `upsertAccountMapping`) are rejected without the
      `owner` role
- [x] `postInvoice` rejects invoices whose lines have no `account_id`

## Known limitations

- Health tab and "Connected systems" tile still use `DEMO_SYSTEMS`; real
  system-health telemetry (per-connector success/fail counts, retry state)
  is a Phase 5+ concern.
- Sandbox seeder does not (yet) auto-post the draft or record a payment —
  the demo walks the accountant through those steps deliberately.
- Health-of-integration event classification treats event-type suffixes
  (`.failed`, `.retry`, `.pending`) as the source of truth; when the
  ledger engine starts writing richer status envelopes those become the
  authoritative signal.
