# Master Feature Registry — LedgerOS

**Status:** Planning artifact only. No backend, Supabase, or auth changes.
**Source of truth:** `src/lib/mock/feature-registry.ts`
**UI:** `/feature-registry` (Admin nav, permission `implementation.view`)

This document is the authoritative human-readable index of every LedgerOS
feature discussed to date. It answers a single question:

> **Do we have this feature, and what stage is it in?**

## Status Model

Primary statuses:

- **Built** — shipped in production
- **Designed** — visual/interaction spec approved, no code yet
- **Typed/API Ready** — types + service contract exist; no UI
- **Mock UI Complete** — Design Lab screen exists, backed by mock data
- **Planned** — approved for the roadmap, not started
- **Blocked · Policy / Legal / Accounting / Integration / Backend** — waiting on a specific gate
- **In Production Build** — currently being wired
- **Ready for Testing / Parallel Run / Cutover**
- **Post-Launch**

Every feature record carries secondary flags (see UI) such as
`requires_backend`, `requires_legal_review`, `requires_accountant_review`,
`sensitive_data`, `high_financial_risk`, `production_critical`, and
`ai_advisory_only`.

## Registry Fields

Feature ID · Name · Module · Submodule · Description · Status · Flags ·
Existing route · Future route · Existing/future nav group · Roles ·
Permissions · Backend required · Entities · Endpoints · Integrations ·
Source systems · Financial/legal/accounting/tax/security risk · Owner ·
Reviewer · Priority · Target release · Dependencies · Blocking decisions ·
Acceptance criteria · Notes · Last updated · Linked spec / mock / audit /
test.

## Coverage

The registry covers all 33 categories requested, including:

1. Core Accounting · 2. Banking & Cash · 3. Revenue Allocation ·
4. Invoicing & Receivables · 5. Markup & Micro-Margin ·
6. Expenses & Reimbursements · 7. Travel, Events & Development ·
8. Employee Appreciation & Culture · 9. Payroll & Workforce ·
10. Employee Benefits · 11. Compensation Intelligence · 12. Commission Types ·
13. Profit Sharing & Ownership Participation · 14. Owner Finance ·
15. Investors, Strategic Partners & Affiliates ·
16. Check Writing & Disbursements · 17. Disbursement Classes ·
18. Legal, Tax & Professional Services · 19. Charity, Nonprofit & Community ·
20. Giveaways, Contests & Promotions · 21. Multi-Entity Accounting ·
22. International Staff & Consultants · 23. Procurement, Vendors & Assets ·
24. Research, Consulting & Innovation · 25. Technology & AI Economics ·
26. Marketing ROI · 27. Profitability · 28. Forecasting & Digital Twin ·
29. Financial Intelligence & AI · 30. Financial Relationship & Timeline ·
31. Automation & Controls · 32. Integrations · 33. Admin & Users.

## Editing Rules

- Every feature has exactly one record. Never duplicate.
- Priorities and release buckets are editable.
- Status changes and legal/accounting sign-offs must be dated.
- No planned feature is added to the live sidebar until it moves to Built.
