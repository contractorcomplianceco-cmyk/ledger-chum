// Cash Availability & Revenue Allocation — mock data for LedgerOS UI Design Lab.
// Answers the question: how much of the bank balance is actually spendable?

export type Treatment =
  | "cca_revenue"
  | "pass_through"
  | "commissionable"
  | "non_commissionable"
  | "reimbursable"
  | "tax_reserve"
  | "refundable_deposit"
  | "deferred_revenue"
  | "other_restricted";

export type Spendability = "restricted" | "reserved" | "operating";

export const TREATMENT_META: Record<
  Treatment,
  {
    label: string;
    spendability: Spendability;
    glAccount: string;
    description: string;
    reviewNeeded?: boolean;
  }
> = {
  cca_revenue: {
    label: "CCA Service Revenue",
    spendability: "operating",
    glAccount: "4000 - Service Revenue",
    description:
      "Earned revenue for compliance, audit, application, and consulting services delivered by CCA.",
  },
  pass_through: {
    label: "Pass-Through",
    spendability: "restricted",
    glAccount: "2200 - Client Trust Liability",
    description:
      "Funds collected from a client that must be paid to a third party (state, agency, vendor). Never spendable.",
    reviewNeeded: true,
  },
  commissionable: {
    label: "Commissionable Revenue",
    spendability: "operating",
    glAccount: "4010 - Commissionable Revenue",
    description: "CCA revenue that triggers a sales commission accrual at recognition.",
  },
  non_commissionable: {
    label: "Non-Commissionable Revenue",
    spendability: "operating",
    glAccount: "4020 - Non-Commissionable Revenue",
    description: "CCA revenue that does not accrue commission (renewals, house accounts).",
  },
  reimbursable: {
    label: "Reimbursable Expense",
    spendability: "restricted",
    glAccount: "1350 - Reimbursables Receivable",
    description:
      "Client-billed expenses paid to a third party then recouped. Offset against expense, not revenue.",
  },
  tax_reserve: {
    label: "Tax Reserve",
    spendability: "reserved",
    glAccount: "2400 - Tax Reserve",
    description:
      "Portion of collected revenue set aside for sales, use, and income tax obligations.",
    reviewNeeded: true,
  },
  refundable_deposit: {
    label: "Refundable Deposit",
    spendability: "restricted",
    glAccount: "2300 - Refundable Deposits",
    description:
      "Client deposit held until service delivery or contract completion. Liability, not revenue.",
  },
  deferred_revenue: {
    label: "Deferred Revenue",
    spendability: "reserved",
    glAccount: "2500 - Deferred Revenue",
    description:
      "Cash collected for services not yet delivered. Recognized over the delivery period.",
    reviewNeeded: true,
  },
  other_restricted: {
    label: "Other Restricted Funds",
    spendability: "restricted",
    glAccount: "2290 - Other Restricted",
    description:
      "Escrow, retainer, or contract-restricted funds that cannot be commingled with operating cash.",
  },
};

export type AllocationLine = {
  label: string;
  amount: number;
  treatment: Treatment;
  payeeHint?: string;
};

export type ClientPayment = {
  id: string;
  date: string;
  client: string;
  invoice: string;
  service: string;
  gross: number;
  method: "ACH" | "Wire" | "Card" | "Check";
  lines: AllocationLine[];
};

