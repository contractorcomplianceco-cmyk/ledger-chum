import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  beginIntegrationCall,
  errorResponse,
  finishIntegrationCall,
  integrationResponse,
  recordIntegrationError,
  IntegrationError,
  type IntegrationContext,
} from "@/integrations/serviceconnect/verify.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const applySchema = z.object({
  invoice_external_id: z.string().min(1),
  amount: z.number().positive(),
});

const schema = z.object({
  external_id: z.string().min(1),
  customer_external_id: z.string().min(1),
  payment_date: z.string(),
  method: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  amount: z.number().positive(),
  memo: z.string().optional().nullable(),
  apply_to: z.array(applySchema).optional().default([]),
});

export const Route = createFileRoute("/api/public/integrations/payments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let ctx: IntegrationContext | null = null;
        let body: unknown = null;
        try {
          const start = await beginIntegrationCall(request, "/payments");
          if (start.status === "duplicate") return integrationResponse(start.response);
          ctx = start.ctx;
          body = start.body;

          const parsed = schema.safeParse(body);
          if (!parsed.success) throw new IntegrationError(422, parsed.error.message);
          const p = parsed.data;

          // Resolve customer by external id.
          const { data: customer } = await supabaseAdmin
            .from("customers")
            .select("id")
            .eq("org_id", ctx.orgId)
            .eq("external_source", "serviceconnect")
            .eq("external_id", p.customer_external_id)
            .maybeSingle();
          if (!customer) throw new IntegrationError(422, "Customer not found");

          // Resolve invoice UUIDs from external ids.
          const applyPairs: { invoice_id: string; amount: number }[] = [];
          for (const a of p.apply_to) {
            const { data: inv } = await supabaseAdmin
              .from("invoices")
              .select("id")
              .eq("org_id", ctx.orgId)
              .eq("external_source", "serviceconnect")
              .eq("external_id", a.invoice_external_id)
              .maybeSingle();
            if (!inv) {
              throw new IntegrationError(
                422,
                `Invoice ${a.invoice_external_id} not found`,
              );
            }
            applyPairs.push({ invoice_id: inv.id, amount: a.amount });
          }

          // Atomic RPC: creates payment + applications + posted journal + audit.
          const { data: rpc, error: rpcErr } = await supabaseAdmin.rpc(
            "record_payment_with_posting" as never,
            {
              _org_id: ctx.orgId,
              _customer_id: customer.id,
              _external_source: "serviceconnect",
              _external_id: p.external_id,
              _payment_date: p.payment_date,
              _method: p.method ?? null,
              _reference: p.reference ?? null,
              _amount: p.amount,
              _memo: p.memo ?? null,
              _apply_to: applyPairs,
              _actor_type: "api_client",
              _actor_id: ctx.clientId,
              _correlation_id: ctx.correlationId,
            } as never,
          );
          if (rpcErr) {
            // Duplicate payment (org_id, external_source, external_id) — return 409.
            if (rpcErr.code === "23505") {
              throw new IntegrationError(409, "Payment already recorded");
            }
            throw new IntegrationError(422, rpcErr.message);
          }

          const result = rpc as {
            payment_id: string;
            journal_id: string;
            unapplied_amount: number;
            applications: unknown[];
          };

          const response = {
            id: result.payment_id,
            journal_id: result.journal_id,
            amount: p.amount,
            unapplied_amount: result.unapplied_amount,
            applications: result.applications.length,
            correlation_id: ctx.correlationId,
          };
          await finishIntegrationCall(ctx, p.external_id, body, response);
          return integrationResponse(response, 201);
        } catch (err) {
          await recordIntegrationError(ctx, body, err);
          return errorResponse(err);
        }
      },
    },
  },
});
