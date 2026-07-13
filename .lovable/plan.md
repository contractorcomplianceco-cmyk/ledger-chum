# Phase 1 — Ledger Accounting Backend for ServiceConnect

Build an **independent** accounting backend that ServiceConnect calls over HTTP. Not a CCA-wide platform, not embedded. Ledger stays its own app; ServiceConnect is one API consumer.

## Scope

Backend only this phase. UI stays on mocks — we'll wire it in a later phase once endpoints are stable. This keeps the current Design Lab, APEX, and role workspaces untouched.

## 1. Platform

Enable **Lovable Cloud** (Supabase under the hood) for Postgres, auth, RLS, and server-function hosting. All endpoints implemented as TanStack `createServerFn` for internal calls and `src/routes/api/public/integrations/*` server routes for ServiceConnect's inbound HTTP.

## 2. Foundation tables (migration)

- `organizations` — tenant root (id, name, slug, created_at)
- `org_members` — user ↔ org join (user_id, org_id, created_at)
- `app_role` enum: `owner | accounting_lead | accountant | systems_reviewer | team_member | integration_service`
- `user_roles` — (user_id, org_id, role) with `has_role(_user, _org, _role)` security-definer fn
- `api_clients` — external system credentials (id, org_id, name='serviceconnect', key_hash, active, created_at)
- `audit_events` — (id, org_id, actor_type, actor_id, event_type, target_type, target_id, before jsonb, after jsonb, correlation_id, created_at)
- `sync_history` — (id, org_id, source, endpoint, external_id, idempotency_key, status, request jsonb, response jsonb, error, created_at) with unique index on (org_id, idempotency_key)

All tables: GRANTs to `authenticated` + `service_role`, RLS enabled, policies scope by `org_id` via `org_members`.

## 3. Accounting tables (migration)

- `customers` (id, org_id, external_id, external_source, name, email, phone, billing_address jsonb, status, created_at) — unique (org_id, external_source, external_id)
- `accounts` — chart of accounts (id, org_id, code, name, type: asset|liability|equity|revenue|expense, parent_id, is_active, normal_balance)
- `journal_entries` (id, org_id, entry_date, memo, source_type, source_id, status: draft|posted|void, posted_at, posted_by, correlation_id)
- `journal_lines` (id, journal_id, account_id, debit numeric(18,2), credit numeric(18,2), memo) — CHECK debit≥0 AND credit≥0 AND (debit=0 OR credit=0)
- `invoices` (id, org_id, customer_id, external_id, external_source, invoice_number, issue_date, due_date, status: draft|sent|partial|paid|void, subtotal, tax, total, balance, work_order_ref, memo)
- `invoice_lines` (id, invoice_id, description, quantity, unit_price, tax_rate, amount, account_id)
- `payments` (id, org_id, customer_id, external_id, external_source, payment_date, method, amount, unapplied_amount, memo)
- `payment_applications` (id, payment_id, invoice_id, amount_applied)
- `credits` (id, org_id, customer_id, credit_date, amount, unapplied_amount, memo, source_type, source_id)
- `credit_applications` (id, credit_id, invoice_id, amount_applied)
- `refunds` (id, org_id, payment_id, refund_date, amount, method, memo)
- `inventory_consumption` (id, org_id, work_order_ref, item_ref, quantity, unit_cost, total_cost, external_id) — feeds journal via COGS entry

All: GRANTs, RLS by `org_id`. Every mutation writes an `audit_events` row.

## 4. Trial-balance guarantee

Postgres trigger on `journal_entries` transition to `posted`: sum of `debit` = sum of `credit` across its lines, else raise. Views: `v_general_ledger`, `v_ar_aging` (buckets 0-30/31-60/61-90/90+), `v_trial_balance`.

## 5. Internal server functions (`src/lib/api/*.functions.ts`)

Auth via `requireSupabaseAuth`. One file per domain: customers, accounts, journals, invoices, payments, credits, refunds, reports. Each exports list/get/create/update/void. Void = reversing journal, never hard delete.

## 6. Public integration routes (`src/routes/api/public/integrations/*`)

Called by ServiceConnect. Each verifies `Authorization: Bearer <api_client_key>` against `api_clients.key_hash`, resolves org, enforces idempotency via `sync_history.idempotency_key`, writes audit + sync rows.

- `POST /api/public/integrations/customers` — upsert by external_id
- `POST /api/public/integrations/work-orders/completed` — creates draft invoice from completed WO payload (lines from services/parts, links `work_order_ref`), status=`draft`
- `POST /api/public/integrations/invoices` — direct invoice push (bypass WO path)
- `POST /api/public/integrations/payments` — record payment, optional apply-to-invoices array
- `POST /api/public/integrations/inventory-consumption` — records consumption; creates COGS journal on completion

Each returns `{ id, external_id, idempotency_key, audit_event_id }`. Duplicate idempotency_key returns the original response.

## 7. API key issuance

Server function `issueApiClientKey({ orgId, name })` (owner-only) generates a random token, stores `key_hash` (sha256), returns raw once. Managed via a lightweight admin route later — not built this phase; seed one key via a follow-up migration for the pilot org.

## 8. Reporting

Server functions returning JSON:
- `getTrialBalance(period)`
- `getBalanceSheet(asOf)`
- `getIncomeStatement(from,to)`
- `getARAging(asOf)`
- `getCustomerStatement(customerId, from, to)`

## 9. Out of scope this phase

- UI wiring — mocks remain
- Bank reconciliation, budgets, compensation, guardrails
- Multi-currency
- Tax engine beyond flat rate per line
- Approval workflows (`draft`→`posted` is a single call, permission-gated)

## Technical notes

- Money stored as `numeric(18,2)`.
- Every write inside a transaction with audit insert.
- RLS: `SELECT` allowed when `org_id ∈ org_members(user_id=auth.uid())`. Public routes use `supabaseAdmin` after bearer verification.
- Sync history is the source of truth for "did ServiceConnect already send this?".

## Deliverables

1. One migration establishing all tables + RLS + GRANTs + trigger + views.
2. `src/integrations/serviceconnect/verify.ts` — bearer + idempotency helpers.
3. Server functions per domain under `src/lib/accounting/*.functions.ts`.
4. Public integration routes under `src/routes/api/public/integrations/`.
5. `docs/production-handoff/serviceconnect-api.md` — endpoint contracts + example payloads.

No changes to existing UI, APEX, mocks, or auth pages.
