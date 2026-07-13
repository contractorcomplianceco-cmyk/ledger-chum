// Financial Timeline — chronological demonstration events.

export type TimelineKind =
  | "Lead"
  | "Proposal"
  | "Contract"
  | "Invoice"
  | "Payment"
  | "Expense"
  | "Milestone"
  | "Commission"
  | "Profit"
  | "Refund"
  | "Renewal"
  | "Expansion"
  | "Decision"
  | "Integration"
  | "Audit"
  | "Tax"
  | "Distribution";

export type TimelineView =
  | "All Events"
  | "Financial"
  | "Sales"
  | "Billing"
  | "Payments"
  | "Compensation"
  | "Expenses"
  | "Profit"
  | "Decisions"
  | "Integrations"
  | "Audit";

export type TimelineEvent = {
  id: string;
  subjectId: string;
  date: string;
  time: string;
  kind: TimelineKind;
  title: string;
  amount?: number;
  status: "posted" | "draft" | "review" | "flagged";
  source: string;
  actor: string;
  explanation: string;
  evidence: string[];
  relatedIds: string[];
  auditLink: string;
  views: TimelineView[];
};

export type TimelineSubject = {
  id: string;
  label: string;
  type: "Company" | "Client" | "Invoice" | "Employee" | "Vendor" | "Campaign" | "Contract";
  summary: string;
};

export const TIMELINE_SUBJECTS: TimelineSubject[] = [
  { id: "TL-CLIENT-ALD", label: "ALD Holdings", type: "Client", summary: "Compliance audit + advisory. Active since 2023-11." },
  { id: "TL-CLIENT-NORTHSTAR", label: "NorthStar Systems", type: "Client", summary: "Annual engagement. Renewal due Jun 30." },
  { id: "TL-INVOICE-0501", label: "INV-2025-0501", type: "Invoice", summary: "$100,000 issued 05/01." },
  { id: "TL-INVOICE-0311", label: "INV-2025-0311", type: "Invoice", summary: "$38,400 Sequoia Labs — 61-day overdue." },
  { id: "TL-EMP-KCHEN", label: "K. Chen (AR Lead)", type: "Employee", summary: "AR and billing operations." },
  { id: "TL-COMPANY", label: "LedgerOS LLC", type: "Company", summary: "Root company timeline." },
];

