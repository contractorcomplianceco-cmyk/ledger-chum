# Phase 6 — Expanded Impact Assessment

Status: **Assessment only.** No broad UI or API changes until this document is
reviewed. Legally and financially distinct payment/disbursement classes are
enumerated in §13; UI, API, ledger posting, tax reporting, and permissions all
key off those classes and must never collapse them.

Scope additions since the last Phase 6 plan:

- Owner activity (expenses, draws, distributions, contributions, reimbursements, due-to/from-owner)
- Legal bills + restricted legal-matter access
- Taxes, tax reserves, tax opportunities, accountant-review workflow
- Payroll via ADP + reimbursements + special-pay situations
- Employee benefits + total workforce cost
- Company travel, conventions, trade shows, trips, planned events
- Continuing education / personal-development budgets
- Employee appreciation
- Giveaways, contests, prizes, promotional programs
- Nonprofit, charity, sponsorship, community-impact spending
- International employees and consultants
- Consultants, R&D, innovation spend
- Parent / sister / intercompany + consolidated reporting
- Tax write-off + savings-opportunity identification
- Smarter billing recommendations
- Fully customizable invoices
- AI-generated invoice drafts with human approval

---

## 1. Domain model

New/expanded entities. Every one is scoped by `entity_id` (multi-entity — see §8)
unless noted. All monetary fields are `numeric(18,2) USD` (multi-currency
deferred; foreign FX handled as a normalized posting per §11 of the currency
addendum).

### 1.1 Owner activity

- `owner_account(id, entity_id, owner_user_id, kind: 'member'|'partner'|'shareholder', ownership_pct, active_from, active_to)`
- `owner_capital_event(id, owner_account_id, class: 'contribution'|'draw'|'distribution'|'reimbursement', amount, effective_date, memo, source_txn_id, approval_id, journal_id)`
- `due_to_from_owner(id, owner_account_id, direction: 'due_to'|'due_from', principal, accrued_interest?, terms?, opened_at, closed_at)`
- Owner **expense reimbursements** flow through the same `expense_report` table
  as employees but with `submitter_kind = 'owner'`; posting account differs.

Legal distinction: draw vs distribution vs contribution vs reimbursement are
never merged (see §13). Owner reimbursements post to expense accounts, not to
equity.

### 1.2 Legal

- `legal_matter(id, entity_id, title, matter_number, counsel_firm, matter_type, opened_at, closed_at, privileged: bool, access_list: user_id[])`
- `legal_bill(id, matter_id, vendor_id, bill_id, hours?, rate?, expenses?, retainer_applied?, privileged: bool)`
- Row-level access enforced by `legal_matter.access_list` — see §3.

### 1.3 Tax

- `tax_reserve_account(id, entity_id, jurisdiction, tax_year, target_pct, funded_amount, balance)`
- `tax_opportunity(id, entity_id, tax_year, category, description, estimated_savings, status: 'draft'|'accountant_review'|'accepted'|'rejected', evidence[], approver_id?)`
- `tax_flag(id, subject_kind, subject_id, code, severity, note, resolved_at?)` — attached to any transaction, invoice, bill, journal, or period.
- `accountant_review(id, subject_kind, subject_id, reviewer_id, status, findings, resolved_at?)`

### 1.4 Payroll / ADP

- `payroll_run(id, entity_id, adp_run_id, pay_period_start, pay_period_end, pay_date, status, totals: {gross, taxes, benefits, net, er_taxes, er_benefits})`
- `payroll_line(id, payroll_run_id, employee_id, earnings[], deductions[], taxes[], benefits[], net)`
- `special_pay(id, employee_id, class: 'bonus'|'commission'|'retro'|'severance'|'referral'|'signing'|'spot'|'other', amount, payroll_run_id?, journal_id?, source_id?)`
- `benefit_enrollment(id, employee_id, plan_id, tier, ee_cost, er_cost, effective_from, effective_to?)`
- `workforce_cost_period(entity_id, period, employee_id, wages, er_taxes, benefits, bonuses, commissions, reimbursements, equipment, training, travel, total)`

### 1.5 Travel, events, education, appreciation

