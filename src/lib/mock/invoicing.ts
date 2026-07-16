// Invoicing mock data — LedgerOS Phase 2A (UI Design Lab).
// Every invoice line carries a Treatment so the allocation engine (Phase 1) can
// split it into Operating / Reserved / Restricted cash.

import type { Treatment } from "./cash-availability";
import { TREATMENT_META } from "./cash-availability";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "partial"
  | "paid"
  | "overdue"
  | "void"
  | "written_off"
  | "refunded";

export const INVOICE_STATUS_META: Record<
  InvoiceStatus,
  { label: string; tone: "muted" | "info" | "warning" | "success" | "destructive" | "violet" }
> = {
  draft: { label: "Draft", tone: "muted" },
  sent: { label: "Sent", tone: "info" },
  viewed: { label: "Viewed", tone: "violet" },
  partial: { label: "Partial", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  overdue: { label: "Overdue", tone: "destructive" },
  void: { label: "Void", tone: "muted" },
  written_off: { label: "Written off", tone: "muted" },
  refunded: { label: "Refunded", tone: "muted" },
};

export type PaymentLikelihood =
  "very_likely" | "likely_late" | "high_followup" | "possible_dispute" | "chargeback_risk";

export const LIKELIHOOD_META: Record<
  PaymentLikelihood,
  {
    label: string;
    short: string;
    tone: "success" | "info" | "warning" | "destructive";
    score: number;
  }
> = {
  very_likely: {
    label: "Very likely to pay on time",
    short: "On-time",
    tone: "success",
    score: 92,
  },
  likely_late: { label: "Likely to pay late", short: "Late risk", tone: "info", score: 68 },
  high_followup: { label: "High follow-up risk", short: "Follow up", tone: "warning", score: 45 },
  possible_dispute: {
    label: "Possible dispute",
    short: "Dispute risk",
    tone: "destructive",
    score: 32,
  },
  chargeback_risk: {
    label: "Chargeback exposure",
    short: "Chargeback",
    tone: "destructive",
    score: 18,
  },
};

export type InvoiceLine = {
  id: string;
  service: string;
  description?: string;
  qty: number;
  rate: number;
  discount: number; // absolute
  tax: number; // absolute
  treatment: Treatment;
  department?: string;
  jurisdiction?: string;
  project?: string;
  commissionOwner?: string;
  refundable?: boolean;
  estCost: number; // fulfillment cost, for margin preview
  targetMarginPct?: number; // target contribution margin for this service
};

export type Customer = {
  id: string;
  name: string;
  primaryContact: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  ltv: number;
  avgPayDays: number;
  status: "active" | "at_risk" | "past_due" | "prospect";
  reliability: "excellent" | "good" | "fair" | "poor";
  billingContacts: { name: string; email: string; role: string }[];
  paymentMethods: { type: string; last4: string }[];
  createdAt: string;
  industry: string;
  states: string[];
};

export type TimelineEvent = { at: string; actor: string; action: string };

export type Invoice = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  issued: string;
  due: string;
  terms: string;
  status: InvoiceStatus;
  po?: string;
  notes?: string;
  customerNotes?: string;
  lines: InvoiceLine[];
  paid: number;
  likelihood: PaymentLikelihood;
  likelihoodReasons: string[];
  timeline: TimelineEvent[];
  attachments: number;
  laborCost: number;
  techAllocation: number;
  marketingCac: number;
};

export type ServiceItem = {
  id: string;
  name: string;
  category: string;
  defaultRate: number;
  defaultTreatment: Treatment;
  targetMarginPct: number;
  estCost: number;
};

export const SERVICE_CATALOG: ServiceItem[] = [
  {
    id: "svc-app-prep",
    name: "License application preparation",
    category: "Licensing",
    defaultRate: 2_700,
    defaultTreatment: "cca_revenue",
    targetMarginPct: 62,
    estCost: 780,
  },
  {
    id: "svc-multi-state",
    name: "Multi-state expansion roadmap",
    category: "Licensing",
    defaultRate: 10_500,
    defaultTreatment: "cca_revenue",
    targetMarginPct: 55,
    estCost: 3_600,
  },
  {
    id: "svc-compliance-audit",
    name: "Compliance audit",
    category: "Audit",
    defaultRate: 6_000,
    defaultTreatment: "cca_revenue",
    targetMarginPct: 68,
    estCost: 1_600,
  },
  {
    id: "svc-monthly-mgmt",
    name: "Monthly compliance management",
    category: "Retainer",
    defaultRate: 2_400,
    defaultTreatment: "non_commissionable",
    targetMarginPct: 72,
    estCost: 520,
  },
  {
    id: "svc-qualifier",
    name: "Qualifier placement",
    category: "Licensing",
    defaultRate: 1_800,
    defaultTreatment: "cca_revenue",
    targetMarginPct: 40,
    estCost: 900,
  },
  {
    id: "svc-permit",
    name: "Permit coordination",
    category: "Permits",
    defaultRate: 1_500,
    defaultTreatment: "cca_revenue",
    targetMarginPct: 58,
    estCost: 480,
  },
  {
    id: "svc-doc-review",
    name: "Document review",
    category: "Advisory",
    defaultRate: 1_800,
    defaultTreatment: "cca_revenue",
    targetMarginPct: 78,
    estCost: 320,
  },
  {
    id: "svc-consulting",
    name: "Consulting hours",
    category: "Advisory",
    defaultRate: 350,
    defaultTreatment: "commissionable",
    targetMarginPct: 60,
    estCost: 120,
  },
  {
    id: "svc-state-fee",
    name: "State filing fee (pass-through)",
    category: "Fees",
    defaultRate: 900,
    defaultTreatment: "pass_through",
    targetMarginPct: 0,
    estCost: 900,
  },
  {
    id: "svc-bg-check",
    name: "Background check package",
    category: "Fees",
    defaultRate: 180,
    defaultTreatment: "pass_through",
    targetMarginPct: 0,
    estCost: 180,
  },
  {
    id: "svc-bond",
    name: "Surety bond premium",
    category: "Fees",
    defaultRate: 1_450,
    defaultTreatment: "pass_through",
    targetMarginPct: 0,
    estCost: 1_450,
  },
  {
    id: "svc-deposit",
    name: "Onboarding deposit (refundable)",
    category: "Deposits",
    defaultRate: 4_000,
    defaultTreatment: "refundable_deposit",
    targetMarginPct: 0,
    estCost: 0,
  },
  {
    id: "svc-rush",
    name: "Rush-service premium",
    category: "Advisory",
    defaultRate: 750,
    defaultTreatment: "commissionable",
    targetMarginPct: 82,
    estCost: 140,
  },
];

