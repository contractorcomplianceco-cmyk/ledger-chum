// LedgerOS Phase 5 — Production Integration Blueprint mock data.
// Everything here is demonstration content for the design lab. No API is called.

export type Endpoint = {
  ui: string;
  action: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  endpoint: string;
  permission: string;
  audit: string;
  status: "exists" | "extend" | "new";
};

export const API_ENDPOINTS: Endpoint[] = [
  { ui: "/invoices/new", action: "Save draft invoice", method: "POST", endpoint: "/api/invoices", permission: "invoice.create", audit: "invoice.created", status: "exists" },
  { ui: "/invoices/new", action: "Send invoice", method: "POST", endpoint: "/api/invoices/:id/send", permission: "invoice.send", audit: "invoice.sent", status: "exists" },
  { ui: "/invoices/$id", action: "Allocate payment", method: "POST", endpoint: "/api/payments/:id/allocate", permission: "allocation.create", audit: "allocation.created", status: "new" },
  { ui: "/invoices/$id", action: "Issue credit note", method: "POST", endpoint: "/api/credit-notes", permission: "credit_note.create", audit: "credit_note.created", status: "extend" },
  { ui: "/expenses/list", action: "Submit expense", method: "POST", endpoint: "/api/expenses", permission: "expense.submit", audit: "expense.submitted", status: "exists" },
  { ui: "/expenses/approvals", action: "Approve expense", method: "POST", endpoint: "/api/expenses/:id/approve", permission: "expense.approve", audit: "expense.approved", status: "exists" },
  { ui: "/expenses/approvals", action: "Reject expense", method: "POST", endpoint: "/api/expenses/:id/reject", permission: "expense.approve", audit: "expense.rejected", status: "exists" },
  { ui: "/expenses/matching", action: "Confirm match", method: "POST", endpoint: "/api/expenses/:id/match", permission: "expense.match", audit: "expense.matched", status: "new" },
  { ui: "/expenses/receipts", action: "Ingest receipt (email/upload)", method: "POST", endpoint: "/api/receipts", permission: "receipt.ingest", audit: "receipt.ingested", status: "extend" },
  { ui: "/expenses/policies", action: "Publish policy rule", method: "POST", endpoint: "/api/policies", permission: "policy.manage", audit: "policy.published", status: "new" },
  { ui: "/expenses/pre-spend", action: "Approve pre-spend request", method: "POST", endpoint: "/api/pre-spend/:id/approve", permission: "pre_spend.approve", audit: "pre_spend.approved", status: "new" },
  { ui: "/expenses/recovery", action: "Recover reimbursable → invoice draft", method: "POST", endpoint: "/api/recovery/:id/create-invoice-draft", permission: "invoice.create", audit: "recovery.invoice_drafted", status: "new" },
  { ui: "/cash-availability", action: "Refresh allocation buckets", method: "GET", endpoint: "/api/cash-availability", permission: "cash.view", audit: "cash.viewed", status: "new" },
  { ui: "/cash-availability/rules", action: "Update treatment rule", method: "PATCH", endpoint: "/api/allocation-rules/:id", permission: "allocation_rule.manage", audit: "allocation_rule.updated", status: "new" },
  { ui: "/automation/cash-controls", action: "Approve guardrail override", method: "POST", endpoint: "/api/guardrails/:id/override", permission: "guardrail.override", audit: "guardrail.override_approved", status: "new" },
  { ui: "/automation/approvals", action: "Bulk approve queue", method: "POST", endpoint: "/api/approvals/bulk", permission: "approval.bulk", audit: "approvals.bulk_actioned", status: "new" },
  { ui: "/automation/collections", action: "Send collection reminder", method: "POST", endpoint: "/api/collections/:id/remind", permission: "collections.act", audit: "collections.reminded", status: "extend" },
  { ui: "/automation/payables", action: "Schedule payable batch", method: "POST", endpoint: "/api/payables/schedule", permission: "payable.schedule", audit: "payable.batch_scheduled", status: "extend" },
  { ui: "/automation/subscription-actions", action: "Cancel subscription (task)", method: "POST", endpoint: "/api/subscriptions/:id/cancel-task", permission: "subscription.act", audit: "subscription.cancel_task", status: "new" },
  { ui: "/automation/revenue-recovery", action: "Advance leakage step", method: "POST", endpoint: "/api/recovery/:id/advance", permission: "recovery.act", audit: "recovery.advanced", status: "new" },
  { ui: "/automation/bonus-controls", action: "Approve bonus obligation", method: "POST", endpoint: "/api/bonuses/:id/approve", permission: "bonus.approve", audit: "bonus.approved", status: "new" },
  { ui: "/intelligence/leakage", action: "Verify leakage opportunity", method: "POST", endpoint: "/api/leakage/:id/verify", permission: "leakage.verify", audit: "leakage.verified", status: "new" },
  { ui: "/intelligence/recommendations", action: "Accept executive recommendation", method: "POST", endpoint: "/api/recommendations/:id/accept", permission: "recommendation.accept", audit: "recommendation.accepted", status: "new" },
  { ui: "/ledger/journals", action: "Post journal entry", method: "POST", endpoint: "/api/journal-entries", permission: "journal.post", audit: "journal.posted", status: "exists" },
];

