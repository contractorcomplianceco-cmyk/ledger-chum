import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Vendor payments — allocate outgoing cash across one or more bills.
 * Posting goes through `record_vendor_payment_with_posting` (SECURITY DEFINER).
 */

export const listBillPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      vendorId: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(500).default(100),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("bill_payments")
      .select("*, vendors(name)")
      .eq("org_id", data.orgId)
      .order("payment_date", { ascending: false })
      .limit(data.limit);
    if (data.vendorId) q = q.eq("vendor_id", data.vendorId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const recordVendorPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      vendorId: z.string().uuid(),
      paymentDate: z.string(),
      method: z.string().optional(),
      reference: z.string().optional(),
      amount: z.number().positive(),
      memo: z.string().optional(),
      applyTo: z.array(
        z.object({ billId: z.string().uuid(), amount: z.number().positive() }),
      ).default([]),
      externalSource: z.string().optional(),
      externalId: z.string().optional(),
      sourceSystem: z.string().optional(),
      sourceRef: z.string().optional(),
      correlationId: z.string().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc(
      "record_vendor_payment_with_posting",
      {
        _org_id: data.orgId,
        _vendor_id: data.vendorId,
        _payment_date: data.paymentDate,
        _method: data.method ?? "default",
        _reference: data.reference ?? "",
        _amount: data.amount,
        _memo: data.memo ?? "",
        _apply_to: data.applyTo.map((a) => ({ bill_id: a.billId, amount: a.amount })),
        _external_source: data.externalSource ?? "",
        _external_id: data.externalId ?? "",
        _source_system: data.sourceSystem ?? "ledgeros.manual",
        _source_ref: data.sourceRef ?? "",
        _correlation_id: data.correlationId ?? "",
      },
    );
    if (error) throw new Error(error.message);
    return result as {
      bill_payment_id: string;
      journal_id: string;
      unapplied_amount: number;
      applications: Array<{
        bill_id: string;
        amount_applied: number;
        new_balance: number;
        new_status: string;
      }>;
    };
  });