export const CUSTOMERS: Customer[] = [
  {
    id: "cus-acme",
    name: "Acme Contracting LLC",
    primaryContact: "Jordan Acme",
    email: "billing@acmecontracting.com",
    phone: "(512) 555-0142",
    address: "1120 Congress Ave, Austin, TX 78701",
    balance: 5_000,
    ltv: 42_800,
    avgPayDays: 12,
    status: "active",
    reliability: "excellent",
    billingContacts: [
      { name: "Jordan Acme", email: "jordan@acmecontracting.com", role: "Owner" },
      { name: "Rita Chen", email: "ap@acmecontracting.com", role: "Accounts Payable" },
    ],
    paymentMethods: [{ type: "ACH", last4: "4402" }],
    createdAt: "Feb 8, 2024",
    industry: "General contracting",
    states: ["TX", "FL"],
  },
  {
    id: "cus-blueridge",
    name: "Blue Ridge Builders",
    primaryContact: "Sam Whitaker",
    email: "sam@blueridgebuilders.co",
    phone: "(828) 555-0119",
    address: "44 Ridge Rd, Asheville, NC 28801",
    balance: 8_500,
    ltv: 68_400,
    avgPayDays: 18,
    status: "active",
    reliability: "good",
    billingContacts: [
      { name: "Sam Whitaker", email: "sam@blueridgebuilders.co", role: "President" },
    ],
    paymentMethods: [{ type: "Wire", last4: "—" }],
    createdAt: "Aug 3, 2023",
    industry: "Residential building",
    states: ["NC", "TN"],
  },
  {
    id: "cus-cascade",
    name: "Cascade Mechanical Group",
    primaryContact: "Priya Kapoor",
    email: "priya@cascademech.com",
    phone: "(206) 555-0170",
    address: "808 Elliott Ave W, Seattle, WA 98119",
    balance: 12_400,
    ltv: 94_200,
    avgPayDays: 22,
    status: "active",
    reliability: "good",
    billingContacts: [
      { name: "Priya Kapoor", email: "priya@cascademech.com", role: "CFO" },
      { name: "Deb Ortega", email: "deb@cascademech.com", role: "Operations" },
    ],
    paymentMethods: [{ type: "ACH", last4: "9910" }],
    createdAt: "Nov 14, 2022",
    industry: "Mechanical & HVAC",
    states: ["WA", "CA", "OR"],
  },
  {
    id: "cus-northstar",
    name: "Northstar Electric",
    primaryContact: "Ben Rivera",
    email: "ben@northstarelectric.io",
    phone: "(303) 555-0166",
    address: "2100 15th St, Denver, CO 80202",
    balance: 18_000,
    ltv: 122_600,
    avgPayDays: 15,
    status: "active",
    reliability: "excellent",
    billingContacts: [{ name: "Ben Rivera", email: "ben@northstarelectric.io", role: "Owner" }],
    paymentMethods: [{ type: "Wire", last4: "—" }],
    createdAt: "May 22, 2023",
    industry: "Electrical",
    states: ["CO", "UT", "NM", "AZ", "NV", "TX"],
  },
  {
    id: "cus-harborline",
    name: "Harborline Plumbing",
    primaryContact: "Melissa Kim",
    email: "melissa@harborline.pl",
    phone: "(619) 555-0138",
    address: "300 Harbor Dr, San Diego, CA 92101",
    balance: 0,
    ltv: 12_600,
    avgPayDays: 9,
    status: "prospect",
    reliability: "fair",
    billingContacts: [{ name: "Melissa Kim", email: "melissa@harborline.pl", role: "Owner" }],
    paymentMethods: [{ type: "Card", last4: "1188" }],
    createdAt: "Apr 30, 2025",
    industry: "Plumbing",
    states: ["CA"],
  },
  {
    id: "cus-ironclad",
    name: "Ironclad HVAC Co.",
    primaryContact: "Deb Ortega",
    email: "billing@ironcladhvac.com",
    phone: "(480) 555-0122",
    address: "5500 Scottsdale Rd, Scottsdale, AZ 85254",
    balance: 2_400,
    ltv: 38_400,
    avgPayDays: 6,
    status: "active",
    reliability: "excellent",
    billingContacts: [{ name: "Deb Ortega", email: "deb@ironcladhvac.com", role: "Controller" }],
    paymentMethods: [{ type: "ACH", last4: "5501" }],
    createdAt: "Jan 6, 2023",
    industry: "HVAC",
    states: ["AZ"],
  },
  {
    id: "cus-redwood",
    name: "Redwood Roofing Inc.",
    primaryContact: "Aaron Vega",
    email: "aaron@redwoodroof.com",
    phone: "(415) 555-0184",
    address: "1201 Bryant St, San Francisco, CA 94103",
    balance: 6_800,
    ltv: 27_400,
    avgPayDays: 34,
    status: "at_risk",
    reliability: "fair",
    billingContacts: [{ name: "Aaron Vega", email: "aaron@redwoodroof.com", role: "Owner" }],
    paymentMethods: [{ type: "ACH", last4: "6644" }],
    createdAt: "Jul 19, 2024",
    industry: "Roofing",
    states: ["CA"],
  },
  {
    id: "cus-summit",
    name: "Summit Solar Partners",
    primaryContact: "Nadia Fox",
    email: "nadia@summitsolar.co",
    phone: "(801) 555-0192",
    address: "77 Foothill Blvd, Salt Lake City, UT 84102",
    balance: 3_200,
    ltv: 15_800,
    avgPayDays: 8,
    status: "active",
    reliability: "good",
    billingContacts: [{ name: "Nadia Fox", email: "nadia@summitsolar.co", role: "Ops Lead" }],
    paymentMethods: [{ type: "Card", last4: "4821" }],
    createdAt: "Feb 12, 2025",
    industry: "Solar",
    states: ["UT", "ID"],
  },
  {
    id: "cus-atlas",
    name: "Atlas Concrete Works",
    primaryContact: "Miguel Ruiz",
    email: "miguel@atlasconcrete.co",
    phone: "(713) 555-0155",
    address: "6400 Richmond Ave, Houston, TX 77057",
    balance: 14_200,
    ltv: 51_600,
    avgPayDays: 41,
    status: "past_due",
    reliability: "poor",
    billingContacts: [{ name: "Miguel Ruiz", email: "miguel@atlasconcrete.co", role: "Owner" }],
    paymentMethods: [{ type: "Check", last4: "—" }],
    createdAt: "Oct 5, 2023",
    industry: "Concrete",
    states: ["TX", "LA"],
  },
];

