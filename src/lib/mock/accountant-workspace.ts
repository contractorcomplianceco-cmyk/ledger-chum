// Phase 3 accountant workspace demo data. Mirrors LedgerOS schema shapes so
// the UI can be wired to real server functions later without restructuring.

export type IntegrationEventType =
  | "work_order.completed"
  | "invoice.created"
  | "invoice.posted"
  | "payment.received"
  | "inventory.consumed"
  | "refund.created";

export type SyncStatus = "success" | "pending" | "failed" | "retrying";

export interface IntegrationEvent {
  id: string;
  source: string;
  event: IntegrationEventType;
  externalId: string;
  customer: string;
  amount: number;
  timestamp: string;
  status: SyncStatus;
  syncResult: string;
  correlationId?: string;
  error?: string;
}

export interface DraftInvoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerExternalId: string;
  workOrderRef: string;
  issueDate: string;
  status: "draft" | "posted" | "sent" | "partial" | "paid";
  labor: Array<{ description: string; hours: number; rate: number; account: string }>;
  materials: Array<{ description: string; quantity: number; price: number; cost: number; account: string; inventoryAccount: string }>;
  taxRate: number;
  createdVia: string;
}

export interface AccountMappingRow {
  purpose:
    | "ar"
    | "cash_default"
    | "labor_revenue"
    | "material_revenue"
    | "inventory_asset"
    | "material_cogs"
    | "refund_clearing"
    | "credit_liability";
  label: string;
  serviceConnectSource: string;
  ledgerAccount: string;
  accountCode: string;
  status: "mapped" | "unmapped" | "review";
  updatedAt: string;
}

export interface ConnectedSystem {
  id: string;
  name: string;
  category: string;
  status: "healthy" | "degraded" | "failed";
  environment: "production" | "sandbox";
  lastSync: string;
  successCount24h: number;
  failedCount24h: number;
  pendingCount: number;
  retryStatus?: string;
  scopes: string[];
}

// ============= Demo data =============

const now = new Date();
const iso = (minutesAgo: number) =>
  new Date(now.getTime() - minutesAgo * 60_000).toISOString();

export const DEMO_EVENTS: IntegrationEvent[] = [
  { id: "evt_a1", source: "ServiceConnect", event: "work_order.completed", externalId: "WO-10001", customer: "Apex Marine Repair", amount: 650, timestamp: iso(3), status: "success", syncResult: "Invoice INV-WO-10001 drafted", correlationId: "corr_9f21" },
  { id: "evt_a2", source: "ServiceConnect", event: "inventory.consumed", externalId: "WO-10001-mat-1", customer: "Apex Marine Repair", amount: 75, timestamp: iso(3), status: "success", syncResult: "COGS $75 posted · JE-2044" },
  { id: "evt_a3", source: "LedgerOS", event: "invoice.posted", externalId: "INV-WO-10001", customer: "Apex Marine Repair", amount: 650, timestamp: iso(1), status: "success", syncResult: "AR $650 posted · JE-2045" },
  { id: "evt_a4", source: "ServiceConnect", event: "payment.received", externalId: "PMT-88213", customer: "Harbor Logistics LLC", amount: 4200, timestamp: iso(24), status: "success", syncResult: "Cash $4,200 posted · JE-2038" },
  { id: "evt_a5", source: "ServiceConnect", event: "work_order.completed", externalId: "WO-10002", customer: "Coastal Freight Co", amount: 1875, timestamp: iso(38), status: "pending", syncResult: "Awaiting accountant review" },
  { id: "evt_a6", source: "ServiceConnect", event: "refund.created", externalId: "REF-771", customer: "Delta Yacht Club", amount: 250, timestamp: iso(120), status: "success", syncResult: "Refund reversal posted · JE-2031" },
  { id: "evt_a7", source: "ServiceConnect", event: "work_order.completed", externalId: "WO-10003", customer: "Unknown customer", amount: 900, timestamp: iso(180), status: "failed", syncResult: "Customer SC-CUST-99 not found", error: "422 unknown_customer" },
  { id: "evt_a8", source: "ServiceConnect", event: "inventory.consumed", externalId: "WO-10004-mat-2", customer: "Northwind Ops", amount: 320, timestamp: iso(240), status: "retrying", syncResult: "Retry 2 of 5 · backoff 15m" },
];

