# Ledger × ServiceConnect Integration Audit

**Prepared for:** Rose OS / Command Center leadership
**Subject application:** LedgerOS (this repository — "Ledger")
**Target host application:** ServiceConnect
**Question under review:**

> Should Ledger become
> **(A)** an embedded accounting module inside ServiceConnect,
> **(B)** a separate financial engine connected by API, or
> **(C)** a shared CCA financial platform used by multiple applications?

**Short answer up front:** **Option C — Shared CCA Financial Platform**, delivered _through_ an API contract that ServiceConnect (and later Tara OS, QualifierConnect, Command Center) consumes. Option B is the correct interim state; Option A is not recommended.

**Critical framing:** Ledger today is a **UI Design Lab**. Every service, table, chart of accounts, and journal is mock data (`src/lib/mock/*`, `src/lib/api/services/*` returning `mockGet` / `mockMutation`). No database, no server functions, no authentication, no posting engine exists yet. This audit distinguishes _what is designed_ from _what is built_.

Classification per Rose OS record standard: **Recommendation** (not a Confirmed Company Decision).

---

## 1. Architecture Audit

| Layer                | Current state                                                                                                                                                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend framework   | TanStack Start v1 + React 19 + Vite 7 + TypeScript (strict)                                                                                                                                                                                                                            |
| UI system            | Tailwind v4, shadcn/ui, Radix primitives, Recharts, Lucide                                                                                                                                                                                                                             |
| Routing              | File-based under `src/routes/` (~180 route files), auto-generated `routeTree.gen.ts`                                                                                                                                                                                                   |
| State / data         | TanStack Query wired; all queries currently resolve mock adapters                                                                                                                                                                                                                      |
| Backend framework    | **None.** No server functions authored, no `src/routes/api/*`. Target runtime is Cloudflare Workers (workerd) via TanStack Start                                                                                                                                                       |
| Database             | **None.** No Supabase, no Postgres, no migrations                                                                                                                                                                                                                                      |
| Authentication       | **None.** No auth middleware, no user table, no session                                                                                                                                                                                                                                |
| Hosting              | Lovable preview + Cloudflare Workers (edge) via TanStack Start build                                                                                                                                                                                                                   |
| API architecture     | Central client `src/lib/api/client.ts` selects `mock` vs `production` adapter by `VITE_LEDGEROS_API_MODE`. Production adapter is an **Express HTTP client scaffold only** (`src/lib/api/adapters/express-adapter.ts`) — cookie-based `credentials: "include"`, no real endpoints wired |
| Environment config   | `VITE_LEDGEROS_API_MODE`, `VITE_LEDGEROS_API_BASE_URL`, `VITE_LEDGEROS_USE_CREDENTIALS`                                                                                                                                                                                                |
| Deployment model     | Static-plus-edge SSR; no persistent storage in-repo                                                                                                                                                                                                                                    |
| Data ownership model | **Undefined in code.** Docs assume a future single-tenant Postgres owned by Rose/CCA finance                                                                                                                                                                                           |

**Verdict:** Ledger is a **presentation-tier prototype** with an **API contract shape** (typed services in `src/lib/api/services/*`) but **no backend of its own**. This is decisive for the integration question below.

---

## 2. Accounting Capability Audit

Legend: **Designed** = UI + typed service exists against mocks. **Built** = real posting/persistence exists. **Missing** = neither.

### Core accounting

| Capability              | Status                      | Evidence                                                                                                |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------- |
| Chart of Accounts       | Designed (placeholder page) | `src/routes/ledger.accounts.tsx` renders `<ComingSoon phase="Phase 4">`                                 |
| General Ledger          | Designed (placeholder)      | `src/routes/ledger.general.tsx` — ComingSoon                                                            |
| Double-entry accounting | **Missing**                 | No debit/credit model in code; only display strings like `"1200 - Accounts Receivable"` in `finance.ts` |
| Journal Entries         | Designed (placeholder)      | `src/routes/ledger.journals.tsx` — ComingSoon                                                           |
| Account balances        | Designed (KPI mocks)        | `KPIS`, `FIN_OVERVIEW` in `src/lib/mock/finance.ts`                                                     |
| Fiscal periods          | Designed                    | `src/routes/close.tsx`; period-close referenced in `missing-backend-capabilities.md` §4                 |
| Period close            | Designed                    | Close route exists; enforcement is a listed backend gap                                                 |
| Audit trail             | Designed                    | `AuditEvent` types in `admin.ts`; write path listed as missing (§3 of missing-backend doc)              |

