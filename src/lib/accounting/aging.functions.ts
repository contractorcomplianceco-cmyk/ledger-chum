import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Aging reports — sourced from posted invoice/bill balances.
 * Buckets: current, 1-30, 31-60, 61-90, 90+.
 */

const bucketize = (daysOverdue: number) => {
  if (daysOverdue <= 0) return "current" as const;
  if (daysOverdue <= 30) return "d1_30" as const;
  if (daysOverdue <= 60) return "d31_60" as const;
  if (daysOverdue <= 90) return "d61_90" as const;
  return "d90_plus" as const;
};

type Bucket = ReturnType<typeof bucketize>;
const EMPTY_BUCKETS = (): Record<Bucket, number> => ({
  current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90_plus: 0,
});

export const getArAging = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      asOf: z.string().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const asOf = data.asOf ? new Date(data.asOf) : new Date();
    const { data: rows, error } = await context.supabase
      .from("invoices")
      .select("id, invoice_number, customer_id, due_date, issue_date, total, balance, status, customers(name)")
      .eq("org_id", data.orgId)
      .in("status", ["sent", "partial"]);
    if (error) throw new Error(error.message);

    const perCustomer = new Map<string, {
      customerId: string;
      customerName: string;
      buckets: Record<Bucket, number>;
      total: number;
    }>();
    const totals = EMPTY_BUCKETS();

    for (const r of rows ?? []) {
      const bal = Number(r.balance ?? 0);
      if (bal <= 0) continue;
      if (!r.due_date) continue;
      const due = new Date(r.due_date);
      const daysOverdue = Math.floor((asOf.getTime() - due.getTime()) / 86400000);
      const bucket = bucketize(daysOverdue);
      const name = (r as { customers?: { name?: string } | null }).customers?.name ?? "—";
      const key = r.customer_id ?? "unknown";
      const row = perCustomer.get(key) ?? {
        customerId: key,
        customerName: name,
        buckets: EMPTY_BUCKETS(),
        total: 0,
      };
      row.buckets[bucket] += bal;
      row.total += bal;
      perCustomer.set(key, row);
      totals[bucket] += bal;
    }

    return {
      asOf: asOf.toISOString().slice(0, 10),
      rows: Array.from(perCustomer.values()).sort((a, b) => b.total - a.total),
      totals,
      grandTotal: Object.values(totals).reduce((a, b) => a + b, 0),
    };
  });

export const getApAging = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      asOf: z.string().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const asOf = data.asOf ? new Date(data.asOf) : new Date();
    const { data: rows, error } = await context.supabase
      .from("bills")
      .select("id, bill_number, vendor_id, due_date, total, balance, status, vendors(name)")
      .eq("org_id", data.orgId)
      .in("status", ["open", "partial"]);
    if (error) throw new Error(error.message);

    const perVendor = new Map<string, {
      vendorId: string;
      vendorName: string;
      buckets: Record<Bucket, number>;
      total: number;
    }>();
    const totals = EMPTY_BUCKETS();

    for (const r of rows ?? []) {
      const bal = Number(r.balance ?? 0);
      if (bal <= 0) continue;
      const due = new Date(r.due_date);
      const daysOverdue = Math.floor((asOf.getTime() - due.getTime()) / 86400000);
      const bucket = bucketize(daysOverdue);
      const name = (r as { vendors?: { name?: string } | null }).vendors?.name ?? "—";
      const key = r.vendor_id;
      const row = perVendor.get(key) ?? {
        vendorId: key,
        vendorName: name,
        buckets: EMPTY_BUCKETS(),
        total: 0,
      };
      row.buckets[bucket] += bal;
      row.total += bal;
      perVendor.set(key, row);
      totals[bucket] += bal;
    }

    return {
      asOf: asOf.toISOString().slice(0, 10),
      rows: Array.from(perVendor.values()).sort((a, b) => b.total - a.total),
      totals,
      grandTotal: Object.values(totals).reduce((a, b) => a + b, 0),
    };
  });
