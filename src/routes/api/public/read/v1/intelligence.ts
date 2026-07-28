import { createFileRoute } from "@tanstack/react-router";
import {
  verifyReadClient,
  requireReadScope,
  readResponse,
  readErrorResponse,
} from "@/integrations/ledgeros-read-api/verify.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/read/v1/intelligence")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const client = await verifyReadClient(request);
          requireReadScope(client, "read.intelligence");
          const url = new URL(request.url);
          const kind = url.searchParams.get("kind") ?? "all";

          const wantAnom = kind === "all" || kind === "anomalies";
          const wantRec = kind === "all" || kind === "recommendations";
          const wantExp = kind === "all" || kind === "explanations";

          const [anom, rec, exp] = await Promise.all([
            wantAnom
              ? supabaseAdmin
                  .from("financial_anomalies")
                  .select("id, metric_slug, severity, status, detected_at, summary, confidence")
                  .eq("org_id", client.orgId)
                  .order("detected_at", { ascending: false })
                  .limit(50)
              : Promise.resolve({ data: [] }),
            wantRec
              ? supabaseAdmin
                  .from("financial_recommendations")
                  .select("id, persona, title, priority, status, confidence, created_at")
                  .eq("org_id", client.orgId)
                  .order("created_at", { ascending: false })
                  .limit(50)
              : Promise.resolve({ data: [] }),
            wantExp
              ? supabaseAdmin
                  .from("intelligence_explanations")
                  .select("id, subject_type, subject_id, answer, confidence, freshness, created_at")
                  .eq("org_id", client.orgId)
                  .order("created_at", { ascending: false })
                  .limit(25)
              : Promise.resolve({ data: [] }),
          ]);

          return readResponse({
            org_id: client.orgId,
            consumer: client.consumerSlug,
            anomalies: anom.data ?? [],
            recommendations: rec.data ?? [],
            explanations: exp.data ?? [],
          });
        } catch (err) {
          return readErrorResponse(err);
        }
      },
    },
  },
});
