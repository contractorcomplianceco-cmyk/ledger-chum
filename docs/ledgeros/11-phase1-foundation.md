# LedgerOS Phase 1 — Foundation

**Status:** Implemented.

## Scope

Phase 1 builds ONLY the foundation that later financial phases depend on.
No journal entries, invoices, payments, AR, AP, banking, or reports are
introduced by this phase. Existing UI continues to run on mock adapters
until each downstream phase lands.

## Database Changes

### `organizations` (extended)

Added: `legal_name`, `display_name`, `status` (`active|suspended|archived`),
`industry`, `timezone`, `currency`, `country`, `fiscal_year_start_month`,
`updated_at`. Owners can now update their own organization row.

### `organization_settings` (new)

One row per org. Holds `accounting_basis` (`cash|accrual`),
`default_currency`, `timezone`, `fiscal_calendar`, `close_policy` (jsonb),
`audit_retention_months`.

Access:
- Any org member can read.
- Only `owner` or `accounting_lead` may write.

### `fiscal_years` (new)

`(org_id, year)` unique. `status ∈ {open, pending_close, closed, locked}`.
Any org member can read; only `owner` or `accounting_lead` may write.

### `fiscal_periods` (new)

Belongs to a `fiscal_year`. `(fiscal_year_id, period_number)` unique.
`status ∈ {open, pending_close, closed, locked}`.
Tracks `closed_at`, `closed_by`.

Helper: `public.is_period_open(_org uuid, _date date) → boolean` used by
the future posting engine to reject postings into non-open periods.

### `audit_events` (extended + immutable)

Added: `action`, `source`, `reason`.
Added trigger `tg_audit_immutable` that raises on any `UPDATE` or `DELETE`
except `service_role`. Insert policy scopes to org members.

### `api_clients` (extended)

Added: `provider`, `description`, `expires_at`, `revoked_at`, `created_by`,
`updated_at`. Now represents any external integration application, not
just ServiceConnect. Only `owner` may issue, rotate, or revoke.

### Pilot Organization Seed

Inserted (idempotent):
- Organization `CCA Pilot Financials` (slug `cca-pilot`)
- `organization_settings` defaults
- Fiscal year for the current calendar year, 12 monthly periods, all `open`

No users, customers, invoices, payments, or journal entries are seeded.
Users are provisioned through Supabase Auth and attached via `assignRole`.

## Server Functions

### `src/lib/accounting/periods.functions.ts`

- `listFiscalYears({ orgId })`
- `listFiscalPeriods({ orgId, fiscalYearId? })`
- `createFiscalYear({ orgId, year, startDate, endDate, generateMonthlyPeriods })`
- `setPeriodStatus({ periodId, status })` — writes an audit event

### `src/lib/admin/api-clients.functions.ts`

- `listApiClients({ orgId })`
- `issueApiClient({ orgId, name, provider, description?, expiresAt? })`
  — returns the raw token exactly once; only SHA-256 hash is stored.
- `rotateApiClient({ id, orgId })` — new secret, re-activates, returns raw token once.
- `revokeApiClient({ id, orgId })` — deactivates + stamps `revoked_at`.

All three assert the caller has `owner` role for the org.

### `src/lib/admin/roles.functions.ts`

- `listOrgRoles({ orgId })`
- `assignRole({ orgId, userId, role })` — also upserts `org_members`.
- `revokeRole({ orgId, userId, role })`

Owner-only. Every mutation writes an `audit_events` row.

## API Contracts

Foundation-level contracts (server functions, called from UI via
`useServerFn`). External HTTP endpoints under `/api/public/integrations/*`
remain gated by `verify.server.ts` (bearer + idempotency) — no financial
posting behavior yet.

| Purpose        | Function                                    |
| -------------- | ------------------------------------------- |
| Organizations  | Handled through Supabase browser client with RLS |
| Fiscal years   | `listFiscalYears`, `createFiscalYear`       |
| Fiscal periods | `listFiscalPeriods`, `setPeriodStatus`      |
| Roles          | `listOrgRoles`, `assignRole`, `revokeRole`  |
| Api clients    | `listApiClients`, `issueApiClient`, `rotateApiClient`, `revokeApiClient` |
| Audit          | Read via Supabase browser client under RLS  |

## Permission Model

Roles (existing `app_role` enum, kept for continuity with docs 02/06):

| Role                  | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `owner`               | Organization admin. Owns roles, api clients, org settings. |
| `accounting_lead`     | Chart of accounts, fiscal calendar, period close. |
| `accountant`          | Day-to-day posting (future phases).            |
| `systems_reviewer`    | Read audit + sync history; reconciliation queue. |
| `team_member`         | Operational read access; no financial writes.  |
| `integration_service` | External systems acting via api_clients.       |

Owner is a hard gate for privileged foundation operations
(`issueApiClient`, `rotateApiClient`, `revokeApiClient`, `assignRole`,
`revokeRole`). RLS is not the only enforcement — server functions verify
role via `has_role` before touching admin operations.

## Tenant Isolation

Every foundation table carries `org_id` and enforces RLS via
`is_org_member(org_id)` or `has_role(user, org, role)`. `SUPABASE_SERVICE_ROLE_KEY`
is not used from client-reachable modules and bypasses RLS only inside
verified server handlers.

## Testing Notes

Verified in this phase:
- Non-member `SELECT`/`INSERT`/`UPDATE` on foundation tables is blocked by RLS.
- Direct `UPDATE`/`DELETE` on `audit_events` from `authenticated` raises
  `audit_events is append-only`.
- `is_period_open(org, date)` returns `true` only when a matching period's
  `status = 'open'`.
- Duplicate `assignRole` calls are idempotent via the unique
  `(user_id, org_id, role)` constraint.

Full contract + invariant test scaffolding lands with Phase 2 alongside the
first ledger writes.

## Known Limitations

- No UI yet for fiscal periods, api clients, or role management. Server
  functions are ready; screens land as each phase's UI is built.
- Roles are the six-value enum documented in `06-accounting-workflows.md`;
  the "Viewer" / "Accounting Administrator" / "Integration Administrator"
  labels in the Phase 1 brief map to `team_member` / `accounting_lead` /
  `owner` respectively rather than introducing new enum values.
- Pilot seed does not attach users — that must be done through Supabase
  Auth + `assignRole` because `auth.users` is provider-managed.
- Two Supabase advisors flag `SECURITY DEFINER` helpers (`is_org_member`,
  `has_role`, `is_period_open`). They are intentional — required by RLS —
  and remain as documented in `10-security-tenant-isolation.md`.

## What Is NOT Implemented in Phase 1

- Journal entries, invoices, payments, credits, refunds, expenses.
- Chart of accounts seeding.
- Period-lock enforcement inside a posting engine (helper exists; the
  trigger that consumes it ships with Phase 2).
- Reconciliation, banking, reporting.
- ServiceConnect-specific accounting logic (integration endpoints exist
  but perform no financial posting).

Next phase: **Phase 2 — Double-Entry Engine** (see
`07-phase-roadmap.md`).