export type Entity = {
  mockObject: string;
  file: string;
  entity: string;
  keys: string;
  storage: "exists" | "extend" | "new";
};

export const DATA_MAP: Entity[] = [
  { mockObject: "INVOICES", file: "src/lib/mock/invoicing.ts", entity: "invoices", keys: "id, customer_id, status, issued_at, due_at, total, treatment", storage: "exists" },
  { mockObject: "INVOICE_LINES", file: "src/lib/mock/invoicing.ts", entity: "invoice_lines", keys: "id, invoice_id, service_id, qty, rate, treatment, department, state", storage: "exists" },
  { mockObject: "CUSTOMERS", file: "src/lib/mock/invoicing.ts", entity: "customers", keys: "id, name, billing_profile, portal_status", storage: "exists" },
  { mockObject: "ESTIMATES / RECURRING / CREDIT_NOTES", file: "src/lib/mock/invoicing.ts", entity: "estimates, recurring_schedules, credit_notes", keys: "id, invoice_id, schedule, applied_at", storage: "extend" },
  { mockObject: "EXPENSES", file: "src/lib/mock/expenses.ts", entity: "expenses", keys: "id, vendor_id, amount, status, policy_result, matched_txn_id", storage: "exists" },
  { mockObject: "RECEIPTS", file: "src/lib/mock/expenses.ts", entity: "receipts", keys: "id, source, ocr_confidence, matched_expense_id", storage: "new" },
  { mockObject: "SUBSCRIPTIONS", file: "src/lib/mock/expenses.ts", entity: "subscriptions", keys: "id, vendor_id, cadence, next_charge, health", storage: "new" },
  { mockObject: "POLICIES", file: "src/lib/mock/expenses.ts", entity: "policy_rules", keys: "id, trigger, condition_json, action, approval, effective_at", storage: "new" },
  { mockObject: "PRE_SPEND_REQUESTS", file: "src/lib/mock/expenses.ts", entity: "pre_spend_requests", keys: "id, requester, amount, projected_impact, status", storage: "new" },
  { mockObject: "ALLOCATIONS", file: "src/lib/mock/cash-availability.ts", entity: "allocations", keys: "id, source_txn_id, invoice_id, bucket, amount, treatment, rule_id", storage: "new" },
  { mockObject: "TREATMENT_RULES", file: "src/lib/mock/cash-availability.ts", entity: "allocation_rules", keys: "id, service_id, treatment, split_json, effective_at", storage: "new" },
  { mockObject: "GUARDRAILS", file: "src/lib/mock/automation.ts", entity: "guardrails", keys: "id, metric, threshold, action, override_state", storage: "new" },
  { mockObject: "AUTOMATION_RULES", file: "src/lib/mock/automation.ts", entity: "automation_rules", keys: "id, trigger, condition_json, action, approval, owner", storage: "new" },
  { mockObject: "APPROVALS", file: "src/lib/mock/automation.ts", entity: "approval_tasks", keys: "id, source_type, source_id, approver, status", storage: "new" },
  { mockObject: "EXCEPTIONS", file: "src/lib/mock/automation.ts", entity: "exceptions", keys: "id, source, severity, opened_at, resolved_at", storage: "new" },
  { mockObject: "DECISION_LOG", file: "src/lib/mock/automation.ts", entity: "decision_log", keys: "id, decision_type, actor, before, after, justification, timestamp", storage: "new" },
  { mockObject: "LEAKAGE_OPPS", file: "src/lib/mock/intelligence.ts", entity: "leakage_opportunities", keys: "id, source, amount, confidence, status", storage: "new" },
  { mockObject: "FORECAST_SCENARIOS", file: "src/lib/mock/intelligence.ts", entity: "forecast_scenarios", keys: "id, key, assumptions_json, horizon", storage: "new" },
  { mockObject: "RECOMMENDATIONS", file: "src/lib/mock/intelligence.ts", entity: "recommendations", keys: "id, category, impact, evidence_refs, status", storage: "new" },
  { mockObject: "AUDIT_EVENTS", file: "system-wide", entity: "audit_events", keys: "id, actor, target_type, target_id, action, before, after, ts", storage: "extend" },
];

