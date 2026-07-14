import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * General Ledger — flat line-level view with filters. Feeds /ledger/general.
 *
 * We join journal_lines → journal_entries → accounts and filter server-side.
 * Running balance is computed client-side per account after grouping (cheaper
 * than a windowed SQL query at Phase 5 scale).
 */

const filterSchema = z.object({
  orgId: z.string().uuid(),
  accountId: z.string().uuid().optional(),
  from: z.string().optional(), // YYYY-MM-DD
  to: z.string().optional(),
  sourceType: z.string().optional(),
  status: z.enum(["draft", "posted", "void"]).optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(500),
});

export const listLedgerLines = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => filterSchema.parse(v))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("journal_lines")
      .select(
        `id, debit, credit, memo, line_order,
         account:accounts!inner(id, code, name, type, normal_balance, org_id),
         journal:journal_entries!inner(id, org_id, entry_date, memo, description, source_type, source_id, status, posted_at, reversal_of, reversed_by)`,
      )
      .eq("account.org_id", data.orgId)
      .eq("journal.org_id", data.orgId)
      .order("entry_date", { referencedTable: "journal_entries", ascending: false })
      .limit(data.limit);

    if (data.accountId) q = q.eq("account_id", data.accountId);
    if (data.status) q = q.eq("journal.status", data.status);
    else q = q.eq("journal.status", "posted");
    if (data.sourceType) q = q.eq("journal.source_type", data.sourceType);
    if (data.from) q = q.gte("journal.entry_date", data.from);
    if (data.to) q = q.lte("journal.entry_date", data.to);
    if (data.search) q = q.ilike("journal.memo", `%${data.search}%`);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