export const INVOICES: Invoice[] = [
  {
    id: "inv-1042",
    number: "INV-1042",
    customerId: "cus-acme",
    customerName: "Acme Contracting LLC",
    issued: "May 8, 2025",
    due: "May 22, 2025",
    terms: "Net 14",
    status: "sent",
    po: "PO-4402",
    notes: "Multi-state contractor license — TX + FL",
    customerNotes: "Thank you for your business.",
    laborCost: 620,
    techAllocation: 90,
    marketingCac: 110,
    lines: [
      {
        id: "l1",
        service: "TX state filing fee",
        qty: 1,
        rate: 1_250,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        jurisdiction: "TX",
        department: "Licensing",
        estCost: 1_250,
      },
      {
        id: "l2",
        service: "Qualifier retention (FL)",
        qty: 1,
        rate: 750,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        jurisdiction: "FL",
        department: "Licensing",
        estCost: 750,
      },
      {
        id: "l3",
        service: "License application preparation",
        qty: 1,
        rate: 2_700,
        discount: 0,
        tax: 0,
        treatment: "cca_revenue",
        department: "Licensing",
        commissionOwner: "B. Rivera",
        estCost: 780,
        targetMarginPct: 62,
      },
      {
        id: "l4",
        service: "Sales commission accrual — B. Rivera",
        qty: 1,
        rate: 300,
        discount: 0,
        tax: 0,
        treatment: "commissionable",
        department: "Sales",
        commissionOwner: "B. Rivera",
        estCost: 0,
      },
    ],
    paid: 0,
    likelihood: "very_likely",
    likelihoodReasons: [
      "18 prior invoices paid on time",
      "Deposit not required for this account",
      "Contract active through 2026",
    ],
    timeline: [
      {
        at: "May 8, 2025 · 9:14 AM",
        actor: "R. Alvarez",
        action: "Invoice created from estimate EST-208",
      },
      {
        at: "May 8, 2025 · 9:16 AM",
        actor: "System",
        action: "Allocation preview generated — 2 pass-through lines flagged",
      },
      {
        at: "May 8, 2025 · 9:22 AM",
        actor: "M. Rose",
        action: "Approved and sent to jordan@acmecontracting.com",
      },
      { at: "May 9, 2025 · 2:41 PM", actor: "System", action: "Client viewed invoice via portal" },
    ],
    attachments: 2,
  },
  {
    id: "inv-1039",
    number: "INV-1039",
    customerId: "cus-blueridge",
    customerName: "Blue Ridge Builders",
    issued: "May 5, 2025",
    due: "May 19, 2025",
    terms: "Net 14",
    status: "partial",
    notes: "Compliance audit + prepaid retainer",
    laborCost: 2_100,
    techAllocation: 220,
    marketingCac: 340,
    lines: [
      {
        id: "l1",
        service: "Compliance audit",
        qty: 1,
        rate: 6_000,
        discount: 0,
        tax: 0,
        treatment: "cca_revenue",
        department: "Audit",
        estCost: 1_600,
        targetMarginPct: 68,
      },
      {
        id: "l2",
        service: "Monthly compliance retainer (advance)",
        qty: 1,
        rate: 2_500,
        discount: 0,
        tax: 0,
        treatment: "deferred_revenue",
        department: "Retainer",
        estCost: 520,
      },
    ],
    paid: 6_000,
    likelihood: "likely_late",
    likelihoodReasons: [
      "Averages 18 days to pay",
      "Two prior partial payments",
      "No open disputes",
    ],
    timeline: [
      { at: "May 5, 2025 · 10:02 AM", actor: "R. Alvarez", action: "Invoice created" },
      {
        at: "May 5, 2025 · 11:18 AM",
        actor: "M. Rose",
        action: "Sent to sam@blueridgebuilders.co",
      },
      { at: "May 12, 2025 · 3:05 PM", actor: "Client", action: "Partial payment $6,000 (Wire)" },
    ],
    attachments: 1,
  },
  {
    id: "inv-1035",
    number: "INV-1035",
    customerId: "cus-cascade",
    customerName: "Cascade Mechanical Group",
    issued: "May 2, 2025",
    due: "May 16, 2025",
    terms: "Net 14",
    status: "overdue",
    notes: "CA C-36 + WA application prep",
    laborCost: 2_400,
    techAllocation: 180,
    marketingCac: 400,
    lines: [
      {
        id: "l1",
        service: "CA CSLB application fee",
        qty: 1,
        rate: 730,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        jurisdiction: "CA",
        department: "Licensing",
        estCost: 730,
      },
      {
        id: "l2",
        service: "WA L&I contractor fee",
        qty: 1,
        rate: 220,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        jurisdiction: "WA",
        department: "Licensing",
        estCost: 220,
      },
      {
        id: "l3",
        service: "Background check package",
        qty: 1,
        rate: 180,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        department: "Licensing",
        estCost: 180,
      },
      {
        id: "l4",
        service: "Surety bond premium",
        qty: 1,
        rate: 1_450,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        department: "Licensing",
        estCost: 1_450,
      },
      {
        id: "l5",
        service: "Application preparation — 2 states",
        qty: 2,
        rate: 4_310,
        discount: 0,
        tax: 0,
        treatment: "cca_revenue",
        department: "Licensing",
        commissionOwner: "D. Ortega",
        estCost: 1_560,
        targetMarginPct: 55,
      },
      {
        id: "l6",
        service: "Sales commission accrual — D. Ortega",
        qty: 1,
        rate: 720,
        discount: 0,
        tax: 0,
        treatment: "commissionable",
        department: "Sales",
        commissionOwner: "D. Ortega",
        estCost: 0,
      },
      {
        id: "l7",
        service: "Tax reserve (est.)",
        qty: 1,
        rate: 480,
        discount: 0,
        tax: 0,
        treatment: "tax_reserve",
        department: "Finance",
        estCost: 0,
      },
    ],
    paid: 0,
    likelihood: "high_followup",
    likelihoodReasons: [
      "6 days past due",
      "Historical avg 22 days to pay",
      "Client requested extension in April",
    ],
    timeline: [
      { at: "May 2, 2025 · 8:44 AM", actor: "R. Alvarez", action: "Invoice created" },
      { at: "May 2, 2025 · 9:10 AM", actor: "M. Rose", action: "Sent to priya@cascademech.com" },
      { at: "May 3, 2025 · 4:22 PM", actor: "System", action: "Client viewed invoice via portal" },
      {
        at: "May 17, 2025 · 7:00 AM",
        actor: "System",
        action: "Automatic reminder sent (day 1 overdue)",
      },
    ],
    attachments: 3,
  },
  {
    id: "inv-1031",
    number: "INV-1031",
    customerId: "cus-northstar",
    customerName: "Northstar Electric",
    issued: "Apr 28, 2025",
    due: "May 12, 2025",
    terms: "Net 14",
    status: "paid",
    notes: "6-state expansion roadmap",
    laborCost: 3_400,
    techAllocation: 260,
    marketingCac: 620,
    lines: [
      {
        id: "l1",
        service: "State portal & filing fees (6)",
        qty: 1,
        rate: 4_650,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        department: "Licensing",
        estCost: 4_650,
      },
      {
        id: "l2",
        service: "Registered agent (partner)",
        qty: 1,
        rate: 1_100,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        department: "Licensing",
        estCost: 1_100,
      },
      {
        id: "l3",
        service: "Multi-state expansion roadmap",
        qty: 1,
        rate: 10_430,
        discount: 0,
        tax: 0,
        treatment: "cca_revenue",
        department: "Licensing",
        commissionOwner: "B. Rivera",
        estCost: 3_600,
        targetMarginPct: 55,
      },
      {
        id: "l4",
        service: "Sales commission accrual — B. Rivera",
        qty: 1,
        rate: 1_200,
        discount: 0,
        tax: 0,
        treatment: "commissionable",
        department: "Sales",
        commissionOwner: "B. Rivera",
        estCost: 0,
      },
      {
        id: "l5",
        service: "Tax reserve",
        qty: 1,
        rate: 620,
        discount: 0,
        tax: 0,
        treatment: "tax_reserve",
        department: "Finance",
        estCost: 0,
      },
    ],
    paid: 18_000,
    likelihood: "very_likely",
    likelihoodReasons: ["Paid 4 days early on last 3 invoices", "Wire method", "Zero disputes"],
    timeline: [
      { at: "Apr 28, 2025", actor: "R. Alvarez", action: "Invoice created" },
      { at: "Apr 28, 2025", actor: "M. Rose", action: "Sent to ben@northstarelectric.io" },
      { at: "May 6, 2025", actor: "Client", action: "Paid $18,000 (Wire)" },
    ],
    attachments: 2,
  },
  {
    id: "inv-1028",
    number: "INV-1028",
    customerId: "cus-harborline",
    customerName: "Harborline Plumbing",
    issued: "Apr 25, 2025",
    due: "May 9, 2025",
    terms: "Due on receipt",
    status: "paid",
    notes: "Refundable onboarding deposit",
    laborCost: 120,
    techAllocation: 40,
    marketingCac: 260,
    lines: [
      {
        id: "l1",
        service: "Onboarding deposit (refundable)",
        qty: 1,
        rate: 4_000,
        discount: 0,
        tax: 0,
        treatment: "refundable_deposit",
        department: "Onboarding",
        estCost: 0,
      },
    ],
    paid: 4_000,
    likelihood: "very_likely",
    likelihoodReasons: ["Card on file", "Auto-collected on issue"],
    timeline: [
      { at: "Apr 25, 2025", actor: "System", action: "Auto-generated onboarding invoice" },
      { at: "Apr 25, 2025", actor: "Client", action: "Paid $4,000 (Card ****1188)" },
    ],
    attachments: 0,
  },
  {
    id: "inv-1024",
    number: "INV-1024",
    customerId: "cus-ironclad",
    customerName: "Ironclad HVAC Co.",
    issued: "May 1, 2025",
    due: "May 15, 2025",
    terms: "Net 14",
    status: "paid",
    notes: "Monthly compliance — renewal",
    laborCost: 480,
    techAllocation: 60,
    marketingCac: 0,
    lines: [
      {
        id: "l1",
        service: "Monthly compliance management",
        qty: 1,
        rate: 2_400,
        discount: 0,
        tax: 0,
        treatment: "non_commissionable",
        department: "Retainer",
        estCost: 520,
        targetMarginPct: 72,
      },
    ],
    paid: 2_400,
    likelihood: "very_likely",
    likelihoodReasons: ["Auto-pay ACH enrolled", "24 consecutive on-time"],
    timeline: [
      { at: "May 1, 2025", actor: "System", action: "Recurring invoice generated" },
      { at: "May 3, 2025", actor: "Client", action: "Paid $2,400 (ACH auto-pay)" },
    ],
    attachments: 0,
  },
  {
    id: "inv-1019",
    number: "INV-1019",
    customerId: "cus-redwood",
    customerName: "Redwood Roofing Inc.",
    issued: "Apr 15, 2025",
    due: "Apr 29, 2025",
    terms: "Net 14",
    status: "overdue",
    notes: "Multi-state permit prep",
    laborCost: 1_400,
    techAllocation: 140,
    marketingCac: 280,
    lines: [
      {
        id: "l1",
        service: "Municipal permit fees",
        qty: 1,
        rate: 1_820,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        department: "Permits",
        estCost: 1_820,
      },
      {
        id: "l2",
        service: "Courier & shipping",
        qty: 1,
        rate: 140,
        discount: 0,
        tax: 0,
        treatment: "reimbursable",
        department: "Permits",
        estCost: 140,
      },
      {
        id: "l3",
        service: "Permit coordination",
        qty: 1,
        rate: 4_210,
        discount: 0,
        tax: 0,
        treatment: "cca_revenue",
        department: "Permits",
        commissionOwner: "D. Ortega",
        estCost: 1_240,
        targetMarginPct: 58,
      },
      {
        id: "l4",
        service: "Sales commission accrual — D. Ortega",
        qty: 1,
        rate: 420,
        discount: 0,
        tax: 0,
        treatment: "commissionable",
        department: "Sales",
        estCost: 0,
      },
      {
        id: "l5",
        service: "Tax reserve",
        qty: 1,
        rate: 210,
        discount: 0,
        tax: 0,
        treatment: "tax_reserve",
        department: "Finance",
        estCost: 0,
      },
    ],
    paid: 0,
    likelihood: "possible_dispute",
    likelihoodReasons: [
      "17 days overdue",
      "Client emailed with scope question May 3",
      "Reliability score fair",
    ],
    timeline: [
      { at: "Apr 15, 2025", actor: "R. Alvarez", action: "Invoice created" },
      { at: "Apr 15, 2025", actor: "M. Rose", action: "Sent to aaron@redwoodroof.com" },
      { at: "Apr 30, 2025", actor: "System", action: "Overdue reminder sent (day 1)" },
      { at: "May 3, 2025", actor: "Client", action: "Replied — scope clarification requested" },
      { at: "May 10, 2025", actor: "System", action: "Second reminder sent" },
    ],
    attachments: 4,
  },
  {
    id: "inv-1015",
    number: "INV-1015",
    customerId: "cus-summit",
    customerName: "Summit Solar Partners",
    issued: "Apr 10, 2025",
    due: "Apr 24, 2025",
    terms: "Net 14",
    status: "paid",
    notes: "Document review + consult",
    laborCost: 620,
    techAllocation: 80,
    marketingCac: 90,
    lines: [
      {
        id: "l1",
        service: "Document review",
        qty: 1,
        rate: 1_800,
        discount: 0,
        tax: 0,
        treatment: "cca_revenue",
        department: "Advisory",
        estCost: 320,
        targetMarginPct: 78,
      },
      {
        id: "l2",
        service: "Consulting hours",
        qty: 4,
        rate: 350,
        discount: 0,
        tax: 0,
        treatment: "commissionable",
        department: "Advisory",
        commissionOwner: "M. Rose",
        estCost: 480,
        targetMarginPct: 60,
      },
    ],
    paid: 3_200,
    likelihood: "very_likely",
    likelihoodReasons: ["Card on file", "Fast payer"],
    timeline: [
      { at: "Apr 10, 2025", actor: "R. Alvarez", action: "Invoice created" },
      { at: "Apr 18, 2025", actor: "Client", action: "Paid $3,200 (Card ****4821)" },
    ],
    attachments: 1,
  },
  {
    id: "inv-1011",
    number: "INV-1011",
    customerId: "cus-atlas",
    customerName: "Atlas Concrete Works",
    issued: "Mar 22, 2025",
    due: "Apr 5, 2025",
    terms: "Net 14",
    status: "overdue",
    notes: "Cross-state licensing",
    laborCost: 2_800,
    techAllocation: 260,
    marketingCac: 460,
    lines: [
      {
        id: "l1",
        service: "State filing fees (TX + LA)",
        qty: 1,
        rate: 2_400,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        department: "Licensing",
        estCost: 2_400,
      },
      {
        id: "l2",
        service: "Application preparation",
        qty: 1,
        rate: 8_600,
        discount: 500,
        tax: 0,
        treatment: "cca_revenue",
        department: "Licensing",
        commissionOwner: "B. Rivera",
        estCost: 4_100,
        targetMarginPct: 52,
      },
      {
        id: "l3",
        service: "Sales commission accrual",
        qty: 1,
        rate: 720,
        discount: 0,
        tax: 0,
        treatment: "commissionable",
        department: "Sales",
        estCost: 0,
      },
      {
        id: "l4",
        service: "Tax reserve",
        qty: 1,
        rate: 480,
        discount: 0,
        tax: 0,
        treatment: "tax_reserve",
        department: "Finance",
        estCost: 0,
      },
      {
        id: "l5",
        service: "Refundable good-faith deposit",
        qty: 1,
        rate: 2_000,
        discount: 0,
        tax: 0,
        treatment: "refundable_deposit",
        department: "Onboarding",
        estCost: 0,
      },
    ],
    paid: 0,
    likelihood: "chargeback_risk",
    likelihoodReasons: [
      "41-day avg pay history",
      "Two prior payment reversals",
      "Escalate to Rose",
    ],
    timeline: [
      { at: "Mar 22, 2025", actor: "R. Alvarez", action: "Invoice created" },
      { at: "Mar 22, 2025", actor: "M. Rose", action: "Sent to miguel@atlasconcrete.co" },
      { at: "Apr 8, 2025", actor: "System", action: "Overdue reminder sent (day 3)" },
      { at: "Apr 22, 2025", actor: "System", action: "Second overdue reminder" },
      { at: "May 6, 2025", actor: "M. Rose", action: "Escalated — collections review" },
    ],
    attachments: 5,
  },
  {
    id: "inv-1010",
    number: "INV-1010",
    customerId: "cus-northstar",
    customerName: "Northstar Electric",
    issued: "May 12, 2025",
    due: "May 26, 2025",
    terms: "Net 14",
    status: "draft",
    notes: "Change order — 2 additional states",
    laborCost: 1_100,
    techAllocation: 120,
    marketingCac: 0,
    lines: [
      {
        id: "l1",
        service: "State portal & filing fees (2)",
        qty: 1,
        rate: 1_540,
        discount: 0,
        tax: 0,
        treatment: "pass_through",
        department: "Licensing",
        estCost: 1_540,
      },
      {
        id: "l2",
        service: "Application preparation — 2 states",
        qty: 2,
        rate: 2_700,
        discount: 0,
        tax: 0,
        treatment: "cca_revenue",
        department: "Licensing",
        commissionOwner: "B. Rivera",
        estCost: 780,
        targetMarginPct: 62,
      },
    ],
    paid: 0,
    likelihood: "very_likely",
    likelihoodReasons: ["Same client as INV-1031 (paid on time)", "No open disputes"],
    timeline: [{ at: "May 12, 2025", actor: "R. Alvarez", action: "Draft created" }],
    attachments: 0,
  },
];

