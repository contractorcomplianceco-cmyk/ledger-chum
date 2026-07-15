# 24 — APEX Intelligence Activation Layer (M9C)

Status: Delivered. Preserves M9A (Canonical Metrics) and M9B (Intelligence
Services) as the only sanctioned data paths into APEX.

## 1. Objective

Connect the existing APEX executive experience to real LedgerOS intelligence
services **without redesigning APEX**. Replace ad-hoc demonstration-only data
paths with a small, typed adapter layer that composes canonical metrics,
anomalies, recommendations, explanations, health, and close scoring into a
normalized envelope the UI can render safely.

## 2. Architecture

```
Accounting Engine
      ↓
Canonical Metrics (M9A)
      ↓
Intelligence Services (M9B — anomalies, recommendations, explanations, scores)
      ↓
APEX Data Adapters (M9C)       ← this milestone
      ↓
Executive Experience (APEX)
```

APEX components **must** consume adapters. APEX components **must not**
query accounting tables, `financial_metric_values`, or Supabase directly.
This constraint is enforced by convention (adapters are the only imports
APEX pages need for intelligence data) and by RLS at the DB layer.

## 3. Adapter Layer

Location: `src/lib/intelligence/adapters/`

Every adapter is a React hook that returns an `IntelligenceEnvelope<T>`:

```
{ data, isDemo, loading, error? }
```

The primary data shape is `IntelligenceItem`, which carries the mandatory
AI response contract:

- `title`, `summary`
- `displayValue` / `numericValue`
- `sourceMetricKey`
- `evidence[]` (from `financial_metric_lineage` or item-level evidence)
- `confidence` (0..1)
- `freshness` (`fresh | delayed | stale | unavailable`)
- `assumptions[]`, `missingData[]`
- `recommendedAction`, `approvalRequirement`
- `demonstrationOnly` (true when served from local fallback)

### Adapters shipped

| Adapter                     | Server function                | Purpose                                    |
| --------------------------- | ------------------------------ | ------------------------------------------ |
| `useMetricAdapter`          | `getMetricAiResponse`          | Single canonical metric envelope           |
| `useAnomalyAdapter`         | `listAnomalies`                | Open anomalies feed                        |
| `useRecommendationAdapter`  | `listRecommendations`          | AI recommendations queue                   |
| `useExplanationAdapter`     | `listExplanations`             | AI advisory answer log                     |
| `useHealthAdapter`          | `getFinancialHealthScore`      | Composite Financial Health Score           |
| `useCloseAdapter`           | `getCloseCompletionScore`      | Current close-run completion score         |

When no org context is available (unauthenticated / no membership) the
adapters return a `demonstrationOnly: true` envelope so the existing APEX
pages continue to render without leaking anything from the accounting layer.

## 4. Pulse activation map

Existing APEX pulses now have a defined activation path via canonical
metric keys. UI wiring is opt-in per pulse and does not change the visual
design.

- **Cash Pulse** — `true_available_cash`, `restricted_cash`,
  `committed_cash`, `cash_forecast_7d`, `cash_forecast_30d`.
- **Profit Pulse** — `revenue`, `cogs`, `gross_profit`, `net_income`,
  `gross_margin`, `operating_margin`.
- **Company Health** — `useHealthAdapter()`; drivers, weights, and
  freshness returned by the intelligence service.
- **AI Briefing** — merged `useExplanationAdapter` + `useAnomalyAdapter` +
  `useRecommendationAdapter` sorted by confidence and freshness.

## 5. Role Workspace permission scoping

`filterByAudience(items, audience)` applies role-scoped intelligence
without leaking sensitive metrics:

- **Owner** — everything (governance).
- **Accounting** — close, anomalies, controller / close / accountant
  recommendations, AR/AP items.
- **Sales** — revenue and growth categories.
- **Systems** — operational + technology categories and any non-fresh
  freshness signals.
- **Team** — non-sensitive advisory items only (excludes health / close).

Sensitive metrics (e.g. payroll) remain gated at the metric layer's
`required_permission` and never appear in the general feed.

## 6. Unified Intelligence Feed

Route: `/apex/insights`

Combines all adapters into a single feed with audience and kind filters.
Every card renders:

- kind badge, title, summary, display value
- confidence %, freshness, source metric
- evidence list (up to 6)
- recommended action + approval requirement
- assumptions and missing-data lists

No action buttons post accounting changes. The feed is strictly advisory;
status transitions on anomalies/recommendations happen through their
existing admin routes.

## 7. AI Governance

- AI **cannot** post journal entries, modify metrics, approve
  transactions, change financial records, or override controls.
- AI **can** explain, summarize, detect anomalies, rank, score,
  recommend, and cite evidence — always through the intelligence services
  contract (immutable narrative/evidence/confidence at the DB level).
- APEX adapters never introduce a mutation path against accounting data;
  they are read-only projections of intelligence outputs.

## 8. Evidence Model

Evidence is carried through three tiers:

1. **Metric lineage** (`financial_metric_lineage`) — surfaced by
   `useMetricAdapter` for every metric card.
2. **Intelligence evidence JSON** — anomalies, recommendations, and
   explanations attach their own evidence entries alongside canonical
   `supporting_metric_keys`.
3. **Composite scores** — `useHealthAdapter` and `useCloseAdapter` return
   per-driver evidence with per-driver freshness.

## 9. Migration from mock data

- New APEX surfaces (starting with `/apex/insights`) consume adapters
  directly and are the reference implementation.
- Legacy APEX pages (pulses, workspaces, briefing) continue to use their
  `src/lib/mock/apex-*` sources during design-lab review; each is expected
  to migrate to the corresponding adapter in follow-on tickets by
  replacing the mock import with the adapter hook.
- Adapters transparently fall back to demonstration envelopes when there
  is no live org context, so migrating a component does not break the
  design-lab experience.

## 10. Guarantees

- APEX does not query accounting tables from the UI.
- APEX design is unchanged; this milestone adds one route and a data
  layer.
- LedgerOS remains the financial source of truth. APEX is a presentation
  layer over the intelligence services.