- `event(id, entity_id, kind: 'convention'|'trade_show'|'company_trip'|'offsite'|'client_event'|'other', name, start_date, end_date, budget, actual_total, sponsor?)`
- `event_attendee(event_id, employee_id, role, travel_budget, actual)`
- `travel_request(id, employee_id, purpose, dates, destinations, estimated_cost, approval_id, event_id?)`
- `education_budget(employee_id, year, annual_budget, used, remaining)`
- `education_request(id, employee_id, program, provider, amount, approval_id, completion_status)`
- `appreciation_event(id, kind: 'gift'|'lunch'|'anniversary'|'milestone'|'holiday', recipients[], per_head, total)`

### 1.6 Giveaways, prizes, promotions

- `promo_program(id, entity_id, kind: 'giveaway'|'contest'|'prize'|'referral_bonus'|'loyalty', budget, start, end, tax_reportable: bool)`
- `promo_award(id, program_id, recipient_kind: 'employee'|'customer'|'prospect'|'public', recipient_ref, fmv, w9_collected?, 1099_required?)`

### 1.7 Charitable / sponsorship / community

- `charitable_recipient(id, name, ein?, kind: '501c3'|'sponsor'|'community'|'other', verified: bool)`
- `charitable_contribution(id, entity_id, recipient_id, amount, in_kind_fmv?, kind: 'donation'|'sponsorship'|'community_impact', tax_deductible: bool, receipt_url)`

Distinction: **charitable contribution** vs **marketing sponsorship** is
recorded on this record and never inferred at posting time. Deductibility rules
differ; see §13.

### 1.8 International workforce

- `worker(id, entity_id, kind: 'w2_employee'|'1099_contractor'|'intl_employee'|'intl_contractor'|'eor_employee', country, currency, tax_id_kind, tax_id_last4, engagement_start, engagement_end?)`
- `intl_payment(id, worker_id, gross_local, fx_rate, gross_usd, withholding, method: 'wise'|'deel'|'adp_global'|'wire'|'other', doc_refs[])`

### 1.9 Consultants / R&D / innovation

- `consulting_engagement(id, vendor_id, sow_url, start, end, cap_amount, r_and_d: bool, project_id?)`
- `rd_project(id, name, category, capitalize: bool, section174_class, start, end)` — flagged for §174 amortization treatment.

### 1.10 Multi-entity / consolidation

- `entity(id, legal_name, dba?, ein, entity_kind: 'parent'|'sister'|'sub'|'jv', parent_id?, ownership_pct?, functional_ccy)`
- `intercompany_txn(id, from_entity_id, to_entity_id, kind: 'loan'|'transfer'|'shared_service'|'management_fee'|'reimbursement', amount, journal_pair_id, eliminated: bool)`
- `consolidation_run(id, period, method: 'full'|'proportional'|'equity', elim_rules_version, output_ref)`

### 1.11 Invoicing v2 (customizable + AI draft)

- `invoice_template(id, entity_id, name, layout_kind, brand: {logo, colors, fonts}, blocks[], defaults: {payment_terms, footer, remittance}, active)`
- `invoice_draft(id, entity_id, source: 'ai'|'human'|'recurring'|'estimate_convert', ai_run_id?, status: 'draft'|'human_review'|'approved'|'rejected', payload, confidence?, evidence[])`
- `ai_invoice_run(id, prompt_ctx, model, tokens_in, tokens_out, cost, reviewer_id?, decision, decision_at?)`

### 1.12 Billing recommendations

- `billing_recommendation(id, customer_id?, service_id?, kind: 'raise_rate'|'unbilled_work'|'missed_recurring'|'convert_estimate'|'bundle', evidence[], estimated_lift, status)`

---

## 2. Typed API contracts

All endpoints under `/api/v1/*`. Cookie-session auth (existing). JSON in/out.
Response envelope `{ data, meta?, warnings? }`. Errors use `errors.ts` shape.

Naming convention: `<domain>.<action>` maps 1:1 to a service method on the
existing `LedgerOSApi` client. New service modules:

- `owners` — draws, distributions, contributions, reimbursements, DTFO
- `legal` — matters (privileged), bills
- `tax` — reserves, opportunities, flags, accountant review
- `payroll` — runs (read from ADP), lines, special pay, benefits, workforce cost
- `events` — events, attendees, travel requests
- `education` — budgets, requests
- `appreciation` — events
- `promos` — programs, awards
- `charity` — recipients, contributions
- `intl` — workers, payments
- `consulting` — engagements, R&D projects
- `entities` — entities, intercompany, consolidation
- `invoicing_v2` — templates, drafts, AI runs (extends existing `invoices`)
- `recommendations.billing` — billing recommendations