/** Compute totals & allocations for a set of lines. */
export function computeInvoice(lines: InvoiceLine[]) {
  const buckets = { restricted: 0, reserved: 0, operating: 0 };
  let subtotal = 0;
  let discount = 0;
  let tax = 0;
  let fulfillmentCost = 0;
  let commissionable = 0;
  let ccaRevenue = 0;
  let passThrough = 0;
  let commission = 0;
  let taxReserve = 0;
  let deferred = 0;

  for (const l of lines) {
    const gross = l.qty * l.rate;
    const net = gross - l.discount + l.tax;
    subtotal += gross;
    discount += l.discount;
    tax += l.tax;
    fulfillmentCost += l.estCost;

    const meta = TREATMENT_META[l.treatment];
    buckets[meta.spendability] += net;

    if (l.treatment === "cca_revenue" || l.treatment === "non_commissionable") ccaRevenue += net;
    if (l.treatment === "commissionable") {
      commissionable += net;
      commission += net;
      ccaRevenue += 0; // commission line is a reserve, not new revenue
    }
    if (l.treatment === "pass_through") passThrough += net;
    if (l.treatment === "tax_reserve") taxReserve += net;
    if (l.treatment === "deferred_revenue") deferred += net;
  }

  const total = subtotal - discount + tax;

  return {
    subtotal,
    discount,
    tax,
    total,
    fulfillmentCost,
    ccaRevenue,
    commissionable,
    commission,
    passThrough,
    taxReserve,
    deferredRevenue: deferred,
    restricted: buckets.restricted,
    reserved: buckets.reserved,
    operating: buckets.operating,
    trueAvailableAfterCollection: buckets.operating - commission - taxReserve,
  };
}

