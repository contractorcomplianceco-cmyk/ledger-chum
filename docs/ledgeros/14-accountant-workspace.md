# 14 · Accountant Workspace (Phase 3 UI)

Status: **in demo** — minimum accountant-facing UI that visualises the ServiceConnect → LedgerOS financial workflow. Backend for these flows was completed in Phase 2A/2B.

## Purpose

Give an accountant a single place to:

1. See every operational event that touched the ledger (or tried to).
2. Approve draft invoices generated from ServiceConnect work orders.
3. Confirm the account mappings that route those events.
4. Confirm the integration surface is healthy.

The goal is a client demo where a completed ServiceConnect job visibly becomes an accounting transaction.

## Screens

| Route                        | Screen                                | Backing data                                                                                                            |
| ---------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/dashboards/accounting`     | Financial Dashboard                   | Work orders (24h), draft invoices, posted invoices, payments, inventory consumption, sync exceptions, connected systems |
| `/integrations`              | Integration Inbox — Activity + Health | `audit_events`, `sync_history`, per-integration counters                                                                |
| `/invoices/review`           | Draft Invoice Review                  | Draft `invoices` sourced from ServiceConnect, mapped line accounts, journal preview                                     |
| `/settings/account-mappings` | Account Mapping UI                    | `account_mappings` (per-org, per-purpose)                                                                               |

## Workflow

```
ServiceConnect Work Order
        ↓
Supervisor Approval (ServiceConnect)
        ↓
POST /api/public/integrations/work-orders.completed
        ↓
LedgerOS creates Draft Invoice
        ↓
Accountant reviews at /invoices/review
        ↓
Post Invoice
        ↓
record_payment_with_posting / post_invoice_journal
        ↓
Balanced Journal Entry (AR debit / Revenue credit)
        ↓
Reporting reflects change
```

The **draft review screen** enforces the accounting invariants visually:

- Line items must resolve to a mapped account (Labor Revenue, Material Revenue, etc.).
- Journal preview shows DR/CR balance before posting.
- Post button is only enabled while the draft is in state `draft`.
- Reject and Request Changes are recorded as audit events and (in production) trigger a webhook back to ServiceConnect.

## Actions available on a draft

| Action          | Effect (production)                                                                                                           | Guardrails                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Post invoice    | Calls `postInvoice` server fn → creates balanced journal, sets invoice `status = 'sent'`, writes `invoice.posted` audit event | Balanced-journal trigger, open fiscal period, mapped accounts required |
| Reject          | Sets local status to `rejected`, writes `invoice.rejected` audit event, no ledger effect                                      | Draft-only                                                             |
| Request changes | Records reviewer note, emits event for ServiceConnect to reopen the WO                                                        | Draft-only                                                             |

Accounting posting rules are **never** bypassed by this UI. It is a thin layer over the Phase 2 posting engine — every mutation goes through the same server functions and RPCs that the integration endpoints use.

## Permissions (target for Phase 3 wire-up)

| Role         | View dashboard | Review drafts | Post invoice | Edit mappings | View sync errors |
| ------------ | -------------- | ------------- | ------------ | ------------- | ---------------- |
| `owner`      | ✓              | ✓             | ✓            | ✓             | ✓                |
| `accountant` | ✓              | ✓             | ✓            | ✓             | ✓                |
| `reviewer`   | ✓              | ✓             | Only own org | —             | ✓                |
| `member`     | Limited        | —             | —            | —             | —                |

Enforcement lives in the existing `has_role(user, org, role)` SQL function and RLS policies from Phase 1. The UI only hides destructive controls when the role check fails; it does not gate posting.

## ServiceConnect interaction

Every card and row that references an external event carries:

- **Source** — always `ServiceConnect` in the demo, but the surface is source-agnostic.
- **External ID** — e.g. `WO-10001`, `INV-WO-10001`, `PMT-88213`.
- **Correlation ID** — surfaced from the audit event where present so an exception can be traced back to the originating request.

The Integration Inbox is intentionally read-only in this phase. Retry, dead-letter, and manual replay live behind the same RPCs used by the API endpoints, and will land in a follow-up phase alongside proper role-guarded server functions.

## Data source (Phase 3 demo)

Screens read from `src/lib/mock/accountant-workspace.ts` so the demo runs without a seeded pilot org. Shapes mirror the real Supabase schema so wire-up is a swap, not a rewrite:

- `IntegrationEvent` ↔ `audit_events` filtered to integration event types.
- `DraftInvoice` ↔ `invoices` join `invoice_lines` where `status = 'draft'`.
- `AccountMappingRow` ↔ `account_mappings` (Phase 2B).
- `ConnectedSystem` ↔ `api_clients` + rolling stats from `audit_events` / `sync_history`.

## Not in this phase

- Accounts Payable
- Banking feed / reconciliation
- Tax filings
- Payroll
- Retry / replay controls on the inbox
- Full CRUD on `account_mappings` (edit is currently a stub)

These remain in the roadmap and will build on the same accountant workspace shell.