Every mutation endpoint requires: `permission`, `audit_event`, optional
`approval_workflow`, optional `posting_effect` (see §4). Read endpoints declare
`row_scopes` (entity_id, legal_matter.access_list, worker.confidentiality).

Idempotency: all POST that produce a journal or a payment MUST accept an
`Idempotency-Key` header and store it on the created record for 7 days.

### 2.1 Endpoint counts (net new)

| Domain             | GET | POST | PATCH | DELETE |
| ------------------ | --- | ---- | ----- | ------ |
| Owners             | 8   | 6    | 3     | 1      |
| Legal              | 6   | 4    | 3     | 0      |
| Tax                | 9   | 7    | 4     | 1      |
| Payroll            | 7   | 3    | 2     | 0      |
| Events             | 6   | 5    | 3     | 1      |
| Education          | 4   | 3    | 2     | 0      |
| Appreciation       | 3   | 2    | 1     | 1      |
| Promos             | 5   | 4    | 2     | 1      |
| Charity            | 4   | 3    | 2     | 0      |
| International      | 5   | 4    | 2     | 1      |
| Consulting / R&D   | 5   | 3    | 2     | 1      |
| Entities / Consol. | 7   | 4    | 2     | 0      |
| Invoicing v2 + AI  | 6   | 5    | 3     | 1      |
| Billing recos      | 3   | 2    | 2     | 0      |
| **Total net-new**  | 78  | 55   | 33    | 8      |

Detailed request/response schemas produced in the per-domain contract docs (see §12).

---

## 3. Permission matrix

New permissions (namespaced). Existing role keys (`owner`, `accounting_lead`,
`systems_reviewer`, `accountant`, `team_member`, `integration_service`) plus
two additions: `legal_counsel` (matter-scoped) and `external_accountant`
(read + comment, no post).

Key rule: **Legal matters are opt-in accessible.** Even `owner` role does not
automatically see privileged matters unless present in
`legal_matter.access_list`. `systems_reviewer` can enumerate matter IDs and
counts for audit but not content.