### Accounts Receivable

| Capability             | Status                 | Evidence                                                                   |
| ---------------------- | ---------------------- | -------------------------------------------------------------------------- |
| Customers              | Designed (rich mock)   | `src/routes/customers.*`, `Customer` type in `invoicing.ts`                |
| Invoices               | Designed (rich mock)   | `src/routes/invoices.*`, `InvoiceLine` w/ treatment, margin, tax           |
| Payments               | Designed (placeholder) | `src/routes/payments.tsx` — ComingSoon                                     |
| Credits / credit notes | Designed               | `src/routes/invoices.credit-notes.tsx`                                     |
| Refunds                | Designed               | Invoice status includes `refunded`                                         |
| Aging                  | Designed               | Customer summary components                                                |
| Collections            | Designed               | `src/routes/automation.collections.tsx`, `automation.revenue-recovery.tsx` |

### Accounts Payable

| Capability      | Status                                                             |
| --------------- | ------------------------------------------------------------------ |
| Vendors         | Designed — `src/routes/vendors.tsx`, `expenses.vendors.tsx`        |
| Bills           | Designed — `src/routes/bills.tsx`                                  |
| Expenses        | Rich UI — `src/routes/expenses.*` (~15 routes)                     |
| Vendor payments | Designed — `automation.payables.tsx`, compensation payment batches |

### Banking

| Capability     | Status                                                                   |
| -------------- | ------------------------------------------------------------------------ |
| Bank accounts  | Designed — `BANK_ACCOUNTS` in `src/lib/mock/banking.ts`                  |
| Transactions   | Designed — `TRANSACTIONS` mock with 14 fictional rows                    |
| Deposits       | Designed                                                                 |
| Transfers      | Designed                                                                 |
| Reconciliation | Designed — `src/routes/banking.reconciliation.tsx`, `RECON_HISTORY` mock |

Import model is **CSV / manual entry** (see `ConnectionState` in `banking.ts`); no live bank feed. Navy Federal is listed as V1-critical in `integration-dependency-register.md`.

### Reporting

| Report        | Status                                                 |
| ------------- | ------------------------------------------------------ |
| Profit & Loss | Charted from mocks (`FIN_OVERVIEW`)                    |
| Balance Sheet | **Missing**                                            |
| Cash Flow     | Donut mock only (`CASH_FLOW` in `finance.ts`)          |
| Trial Balance | **Missing**                                            |
| Tax reports   | **Missing**                                            |
| Job costing   | **Missing** (Ledger has no Job / Work Order primitive) |

### Non-standard capabilities Ledger _does_ design richly

- **Compensation engine** — ~30 routes covering plans, calculations, statements, payables, clawbacks, holdbacks, reserves (`src/lib/api/services/compensation/*`). This is well beyond typical accounting.
- **Cash Availability** — treatment-tagged cash (Operating / Reserved / Restricted), guardrails, allocations.
- **Intelligence layer** — leakage, attribution, forecasting, app-value scoring (~15 routes).
- **APEX Executive layer** — Opportunity Engine, Financial DNA, Timeline, Relationship Graph, Digital Twin, six role workspaces, nine AI personas with governance contract.

---

## 3. Database Audit

**Physical database:** none in repo. No migrations, no schema, no ORM.

**Logical (typed) model** — reverse-engineered from `src/lib/api/services/*` and `src/lib/mock/*`:

