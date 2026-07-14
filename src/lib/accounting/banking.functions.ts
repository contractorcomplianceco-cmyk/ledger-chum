import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Banking — bank accounts, imported transactions, matching, reconciliation.
 * All queries RLS-scoped via requireSupabaseAuth (is_org_member).
 * All mutations that affect posted ledger state route through SECURITY DEFINER RPCs.
 */

const orgOnly = z.object({ orgId: z.string().uuid() });

export const listBankAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgOnly.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("bank_accounts")
      .select("id, name, bank_name, account_number_last4, currency, opening_balance, opening_balance_date, is_active, gl_account_id, accounts:gl_account_id(code, name)")
      .eq("org_id", data.orgId)
      .order("name");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createBankAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      glAccountId: z.string().uuid(),
      name: z.string().min(1).max(200),
      bankName: z.string().max(200).optional(),
      last4: z.string().max(4).optional(),
      currency: z.string().default("USD"),
      openingBalance: z.number().default(0),
      openingBalanceDate: z.string().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("bank_accounts")
      .insert({
        org_id: data.orgId,
        gl_account_id: data.glAccountId,
        name: data.name,
        bank_name: data.bankName ?? null,
        account_number_last4: data.last4 ?? null,
        currency: data.currency,
        opening_balance: data.openingBalance,
        opening_balance_date: data.openingBalanceDate ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listBankTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      bankAccountId: z.string().uuid().optional(),
      status: z.enum(["unmatched", "matched", "ignored", "pending"]).optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.number().int().min(1).max(1000).default(500),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("bank_transactions")
      .select("id, bank_account_id, txn_date, description, reference, amount, status, matched_journal_line_id, external_source, external_id")
      .eq("org_id", data.orgId)
      .order("txn_date", { ascending: false })
      .limit(data.limit);
    if (data.bankAccountId) q = q.eq("bank_account_id", data.bankAccountId);
    if (data.status) q = q.eq("status", data.status);
    if (data.from) q = q.gte("txn_date", data.from);
    if (data.to) q = q.lte("txn_date", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const importRowSchema = z.object({
  txnDate: z.string(),
  description: z.string().min(1),
  amount: z.number(),
  reference: z.string().optional(),
  externalId: z.string().optional(),
});

export const importBankTransactions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      bankAccountId: z.string().uuid(),
      sourceSystem: z.string().default("csv_import"),
      rows: z.array(importRowSchema).min(1).max(2000),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = data.rows.map((r) => ({
      org_id: data.orgId,
      bank_account_id: data.bankAccountId,
      txn_date: r.txnDate,
      description: r.description,
      reference: r.reference ?? null,
      amount: r.amount,
      external_source: data.sourceSystem,
      external_id: r.externalId ?? null,
      status: "unmatched",
    }));
    // Idempotent on (bank_account_id, external_source, external_id) via unique index.
    const { data: inserted, error } = await context.supabase
      .from("bank_transactions")
      .upsert(payload, {
        onConflict: "bank_account_id,external_source,external_id",
        ignoreDuplicates: true,
      })
      .select("id");
    if (error) throw new Error(error.message);
    return { imported: inserted?.length ?? 0, requested: payload.length };
  });

export const matchBankTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      bankTxnId: z.string().uuid(),
      journalLineId: z.string().uuid(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("match_bank_transaction", {
      _org_id: data.orgId,
      _bank_txn_id: data.bankTxnId,
      _journal_line_id: data.journalLineId,
    });
    if (error) throw new Error(error.message);
    return res;
  });

export const unmatchBankTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid(), bankTxnId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("unmatch_bank_transaction", {
      _org_id: data.orgId,
      _bank_txn_id: data.bankTxnId,
    });
    if (error) throw new Error(error.message);
    return res;
  });

/**
 * Candidate journal lines to match against a bank txn:
 * posted lines on the bank's GL cash account, not yet matched,
 * within +/- 14 days of the bank txn date, with matching signed amount.
 */
export const suggestMatchCandidates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid(), bankTxnId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: txn, error: txnErr } = await context.supabase
      .from("bank_transactions")
      .select("id, txn_date, amount, bank_account_id, bank_accounts:bank_account_id(gl_account_id)")
      .eq("id", data.bankTxnId)
      .eq("org_id", data.orgId)
      .single();
    if (txnErr) throw new Error(txnErr.message);
    const glAccountId = (txn as { bank_accounts?: { gl_account_id?: string } | null }).bank_accounts?.gl_account_id;
    if (!glAccountId) return [];

    const amount = Number(txn.amount);
    const fromDate = new Date(txn.txn_date);
    fromDate.setDate(fromDate.getDate() - 14);
    const toDate = new Date(txn.txn_date);
    toDate.setDate(toDate.getDate() + 14);

    // Deposit (amount > 0) means bank cash debit — match to journal_lines with debit ≈ amount.
    // Withdrawal (amount < 0) means cash credit — match to credit ≈ |amount|.
    const isDeposit = amount >= 0;
    const target = Math.abs(amount);

    let q = context.supabase
      .from("journal_lines")
      .select("id, debit, credit, memo, account_id, journal:journal_entries!inner(id, entry_date, memo, status, org_id)")
      .eq("account_id", glAccountId)
      .eq("journal.org_id", data.orgId)
      .eq("journal.status", "posted")
      .gte("journal.entry_date", fromDate.toISOString().slice(0, 10))
      .lte("journal.entry_date", toDate.toISOString().slice(0, 10))
      .limit(50);
    q = isDeposit ? q.gt("debit", 0) : q.gt("credit", 0);
    const { data: lines, error } = await q;
    if (error) throw new Error(error.message);

    return (lines ?? [])
      .map((l) => {
        const a = Number(isDeposit ? l.debit : l.credit);
        return { ...l, matchAmount: a, diff: Math.abs(a - target) };
      })
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 20);
  });

// ---------- Reconciliations ----------

export const listReconciliations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ orgId: z.string().uuid(), bankAccountId: z.string().uuid().optional() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("bank_reconciliations")
      .select("id, bank_account_id, statement_start_date, statement_end_date, statement_ending_balance, cleared_balance, status, completed_at")
      .eq("org_id", data.orgId)
      .order("statement_end_date", { ascending: false });
    if (data.bankAccountId) q = q.eq("bank_account_id", data.bankAccountId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const startReconciliation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      bankAccountId: z.string().uuid(),
      startDate: z.string(),
      endDate: z.string(),
      statementEndingBalance: z.number(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("bank_reconciliations")
      .insert({
        org_id: data.orgId,
        bank_account_id: data.bankAccountId,
        statement_start_date: data.startDate,
        statement_end_date: data.endDate,
        statement_ending_balance: data.statementEndingBalance,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const completeReconciliation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      reconciliationId: z.string().uuid(),
      statementEndingBalance: z.number(),
      clearedBankTxnIds: z.array(z.string().uuid()),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("complete_bank_reconciliation", {
      _org_id: data.orgId,
      _reconciliation_id: data.reconciliationId,
      _statement_ending_balance: data.statementEndingBalance,
      _cleared_bank_txn_ids: data.clearedBankTxnIds,
    });
    if (error) throw new Error(error.message);
    return res;
  });