| Permission                                    | Owner  | Acct Lead | Reviewer     | Accountant | Team | Integ | Legal | Ext. Acct |
| --------------------------------------------- | ------ | --------- | ------------ | ---------- | ---- | ----- | ----- | --------- |
| `owners.capital.read`                         | ✓      | ✓         | ✓ (masked)   | ✓          | —    | —     | —     | ✓         |
| `owners.capital.write`                        | ✓      | ✓         | —            | approval   | —    | —     | —     | —         |
| `owners.reimbursement.submit`                 | ✓      | —         | —            | —          | —    | —     | —     | —         |
| `owners.dtfo.read`                            | ✓      | ✓         | ✓            | ✓          | —    | —     | —     | ✓         |
| `legal.matter.read`                           | scoped | scoped    | count-only   | scoped     | —    | —     | ✓     | scoped    |
| `legal.matter.write`                          | scoped | —         | —            | —          | —    | —     | ✓     | —         |
| `legal.bill.approve`                          | scoped | —         | —            | —          | —    | —     | ✓     | —         |
| `tax.reserve.read`                            | ✓      | ✓         | ✓            | ✓          | —    | —     | —     | ✓         |
| `tax.reserve.fund`                            | ✓      | approval  | —            | —          | —    | —     | —     | —         |
| `tax.opportunity.read`                        | ✓      | ✓         | ✓            | ✓          | —    | —     | —     | ✓         |
| `tax.opportunity.review`                      | —      | —         | —            | —          | —    | —     | —     | ✓         |
| `tax.opportunity.accept`                      | ✓      | —         | —            | —          | —    | —     | —     | —         |
| `tax.flag.write`                              | ✓      | ✓         | —            | ✓          | —    | —     | —     | ✓         |
| `payroll.run.read`                            | ✓      | ✓         | ✓ (masked)   | ✓          | own  | —     | —     | ✓         |
| `payroll.special_pay.write`                   | ✓      | approval  | —            | —          | —    | —     | —     | —         |
| `payroll.benefits.read`                       | ✓      | ✓         | ✓ (agg)      | ✓          | own  | —     | —     | ✓         |
| `events.read` / `events.write`                | ✓      | ✓         | ✓ / —        | ✓ / —      | own  | —     | —     | ✓ / —     |
| `education.budget.read`                       | ✓      | ✓         | ✓ (agg)      | ✓          | own  | —     | —     | ✓         |
| `education.request.approve`                   | ✓      | ✓         | —            | limit      | —    | —     | —     | —         |
| `appreciation.write`                          | ✓      | ✓         | —            | limit      | —    | —     | —     | —         |
| `promos.program.write`                        | ✓      | ✓         | —            | —          | —    | —     | —     | —         |
| `promos.award.write` (triggers 1099)          | ✓      | ✓         | —            | limit      | —    | —     | —     | —         |
| `charity.contribution.write`                  | ✓      | approval  | —            | —          | —    | —     | —     | —         |
| `intl.worker.read` / `intl.worker.write`      | ✓      | ✓         | ✓ (masked)/— | ✓/limit    | —    | —     | —     | ✓ / —     |
| `intl.payment.write`                          | ✓      | approval  | —            | —          | —    | —     | —     | —         |
| `consulting.engagement.write`                 | ✓      | ✓         | —            | limit      | —    | —     | —     | —         |
| `rd.project.classify` (§174)                  | ✓      | ✓         | ✓            | —          | —    | —     | —     | ✓         |
| `entities.consolidate`                        | ✓      | ✓         | ✓            | —          | —    | —     | —     | ✓         |
| `intercompany.write`                          | ✓      | approval  | —            | —          | —    | —     | —     | —         |
| `invoicing.template.write`                    | ✓      | ✓         | —            | ✓          | —    | —     | —     | —         |
| `invoicing.ai_draft.generate`                 | ✓      | ✓         | —            | ✓          | —    | —     | —     | —         |
| `invoicing.ai_draft.approve` (human required) | ✓      | ✓         | —            | limit      | —    | —     | —     | —         |
| `billing.recommendation.read`                 | ✓      | ✓         | ✓            | ✓          | —    | —     | —     | ✓         |

`approval` = requires workflow approval above threshold. `scoped` = only if in
`legal_matter.access_list`. `masked` = amount/PII masked. `count-only` = count
and existence, no field-level content. `agg` = aggregate totals only.

---

## 4. Audit-event catalog

Every mutation emits at least one event. Immutable append-only `audit_event`
table (existing). New event codes:

Owner: `owner.contribution.recorded`, `owner.draw.recorded`,
`owner.distribution.recorded`, `owner.reimbursement.submitted`,
`owner.reimbursement.approved`, `owner.dtfo.opened`, `owner.dtfo.closed`,
`owner.dtfo.adjusted`.

Legal: `legal.matter.created`, `legal.matter.access_granted`,
`legal.matter.access_revoked`, `legal.matter.closed`, `legal.bill.received`,
`legal.bill.approved`, `legal.bill.paid`, `legal.privilege.accessed`
(read-audit for privileged docs).

Tax: `tax.reserve.funded`, `tax.reserve.disbursed`,
`tax.opportunity.created`, `tax.opportunity.reviewed`,
`tax.opportunity.accepted`, `tax.opportunity.rejected`, `tax.flag.raised`,
`tax.flag.resolved`, `accountant_review.opened`, `accountant_review.closed`.

Payroll: `payroll.run.ingested`, `payroll.run.reconciled`,
`payroll.special_pay.recorded`, `payroll.benefit.enrolled`,
`payroll.benefit.terminated`, `payroll.workforce_cost.recomputed`.

Events / travel / education / appreciation: `event.created`, `event.closed`,
`travel.requested`, `travel.approved`, `education.requested`,
`education.approved`, `education.completed`, `appreciation.recorded`.

Promos: `promo.program.opened`, `promo.award.granted`, `promo.1099.flagged`.

Charity: `charity.recipient.verified`, `charity.contribution.recorded`,
`charity.receipt.attached`.

International: `intl.worker.onboarded`, `intl.worker.offboarded`,
`intl.payment.sent`.

Consulting / R&D: `consulting.engagement.signed`,
`rd.project.classified_174`, `rd.project.reclassified`.

