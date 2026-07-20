/**
 * Pure double-entry rules for customer cash receipts.
 *
 * These mirror the authoritative SQL in `record_payment_with_posting` (which the
 * DB enforces with a balanced-journal trigger). They exist in TypeScript so the
 * rules are (a) unit-testable without a database and (b) reusable to guard
 * inputs before we hit the RPC and to preview postings in the UI.
 *
 * Money is handled in cents internally to avoid float drift, then returned as
 * 2-decimal numbers.
 */

export interface JournalLine {
  account: string;
  debit: number;
  credit: number;
  memo: string;
}

const toCents = (n: number): number => Math.round(n * 100);
const fromCents = (c: number): number => Math.round(c) / 100;

/**
 * A customer payment is always DR Cash / CR Accounts Receivable for the full
 * amount received. Returns two balanced lines.
 */
export function buildCashReceiptJournal(input: {
  amount: number;
  cashAccountId: string;
  arAccountId: string;
}): JournalLine[] {
  const amount = fromCents(toCents(input.amount));
  return [
    { account: input.cashAccountId, debit: amount, credit: 0, memo: "Cash receipt" },
    { account: input.arAccountId, debit: 0, credit: amount, memo: "AR settlement" },
  ];
}

/** True when a set of journal lines has SUM(debit) === SUM(credit) > 0. */
export function isBalanced(lines: JournalLine[]): boolean {
  const debit = lines.reduce((s, l) => s + toCents(l.debit), 0);
  const credit = lines.reduce((s, l) => s + toCents(l.credit), 0);
  return debit === credit && debit > 0;
}

/** Invoice status after applying a receipt, mirroring the SQL transitions. */
export function nextInvoiceStatus(newBalance: number, total: number): "paid" | "partial" | "sent" {
  const b = toCents(newBalance);
  const t = toCents(total);
  if (b <= 0) return "paid";
  if (b < t) return "partial";
  return "sent";
}

export interface Applyable {
  id: string;
  balance: number;
  total: number;
}

export interface AppliedResult {
  applications: Array<{
    invoiceId: string;
    amountApplied: number;
    newBalance: number;
    newStatus: "paid" | "partial" | "sent";
  }>;
  unapplied: number;
}

/**
 * Allocate a received amount across one or more open invoices in order, capping
 * each application at that invoice's balance. Remaining cash is unapplied.
 * Encodes the partial-payment math the SQL performs per application.
 */
export function applyPayment(amount: number, invoices: Applyable[]): AppliedResult {
  let remaining = toCents(amount);
  if (remaining <= 0) throw new Error("Payment amount must be positive");

  const applications: AppliedResult["applications"] = [];
  for (const inv of invoices) {
    if (remaining <= 0) break;
    const balance = toCents(inv.balance);
    if (balance <= 0) continue;
    const applied = Math.min(remaining, balance);
    const newBalance = balance - applied;
    applications.push({
      invoiceId: inv.id,
      amountApplied: fromCents(applied),
      newBalance: fromCents(newBalance),
      newStatus: nextInvoiceStatus(fromCents(newBalance), inv.total),
    });
    remaining -= applied;
  }
  return { applications, unapplied: fromCents(remaining) };
}

/**
 * Guard mirroring the SQL check: the sum applied to invoices must not exceed the
 * payment amount (a small epsilon tolerates rounding). Throws otherwise.
 */
export function assertApplyWithinAmount(amount: number, applyTo: Array<{ amount: number }>): void {
  const total = applyTo.reduce((s, a) => s + toCents(a.amount), 0);
  if (total > toCents(amount) + 1) {
    throw new Error(`Applied total ${fromCents(total)} exceeds payment amount ${amount}`);
  }
}
