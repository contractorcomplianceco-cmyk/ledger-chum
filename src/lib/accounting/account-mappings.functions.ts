import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const purposeSchema = z.enum([
  "ar",
  "cash_default",
  "labor_revenue",
  "material_revenue",
  "inventory_asset",
  "material_cogs",
  "refund_clearing",
  "credit_liability",
]);

export const listAccountMappings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("account_mappings")
      .select("id, purpose, account_id, description, updated_at")
      .eq("org_id", data.orgId)
      .order("purpose", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertAccountMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      purpose: purposeSchema,
      accountId: z.string().uuid(),
      description: z.string().max(500).optional(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("account_mappings")
      .upsert(
        {
          org_id: data.orgId,
          purpose: data.purpose,
          account_id: data.accountId,
          description: data.description ?? null,
        },
        { onConflict: "org_id,purpose" },
      )
      .select("id, purpose, account_id, description, updated_at")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "account_mapping.upserted",
      action: "updated",
      target_type: "account_mapping",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });

    return row;
  });
