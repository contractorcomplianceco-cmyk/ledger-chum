import { createFileRoute } from "@tanstack/react-router";
import {
  verifyReadClient,
  requireReadScope,
  readResponse,
  readErrorResponse,
} from "@/integrations/ledgeros-read-api/verify.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/read/v1/journals")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const client = await verifyReadClient(request);
          requireReadScope(client, "read.journals");

          const url = new URL(request.url);
          const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
          const since = url.searchParams.get("since");

          let query = supabaseAdmin
            .from("journal_entries")
            .select("id, entry_date, memo, description, source, status, posted_at, correlation_id")
            .eq("org_id", client.orgId)
            .order("posted_at", { ascending: false, nullsFirst: false })
            .limit(limit);
          if (since) query = query.gte("posted_at", since);

          const { data, error } = await query;
          if (error) throw new Error(error.message);

          return readResponse({
            org_id: client.orgId,
            consumer: client.consumerSlug,
            count: data?.length ?? 0,
            limit,
            journals: data ?? [],
          });
        } catch (err) {
          return readErrorResponse(err);
        }
      },
    },
  },
});