| Primary entity                                                                                     | Where defined                                                    |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Account (chart-of-accounts row)                                                                    | Referenced by code/name only                                     |
| Journal / JournalLine                                                                              | Referenced conceptually; no type                                 |
| BankAccount, Tx, ReconciliationStatus                                                              | `src/lib/mock/banking.ts`                                        |
| Customer, Invoice, InvoiceLine, Payment                                                            | `src/lib/mock/invoicing.ts`, `src/lib/api/services/*`            |
| Vendor, Bill, Expense, Receipt                                                                     | `src/lib/mock/expenses.ts`                                       |
| Participant, CommissionPlan, CommissionCalculation, Statement, Payable, PaymentBatch, Disbursement | `src/lib/api/services/commissions.ts`, `services/compensation/*` |
| CashAllocation, Reserve, Treatment                                                                 | `src/lib/mock/cash-availability.ts`                              |
| AuditEvent, User, Role, Permission                                                                 | `src/lib/api/services/admin.ts`                                  |
| IntegrationCredential                                                                              | `src/lib/api/services/integrations.ts`                           |

**Accounting transaction model:** designed as **posted journal with double-entry lines and Treatment tag on each line** (per `missing-backend-capabilities.md` §1). Not implemented.

**Posting engine:** does not exist. Docs mandate **draft-vs-post separation** (§8) — no automation may post without human approval.

**Audit fields:** designed contract — `actor, target_type, target_id, before, after, correlationId`. Not wired.

**Tenant / company structure:** **not modeled.** Repository assumes single-tenant Rose/CCA finance. This is the largest architectural gap for a shared-platform play.

**Entities ServiceConnect can map to today** (design-only): `Customer`, `Invoice`, `InvoiceLine`, `Payment`, `Vendor`, `Bill`, `Expense`, `BankAccount`, `Tx`, `Participant` (for tech commissions), and — once modeled — `Journal` + `JournalLine`.

---

## 4. ServiceConnect → Ledger Mapping

| ServiceConnect           | Ledger target                                                                              | Match quality         | Adapter / migration work                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customer                 | `Customer` (`invoicing.ts`)                                                                | **Direct**            | Add external-id field (`serviceconnect_customer_id`), merge/dedupe rules, address & tax profile normalization                                                                                        |
| Location (customer site) | **Missing in Ledger**                                                                      | Gap                   | Add `CustomerLocation` entity (nullable parent = Customer). Needed for job costing and multi-site tax jurisdictions                                                                                  |
| Work Order               | **Missing in Ledger** as a first-class entity; closest is `project` field on invoice lines | Gap                   | Add `Job` / `WorkOrder` entity keyed to ServiceConnect. Becomes the cost-object for job costing                                                                                                      |
| Technician               | `Participant` (compensation)                                                               | **Direct (semantic)** | Map SC technician → Ledger participant for commission attribution                                                                                                                                    |
| Labor                    | Bill line / Expense / Payroll accrual                                                      | Adapter               | Post as journal: DR Labor COGS / CR Accrued Payroll (or CR Bank if paid). Requires job reference                                                                                                     |
| Materials                | Expense / Bill line / Inventory issue                                                      | Adapter               | If inventory tracked in SC, post as issue: DR Job COGS / CR Inventory Asset                                                                                                                          |
| Inventory Usage          | **Missing**                                                                                | Gap                   | Ledger has no inventory sub-ledger. Either (a) keep authoritative inventory in SC and post consumption only, or (b) build inventory sub-ledger in Ledger. Recommend (a)                              |
| Invoice                  | `Invoice` + `InvoiceLine`                                                                  | **Direct**            | Line-level `treatment`, `commissionOwner`, `project`, `jurisdiction` fields already exist. Add `source_system` and `source_id`. Post: DR AR / CR Revenue (+ Tax Payable, deferred rev per treatment) |
| Payment                  | `Payment`                                                                                  | **Direct**            | Post: DR Cash / CR AR. Support partial, refund, chargeback                                                                                                                                           |

