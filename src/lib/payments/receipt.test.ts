import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  sendPaymentReceipt,
  registerReceiptSender,
  clearReceiptSender,
  type ReceiptPayload,
} from "./receipt.server";

const payload: ReceiptPayload = {
  to: "customer@example.com",
  customerName: "Acme",
  invoiceRef: "INV-100",
  amount: 250,
  currency: "USD",
  method: "card",
  providerTransactionId: "txn_1",
  paymentDate: "2026-07-20",
};

describe("sendPaymentReceipt", () => {
  beforeEach(() => clearReceiptSender());

  it("is a no-op when no sender is registered and email module is absent", async () => {
    const r = await sendPaymentReceipt(payload);
    expect(r.sent).toBe(false);
    expect(r.reason).toBe("email_unavailable");
  });

  it("skips when there is no recipient", async () => {
    const r = await sendPaymentReceipt({ ...payload, to: "" });
    expect(r.sent).toBe(false);
    expect(r.reason).toBe("no_recipient");
  });

  it("uses a registered sender and renders subject + body", async () => {
    const sender = vi.fn().mockResolvedValue(undefined);
    registerReceiptSender(sender);
    const r = await sendPaymentReceipt(payload);
    expect(r.sent).toBe(true);
    expect(sender).toHaveBeenCalledOnce();
    const msg = sender.mock.calls[0][0];
    expect(msg.to).toBe("customer@example.com");
    expect(msg.subject).toContain("INV-100");
    expect(msg.text).toContain("$250.00");
    expect(msg.text).toContain("txn_1");
  });

  it("reports send_failed but does not throw when the sender rejects", async () => {
    registerReceiptSender(vi.fn().mockRejectedValue(new Error("smtp down")));
    const r = await sendPaymentReceipt(payload);
    expect(r.sent).toBe(false);
    expect(r.reason).toBe("send_failed");
  });
});
