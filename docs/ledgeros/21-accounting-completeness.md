# M8 — Accounting Completeness Layer

Phase 5, Milestone 8. Completes the LedgerOS accounting foundation
required before activating full financial intelligence. This milestone
is strictly additive — it does not change the Financial Event Bus, the
Materialization Engine, the Accounting Engine, or the Close workflow.

---

## Scope

1. Inventory & cost accounting foundation
2. Fixed assets with depreciation framework
3. Tax framework (jurisdictions, categories, rates, liabilities)
4. Multi-entity foundation with intercompany registry
5. Accounting Intelligence — advisory-only Controller / Close Assistant /
   Accountant Assistant

All five areas remain independent of any external operational system.
LedgerOS is the financial truth. External systems reach it only through
the Financial Event Bus (M6 / M7).

---

## 1. Inventory & Cost Accounting

**Tables**

| Table                    | Purpose                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `inventory_categories`   | Grouping + default COGS / asset account mapping.                                             |
| `inventory_locations`    | Physical / logical stock locations.                                                          |
| `inventory_items`        | Item master: SKU, UoM, cost method, current avg cost, on-hand.                               |
| `inventory_transactions` | Immutable movement log: receipts, issues, adjustments, transfers, consumption, revaluations. |

**Cost methods supported** — `average`, `fifo`, `standard`, `specific`.
Only the _framework_ is scoped in M8; automatic cost-layer computation
is deferred.

**COGS treatment** — inventory transactions carry an optional
`journal_entry_id`, but M8 does **not** auto-post. Postings happen
through the existing manual-journal RPC when an operator confirms
consumption, matching the M6 principle that only the accounting engine
writes to the ledger.

The pre-existing `inventory_consumption` table (used by the integration
public API for external work-order consumption) remains untouched.

---

## 2. Fixed Assets

**Tables**

| Table                      | Purpose                                                                    |
| -------------------------- | -------------------------------------------------------------------------- |
| `fixed_asset_categories`   | Default useful life, depreciation method, and account mapping.             |
| `fixed_assets`             | Individual asset records with acquisition, in-service, and disposal dates. |
| `fixed_asset_depreciation` | Period-level schedule of depreciation amounts.                             |

**Book value** is a stored generated column:
`book_value = acquisition_cost - accumulated_depreciation`.

**Lifecycle statuses** — `active`, `disposed`, `impaired`, `pending`.

**Depreciation** — `generateDepreciationSchedule` produces
`scheduled` rows using straight-line for the asset's `useful_life_months`.
Rows never auto-post; posting a period is a deliberate accountant action
via the existing manual-journal RPC.

---

## 3. Tax Framework

**Framework only — no calculation logic.**

| Table               | Purpose                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `tax_jurisdictions` | Configurable jurisdictions (country / region / code).                                                          |
| `tax_categories`    | `sales`, `use`, `vat`, `gst`, `withholding`, `payroll`, `excise`, `other`.                                     |
| `tax_rates`         | Effective-dated rates keyed by (jurisdiction, category, effective_from). Ties to liability + expense accounts. |
| `tax_liabilities`   | Period-level obligation with `open`, `filed`, `paid`, `void` statuses.                                         |

Rate lookup, invoice-level tax computation, and filing automation are
explicitly out of scope for M8. Operators record liability amounts;
LedgerOS stores them and links to journals through the standard engine.

---

## 4. Multi-Entity Foundation

| Table                       | Purpose                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `legal_entities`            | Multiple legal entities under a single organization. Optional parent hierarchy, functional currency, and default intercompany AR / AP account mapping. |
| `intercompany_transactions` | Recorded movements between legal entities with `pending`, `posted`, `settled`, `void` statuses.                                                        |

**Due to / from balances** — `getIntercompanyBalances` aggregates posted
intercompany transactions per (from_entity, to_entity) pair. Full
consolidation and elimination logic are deferred.

Journals for intercompany postings continue to flow through the
existing accounting engine — this layer only tracks the operational
relationship.

---

## 5. Accounting Intelligence (advisory only)

**Table:** `accounting_insights`

| Field                | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `persona`            | `controller` \| `close_assistant` \| `accountant_assistant`.            |
| `category`           | Free-form tag (e.g. `close_readiness`, `unmapped_account`, `variance`). |
| `title`              | Short headline.                                                         |
| `what_happened`      | Description of the observation.                                         |
| `why`                | Interpretive narrative.                                                 |
| `evidence`           | JSONB array of supporting references (record IDs, metrics, links).      |
| `confidence`         | Numeric 0–1 confidence value.                                           |
| `recommended_action` | Suggested next step for a human.                                        |
| `advisory_only`      | Immutable `TRUE`. Enforced by trigger.                                  |
| `status`             | `open` → `acknowledged` / `dismissed` / `resolved`.                     |

**Immutability guard** — `tg_insights_advisory_guard` blocks any
UPDATE that mutates narrative, evidence, confidence, persona, category,
related object, or the `advisory_only` flag itself. Only status and
acknowledgement metadata may change.

**Insertion policy** — end users cannot insert rows. Insights are
produced by scheduled server processes running under `service_role`.
The frontend can only read and update status.

### AI Explains, Never Acts

The AI Controller, Close Assistant, and Accountant Assistant surface:

- **What happened** — the observed metric or event
- **Why** — the interpretive reasoning
- **Evidence** — the underlying records
- **Confidence** — an explicit 0–1 score
- **Recommended action** — the suggested human follow-up

**AI cannot:**

- post journal entries
- change accounting records
- approve transactions
- override controls
- alter fiscal-period state
- write to any operational ledger table

The Financial Event Bus, posting engine, close workflow, and control
center remain the sole paths to writing accounting data. Intelligence
is a companion layer on top of them.

---

## Preserved Invariants

- Financial Event Bus unchanged.
- Materialization Engine unchanged.
- Accounting Engine unchanged.
- Double-entry integrity unchanged.
- Fiscal-period controls unchanged.
- Audit lineage unchanged.
- Organization isolation enforced by RLS on every new table.
- Integration-first architecture unchanged — no external system can
  reach the ledger except through the event bus.

## What M8 Explicitly Does NOT Add

- No ServiceConnect-specific accounting code.
- No hardcoded customer logic.
- No automatic tax calculations.
- No auto-posting depreciation or COGS.
- No AI ability to change accounting records.
- No APEX redesign.
