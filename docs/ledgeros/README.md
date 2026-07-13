# LedgerOS Documentation Index

LedgerOS = **Financial Operating System**. Independent of any operational
platform. Owns financial truth; connects to operational systems (starting
with ServiceConnect) through a stable Financial Integration Layer.

Read in order:

1. [Architecture](./01-architecture.md) — product definition, boundaries,
   target architecture.
2. [Data Model](./02-data-model.md) — logical entities across foundation,
   ledger, AR, AP, banking, integrations.
3. [Double-Entry Model](./03-double-entry-model.md) — invariants, posting
   engine, canonical postings, period close.
4. [Integration Architecture](./04-integration-architecture.md) — principles
   and controls of the Financial Integration Layer.
5. [ServiceConnect Integration Contract](./05-serviceconnect-integration.md)
   — event ownership, flow, reconciliation between systems.
6. [Accounting Workflows](./06-accounting-workflows.md) — invoice, payment,
   refund, credit, AP, banking, close, role matrix.
7. [Phase Roadmap](./07-phase-roadmap.md) — Phase 1 → 8 sequencing.
8. [Backend Implementation Plan](./08-backend-implementation-plan.md) —
   runtime, module layout, testing, deployment.
9. [API Contract Map](./09-api-contract-map.md) — every surface, grouped
   by audience.
10. [Security & Tenant Isolation](./10-security-tenant-isolation.md) —
    threat model, RLS, idempotency, audit, secrets.

Companion docs:

- `docs/production-handoff/serviceconnect-api.md` — wire-level ServiceConnect
  contract (v1).
- `LEDGER_SERVICECONNECT_INTEGRATION_AUDIT.md` — historical audit that led
  to this architecture alignment.

## Product Rules (do not break)

- LedgerOS owns financial truth; operational systems own operational truth.
- No CCA-wide framing. No client-specific operational workflows in LedgerOS.
- APEX is the Executive Intelligence Layer — read-only over the ledger.
- No executive-only features ship ahead of the accounting foundation they
  explain.
- Every mutation is audited. Posted journals are immutable. Corrections use
  reversing entries.
- All external writes are idempotent, tenant-scoped, and audited.
