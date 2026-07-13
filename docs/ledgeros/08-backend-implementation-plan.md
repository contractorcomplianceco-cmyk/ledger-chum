# LedgerOS Backend Implementation Plan

**Version:** 1.0
**Audience:** Engineering. Assumes TanStack Start + Lovable Cloud (Supabase).

## 1. Runtime Choices

- **Server functions** (`createServerFn` from `@tanstack/react-start`) for
  all app-internal calls (UI → backend). Auth via `requireSupabaseAuth`.
- **Server routes** (`createFileRoute` under `src/routes/api/public/*`) for
  external callers (operational systems, webhooks). Each handler verifies
  its own Bearer token; the `/api/public/*` prefix bypasses Lovable's
  published-site auth.
- **`supabaseAdmin`** (service role) inside verified public-route handlers
  only; loaded lazily via `await import(...)` to keep it out of client
  bundles.
- **`supabase` browser client** for UI reads scoped by RLS.
- **No Supabase Edge Functions** for app-internal logic.

## 2. Module Layout

```text
src/
  integrations/
    supabase/
      client.ts            # browser (RLS)
      client.server.ts     # admin (service role, server-only)
      auth-middleware.ts   # requireSupabaseAuth
      auth-attacher.ts     # bearer attacher for server-fn RPC
      types.ts             # generated
    serviceconnect/
      verify.server.ts     # bearer + idempotency + audit helpers
  lib/
    accounting/
      customers.functions.ts
      invoices.functions.ts
      payments.functions.ts        (Phase 3)
      credits.functions.ts         (Phase 3)
      refunds.functions.ts         (Phase 3)
      journals.functions.ts        (Phase 2)
      accounts.functions.ts        (Phase 2)
      periods.functions.ts         (Phase 1)
      vendors.functions.ts         (Phase 4)
      bills.functions.ts           (Phase 4)
      banking.functions.ts         (Phase 5)
      reports.functions.ts
    admin/
      api-clients.functions.ts     (Phase 1)
      roles.functions.ts           (Phase 1)
  routes/
    api/
      public/
        integrations/
          customers.ts
          work-orders.completed.ts
          invoices.ts
          payments.ts
          inventory-consumption.ts
```

Rules:

- `*.functions.ts` files never import `client.server` at module scope.
- Server-only helpers live in `*.server.ts`.
- Public-route handlers wrap every action in
  `beginIntegrationCall` / `finishIntegrationCall` /
  `recordIntegrationError` from `verify.server.ts`.

## 3. Database Migrations

- One migration per phase, additive only.
- Each migration follows the required 4-step order for new public tables:
  `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY`.
- Triggers used for non-immutable rules (period lock, journal balance).
- Views are `security_invoker=true` so RLS applies through the view.

## 4. Auth & RLS

- Every table with tenant data has a `SELECT`/`INSERT`/`UPDATE`/`DELETE`
  policy scoped through `is_org_member(org_id)` or `has_role()`.
- Roles use the enum in place; no role columns on profile tables.
- The bearer-attacher middleware is registered in `src/start.ts` so every
  server-function RPC carries the caller's token.

## 5. Idempotency & Audit

- Unique index on `sync_history(org_id, idempotency_key)` — enforced.
- `audit_events` row written inside the same transaction as the state change
  it records; correlation ID matches `sync_history.request.correlation_id`.

## 6. Testing Strategy

- **Fixture seeds** for a pilot org (chart of accounts, fiscal period,
  api_client) applied as a migration in a `test/` schema for CI.
- **Contract tests** on public routes: happy path, missing bearer, invalid
  bearer, missing idempotency key, duplicate idempotency key, missing
  reference (customer/invoice), invalid payload.
- **Ledger invariants** (property tests): random posted-journal batches
  always yield balanced trial balance; reversing a journal produces net-zero
  GL impact; invoice `balance = total - sum(applications)`.
- **RLS smoke tests**: user in org A cannot read/write org B rows through
  either the browser client or an authenticated server function.

## 7. Observability

- `audit_events` is the primary trace.
- Server functions and routes log `{ correlation_id, endpoint,
  duration_ms, status }`.
- `sync_history.status = 'error'` rows are the queue for
  systems-reviewer alerts.

## 8. Deployment Notes

- Cloudflare Workers runtime — no Node-only packages. Prefer pure JS / Web
  APIs / WASM builds.
- Secrets: only `LOVABLE_API_KEY`, `SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`
  are set; new secrets added via `add_secret`/`generate_secret` per policy.
- No in-memory global state; workers are stateless.

## 9. Sequence for Phase 1

1. Migration: `fiscal_periods` table + `is_period_open(org, date)` helper +
   trigger on `journal_entries` to reject posts into closed periods.
2. Migration: RLS audit pass — any missing `SELECT`/`INSERT`/`UPDATE`
   policies added; `GRANT` audit.
3. `src/lib/admin/api-clients.functions.ts` — issue/rotate/deactivate.
4. `src/lib/admin/roles.functions.ts` — assign/revoke.
5. `src/lib/accounting/periods.functions.ts` — open/close/list.
6. Pilot-org seed migration.
7. Contract + invariant test scaffolding.
