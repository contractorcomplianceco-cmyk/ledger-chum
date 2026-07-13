# Feature Dependency Map

Live view: `/feature-registry/dependencies`

Dependencies are recorded per feature in `src/lib/mock/feature-registry.ts`
under the `dependencies` and `blockingDecisions` fields. Legal, accounting,
integration, and backend blockers are visible as flags on every feature
table.

## Structural dependencies

- **Compensation Calculations** depend on Compensation Plans, Participants, Attribution, Eligibility, and Revenue Allocation.
- **Statements** depend on Calculations and Approvals.
- **Payables / Payment Batches** depend on Statements and Cash Guardrails.
- **Check Writing** depends on Cash Guardrails, Signature Rules, and Bank Reconciliation.
- **Profit Sharing** depends on Multi-Entity Foundation, Owner Records, Investor Records, Tax Review, and Legal Review.
- **Dormant Pass-Through Review** depends on Pass-Through Reserve, Legal Escheatment Policy, and Accountant Review.
- **Owner Transactions** depend on Multi-Entity Foundation, Mixed-Use Rules, and Accountant Review.
- **Financial Digital Twin** depends on Forecasting, Cash Forecast, Revenue Forecast, and Financial Relationship Graph.
