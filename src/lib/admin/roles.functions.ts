import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLE_VALUES = [
  "owner",
  "accounting_lead",
  "accountant",
  "systems_reviewer",
  "team_member",
  "integration_service",
] as const;

const roleEnum = z.enum(ROLE_VALUES);

async function assertOwner(
  context: { supabase: any; userId: string },
  orgId: string,
): Promise<void> {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user: context.userId,
    _org: orgId,
    _role: "owner",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: owner role required");
}

export const listOrgRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ orgId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .eq("org_id", data.orgId);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const assignRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      userId: z.string().uuid(),
      role: roleEnum,
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context, data.orgId);

    const { data: row, error } = await context.supabase
      .from("user_roles")
      .upsert(
        { org_id: data.orgId, user_id: data.userId, role: data.role },
        { onConflict: "user_id,org_id,role" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("org_members").upsert(
      { org_id: data.orgId, user_id: data.userId },
      { onConflict: "org_id,user_id" },
    );

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "role.assigned",
      action: "created",
      target_type: "user_role",
      target_id: row.id,
      after: row,
      source: "ledgeros.ui",
    });

    return row;
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      userId: z.string().uuid(),
      role: roleEnum,
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context, data.orgId);

    const { data: before } = await context.supabase
      .from("user_roles")
      .select("*")
      .eq("org_id", data.orgId)
      .eq("user_id", data.userId)
      .eq("role", data.role)
      .maybeSingle();

    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("org_id", data.orgId)
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: context.userId,
      event_type: "role.revoked",
      action: "updated",
      target_type: "user_role",
      target_id: before?.id ?? `${data.userId}:${data.role}`,
      before,
      source: "ledgeros.ui",
    });

    return { ok: true };
  });
