# Project APEX — Phase A Assessment

This is the pre-implementation assessment required by the "FIRST RESPONSE REQUIRED" section. No visual rewrite begins until you approve. All work stays in the Design Lab: no backend, no Supabase, no auth changes, no route renames, no removal of existing modules. Demonstration labeling remains persistent.

---

## 1. Existing routes → Executive Workspace mapping

Operational nav stays intact. Executive mode is an *optional overlay* that reorganizes the same routes into 5 workspaces.

**HOME** (`/apex/home` — new landing; pulls from many)
- `/` (current dashboard), `/dashboards/*`, `/audit` (recent decisions surface only), approvals summary from `/automation/approvals` + `/compensation/approvals`.

**MONEY**
- Cash: `/cash-availability`, `/cash-availability/allocations`, `/cash-availability/rules`
- Banking: `/banking`, `/banking/transactions`, `/banking/reconciliation`
- AR: `/invoices`, `/invoices/recurring`, `/invoices/credit-notes`, `/estimates`, `/payments`, `/customers`
- AP/Spend: `/bills`, `/vendors`, `/expenses/*` (list, receipts, subscriptions, approvals, reimbursements, recovery, matching, vendors)
- Ledger/Close: `/ledger/*`, `/close`, `/reports`

**GROWTH**
- Intelligence: `/intelligence` (Command Center), `/intelligence/marketing`, `/campaigns`, `/apps`, `/tech`, `/tech-portfolio`, `/clients`, `/services`, `/departments`, `/attribution`, `/forecasting`, `/profitability`, `/leakage`, `/recommendations`, `/confidence`
- Sales surfaces: `/customers`, `/invoices`, `/estimates`

**PEOPLE**
- Compensation: all 24 `/compensation/*` routes (plans, participants, attribution, eligibility, preview, calculations, verification, approvals, reserves, payables, statements, holdbacks, clawbacks, adjustments, disputes, reconciliation, audit, payment-batches)
- Bonus intelligence: `/intelligence/bonuses`, `/intelligence/bonus-plans`, `/intelligence/bonus-forecast`
- Expenses (personal): `/expenses/submit`, `/expenses/reimbursements`

**COMPANY**
- Overhead + tech: `/intelligence/overhead`, `/intelligence/overhead-anomalies`, `/intelligence/tech`, `/intelligence/apps`
- Automation (design-time): `/automation-center`, `/automation/rules`, `/automation/cash-controls`, `/automation/budget-controls`, `/automation/bonus-controls`, `/automation/subscription-actions`
- Work queues (runtime): `/automation/approvals`, `/automation/exceptions`, `/automation/collections`, `/automation/payables`, `/automation/revenue-recovery`, `/automation/data-quality`, `/automation/decision-log`, `/automation/action-plans`, `/automation/integration-health`
- Admin: `/integrations`, `/admin/users`, `/settings`, `/audit`, `/readiness/*`, `/implementation/*`, `/feature-registry/*`

## 2. Reusable existing components

`AppShell`, `PageHeader`, `PageBody`, `AppSidebar` (extend for nav mode toggle), `TopBar` + `Breadcrumbs` + `CommandPalette`, `KpiCard`, `StatusBadge`, `DemoNotice`, `IntelligencePage` tab shell, `ExplainabilityPanel` (already an evidence/reason pattern), `AppValueScore`, `ConfidenceGauge`, `ConfidenceIndicator`, `RecommendationCard`, `LeakageCard`, `MarginIndicator`, `BonusStatusBadge`, `WaterfallCard`, `GuardrailStrip`, `AllocationRow`, `ObligationList`, `TreatmentBadge`, all shadcn primitives. Mock adapters (`mockGet`, `mockMutation`) and typed service layer reused verbatim.

## 3. Existing design tokens that remain

Semantic tokens in `src/styles.css`: `--background`, `--foreground`, `--surface`, `--muted`, `--border`, `--primary`, `--info`, `--success`, `--warning`, `--destructive`, gradient tokens `--gradient-brand-full`, `--gradient-brand-cool`, `--gradient-sidebar`, `--gradient-sidebar-active`, `--shadow-side-active`, font-tabular utility. Sidebar stays deep navy.

## 4. New semantic tokens required

