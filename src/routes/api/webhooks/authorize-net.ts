import { createFileRoute } from "@tanstack/react-router";
import { getPaymentProvider } from "@/lib/payments/get-provider.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Authorize.net (and any future gateway) webhook receiver.
 *
 * 1. Reads the RAW body (signature is computed over the exact bytes).
 * 2. Verifies the signature via the processor-agnostic provider — an invalid
 *    signature is rejected with 401 and nothing is written.
 * 3. Idempotently records the event in `payment_events` (unique on
 *    provider + provider_event_id): a replayed webhook is a no-op.
 * 4. Syncs the matched payment's status. Money movement (refunds) is posted
 *    through the accounting RPCs elsewhere, so the webhook never double-posts a
 *    journal — it only reconciles status.
 */
export const Route = createFileRoute("/api/webhooks/authorize-net")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const headers: Record<string, string> = {};
        request.headers.forEach((v, k) => {
          headers[k.toLowerCase()] = v;
        });

        const provider = getPaymentProvider();
        const event = provider.verifyWebhook(rawBody, headers);
        if (!event) {
          return json({ error: "invalid signature" }, 401);
        }

        // Resolve the org from the referenced transaction. Unmatched events are
        // acknowledged (200) so the gateway stops retrying, but not stored
        // (payment_events is org-scoped).
        let orgId: string | null = null;
        let paymentId: string | null = null;
        if (event.providerTransactionId) {
          const { data: pay } = await supabaseAdmin
            .from("payments")
            .select("id, org_id")
            .eq("provider", provider.name)
            .eq("provider_txn_id", event.providerTransactionId)
            .maybeSingle();
          if (pay) {
            orgId = pay.org_id;
            paymentId = pay.id;
          }
        }
        if (!orgId) {
          return json({ ok: true, ignored: true, reason: "unmatched transaction" });
        }

        // Idempotent insert. A duplicate provider_event_id means we've already
        // processed this notification.
        const { error: insErr } = await supabaseAdmin.from("payment_events").insert({
          org_id: orgId,
          payment_id: paymentId,
          provider: provider.name,
          provider_event_id:
            event.id || `${provider.name}:${event.providerTransactionId}:${event.type}`,
          provider_txn_id: event.providerTransactionId,
          event_type: event.type,
          status: event.status,
          amount: event.amount,
          payload: event.raw as never,
        });
        if (insErr) {
          if (insErr.code === "23505") {
            return json({ ok: true, duplicate: true });
          }
          return json({ error: insErr.message }, 500);
        }

        // Sync payment status when the event carries a terminal state.
        if (paymentId && event.status) {
          await supabaseAdmin.from("payments").update({ status: event.status }).eq("id", paymentId);
        }

        await supabaseAdmin
          .from("payment_events")
          .update({ processed_at: new Date().toISOString() })
          .eq("provider", provider.name)
          .eq(
            "provider_event_id",
            event.id || `${provider.name}:${event.providerTransactionId}:${event.type}`,
          );

        return json({ ok: true, paymentId, status: event.status });
      },
    },
  },
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}