export type Role = "Rose" | "Christin" | "Carmen" | "Accountant" | "Team" | "Integration";

export const PERMISSIONS: Array<{
  route: string;
  matrix: Record<Role, string>;
}> = [
  { route: "/cash-availability", matrix: { Rose: "View · Override", Christin: "View · Reclassify", Carmen: "View", Accountant: "View", Team: "—", Integration: "Write bucket updates" } },
  { route: "/invoices/*", matrix: { Rose: "All", Christin: "Create · Approve · Send", Carmen: "View · Export", Accountant: "Create · Send", Team: "View own client", Integration: "Sync only" } },
  { route: "/expenses/approvals", matrix: { Rose: "Approve · Override", Christin: "Approve", Carmen: "View", Accountant: "Approve up to $1k", Team: "Submit only", Integration: "Ingest" } },
  { route: "/expenses/policies", matrix: { Rose: "Manage", Christin: "Manage", Carmen: "View", Accountant: "View", Team: "—", Integration: "—" } },
  { route: "/automation/cash-controls", matrix: { Rose: "Override", Christin: "Propose override", Carmen: "View · Attest", Accountant: "View", Team: "—", Integration: "Emit signals" } },
  { route: "/automation/rules", matrix: { Rose: "Manage", Christin: "Manage", Carmen: "Review", Accountant: "View", Team: "—", Integration: "—" } },
  { route: "/automation/bonus-controls", matrix: { Rose: "Approve", Christin: "Verify", Carmen: "Attest", Accountant: "Post payable", Team: "View own", Integration: "Sync payroll" } },
  { route: "/intelligence/leakage", matrix: { Rose: "Accept", Christin: "Verify · Draft invoice", Carmen: "Review", Accountant: "Send invoice", Team: "—", Integration: "Emit signals" } },
  { route: "/intelligence/recommendations", matrix: { Rose: "Accept · Reject", Christin: "Comment", Carmen: "Review", Accountant: "—", Team: "—", Integration: "—" } },
  { route: "/ledger/journals", matrix: { Rose: "Post", Christin: "Post", Carmen: "Attest", Accountant: "Post", Team: "—", Integration: "Post via signed events" } },
  { route: "/audit", matrix: { Rose: "View", Christin: "View", Carmen: "View · Export", Accountant: "View", Team: "View own", Integration: "Append" } },
];

export type Integration = {
  system: string;
  category: "ingest" | "sync" | "post";
  scope: string;
  cadence: string;
  contract: string;
  status: "spec" | "existing" | "planned";
};

