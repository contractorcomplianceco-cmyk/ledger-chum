import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const orgInput = z.object({ orgId: z.string().uuid() });

export const getOrganizationSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgInput.parse(v))
  .handler(async ({ data, context }) => {
    const { data: settings, error } = await context.supabase
      .from("organization_settings")
      .select("*")
      .eq("org_id", data.orgId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return settings;
  });

export const upsertOrganizationSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        accountingBasis: z.enum(["cash", "accrual"]).optional(),
        defaultCurrency: z.string().min(3).max(3).optional(),
        timezone: z.string().max(64).optional(),
        fiscalCalendar: z.string().max(64).optional(),
        softCloseDays: z.number().int().min(0).max(31).optional(),
        hardCloseDays: z.number().int().min(0).max(60).optional(),
        auditRetentionMonths: z.number().int().min(12).max(240).optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      org_id: string;
      accounting_basis?: string;
      default_currency?: string;
      timezone?: string;
      fiscal_calendar?: string;
      audit_retention_months?: number;
      close_policy?: { soft_close_days: number; hard_close_days: number };
    } = { org_id: data.orgId };
    if (data.accountingBasis) patch.accounting_basis = data.accountingBasis;
    if (data.defaultCurrency) patch.default_currency = data.defaultCurrency;
    if (data.timezone) patch.timezone = data.timezone;
    if (data.fiscalCalendar) patch.fiscal_calendar = data.fiscalCalendar;
    if (data.auditRetentionMonths) patch.audit_retention_months = data.auditRetentionMonths;
    if (data.softCloseDays !== undefined || data.hardCloseDays !== undefined) {
      patch.close_policy = {
        soft_close_days: data.softCloseDays ?? 5,
        hard_close_days: data.hardCloseDays ?? 15,
      };
    }

    const { data: row, error } = await context.supabase
      .from("organization_settings")
      .upsert(patch, { onConflict: "org_id" })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "org_settings.updated",
      action: "updated",
      target_type: "organization_settings",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });

    return row;
  });
