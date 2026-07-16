import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Accountant workspace server functions. These power the live wire-up of
 * the Phase 3 UI (dashboard, integration inbox, invoice review, mappings)
 * against the real LedgerOS database.
 *
 * All functions are RLS-scoped via requireSupabaseAuth. The org id passed
 * in is authorized by the underlying org_members / has_role policies.
 */

const orgInput = z.object({ orgId: z.string().uuid() });

/**
 * Returns the caller's primary org membership. Phase 1 seeded a pilot org
 * for the owner; most users belong to exactly one org today, so we return
 * the first match.
 */
export const getCurrentOrg = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: member, error } = await context.supabase
      .from("org_members")
      .select("org_id, organizations!inner(id, name, slug, currency, timezone, status)")
      .eq("user_id", context.userId)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!member) return null;
    return {
      orgId: member.org_id,
      org: member.organizations as unknown as {
        id: string;
        name: string;
        slug: string;
        currency: string;
        timezone: string;
        status: string;
      },
    };
  });

/** Chart of accounts for the mapping selector. */
export const listAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgInput.parse(v))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("accounts")
      .select("id, code, name, type, normal_balance, is_active")
      .eq("org_id", data.orgId)
      .eq("is_active", true)
      .order("code");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Integration events feed (from audit_events). */
export const listIntegrationEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        limit: z.number().int().min(1).max(500).default(200),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("audit_events")
      .select(
        "id, event_type, action, actor_type, source, target_type, target_id, after, correlation_id, created_at",
      )
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Raw sync history rows (per-request idempotency records). */
export const listSyncHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        limit: z.number().int().min(1).max(500).default(200),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("sync_history")
      .select("id, endpoint, external_id, idempotency_key, status, error, source, created_at")
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Roll-ups for the accounting dashboard hero tiles. */
export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgInput.parse(v))
  .handler(async ({ data, context }) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [drafts, posted24, payments24, invConsumed24, refunds24, apiClients] = await Promise.all([
      context.supabase
        .from("invoices")
        .select("id, total", { count: "exact" })
        .eq("org_id", data.orgId)
        .eq("status", "draft"),
      context.supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("org_id", data.orgId)
        .neq("status", "draft")
        .gte("updated_at", since),
      context.supabase
        .from("payments")
        .select("amount")
        .eq("org_id", data.orgId)
        .gte("created_at", since),
      context.supabase
        .from("inventory_consumption")
        .select("quantity, unit_cost")
        .eq("org_id", data.orgId)
        .gte("created_at", since),
      context.supabase
        .from("refunds")
        .select("amount")
        .eq("org_id", data.orgId)
        .gte("created_at", since),
      context.supabase.from("api_clients").select("id, active, provider").eq("org_id", data.orgId),
    ]);

    const draftCount = drafts.count ?? drafts.data?.length ?? 0;
    const draftValue = (drafts.data ?? []).reduce(
      (s, r: { total: number }) => s + Number(r.total ?? 0),
      0,
    );
    const postedCount = posted24.count ?? 0;
    const paymentsCount = payments24.data?.length ?? 0;
    const paymentsTotal = (payments24.data ?? []).reduce(
      (s, r: { amount: number }) => s + Number(r.amount ?? 0),
      0,
    );
    const consumptionCount = invConsumed24.data?.length ?? 0;
    const consumptionValue = (invConsumed24.data ?? []).reduce(
      (s, r: { quantity: number; unit_cost: number }) =>
        s + Number(r.quantity ?? 0) * Number(r.unit_cost ?? 0),
      0,
    );
    const refundsCount = refunds24.data?.length ?? 0;
    const refundsTotal = (refunds24.data ?? []).reduce(
      (s, r: { amount: number }) => s + Number(r.amount ?? 0),
      0,
    );

    return {
      draftCount,
      draftValue,
      postedCount,
      paymentsCount,
      paymentsTotal,
      consumptionCount,
      consumptionValue,
      refundsCount,
      refundsTotal,
      apiClientsActive: (apiClients.data ?? []).filter((c) => c.active).length,
      apiClientsTotal: apiClients.data?.length ?? 0,
    };
  });

/**
 * Test the integration connection — lightweight ping that verifies the
 * caller has access to the org and that the accounting schema is reachable.
 * Returns environment + api client counts + fiscal period status.
 */
