/**
 * Client-facing invoice document model.
 *
 * This is the ONLY shape the visual `<InvoiceDocument>` ever renders. It carries
 * strictly client-relevant figures — line items and subtotal/discount/tax/total.
 *
 * It deliberately has NO field for the internal CCA allocation breakdown
 * (pass-through, commission reserve, tax reserve, deferred revenue, true available
 * cash, GL accounts, treatments, fulfillment cost). Those live only on the internal
 * views (`AllocationPreviewCard`, `MarginPreviewCard`) and must never reach a client.
 *
 * The mappers below (`fromMockInvoice`, `fromInvoiceRow`) are the choke point: they
 * copy across only the whitelisted client fields, so internal data cannot leak into
 * the document even if upstream shapes grow new internal columns.
 */

import type { Invoice, InvoiceLine, Customer } from "@/lib/mock/invoicing";

export interface InvoiceParty {
  name: string;
  /** Free-form address / contact lines, rendered one per row. */
  lines: string[];
  email?: string;
  phone?: string;
}

export interface InvoiceDocumentLine {
  id: string;
  description: string;
  /** Optional client-safe sub-line (e.g. a jurisdiction or project label). */
  detail?: string;
  quantity: number;
  rate: number;
  /** qty * rate - discount + tax. Precomputed so the view never does money math. */
  amount: number;
}

export interface InvoiceDocumentTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
}

export interface InvoiceDocumentData {
  number: string;
  status?: string;
  issueDate: string;
  dueDate: string;
  terms?: string;
  poNumber?: string;
  billFrom: InvoiceParty;
  billTo: InvoiceParty;
  lines: InvoiceDocumentLine[];
  totals: InvoiceDocumentTotals;
  /** Note shown to the client (thank-you, remittance instructions). */
  notes?: string;
  /** Small print at the foot of the page. */
  footer?: string;
}

/**
 * Default issuer ("bill from"). No org branding table exists yet, so this is the
 * sensible fallback; a real issuer can be threaded through the mappers later.
 */
export const DEFAULT_ISSUER: InvoiceParty = {
  name: "Contractor Compliance Advisory",
  lines: ["500 Congress Ave, Suite 1400", "Austin, TX 78701"],
  email: "billing@cca.example",
  phone: "(512) 555-0100",
};

/** Client-facing line total: gross less discount plus tax. */
export function lineAmount(line: Pick<InvoiceLine, "qty" | "rate" | "discount" | "tax">): number {
  return line.qty * line.rate - line.discount + line.tax;
}

/**
 * Compute the client-facing totals for a set of document lines. This is the money
 * math shown to the customer and is intentionally independent of any allocation
 * logic: subtotal is gross, then discount and tax roll into the total.
 */
export function computeDocumentTotals(
  lines: Array<Pick<InvoiceLine, "qty" | "rate" | "discount" | "tax">>,
  amountPaid = 0,
): InvoiceDocumentTotals {
  let subtotal = 0;
  let discount = 0;
  let tax = 0;
  for (const l of lines) {
    subtotal += l.qty * l.rate;
    discount += l.discount;
    tax += l.tax;
  }
  const total = subtotal - discount + tax;
  return {
    subtotal,
    discount,
    tax,
    total,
    amountPaid,
    balanceDue: total - amountPaid,
  };
}

/** Map a mock `Invoice` to the client document, stripping all internal fields. */
export function fromMockInvoice(
  inv: Invoice,
  customer?: Customer,
  issuer: InvoiceParty = DEFAULT_ISSUER,
): InvoiceDocumentData {
  const billTo: InvoiceParty = customer
    ? {
        name: customer.name,
        lines: [customer.address].filter(Boolean),
        email: customer.email,
        phone: customer.phone,
      }
    : { name: inv.customerName, lines: [] };

  return {
    number: inv.number,
    status: inv.status,
    issueDate: inv.issued,
    dueDate: inv.due,
    terms: inv.terms,
    poNumber: inv.po,
    billFrom: issuer,
    billTo,
    lines: inv.lines.map((l) => ({
      id: l.id,
      description: l.service,
      detail: [l.jurisdiction, l.project].filter(Boolean).join(" · ") || undefined,
      quantity: l.qty,
      rate: l.rate,
      amount: lineAmount(l),
    })),
    totals: computeDocumentTotals(inv.lines, inv.paid),
    notes: inv.customerNotes,
    footer: "Thank you for your business.",
  };
}

/** Shape of a production invoice row as returned by `getInvoice`. */
export interface InvoiceRow {
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string | null;
  memo: string | null;
  subtotal: number;
  tax: number;
  total: number;
  balance: number;
  work_order_ref?: string | null;
  customers?: { name: string | null; email: string | null } | null;
  invoice_lines?: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    line_order: number;
  }> | null;
}

/** Map a production Supabase invoice row to the client document. */
export function fromInvoiceRow(
  row: InvoiceRow,
  issuer: InvoiceParty = DEFAULT_ISSUER,
): InvoiceDocumentData {
  const rows = [...(row.invoice_lines ?? [])].sort((a, b) => a.line_order - b.line_order);
  const amountPaid = row.total - row.balance;
  return {
    number: row.invoice_number,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date ?? "—",
    poNumber: row.work_order_ref ?? undefined,
    billFrom: issuer,
    billTo: {
      name: row.customers?.name ?? "Customer",
      lines: [],
      email: row.customers?.email ?? undefined,
    },
    lines: rows.map((l) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      rate: l.unit_price,
      amount: l.amount,
    })),
    totals: {
      subtotal: row.subtotal,
      discount: 0,
      tax: row.tax,
      total: row.total,
      amountPaid,
      balanceDue: row.balance,
    },
    notes: row.memo ?? undefined,
    footer: "Thank you for your business.",
  };
}
