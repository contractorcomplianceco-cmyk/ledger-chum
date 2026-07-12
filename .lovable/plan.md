## Scope

Another massive spec — 20 sections spanning invoicing, expenses, intelligence, forecasting, procurement, and AI advisors. Matching how we shipped Phase 1 (Cash Availability): LedgerOS stays a **UI Design Lab** with mock data, no backend. I'll sequence this in phases and only build **Phase 2A — Core Invoicing with Allocation Preview** now, because it's the natural extension of the Cash Availability engine we just shipped and hits three of your six highest-priority differentiators (invoice-level allocation, spendable-cash impact preview, real-time margin preview).

Phases 2B (Expenses), 2C (Intelligence), and 2D (Predictive) will each get their own plan after 2A ships.

## Phase 2A — Core Invoicing + Allocation Preview

### New routes

```
/invoices                     → invoice list (replaces the current ComingSoon stub)
/invoices/new                 → invoice builder with live allocation preview
/invoices/$id                 → invoice detail: lines, allocation, margin, timeline
/estimates                    → estimate list
/estimates/new                → estimate builder (converts to invoice)
/customers                    → customer list (replaces ComingSoon stub)
/customers/$id                → customer profile: invoices, statements, portal link
/invoices/recurring           → recurring invoice schedules
/invoices/credit-notes        → credit notes & refunds
```

### Screens

**1. Invoice list (`/invoices`)**
- KPI strip: Outstanding, Overdue, Draft, Paid this month, Avg days to pay
- Filter chips: status (Draft/Sent/Partial/Paid/Overdue/Void), owner, client, date range
- Table columns: #, Client, Issued, Due, Total, **CCA revenue**, **Pass-through**, **Commission**, Status, Payment-likelihood chip
- Row click → detail panel (reuses `transaction-detail-panel` pattern)

**2. Invoice builder (`/invoices/new`)**
- Left: standard fields (client, dates, terms, PO, notes, template)
- Center: line-item editor. Each line: service, description, qty, rate, discount, tax, **treatment** (dropdown from the 9 treatments we already defined in `TREATMENT_META`), department, state, project, commission owner, refundability
- Right rail: **live Allocation Preview card** — the six-row table from your spec:
  - Total client charge
  - Expected CCA revenue
  - Restricted pass-through
  - Commission reserve
  - Estimated fulfillment cost (from a service-cost mock)
  - Estimated contribution margin (with % vs target, warning below target)
  - Estimated true-available-cash impact after collection
- Actions: Save draft, Send for approval, Send to client

**3. Invoice detail (`/invoices/$id`)**
- Header: #, client, status pill, total, balance, aging
- **Allocation breakdown** panel (reuses `AllocationRow` from Phase 1)
- Margin panel: revenue, pass-through, commission, labor, tech alloc, marketing CAC, gross margin, contribution margin, target delta
- Payment-likelihood card: score + top 3 drivers
- Timeline: created → sent → viewed → partial → paid, with actor & timestamp
- Right rail: activity, attachments, internal notes, customer notes, related pass-through obligations (links to `/cash-availability`)

**4. Estimates (`/estimates`, `/estimates/new`)**
- Same builder shape as invoices, minus payment fields; adds "Convert to invoice" action and client-approval status

**5. Customer list & profile (`/customers`, `/customers/$id`)**
- List: name, contact, balance, LTV, avg pay days, status
- Profile: contacts, billing profiles, invoices, statements, credits, payment methods (mock), portal-link preview, engagement history

**6. Recurring invoices & Credit notes**
- Simple list screens with schedule/status/next-run and issue/apply flows

### New components

- `src/components/invoicing/invoice-list-table.tsx`
- `src/components/invoicing/invoice-line-editor.tsx` — line row with treatment dropdown
- `src/components/invoicing/allocation-preview-card.tsx` — the six-row live preview
- `src/components/invoicing/margin-preview-card.tsx` — margin math + target warning
- `src/components/invoicing/payment-likelihood-chip.tsx` — advisory score pill
- `src/components/invoicing/invoice-status-badge.tsx`
- `src/components/invoicing/invoice-timeline.tsx`
- `src/components/invoicing/customer-summary-card.tsx`

Reuses from Phase 1: `TreatmentBadge`, `AllocationRow`, treatment metadata from `TREATMENT_META`.

### Mock data

- `src/lib/mock/invoicing.ts` — customers, invoices, estimates, recurring schedules, credit notes, service catalog with cost-per-service, target margins, payment-likelihood scores
- Extend `src/lib/mock/cash-availability.ts` only if needed to link obligations back to invoice IDs (they already share the pass-through concept)

### Sidebar / nav

- Promote **Sales** section (already in `NAV_PRIMARY`) to expanded state with children: Invoices, Estimates, Recurring, Credit Notes, Customers, Payments
- Wire executive dashboard's AR-related KPIs to `/invoices`

## Explicitly out of scope for Phase 2A

- **Expense system, receipts, policy engine, matching** → Phase 2B
- **Payment-likelihood ML, smart collections queue, revenue-leakage detector, subscription intelligence, merchant normalization, AI Spend Advisor** → Phase 2C (we'll show *static* mock payment-likelihood chips in 2A but not the queue or reasoning UI)
- **Cash & spend forecasting, budgets, scenarios, relationship graph** → Phase 2D
- **Client billing portal** → its own mini-phase after 2A (it's a separate surface)
- **Milestone/outcome billing configurator, procurement/vendor intelligence, pre-spend requests, exception-based accounting workspace** → later phases
- No backend, no auth, no persistence — Design Lab only

## Constraints honored

- Visual language: existing LedgerOS dark sidebar, gradient KPIs, shadcn tokens
- Reuses Phase 1 treatments and components — one source of truth for allocation logic
- No changes to `/cash-availability`, banking, or reconciliation screens beyond linking

## Confirm before I build

1. Ship **Phase 2A only** (Invoicing + Allocation Preview + Customers + Estimates + Recurring + Credit Notes) and queue 2B/2C/2D for later? Or a different first slice — e.g. expenses first, or portal first?
2. OK to expand the sidebar's **Sales** section with children (Invoices, Estimates, Recurring, Credit Notes, Customers, Payments) rather than flat entries?
3. For the allocation preview, keep the six-row layout from your spec verbatim, or fold it into a compact card + expandable detail?