export const INTEGRATIONS: Integration[] = [
  { system: "Navy Federal", category: "ingest", scope: "Bank transactions, balances, holds", cadence: "Nightly + on-demand", contract: "SFTP + reconciliation ledger", status: "existing" },
  { system: "Zoho CRM", category: "sync", scope: "Customers, deals, contact rollups", cadence: "Bi-directional every 15m", contract: "REST · deal.updated webhook", status: "existing" },
  { system: "Zoho Forms", category: "ingest", scope: "Intake submissions → customers", cadence: "Real-time webhook", contract: "form.submitted → /api/intake", status: "planned" },
  { system: "Zoho Books", category: "sync", scope: "Parallel run + reconciliation source", cadence: "Daily journal export", contract: "Books API + CSV variance report", status: "spec" },
  { system: "Zoho Billing", category: "sync", scope: "Subscription plans & invoices", cadence: "Real-time", contract: "Billing API + webhooks", status: "spec" },
  { system: "RUN by ADP", category: "ingest", scope: "Payroll summaries, tax obligations", cadence: "Per pay period", contract: "Report export → /api/payroll/import", status: "planned" },
  { system: "Command Center", category: "post", scope: "Analytics feed for exec dashboards", cadence: "Streaming", contract: "Event bus (Kafka topic ledgeros.metrics)", status: "planned" },
  { system: "Client Portal", category: "sync", scope: "Invoices, payment status, docs", cadence: "Real-time", contract: "Signed webhook + REST", status: "spec" },
  { system: "Business Services Hub", category: "ingest", scope: "Service orders → invoice drafts", cadence: "Real-time", contract: "order.completed → /api/orders", status: "planned" },
  { system: "QualifierConnect", category: "ingest", scope: "Referral fees & payouts", cadence: "Real-time", contract: "payout.settled webhook", status: "planned" },
  { system: "Marketing attribution", category: "ingest", scope: "Campaign spend & lead source", cadence: "Daily", contract: "REST pull from ad platforms", status: "spec" },
  { system: "Ops telemetry (Replit, Lovable, Vercel, GitHub, AI providers)", category: "ingest", scope: "Tech & AI unit costs", cadence: "Daily invoice + usage pull", contract: "Provider APIs → normalized cost events", status: "spec" },
];

export type EventClass = {
  event: string;
  producer: string;
  consumer: string;
  behavior: "recommendation" | "task" | "draft" | "approval" | "post" | "never_auto";
};

export const EVENTS: EventClass[] = [
  { event: "invoice.created", producer: "Invoice builder / Business Services Hub", consumer: "Cash Availability, Bonus engine", behavior: "draft" },
  { event: "invoice.sent", producer: "Invoice module", consumer: "Client Portal, Collections", behavior: "post" },
  { event: "payment.received", producer: "Navy Federal ingest", consumer: "Allocation engine", behavior: "draft" },
  { event: "allocation.proposed", producer: "Allocation engine", consumer: "Cash Availability, Approvals", behavior: "recommendation" },
  { event: "allocation.applied", producer: "Approvals / rules", consumer: "GL, Cash Availability", behavior: "approval" },
  { event: "expense.submitted", producer: "Expense Submit", consumer: "Policy engine, Matching", behavior: "draft" },
  { event: "expense.matched", producer: "Matching engine", consumer: "GL, Bill pay, Cash Availability", behavior: "recommendation" },
  { event: "expense.anomaly", producer: "Anomaly detector", consumer: "Approvals, Exceptions", behavior: "task" },
  { event: "subscription.review_needed", producer: "Subscription tracker", consumer: "Automation actions", behavior: "task" },
  { event: "leakage.detected", producer: "Leakage engine", consumer: "Recovery workflow, Invoice draft", behavior: "recommendation" },
  { event: "leakage.verified", producer: "Reviewer", consumer: "Invoice drafts", behavior: "draft" },
  { event: "guardrail.violated", producer: "Cash controls", consumer: "Approvals, Rose", behavior: "approval" },
  { event: "guardrail.override_approved", producer: "Rose", consumer: "Guardrails, Audit", behavior: "post" },
  { event: "bonus.projected", producer: "Bonus engine", consumer: "Forecast, Bonus Center", behavior: "recommendation" },
  { event: "bonus.approved", producer: "Approvals", consumer: "Payroll", behavior: "approval" },
  { event: "journal.proposed", producer: "GL engine", consumer: "Accountant approval", behavior: "draft" },
  { event: "journal.posted", producer: "Accountant / rule", consumer: "GL, Audit", behavior: "post" },
  { event: "cash.transfer", producer: "Manual only", consumer: "Bank, GL", behavior: "never_auto" },
  { event: "subscription.cancelled", producer: "Human action only", consumer: "Vendor, GL", behavior: "never_auto" },
];