export const TIMELINE_EVENTS: Record<string, TimelineEvent[]> = {
  "TL-CLIENT-ALD": [
    { id: "e1", subjectId: "TL-CLIENT-ALD", date: "2025-05-12", time: "09:42", kind: "Payment", title: "Wire received — $100,000", amount: 100000, status: "posted", source: "Stripe", actor: "Integration", explanation: "Client wire cleared same day.", evidence: ["Bank memo", "Stripe reference"], relatedIds: ["INV-2025-0501", "OPP-1042"], auditLink: "AUDIT-3419", views: ["All Events", "Financial", "Payments"] },
    { id: "e2", subjectId: "TL-CLIENT-ALD", date: "2025-05-01", time: "11:10", kind: "Invoice", title: "INV-2025-0501 sent", amount: 100000, status: "posted", source: "Zoho Books", actor: "K. Chen", explanation: "Q2 compliance audit invoice.", evidence: ["Invoice PDF"], relatedIds: ["MSA-2024-08"], auditLink: "AUDIT-3402", views: ["All Events", "Financial", "Billing"] },
    { id: "e3", subjectId: "TL-CLIENT-ALD", date: "2025-04-28", time: "16:20", kind: "Milestone", title: "Audit fieldwork complete", status: "posted", source: "Harvest", actor: "Delivery", explanation: "Fieldwork closed; ready to bill.", evidence: ["Timesheet close"], relatedIds: [], auditLink: "AUDIT-3391", views: ["All Events", "Profit"] },
    { id: "e4", subjectId: "TL-CLIENT-ALD", date: "2025-04-02", time: "10:00", kind: "Contract", title: "SOW #7 signed", amount: 100000, status: "posted", source: "DocuSign", actor: "Rose Alvarez", explanation: "Q2 SOW executed.", evidence: ["Signed PDF"], relatedIds: [], auditLink: "AUDIT-3210", views: ["All Events", "Sales", "Decisions"] },
    { id: "e5", subjectId: "TL-CLIENT-ALD", date: "2025-03-18", time: "14:30", kind: "Proposal", title: "Q2 proposal sent", status: "posted", source: "Zoho CRM", actor: "M. Rose", explanation: "Proposal accepted 14 days later.", evidence: ["Proposal draft"], relatedIds: [], auditLink: "AUDIT-3155", views: ["All Events", "Sales"] },
    { id: "e6", subjectId: "TL-CLIENT-ALD", date: "2025-05-14", time: "08:15", kind: "Commission", title: "Commission projected — $8,200", amount: 8200, status: "review", source: "Compensation ledger", actor: "System", explanation: "Projected on realized revenue.", evidence: ["Plan v2"], relatedIds: [], auditLink: "AUDIT-3428", views: ["All Events", "Compensation"] },
    { id: "e7", subjectId: "TL-CLIENT-ALD", date: "2025-05-14", time: "09:00", kind: "Profit", title: "Contribution profit recognized — $39,000", amount: 39000, status: "review", source: "Derived", actor: "System", explanation: "Post-allocation contribution.", evidence: ["Allocation model"], relatedIds: [], auditLink: "AUDIT-3429", views: ["All Events", "Profit", "Financial"] },
  ],
  "TL-CLIENT-NORTHSTAR": [
    { id: "n1", subjectId: "TL-CLIENT-NORTHSTAR", date: "2025-05-10", time: "13:00", kind: "Renewal", title: "Renewal opportunity identified", status: "review", source: "AI Signals", actor: "System", explanation: "21 days to expiration; usage +38%.", evidence: ["Product usage export"], relatedIds: ["OPP-1044"], auditLink: "AUDIT-3418", views: ["All Events", "Sales"] },
    { id: "n2", subjectId: "TL-CLIENT-NORTHSTAR", date: "2025-04-30", time: "10:00", kind: "Payment", title: "Milestone payment received — $24,000", amount: 24000, status: "posted", source: "Stripe", actor: "Integration", explanation: "Q1 milestone final invoice paid.", evidence: [], relatedIds: [], auditLink: "AUDIT-3388", views: ["All Events", "Payments"] },
    { id: "n3", subjectId: "TL-CLIENT-NORTHSTAR", date: "2025-03-05", time: "09:45", kind: "Expansion", title: "Analytics module trial started", status: "posted", source: "Product", actor: "Client", explanation: "Signal supports upsell.", evidence: [], relatedIds: [], auditLink: "AUDIT-3144", views: ["All Events", "Sales"] },
  ],
  "TL-INVOICE-0501": [
    { id: "i1", subjectId: "TL-INVOICE-0501", date: "2025-05-12", time: "09:42", kind: "Payment", title: "Payment cleared", amount: 100000, status: "posted", source: "Stripe", actor: "Integration", explanation: "Cleared T+1 from wire initiated.", evidence: [], relatedIds: [], auditLink: "AUDIT-3419", views: ["All Events", "Payments"] },
    { id: "i2", subjectId: "TL-INVOICE-0501", date: "2025-05-01", time: "11:10", kind: "Invoice", title: "Invoice sent", amount: 100000, status: "posted", source: "Zoho Books", actor: "K. Chen", explanation: "Sent to AP contact.", evidence: [], relatedIds: [], auditLink: "AUDIT-3402", views: ["All Events", "Billing"] },
  ],
  "TL-INVOICE-0311": [
    { id: "s1", subjectId: "TL-INVOICE-0311", date: "2025-05-15", time: "10:00", kind: "Audit", title: "Reminder #2 sent", status: "posted", source: "Zoho Books", actor: "K. Chen", explanation: "61 days past due.", evidence: [], relatedIds: ["OPP-1047"], auditLink: "AUDIT-3435", views: ["All Events", "Billing", "Audit"] },
    { id: "s2", subjectId: "TL-INVOICE-0311", date: "2025-03-11", time: "12:00", kind: "Invoice", title: "Invoice issued", amount: 38400, status: "posted", source: "Zoho Books", actor: "K. Chen", explanation: "Standard net-30.", evidence: [], relatedIds: [], auditLink: "AUDIT-3150", views: ["All Events", "Billing"] },
  ],
  "TL-EMP-KCHEN": [
    { id: "k1", subjectId: "TL-EMP-KCHEN", date: "2025-05-14", time: "08:15", kind: "Commission", title: "Commission projected — $8,200", amount: 8200, status: "review", source: "Compensation ledger", actor: "System", explanation: "Q2 activity roll-up.", evidence: [], relatedIds: [], auditLink: "AUDIT-3428", views: ["All Events", "Compensation"] },
  ],
  "TL-COMPANY": [
    { id: "c1", subjectId: "TL-COMPANY", date: "2025-05-15", time: "08:00", kind: "Decision", title: "Approved tax reserve top-up", amount: 12300, status: "posted", source: "Decision Log", actor: "Rose Alvarez", explanation: "Approved OPP-1048.", evidence: ["Decision memo"], relatedIds: ["OPP-1048"], auditLink: "AUDIT-3438", views: ["All Events", "Decisions", "Financial"] },
    { id: "c2", subjectId: "TL-COMPANY", date: "2025-05-13", time: "07:30", kind: "Integration", title: "Bank feed refreshed", status: "posted", source: "Plaid", actor: "Integration", explanation: "Nightly refresh complete.", evidence: [], relatedIds: [], auditLink: "AUDIT-3421", views: ["All Events", "Integrations"] },
    { id: "c3", subjectId: "TL-COMPANY", date: "2025-05-12", time: "09:42", kind: "Payment", title: "$100,000 wire from ALD", amount: 100000, status: "posted", source: "Stripe", actor: "Integration", explanation: "Largest inbound cash of the week.", evidence: [], relatedIds: [], auditLink: "AUDIT-3419", views: ["All Events", "Payments", "Financial"] },
  ],
};

export const TIMELINE_VIEWS: TimelineView[] = [
  "All Events",
  "Financial",
  "Sales",
  "Billing",
  "Payments",
  "Compensation",
  "Expenses",
  "Profit",
  "Decisions",
  "Integrations",
  "Audit",
];

export const ASK_LEDGEROS_TIMELINE = [
  "What changed?",
  "Which event caused the issue?",
  "What is still pending?",
  "Show the complete history.",
];
