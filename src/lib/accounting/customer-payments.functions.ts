import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { assertApplyWithinAmount } from "@/lib/payments/posting";

/**
 * Customer (incoming) payments — the collect + manual-record flows.
 *
 * Ledger posting reuses the existing `record_payment_with_posting` SECURITY
 * DEFINER RPC (DR Cash / CR Accounts Receivable, partial-payment aware). That
 * RPC is granted to `service_role` only, so these handlers authenticate the
 * user, verify org membership, then post via the service-role admin client.
 *
 * Gateway charges go through the processor-agnostic PaymentProvider; the
 * concrete gateway (Authorize.net / demo) is chosen server-side and never
 * exposed to the client. Raw card/bank data never reaches us — only a
 * tokenized nonce produced in the browser.
 */

const PAYMENT_METHOD = z.enum(["card", "ach"]);
const MANUAL_METHOD = z.enum(["check", "cash", "wire", "other"]);

/** Map a gateway method to the repo's payment_account_mappings lookup key. */
function mappingKeyForGateway(method: "card" | "ach"): string {
  return method === "card" ? "credit_card" : "ach";
}

async function assertMember(
  supabase: SupabaseClient<Database>,
  userId: string,
  orgId: string,
): Promise<void> {
  const { data } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!data) throw new Error("Not authorized for this organization");
}

export const listCustomerPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        status: z.string().optional(),
        method: z.string().optional(),
        limit: z.number().int().min(1).max(500).default(100),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("payments")
      .select("*, customers(name), payment_applications(invoice_id, amount_applied)")
      .eq("org_id", data.orgId)
      .order("payment_date", { ascending: false })
      .limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    if (data.method) q = q.eq("method", data.method);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Non-secret config the browser tokenizer (Accept.js) needs. */
export const getPaymentConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { getPaymentProvider } = await import("@/lib/payments/get-provider.server");
    return getPaymentProvider().publicConfig();
  });

/**
 * Collect a payment through the gateway using a browser-tokenized nonce, then
 * post DR Cash / CR AR and update invoice status. Idempotent on
 * `idempotencyKey`.
 */