Entities: `entity.created`, `intercompany.recorded`,
`intercompany.eliminated`, `consolidation.run.executed`.

Invoicing v2 / AI: `invoice.template.created`, `invoice.template.published`,
`invoice.ai_draft.generated`, `invoice.ai_draft.reviewed`,
`invoice.ai_draft.approved`, `invoice.ai_draft.rejected`,
`invoice.customized.sent`.

Billing recos: `billing.recommendation.surfaced`,
`billing.recommendation.accepted`, `billing.recommendation.dismissed`.

Every event: `{id, code, actor_id, subject_kind, subject_id, entity_id,
correlation_id, ip, ua, before_hash?, after_hash?, payload, at}`. Legal and
payroll events additionally carry `sensitivity: 'privileged'|'sensitive'|'normal'`.

---

## 5. Route inventory (net new)

Under existing routing tree. Placeholder only until impact assessment is
signed off.

- `/owners` (index) + `/owners/capital`, `/owners/draws`, `/owners/distributions`, `/owners/contributions`, `/owners/reimbursements`, `/owners/due-to-from`, `/owners/$ownerId`
- `/legal` + `/legal/matters`, `/legal/matters/$matterId`, `/legal/bills`, `/legal/bills/$billId`, `/legal/access`
- `/tax` + `/tax/reserves`, `/tax/opportunities`, `/tax/opportunities/$id`, `/tax/flags`, `/tax/accountant-review`, `/tax/write-offs`
- `/payroll` + `/payroll/runs`, `/payroll/runs/$runId`, `/payroll/special-pay`, `/payroll/benefits`, `/payroll/workforce-cost`, `/payroll/adp-health`
- `/workforce/events`, `/workforce/events/$eventId`, `/workforce/travel`, `/workforce/education`, `/workforce/appreciation`
- `/promos` + `/promos/programs`, `/promos/programs/$id`, `/promos/awards`, `/promos/1099-queue`
- `/charity` + `/charity/recipients`, `/charity/contributions`, `/charity/sponsorships`
- `/international` + `/international/workers`, `/international/payments`
- `/consulting` + `/consulting/engagements`, `/consulting/rd-projects`
- `/entities` + `/entities/directory`, `/entities/$entityId`, `/entities/intercompany`, `/entities/consolidation`
- `/invoicing/templates`, `/invoicing/templates/$id`, `/invoicing/ai-drafts`, `/invoicing/ai-drafts/$id`
- `/recommendations/billing`

All permission-gated per §3. All render `RestrictedState` when the caller lacks
access. Legal routes render `count-only` versions for reviewers.

---

## 6. Commission and participation architecture (expanded)

The 14 commission plan types from earlier Phase 6 remain. Expanded to
distinguish **participation classes** at the plan level so posting, tax
treatment, and reporting differ:

| Participation class       | Posting account    | Payroll?           | 1099?             | W-2 box      |
| ------------------------- | ------------------ | ------------------ | ----------------- | ------------ |
| `commission`              | Comp — Commission  | via ADP            | —                 | Wages        |
| `bonus`                   | Comp — Bonus       | via ADP            | —                 | Wages        |
| `profit_share`            | Comp — Profit Sh.  | via ADP            | —                 | Wages        |
| `spot_award` (cash)       | Comp — Discretion. | via ADP            | —                 | Wages        |
| `referral_bonus_ee`       | Comp — Referral    | via ADP            | —                 | Wages        |
| `referral_fee_external`   | Marketing          | —                  | 1099              | —            |
| `affiliate_fee`           | Marketing          | —                  | 1099              | —            |
| `strategic_partner_fee`   | COGS/Marketing     | —                  | 1099              | —            |
| `contractor_payment`      | COGS/Ops           | —                  | 1099              | —            |
| `owner_draw`              | Equity — Draw      | —                  | —                 | K-1          |
| `owner_distribution`      | Equity — Distrib.  | —                  | —                 | K-1          |
| `owner_reimbursement`     | Expense (actual)   | —                  | —                 | —            |
| `employee_reimbursement`  | Expense (actual)   | via ADP (non-cash) | —                 | non-taxable  |
| `investor_distribution`   | Equity — Distrib.  | —                  | 1099-DIV possible | —            |
| `charitable_contribution` | Charity            | —                  | —                 | Sched A/1120 |
| `marketing_sponsorship`   | Marketing          | —                  | 1099 if svc       | —            |
| `pass_through_disburse`   | Liability clearing | —                  | —                 | —            |

