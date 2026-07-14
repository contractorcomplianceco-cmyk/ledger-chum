import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  beginIntegrationCall,
  errorResponse,
  finishIntegrationCall,
  integrationResponse,
  recordIntegrationError,
  writeAudit,
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
          const start = await beginIntegrationCall(request, "/inventory-consumption", "inventory.consume");
          if (start.status === "duplicate") return integrationResponse(start.response);
          ctx = start.ctx;
          body = start.body;

          const parsed = schema.safeParse(body);
          if (!parsed.success) throw new IntegrationError(422, parsed.error.message);
          const p = parsed.data;

          const totalCost = round2(p.quantity * p.unit_cost);

          const { data: row, error } = await supabaseAdmin
            .from("inventory_consumption")
            .insert({
              org_id: ctx.orgId,
              external_source: "serviceconnect",
              external_id: p.external_id,
              work_order_ref: p.work_order_ref,
              item_ref: p.item_ref,
              item_description: p.item_description ?? null,
              quantity: p.quantity,
              unit_cost: p.unit_cost,
              total_cost: totalCost,
              consumed_at: p.consumed_at ?? new Date().toISOString(),
            }).select().single();
          if (error) throw new IntegrationError(500, error.message);

          const auditId = await writeAudit(
            ctx, "inventory.consumed", "inventory_consumption", row.id, null, row,
          );

          const response = {
            id: row.id, work_order_ref: p.work_order_ref,
            total_cost: totalCost,
            audit_event_id: auditId,
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

function round2(n: number) { return Math.round(n * 100) / 100; }