export const collectPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        customerId: z.string().uuid(),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        method: PAYMENT_METHOD,
        token: z.string().min(1),
        tokenDescriptor: z.string().optional(),
        invoiceId: z.string().uuid().optional(),
        idempotencyKey: z.string().min(8),
        memo: z.string().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertMember(context.supabase, context.userId, data.orgId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Idempotency: replay a prior capture rather than charging twice.
    const { data: existing } = await supabaseAdmin
      .from("payments")
      .select("id, provider_txn_id, amount, status")
      .eq("org_id", data.orgId)
      .eq("idempotency_key", data.idempotencyKey)
      .maybeSingle();
    if (existing) {
      return {
        ok: true as const,
        replayed: true,
        paymentId: existing.id,
        providerTransactionId: existing.provider_txn_id,
        status: existing.status,
        amount: existing.amount,
      };
    }

    // Look up customer for the receipt + charge metadata.
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, name, email")
      .eq("org_id", data.orgId)
      .eq("id", data.customerId)
      .maybeSingle();

    const { getPaymentProvider } = await import("@/lib/payments/get-provider.server");
    const provider = getPaymentProvider();

    const charge = await provider.charge({
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      token: { token: data.token, descriptor: data.tokenDescriptor, method: data.method },
      customer: {
        id: data.customerId,
        name: customer?.name ?? undefined,
        email: customer?.email ?? undefined,
      },
      invoiceRef: data.invoiceId,
      description: data.memo,
      idempotencyKey: data.idempotencyKey,
    });

    if (!charge.success) {
      return {
        ok: false as const,
        errorCode: charge.errorCode,
        errorMessage: charge.errorMessage ?? "The payment was declined.",
      };
    }

    const paymentDate = new Date().toISOString().slice(0, 10);
    const applyTo = data.invoiceId ? [{ invoice_id: data.invoiceId, amount: data.amount }] : [];
    assertApplyWithinAmount(
      data.amount,
      applyTo.map((a) => ({ amount: a.amount })),
    );

    const { data: rpc, error: rpcErr } = await supabaseAdmin.rpc(
      "record_payment_with_posting" as never,
      {
        _org_id: data.orgId,
        _customer_id: data.customerId,
        _external_source: provider.name,
        _external_id: charge.providerTransactionId,
        _payment_date: paymentDate,
        _method: mappingKeyForGateway(data.method),
        _reference: charge.providerTransactionId,
        _amount: data.amount,
        _memo: data.memo ?? null,
        _apply_to: applyTo,
        _actor_type: "user",
        _actor_id: context.userId,
        _correlation_id: data.idempotencyKey,
      } as never,
    );
    if (rpcErr) {
      // Journal/payment already exists for this transaction — treat as replay.
      if (rpcErr.code === "23505") {
        const { data: dup } = await supabaseAdmin
          .from("payments")
          .select("id, provider_txn_id, amount, status")
          .eq("org_id", data.orgId)
          .eq("external_source", provider.name)
          .eq("external_id", charge.providerTransactionId)
          .maybeSingle();
        return {
          ok: true as const,
          replayed: true,
          paymentId: dup?.id ?? null,
          providerTransactionId: charge.providerTransactionId,
          status: charge.status,
          amount: data.amount,
        };
      }
      throw new Error(rpcErr.message);
    }

    const result = rpc as { payment_id: string; journal_id: string; unapplied_amount: number };

    // Stamp gateway metadata + idempotency key on the payment row.
    await supabaseAdmin
      .from("payments")
      .update({
        provider: provider.name,
        provider_txn_id: charge.providerTransactionId,
        status: charge.status,
        payment_type: "gateway",
        idempotency_key: data.idempotencyKey,
      })
      .eq("id", result.payment_id);

    // Best-effort receipt — never blocks posting.
    let receiptSent = false;
    if (customer?.email) {
      const { sendPaymentReceipt } = await import("@/lib/payments/receipt.server");
      const receipt = await sendPaymentReceipt({
        to: customer.email,
        customerName: customer.name ?? undefined,
        invoiceRef: data.invoiceId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        providerTransactionId: charge.providerTransactionId,
        paymentDate,
      });
      receiptSent = receipt.sent;
    }

    return {
      ok: true as const,
      replayed: false,
      paymentId: result.payment_id,
      journalId: result.journal_id,
      providerTransactionId: charge.providerTransactionId,
      status: charge.status,
      amount: data.amount,
      unappliedAmount: result.unapplied_amount,
      receiptSent,
    };
  });

/**
 * Record a payment received offline (check / cash / wire). No gateway charge —
 * just the ledger posting + invoice update.
 */
export const recordManualPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        orgId: z.string().uuid(),
        customerId: z.string().uuid(),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        method: MANUAL_METHOD,
        reference: z.string().optional(),
        paymentDate: z.string(),
        invoiceId: z.string().uuid().optional(),
        memo: z.string().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertMember(context.supabase, context.userId, data.orgId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { randomUUID } = await import("node:crypto");

    const externalId = randomUUID();
    const applyTo = data.invoiceId ? [{ invoice_id: data.invoiceId, amount: data.amount }] : [];
    assertApplyWithinAmount(
      data.amount,
      applyTo.map((a) => ({ amount: a.amount })),
    );

    const { data: rpc, error: rpcErr } = await supabaseAdmin.rpc(
      "record_payment_with_posting" as never,
      {
        _org_id: data.orgId,
        _customer_id: data.customerId,
        _external_source: "ledgeros.manual",
        _external_id: externalId,
        _payment_date: data.paymentDate,
        _method: data.method,
        _reference: data.reference ?? null,
        _amount: data.amount,
        _memo: data.memo ?? null,
        _apply_to: applyTo,
        _actor_type: "user",
        _actor_id: context.userId,
        _correlation_id: externalId,
      } as never,
    );
    if (rpcErr) throw new Error(rpcErr.message);

    const result = rpc as { payment_id: string; journal_id: string; unapplied_amount: number };

    await supabaseAdmin
      .from("payments")
      .update({
        status: "succeeded",
        payment_type: "manual",
        idempotency_key: externalId,
      })
      .eq("id", result.payment_id);

    return {
      ok: true as const,
      paymentId: result.payment_id,
      journalId: result.journal_id,
      unappliedAmount: result.unapplied_amount,
    };
  });