Rules:

1. Class is chosen at record creation and immutable. Reclassification requires
   reversal + new record + `journal.reclass` audit event.
2. Commission plan definitions carry a `participation_class` field; the
   calculator enforces the class's posting and reporting behavior. No plan may
   emit multiple classes on a single line.
3. Pass-through disbursements never touch revenue or expense — they land in a
   liability clearing account and net to zero after the actual disbursement
   posts.
4. Owner reimbursement vs owner draw is decided by the presence of a valid
   business-expense receipt; without a receipt, the record cannot be classified
   as reimbursement.

---

## 7. Check-writing architecture

New capability. Physical + printed + wire + ACH + card, unified.

- `payment_instruction(id, entity_id, payee_kind, payee_ref, amount, method: 'check'|'ach'|'wire'|'card'|'cash', purpose_class, source_bill_id?, source_reimb_id?, source_special_pay_id?, memo, requested_by, requested_at, approval_id?, status, external_ref?, cleared_at?)`
- `check_stock(id, entity_id, bank_account_id, series, next_number, active)`
- `check_print_batch(id, entity_id, printed_by, printed_at, count, first_number, last_number, void_list[])`
- `payment_posting(instruction_id, journal_id, ap_settled_ids[])`

Rules:

1. Every check has a `purpose_class` from §13. UI never lets a user cut a check
   without one.
2. Voids are a separate `payment_instruction.status = 'voided'` with a paired
   reversal journal — never a silent update.
3. Signature authority is a permission (`payments.check.sign`, tiered by
   amount). Two-signature checks above threshold require two `approval_ids`.
4. Positive Pay export produced per `check_print_batch`; the export file's
   hash is stored on the batch record.
5. ACH/wire share the same `payment_instruction` shape; `method` drives the
   downstream integration (NACHA file, Fed wire ticket, ADP special-pay for
   payroll-adjacent items).

---

## 8. Multi-entity architecture

- Every posting-carrying table has `entity_id NOT NULL`. Users have
  `entity_membership(user_id, entity_id, role)` — role is per-entity.
- COA can be shared (`chart_of_accounts_root`) with per-entity account
  overrides.
- Intercompany transactions post **paired journals** with matching
  `intercompany_txn_id`; consolidation elimination reads this pair.
- Consolidation runs are read-only outputs. Sub-entity ledgers remain the
  source of truth.
- Currency: functional currency per entity; consolidation translates via
  `fx_rate_snapshot(period, from_ccy, to_ccy, rate_kind: 'avg'|'closing')`.
