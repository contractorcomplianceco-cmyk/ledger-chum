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

const schema = z.object({
  external_id: z.string().min(1),
  payment_external_id: z.string().min(1),
  refund_date: z.string(),
  amount: z.number().positive(),
  method: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
});

export const Route = createFileRoute("/api/public/integrations/refunds")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let ctx: IntegrationContext | null = null;
        let body: unknown = null;
        try {
          const start = await beginIntegrationCall(request, "/refunds", "refunds.create");
          if (start.status === "duplicate") return integrationResponse(start.response);
          ctx = start.ctx;
          body = start.body;

          const parsed = schema.safeParse(body);
          if (!parsed.success) throw new IntegrationError(422, parsed.error.message);
          const p = parsed.data;

          // Resolve payment by external id
          const { data: payment, error: perr } = await supabaseAdmin
            .from("payments")
            .select("id")
            .eq("org_id", ctx.orgId)
            .eq("external_source", "serviceconnect")
            .eq("external_id", p.payment_external_id)
            .maybeSingle();
          if (perr) throw new IntegrationError(500, perr.message);
          if (!payment)
            throw new IntegrationError(422, `Payment ${p.payment_external_id} not found`);

          const { data: rpc, error: rpcErr } = await supabaseAdmin.rpc(
            "record_refund_with_posting" as never,
            {
              _org_id: ctx.orgId,
              _payment_id: payment.id,
              _refund_date: p.refund_date,
              _amount: p.amount,
              _method: p.method ?? null,
              _memo: p.memo ?? null,
              _actor_type: "api_client",
              _actor_id: ctx.clientId,
              _correlation_id: ctx.correlationId,
            } as never,
          );
          if (rpcErr) throw new IntegrationError(422, rpcErr.message);

          const result = rpc as { refund_id: string; journal_id: string };

          const response = {
            id: result.refund_id,
            journal_id: result.journal_id,
            amount: p.amount,
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
