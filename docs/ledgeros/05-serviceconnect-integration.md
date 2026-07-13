# ServiceConnect ↔ LedgerOS Integration Contract

**Version:** 1.0
**Companion:** `docs/production-handoff/serviceconnect-api.md` documents the
existing Phase-1 wire contract. This file is the **conceptual** contract —
what each event means, who owns what, and the required lifecycle.

## 1. Ownership

- **ServiceConnect** owns: operational customer profile, locations, work
  orders, dispatch, technicians, labor capture, materials issued, service
  history, operational approvals.
- **LedgerOS** owns: financial customer record, invoices, AR, payments,
  credits, refunds, revenue posting, job cost postings, financial reporting.

If a field can be edited in both systems, the operational field is
ServiceConnect's; the financial field is LedgerOS's. They may differ (e.g.
customer display name vs billing name) without conflict.

## 2. Event Flow

```text
Work Order Created (SC)
        v
Technician Completes Work (SC)
        v
Supervisor Approval (SC)
        v
ServiceConnect emits financial events →  LedgerOS
   1. POST /customers           (upsert)
   2. POST /work-orders/completed  (draft invoice)
   3. POST /inventory-consumption (per item)
        v
Accountant reviews & posts invoice in LedgerOS
        v
Customer pays → SC records → POST /payments
        v
LedgerOS applies payment, closes AR, posts to bank/undeposited funds
```

Every step is idempotent; ServiceConnect may retry at any time with the
same `Idempotency-Key`.

## 3. Event Contracts

Wire-level JSON shapes and status codes live in
`docs/production-handoff/serviceconnect-api.md`. Conceptual notes:

### 3.1 Customer upsert

- Sent whenever a customer is created or edited in ServiceConnect.
- LedgerOS mirrors the operational profile onto its financial customer
  record. Billing address, terms, and status can be overridden
  ledger-side by an accountant; ServiceConnect does not overwrite fields
  flagged as "financial-owned" once set.

### 3.2 Work order completed

- Fires exactly once when supervisor approval flips the WO to
  `billing_ready`.
- Payload is the **billing package**: labor lines, materials, expenses,
  taxes, PO, terms, approved amount.
- LedgerOS creates a `draft` invoice referencing `work_order_ref`. Accountant
  reviews, adjusts, and posts. Draft invoices do NOT hit the GL.

### 3.3 Direct invoice push

- Escape hatch for invoices not tied to a WO (retainer, adjustment).
- Same shape as WO-completed minus `work_order_ref`.

### 3.4 Payment

- Represents money received by ServiceConnect (or reported to it).
- Optional `apply_to[]` array applies to specific invoices; unapplied amount
  becomes customer credit.
- LedgerOS posts the cash-receipt journal on record; application transitions
  invoice status.

### 3.5 Inventory consumption

- Per-item, per-WO event.
- Phase 1: records `total_cost` for reporting.
- Phase 2: posts COGS journal (`DR COGS / CR Inventory Asset`) once
  ServiceConnect confirms the account mapping per item category.

## 4. Reconciliation Between Systems

- Both sides store the `Idempotency-Key`. Either can ask "did the other
  process this?" using it.
- LedgerOS exposes (future) `GET /api/public/integrations/sync-status?key=...`
  returning the stored response.
- Daily reconciliation report compares:
  - Invoiced amount by `work_order_ref` in LedgerOS vs approved amount in
    ServiceConnect.
  - Payment sum per customer in LedgerOS vs ServiceConnect.
  - Discrepancies flow to a `SystemsReviewer` queue in LedgerOS.

## 5. Failure Modes

| Scenario                                       | Behavior |
| ---------------------------------------------- | -------- |
| Payment references unknown invoice             | `422 unknown_reference`; SC retries after sending the invoice. |
| Duplicate WO completion                        | Replayed response; LedgerOS does NOT create a second invoice. |
| Invoice posted in LedgerOS, then WO reopened   | LedgerOS refuses to void a posted invoice via API; accountant issues a credit memo manually. |
| Customer deleted in SC                         | LedgerOS soft-marks status=`inactive`; the financial record and history are retained. |
| SC sends invalid `account_code`                | LedgerOS falls back to the org's default revenue account and flags the line for review. |

## 6. Non-Contract

- ServiceConnect NEVER calls journal, chart-of-accounts, or reporting
  endpoints. Those are internal to LedgerOS.
- LedgerOS NEVER writes back operational fields (e.g. it does not update
  a WO's status). Financial state is read via LedgerOS APIs by SC when
  needed (future `GET /invoices/:external_id`).

## 7. Provisioning Checklist

1. Create `organization` for the client.
2. Create `api_client` row with hashed key (raw stored in SC secret store).
3. Confirm chart of accounts is seeded and default revenue/tax/AR accounts
   are flagged.
4. Confirm fiscal period is open.
5. Send a test customer + WO completion with a well-known idempotency key
   to verify end-to-end.
