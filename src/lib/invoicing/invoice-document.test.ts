import { describe, it, expect } from "vitest";
import {
  computeDocumentTotals,
  fromMockInvoice,
  lineAmount,
  type InvoiceDocumentData,
} from "./invoice-document";
import { INVOICES, CUSTOMERS, computeInvoice, type InvoiceLine } from "@/lib/mock/invoicing";

const line = (over: Partial<InvoiceLine>): InvoiceLine => ({
  id: "l",
  service: "Svc",
  qty: 1,
  rate: 100,
  discount: 0,
  tax: 0,
  treatment: "cca_revenue",
  estCost: 0,
  ...over,
});

describe("computeDocumentTotals", () => {
  it("sums gross subtotal, discount, and tax into a total", () => {
    const lines = [
      line({ qty: 2, rate: 100 }), // 200
      line({ qty: 1, rate: 50, discount: 10, tax: 5 }), // 45
    ];
    const t = computeDocumentTotals(lines);
    expect(t.subtotal).toBe(250);
    expect(t.discount).toBe(10);
    expect(t.tax).toBe(5);
    expect(t.total).toBe(245);
  });

  it("derives balance due from amount paid", () => {
    const t = computeDocumentTotals([line({ qty: 1, rate: 1000 })], 400);
    expect(t.total).toBe(1000);
    expect(t.amountPaid).toBe(400);
    expect(t.balanceDue).toBe(600);
  });

  it("line amount is qty*rate - discount + tax", () => {
    expect(lineAmount({ qty: 3, rate: 100, discount: 25, tax: 12 })).toBe(287);
  });

  it("document total matches the internal computeInvoice total for every mock invoice", () => {
    for (const inv of INVOICES) {
      const doc = computeDocumentTotals(inv.lines, inv.paid);
      const internal = computeInvoice(inv.lines);
      expect(doc.total).toBeCloseTo(internal.total, 6);
      expect(doc.subtotal).toBeCloseTo(internal.subtotal, 6);
    }
  });
});

describe("client vs internal separation", () => {
  // Keys that describe internal CCA allocation / margin and must never appear on
  // a client-facing document line.
  const FORBIDDEN_LINE_KEYS = [
    "treatment",
    "glAccount",
    "commissionOwner",
    "estCost",
    "department",
    "targetMarginPct",
    "refundable",
  ];

  const FORBIDDEN_DOC_KEYS = [
    "passThrough",
    "commission",
    "taxReserve",
    "deferredRevenue",
    "trueAvailableAfterCollection",
    "operating",
    "reserved",
    "restricted",
    "fulfillmentCost",
    "laborCost",
    "techAllocation",
    "marketingCac",
    "likelihood",
    "likelihoodReasons",
  ];

  it("maps mock invoices to documents that expose no internal fields", () => {
    for (const inv of INVOICES) {
      const customer = CUSTOMERS.find((c) => c.id === inv.customerId);
      const doc = fromMockInvoice(inv, customer);
      const docKeys = Object.keys(doc);
      for (const forbidden of FORBIDDEN_DOC_KEYS) {
        expect(docKeys).not.toContain(forbidden);
      }
      for (const dl of doc.lines) {
        const lineKeys = Object.keys(dl);
        for (const forbidden of FORBIDDEN_LINE_KEYS) {
          expect(lineKeys).not.toContain(forbidden);
        }
      }
    }
  });

  it("a serialized document leaks no internal treatment enums or GL accounts", () => {
    // Line descriptions are human text (a billed line may be named "Tax reserve"),
    // so we assert the machine-level internal identifiers never leak: the treatment
    // enum values and the GL account codes that only exist on the internal model.
    const TREATMENT_ENUMS = [
      "cca_revenue",
      "pass_through",
      "commissionable",
      "non_commissionable",
      "reimbursable",
      "tax_reserve",
      "refundable_deposit",
      "deferred_revenue",
      "other_restricted",
    ];
    for (const inv of INVOICES) {
      const doc = fromMockInvoice(
        inv,
        CUSTOMERS.find((c) => c.id === inv.customerId),
      );
      const json = JSON.stringify(doc);
      for (const enumVal of TREATMENT_ENUMS) {
        expect(json).not.toContain(enumVal);
      }
      // GL account codes (e.g. "2200 - Client Trust Liability") never appear.
      expect(json).not.toMatch(/\d{4} - /);
    }
  });

  it("preserves client-facing figures accurately", () => {
    const inv = INVOICES[0];
    const doc: InvoiceDocumentData = fromMockInvoice(
      inv,
      CUSTOMERS.find((c) => c.id === inv.customerId),
    );
    expect(doc.number).toBe(inv.number);
    expect(doc.lines.length).toBe(inv.lines.length);
    expect(doc.totals.total).toBeCloseTo(computeInvoice(inv.lines).total, 6);
  });
});
