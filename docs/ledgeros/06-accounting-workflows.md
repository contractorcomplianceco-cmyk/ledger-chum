# LedgerOS Accounting Workflow Maps

**Version:** 1.0
**Scope:** The canonical happy-path and correction flows for each accounting
process. Each map lists trigger, actors, LedgerOS actions, GL impact, and
audit trail.

## 1. Invoice Lifecycle

```text
[SC WO completed] --> draft invoice
                        |
                        v
              Accountant reviews
                        |
             +----------+----------+
             |                     |
        edit lines            post invoice
             |                     |
             v                     v
           draft                sent (AR journal posted)
                                   |
                                   v
                        Payment received (POST /payments)
                                   |
                    +--------------+--------------+
                    |                             |
              partial payment                full payment
                    |                             |
                    v                             v
                 partial                        paid
```

- **Draft → Sent**: server function `postInvoice(invoiceId)`. Requires
  accountant+ role. Journals: `DR AR / CR Revenue / CR Sales Tax Payable`.
- **Void**: `voidInvoice(invoiceId, reason)`. Only allowed pre-payment. Posts
  reversing journal, sets status `void`.
- **Credit memo**: separate flow, links to invoice via
  `credit.source_type='credit_memo'`.

## 2. Payment & Application

```text
POST /payments   ->   payment row created (unapplied_amount = amount)
                         |
                         v
               apply_to[]? yes -> for each: check invoice balance,
                                  insert payment_application,
                                  decrement unapplied_amount,
                                  advance invoice status
                         |
                         v
              Journal: DR Undeposited/Bank / CR AR (per application)
                         |
                         v
               audit + sync_history row
```

Unapplied remainder stays as customer credit on that payment; can be applied
later via `applyPayment(paymentId, invoiceId, amount)`.

## 3. Refunds

- Only against a `payment` with `unapplied_amount > 0` OR a fully-applied
  payment where the accountant reverses applications first.
- Journal: `DR AR (or Cash Refund clearing) / CR Bank`.
- Emits `refund` row + audit event.

## 4. Credit Memos

- Issued by accountant (`issueCreditMemo`).
- Journal: `DR Revenue (or Adjustment) / CR AR`.
- `credit.unapplied_amount` decrements as it's applied to future invoices.

## 5. Vendor Bill Lifecycle

```text
Bill entered (manual or /bills API) -> draft
                                          |
                                          v
                                    post bill
                                          |
                              DR Expense/COGS / CR AP
                                          |
                                          v
                              schedule vendor payment
                                          |
                                DR AP / CR Bank
```

## 6. Bank Reconciliation

```text
Import bank feed (or CSV) -> bank_transaction rows
                                 |
                                 v
                    Matching Framework proposes matches
                     against payments, deposits, bills
                                 |
                                 v
                    Reviewer confirms / adjusts
                                 |
                                 v
                    reconciliation.status = complete
                    cleared_balance frozen
```

Unmatched transactions surface in the reviewer queue; posting a new journal
directly against a bank transaction is allowed only after the transaction is
marked "no match".

## 7. Period Close

1. `openPeriod` (auto at fiscal year start).
2. Daily posting.
3. `beginClose(period)` — status becomes `closing`. New posts rejected.
4. Trial balance reviewed; corrections posted (a temporary re-open is
   allowed, audited).
5. `closePeriod(period)` — status `closed`. Only reversing entries into a
   later open period may affect closed-period balances afterward.

## 8. Correction Model

- Posted rows are never mutated in place.
- Accountant issues a **reversing journal**, then a **new correct journal**.
- Both are linked to the original via `source_id`.
- Audit trail preserves the full history.

## 9. Role Matrix (accounting actions)

| Action                | Owner | AcctLead | Acct | SysReview | Member | IntegrationSvc |
| --------------------- | :---: | :------: | :--: | :-------: | :----: | :------------: |
| View reports          |   ✓   |    ✓     |  ✓   |     ✓     |   —    |       —        |
| Draft invoice         |   ✓   |    ✓     |  ✓   |     —     |   —    |       ✓        |
| Post invoice          |   ✓   |    ✓     |  ✓   |     —     |   —    |       —        |
| Void invoice          |   ✓   |    ✓     |  —   |     —     |   —    |       —        |
| Record payment        |   ✓   |    ✓     |  ✓   |     —     |   —    |       ✓        |
| Refund                |   ✓   |    ✓     |  —   |     —     |   —    |       —        |
| Credit memo           |   ✓   |    ✓     |  ✓   |     —     |   —    |       —        |
| Post journal (manual) |   ✓   |    ✓     |  ✓   |     —     |   —    |       —        |
| Close period          |   ✓   |    ✓     |  —   |     —     |   —    |       —        |
| Reconcile bank        |   ✓   |    ✓     |  ✓   |     —     |   —    |       —        |
| Manage users/roles    |   ✓   |    —     |  —   |     —     |   —    |       —        |
| Issue API keys        |   ✓   |    —     |  —   |     —     |   —    |       —        |
| View sync history     |   ✓   |    ✓     |  ✓   |     ✓     |   —    |       —        |