export const DEMO_DRAFT_INVOICES: DraftInvoice[] = [
  {
    id: "inv_draft_1",
    invoiceNumber: "INV-WO-10002",
    customer: "Coastal Freight Co",
    customerExternalId: "SC-CUST-7",
    workOrderRef: "WO-10002",
    issueDate: now.toISOString().slice(0, 10),
    status: "draft",
    labor: [
      { description: "Diesel technician labor", hours: 6, rate: 145, account: "4100 · Labor Revenue" },
      { description: "Diagnostic hours", hours: 2, rate: 145, account: "4100 · Labor Revenue" },
    ],
    materials: [
      { description: "Fuel injector assembly", quantity: 1, price: 725, cost: 410, account: "4200 · Material Revenue", inventoryAccount: "1300 · Inventory Asset" },
      { description: "Gasket kit", quantity: 2, price: 45, cost: 18, account: "4200 · Material Revenue", inventoryAccount: "1300 · Inventory Asset" },
    ],
    taxRate: 0.06,
    createdVia: "ServiceConnect · work_order.completed",
  },
  {
    id: "inv_draft_2",
    invoiceNumber: "INV-WO-10005",
    customer: "Northwind Ops",
    customerExternalId: "SC-CUST-12",
    workOrderRef: "WO-10005",
    issueDate: now.toISOString().slice(0, 10),
    status: "draft",
    labor: [{ description: "Field service labor", hours: 3, rate: 155, account: "4100 · Labor Revenue" }],
    materials: [
      { description: "Hydraulic hose 3/4in", quantity: 4, price: 65, cost: 28, account: "4200 · Material Revenue", inventoryAccount: "1300 · Inventory Asset" },
    ],
    taxRate: 0,
    createdVia: "ServiceConnect · work_order.completed",
  },
];

export const DEMO_MAPPINGS: AccountMappingRow[] = [
  { purpose: "ar", label: "Accounts Receivable", serviceConnectSource: "invoice.created", ledgerAccount: "1200 · Accounts Receivable", accountCode: "1200", status: "mapped", updatedAt: iso(60 * 24 * 3) },
  { purpose: "cash_default", label: "Cash (default)", serviceConnectSource: "payment.received", ledgerAccount: "1010 · Operating Cash", accountCode: "1010", status: "mapped", updatedAt: iso(60 * 24 * 5) },
  { purpose: "labor_revenue", label: "Labor Revenue", serviceConnectSource: "work_order labor lines", ledgerAccount: "4100 · Labor Revenue", accountCode: "4100", status: "mapped", updatedAt: iso(60 * 24 * 3) },
  { purpose: "material_revenue", label: "Material Revenue", serviceConnectSource: "work_order material lines", ledgerAccount: "4200 · Material Revenue", accountCode: "4200", status: "mapped", updatedAt: iso(60 * 24 * 3) },
  { purpose: "inventory_asset", label: "Inventory Asset", serviceConnectSource: "inventory.consumed", ledgerAccount: "1300 · Inventory Asset", accountCode: "1300", status: "mapped", updatedAt: iso(60 * 24 * 3) },
  { purpose: "material_cogs", label: "Material COGS", serviceConnectSource: "inventory.consumed", ledgerAccount: "5100 · Cost of Goods Sold", accountCode: "5100", status: "mapped", updatedAt: iso(60 * 24 * 3) },
  { purpose: "refund_clearing", label: "Refund Clearing", serviceConnectSource: "refund.created", ledgerAccount: "1010 · Operating Cash", accountCode: "1010", status: "review", updatedAt: iso(60 * 24 * 12) },
  { purpose: "credit_liability", label: "Customer Credit Liability", serviceConnectSource: "credit.issued", ledgerAccount: "—", accountCode: "—", status: "unmapped", updatedAt: iso(60 * 24 * 30) },
];

export const DEMO_SYSTEMS: ConnectedSystem[] = [
  {
    id: "sys_serviceconnect",
    name: "ServiceConnect",
    category: "Operational OS",
    status: "healthy",
    environment: "sandbox",
    lastSync: iso(1),
    successCount24h: 143,
    failedCount24h: 1,
    pendingCount: 2,
    scopes: [
      "customers.read",
      "customers.write",
      "work_orders.completed",
      "invoices.create",
      "invoices.read",
      "payments.create",
      "inventory.consume",
      "refunds.create",
    ],
  },
  {
    id: "sys_bank_import",
    name: "Bank Import (Navy Federal)",
    category: "Banking",
    status: "healthy",
    environment: "production",
    lastSync: iso(60 * 6),
    successCount24h: 12,
    failedCount24h: 0,
    pendingCount: 0,
    scopes: ["transactions.import"],
  },
  {
    id: "sys_payroll",
    name: "RUN ADP",
    category: "Payroll",
    status: "degraded",
    environment: "production",
    lastSync: iso(60 * 30),
    successCount24h: 0,
    failedCount24h: 2,
    pendingCount: 3,
    retryStatus: "Backoff · next retry in 12m",
    scopes: ["payroll.summary.read"],
  },
];

export function computeDraftTotals(inv: DraftInvoice) {
  const laborSubtotal = inv.labor.reduce((s, l) => s + l.hours * l.rate, 0);
  const materialSubtotal = inv.materials.reduce((s, m) => s + m.quantity * m.price, 0);
  const materialCost = inv.materials.reduce((s, m) => s + m.quantity * m.cost, 0);
  const subtotal = laborSubtotal + materialSubtotal;
  const tax = subtotal * inv.taxRate;
  const total = subtotal + tax;
  const grossMargin = subtotal - materialCost;
  return { laborSubtotal, materialSubtotal, materialCost, subtotal, tax, total, grossMargin };
}

export function fmtRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function currency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export const EVENT_LABEL: Record<IntegrationEventType, string> = {
  "work_order.completed": "Work order completed",
  "invoice.created": "Invoice created",
  "invoice.posted": "Invoice posted",
  "payment.received": "Payment received",
  "inventory.consumed": "Inventory consumed",
  "refund.created": "Refund created",
};
