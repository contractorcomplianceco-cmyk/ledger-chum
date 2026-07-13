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

          const { data: customer } = await supabaseAdmin
            .from("customers").select("id")
            .eq("org_id", ctx.orgId)
            .eq("external_source", "serviceconnect")
            .eq("external_id", p.customer_external_id)
            .maybeSingle();
          if (!customer) throw new IntegrationError(422, "Customer not found");

          const applyTotal = round2(p.apply_to.reduce((s, a) => s + a.amount, 0));
          if (applyTotal > p.amount)
            throw new IntegrationError(422, "apply_to sum exceeds payment amount");

          const { data: pay, error } = await supabaseAdmin
            .from("payments")
            .insert({
              org_id: ctx.orgId, customer_id: customer.id,
              external_source: "serviceconnect", external_id: p.external_id,
              payment_date: p.payment_date, method: p.method ?? null,
              reference: p.reference ?? null, amount: p.amount,
              unapplied_amount: round2(p.amount - applyTotal),
              memo: p.memo ?? null,
            }).select().single();
          if (error) throw new IntegrationError(500, error.message);

          const applications: unknown[] = [];
          for (const a of p.apply_to) {
            const { data: inv } = await supabaseAdmin
              .from("invoices").select("id, balance, total")
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
            if (a.amount > inv.balance) {
              throw new IntegrationError(
                422,
                `Application ${a.amount} exceeds invoice balance ${inv.balance}`,
              );
            }
            const { data: app, error: aerr } = await supabaseAdmin
              .from("payment_applications")
              .insert({
                payment_id: pay.id, invoice_id: inv.id,
                amount_applied: a.amount,
              }).select().single();
            if (aerr) throw new IntegrationError(500, aerr.message);
            applications.push(app);

            const newBalance = round2(inv.balance - a.amount);
            const newStatus =
              newBalance === 0 ? "paid" : newBalance < inv.total ? "partial" : "sent";
            await supabaseAdmin
              .from("invoices")
              .update({ balance: newBalance, status: newStatus, updated_at: new Date().toISOString() })
              .eq("id", inv.id);
          }

          const auditId = await writeAudit(
            ctx, "payment.recorded", "payment", pay.id, null,
            { payment: pay, applications },
          );

          const response = {
            id: pay.id, amount: p.amount,
            unapplied_amount: round2(p.amount - applyTotal),
            applications: applications.length,
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
