# LedgerOS · Milestone 9B — Intelligence Services Layer

**Status:** implemented (advisory only)
**Depends on:** M9A Canonical Metrics Layer
**Consumers:** APEX (future), Close Assistant, Accountant Assistant, AI Controller

---

## 1. Architecture

```
Canonical Metrics
        ↓
Intelligence Services  (this milestone)
        ↓
AI Analysis  (explanations, anomaly detection, ranking)
        ↓
Recommendations
        ↓
APEX  (deferred — no UI redesign in M9B)
```

Intelligence services **never** query raw accounting tables. Every input
comes from the canonical metrics layer via `getMetricAiResponse`,
`getMetricValue`, and `getMetricLineage`. This is a mandatory
architectural rule — direct ledger reads from AI or APEX are forbidden.

---

## 2. Data Model

Three tables, all `org_id`-scoped with RLS gated by `is_org_member`.

### `financial_anomalies`

| Field                                                                             | Notes                                                 |
| --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `metric_key`, `metric_id`                                                         | Source metric being flagged                           |
| `detector`                                                                        | `threshold` · `zscore` · `trend` · `ratio` · `custom` |
| `severity`                                                                        | `low` · `medium` · `high` · `critical`                |
| `status`                                                                          | `open` · `acknowledged` · `dismissed` · `resolved`    |
| `observed_value`, `expected_value`, `deviation`                                   | Numerical evidence                                    |
| `narrative`, `evidence`, `confidence`, `freshness`, `assumptions`, `missing_data` | AI response contract                                  |
| `recommended_action`, `approval_requirement`                                      | Advisory only                                         |
| `advisory_only`                                                                   | Immutable, always `true` from AI                      |

### `financial_recommendations`

| Field                                                                    | Notes                                                                                                                                                           |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `category`                                                               | `reduce_cost` · `recover_revenue` · `improve_collection` · …                                                                                                    |
| `persona`                                                                | `controller` · `close_assistant` · `accountant_assistant`                                                                                                       |
| `state`                                                                  | `generated` → `needs_review` → `accepted` / `dismissed` / `converted_to_task` / `converted_to_draft` / `approved_for_action` / `completed` / `outcome_measured` |
| `supporting_metric_keys`, `related_anomaly_id`                           | Traceability into metrics + anomalies                                                                                                                           |
| `confidence`, `estimated_impact`, `impact_value`, `risk`, `time_horizon` | Scoring                                                                                                                                                         |
| `approval_requirement`                                                   | Required human approver for any downstream action                                                                                                               |
| `outcome_note`, `outcome_value`                                          | Post-decision measurement                                                                                                                                       |

### `intelligence_explanations`

Append-only log of AI answers.

| Field                                                                                                                                        | Notes                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `subject_type`                                                                                                                               | `metric` · `anomaly` · `recommendation` · `question`                  |
| `subject_key`                                                                                                                                | metric key / anomaly id / recommendation id / free-form question hash |
| `question`, `answer`                                                                                                                         | Human-readable Q&A                                                    |
| `evidence`, `supporting_metric_keys`, `confidence`, `freshness`, `assumptions`, `missing_data`, `recommended_action`, `approval_requirement` | Full AI response envelope                                             |
| `advisory_only`                                                                                                                              | Enforced `true` on INSERT policy                                      |

---

## 3. Immutability & Governance

Enforced by DB triggers, not application code:

| Table                       | Trigger                       | Guarantee                                                                                 |
| --------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `financial_anomalies`       | `tg_anomalies_advisory_guard` | Narrative, evidence, confidence, advisory_only, observed / expected values cannot change. |
| `financial_recommendations` | `tg_recs_advisory_guard`      | Narrative, evidence, confidence, advisory_only, and category cannot change.               |
| `intelligence_explanations` | `tg_expl_immutable`           | Any `UPDATE` is rejected — append-only.                                                   |

Client INSERT policies exist only on `intelligence_explanations`
(and only with `advisory_only = true`). Anomalies and recommendations
are inserted by scheduled `service_role` processes so end users cannot
fabricate them. Users can only update **status / state / outcome
metadata** — never the AI narrative.

---

## 4. AI Response Contract

Every intelligence output — anomaly, recommendation, explanation,
composite score — carries the following fields:

- `answer` (or `narrative`)
- `evidence`
- `confidence` (0..1)
- `freshness` (`fresh` · `delayed` · `stale` · `unavailable`)
- `assumptions`
- `missing_data`
- `recommended_action`
- `approval_requirement`

Consumers (APEX, dashboards, chat) **must** render freshness and
confidence alongside the answer.

---

## 5. AI Capability Boundaries

AI **can**: explain, summarize, detect anomalies, rank, score, recommend,
cite evidence, log Q&A.

AI **cannot**: post journal entries, modify metrics, approve transactions,
change financial records, override fiscal controls, or write into the
accounting engine.

Every state change surfaced by AI (accepted, converted_to_task, etc.)
represents a **human decision** recorded via `updateAnomalyStatus` /
`updateRecommendationState` — those are the only entry points, both
authenticated via `requireSupabaseAuth`.

---

## 6. Server API (`src/lib/intelligence/services.functions.ts`)

| Function                    | Purpose                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `listAnomalies`             | Read anomalies filtered by status + severity               |
| `updateAnomalyStatus`       | Acknowledge / dismiss / resolve                            |
| `listRecommendations`       | Read recommendations filtered by state + persona           |
| `updateRecommendationState` | Move through review state machine                          |
| `listExplanations`          | Read append-only AI answers                                |
| `recordExplanation`         | Append an advisory answer (always `advisory_only = true`)  |
| `getRefreshStatus`          | Latest calculation freshness for every active metric       |
| `getFinancialHealthScore`   | Weighted composite of 6 canonical metrics (0–100)          |
| `getCloseCompletionScore`   | % of close-run tasks completed                             |
| `getIntelligenceGovernance` | Advertise AI capabilities, response contract, immutability |

Every function is authenticated, `org_id`-scoped, and returns data
already validated against RLS.

---

## 7. Confidence & Freshness Framework

- **Confidence** is inherited from source metric values and adjusted for
  missing drivers. Composite scores multiply per-driver confidence by
  weight coverage — e.g. Financial Health Score falls to `0.5` when only
  60% of drivers report values, and to `0.3` below 40%.
- **Freshness** is propagated from the latest metric value. When any
  driver is `unavailable`, the composite freshness falls to `delayed`
  and the missing driver is recorded in `missing_data`.

---

## 8. Metric Refresh Strategy

`getRefreshStatus` reports, per active canonical metric:

- `refresh_frequency` (from the metric registry)
- `last_calculated_at` (from the latest `financial_metric_values` row)
- `freshness` (`fresh` when a value exists and the source freshness is
  fresh; `unavailable` when no value has ever been calculated)
- `confidence` (last recorded score)

Recalculation itself is performed by the M9A `calculateMetric` server
function, invoked by a scheduled process. M9B does not introduce new
calculators — it observes and surfaces freshness.

---

## 9. Recommendation Lifecycle

```
generated
   ↓
needs_review  ←— AI flagged for human review
   ↓
accepted / dismissed
   ↓
converted_to_task  |  converted_to_draft
   ↓
approved_for_action  ←— human approver, per approval_requirement
   ↓
completed
   ↓
outcome_measured
```

Transitions are recorded via `updateRecommendationState` with
`reviewed_by` and `reviewed_at` stamped from the caller's session.
Narrative, evidence, and confidence remain immutable throughout.

---

## 10. Admin UI

Route: `/admin/intelligence`

Tabs:

1. **Explanations** — advisory Q&A log with confidence / freshness badges.
2. **Anomalies** — severity-coded queue with Acknowledge / Dismiss /
   Resolve actions.
3. **Recommendations** — persona + state coded list with Accept / Needs
   review / Dismiss transitions.
4. **Refresh Status** — every canonical metric with last-calculated
   timestamp and freshness badge.
5. **AI Governance** — allowed vs forbidden capabilities, response
   contract, and DB-trigger immutability guarantees.

Header cards surface **Financial Health**, **Close Completion**, and
**Metrics Fresh %** — all clearly labelled _advisory only_.

---

## 11. What M9B Does Not Do

- Does not modify APEX UI.
- Does not query accounting tables directly from the client.
- Does not add ServiceConnect-specific intelligence.
- Does not fabricate financial conclusions — every output carries
  evidence, confidence, freshness, assumptions, and missing data.
- Does not grant AI write access to any accounting record.

LedgerOS remains the independent financial source of truth.
