import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertBalanced } from "@/lib/accounting/journal-invariants";

/**
 * Manual Journal Entry workspace — server functions backing /ledger/journals.
 *
 * Posting and reversal go through SECURITY DEFINER RPCs that enforce:
 *  - balanced totals
 *  - open fiscal period
 *  - org membership
 *  - audit trail
 * Posted journals are immutable; edits are only possible while status='draft'.
 */

const lineSchema = z.object({
  accountId: z.string().uuid(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  memo: z.string().optional(),
});

export const listJournals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      status: z.enum(["draft", "posted", "void"]).optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      sourceType: z.string().optional(),
      limit: z.number().int().min(1).max(500).default(100),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("journal_entries")
      .select(
        "id, entry_date, memo, description, source_type, source_id, status, posted_at, reversal_of, reversed_by, journal_lines(debit,credit)",
      )
      .eq("org_id", data.orgId)
      .order("entry_date", { ascending: false })
      .order("posted_at", { ascending: false })
      .limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    if (data.sourceType) q = q.eq("source_type", data.sourceType);
    if (data.from) q = q.gte("entry_date", data.from);
    if (data.to) q = q.lte("entry_date", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const lines = (r.journal_lines as Array<{ debit: number; credit: number }>) ?? [];
      const debit = lines.reduce((s, l) => s + Number(l.debit ?? 0), 0);
      const credit = lines.reduce((s, l) => s + Number(l.credit ?? 0), 0);
      return { ...r, total_debit: debit, total_credit: credit, line_count: lines.length };
    });
  });

export const getJournal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("journal_entries")
      .select(
        "*, journal_lines(id, account_id, debit, credit, memo, line_order, accounts(code, name, type))",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const postManualJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      entryDate: z.string(),
      memo: z.string().min(1).max(200),
      description: z.string().optional(),
      lines: z.array(lineSchema).min(2),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    // Client-side sanity check before the RPC (RPC will re-enforce)
    assertBalanced(data.lines);

    const { data: res, error } = await context.supabase.rpc("post_manual_journal", {
      _org_id: data.orgId,
      _entry_date: data.entryDate,
      _memo: data.memo,
      _description: data.description ?? "",
      _lines: data.lines.map((l) => ({
        account_id: l.accountId,
        debit: l.debit,
        credit: l.credit,
        memo: l.memo ?? null,
      })),
    });
    if (error) throw new Error(error.message);
    return res as { journal_id: string; debit_total: number; credit_total: number };
  });

export const reverseJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      journalId: z.string().uuid(),
      reason: z.string().min(1).max(500),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("reverse_journal", {
      _org_id: data.orgId,
      _journal_id: data.journalId,
      _reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return res as { reversal_id: string; original_id: string };
  });
