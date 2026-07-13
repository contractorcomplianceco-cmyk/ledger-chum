# Missing Backend Capabilities

Every feature with `requires_backend`, `requires_database`, or
`requires_api` is currently backed by mock data. No Supabase, no server
functions, no auth changes have been made in this planning phase.

## What must be built server-side before wiring V1

1. Postgres (or equivalent) schema for accounts, journals, journal lines, bank accounts, transactions, allocations, reserves, customers, invoices, expenses, bills, participants, compensation plans, calculations, statements, payables, payment batches, disbursements, checks, users, roles, permissions, audit events, and integration credentials.
2. Authentication + role-based access control aligned with the roles used in the mock (`owner`, `accounting_lead`, `systems_reviewer`, `accountant`, `team_member`, `integration_service`).
3. Audit log write path — every mutation persists actor, target_type, target_id, before, after, correlationId.
4. Locked-period enforcement.
5. Guardrail evaluation engine (cash, budget, subscription, bonus).
6. Integration adapters: Navy Federal, ADP, Zoho CRM/Forms/Books/Billing, Command Center, QualifierConnect, Tara OS.
7. Approval workflow engine (unified approval center).
8. Draft-vs-post separation — no automation may auto-post to the ledger without human approval.
9. Secret management for integration credentials.
10. Backup, retention, and recovery policy.
