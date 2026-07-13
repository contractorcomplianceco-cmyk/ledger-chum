/**
 * 6B-3 operations service surface. Extends `compensationService` with the
 * calculation, verification, approval, reserve, payable, batch, statement,
 * holdback, adjustment, reversal, clawback, dispute, reconciliation, and
 * accounting-preview surfaces. All mutations return DemoResult.
 */

import { mockGet, mockMutation } from "../../adapters/mock-adapter";
import { DEMO_MUTATION_MESSAGE, type DemoResult, type ID, type Paginated } from "../../types";
import type {
  AccountingImpactPreview,
  CompensationAdjustment,
  CompensationApproval,
  CompensationCalculation,
  CompensationClawback,
  CompensationDispute,
  CompensationHoldback,
  CompensationPayable,
  CompensationPaymentBatch,
  CompensationReconciliation,
  CompensationReserve,
  CompensationReversal,
  CompensationStatement,
  CompensationVerification,
  ClawbackRecovery,
  ClawbackRecoveryMethod,
} from "./operations-types";
import {
  MOCK_ADJUSTMENTS,
  MOCK_APPROVALS,
  MOCK_BATCHES,
  MOCK_CALCULATIONS,
  MOCK_CLAWBACKS,
  MOCK_DISPUTES,
  MOCK_HOLDBACKS,
  MOCK_PAYABLES,
  MOCK_RECONCILIATION,
  MOCK_RESERVES,
  MOCK_REVERSALS,
  MOCK_STATEMENTS,
  MOCK_VERIFICATIONS,
} from "./operations-mock-data";

export interface CompensationOperationsService {
  // Calculations
  listCalculations(): Promise<Paginated<CompensationCalculation>>;
  getCalculation(id: ID): Promise<CompensationCalculation | undefined>;
  createCalculation(input: Partial<CompensationCalculation>): Promise<DemoResult<CompensationCalculation>>;
  previewCalculation(input: Partial<CompensationCalculation>): Promise<DemoResult<CompensationCalculation>>;
  submitCalculation(id: ID): Promise<DemoResult<{ id: ID }>>;
  verifyCalculation(id: ID, category: string, note?: string): Promise<DemoResult<{ id: ID }>>;
  requestCalculationEvidence(id: ID, note: string): Promise<DemoResult<{ id: ID }>>;
  approveCalculation(id: ID, note?: string): Promise<DemoResult<{ id: ID }>>;
  rejectCalculation(id: ID, reason: string): Promise<DemoResult<{ id: ID }>>;
  holdCalculation(id: ID, reason: string): Promise<DemoResult<{ id: ID }>>;
  releaseCalculation(id: ID): Promise<DemoResult<{ id: ID }>>;
  // Verifications / approvals
  listVerifications(): Promise<CompensationVerification[]>;
  listApprovals(): Promise<CompensationApproval[]>;
  // Reserves / payables
  listReserves(): Promise<CompensationReserve[]>;
  getReserve(id: ID): Promise<CompensationReserve | undefined>;
  listPayables(): Promise<Paginated<CompensationPayable>>;
  getPayable(id: ID): Promise<CompensationPayable | undefined>;
  createPayable(input: Partial<CompensationPayable>): Promise<DemoResult<CompensationPayable>>;
  approvePayable(id: ID): Promise<DemoResult<{ id: ID }>>;
  schedulePayable(id: ID, date: string): Promise<DemoResult<{ id: ID }>>;
  markPayablePaid(id: ID): Promise<DemoResult<{ id: ID }>>;
  // Batches
  listPaymentBatches(): Promise<CompensationPaymentBatch[]>;
  getPaymentBatch(id: ID): Promise<CompensationPaymentBatch | undefined>;
  createPaymentBatch(input: Partial<CompensationPaymentBatch>): Promise<DemoResult<CompensationPaymentBatch>>;
  approvePaymentBatch(id: ID): Promise<DemoResult<{ id: ID }>>;
  markBatchExported(id: ID, ref: string): Promise<DemoResult<{ id: ID }>>;
  reconcilePaymentBatch(id: ID): Promise<DemoResult<{ id: ID }>>;
  // Statements
  listStatements(): Promise<CompensationStatement[]>;
  getStatement(id: ID): Promise<CompensationStatement | undefined>;
  generateStatement(participantId: ID, period: string): Promise<DemoResult<CompensationStatement>>;
  // Holdbacks
  listHoldbacks(): Promise<CompensationHoldback[]>;
  releaseHoldback(id: ID, note?: string): Promise<DemoResult<{ id: ID }>>;
  extendHoldback(id: ID, days: number, reason: string): Promise<DemoResult<{ id: ID }>>;
  // Adjustments / reversals
  listAdjustments(): Promise<CompensationAdjustment[]>;
  createAdjustment(input: Partial<CompensationAdjustment>): Promise<DemoResult<CompensationAdjustment>>;
  approveAdjustment(id: ID): Promise<DemoResult<{ id: ID }>>;
  listReversals(): Promise<CompensationReversal[]>;
  createReversal(input: Partial<CompensationReversal>): Promise<DemoResult<CompensationReversal>>;
  // Clawbacks
  listClawbacks(): Promise<CompensationClawback[]>;
  createClawback(input: Partial<CompensationClawback>): Promise<DemoResult<CompensationClawback>>;
  approveClawback(id: ID): Promise<DemoResult<{ id: ID }>>;
  recordClawbackRecovery(id: ID, amount: number, method: ClawbackRecoveryMethod): Promise<DemoResult<ClawbackRecovery>>;
  // Disputes
  listDisputes(): Promise<CompensationDispute[]>;
  getDispute(id: ID): Promise<CompensationDispute | undefined>;
  createDispute(input: Partial<CompensationDispute>): Promise<DemoResult<CompensationDispute>>;
  addDisputeEvidence(id: ID, evidenceId: ID): Promise<DemoResult<{ id: ID }>>;
  resolveDispute(id: ID, decision: string): Promise<DemoResult<{ id: ID }>>;
  // Reconciliation
  getCompensationReconciliation(): Promise<CompensationReconciliation>;
  resolveReconciliationException(id: ID, note?: string): Promise<DemoResult<{ id: ID }>>;
  // Accounting preview
  getAccountingImpactPreview(calculationId: ID, action: AccountingImpactPreview["action"]): Promise<AccountingImpactPreview>;
}