export const DRAFT_MATRIX: Array<{ action: string; default: string }> = [
  { action: "Allocation suggestion from payment", default: "Draft, requires reviewer" },
  { action: "Invoice from service milestone", default: "Draft, requires approver" },
  { action: "Recurring invoice next cycle", default: "Draft" },
  { action: "Expense anomaly detected", default: "Review task" },
  { action: "Bonus calculation", default: "Projected only" },
  { action: "Reimbursable recovery", default: "Invoice draft" },
  { action: "Journal entry from rule", default: "Requires approval" },
  { action: "Cash transfer between accounts", default: "Never automatic" },
  { action: "Subscription cancellation", default: "Human action required" },
  { action: "Guardrail override", default: "Rose approval, expiring" },
  { action: "Vendor renegotiation", default: "Action plan, no post" },
  { action: "Client pricing exception", default: "Requires dual approval" },
];

export const MIGRATION_STAGES = [
  { stage: "Mock UI approved", state: "done", detail: "Phases 1–4 shipped in design lab." },
  { stage: "Component handoff", state: "in_progress", detail: "Freeze mock props · export Storybook · deliver Phase 5 API map." },
  { stage: "Read-only API connection", state: "planned", detail: "Wire GET endpoints from Navy Federal, Zoho CRM, Zoho Books to real screens." },
  { stage: "Role validation", state: "planned", detail: "Load real roles from ADP + custom mapping. Verify permission matrix." },
  { stage: "Draft-only mutations", state: "planned", detail: "Turn on writes but everything lands in draft/task state." },
  { stage: "Approval-gated mutations", state: "planned", detail: "Enable approvals queue with real actors and audit trail." },
  { stage: "Parallel run vs Zoho Books", state: "planned", detail: "Two systems run side-by-side; nightly variance report." },
  { stage: "Reconciliation & variance review", state: "planned", detail: "Root-cause every delta > $50 or > 0.5%." },
  { stage: "Controlled cutover", state: "planned", detail: "Freeze Zoho Books; LedgerOS becomes system of record for one entity." },
  { stage: "Full production use", state: "planned", detail: "All entities on LedgerOS. Zoho Books moved to archival read-only." },
];

export const TEST_SUITES = [
  { id: "T-01", name: "Payment received → allocation → cash availability update", steps: 7, coverage: "Cash · Allocation · Audit" },
  { id: "T-02", name: "Pass-through fee collected → restricted obligation → disbursement", steps: 6, coverage: "Restricted cash · Payables · GL" },
  { id: "T-03", name: "Invoice created → approved → paid → commission reserve", steps: 8, coverage: "Sales · Bonus · Cash" },
  { id: "T-04", name: "Expense uploaded → receipt matched → policy review → approval", steps: 6, coverage: "Expense · Policy · Approvals" },
  { id: "T-05", name: "Recoverable expense → invoice draft → collection", steps: 5, coverage: "Recovery · Sales" },
  { id: "T-06", name: "Bonus projected → earned → verified → approved → payable", steps: 5, coverage: "Bonus · Payroll" },
  { id: "T-07", name: "Anomaly detected → reviewed → action plan → savings realized", steps: 6, coverage: "Intelligence · Actions" },
  { id: "T-08", name: "Leakage found → recovered → profitability updated", steps: 4, coverage: "Leakage · Profitability" },
  { id: "T-09", name: "Guardrail violated → override approved → audit record", steps: 4, coverage: "Guardrails · Audit" },
  { id: "T-10", name: "Failed integration → exception → retry → resolution", steps: 5, coverage: "Integration Health · Exceptions" },
];

