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
                  .select("id, metric_key, severity, status, title, narrative, confidence, freshness, created_at")
                  .eq("org_id", client.orgId)
                  .order("created_at", { ascending: false })
                  .limit(50)
              : Promise.resolve({ data: [] as unknown[] }),
            wantRec
              ? supabaseAdmin
                  .from("financial_recommendations")
                  .select("id, persona, title, category, state, confidence, estimated_impact, created_at")
                  .eq("org_id", client.orgId)
                  .order("created_at", { ascending: false })
                  .limit(50)
              : Promise.resolve({ data: [] as unknown[] }),
            wantExp
              ? supabaseAdmin
                  .from("intelligence_explanations")
                  .select("id, subject_type, subject_key, question, answer, confidence, freshness, created_at")
                  .eq("org_id", client.orgId)
                  .order("created_at", { ascending: false })
                  .limit(25)
              : Promise.resolve({ data: [] as unknown[] }),
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