**Direct matches:** Customer, Invoice, Payment, Technician→Participant.
**Adapters required:** Labor, Materials postings; tax jurisdiction handling; commission attribution from WO → Participant.
**Missing fields to add to Ledger:** `Location`, `WorkOrder/Job`, `InventoryConsumption`, plus universal `source_system` + `source_id` + `source_updated_at` on every entity.
**Migration needs:** none for now — no live data in Ledger.

---

## 5. API Audit

**Existing APIs in Ledger:** **zero HTTP endpoints implemented.**

- Typed service interfaces exist (`commissions`, `compensation`, `admin`, `integrations`, `intelligence`) with method-level contracts (`list*`, `get*`, `create*`, `approve*`, etc.).
- `express-adapter.ts` provides an `httpFetch` helper expecting a REST base URL; it throws `NotConfiguredError` until `VITE_LEDGEROS_API_BASE_URL` is set.
- No route file under `src/routes/api/`. No webhooks. No cron. No sync workers.
- Authentication: designed as cookie-session against an Express backend; not implemented.

**Can Ledger currently receive any of the following?** No — all would return mock data or `NotConfiguredError`:

| Event ServiceConnect would emit         | Ledger endpoint                                      | State                          |
| --------------------------------------- | ---------------------------------------------------- | ------------------------------ |
| `invoice.created`                       | `POST /invoices` (implied by `commissions.ts` types) | Not implemented                |
| `payment.received`                      | `POST /payments`                                     | Not implemented                |
| `work_order.completed`                  | `POST /jobs/:id/complete`                            | Entity + endpoint not designed |
| `inventory.consumed`                    | `POST /journals` (issue)                             | Not implemented                |
| `customer.created` / `customer.updated` | `POST/PUT /customers`                                | Not implemented                |

**What must be built to receive these:** a real backend (see §6).

---

## 6. Integration Design — Recommendation

### Recommendation: **Option C — Shared CCA Financial Platform**, exposed via a **stable API contract (Option B mechanics)**.

Ledger becomes the **single financial system of record** for the CCA product family (ServiceConnect, Tara OS, QualifierConnect, Command Center, future acquisitions). ServiceConnect calls Ledger over HTTP + webhooks and **owns the operational domain** (work orders, dispatch, inventory, technicians). Ledger **owns the ledger** (chart of accounts, journals, AR/AP, banking, close, statements, reporting, compensation).

### Why not Option A (merge)

- Ledger has **no backend to merge into** — a merge would be a rewrite of ServiceConnect's data model plus a greenfield build of Ledger's posting engine, in one step.
- ServiceConnect's operational cadence (work orders, dispatch) and Ledger's accounting cadence (period close, audit-locked postings) have **opposing invariants**. Coupling them freezes both roadmaps.
- Ledger's design already anticipates multiple upstream operational systems (`integration-dependency-register.md`: Zoho CRM/Forms/Books, Navy Federal, ADP, Command Center, QualifierConnect, Tara OS). Embedding it inside one of them collapses that model.

### Why not pure Option B (siloed API)

- If Ledger is only ServiceConnect's finance API, we duplicate it the moment Tara OS or QualifierConnect need books. That is the Zoho-per-app problem this project exists to solve.

### Why Option C

- **Reuse of the most expensive layer.** Posting engine, close, audit, compensation, cash treatment, guardrails, and reporting are built once.
- **Consistent financial reality.** Rose sees one P&L, one balance sheet, one cash position across all CCA properties.
- **Compatible with Ledger's designed intelligence layer** (Opportunity Engine, Financial DNA, Digital Twin) — those only pay off across the full portfolio.
- **Compatible with governance model already documented** (draft-vs-post, locked periods, approval workflows, `missing-backend-capabilities.md`).

### Advantages

- One chart of accounts, one close, one audit trail across CCA.
- Vendor-neutral operational apps: ServiceConnect stays focused on field ops.
- Rose OS financial intelligence has a single source to reason over.

### Risks

