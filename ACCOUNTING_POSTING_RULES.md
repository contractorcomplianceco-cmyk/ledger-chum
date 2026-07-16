# LedgerOS Accounting Posting Rules

**Status:** Phase 2A — Payment GL posting is live. Invoice posting live. Refund posting available (structural, not yet wired to an integration route).

All ledger writes are balanced double-entry, immutable once posted, and correlated with an `audit_events` row.

## 1. Invariants

- Every posted `journal_entries` row has `SUM(debit) = SUM(credit) > 0` (enforced by `enforce_balanced_journal` trigger).
- A posted journal entry may only transition to `void` (enforced by `tg_journal_entry_immutable`). No edits, no deletes.
- Lines of a posted journal cannot be inserted, updated, or deleted (enforced by `tg_journal_lines_immutable`).
- At most one active journal entry per `(org_id, source_type, source_id)` (unique partial index `journal_entries_unique_active_source`, where `status <> 'void'`).
- Postings are rejected when `entry_date` is outside an open `fiscal_periods` row for the org (enforced inside each posting function via `is_period_open`).
- All money is `numeric(18,2)`; no floats.

## 2. Invoice Posting

**Trigger:** `postInvoice({ id })` server function.
**Transition:** invoice `draft → sent`.

Journal entry (`source_type = 'invoice'`):

| Side   | Account                   | Amount        |
| ------ | ------------------------- | ------------- |
| Debit  | Accounts Receivable       | `total`       |
| Credit | Per-line revenue accounts | `line.amount` |

## 3. Payment Posting

**Trigger:** `POST /api/public/integrations/payments` → SQL function `record_payment_with_posting`. Atomic: creates payment, applications, updates invoice balances/status, creates a posted journal, writes audit.

**Account mapping** (`payment_account_mappings`):

- Lookup key: `(org_id, method)`; falls back to `(org_id, 'default')`; then to the first asset account matching `%bank%` or `%cash%`.
- Examples the customer configures:
  - `ach` → `1010 Bank Operating`
  - `check` → `1010 Bank Operating`
  - `credit_card` → `1020 Merchant Clearing`
  - `default` → `1010 Bank Operating`

Journal entry (`source_type = 'payment'`), for the **full payment amount**:

| Side   | Account                              | Amount   |
| ------ | ------------------------------------ | -------- |
| Debit  | Cash / Bank / Clearing (via mapping) | `amount` |
| Credit | Accounts Receivable                  | `amount` |

**Application handling:**

- The journal always debits Cash and credits AR for the full received amount. Unapplied cash is tracked on `payments.unapplied_amount` and remains a credit balance in the customer's AR sub-ledger until later applied.
- Invoice `balance` and `status` are updated per application:
  - `balance = 0` → `paid`
  - `0 < balance < total` → `partial`
  - `balance = total` → `sent` (unchanged)
- Overpayment: `apply_to` sum must be ≤ payment amount; the excess is `unapplied_amount`.
- Underpayment / partial: works the same; the invoice moves to `partial`.

**Duplicate protection:**

- Unique `(org_id, external_source, external_id)` on `payments` — a repeated push with the same external id fails with `23505` and the route returns HTTP 409.
- Unique active `(org_id, source_type, source_id)` on `journal_entries` — even if the payment row could be re-created, a second posted journal against the same payment is impossible.
- `Idempotency-Key` on the integration route short-circuits before any DB write, replaying the original response.

## 4. Refund Posting

**Trigger:** `record_refund_with_posting` SQL function (not yet exposed as an integration endpoint; called from server functions in Phase 3).

Journal entry (`source_type = 'refund'`), full refund amount:

| Side   | Account                                           | Amount   |
| ------ | ------------------------------------------------- | -------- |
| Debit  | Accounts Receivable                               | `amount` |
| Credit | Cash / Bank / Clearing (same mapping as payments) | `amount` |

This re-establishes the AR obligation and reduces cash. If the original invoice was marked `paid`, downstream logic (Phase 3) may reopen it or create a customer credit — this function only records the money movement.

## 5. Credit Memos

Phase 3. Not implemented. Planned shape:

| Side   | Account                  | Amount   |
| ------ | ------------------------ | -------- |
| Debit  | Revenue / Contra-revenue | `amount` |
| Credit | Accounts Receivable      | `amount` |

## 6. Reversals

- Posted entries are corrected by inserting a **reversing** journal (debits/credits swapped, `source_type = '<original>_reversal'`, `source_id = <original journal id>`), then optionally transitioning the original to `void`.
- Direct edits of posted entries are blocked at the DB level.

## 7. Failure Modes and Return Codes

| Cause                            | HTTP                                                 |
| -------------------------------- | ---------------------------------------------------- |
| Missing / invalid bearer         | 401                                                  |
| Missing Idempotency-Key          | 400                                                  |
| Duplicate payment external id    | 409                                                  |
| Duplicate Idempotency-Key        | 200 (replayed)                                       |
| Customer / invoice not found     | 422                                                  |
| `apply_to` sum > payment amount  | 422                                                  |
| Payment date outside open period | 422                                                  |
| No AR / no cash mapping          | 422                                                  |
| Journal fails balance check      | 500 (should be unreachable — helper always balances) |

## 8. Tests (verified in Phase 2A)

Executed as psql SECURITY DEFINER calls against the pilot org fixture:

1. **Full payment creates balanced journal** — DR Cash 100 / CR AR 100, invoice `sent → paid`. ✅
2. **Duplicate payment prevented** — second call with same `external_id` raises `unique_violation` → 409. ✅
3. **Posted journal immutable** — direct `UPDATE` on posted `journal_entries` fails. ✅
4. **Refund creates balanced reversal** — DR AR 50 / CR Cash 50. ✅
5. **Audit events append-only** — attempted delete rejected by immutability trigger. ✅
6. **Tenant isolation** — RLS policies scope every table via `is_org_member`; `record_payment_with_posting` is `SECURITY DEFINER` with `EXECUTE` granted only to `service_role`, invoked exclusively from verified `/api/public/integrations/*` handlers.
7. **Idempotency preserved** — `sync_history (org_id, idempotency_key)` unique + `beginIntegrationCall` short-circuit.
8. **Reporting reflects payment** — `reports.functions.ts` reads through the standard journal views; AR aging drops the paid invoice on the next query.

## 9. What Is Not Yet Wired

- Refund creation via integration endpoint (function exists; no route).
- Credit-memo posting.
- AP (bill/expense) posting.
- Banking reconciliation match-to-journal.
- Period close journal (retained earnings roll).

See `docs/ledgeros/07-phase-roadmap.md` for sequencing.
