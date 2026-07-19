/**
 * Pure double-entry invariants.
 *
 * These mirror the authoritative in-DB checks (SECURITY DEFINER posting RPCs +
 * CHECK constraints). They exist as a pure, testable client-side pre-flight so
 * the UI can reject obviously-bad entries before the round-trip. The database
 * remains the source of truth and re-enforces every rule.
 */

export interface JournalLineAmounts {
  debit: number;
  credit: number;
}

/** Rounding tolerance for money totals (half a cent). */
export const BALANCE_TOLERANCE = 0.005;

export function sumDebits(lines: readonly JournalLineAmounts[]): number {
  return lines.reduce((s, l) => s + Number(l.debit ?? 0), 0);
}

export function sumCredits(lines: readonly JournalLineAmounts[]): number {
  return lines.reduce((s, l) => s + Number(l.credit ?? 0), 0);
}

export function isBalanced(lines: readonly JournalLineAmounts[]): boolean {
  return Math.abs(sumDebits(lines) - sumCredits(lines)) <= BALANCE_TOLERANCE;
}

/** Throws with a descriptive message when total debits != total credits. */
export function assertBalanced(lines: readonly JournalLineAmounts[]): void {
  const debit = sumDebits(lines);
  const credit = sumCredits(lines);
  if (Math.abs(debit - credit) > BALANCE_TOLERANCE) {
    throw new Error(`Unbalanced entry: debit=${debit.toFixed(2)} credit=${credit.toFixed(2)}`);
  }
}

/**
 * Over-application guard for payment/credit application against an open target
 * (invoice/bill). Applying more than the outstanding balance must be rejected
 * — the posting RPC enforces this; this mirror lets callers fail fast.
 */
export function assertNotOverApplied(appliedAmount: number, outstandingBalance: number): void {
  if (appliedAmount > outstandingBalance + BALANCE_TOLERANCE) {
    throw new Error(
      `Over-application rejected: applied=${appliedAmount.toFixed(2)} exceeds outstanding=${outstandingBalance.toFixed(2)}`,
    );
  }
}