/** Weighted target margin across CCA-earning lines. */
export function targetMarginFor(lines: InvoiceLine[]) {
  let weighted = 0;
  let base = 0;
  for (const l of lines) {
    if (!l.targetMarginPct) continue;
    const net = l.qty * l.rate - l.discount;
    weighted += net * l.targetMarginPct;
    base += net;
  }
  return base > 0 ? weighted / base : 0;
}

/** Compute contribution margin for the invoice. */
export function computeMargin(
  inv: Pick<Invoice, "lines" | "laborCost" | "techAllocation" | "marketingCac">,
) {
  const c = computeInvoice(inv.lines);
  // Revenue we truly earn: CCA revenue + commissionable revenue (net of commission accrual)
  const earnedRevenue = c.ccaRevenue + c.commissionable;
  // Direct costs: fulfillment for CCA/service lines + commission + labor + tech alloc + CAC
  const directCost =
    inv.lines
      .filter((l) => TREATMENT_META[l.treatment].spendability !== "restricted")
      .reduce((s, l) => s + l.estCost, 0) +
    c.commission +
    inv.laborCost +
    inv.techAllocation +
    inv.marketingCac;
  const contribution = earnedRevenue - directCost;
  const marginPct = earnedRevenue > 0 ? (contribution / earnedRevenue) * 100 : 0;
  const target = targetMarginFor(inv.lines);
  return {
    earnedRevenue,
    directCost,
    contribution,
    marginPct,
    target,
    belowTarget: marginPct < target - 3,
  };
}