const paginated = <T>(data: T[]): Paginated<T> => ({
  data,
  meta: { total: data.length, page: 1, pageSize: data.length, nextCursor: null },
});

const stub = <T>(id: ID, extra: Partial<T> = {}) => ({ id, ...extra }) as unknown as T;

export const compensationOperationsService: CompensationOperationsService = {
  listCalculations: () => mockGet(() => paginated(MOCK_CALCULATIONS)),
  getCalculation: (id) => mockGet(() => MOCK_CALCULATIONS.find((c) => c.id === id)),
  createCalculation: (input) =>
    mockMutation(() => ({ ...MOCK_CALCULATIONS[0], ...input, id: `calc_new_${Date.now()}` }), DEMO_MUTATION_MESSAGE),
  previewCalculation: (input) =>
    mockMutation(() => ({ ...MOCK_CALCULATIONS[0], ...input, id: `calc_preview_${Date.now()}` }), DEMO_MUTATION_MESSAGE),
  submitCalculation: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  verifyCalculation: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  requestCalculationEvidence: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  approveCalculation: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  rejectCalculation: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  holdCalculation: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  releaseCalculation: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),

  listVerifications: () => mockGet(() => MOCK_VERIFICATIONS),
  listApprovals: () => mockGet(() => MOCK_APPROVALS),

  listReserves: () => mockGet(() => MOCK_RESERVES),
  getReserve: (id) => mockGet(() => MOCK_RESERVES.find((r) => r.id === id)),

  listPayables: () => mockGet(() => paginated(MOCK_PAYABLES)),
  getPayable: (id) => mockGet(() => MOCK_PAYABLES.find((p) => p.id === id)),
  createPayable: (input) =>
    mockMutation(() => ({ ...MOCK_PAYABLES[0], ...input, id: `pay_new_${Date.now()}` }), DEMO_MUTATION_MESSAGE),
  approvePayable: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  schedulePayable: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  markPayablePaid: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),

  listPaymentBatches: () => mockGet(() => MOCK_BATCHES),
  getPaymentBatch: (id) => mockGet(() => MOCK_BATCHES.find((b) => b.id === id)),
  createPaymentBatch: (input) =>
    mockMutation(() => ({ ...MOCK_BATCHES[0], ...input, id: `batch_new_${Date.now()}` }), DEMO_MUTATION_MESSAGE),
  approvePaymentBatch: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  markBatchExported: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  reconcilePaymentBatch: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),

  listStatements: () => mockGet(() => MOCK_STATEMENTS),
  getStatement: (id) => mockGet(() => MOCK_STATEMENTS.find((s) => s.id === id)),
  generateStatement: (participantId) =>
    mockMutation(() => ({ ...MOCK_STATEMENTS[0], participantId, id: `stmt_new_${Date.now()}` }), DEMO_MUTATION_MESSAGE),

  listHoldbacks: () => mockGet(() => MOCK_HOLDBACKS),
  releaseHoldback: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  extendHoldback: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),

  listAdjustments: () => mockGet(() => MOCK_ADJUSTMENTS),
  createAdjustment: (input) =>
    mockMutation(() => ({ ...MOCK_ADJUSTMENTS[0], ...input, id: `adj_new_${Date.now()}` }), DEMO_MUTATION_MESSAGE),
  approveAdjustment: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  listReversals: () => mockGet(() => MOCK_REVERSALS),
  createReversal: (input) =>
    mockMutation(() => ({ ...MOCK_REVERSALS[0], ...input, id: `rev_new_${Date.now()}` }), DEMO_MUTATION_MESSAGE),

  listClawbacks: () => mockGet(() => MOCK_CLAWBACKS),
  createClawback: (input) =>
    mockMutation(() => ({ ...MOCK_CLAWBACKS[0], ...input, id: `cb_new_${Date.now()}` }), DEMO_MUTATION_MESSAGE),
  approveClawback: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  recordClawbackRecovery: (id, amount, method) =>
    mockMutation(
      () => stub<ClawbackRecovery>(`rec_new_${Date.now()}`, { clawbackId: id, amount, method, recordedAt: new Date().toISOString(), recordedBy: "Rose Delacroix" }),
      DEMO_MUTATION_MESSAGE,
    ),

  listDisputes: () => mockGet(() => MOCK_DISPUTES),
  getDispute: (id) => mockGet(() => MOCK_DISPUTES.find((d) => d.id === id)),
  createDispute: (input) =>
    mockMutation(() => ({ ...MOCK_DISPUTES[0], ...input, id: `disp_new_${Date.now()}` }), DEMO_MUTATION_MESSAGE),
  addDisputeEvidence: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  resolveDispute: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),

  getCompensationReconciliation: () => mockGet(() => MOCK_RECONCILIATION),
  resolveReconciliationException: (id) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),

  getAccountingImpactPreview: (calculationId, action) =>
    mockGet<AccountingImpactPreview>(() => {
      const entries: AccountingImpactPreview["entries"] = (() => {
        switch (action) {
          case "reserve":
            return [
              { account: "6100 · Commission Expense", debit: 540, memo: "Accrue commission" },
              { account: "2210 · Commission Payable", credit: 540 },
            ];
          case "payable":
          case "payment":
            return [
              { account: "2210 · Commission Payable", debit: 486 },
              { account: "1010 · Operating Cash", credit: 486, memo: "Payroll/AP disbursement" },
            ];
          case "holdback":
            return [
              { account: "6100 · Commission Expense", debit: 54 },
              { account: "2215 · Commission Holdback Liability", credit: 54 },
            ];
          case "holdback_release":
            return [
              { account: "2215 · Commission Holdback Liability", debit: 54 },
              { account: "2210 · Commission Payable", credit: 54 },
            ];
          case "adjustment":
            return [
              { account: "6100 · Commission Expense", debit: 150, memo: "Refund adjustment" },
              { account: "2210 · Commission Payable", credit: 150 },
            ];
          case "reversal":
            return [
              { account: "2210 · Commission Payable", debit: 450 },
              { account: "6100 · Commission Expense", credit: 450, memo: "Full reversal" },
            ];
          case "clawback":
            return [
              { account: "2216 · Commission Clawback Receivable", debit: 500 },
              { account: "6100 · Commission Expense", credit: 500 },
            ];
          case "clawback_recovery":
            return [
              { account: "2210 · Commission Payable", debit: 200, memo: "Offset future payable" },
              { account: "2216 · Commission Clawback Receivable", credit: 200 },
            ];
          case "writeoff":
            return [
              { account: "6900 · Bad Debt Expense", debit: 100 },
              { account: "2216 · Commission Clawback Receivable", credit: 100 },
            ];
        }
      })();
      return {
        calculationId,
        action,
        entries,
        narrative:
          "Proposed accounting treatment — requires backend validation and accountant approval before posting.",
        requiresBackendValidation: true,
        requiresAccountantApproval: true,
      };
    }),
};
