import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

/**
 * Financial Reports — date-ranged aggregations from journal_lines.
 *
 * All reports derive strictly from posted `journal_entries` + `journal_lines`.
 * No mocks, no fake intelligence.
 *
 * Definitions & formulas (mirrored in docs/ledgeros/17-banking-and-reports.md):
 *   - Trial Balance:  debit_total, credit_total per account for date range.
 *   - Profit & Loss:  revenue = credit - debit on revenue accounts;
 *                     expense = debit - credit on expense accounts;
 *                     net_income = revenue - expense.
 *   - Balance Sheet:  asset  = debit - credit on asset accounts (cumulative);
 *                     liab   = credit - debit on liability accounts (cumulative);
 *                     equity = credit - debit on equity accounts + net_income YTD.
 *   - Cash Flow:      indirect — net_income + non-cash adjustments (ΔAR, ΔAP,
 *                     ΔInventory) reported as operating for the period.
 */

const rangeInput = z.object({
  orgId: z.string().uuid(),
  from: z.string().optional(),
  to: z.string().optional(),
});

type Row = {
  account_id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  debit: number;
  credit: number;
};

type AggregatedLine = {
  debit: number | null;
  credit: number | null;
  account: {
    id: string;
    code: string;
    name: string;
    type: Row["type"];
    org_id: string;
  } | null;
  journal: { status: string; entry_date: string; org_id: string } | null;
};

async function fetchAggregated(
  supabase: SupabaseClient<Database>,
  orgId: string,
  from?: string,
  to?: string,
): Promise<Row[]> {
  let q = supabase
    .from("journal_lines")
    .select("debit, credit, account:accounts!inner(id, code, name, type, org_id), journal:journal_entries!inner(status, entry_date, org_id)")
    .eq("account.org_id", orgId)
    .eq("journal.org_id", orgId)
    .eq("journal.status", "posted");
  if (from) q = q.gte("journal.entry_date", from);
  if (to) q = q.lte("journal.entry_date", to);
  const { data, error } = await q.overrideTypes<AggregatedLine[]>();
  if (error) throw new Error(error.message);

  const map = new Map<string, Row>();
  for (const r of data ?? []) {
    const a = r.account;
    if (!a) continue;
    const key = a.id;
    const row = map.get(key) ?? {
      account_id: a.id, code: a.code, name: a.name, type: a.type,
      debit: 0, credit: 0,
    };
    row.debit += Number(r.debit ?? 0);
    row.credit += Number(r.credit ?? 0);
    map.set(key, row);
  }
  return Array.from(map.values()).sort((x, y) => x.code.localeCompare(y.code));
}

export const getTrialBalanceRanged = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => rangeInput.parse(v))
  .handler(async ({ data, context }) => {
    const rows = await fetchAggregated(context.supabase, data.orgId, data.from, data.to);
    const totals = rows.reduce(
      (acc, r) => ({ debit: acc.debit + r.debit, credit: acc.credit + r.credit }),
      { debit: 0, credit: 0 },
    );
    return {
      from: data.from ?? null, to: data.to ?? null,
      rows: rows.map((r) => ({ ...r, balance: r.debit - r.credit })),
      totals,
      balanced: Math.abs(totals.debit - totals.credit) < 0.005,
    };
  });

export const getProfitAndLoss = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => rangeInput.parse(v))
  .handler(async ({ data, context }) => {
    const rows = await fetchAggregated(context.supabase, data.orgId, data.from, data.to);
    const revenue = rows
      .filter((r) => r.type === "revenue")
      .map((r) => ({ ...r, amount: r.credit - r.debit }));
    const expense = rows
      .filter((r) => r.type === "expense")
      .map((r) => ({ ...r, amount: r.debit - r.credit }));
    const revenueTotal = revenue.reduce((s, r) => s + r.amount, 0);
    const expenseTotal = expense.reduce((s, r) => s + r.amount, 0);
    return {
      from: data.from ?? null, to: data.to ?? null,
      revenue, expense,
      revenueTotal, expenseTotal,
      netIncome: revenueTotal - expenseTotal,
    };
  });

export const getBalanceSheetAsOf = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid(), asOf: z.string().optional() }).parse(v))
  .handler(async ({ data, context }) => {
    // Cumulative through asOf (or all-time).
    const rows = await fetchAggregated(context.supabase, data.orgId, undefined, data.asOf);
    const asset = rows
      .filter((r) => r.type === "asset")
      .map((r) => ({ ...r, amount: r.debit - r.credit }));
    const liability = rows
      .filter((r) => r.type === "liability")
      .map((r) => ({ ...r, amount: r.credit - r.debit }));
    const equity = rows
      .filter((r) => r.type === "equity")
      .map((r) => ({ ...r, amount: r.credit - r.debit }));
    const revenue = rows.filter((r) => r.type === "revenue")
      .reduce((s, r) => s + (r.credit - r.debit), 0);
    const expense = rows.filter((r) => r.type === "expense")
      .reduce((s, r) => s + (r.debit - r.credit), 0);
    const retainedEarnings = revenue - expense;

    const assetTotal = asset.reduce((s, r) => s + r.amount, 0);
    const liabilityTotal = liability.reduce((s, r) => s + r.amount, 0);
    const equityBook = equity.reduce((s, r) => s + r.amount, 0);
    const equityTotal = equityBook + retainedEarnings;

    return {
      asOf: data.asOf ?? null,
      asset, liability, equity,
      retainedEarnings,
      totals: {
        asset: assetTotal,
        liability: liabilityTotal,
        equity: equityTotal,
        liabAndEquity: liabilityTotal + equityTotal,
      },
      balanced: Math.abs(assetTotal - (liabilityTotal + equityTotal)) < 0.005,
    };
  });

/**
 * Cash Flow — indirect method (simplified):
 *   Operating = Net Income + ΔAP + ΔAccrued − ΔAR − ΔInventory
 * Only the operating section is derived here; investing/financing arrive with M4.
 */
export const getCashFlow = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => rangeInput.parse(v))
  .handler(async ({ data, context }) => {
    const inRange = await fetchAggregated(context.supabase, data.orgId, data.from, data.to);

    const revenue = inRange.filter((r) => r.type === "revenue").reduce((s, r) => s + (r.credit - r.debit), 0);
    const expense = inRange.filter((r) => r.type === "expense").reduce((s, r) => s + (r.debit - r.credit), 0);
    const netIncome = revenue - expense;

    // Working-capital deltas from asset (AR/inventory) & liability (AP) accounts within the range.
    const arDelta = inRange
      .filter((r) => r.type === "asset" && /receivable/i.test(r.name))
      .reduce((s, r) => s + (r.debit - r.credit), 0);
    const invDelta = inRange
      .filter((r) => r.type === "asset" && /inventory/i.test(r.name))
      .reduce((s, r) => s + (r.debit - r.credit), 0);
    const apDelta = inRange
      .filter((r) => r.type === "liability" && /payable/i.test(r.name))
      .reduce((s, r) => s + (r.credit - r.debit), 0);

    const operating = netIncome - arDelta - invDelta + apDelta;

    return {
      from: data.from ?? null, to: data.to ?? null,
      netIncome,
      adjustments: { arIncrease: arDelta, inventoryIncrease: invDelta, apIncrease: apDelta },
      operating,
      investing: 0,
      financing: 0,
      netChange: operating,
    };
  });
