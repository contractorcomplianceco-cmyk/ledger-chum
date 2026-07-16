# 27 — First Pilot Simulation + Production Hardening (M12)

M12 proves the existing architecture works end-to-end. No new accounting
capabilities, no ServiceConnect-specific code, no auto-posting, no AI
mutation paths. This milestone is validation only.

The mandatory lifecycle is unchanged:

```
Operational Event
  → Financial Event Bus
  → Validation
  → Mapping
  → Approval
  → Materialization
  → Financial Object
  → Accounting Engine
  → Reports
  → Metrics
  → APEX Insight
```

## Deliverables

| Surface                     | Route                      | Purpose                                                                                                                                                                                                           |
| --------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pilot Simulation            | `/admin/pilot-simulation`  | Fictional pilot company profile (org, roles, fiscal periods, chart of accounts, integration source, mappings) and the scripted end-to-end walk-through referenced above. Read-only presentation of the lifecycle. |
| Production Review Center    | `/admin/production-review` | Consolidated view of the five review categories (security, accounting, integration, intelligence, migration) plus overall readiness. Rolls up signals already produced elsewhere.                                 |
| Accounting Acceptance Tests | `/admin/acceptance-tests`  | Scenario catalog covering revenue, payments, expenses, refunds, errors, reconciliation, and the close workflow. Each scenario names the surface that owns it — no shortcut execution here.                        |
| Pilot Success Dashboard     | `/admin/pilot-success`     | Advisory metrics for a pilot in flight: events processed, objects created, journals posted, reports generated, exceptions, audit completeness, intelligence generated.                                            |

## Invariants preserved

- Financial Event Bus is the only inbound path.
- Materialization Engine is the only writer to financial objects.
- Accounting Engine is the only writer to journals.
- Metrics Layer is the only source of canonical KPIs.
- APEX consumes intelligence via adapters — no raw ledger access from UI.
- AI is advisory-only. It cannot post, approve, or override controls.
- No ServiceConnect-specific accounting rules live in the ledger core.

## Fictional pilot company

The pilot simulation profile is presentation data used to demonstrate the
architecture; it is not seeded into the database. Actual pilot activation
happens through the existing Customer Onboarding workflow using the
Financial Event Bus, materialization engine, and accounting engine.

## Acceptance scenarios

Each scenario is a description + the surface where it is exercised (e.g.
"Revenue → post an invoice via the invoice workspace and confirm the
journal via the general ledger"). Nothing in M12 bypasses the accounting
engine.
