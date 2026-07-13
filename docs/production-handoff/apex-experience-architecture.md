# Project APEX — Experience Architecture

## The seven-question contract

Every major APEX surface answers:

1. What happened?
2. Why did it happen?
3. Why does it matter?
4. What should the user do next?
5. What evidence supports the recommendation?
6. Who must approve the action?
7. What financial impact will the action have?

## Explainability standard

Every metric surfaces: current, prior, target, trend, why it changed, contributors, detractors, risk, recommended action, supporting records, confidence, and freshness.

Every insight surfaces: direct answer, period, entity, evidence, calculation method, confidence, freshness, assumptions, missing data, recommended action, required approval.

Every recommendation surfaces: estimated impact, effort, horizon, risk, evidence, owner, next step, required approval, status, outcome.

## Reusable primitives (APEX 2)

- `WhyDidThisChange` — attaches a driver/detractor narrative to any metric.
- `ExplainabilityDrawer` — full evidence, calculation, and confidence surface.
- `EvidenceDrawer` — record-level evidence linking.
- `ConfidenceChip`, `FreshnessChip` — inline governance.
- `PulseCard` — the intelligent widget primitive.
- `AskLedgerOS` — persona-scoped assistant surface.

## Light/dark treatment

Default light workspace for operational work (~70% of pixels). Dark navy intelligence surfaces reserved for pulses, briefings, and Company Health (~30% of pixels). Contrast pairs must meet WCAG AA on both surfaces.
