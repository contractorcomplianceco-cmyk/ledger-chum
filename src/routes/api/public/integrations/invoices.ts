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

const lineSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive().default(1),
  unit_price: z.number().nonnegative(),
  tax_rate: z.number().nonnegative().default(0),
  account_code: z.string().optional().nullable(),
});

const schema = z.object({
  external_id: z.string().min(1),
  customer_external_id: z.string().min(1),
  invoice_number: z.string().min(1),
  issue_date: z.string(),
  due_date: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
  work_order_ref: z.string().optional().nullable(),
  lines: z.array(lineSchema).min(1),
});

export const Route = createFileRoute("/api/public/integrations/invoices")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let ctx: IntegrationContext | null = null;
        let body: unknown = null;
        try {
          const start = await beginIntegrationCall(request, "/invoices");
          if (start.status === "duplicate") return integrationResponse(start.response);
          ctx = start.ctx;
          body = start.body;

          const parsed = schema.safeParse(body);
          if (!parsed.success) throw new IntegrationError(422, parsed.error.message);
          const p = parsed.data;

          const { data: customer } = await supabaseAdmin
            .from("customers")
            .select("id")
            .eq("org_id", ctx.orgId)
            .eq("external_source", "serviceconnect")
            .eq("external_id", p.customer_external_id)
            .maybeSingle();
          if (!customer) throw new IntegrationError(422, "Customer not found");

          const { data: defaultRev } = await supabaseAdmin
            .from("accounts")
            .select("id")
            .eq("org_id", ctx.orgId)
            .eq("type", "revenue")
            .eq("is_active", true)
            .order("code", { ascending: true })
            .limit(1)
            .maybeSingle();

          let subtotal = 0, tax = 0;
          const lineRows = [];
          for (let i = 0; i < p.lines.length; i++) {
            const l = p.lines[i];
            const s = round2(l.quantity * l.unit_price);
            const t = round2(s * l.tax_rate);
            subtotal += s; tax += t;
            let accountId: string | null = null;
            if (l.account_code) {
              const { data: acc } = await supabaseAdmin
                .from("accounts").select("id")
                .eq("org_id", ctx.orgId).eq("code", l.account_code).maybeSingle();
              accountId = acc?.id ?? null;
            }
            accountId = accountId ?? defaultRev?.id ?? null;
            lineRows.push({
              description: l.description, quantity: l.quantity,
              unit_price: l.unit_price, tax_rate: l.tax_rate,
              amount: round2(s + t), account_id: accountId, line_order: i,
            });
          }
          subtotal = round2(subtotal); tax = round2(tax);
          const total = round2(subtotal + tax);

          const { data: inv, error } = await supabaseAdmin
            .from("invoices")
            .insert({
              org_id: ctx.orgId, customer_id: customer.id,
              external_source: "serviceconnect", external_id: p.external_id,
              invoice_number: p.invoice_number, issue_date: p.issue_date,
              due_date: p.due_date ?? null, status: "draft",
              subtotal, tax, total, balance: total,
              work_order_ref: p.work_order_ref ?? null, memo: p.memo ?? null,
            }).select().single();
          if (error) throw new IntegrationError(500, error.message);

          const { error: lerr } = await supabaseAdmin
            .from("invoice_lines")
            .insert(lineRows.map((r) => ({ ...r, invoice_id: inv.id })));
          if (lerr) {
            await supabaseAdmin.from("invoices").delete().eq("id", inv.id);
            throw new IntegrationError(500, lerr.message);
          }

          const auditId = await writeAudit(ctx, "invoice.created", "invoice", inv.id, null, inv);
          const response = {
            id: inv.id, invoice_number: p.invoice_number, status: "draft",
            total, balance: total, audit_event_id: auditId, correlation_id: ctx.correlationId,
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
