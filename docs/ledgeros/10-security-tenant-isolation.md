# LedgerOS Security & Tenant Isolation Plan

**Version:** 1.0

## 1. Threat Model (summary)

- **Cross-tenant read/write** via forged `org_id` in payloads or query
  parameters.
- **Credential compromise** of an operational-system API key.
- **Replay attacks** on integration endpoints.
- **Privilege escalation** via role tampering.
- **Insider misuse** — an accountant modifying posted history.
- **Data exfiltration** through overly permissive `anon` policies.

Each is addressed below.

## 2. Tenant Isolation

- All financial tables carry `org_id`. All RLS policies scope through
  `is_org_member(org_id)` or `has_role(user, org, role)`.
- The Supabase browser client is the ONLY client used from UI code; it
  enforces RLS as the signed-in user.
- Public integration handlers resolve `org_id` from the API key. The payload
  `org_id` (if present) is ignored.
- `supabaseAdmin` (service role, bypasses RLS) is loaded lazily inside
  verified handlers only. It is not importable from route or component
  files at module scope.
- `GRANT` audit: every public-schema table has explicit grants aligned with
  its policies. Tables with no `anon` policy have no `anon` grants.

## 3. Authentication

- **End users**: Supabase Auth (email/password + Google by default). Google
  provider configured via `configure_social_auth` in the same change that
  introduces it.
- **Operational systems**: opaque API tokens. Only SHA-256 hashes stored
  (`api_clients.key_hash`). Raw token returned exactly once on issuance.
- Server functions requiring auth use `requireSupabaseAuth` middleware. The
  registered `functionMiddleware` in `src/start.ts` attaches the caller's
  bearer token on every RPC.
- Auth-required routes live under `src/routes/_authenticated/`. Public
  routes never gate to `/auth` from a top-level SSR route.

## 4. Authorization

- Role checks via `has_role(user, org, role)` security-definer function.
- Server functions performing sensitive operations (post journal, void
  invoice, close period, issue API key) verify the caller's role explicitly
  before touching `supabaseAdmin` — never rely on RLS alone for
  authorization on admin actions.
- Role matrix documented in `06-accounting-workflows.md`.

## 5. Idempotency & Replay Defense

- `Idempotency-Key` REQUIRED on every mutating public request.
- Unique index `(org_id, idempotency_key)` prevents replay from creating
  duplicate rows.
- Duplicate accepted keys replay the original response verbatim.
- Failed attempts stored under suffixed keys so retries with the original
  key remain valid.

## 6. Immutability & Audit

- Posted journal entries and lines are append-only. Enforced by convention
  in `postJournal`; a future policy will physically forbid `UPDATE`/`DELETE`
  on posted rows for non-service_role.
- Every mutation writes exactly one `audit_event` with before/after
  snapshots and a `correlation_id`.
- `audit_events` and `sync_history` are readable by `accounting_lead`,
  `accountant`, `systems_reviewer`. `team_member` cannot read either.

## 7. Secret Management

- Secrets live only in Lovable Cloud secret storage; never in code or the
  repo `.env`.
- Required secrets today: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `LOVABLE_API_KEY`.
- Server-only reads of `process.env.*` occur inside handler bodies, never at
  module scope in shared files.
- Client-side reads are `import.meta.env.VITE_*` only.

## 8. Transport & Storage

- HTTPS enforced by the platform.
- Money stored as `numeric(18,2)`; no floats in financial columns.
- Sensitive PII (customer email, phone, address) treated per RLS; not
  logged in `sync_history.request` beyond what the operational system sent.

## 9. Data Retention

- `audit_events` and `sync_history`: retained indefinitely for financial
  reconstruction.
- Draft/void invoices retained; posted history is never deleted.
- Deactivated `api_clients` retained for forensic lookup.
- Deleted users: `user_roles`/`org_members` cascade-cleaned; audit rows keep
  the historical `actor_id` string.

## 10. Backup & Recovery

- Supabase point-in-time recovery covers Postgres.
- Migration files under `supabase/migrations/` are the source of truth for
  schema; every DB change ships through the migration tool.
- Restore drills verified per Phase-1 exit criteria.

## 11. Monitoring & Alerting

- Systems-reviewer queue built from `sync_history.status = 'error'` and
  reconciliation discrepancies.
- Failed authentication attempts against `/api/public/integrations/*` are
  logged with client fingerprint (IP, correlation_id); repeated failures
  trigger admin alert.

## 12. Prohibited Patterns

- No hardcoded credentials.
- No `SELECT *` returned to callers on tables containing PII beyond what
  the caller owns.
- No `supabaseAdmin` calls from UI code.
- No `org_id` accepted from external payload.
- No mutation of posted GL rows.
- No role storage on profile/customer tables.
- No skipping of `audit_events` writes.
- No sync-history rows without `idempotency_key`.

## 13. Compliance Anchors (informational)

LedgerOS's audit trail, immutability rules, and role separation are the
substrate for future SOC 2 / SOX-style controls. This document is the
security baseline they build on; a dedicated compliance plan will layer on
top when a customer requires it.