export type Estimate = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  issued: string;
  expires: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";
  total: number;
  service: string;
};

export const ESTIMATES: Estimate[] = [
  {
    id: "est-208",
    number: "EST-208",
    customerId: "cus-acme",
    customerName: "Acme Contracting LLC",
    issued: "May 6, 2025",
    expires: "Jun 5, 2025",
    status: "accepted",
    total: 5_000,
    service: "Multi-state contractor license — TX + FL",
  },
  {
    id: "est-209",
    number: "EST-209",
    customerId: "cus-cascade",
    customerName: "Cascade Mechanical Group",
    issued: "May 8, 2025",
    expires: "Jun 7, 2025",
    status: "sent",
    total: 14_800,
    service: "CA + WA + OR expansion",
  },
  {
    id: "est-210",
    number: "EST-210",
    customerId: "cus-summit",
    customerName: "Summit Solar Partners",
    issued: "May 10, 2025",
    expires: "Jun 9, 2025",
    status: "viewed",
    total: 6_400,
    service: "Utah C-30 + follow-on",
  },
  {
    id: "est-211",
    number: "EST-211",
    customerId: "cus-harborline",
    customerName: "Harborline Plumbing",
    issued: "May 11, 2025",
    expires: "Jun 10, 2025",
    status: "draft",
    total: 3_800,
    service: "CA plumber license transition",
  },
  {
    id: "est-207",
    number: "EST-207",
    customerId: "cus-redwood",
    customerName: "Redwood Roofing Inc.",
    issued: "Apr 20, 2025",
    expires: "May 20, 2025",
    status: "declined",
    total: 8_200,
    service: "Bay Area municipal permits",
  },
  {
    id: "est-206",
    number: "EST-206",
    customerId: "cus-atlas",
    customerName: "Atlas Concrete Works",
    issued: "Apr 12, 2025",
    expires: "May 12, 2025",
    status: "expired",
    total: 11_400,
    service: "TX + LA license bundle",
  },
];

