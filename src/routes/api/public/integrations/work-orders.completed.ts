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
  external_id: z.string().min(1),               // ServiceConnect work order id
  work_order_ref: z.string().min(1),            // Human-readable WO number
  customer_external_id: z.string().min(1),
  issue_date: z.string(),                        // ISO date
  due_date: z.string().optional().nullable(),
  invoice_number: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
  lines: z.array(lineSchema).min(1),
});

export const Route = createFileRoute("/api/public/integrations/work-orders/completed")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let ctx: IntegrationContext | null = null;
        let body: unknown = null;
        try {
          const start = await beginIntegrationCall(request, "/work-orders/completed");
          if (start.status === "duplicate") return integrationResponse(start.response);
          ctx = start.ctx;
          body = start.body;

          const parsed = schema.safeParse(body);
          if (!parsed.success) throw new IntegrationError(422, parsed.error.message);
          const p = parsed.data;

          // Resolve customer
          const { data: customer, error: cerr } = await supabaseAdmin
            .from("customers")
            .select("id")
            .eq("org_id", ctx.orgId)
            .eq("external_source", "serviceconnect")
            .eq("external_id", p.customer_external_id)
            .maybeSingle();
          if (cerr) throw new IntegrationError(500, cerr.message);
          if (!customer)
            throw new IntegrationError(
              422,
              `Customer ${p.customer_external_id} not found — send POST /customers first`,
            );

          // Resolve default revenue account for lines missing account_code
          const { data: defaultRev } = await supabaseAdmin
            .from("accounts")
            .select("id, code")
            .eq("org_id", ctx.orgId)
            .eq("type", "revenue")
            .eq("is_active", true)
            .order("code", { ascending: true })
            .limit(1)
            .maybeSingle();

          // Build lines with amounts and resolved account ids
          let subtotal = 0;
          let tax = 0;
          const lineRows: Array<{
            description: string;
            quantity: number;
            unit_price: number;
            tax_rate: number;
            amount: number;
            account_id: string | null;
            line_order: number;
          }> = [];

          for (let i = 0; i < p.lines.length; i++) {
            const l = p.lines[i];
            const lineSubtotal = round2(l.quantity * l.unit_price);
            const lineTax = round2(lineSubtotal * l.tax_rate);
            subtotal += lineSubtotal;
            tax += lineTax;

            let accountId: string | null = null;
            if (l.account_code) {
              const { data: acc } = await supabaseAdmin
                .from("accounts")
                .select("id")
                .eq("org_id", ctx.orgId)
                .eq("code", l.account_code)
                .maybeSingle();
              accountId = acc?.id ?? null;
            }
            if (!accountId) accountId = defaultRev?.id ?? null;

            lineRows.push({
              description: l.description,
              quantity: l.quantity,
              unit_price: l.unit_price,
              tax_rate: l.tax_rate,
              amount: round2(lineSubtotal + lineTax),
              account_id: accountId,
              line_order: i,
            });
          }

          subtotal = round2(subtotal);
          tax = round2(tax);
          const total = round2(subtotal + tax);

          const invoiceNumber =
            p.invoice_number ?? `WO-${p.work_order_ref}`;

          // Insert draft invoice
          const { data: inv, error: ierr } = await supabaseAdmin
            .from("invoices")
            .insert({
              org_id: ctx.orgId,
              customer_id: customer.id,
              external_source: "serviceconnect",
              external_id: p.external_id,
              invoice_number: invoiceNumber,
              issue_date: p.issue_date,
              due_date: p.due_date ?? null,
              status: "draft",
              subtotal,
              tax,
              total,
              balance: total,
              work_order_ref: p.work_order_ref,
              memo: p.memo ?? null,
            })
            .select()
            .single();
          if (ierr) throw new IntegrationError(500, ierr.message);

          const { error: lerr } = await supabaseAdmin
            .from("invoice_lines")
            .insert(lineRows.map((r) => ({ ...r, invoice_id: inv.id })));
          if (lerr) {
            await supabaseAdmin.from("invoices").delete().eq("id", inv.id);
            throw new IntegrationError(500, lerr.message);
          }

          const auditId = await writeAudit(
            ctx,
            "invoice.draft_created_from_work_order",
            "invoice",
            inv.id,
            null,
            { invoice: inv, lines: lineRows },
          );

          const response = {
            id: inv.id,
            invoice_number: invoiceNumber,
            work_order_ref: p.work_order_ref,
            status: "draft",
            total,
            balance: total,
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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
