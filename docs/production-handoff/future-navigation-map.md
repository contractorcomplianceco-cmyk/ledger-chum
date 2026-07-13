# Future Navigation Map — LedgerOS

**Not the live sidebar.** The live sidebar today groups routes into
Overview, Accounting, Sales & Receivables, Purchases & Spend, Compensation,
Intelligence, Work Queues, Automation, and Admin. This document describes
the target future navigation structure once planned modules ship.

Live view: `/feature-registry/navigation`.

## Future Primary Groups

1. **Overview** — dashboard, alerts, health.
2. **Accounting** — ledger, close, allocation, reporting.
3. **Banking & Cash** — bank feeds, forecast, reserves, check writing, disbursements.
4. **Sales & Billing** — customers, estimates, invoices, receivables.
5. **Purchases & Spend** — bills, expenses, subscriptions, procurement.
6. **Compensation & Participation** — plans, calculations, statements, commission types.
7. **Payroll & People** — payroll, benefits, appreciation, international staff.
8. **Travel & Events** — travel, conventions, education.
9. **Profitability & Intelligence** — markup, marketing, forecasting, AI, relationship graph.
10. **Owner & Entity** — owners, investors, multi-entity, profit sharing.
11. **Legal, Tax & Community** — legal, tax, charity, giveaways.
12. **Assets & Procurement** — purchasing, fixed assets, vendors.
13. **Automation** — rules, approvals, guardrails.
14. **Integrations** — external systems.
15. **Admin** — users, roles, security, audit.

## Placement Rules

For every future feature, the registry records:

- `sidebar` — appears in the primary sidebar
- `child_only` — deep-link only; surfaces in breadcrumbs + command palette
- `tab` — nested inside another module
- `search_only` — indexed but not linked
- `hidden_until_built` — never surfaces until status ≠ Planned

**No planned module is added to the live sidebar** until it is Built. This
document is aspirational; the live navigation only mirrors what exists.
