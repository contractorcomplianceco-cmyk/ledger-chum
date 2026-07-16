# LedgerOS · 17 — Banking & Financial Reports (M3)

Milestone 3 completes the banking foundation and the four canonical
financial reports. All figures resolve from posted `journal_entries` +
`journal_lines`. There are no mocks, no fake financial intelligence, and
no ServiceConnect-specific rules in this milestone — LedgerOS remains a
standalone accounting engine.

## Scope shipped

| Area               | What lands                                                                          |
| ------------------ | ----------------------------------------------------------------------------------- |
| Banking foundation | `bank_accounts`, `bank_transactions`                                                |
| Matching framework | `match_bank_transaction`, `unmatch_bank_transaction` RPCs + candidate suggester     |
| Reconciliation     | `bank_reconciliations` + `reconciliation_lines`, `complete_bank_reconciliation` RPC |
| Trial Balance      | Date-ranged, balanced check                                                         |
| Profit & Loss      | Revenue − Expense = Net Income                                                      |
| Balance Sheet      | Asset = Liability + Equity (incl. retained earnings)                                |
| Cash Flow          | Indirect operating cash flow with working-capital deltas                            |
| AR / AP Aging      | Continues to feed from posted balances; new `v_ap_aging` view                       |

## Foundational invariants (still enforced)

- Double-entry integrity is proven at three layers: `enforce_balanced_journal`
  trigger, every posting RPC, and the Trial Balance report itself.
- Organization isolation is enforced by RLS on every new table (each policy
  routes through `is_org_member`).
- Fiscal period controls remain in force for every posting path; banking
  writes do not bypass them because they never create journals directly.
- Audit lineage: `bank_txn.matched`, `bank_txn.unmatched`, and
  `reconciliation.completed` events land in `audit_events` with full context.
- Source transaction traceability: `bank_transactions.external_source` +
  `external_id` are unique per bank account for idempotent CSV re-imports.
- Accounting dimensions on `journal_lines` remain available; no report in M3
  needs to widen them.

## Report definitions (canonical formulas)

Every report is a deterministic function of posted `journal_lines`. The
formulas below are the source of truth for future AI explanation layers
("why is this number this?") — the explanation engine reads these,
recomputes with the same inputs, and shows the intermediate deltas.

### Trial Balance (`getTrialBalanceRanged`)

For each account, sum posted `debit` and `credit` within `[from, to]`.

```text
debit_total  = Σ debit
credit_total = Σ credit
balance      = debit_total − credit_total
```

`balanced = |Σ debit_total − Σ credit_total| < 0.005`. If this ever fails,
the posting engine is broken — the report is the tripwire.

### Profit & Loss (`getProfitAndLoss`)

Revenue and expense accounts only, over `[from, to]`.

```text
revenue_total = Σ (credit − debit) over revenue accounts
expense_total = Σ (debit − credit) over expense accounts
net_income    = revenue_total − expense_total
```

### Balance Sheet (`getBalanceSheetAsOf`)

Cumulative activity through `asOf`.

```text
asset      = Σ (debit − credit) over asset accounts
liability  = Σ (credit − debit) over liability accounts
equity     = Σ (credit − debit) over equity accounts
retained_earnings = revenue_total − expense_total  (all-time through asOf)
total_equity = equity + retained_earnings
balanced   = |asset − (liability + total_equity)| < 0.005
```

### Cash Flow — indirect (`getCashFlow`)

```text
operating = net_income
          − Δ Accounts Receivable
          − Δ Inventory
          + Δ Accounts Payable
```

Investing / financing sections arrive with M4 (they need the bank_transfer

- equity contribution surfaces).

## Account mapping expectations

Reports use `accounts.type` (asset / liability / equity / revenue / expense)
as the sole classification signal. The Balance Sheet and Cash Flow additionally
look up working-capital categories by name pattern:

- Accounts Receivable → asset accounts whose `name` matches `/receivable/i`
- Inventory → asset accounts whose `name` matches `/inventory/i`
- Accounts Payable → liability accounts whose `name` matches `/payable/i`

Renaming a default account is safe as long as it keeps the semantic word;
renaming it away invalidates the working-capital deltas for that account.
Long-term this becomes explicit via `account_mappings.purpose`, which
`resolve_account` already understands (`ar`, `cash_default`, etc.).

## Banking data flow

```text
CSV upload
  → parseCsv (client)
  → importBankTransactions (upsert on (bank_account_id, external_source, external_id))
  → bank_transactions.status = 'unmatched'

Match
  → suggestMatchCandidates picks posted journal lines on the bank's GL cash account
     within ±14 days and matching signed amount
  → match_bank_transaction links txn ↔ journal_line, writes audit event

Reconcile
  → startReconciliation creates a period record
  → user checks off cleared bank transactions
  → complete_bank_reconciliation snapshots the cleared set, computes the
    difference against statement ending balance, writes audit event
```

## Future AI explanation layer (hooks preserved)

Every report response is a plain DTO with named formula inputs. This is
deliberate: an explanation prompt for "why is Net Income $X?" should read

1. the current P&L rows (revenue accounts and expense accounts), and
2. the underlying `journal_lines` for the top-N contributing accounts
   (already available via `listLedgerLines`), scoped by `orgId` and range.

No AI-specific fields are baked into the DTOs — LedgerOS reports are the
ground truth; explanations are a read-only overlay.

## Testing invariants

- Trial Balance `balanced` must remain `true` after every posting.
- Balance Sheet `balanced` must remain `true` at any `asOf`.
- Duplicate CSV rows (same `external_id`) never insert twice — verified by
  the unique index on `(bank_account_id, external_source, external_id)`.
- Cross-org matches are rejected inside `match_bank_transaction`.
- Only `posted` journal lines are match candidates.
- Reconciliation cannot re-complete once `status = 'completed'`.

## Non-goals for M3

- No ServiceConnect-specific accounting rules.
- No hardcoded customer or vendor logic.
- No AI-generated numbers anywhere in the report path.
- No changes to APEX surfaces.