export type RecurringSchedule = {
  id: string;
  customerName: string;
  template: string;
  frequency: "Monthly" | "Quarterly" | "Annually" | "Weekly";
  nextRun: string;
  amount: number;
  active: boolean;
  runCount: number;
  treatment: Treatment;
};

export const RECURRING: RecurringSchedule[] = [
  {
    id: "rec-01",
    customerName: "Ironclad HVAC Co.",
    template: "Monthly compliance management",
    frequency: "Monthly",
    nextRun: "Jun 1, 2025",
    amount: 2_400,
    active: true,
    runCount: 24,
    treatment: "non_commissionable",
  },
  {
    id: "rec-02",
    customerName: "Blue Ridge Builders",
    template: "Compliance retainer",
    frequency: "Monthly",
    nextRun: "Jun 3, 2025",
    amount: 3_500,
    active: true,
    runCount: 14,
    treatment: "non_commissionable",
  },
  {
    id: "rec-03",
    customerName: "Northstar Electric",
    template: "Multi-state monitoring",
    frequency: "Monthly",
    nextRun: "Jun 5, 2025",
    amount: 4_800,
    active: true,
    runCount: 9,
    treatment: "non_commissionable",
  },
  {
    id: "rec-04",
    customerName: "Summit Solar Partners",
    template: "Advisory retainer",
    frequency: "Quarterly",
    nextRun: "Jul 1, 2025",
    amount: 6_200,
    active: true,
    runCount: 3,
    treatment: "cca_revenue",
  },
  {
    id: "rec-05",
    customerName: "Cascade Mechanical Group",
    template: "Annual renewal package",
    frequency: "Annually",
    nextRun: "Nov 14, 2025",
    amount: 12_400,
    active: true,
    runCount: 3,
    treatment: "cca_revenue",
  },
  {
    id: "rec-06",
    customerName: "Atlas Concrete Works",
    template: "Monthly compliance management",
    frequency: "Monthly",
    nextRun: "—",
    amount: 2_800,
    active: false,
    runCount: 6,
    treatment: "non_commissionable",
  },
];

