import { describe, it, expect } from "vitest";
import {
  buildCashReceiptJournal,
  isBalanced,
  nextInvoiceStatus,
  applyPayment,
  assertApplyWithinAmount,
} from "./posting";

describe("buildCashReceiptJournal", () => {
  it("posts DR Cash / CR AR for the full amount", () => {
    const lines = buildCashReceiptJournal({
      amount: 250.5,
      cashAccountId: "cash",
      arAccountId: "ar",
    });
    expect(lines).toEqual([
      { account: "cash", debit: 250.5, credit: 0, memo: "Cash receipt" },
      { account: "ar", debit: 0, credit: 250.5, memo: "AR settlement" },
    ]);
  });

  it("produces a balanced journal", () => {
    const lines = buildCashReceiptJournal({
      amount: 99.99,
      cashAccountId: "cash",
      arAccountId: "ar",
    });
    expect(isBalanced(lines)).toBe(true);
  });

  it("avoids float drift on repeated cents", () => {
    const lines = buildCashReceiptJournal({
      amount: 0.1 + 0.2, // 0.30000000000000004
      cashAccountId: "cash",
      arAccountId: "ar",
    });
    expect(lines[0].debit).toBe(0.3);
    expect(isBalanced(lines)).toBe(true);
  });
});

describe("isBalanced", () => {
  it("is false when debits and credits differ", () => {
    expect(
      isBalanced([
        { account: "a", debit: 10, credit: 0, memo: "" },
        { account: "b", debit: 0, credit: 9, memo: "" },
      ]),
    ).toBe(false);
  });

  it("is false for a zero journal", () => {
    expect(
      isBalanced([
        { account: "a", debit: 0, credit: 0, memo: "" },
        { account: "b", debit: 0, credit: 0, memo: "" },
      ]),
    ).toBe(false);
  });
});

describe("nextInvoiceStatus", () => {
  it("is paid when the balance is cleared", () => {
    expect(nextInvoiceStatus(0, 100)).toBe("paid");
    expect(nextInvoiceStatus(-0.001, 100)).toBe("paid");
  });
  it("is partial when some balance remains below total", () => {
    expect(nextInvoiceStatus(40, 100)).toBe("partial");
  });
  it("is sent when nothing has been applied", () => {
    expect(nextInvoiceStatus(100, 100)).toBe("sent");
  });
});

describe("applyPayment", () => {
  it("applies fully to a single invoice and marks it paid", () => {
    const r = applyPayment(100, [{ id: "i1", balance: 100, total: 100 }]);
    expect(r.applications).toEqual([
      { invoiceId: "i1", amountApplied: 100, newBalance: 0, newStatus: "paid" },
    ]);
    expect(r.unapplied).toBe(0);
  });

  it("caps each application at the invoice balance and cascades remainder", () => {
    const r = applyPayment(150, [
      { id: "i1", balance: 100, total: 100 },
      { id: "i2", balance: 200, total: 200 },
    ]);
    expect(r.applications).toEqual([
      { invoiceId: "i1", amountApplied: 100, newBalance: 0, newStatus: "paid" },
      { invoiceId: "i2", amountApplied: 50, newBalance: 150, newStatus: "partial" },
    ]);
    expect(r.unapplied).toBe(0);
  });

  it("leaves an unapplied remainder when cash exceeds open balances", () => {
    const r = applyPayment(300, [{ id: "i1", balance: 100, total: 100 }]);
    expect(r.applications[0].amountApplied).toBe(100);
    expect(r.unapplied).toBe(200);
  });

  it("skips already-paid invoices", () => {
    const r = applyPayment(50, [
      { id: "i1", balance: 0, total: 100 },
      { id: "i2", balance: 80, total: 80 },
    ]);
    expect(r.applications).toEqual([
      { invoiceId: "i2", amountApplied: 50, newBalance: 30, newStatus: "partial" },
    ]);
  });

  it("does partial-payment math without float drift", () => {
    const r = applyPayment(33.33, [{ id: "i1", balance: 100, total: 100 }]);
    expect(r.applications[0].amountApplied).toBe(33.33);
    expect(r.applications[0].newBalance).toBe(66.67);
  });

  it("throws on non-positive amounts", () => {
    expect(() => applyPayment(0, [])).toThrow(/positive/);
  });
});

describe("assertApplyWithinAmount", () => {
  it("allows applications up to the payment amount", () => {
    expect(() => assertApplyWithinAmount(100, [{ amount: 60 }, { amount: 40 }])).not.toThrow();
  });

  it("tolerates sub-cent rounding", () => {
    expect(() => assertApplyWithinAmount(100, [{ amount: 100.005 }])).not.toThrow();
  });

  it("throws when applications exceed the payment amount", () => {
    expect(() => assertApplyWithinAmount(100, [{ amount: 150 }])).toThrow(/exceeds/);
  });
});
