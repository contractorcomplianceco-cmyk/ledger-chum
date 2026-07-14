import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Bills — Accounts Payable posting workspace.
 *
 * Posting flows through `post_bill_with_posting` (SECURITY DEFINER) which
 * enforces org membership, fiscal-period check, balanced journal, and audit
 * lineage. Posted bills are immutable at the ledger level; corrections are
 * done via reversal (M3+) or offsetting bills.
 */

const billLineSchema = z.object({
  accountId: z.string().uuid(),
  description: z.string().optional(),
  quantity: z.number().default(1),
  unitPrice: z.number().default(0),
  amount: z.number().min(0),
  departmentId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  serviceId: z.string().uuid().nullable().optional(),
  productId: z.string().uuid().nullable().optional(),
});

export const listBills = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      status: z.enum(["draft", "open", "partial", "paid", "void"]).optional(),
      vendorId: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(500).default(100),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("bills")
      .select("*, vendors(name)")
      .eq("org_id", data.orgId)
      .order("issue_date", { ascending: false })
      .limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    if (data.vendorId) q = q.eq("vendor_id", data.vendorId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getBill = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("bills")
      .select("*, vendors(id,name,email), bill_lines(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const postBill = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      vendorId: z.string().uuid(),
      billNumber: z.string().min(1),
      issueDate: z.string(),
      dueDate: z.string(),
      memo: z.string().optional(),
      tax: z.number().min(0).default(0),
      lines: z.array(billLineSchema).min(1),
      externalSource: z.string().optional(),
      externalId: z.string().optional(),
      sourceSystem: z.string().optional(),
      sourceRef: z.string().optional(),
      correlationId: z.string().optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      _org_id: data.orgId,
      _vendor_id: data.vendorId,
      _bill_number: data.billNumber,
      _issue_date: data.issueDate,
      _due_date: data.dueDate,
      _memo: data.memo ?? "",
      _lines: data.lines.map((l) => ({
        account_id: l.accountId,
        description: l.description ?? "",
        quantity: l.quantity,
        unit_price: l.unitPrice,
        amount: l.amount,
        department_id: l.departmentId ?? "",
        location_id: l.locationId ?? "",
        project_id: l.projectId ?? "",
        service_id: l.serviceId ?? "",
        product_id: l.productId ?? "",
      })),
      _tax: data.tax,
      _external_source: data.externalSource ?? "",
      _external_id: data.externalId ?? "",
      _source_system: data.sourceSystem ?? "ledgeros.manual",
      _source_ref: data.sourceRef ?? "",
      _correlation_id: data.correlationId ?? "",
    };
    const { data: result, error } = await context.supabase.rpc(
      "post_bill_with_posting",
      payload,
    );
    if (error) throw new Error(error.message);
    return result as { bill_id: string; journal_id: string; total: number };
  });
