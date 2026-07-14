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
  work_order_ref: z.string().min(1),
  item_ref: z.string().min(1),
  item_description: z.string().optional().nullable(),
  quantity: z.number().positive(),
  unit_cost: z.number().nonnegative(),
  consumed_at: z.string().optional().nullable(),
});

export const Route = createFileRoute("/api/public/integrations/inventory-consumption")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let ctx: IntegrationContext | null = null;
        let body: unknown = null;
        try {
          const start = await beginIntegrationCall(
            request,
            "/inventory-consumption",
            "inventory.consume",
          );
          if (start.status === "duplicate") return integrationResponse(start.response);
          ctx = start.ctx;
          body = start.body;

          const parsed = schema.safeParse(body);
          if (!parsed.success) throw new IntegrationError(422, parsed.error.message);
          const p = parsed.data;

          const { data: rpc, error: rpcErr } = await supabaseAdmin.rpc(
            "record_inventory_consumption_with_posting" as never,
            {
              _org_id: ctx.orgId,
              _external_source: "serviceconnect",
              _external_id: p.external_id,
              _work_order_ref: p.work_order_ref,
              _item_ref: p.item_ref,
              _item_description: p.item_description ?? null,
              _quantity: p.quantity,
              _unit_cost: p.unit_cost,
              _consumed_at: p.consumed_at ?? new Date().toISOString(),
              _actor_type: "api_client",
              _actor_id: ctx.clientId,
              _correlation_id: ctx.correlationId,
            } as never,
          );
          if (rpcErr) {
            if (rpcErr.code === "23505") {
              throw new IntegrationError(409, "Inventory consumption already recorded");
            }
            throw new IntegrationError(422, rpcErr.message);
          }

          const result = rpc as {
            consumption_id: string;
            journal_id: string | null;
            total_cost: number;
          };

          const response = {
            id: result.consumption_id,
            journal_id: result.journal_id,
            work_order_ref: p.work_order_ref,
            total_cost: result.total_cost,
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