Added to `src/styles.css` (light default, controlled dark for intelligence surfaces):
- `--executive-surface` / `--executive-surface-foreground` — dark navy intelligence card
- `--executive-surface-elevated` — slightly lifted dark card
- `--executive-border` — hairline on dark surfaces
- `--pulse-cash`, `--pulse-profit`, `--pulse-growth`, `--pulse-team`, `--pulse-risk`, `--pulse-opportunity` — accent hues (electric blue / cyan / teal / violet / amber / rose) with matching `-foreground` and `-soft` (10% tint) pairs
- `--confidence-high`, `--confidence-medium`, `--confidence-low`
- `--freshness-fresh`, `--freshness-stale`
- `--gradient-executive` (deep navy → indigo), `--gradient-pulse-cool`, `--gradient-pulse-warm`
- `--shadow-executive`, `--shadow-pulse`
- Motion tokens: `--motion-fast`, `--motion-standard`, `--motion-reveal`

All shadcn components keep working; no hardcoded colors added.

## 5. Navigation 3.0 approach

- Add `useNavMode()` hook backed by `localStorage` key `ledgeros.nav-mode` (`"operational"` default, `"executive"` alt).
- `AppSidebar` reads mode. In executive mode it collapses to 5 workspace entries (Home / Money / Growth / People / Company) + Admin. Each expands into curated sub-links (subset of existing routes, no renames).
- A `NavModeSwitcher` in the sidebar footer toggles modes. Command palette gains a "Switch to Executive/Operational nav" command.
- Operational sidebar config (`NAV_GROUPS`) is untouched. New `EXECUTIVE_WORKSPACES` config in `src/lib/mock/nav-executive.ts` references existing `to:` paths only.
- Admin gets a single "Project APEX" entry (permission `implementation.view`) pointing to `/apex`. Child `/apex/*` routes are hidden from sidebar.

## 6. Executive Workspace shell layout

`ExecutiveShell` wraps `AppShell` with:
1. **Workspace header** — workspace name, primary decision question, period selector, "Ask LedgerOS" trigger.
2. **Pulse row** — 3–4 Pulse widgets relevant to workspace.
3. **Priority column** — Today's Priorities / Recommended Actions.
4. **Explain column** — WhyDidThisChange narratives + Executive Briefing card.
5. **Deep-dive strip** — links into existing operational routes.

Grid: 12-col desktop, stacks on tablet/mobile. Reduced motion respected.

## 7. Pulse widget architecture

Single `<PulseCard>` primitive; variants via `kind` prop: `cash | profit | growth | ai | team | collections | expense | technology | marketing | risk | opportunity | data-confidence`. Every pulse renders: headline value, delta vs prior, target, sparkline, top 3 drivers, top risk, recommended action link, confidence badge, freshness badge, "Explain" opens `ExplainabilityDrawer`. Data via `intelligenceService.getPulse(kind, period)` mock. Composed of subatoms: `PulseHeader`, `PulseValue`, `PulseDrivers`, `PulseAction`, `ConfidenceChip`, `FreshnessChip`.

## 8. Company Health scoring framework (demo)

Weighted composite (weights configurable in mock):
- Cash 15, Growth 12, Profitability 15, Collections 10, Technology 6, Marketing 8, People 10, Compliance 8, Data Quality 6, Controls 5, Integration Health 3, Risk 2.

Each component: 0–100 sub-score with `drivers[]`, `detractors[]`, `evidence[]`, `expectedLiftIfRecommended[]`. Overall grade A/B/C/D/F from score; Stress Level derived from Risk + Cash + Collections trio. All values from mock; labeled "Demonstration framework".

## 9. Opportunity Engine data model

```ts
type OpportunityStatus = "new"|"under_review"|"accepted"|"converted_task"|"converted_draft"|"approved"|"in_progress"|"completed"|"outcome_measured"|"dismissed";
interface Opportunity {
  id; title; category; evidence: EvidenceRef[]; estimatedImpact: Money;
  confidence: number; effort: "low"|"med"|"high"; horizon: "now"|"30d"|"90d"|"1y";
  risk: "low"|"med"|"high"; owner: RoleKey; nextStep: string;
  requiredApproval?: ApprovalRef; status: OpportunityStatus; outcome?: OutcomeRef;
  workspaceHint: "money"|"growth"|"people"|"company"; createdAt; updatedAt;
}
```
Service: `opportunities.list/get/updateStatus` via `mockMutation`.

## 10. Financial DNA data model

Directed acyclic tree of `DnaNode { id, label, stage, amount, pctOfOrigin, classification, restricted, sourceRef, evidence, confidence, auditEventId, explanation, children[] }`. Roots are inbound payments/allocations; leaves are retained earnings / distributions / reserves. Rendered as expandable tree with amount + % + evidence link.