export const SECURITY_CONTROLS = [
  { control: "Authentication", detail: "SSO (Zoho Directory) + hardware key for Rose & Christin. Session TTL 8h." },
  { control: "Authorization", detail: "Role-based + row-level filters by department, client, and entity." },
  { control: "Secrets", detail: "Provider keys never touch the client. Rotate quarterly. Vault-backed." },
  { control: "PII handling", detail: "Bank data + payroll masked in UI except for Rose/Christin/Accountant. Never logged." },
  { control: "Audit", detail: "Every mutation writes an audit event with actor, target, before/after, justification." },
  { control: "Data lineage", detail: "Every displayed number links to source system, source id, transformation, confidence." },
  { control: "Automation guardrails", detail: "No auto-post without an approved rule; no cash transfer without a human; overrides expire." },
  { control: "Change management", detail: "Rule + policy edits require 2-person approval and land in Decision Log." },
];

export const CUTOVER_CHECKLIST = [
  { phase: "T-30 days", items: ["Freeze Zoho Books configuration", "Publish permission matrix", "Freeze allocation rules", "Sign off cutover date"] },
  { phase: "T-14 days", items: ["Rehearsal parallel run", "Reconcile variance <0.5%", "Complete acceptance test suite", "Backup Zoho Books export"] },
  { phase: "T-7 days", items: ["Communicate to team", "Freeze policy changes", "Verify integration health green for 7 days"] },
  { phase: "T-0 cutover", items: ["Snapshot balances", "Switch system of record", "Enable approval-gated posting", "Rose + Christin standby"] },
  { phase: "T+1 day", items: ["Reconcile first-day journals", "Review exceptions dashboard", "Confirm audit trail intact"] },
  { phase: "T+7 days", items: ["Weekly variance review", "Retire Zoho Books to read-only", "Full production sign-off"] },
];

export const READINESS_SCORECARD = [
  { area: "Design lab coverage", score: 100, note: "Phases 1–4 shipped." },
  { area: "API contract map", score: 85, note: "24 endpoints documented; 12 new, 4 extended, 8 existing." },
  { area: "Data model map", score: 80, note: "20 entities mapped to mock objects." },
  { area: "Permission matrix", score: 75, note: "11 route groups × 6 roles." },
  { area: "Integration contracts", score: 55, note: "12 systems defined; 4 planned, 5 spec, 3 existing." },
  { area: "Event & draft matrix", score: 70, note: "19 events classified into 6 behaviors." },
  { area: "Acceptance tests", score: 40, note: "10 end-to-end suites defined; execution not started." },
  { area: "Security review", score: 45, note: "Controls drafted; formal review pending." },
  { area: "Migration plan", score: 60, note: "10-stage plan with entry/exit criteria." },
  { area: "Cutover plan", score: 35, note: "Draft T-30 → T+7 checklist." },
];

export const HANDOFF_PACKAGE = [
  { doc: "API contract map", owner: "LedgerOS design", format: "Notion + JSON export", ready: true },
  { doc: "Data model & lineage map", owner: "LedgerOS design + Christin", format: "Notion + ERD", ready: true },
  { doc: "Permission matrix", owner: "Rose (owner) + Carmen (reviewer)", format: "CSV", ready: true },
  { doc: "Integration contracts", owner: "Integration lead", format: "OpenAPI stubs + webhook signing spec", ready: false },
  { doc: "Event & draft-vs-post matrix", owner: "LedgerOS design", format: "Notion", ready: true },
  { doc: "Migration plan", owner: "Rose + Accounting lead", format: "Notion + Gantt", ready: false },
  { doc: "Acceptance test plan", owner: "Christin + QA", format: "Testrail import", ready: false },
  { doc: "Security review", owner: "External auditor", format: "PDF report", ready: false },
  { doc: "Cutover runbook", owner: "Rose + Christin", format: "Runbook + Slack war-room", ready: false },
];
