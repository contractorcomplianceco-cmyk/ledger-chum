## Status

Phase 6 impact assessment expanded to cover owner activity, legal, tax,
payroll/ADP, workforce, events/travel/education, appreciation, promos,
charity, international workforce, consulting/R&D, multi-entity/consolidation,
check writing, invoice templating, AI invoice drafts, and billing
recommendations. See `docs/production-handoff/phase-6-impact-assessment.md`.

Implementation is **paused** pending confirmation of items 1–5 in §15 of that
document. No UI or API changes beyond Sub-phase 6A (already shipped) until
sign-off.

## Scope

Phase 6 is enormous — a full typed API abstraction, four full UI workstreams (Commissions, Admin, Integrations, Intelligence AI), and 16 handoff spec documents. Delivering all of it in a single turn would produce shallow screens and rushed docs. I'll ship it in **four sub-phases**, each self-contained and reviewable, matching the ordering you gave.

Constraints honored across every sub-phase:
- No Lovable Cloud, no Supabase, no auth changes, no real backend
- Mock adapter only; Express adapter compiles as a typed placeholder
- Every mutation shows the "UI demonstration only" notice
- Uses existing LedgerOS design system, `AppShell`, `PageHeader`, tabbed layout pattern
- Fictional mock data only — no real compensation, credentials, or client financial data

---

## Sub-phase 6A — Typed API architecture (build now, this turn)

Foundation everything else plugs into.

**Files**
- `src/lib/api/config.ts` — reads `VITE_LEDGEROS_API_BASE_URL`, `VITE_LEDGEROS_API_MODE`, `VITE_LEDGEROS_USE_CREDENTIALS`
- `src/lib/api/errors.ts` — `ApiError`, normalized 401/403/404/409/422/500 shapes, `PermissionDeniedError`, `ValidationError`
- `src/lib/api/types.ts` — shared domain types (Money, Role, Permission, AuditEvent, Paginated<T>)
- `src/lib/api/client.ts` — `apiClient` singleton, adapter selector, demo-mode banner hook
- `src/lib/api/adapters/mock-adapter.ts` — mock adapter interface
- `src/lib/api/adapters/express-adapter.ts` — typed placeholder using `fetch` with `credentials: "include"`, base URL from env, JSON handling, error normalization; throws `NotConfiguredError` when base URL missing
- `src/lib/api/services/commissions.ts` — service interface + mock impl
- `src/lib/api/services/admin.ts` — same shape
- `src/lib/api/services/integrations.ts` — same shape
- `src/lib/api/services/intelligence.ts` — same shape
- `src/hooks/use-permission.ts` — permission-gated UI hook against mock current-user
- `.env.example` — documented variables

**Deliverables:** typed adapter interface, mock adapter wired to existing `src/lib/mock/*` data, Express adapter compiles, permission hook, demo-notice utility.

---

## Sub-phase 6B — Commission Management (next turn)

**Routes:** `/commissions`, `/commissions/plans`, `/commissions/plans/new`, `/commissions/plans/$id`, `/commissions/calculator`, `/commissions/calculations`, `/commissions/calculations/$id`, `/commissions/attribution`, `/commissions/approvals`, `/commissions/payables`, `/commissions/statements`, `/commissions/clawbacks`, `/commissions/audit`

- Commissions nav group
- Dashboard with lifecycle KPIs, participant/plan/service breakdowns, approvals, exceptions
- Plan builder covering all 14 plan types, calculation preview, pass-through exclusion
- Calculator with worked example (5000 → 3300 → 330)
- Attribution editor with 100% total validation
- Lifecycle badge component (Projected → Paid → Reversed → Closed)
- Loading, empty, error, restricted states
- `src/lib/mock/commissions.ts`, `src/components/commissions/*`

---

## Sub-phase 6C — Admin & Users + Integrations (turn after 6B)

