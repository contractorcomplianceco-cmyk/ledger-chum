# LedgerOS Double-Entry Accounting Model

**Version:** 1.0

## 1. Invariants

1. **Balanced posting.** Every posted `journal_entry` has
   `sum(debit) = sum(credit)` across its `journal_line` rows. Enforced by a
   Postgres trigger on transition to `posted`.
2. **Non-negative sides.** `debit >= 0` and `credit >= 0` and exactly one is
   non-zero per line.
3. **Immutability of posted rows.** Posted journals and their lines are
   never updated or deleted. Corrections are new reversing journals.
4. **Period lock.** A posted journal's `entry_date` must fall inside a fiscal
   period whose status is `open`. Closed periods reject writes.
5. **Auditability.** Every state change writes an `audit_event` row with
   before/after snapshots and a `correlation_id`.

## 2. Normal Balances

| Account type | Normal balance | Increased by | Decreased by |
| ------------ | -------------- | ------------ | ------------ |
| Asset        | Debit          | Debit        | Credit       |
| Liability    | Credit         | Credit       | Debit        |
| Equity       | Credit         | Credit       | Debit        |
| Revenue      | Credit         | Credit       | Debit        |
| Expense      | Debit          | Debit        | Credit       |

## 3. Posting Engine

Inputs: journal header + lines. Steps:

1. Validate fiscal period is `open` for `entry_date`.
2. Validate every account is active and belongs to `org_id`.
3. Validate balance: `sum(debit) = sum(credit)`, > 0, and no zero-line entry.
4. Insert `journal_entry` with `status='posted'`, `posted_at=now()`,
   `posted_by=auth.uid()`.
5. Insert `journal_line` rows.
6. Write `audit_event` row.
7. Update derived rows (e.g. invoice `balance`, payment `unapplied_amount`).

All steps run in one transaction. Failure rolls back the entire posting.

## 4. Reversing Entries

To correct a posted journal `J`:

1. Create a new `journal_entry` `J'` with `source_type='reversal'` and
   `source_id=J.id`.
2. For each line of `J`, insert a mirror line with debit/credit swapped.
3. Post `J'`.

Downstream: `invoice.balance` and `payment.unapplied_amount` are
recomputed from the sum of applications; the reversal path never touches
posted history.

## 5. Canonical Postings

### Invoice sent (AR recognition)

| Line                         | Debit | Credit        |
| ---------------------------- | ----- | ------------- |
| Accounts Receivable          | Total |               |
| Revenue (per line's account) |       | Line subtotal |
| Sales Tax Payable            |       | Tax           |

### Customer payment (cash receipt)

| Line                      | Debit  | Credit         |
| ------------------------- | ------ | -------------- |
| Undeposited Funds or Bank | Amount |                |
| Accounts Receivable       |        | Amount applied |

### Refund of a payment

| Line                | Debit  | Credit |
| ------------------- | ------ | ------ |
| Accounts Receivable | Amount |        |
| Bank                |        | Amount |

### Credit memo issued

| Line                 | Debit  | Credit |
| -------------------- | ------ | ------ |
| Revenue / Adjustment | Amount |        |
| Accounts Receivable  |        | Amount |

### Bill received (AP recognition)

| Line             | Debit  | Credit |
| ---------------- | ------ | ------ |
| Expense / COGS   | Amount |        |
| Accounts Payable |        | Amount |

### Vendor payment

| Line             | Debit  | Credit |
| ---------------- | ------ | ------ |
| Accounts Payable | Amount |        |
| Bank             |        | Amount |

### Inventory consumption on a work order (COGS)

| Line            | Debit      | Credit     |
| --------------- | ---------- | ---------- |
| COGS            | total_cost |            |
| Inventory Asset |            | total_cost |

## 6. Period Close

1. Transition period to `closing` — new writes rejected, existing drafts
   remain editable until posted or discarded.
2. Run trial balance and required reports.
3. Transition to `closed`. Only reversing entries into a later open period
   can affect closed-period balances going forward.

## 7. Draft vs Posted

- `draft` journals may be edited and deleted.
- `sent`/`posted` invoices have posted journals attached and follow the
  immutability rule; the invoice itself transitions status but does not
  rewrite the journal.
