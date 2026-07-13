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
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  billing_address: z.record(z.unknown()).optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const Route = createFileRoute("/api/public/integrations/customers")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let ctx: IntegrationContext | null = null;
        let body: unknown = null;
        try {
          const start = await beginIntegrationCall(request, "/customers");
          if (start.status === "duplicate") return integrationResponse(start.response);
          ctx = start.ctx;
          body = start.body;

          const parsed = schema.safeParse(body);
          if (!parsed.success) throw new IntegrationError(422, parsed.error.message);
          const p = parsed.data;

          const { data: existing } = await supabaseAdmin
            .from("customers")
            .select("*")
            .eq("org_id", ctx.orgId)
            .eq("external_source", "serviceconnect")
            .eq("external_id", p.external_id)
            .maybeSingle();

          let row;
          if (existing) {
            const { data, error } = await supabaseAdmin
              .from("customers")
              .update({
                name: p.name,
                email: p.email ?? null,
                phone: p.phone ?? null,
                billing_address: p.billing_address ?? null,
                status: p.status ?? existing.status,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id)
              .select()
              .single();
            if (error) throw new IntegrationError(500, error.message);
            row = data;
            await writeAudit(ctx, "customer.updated", "customer", row.id, existing, row);
          } else {
            const { data, error } = await supabaseAdmin
              .from("customers")
              .insert({
                org_id: ctx.orgId,
                external_source: "serviceconnect",
                external_id: p.external_id,
                name: p.name,
                email: p.email ?? null,
                phone: p.phone ?? null,
                billing_address: p.billing_address ?? null,
                status: p.status ?? "active",
              })
              .select()
              .single();
            if (error) throw new IntegrationError(500, error.message);
            row = data;
            await writeAudit(ctx, "customer.created", "customer", row.id, null, row);
          }

          const response = {
            id: row.id,
            external_id: p.external_id,
            idempotency_key: ctx.idempotencyKey,
            correlation_id: ctx.correlationId,
          };
          await finishIntegrationCall(ctx, p.external_id, body, response);
          return integrationResponse(response, existing ? 200 : 201);
        } catch (err) {
          await recordIntegrationError(ctx, body, err);
          return errorResponse(err);
        }
      },
    },
  },
});