## 11. Relationship Graph data model

`GraphNode { id, kind (client|lead|campaign|contract|service|invoice|payment|allocation|passthrough|expense|employee|commission|bonus|profit|tax|owner|investor|entity|app|vendor|event|decision), label, meta }` and `GraphEdge { source, target, relation, amount?, at? }`. Rendered as force-directed SVG with **accessible list alternative** (table view keyed by node with related-record links) toggleable.

## 12. Financial Timeline data model

`TimelineEvent { id, subjectRef, at, kind, amount?, sourceSystem, relatedRefs[], actor, explanation, auditEventId }`. Subjects: company, client, invoice, payment, employee, participant, campaign, service, app, event, vendor, investor, owner-transaction. Rendered as vertical event stream with filter chips.

## 13. Digital Twin scenario model

```ts
interface ScenarioInput { revenueDelta?; pricingDelta?; headcountDelta?; payrollDelta?; compChanges?; marketingDelta?; techDelta?; travelDelta?; collectionsDelta?; taxReserveDelta?; ownerDistDelta?; }
interface ScenarioOutput { cash; trueAvailableCash; revenue; grossProfit; contributionProfit; netIncome; payroll; commissionObligations; bonusObligations; taxReserves; runwayMonths; hiringCapacity; healthScoreDelta; riskDelta; }
```
Deterministic mock transform in `digitalTwinService.run(input)`. Persistent "Demonstration scenario" banner.

## 14. AI persona governance model

`Persona { key, name, purpose, permittedData[], prohibitedData[], permittedRecommendations[], prohibitedActions[], requiredEvidence[], requiredApprovals[], intendedRoles: RoleKey[], exampleQuestions[] }`. Registry in `src/lib/mock/apex-personas.ts`. Ask LedgerOS surface adopts persona per workspace (Cash Advisor on Money, Growth Advisor on Growth, etc.). All advisory; no autonomous action.

## 15. Role-specific workspace plan

Reuse existing `useCurrentUser().role` seam. Each workspace landing composes a `RoleView` slot:
- Owner (Rose) — full pulses + priorities + opportunities.
- Accounting Lead (Christin) — close readiness, banking exceptions, verification queues.
- Advisor — tax/legal review items only.
- Sales Leadership — collections/attribution/commission progress.
- Marketing — campaign contribution profit.
- Operations — exceptions and action plans.
- Systems Reviewer — data quality + integration health.
- Team Member — self-only surfaces; sensitive companywide values masked with `ConfidentialMask` component.

## 16. Accessibility risks

- Relationship Graph: force-directed SVG needs list-view fallback, keyboard traversal, aria-labels per node.
- Pulse sparklines: require aria summaries.
- Dark executive cards on light page: contrast must meet WCAG AA (verify `--executive-surface` foreground pair).
- Motion: gate transitions on `prefers-reduced-motion`.
- Ask LedgerOS drawer: focus trap + escape.

## 17. Performance risks

- Feature registry + APEX planning pages must lazy-load large mock datasets; keep out of critical bundle.
- Graph rendering — cap nodes visible; virtualize timeline.
- Avoid re-rendering full workspace on period change (memoize pulses).

## 18. Files expected to change

`src/styles.css` (tokens/motion), `src/components/app-sidebar.tsx` (nav mode), `src/components/top-bar.tsx` (nav mode + Ask trigger), `src/lib/mock/nav.ts` (add APEX admin entry only), `src/lib/api/client.ts` (register new services), `src/lib/api/services/intelligence.ts` (pulse endpoints — mock only).

## 19. Files expected to be created

Docs (19): all `docs/production-handoff/apex-*.md` listed in the brief.

Config/mocks:
- `src/lib/mock/nav-executive.ts`
- `src/lib/mock/apex-pulses.ts`
- `src/lib/mock/apex-company-health.ts`
- `src/lib/mock/apex-opportunities.ts`
- `src/lib/mock/apex-financial-dna.ts`
- `src/lib/mock/apex-relationship-graph.ts`
- `src/lib/mock/apex-timeline.ts`
- `src/lib/mock/apex-digital-twin.ts`
- `src/lib/mock/apex-personas.ts`
- `src/lib/mock/apex-briefings.ts`
- `src/lib/mock/apex-priorities.ts`