- **Multi-tenant / multi-source data model must be introduced now** (currently not modeled). Every entity needs `tenant_id`, `source_system`, `source_id`, `source_updated_at`.
- Latency: real-time reads for ServiceConnect billing UIs. Mitigation: read replicas / cached projections.
- Contract churn: an API used by multiple apps is harder to change. Mitigation: versioned endpoints from day one.
- Ledger has zero backend built — timeline risk is real (see §8).

### Timeline (planning-level, not committed)

See §8 phased roadmap. Roughly **4–7 months** to get ServiceConnect fully on Ledger; **9–12 months** for shared-platform maturity.

### Database impact

- Ledger backend must be created from scratch (Postgres + auth + audit + posting engine).
- ServiceConnect keeps its operational tables and adds `ledger_customer_id`, `ledger_invoice_id`, `ledger_payment_id`, `ledger_journal_id` foreign references.
- No destructive migration to ServiceConnect's existing data.

### User experience impact

- ServiceConnect UI keeps its billing/AR surfaces (do not double the surface area).
- Ledger UI is used by finance/accounting roles.
- Ledger accounting widgets can be **embedded into ServiceConnect via iframes or server-rendered fragments** if a unified look is needed later — but do not start there.

---

## 7. ServiceConnect Accounting Replacement Plan

**Present in ServiceConnect today (per prompt):** billing queue, invoices, payments, AR aging.

**Absent from ServiceConnect today:** GL, AP, banking, reconciliation, financial statements, tax, period close.

**How Ledger fills the gaps:**

| Gap                  | Ledger surface                                                     | Notes                                                                              |
| -------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| GL                   | `ledger.general.tsx`, `ledger.journals.tsx`, `ledger.accounts.tsx` | Requires posting engine build                                                      |
| AP                   | `bills.tsx`, `vendors.tsx`, `expenses.*`                           | Approval workflow via `automation.approvals`                                       |
| Banking              | `banking.*` routes, `BANK_ACCOUNTS`, `TRANSACTIONS`                | CSV import today; live feeds later                                                 |
| Reconciliation       | `banking.reconciliation.tsx`                                       | Ready-to-approve → reconciled state machine designed                               |
| Financial statements | Reports layer (P&L designed; BS/CF/TB pending)                     | Highest priority build after posting engine                                        |
| Tax                  | Missing                                                            | Add tax jurisdiction on invoice lines already present in type; needs tax registers |
| Period close         | `close.tsx`                                                        | Locked-period enforcement is a listed backend requirement                          |

**ServiceConnect's existing billing / AR / payment UIs:** keep them. They call Ledger APIs. Data moves _to_ Ledger for posting; results (invoice status, balance) flow back.

---

## 8. Implementation Roadmap

Each phase gates on the previous. Effort is order-of-magnitude only.

### Phase 1 — Read-only financial connection _(4–6 weeks)_

- Stand up Ledger backend skeleton: Postgres (Supabase or equivalent), auth, tenant model, audit log write path.
- Publish `GET /customers`, `GET /invoices`, `GET /payments`, `GET /balances` returning stub data mapped from ServiceConnect.
- ServiceConnect gets a read-only Ledger widget (AR snapshot, cash pulse).
- **No writes yet.**

### Phase 2 — Invoice synchronization _(4–6 weeks)_

- `POST /invoices` from ServiceConnect (draft → issued).
- Webhook `invoice.updated` back to ServiceConnect.
- Introduce `source_system` / `source_id` on every entity.
- Draft-vs-post separation live; invoice posts a journal only after approval or automation rule.

### Phase 3 — Payment synchronization _(3–5 weeks)_

- `POST /payments`, partial payments, refunds, chargebacks.
- Application to invoices with Treatment-aware cash allocation.
- Reconciliation pipeline against Navy Federal CSV import.

### Phase 4 — Inventory / job-cost integration _(6–8 weeks)_

- Introduce `Job` / `WorkOrder` entity in Ledger.
- `POST /jobs/:id/labor` and `POST /jobs/:id/materials` from ServiceConnect (inventory stays authoritative in SC).
- Job P&L, technician commission attribution wired to Ledger `Participant`.

