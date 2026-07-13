# Version 1 Roadmap — Required Before Launch

Live view: `/feature-registry/releases`

Version 1 is the minimum LedgerOS surface required to move CCA off Zoho Books
onto LedgerOS as the accounting system of record. Every feature listed here
carries the `production_critical` flag and requires backend implementation.

## Included

- Core Accounting (GL, COA, journals, reversals, locked periods, monthly close, trial balance, balance sheet, P&L, cash flow, audit log, policies, close checklist, reconciliation, export packets)
- Banking & Cash (accounts, Navy Federal import, transactions, matching, reconciliation, outstanding checks, cash forecast, true available cash, restricted cash, payroll/tax/commission/pass-through reserves, guardrails, transfer approval)
- Revenue Allocation (CCA service revenue, pass-through, commission, tax, deferred revenue, refundable deposits, qualifier payables, third-party costs, revenue recognition, allocation rules/preview/audit, expired reserve review, dormant pass-through review, controlled reclassification, refund review)
- Invoicing & Receivables (customers, estimates, invoices, recurring, credit notes, statements, deposits, retainers, milestone billing, payment links, payment reminders, collection prioritization, margin preview, allocation preview)
- Markup Tracking (all 16 markup features)
- Payments
- Expenses & Bills (submission, receipts, OCR, reports, approvals, reimbursements, missing receipt, duplicate detection, policy engine, bank match, subscription match, client-reimbursable, vendor spend)
- Reconciliation (bank + accounting)
- Monthly Close
- Audit Log
- Admin Users, Roles & Permissions
- Sales Integration (Zoho CRM, Zoho Forms, QualifierConnect, Tara OS)
- Compensation Plans, Calculations, Approvals, Commission Payables (all 21 compensation intelligence features + 25 commission types marked P0)
- Check Writing (all 31 check features)
- Owner Transactions (all 19 owner-finance features)
- Profit Sharing (all 22 profit-sharing / ownership-participation features)
- Dormant Pass-Through Review
- ADP Payroll Summary Integration
- Legal/Tax Review Flags
- Multi-Entity Foundation (all 20 multi-entity features)
- Integration Framework
- Security
- Production Readiness

## Gates

- Christin / Carmen accounting sign-off on Core Accounting, Revenue Allocation, Compensation, Owner Finance.
- Legal review on Profit Sharing, Investor Distributions, Commission Types, Dormant Pass-Through.
- Tax review on all disbursement classes.
- Navy Federal and ADP integration contracts frozen.
