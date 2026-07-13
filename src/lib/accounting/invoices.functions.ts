import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      orgId: z.string().uuid(),
      status: z.enum(["draft", "sent", "partial", "paid", "void"]).optional(),
      customerId: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(200).default(50),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("invoices")
      .select("*, customers(name)")
      .eq("org_id", data.orgId)
      .order("issue_date", { ascending: false })
      .limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    if (data.customerId) q = q.eq("customer_id", data.customerId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getInvoice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: inv, error } = await context.supabase
      .from("invoices")
      .select("*, customers(id, name, email), invoice_lines(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return inv;
  });

/** Approve and post: draft → sent, and post the AR/revenue journal. */
export const postInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: inv, error: ierr } = await supabase
      .from("invoices")
      .select("*, invoice_lines(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (ierr) throw new Error(ierr.message);
    if (!inv) throw new Error("Invoice not found");
    if (inv.status !== "draft") throw new Error(`Cannot post invoice in status ${inv.status}`);

    // Resolve AR account
    const { data: arAcc } = await supabase
      .from("accounts")
      .select("id")
      .eq("org_id", inv.org_id)
      .eq("type", "asset")
      .ilike("name", "%receivable%")
      .maybeSingle();
    if (!arAcc)
      throw new Error("No Accounts Receivable account found in Chart of Accounts");

    // Create journal
    const { data: je, error: jerr } = await supabase
      .from("journal_entries")
      .insert({
        org_id: inv.org_id,
        entry_date: inv.issue_date,
        memo: `Invoice ${inv.invoice_number}`,
        source_type: "invoice",
        source_id: inv.id,
        status: "draft",
      })
      .select()
      .single();
    if (jerr) throw new Error(jerr.message);

    // AR debit = total, revenue credit = subtotal per line + tax lumped to revenue for phase 1
    const lines = [
      {
        journal_id: je.id,
        account_id: arAcc.id,
        debit: inv.total,
        credit: 0,
        memo: "AR",
        line_order: 0,
      },
      ...inv.invoice_lines
        .filter((l: { account_id: string | null }) => l.account_id)
        .map((l: { account_id: string; amount: number; description: string }, idx: number) => ({
          journal_id: je.id,
          account_id: l.account_id,
          debit: 0,
          credit: l.amount,
          memo: l.description,
          line_order: idx + 1,
        })),
    ];
    const { error: lerr } = await supabase.from("journal_lines").insert(lines);
    if (lerr) throw new Error(lerr.message);

    // Post journal (trigger enforces balance)
    const { error: perr } = await supabase
      .from("journal_entries")
      .update({ status: "posted", posted_by: userId })
      .eq("id", je.id);
    if (perr) throw new Error(perr.message);

    // Update invoice
    await supabase
      .from("invoices")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", inv.id);

    await supabase.from("audit_events").insert({
      org_id: inv.org_id,
      actor_type: "user",
      actor_id: userId,
      event_type: "invoice.posted",
      target_type: "invoice",
      target_id: inv.id,
      before: { status: "draft" },
      after: { status: "sent", journal_id: je.id },
    });

    return { ok: true, invoiceId: inv.id, journalId: je.id };
  });
