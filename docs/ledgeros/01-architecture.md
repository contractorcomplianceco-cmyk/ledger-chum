# LedgerOS Architecture Document

**Version:** 1.0 — Architecture Alignment
**Status:** Foundational reference. Supersedes any prior CCA-centric framing.

## 1. Product Definition

LedgerOS is an **independent Financial Operating System**. It owns financial
truth — the general ledger, AR, AP, banking, reporting, tax framework, and
financial intelligence. It is not a module of any operational platform.

Operational systems (ServiceConnect, CRMs, ERPs, field-service, construction,
healthcare, professional services) own operational truth — customers,
locations, work orders, dispatch, technicians, labor capture, materials, and
workflow execution. They send **financial events** to LedgerOS through the
Financial Integration Layer.

## 2. System Boundaries

| Concern                          | Owner              |
| -------------------------------- | ------------------ |
| Customers (operational profile)  | Operational system |
| Locations, work orders, dispatch | Operational system |
| Technicians, labor capture       | Operational system |
| Materials issued, service history| Operational system |
| Operational approvals            | Operational system |
| Organizations (tenants)          | LedgerOS           |
| Fiscal periods, close controls   | LedgerOS           |
| Chart of accounts, GL, journals  | LedgerOS           |
| AR (invoices, payments, credits) | LedgerOS           |
| AP (vendors, bills, payments)    | LedgerOS           |
| Banking + reconciliation         | LedgerOS           |
| Financial reporting              | LedgerOS           |
| Tax reporting framework          | LedgerOS           |
| Profitability, intelligence      | LedgerOS (APEX)    |

Responsibilities never reverse. LedgerOS does not schedule work; operational
systems do not post journals.

## 3. Target Architecture

```text
+----------------------------+     +----------------------------+
|  Operational Platform(s)   |     |  Operational Platform(s)   |
|  ServiceConnect / CRM /    |     |  ERP / Construction / etc. |
|  Field Service / ...       |     |                            |
+-------------+--------------+     +-------------+--------------+
              \                                  /
               \                                /
                v                              v
        +---------------------------------------------+
        |     Financial Integration Layer (API)       |
        |  Auth · Tenant · Idempotency · Audit · Sync |
        +---------------------+-----------------------+
                              |
                              v
        +---------------------------------------------+
        |                  LedgerOS                   |
        |  Foundation · GL Engine · AR · AP · Banking |
        |  Reporting · APEX Intelligence Layer        |
        +---------------------------------------------+
```

## 4. Layered View

1. **Foundation** — organizations, users, roles, permissions, fiscal periods,
   audit, tenant isolation.
2. **Ledger Engine** — chart of accounts, journals, posting engine, period
   controls. Debit=Credit invariant. Never delete posted transactions.
3. **AR** — customers, invoices, payments, credits, refunds, aging, terms.
4. **AP** — vendors, bills, vendor payments, expenses, categories.
5. **Banking** — bank accounts, transactions, deposits, transfers, matching,
   reconciliation.
6. **Reporting** — Trial Balance, P&L, Balance Sheet, Cash Flow, AR/AP aging,
   job and customer profitability.
7. **Integration Layer** — external system registry, sync history,
   idempotency, per-tenant API clients, event contracts.
8. **APEX Intelligence Layer** — read-only explainable AI on top of the
   ledger. Cannot post, move money, or change accounting records.

## 5. Positioning

Category peers: QuickBooks, Sage, NetSuite, Xero, service-business
accounting. LedgerOS differentiates on:

- Integration-first architecture (multiple operational systems, one ledger)
- Financial intelligence with explainability
- Modern executive experience (APEX)
- Real-time profitability across systems
- Enterprise-grade auditability from day one

## 6. Non-Goals

- LedgerOS is not a CRM, dispatch system, or field-service platform.
- LedgerOS does not host client-specific operational workflows.
- APEX does not replace accounting foundations; it explains them.
