import { createFileRoute } from "@tanstack/react-router";
import {
  verifyReadClient,
  requireReadScope,
  readResponse,
  readErrorResponse,
} from "@/integrations/ledgeros-read-api/verify.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/read/v1/close-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const client = await verifyReadClient(request);
          requireReadScope(client, "read.close");

          const { data: runs, error } = await supabaseAdmin
            .from("close_runs")
            .select("id, period_id, status, opened_at, closed_at, approved_at, completion_score")
            .eq("org_id", client.orgId)
            .order("opened_at", { ascending: false })
            .limit(12);
          if (error) throw new Error(error.message);

          return readResponse({
            org_id: client.orgId,
            consumer: client.consumerSlug,
            count: runs?.length ?? 0,
            close_runs: runs ?? [],
          });
        } catch (err) {
          return readErrorResponse(err);
        }
      },
    },
  },
});
