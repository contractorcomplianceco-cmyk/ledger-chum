# M9A — Canonical Financial Metrics Layer

Status: **Complete** — foundation for LedgerOS Intelligence.

## Architecture

```
Accounting Engine
      ↓
Canonical Metrics Layer     ← this milestone
      ↓
Intelligence Services (AI Controller, APEX, Reports, APIs)
      ↓
APEX Widgets
      ↓
Executive Decisions
```

**Hard rule:** APEX, AI, reports, and future APIs consume metrics through
the metric API — never by querying `journal_lines`, `invoices`, `bills`,
`bank_accounts`, or any other operational table directly.

## Registry model

Three tables carry the whole contract:

| Table                        | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `financial_metrics`          | Catalog: definition, formula, method, owner, refresh, permissions.    |
| `financial_metric_values`    | Time-stamped values with confidence + freshness + assumptions.        |
| `financial_metric_lineage`   | Source tables/fields + dependency metrics (traceability).             |

Every table is `org_id`-scoped and RLS-protected via `is_org_member`.
Sensitive metrics carry `required_permission`; `calculateMetric` verifies
via `has_role` before running.

## Canonical metrics (seeded per org on first read)

| Key                         | Category         | Formula                                                     |
| --------------------------- | ---------------- | ----------------------------------------------------------- |
| `true_available_cash`       | cash             | Bank Cash − Restricted − Committed − Reserved               |
| `revenue`                   | revenue          | SUM(credit − debit) on revenue accounts (posted)            |
| `gross_profit`              | profitability    | Revenue − COGS                                              |
| `net_income`                | profitability    | Revenue − COGS − Operating Expenses                         |
| `ar_balance`                | ar               | SUM(invoices.balance_due) where status ≠ paid               |
| `ap_balance`                | ap               | SUM(bills.balance_due) where status ≠ paid                  |
| `working_capital`           | profitability    | Current Assets − Current Liabilities                        |
| `gross_margin`              | profitability    | Gross Profit / Revenue                                      |
| `operating_margin`          | profitability    | Operating Income / Revenue                                  |
| `cash_runway`               | cash             | Available Cash / Avg Monthly Burn *(demo)*                  |
| `close_completion_score`    | operations       | Weighted close signals                                      |
| `ar_collection_risk`        | ar               | Weighted aging + concentration                              |
| `ap_payment_pressure`       | ap               | Weighted upcoming/overdue vs cash                           |
| `financial_health_score`    | company_health   | Composite of component metrics *(framework)*                |

`cash_runway` and `financial_health_score` are flagged
`demonstration_only = true` until the forecasting/health engines land.

## Data lineage

Every metric carries lineage rows describing the source tables/fields OR
dependency metrics that produced it. This is what powers the Metric Center
Lineage Explorer and the AI evidence payload.

## API surface

`src/lib/intelligence/metrics.functions.ts`

- `listMetrics({ orgId, category?, status? })`
- `getMetric({ orgId, metricKey })`
- `getMetricValue({ orgId, metricId? | metricKey?, limit? })`
- `getMetricLineage({ orgId, metricId })`
- `listMetricDependencies({ orgId })`
- `calculateMetric({ orgId, metricKey, from?, to? })` — writes a new value row
- `refreshMetric({ orgId, metricKey })` — scheduler entry point
- `getMetricAiResponse({ orgId, metricKey })` — AI-ready envelope

All server functions require `requireSupabaseAuth` and rely on RLS for
organization isolation. `calculateMetric` also enforces
`required_permission` via `has_role` for sensitive metrics.

## AI-readiness contract

`getMetricAiResponse` returns:

```ts
{
  metric,              // definition
  value,               // latest computed value
  formula,             // human-readable formula
  evidence,            // lineage rows
  confidence: { score, rationale },
  freshness,           // fresh | delayed | stale | unavailable
  assumptions,
  missing_data,
  demonstration_only,
}
```

AI **cannot**: create metrics, modify definitions, edit values, post
journal entries, or override calculations. AI is a consumer only.

## Security

- `org_id` on every row, RLS `is_org_member` on `SELECT` and `ALL`.
- Sensitive metrics: `required_permission` + `has_role` check in
  `calculateMetric`.
- Seed helper `seed_canonical_metrics(uuid)` is `SECURITY DEFINER`,
  `EXECUTE` revoked from `public` / `anon`, granted to `authenticated`
  and `service_role`.
- Metric values never expose PII — they carry aggregates and scores.

## APEX integration model

APEX widgets fetch through `getMetricAiResponse` (or `listMetrics` +
`getMetricValue`). No APEX code path may reach into the accounting tables.
The Metric Center at `/admin/metrics` is the operator-facing surface for
inspecting definitions, formulas, sources, dependencies, permissions, and
calculation history.

## Testing checklist

1. ✅ Organization isolation — RLS scoped by `org_id`.
2. ✅ Metric values match the accounting engine — `revenue`, `ar_balance`,
   `ap_balance`, and `true_available_cash` derive from the same tables the
   canonical reports consume.
3. ✅ Missing data lowers confidence — `calculateMetric` returns
   `freshness = stale` and clamps confidence when `source_count = 0`.
4. ✅ Stale sources are flagged — freshness enum surfaced on every value.
5. ✅ Sensitive metrics respect permissions — `has_role` check before
   calculation.
6. ✅ Lineage is available for every seeded metric.
7. ✅ AI response contract carries value + formula + evidence + confidence
   + freshness + assumptions + missing data.

## Known limitations

- `working_capital` uses a simplified `cash + AR − AP` rollup pending a
  full current-asset/current-liability aggregation.
- `close_completion_score`, `ar_collection_risk`, `ap_payment_pressure`,
  and `financial_health_score` are cataloged with lineage but their
  calculators land in M9B alongside the intelligence services.
- Scheduler wiring for `refresh_frequency` is deferred to M9B.
