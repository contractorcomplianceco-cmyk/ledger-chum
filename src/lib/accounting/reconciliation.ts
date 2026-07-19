/**
 * Pure bank-reconciliation math. No mock fixtures, no server calls — so it can
 * be unit-tested and reused by both the design-lab and live reconciliation
 * flows.
 *
 * Model: a period opens at `openingBalance`. Clearing transactions moves the
 * ledger toward the bank's statement-ending balance. The reconciliation ties
 * out when the cleared balance equals the statement-ending balance.
 */

/** Opening balance = current ledger balance minus this period's activity. */
export function deriveOpeningBalance(ledgerBalance: number, periodTransactionSum: number): number {
  return ledgerBalance - periodTransactionSum;
}

export type ReconciliationInput = {
  openingBalance: number;
  /** Signed sum of the amounts marked cleared. */
  clearedAmount: number;
  /** The ending balance from the bank statement. */
  statementEndingBalance: number;
};

export type ReconciliationResult = {
  clearedBalance: number;
  difference: number;
  balanced: boolean;
};

const TOLERANCE = 0.005;

export function computeReconciliation({
  openingBalance,
  clearedAmount,
  statementEndingBalance,
}: ReconciliationInput): ReconciliationResult {
  const clearedBalance = openingBalance + clearedAmount;
  const difference = statementEndingBalance - clearedBalance;
  return {
    clearedBalance,
    difference,
    balanced: Math.abs(difference) < TOLERANCE,
  };
}