export const CLIENT_PAYMENTS: ClientPayment[] = [
  {
    id: "P-24081",
    date: "May 15, 2025",
    client: "Acme Contracting LLC",
    invoice: "INV-1042",
    service: "Multi-state contractor license — TX + FL",
    gross: 5_000,
    method: "ACH",
    lines: [
      {
        label: "TX state filing fee",
        amount: 1_250,
        treatment: "pass_through",
        payeeHint: "TX SOS",
      },
      {
        label: "Qualifier retention (FL)",
        amount: 750,
        treatment: "pass_through",
        payeeHint: "Qualifier network",
      },
      { label: "Sales commission — B. Rivera", amount: 300, treatment: "commissionable" },
      { label: "CCA service — application prep", amount: 2_700, treatment: "cca_revenue" },
    ],
  },
  {
    id: "P-24082",
    date: "May 14, 2025",
    client: "Blue Ridge Builders",
    invoice: "INV-1039",
    service: "Compliance audit + monthly management",
    gross: 8_500,
    method: "Wire",
    lines: [
      { label: "Compliance audit fee", amount: 6_000, treatment: "cca_revenue" },
      {
        label: "Monthly compliance retainer (advance)",
        amount: 2_500,
        treatment: "deferred_revenue",
      },
    ],
  },
  {
    id: "P-24083",
    date: "May 13, 2025",
    client: "Cascade Mechanical Group",
    invoice: "INV-1035",
    service: "Application prep — CA C-36 + WA",
    gross: 12_400,
    method: "ACH",
    lines: [
      {
        label: "CA CSLB application fee",
        amount: 730,
        treatment: "pass_through",
        payeeHint: "CSLB",
      },
      {
        label: "WA L&I contractor fee",
        amount: 220,
        treatment: "pass_through",
        payeeHint: "WA L&I",
      },
      {
        label: "Background check pkg",
        amount: 180,
        treatment: "pass_through",
        payeeHint: "IdentoGO",
      },
      {
        label: "Surety bond premium (client-paid)",
        amount: 1_450,
        treatment: "pass_through",
        payeeHint: "Surety carrier",
      },
      { label: "Sales commission — D. Ortega", amount: 720, treatment: "commissionable" },
      { label: "Tax reserve (est.)", amount: 480, treatment: "tax_reserve" },
      { label: "CCA application prep", amount: 8_620, treatment: "cca_revenue" },
    ],
  },
  {
    id: "P-24084",
    date: "May 12, 2025",
    client: "Northstar Electric",
    invoice: "INV-1031",
    service: "Expansion roadmap — 6 states",
    gross: 18_000,
    method: "Wire",
    lines: [
      { label: "State portal & filing fees (6)", amount: 4_650, treatment: "pass_through" },
      {
        label: "Registered agent (partner)",
        amount: 1_100,
        treatment: "pass_through",
        payeeHint: "Third-party RA",
      },
      { label: "Sales commission — B. Rivera", amount: 1_200, treatment: "commissionable" },
      { label: "Tax reserve", amount: 620, treatment: "tax_reserve" },
      { label: "Expansion roadmap fee", amount: 10_430, treatment: "cca_revenue" },
    ],
  },
  {
    id: "P-24085",
    date: "May 11, 2025",
    client: "Harborline Plumbing",
    invoice: "INV-1028",
    service: "Refundable retainer",
    gross: 4_000,
    method: "Card",
    lines: [
      { label: "Onboarding deposit (refundable)", amount: 4_000, treatment: "refundable_deposit" },
    ],
  },
  {
    id: "P-24086",
    date: "May 10, 2025",
    client: "Ironclad HVAC Co.",
    invoice: "INV-1024",
    service: "Renewal — monthly compliance mgmt",
    gross: 2_400,
    method: "ACH",
    lines: [
      { label: "Monthly management (renewal)", amount: 2_400, treatment: "non_commissionable" },
    ],
  },
  {
    id: "P-24087",
    date: "May 9, 2025",
    client: "Redwood Roofing Inc.",
    invoice: "INV-1019",
    service: "Multi-state permit prep",
    gross: 6_800,
    method: "ACH",
    lines: [
      { label: "Municipal permit fees", amount: 1_820, treatment: "pass_through" },
      { label: "Courier & shipping", amount: 140, treatment: "reimbursable" },
      { label: "Sales commission — D. Ortega", amount: 420, treatment: "commissionable" },
      { label: "Tax reserve", amount: 210, treatment: "tax_reserve" },
      { label: "CCA permit coordination", amount: 4_210, treatment: "cca_revenue" },
    ],
  },
  {
    id: "P-24088",
    date: "May 8, 2025",
    client: "Summit Solar Partners",
    invoice: "INV-1015",
    service: "Document review + consult",
    gross: 3_200,
    method: "Card",
    lines: [
      { label: "Document review", amount: 1_800, treatment: "cca_revenue" },
      { label: "Consulting hours", amount: 1_400, treatment: "commissionable" },
    ],
  },
];

/** Compute allocation totals across all payments. */
function totalsFrom(payments: ClientPayment[]) {
  let restricted = 0;
  let reserved = 0;
  let operating = 0;
  for (const p of payments) {
    for (const l of p.lines) {
      const s = TREATMENT_META[l.treatment].spendability;
      if (s === "restricted") restricted += l.amount;
      else if (s === "reserved") reserved += l.amount;
      else operating += l.amount;
    }
  }
  return { restricted, reserved, operating };
}

const _totals = totalsFrom(CLIENT_PAYMENTS);

/** Bank cash and reserves that layer on top of the allocation totals. */
export const CASH_POSITION = {
  bankTotal: 892_430,
  passThroughHeld: 158_420, // client trust liabilities aggregated
  commissionReserve: 42_600, // accrued commissions payable
  taxReserve: 68_900, // sales + estimated tax
  payrollReserve: 96_800, // ~1.6 payroll cycles held
  deferredRevenue: 74_200, // service not yet delivered
};

export const CASH_POSITION_DERIVED = {
  restricted: CASH_POSITION.passThroughHeld,
  reserved:
    CASH_POSITION.commissionReserve +
    CASH_POSITION.taxReserve +
    CASH_POSITION.payrollReserve +
    CASH_POSITION.deferredRevenue,
  trueAvailable:
    CASH_POSITION.bankTotal -
    CASH_POSITION.passThroughHeld -
    CASH_POSITION.commissionReserve -
    CASH_POSITION.taxReserve -
    CASH_POSITION.payrollReserve -
    CASH_POSITION.deferredRevenue,
};