**Admin routes:** `/admin/users` (already stub), `/admin/users/new`, `/admin/users/$id`, `/admin/roles`, `/admin/roles/$id`, `/admin/permissions`, `/admin/sessions`, `/admin/security-events`, `/admin/login-history`, `/admin/service-accounts`, `/admin/audit`

**Integration routes:** `/integrations/directory`, `/integrations/$id`, `/integrations/mappings`, `/integrations/events`, `/integrations/sync-runs`, `/integrations/dead-letter`, `/integrations/credentials`, `/integrations/health`, `/integrations/contracts`

- User list, detail tabs, invite/suspend/deactivate flows with confirmation + reason
- Role permission matrix (grouped) with inherited-vs-custom, sensitive-scope indicators
- Approval limits editor
- Integration directory with all listed connectors, credential-safe display
- Mapping builder with sample payload → transformed result preview
- Event inbox covering all listed event types, dead-letter queue with retry
- `src/lib/mock/admin.ts`, `src/lib/mock/integrations.ts`, components

---

## Sub-phase 6D — Intelligence AI + spec documents (final turn)

**Intelligence AI routes:** `/intelligence/ask`, `/intelligence/brief`, `/intelligence/recommendations` (upgrade existing), `/intelligence/recommendations/$id`, `/intelligence/evidence`, `/intelligence/history`, `/intelligence/feedback`, `/intelligence/policies`, `/intelligence/audit`

- Ask surface with suggested questions and structured demonstration response (answer, scope, evidence, confidence, freshness, assumptions, missing data, recommended action, approval)
- Reusable evidence drawer used across all AI screens
- Recommendation lifecycle states + owner + approval
- AI policy screen enumerating permitted/prohibited actions
- `src/lib/mock/intelligence-ai.ts` (separate from existing `intelligence.ts` financial-intelligence mock)

**Spec documents** in `docs/production-handoff/`:
1. commission-schema.md
2. commission-api-contract.md
3. commission-calculation-rules.md
4. admin-user-schema.md
5. admin-api-contract.md
6. permission-matrix.md
7. integration-framework.md
8. integration-event-contracts.md
9. ai-architecture.md
10. ai-api-contract.md
11. ai-security-policy.md
12. audit-event-catalog.md
13. backend-endpoint-backlog.md
14. database-change-backlog.md
15. acceptance-test-matrix.md
16. production-handoff.md

Each API contract entry includes method, path, permission, request/response schema, validation, error map, idempotency, audit event, posting behavior, approval requirement.

---

## Technical details

- Adapter selection at module load reads `import.meta.env.VITE_LEDGEROS_API_MODE`; defaults to `"mock"`
- Mock adapter simulates ~150ms latency and returns `{ data, meta }` envelopes matching the Express contract
- Express adapter's `fetch` wrapper: `credentials: "include"`, `Accept: application/json`, JSON body serialization, response status → typed error class, correlation-id header pass-through
- Every service method typed as `(input) => Promise<Result>`; UI calls services, never adapters directly
- Permission gating: `usePermission("commissions.approve")` returns `{ allowed, reason }`; restricted screens render `<RestrictedState/>`
- No route or component from Phase 2A/2B/3/4/5 is removed or renamed

## Confirm before I proceed

1. OK to ship this in **four sub-phases** (6A adapter → 6B commissions → 6C admin+integrations → 6D AI+docs), one per turn? Alternative: single monolithic turn that will be shallower on every workstream.
2. Should the existing `/intelligence/recommendations` (Phase 3 executive recommendations) stay where it is and the new **Ask/AI** surface live under a new `/intelligence-ai/*` prefix instead — to avoid collision with the current financial-intelligence tab bar?
3. For the mock adapter, keep the current `src/lib/mock/*.ts` files as-is and have services import from them, or migrate mock data into `src/lib/api/adapters/mock-adapter.ts`? I recommend keeping the existing files (less churn, preserves Phase 2–5 screens).