- Cross-entity payments (e.g., parent pays sister's vendor) create a
  `pass_through_disbursement` + `intercompany_txn` pair.

Access rule: `owner`, `accounting_lead`, `systems_reviewer`, and
`external_accountant` can scope to `all_entities`. All other roles are
entity-scoped.

---

## 9. Payroll / ADP integration contracts

Direction: **ADP is source of truth for runs, taxes, benefits, and net pay.**
LedgerOS mirrors + posts.

- Inbound (ADP → LedgerOS):
  - `payroll_run.ingested` — one per finalized run, includes lines,
    employer taxes, benefits, deductions.
  - `employee.master.upsert` — daily delta.
  - `benefit.enrollment.upsert` — event-driven.
  - `wage_garnishment.upsert` — sensitive, restricted.
- Outbound (LedgerOS → ADP):
  - `special_pay.submitted` — bonus/commission/spot/retro amounts staged
    for the next run. Requires approval per §3.
  - `reimbursement.submitted` — non-taxable expense reimbursements to be paid
    with net pay.
- Reconciliation: after each run, `payroll_reconciliation(run_id, gl_total,
adp_total, variance, resolved_at)`. Variance > $1 blocks close.
- Contracts are documented in `payroll-adp-contract.md` (per §12).
- International payroll (Deel/Remote/EOR) uses the same shape via
  `intl_payroll_provider` adapter — never merged with ADP records.

Special-pay classes routed through ADP: `bonus`, `commission`, `spot_award`,
`referral_bonus_ee`, `retro`, `severance`. Never routed through ADP:
`contractor_payment`, `affiliate_fee`, `owner_draw`,
`owner_distribution`, `charitable_contribution`, `marketing_sponsorship`.

---

## 10. Invoice-template & AI invoice architecture

### 10.1 Templates

- `invoice_template.blocks` is an ordered array of typed blocks:
  `header`, `bill_to`, `line_items`, `subtotal`, `tax`, `discount`,
  `deposit_applied`, `payment_instructions`, `terms`, `footer`,
  `custom_html` (sanitized), `signature`, `attachments_list`.
- Brand fields: logo asset id, primary/secondary colors, font family from
  approved list.
- Templates versioned; sent invoices carry `template_version_id` so re-render
  reproduces the sent artifact byte-for-byte.
- Preview endpoint renders to PDF via server (never in browser) for parity.

### 10.2 AI invoice drafts

Flow: `context → generate → human review → approve → send`.

- Context inputs: customer, active contracts, unbilled time/entries,
  recurring schedule, prior invoice patterns, price book.
- Model call server-side only. `ai_invoice_run` records prompt hash, model,
  cost.
- Output constraints:
  - No line item without a source reference (contract line, time entry, price
    book id).
  - No total that fails margin floor check (uses existing margin preview).
  - No customer contact info generated — must come from CRM record.
- **Human approval is mandatory.** No AI-drafted invoice may auto-send. The
  `invoice.ai_draft.approve` permission is separate from
  `invoice.send`.
- Rejection captures reason and feeds a fine-tuning queue (opt-in).

---

## 11. Tax / legal review flags

- `tax_flag` and `legal_flag` are subject-generic — attachable to any
  transaction, invoice, bill, journal, event, promo award, charitable
  contribution, or period.
- Flag codes examples: `tax.deductibility_question`,
  `tax.1099_required`, `tax.state_nexus_risk`,
  `tax.section174_candidate`, `tax.reserve_underfunded`,
  `tax.write_off_opportunity`, `legal.privileged`,
  `legal.retention_hold`, `legal.contract_review_needed`.
- Flags surface in an `Accountant Review Queue` and a `Legal Review Queue`.
- Only holders of `tax.flag.write` / `legal.matter.write` can create; only the
  respective reviewer roles can resolve.
- Tax opportunities (§1.3) are the positive counterpart — savings the system
  proactively surfaces (e.g., §179, §174 amortization capture, R&D credit,
  QBI, home office, accountable-plan reimbursements, vehicle actual vs.
  standard). Each carries evidence and an estimated dollar value; acceptance
  requires accountant review.

---

## 12. Production handoff backlog

Documents to produce before implementation (in `docs/production-handoff/`):

1. `owner-activity-schema.md` + `owner-activity-api-contract.md`
2. `legal-matter-schema.md` + `legal-access-policy.md`
3. `tax-domain-schema.md` + `tax-opportunity-workflow.md` + `accountant-review-workflow.md`
4. `payroll-adp-contract.md` + `special-pay-routing.md` + `benefits-workforce-cost.md`
5. `events-travel-education-schema.md`
6. `appreciation-promos-schema.md` + `1099-routing.md`
7. `charitable-contribution-policy.md`
8. `international-workforce-schema.md`
9. `consulting-rd-schema.md` + `section-174-policy.md`
10. `multi-entity-schema.md` + `intercompany-elimination.md` + `consolidation-runbook.md`
11. `check-writing-schema.md` + `positive-pay-runbook.md` + `payment-method-matrix.md`
12. `invoice-template-schema.md` + `ai-invoice-policy.md` + `billing-recommendation-engine.md`
13. Updated `permission-matrix.md` (supersedes prior draft)
14. Updated `audit-event-catalog.md` (supersedes prior draft)
15. Updated `commission-schema.md` — participation-class table from §6
16. `disbursement-class-taxonomy.md` — §13 in this doc, formalized
17. Updated `backend-endpoint-backlog.md` — includes counts from §2
18. `acceptance-test-matrix.md` — one row per §13 class × per action

Existing docs from earlier Phase 6 plan (commission-schema, permission-matrix,
audit-event-catalog, backend-endpoint-backlog, etc.) are **superseded** and
must be regenerated to incorporate the expanded scope. Do not partially update.

---

## 13. Legally & financially distinct disbursement classes

**No collapsing.** Each class has its own posting account, its own tax report,
its own permission, its own audit code, its own downstream integration route.

| Class                     | GL bucket          | Tax reporting         | Cash-flow class | Routes via ADP? | Requires 1099? | Requires K-1? | Permission                               | Audit code root              |
| ------------------------- | ------------------ | --------------------- | --------------- | --------------- | -------------- | ------------- | ---------------------------------------- | ---------------------------- |
| Owner draw                | Equity             | K-1 (partnership) / — | Financing       | No              | No             | Yes (pship)   | `owners.capital.write` (draw)            | `owner.draw.*`               |
| Owner distribution        | Equity             | K-1 / 1099-DIV        | Financing       | No              | Sometimes      | Yes           | `owners.capital.write` (distrib)         | `owner.distribution.*`       |
| Owner reimbursement       | Expense (actual)   | Deduction on entity   | Operating       | No              | No             | No            | `owners.reimbursement.submit` + approval | `owner.reimbursement.*`      |
| Employee reimbursement    | Expense (actual)   | Non-taxable to EE     | Operating       | Yes (non-cash)  | No             | No            | `expenses.reimburse.approve`             | `expense.reimbursement.*`    |
| Bonus                     | Comp — Bonus       | W-2 wages             | Operating       | Yes             | No             | No            | `payroll.special_pay.write` (bonus)      | `payroll.bonus.*`            |
| Commission                | Comp — Commission  | W-2 wages             | Operating       | Yes             | No             | No            | `payroll.special_pay.write` (comm)       | `payroll.commission.*`       |
| Profit share              | Comp — PS          | W-2 wages / 401(k)PS  | Operating       | Yes             | No             | No            | `payroll.special_pay.write` (ps)         | `payroll.profit_share.*`     |
| Investor distribution     | Equity             | 1099-DIV / K-1        | Financing       | No              | Sometimes      | Sometimes     | `investors.distribute`                   | `investor.distribution.*`    |
| Affiliate fee             | Marketing          | 1099-NEC              | Operating       | No              | Yes            | No            | `marketing.affiliate.pay`                | `affiliate.fee.*`            |
| Strategic-partner payment | COGS / Marketing   | 1099-NEC              | Operating       | No              | Yes            | No            | `partners.strategic.pay`                 | `partner.strategic.*`        |
| Contractor payment        | COGS / Ops         | 1099-NEC              | Operating       | No              | Yes            | No            | `ap.contractor.pay`                      | `contractor.payment.*`       |
| Charitable contribution   | Charity            | Sched A / 1120 line   | Operating       | No              | No             | No            | `charity.contribution.write`             | `charity.contribution.*`     |
| Marketing sponsorship     | Marketing          | Ordinary business exp | Operating       | No              | If services    | No            | `marketing.sponsorship.pay`              | `marketing.sponsorship.*`    |
| Pass-through disbursement | Liability clearing | Not income / not exp  | Operating       | No              | No             | No            | `payments.passthrough.write`             | `passthrough.disbursement.*` |

Cross-class rules:

- Never post two of these classes on a single ledger line.
- Never reclassify without a reversal + new record.
- Never route a class through an integration that doesn't match its column
  above (e.g., a contractor payment must not flow through ADP).
- Every payment instruction (§7) carries exactly one class.
- Reporting screens (1099 queue, K-1 packet, charitable receipts pack,
  workforce cost, cash-flow classification) partition by class — never by
  free-text memo.

---

## 14. Out of scope (this assessment)

- Any UI implementation of the domains above.
- Any adapter wiring beyond the typed placeholders already delivered in 6A.
- Any change to authentication, Lovable Cloud, Supabase, or the real
  backend.
- Live ADP, live legal-matter storage, live payments — all remain mock until
  their respective handoff documents in §12 are signed off.

## 15. Confirmation required before implementation

1. Approve §13 disbursement-class taxonomy verbatim — every downstream design
   depends on it.
2. Approve §3 permission additions (`legal_counsel`, `external_accountant`).
3. Approve §8 multi-entity scoping model (per-entity role membership + shared
   COA root with overrides).
4. Approve §10.2 AI-invoice constraint that no AI-drafted invoice may
   auto-send.
5. Approve §9 special-pay routing table.

No route, table, endpoint, or service method from this assessment is
implemented until items 1–5 are confirmed.
