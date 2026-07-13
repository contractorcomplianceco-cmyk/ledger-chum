# LedgerOS Financial Data Model

**Version:** 1.0
**Scope:** Logical model. Physical DDL lives in migrations; this document is
the canonical description of entities and relationships.

## 1. Foundation

- **organization** — tenant root. All financial rows scope by `org_id`.
- **user** — identity (Supabase Auth).
- **org_member** — user ↔ organization membership.
- **role** enum: `owner`, `accounting_lead`, `accountant`,
  `systems_reviewer`, `team_member`, `integration_service`.
- **user_role** — (user, org, role). Checked by `has_role()` security-definer
  function.
- **fiscal_period** — (org, start_date, end_date, status:
  `open|closing|closed`). Posting into a closed period is rejected.
- **audit_event** — (org, actor_type, actor_id, event_type, target_type,
  target_id, before jsonb, after jsonb, correlation_id, created_at). Written
  on every state change.

## 2. Integration Registry

- **api_client** — (org, name, key_hash, active, last_used_at). Per-tenant
  Bearer credentials for operational systems.
- **external_system** — logical name (e.g. `serviceconnect`).
- **sync_history** — (org, source, endpoint, external_id, idempotency_key,
  status, request jsonb, response jsonb, error). Unique on
  `(org, idempotency_key)`.
- Every integration-owned row carries `(external_source, external_id)` plus
  `last_synced_at`, `sync_status`.

## 3. Ledger Engine

- **account** — (org, code, name, type:
  `asset|liability|equity|revenue|expense`, parent_id, normal_balance,
  is_active). Chart of Accounts.
- **journal_entry** — (org, entry_date, memo, source_type, source_id,
  status: `draft|posted|void`, posted_at, posted_by, correlation_id,
  fiscal_period_id).
- **journal_line** — (journal_id, account_id, debit, credit, memo). Enforced:
  `debit >= 0`, `credit >= 0`, exactly one of them non-zero, and per-journal
  `sum(debit) = sum(credit)` on transition to `posted`.
- Void = a reversing journal linked by `source_type='reversal'`. Posted rows
  are immutable.

## 4. Accounts Receivable

- **customer** — (org, external_source, external_id, name, email, phone,
  billing_address jsonb, status, terms_id). Unique on
  `(org, external_source, external_id)`.
- **payment_terms** — (org, name, net_days, discount_pct, discount_days).
- **invoice** — (org, customer_id, external_source, external_id,
  invoice_number, issue_date, due_date, status:
  `draft|sent|partial|paid|void`, subtotal, tax, total, balance,
  work_order_ref, memo, terms_id).
- **invoice_line** — (invoice_id, description, quantity, unit_price,
  tax_rate, amount, account_id).
- **payment** — (org, customer_id, external_source, external_id,
  payment_date, method, reference, amount, unapplied_amount, memo).
- **payment_application** — (payment_id, invoice_id, amount_applied).
- **credit** — (org, customer_id, credit_date, amount, unapplied_amount,
  memo, source_type, source_id).
- **credit_application** — (credit_id, invoice_id, amount_applied).
- **refund** — (org, payment_id, refund_date, amount, method, memo).
- **collections_status** — derived per invoice from aging + activity.

## 5. Accounts Payable

- **vendor** — (org, external_source, external_id, name, contact, terms_id).
- **bill** — (org, vendor_id, bill_number, issue_date, due_date, status,
  subtotal, tax, total, balance, memo).
- **bill_line** — (bill_id, description, quantity, unit_price, amount,
  account_id, expense_category_id).
- **vendor_payment** — (org, vendor_id, payment_date, method, amount, memo).
- **vendor_payment_application** — (vendor_payment_id, bill_id, amount_applied).
- **expense_category** — (org, name, default_account_id).
- **expense** — (org, category_id, date, amount, memo, receipt_ref).

## 6. Banking

- **bank_account** — (org, name, type, currency, gl_account_id).
- **bank_transaction** — (org, bank_account_id, txn_date, amount, direction,
  description, external_id, matched_journal_line_id).
- **deposit** — (org, bank_account_id, deposit_date, amount, memo).
- **deposit_item** — (deposit_id, payment_id, amount).
- **transfer** — (org, from_account_id, to_account_id, amount, txn_date).
- **reconciliation** — (org, bank_account_id, period_start, period_end,
  statement_balance, cleared_balance, status).
- **reconciliation_item** — (reconciliation_id, bank_transaction_id,
  journal_line_id, cleared).

## 7. Cost & Job Data (from operational systems)

- **inventory_consumption** — (org, work_order_ref, item_ref, quantity,
  unit_cost, total_cost, external_source, external_id, consumed_at).
- **job_cost_entry** — (org, work_order_ref, category, amount, journal_id).
- LedgerOS stores work-order **references**, not work-order state. Truth
  remains in the operational system.

## 8. Views

- `v_general_ledger` — posted journal lines flattened with account metadata.
- `v_trial_balance` — sum(debit)/sum(credit) by account for a date range.
- `v_ar_aging` — buckets 0–30 / 31–60 / 61–90 / 90+.
- `v_ap_aging` — same for bills.
- `v_customer_profitability` — revenue minus job costs by customer.
- `v_job_profitability` — by `work_order_ref`.

## 9. Cross-Entity Rules

- Every mutable row has `created_at`, `updated_at`; posted ledger rows are
  append-only.
- Every mutation writes exactly one `audit_event` row.
- Every integration write inserts one `sync_history` row keyed by
  idempotency_key.
- Money is `numeric(18,2)`; percentages `numeric(9,6)`.
- Multi-currency is out of scope for v1; a `currency` column exists but is
  constrained to the org's base currency.