export type CreditNote = {
  id: string;
  number: string;
  customerName: string;
  issued: string;
  amount: number;
  reason: string;
  status: "open" | "applied" | "refunded";
  appliedTo?: string;
};

export const CREDIT_NOTES: CreditNote[] = [
  {
    id: "cn-042",
    number: "CN-042",
    customerName: "Blue Ridge Builders",
    issued: "Apr 30, 2025",
    amount: 250,
    reason: "Duplicate late fee reversal",
    status: "applied",
    appliedTo: "INV-1039",
  },
  {
    id: "cn-041",
    number: "CN-041",
    customerName: "Cascade Mechanical Group",
    issued: "Apr 22, 2025",
    amount: 480,
    reason: "Scope reduction — CA line item removed",
    status: "open",
  },
  {
    id: "cn-040",
    number: "CN-040",
    customerName: "Redwood Roofing Inc.",
    issued: "Apr 18, 2025",
    amount: 640,
    reason: "Client goodwill credit — delayed filing",
    status: "open",
  },
  {
    id: "cn-039",
    number: "CN-039",
    customerName: "Summit Solar Partners",
    issued: "Apr 8, 2025",
    amount: 300,
    reason: "Refund — cancelled consult hour",
    status: "refunded",
  },
  {
    id: "cn-038",
    number: "CN-038",
    customerName: "Harborline Plumbing",
    issued: "Apr 5, 2025",
    amount: 200,
    reason: "Onboarding promo credit",
    status: "applied",
    appliedTo: "INV-1028",
  },
];

/** Aggregate KPIs for the invoice list. */
export function invoiceKpis(invs: Invoice[]) {
  let outstanding = 0;
  let overdue = 0;
  let draft = 0;
  let paidThisPeriod = 0;
  let payDaysSum = 0;
  let paidCount = 0;
  for (const i of invs) {
    const total = computeInvoice(i.lines).total;
    const balance = total - i.paid;
    if (i.status === "draft") draft += total;
    if (i.status === "overdue") overdue += balance;
    if (
      i.status === "sent" ||
      i.status === "viewed" ||
      i.status === "partial" ||
      i.status === "overdue"
    )
      outstanding += balance;
    if (i.status === "paid") {
      paidThisPeriod += total;
      paidCount += 1;
    }
  }
  // Rough avg pay days from customer averages weighted by count
  payDaysSum = 14; // stable mock
  return { outstanding, overdue, draft, paidThisPeriod, avgPayDays: payDaysSum, paidCount };
}