### Phase 5 — Full accounting workflow _(8–10 weeks)_

- Chart of accounts editor, journal entry UI, AP workflow, bank reconciliation UI wired end-to-end.
- Period close with locked periods.
- Trial balance, balance sheet, cash flow statements, tax registers.

### Phase 6 — Rose OS financial intelligence _(ongoing)_

- Feed real posted data into Opportunity Engine, Financial DNA, Digital Twin, AI Personas.
- Cross-app portfolio views (ServiceConnect + Tara OS + QualifierConnect).

---

## Final Output

### 1. Architecture summary

TanStack Start + React frontend, mock adapters, no backend. Production adapter scaffold expects an Express + cookie-session REST API. Cloudflare Workers target runtime.

### 2. Accounting features currently built

**None end-to-end.** UI designs exist for CoA, GL, Journals, AR (customers/invoices), AP (bills/vendors/expenses), banking, reconciliation, close, plus a rich compensation & cash-treatment layer. All backed by fixtures.

### 3. Missing accounting features

Posting engine, double-entry model, tenant model, auth, audit write path, locked-period enforcement, balance sheet, trial balance, cash flow statement, tax registers, job costing, inventory sub-ledger, live bank feeds, webhook/cron infrastructure.

### 4. Database model summary

No database. Logical model in TypeScript covers accounts, journals, banking, AR, AP, expenses, cash allocations, compensation, admin/audit. Multi-tenant not modeled.

### 5. ServiceConnect integration opportunities

Direct semantic matches on Customer, Invoice, Payment, Technician→Participant. Adapters needed for Labor, Materials, Inventory Usage. New entities required: Location, WorkOrder/Job.

### 6. Recommended architecture

**Option C — Shared CCA Financial Platform**, delivered as a versioned HTTP API + webhooks. ServiceConnect (and later Tara OS, QualifierConnect, Command Center) call Ledger. Ledger owns books; operational apps own operations.

### 7. API requirements

Cookie-session auth (or service-to-service tokens for machine callers); versioned REST under `/v1/*`; webhooks for `invoice.*`, `payment.*`, `journal.posted`, `period.locked`; idempotency keys on all writes; `source_system` + `source_id` on every write; audit correlationId propagated end-to-end.

### 8. Migration complexity

**Ledger side:** greenfield backend build — high. **ServiceConnect side:** additive foreign keys and event emission — moderate. **User-facing:** low if ServiceConnect billing UIs remain the primary AR surface.

### 9. Timeline estimate

Read-only in ~1 month after backend skeleton exists. Invoice + payment sync in ~2 additional months. Job costing + full workflow in ~4–5 additional months. Shared-platform maturity ~9–12 months.

### 10. Exact next engineering task

> **Stand up the Ledger backend skeleton.**
> Enable Lovable Cloud, create the tenant + user/role tables and audit-log write path, publish read-only `GET /v1/customers`, `GET /v1/invoices`, `GET /v1/payments`, `GET /v1/balances` endpoints that return data from the existing typed contracts, and switch `express-adapter.ts` to hit them behind `VITE_LEDGEROS_API_MODE=production`. No posting engine yet — read path only. Everything in Phase 1 depends on this.

---

## Confirmations

- **No code was modified by this audit.**
- **No backend, Supabase, auth, or financial-logic changes were made.**
- **No secrets were requested or stored.**
- Classification: **Recommendation** — pending Rose approval before it becomes a Confirmed Company Decision.

### Recommended Company Record Updates

- **Decision Log** — capture Option C recommendation once approved.
- **Active Projects Tracker** — add "Ledger ↔ ServiceConnect integration (Phase 1: read-only)".
- **Build Registry** — add "Ledger backend skeleton" as the next build.
- **Integration Dependency Register** — add ServiceConnect as a V1 consumer of Ledger APIs.
- **Requirements Registry** — add multi-tenant / `source_system` / `source_id` requirements to Ledger entities.