/** Waterfall steps for the hero card. */
export const WATERFALL_STEPS = [
  {
    key: "bank",
    label: "Total cash in bank",
    delta: CASH_POSITION.bankTotal,
    kind: "start" as const,
  },
  {
    key: "pt",
    label: "− Pass-through obligations",
    delta: -CASH_POSITION.passThroughHeld,
    kind: "restricted" as const,
  },
  {
    key: "com",
    label: "− Commission reserve",
    delta: -CASH_POSITION.commissionReserve,
    kind: "reserved" as const,
  },
  {
    key: "tax",
    label: "− Tax reserve",
    delta: -CASH_POSITION.taxReserve,
    kind: "reserved" as const,
  },
  {
    key: "pay",
    label: "− Payroll reserve",
    delta: -CASH_POSITION.payrollReserve,
    kind: "reserved" as const,
  },
  {
    key: "def",
    label: "− Deferred revenue",
    delta: -CASH_POSITION.deferredRevenue,
    kind: "reserved" as const,
  },
  {
    key: "avail",
    label: "True available operating cash",
    delta: CASH_POSITION_DERIVED.trueAvailable,
    kind: "end" as const,
  },
];

/** 12-month history of Available / Reserved / Restricted composition of bank cash. */
export const AVAILABILITY_HISTORY = [
  { m: "Jun", available: 402, reserved: 210, restricted: 118 },
  { m: "Jul", available: 428, reserved: 218, restricted: 124 },
  { m: "Aug", available: 452, reserved: 232, restricted: 130 },
  { m: "Sep", available: 478, reserved: 244, restricted: 138 },
  { m: "Oct", available: 501, reserved: 252, restricted: 142 },
  { m: "Nov", available: 522, reserved: 260, restricted: 146 },
  { m: "Dec", available: 548, reserved: 268, restricted: 149 },
  { m: "Jan", available: 561, reserved: 272, restricted: 152 },
  { m: "Feb", available: 574, reserved: 274, restricted: 154 },
  { m: "Mar", available: 588, reserved: 276, restricted: 155 },
  { m: "Apr", available: 602, reserved: 278, restricted: 156 },
  { m: "May", available: 525, reserved: 282, restricted: 158 },
];

/** Upcoming pass-through disbursements (right rail). */
export const UPCOMING_OBLIGATIONS = [
  {
    id: "O-1",
    due: "May 17, 2025",
    payee: "TX Secretary of State",
    label: "Contractor filing — Acme",
    amount: 1_250,
    urgency: "high" as const,
  },
  {
    id: "O-2",
    due: "May 19, 2025",
    payee: "CSLB",
    label: "CA C-36 application — Cascade",
    amount: 730,
    urgency: "med" as const,
  },
  {
    id: "O-3",
    due: "May 20, 2025",
    payee: "Qualifier Network Inc.",
    label: "FL qualifier retention",
    amount: 750,
    urgency: "med" as const,
  },
  {
    id: "O-4",
    due: "May 22, 2025",
    payee: "Surety Carrier",
    label: "Bond premium — Cascade",
    amount: 1_450,
    urgency: "low" as const,
  },
  {
    id: "O-5",
    due: "May 24, 2025",
    payee: "WA L&I",
    label: "Contractor fee — Cascade",
    amount: 220,
    urgency: "low" as const,
  },
  {
    id: "O-6",
    due: "May 27, 2025",
    payee: "State portal batch",
    label: "Northstar expansion (6 states)",
    amount: 4_650,
    urgency: "med" as const,
  },
];

/** Guardrail readouts. */
export const GUARDRAILS = [
  { label: "Payroll cycles protected", value: "2.4", status: "ok" as const, hint: "Target ≥ 2.0" },
  {
    label: "Pass-through held",
    value: "100%",
    status: "ok" as const,
    hint: "Never available for op spend",
  },
  {
    label: "Tax reserve funded",
    value: "82%",
    status: "warn" as const,
    hint: "Target 100% of quarterly estimate",
  },
  {
    label: "Commission accrual",
    value: "Current",
    status: "ok" as const,
    hint: "Matches payable ledger",
  },
];

/** Aggregate this-period allocation split for the KPI tiles. */
export const PERIOD_ALLOCATION = {
  restricted: _totals.restricted,
  reserved: _totals.reserved,
  operating: _totals.operating,
  gross: _totals.restricted + _totals.reserved + _totals.operating,
};

export const spendabilityLabel: Record<Spendability, string> = {
  restricted: "Restricted",
  reserved: "Reserved",
  operating: "Operating",
};