export const testIntegrationConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orgInput.parse(v))
  .handler(async ({ data, context }) => {
    const startedAt = Date.now();
    const [org, clients, mappings, period] = await Promise.all([
      context.supabase
        .from("organizations")
        .select("id, name, status")
        .eq("id", data.orgId)
        .maybeSingle(),
      context.supabase
        .from("api_clients")
        .select("id, name, provider, environment, active, scopes")
        .eq("org_id", data.orgId)
        .eq("active", true),
      context.supabase.from("account_mappings").select("purpose").eq("org_id", data.orgId),
      context.supabase
        .from("fiscal_periods")
        .select("id, status, start_date, end_date")
        .eq("org_id", data.orgId)
        .lte("start_date", new Date().toISOString().slice(0, 10))
        .gte("end_date", new Date().toISOString().slice(0, 10))
        .maybeSingle(),
    ]);
    if (org.error) throw new Error(org.error.message);
    return {
      ok: true,
      latencyMs: Date.now() - startedAt,
      org: org.data,
      apiClients: clients.data ?? [],
      mappedPurposes: (mappings.data ?? []).map((m) => m.purpose),
      currentPeriod: period.data,
    };
  });

/**
 * Sandbox helper: create a demo customer + draft invoice for the caller's
 * org so a demo can walk end-to-end without ServiceConnect calling in.
 * Everything is marked with `SANDBOX-` prefixes and metadata.
 */
export const seedSandboxWorkOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        customerName: z.string().min(1).default("Sandbox Marine Co."),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const stamp = Date.now();
    const workOrderRef = `SANDBOX-WO-${stamp}`;
    const invoiceNumber = `INV-${workOrderRef}`;

    // 1. Customer (create-or-reuse by external_id)
    const externalCust = `SANDBOX-CUST-${stamp}`;
    const { data: cust, error: cErr } = await supabase
      .from("customers")
      .insert({
        org_id: data.orgId,
        name: data.customerName,
        email: null,
        external_id: externalCust,
        external_source: "sandbox",
      })
      .select("id, name")
      .single();
    if (cErr) throw new Error(cErr.message);

    // 2. Resolve labor + material revenue accounts (fallback via resolve_account RPC)
    const [labor, material] = await Promise.all([
      supabase.rpc("resolve_account", { _org: data.orgId, _purpose: "labor_revenue" }),
      supabase.rpc("resolve_account", { _org: data.orgId, _purpose: "material_revenue" }),
    ]);
    const laborAcc = labor.data as string | null;
    const materialAcc = material.data as string | null;

    // 3. Draft invoice with two lines
    const laborAmt = 4 * 125; // $500
    const materialAmt = 1 * 150; // $150
    const subtotal = laborAmt + materialAmt;
    const total = subtotal;

    const { data: inv, error: iErr } = await supabase
      .from("invoices")
      .insert({
        org_id: data.orgId,
        customer_id: cust.id,
        invoice_number: invoiceNumber,
        issue_date: new Date().toISOString().slice(0, 10),
        status: "draft",
        subtotal,
        tax: 0,
        total,
        balance: total,
        external_id: workOrderRef,
        external_source: "sandbox",
        work_order_ref: workOrderRef,
        memo: "Sandbox demo work order (Phase 4)",
      })
      .select("id, invoice_number")
      .single();
    if (iErr) throw new Error(iErr.message);

    const { error: lErr } = await supabase.from("invoice_lines").insert([
      {
        invoice_id: inv.id,
        line_order: 0,
        description: "Technician Labor (4h @ $125)",
        quantity: 4,
        unit_price: 125,
        amount: laborAmt,
        tax_rate: 0,
        account_id: laborAcc,
      },
      {
        invoice_id: inv.id,
        line_order: 1,
        description: "Valve",
        quantity: 1,
        unit_price: 150,
        amount: materialAmt,
        tax_rate: 0,
        account_id: materialAcc,
      },
    ]);
    if (lErr) throw new Error(lErr.message);

    await supabase.from("audit_events").insert({
      org_id: data.orgId,
      actor_type: "user",
      actor_id: userId,
      event_type: "sandbox.work_order.completed",
      action: "created",
      target_type: "invoice",
      target_id: inv.id,
      after: { workOrderRef, invoiceNumber, total },
      source: "ledgeros.sandbox",
    });

    return {
      customerId: cust.id,
      invoiceId: inv.id,
      invoiceNumber,
      workOrderRef,
      total,
    };
  });