Services:
- `src/lib/api/services/apex/pulses.ts`
- `src/lib/api/services/apex/company-health.ts`
- `src/lib/api/services/apex/opportunities.ts`
- `src/lib/api/services/apex/financial-dna.ts`
- `src/lib/api/services/apex/relationship-graph.ts`
- `src/lib/api/services/apex/timeline.ts`
- `src/lib/api/services/apex/digital-twin.ts`
- `src/lib/api/services/apex/briefings.ts`
- `src/lib/api/services/apex/priorities.ts`

Hooks:
- `src/hooks/use-nav-mode.ts`
- `src/hooks/use-period.ts`
- `src/hooks/use-reduced-motion.ts`

Components:
- `src/components/apex/executive-shell.tsx`
- `src/components/apex/workspace-header.tsx`
- `src/components/apex/nav-mode-switcher.tsx`
- `src/components/apex/pulse-card.tsx` (+ sub-atoms)
- `src/components/apex/why-did-this-change.tsx`
- `src/components/apex/explainability-drawer.tsx`
- `src/components/apex/evidence-drawer.tsx`
- `src/components/apex/ask-ledgeros.tsx`
- `src/components/apex/priority-card.tsx`
- `src/components/apex/opportunity-card.tsx`
- `src/components/apex/company-health-card.tsx` + `health-component-row.tsx`
- `src/components/apex/executive-briefing.tsx`
- `src/components/apex/financial-dna-tree.tsx`
- `src/components/apex/relationship-graph.tsx` + `relationship-list-view.tsx`
- `src/components/apex/timeline-stream.tsx`
- `src/components/apex/scenario-controls.tsx` + `scenario-impact.tsx`
- `src/components/apex/persona-card.tsx`
- `src/components/apex/confidence-chip.tsx`, `freshness-chip.tsx`
- `src/components/apex/confidential-mask.tsx`
- `src/components/apex/demo-banner.tsx`

Routes (planning + workspaces):
- `/apex`, `/apex/architecture`, `/apex/navigation`, `/apex/widgets`, `/apex/company-health`, `/apex/opportunities`, `/apex/financial-dna`, `/apex/relationship-graph`, `/apex/timeline`, `/apex/digital-twin`, `/apex/briefing`, `/apex/personas`, `/apex/roles`, `/apex/handoff`
- Executive-mode landings: `/apex/home`, `/apex/money`, `/apex/growth`, `/apex/people`, `/apex/company`

## 20. Recommended implementation sequence

Matches your APEX 1–7 order:

**APEX 1** — Docs + planning routes (`/apex`, `/apex/architecture`, `/apex/navigation`), executive nav config, `useNavMode`, nav-mode switcher wired into sidebar. Non-destructive. Typecheck + build gate.

**APEX 2** — Design-token additions in `styles.css`, `ExecutiveShell`, `PulseCard` + sub-atoms, `ExplainabilityDrawer`, `EvidenceDrawer`, `ConfidenceChip`, `FreshnessChip`, `WhyDidThisChange`. Widget preview at `/apex/widgets`.

**APEX 3** — `/apex/home`, Company Health card + `/apex/company-health`, Executive Briefing + `/apex/briefing`, Today's Priorities.

**APEX 4** — `/apex/money`, `/apex/growth`, `/apex/people`, `/apex/company` landings composed from pulses + deep-dive strips.

**APEX 5** — Opportunity Engine (`/apex/opportunities`), Financial DNA (`/apex/financial-dna`), Timeline (`/apex/timeline`), Relationship Graph (`/apex/relationship-graph`) with list fallback.

**APEX 6** — Digital Twin (`/apex/digital-twin`), personas (`/apex/personas`), role variants (`/apex/roles`).

**APEX 7** — Responsive/a11y/reduced-motion audit, handoff docs, `/apex/handoff` acceptance matrix, final regression.

Each stage gated on green typecheck + build before the next begins.

---

## Guarantees carried through every stage

- All 200+ existing routes remain and function.
- Operational navigation remains the default; executive mode is opt-in via footer switcher.
- No route renames, no module removals.
- No backend, no Supabase, no auth changes.
- Persistent "Demonstration" labeling on APEX surfaces.
- Semantic tokens only; no hardcoded colors.
- Team Member role never sees companywide sensitive values (masked).

---

**Approve to begin APEX 1** (docs + planning routes + executive nav mode toggle), or reply with adjustments to workspace mappings, tokens, data models, or the implementation sequence.
