import { createFileRoute } from "@tanstack/react-router";
import {
  verifyReadClient,
  requireReadScope,
  readResponse,
  readErrorResponse,
} from "@/integrations/ledgeros-read-api/verify.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const HEALTH_SLUGS = [
  "financial_health_score",
  "true_available_cash",
  "cash_runway_days",
  "gross_margin",
  "operating_margin",
  "ar_collection_risk",
  "ap_payment_pressure",
];

export const Route = createFileRoute("/api/public/read/v1/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const client = await verifyReadClient(request);
          requireReadScope(client, "read.health");

          const { data: metrics } = await supabaseAdmin
            .from("financial_metrics")
            .select("id, slug, name")
            .eq("org_id", client.orgId)
            .in("slug", HEALTH_SLUGS);

          const ids = (metrics ?? []).map((m) => m.id);
          const { data: values } = ids.length
            ? await supabaseAdmin
                .from("financial_metric_values")
                .select("metric_id, value_numeric, as_of, freshness, confidence")
                .in("metric_id", ids)
                .order("as_of", { ascending: false })
            : { data: [] };

          const latest = new Map<string, unknown>();
          for (const v of values ?? []) {
            const key = (v as { metric_id: string }).metric_id;
            if (!latest.has(key)) latest.set(key, v);
          }

          return readResponse({
            org_id: client.orgId,
            consumer: client.consumerSlug,
            drivers: (metrics ?? []).map((m) => ({
              slug: m.slug,
              name: m.name,
              latest: latest.get(m.id) ?? null,
            })),
          });
        } catch (err) {
          return readErrorResponse(err);
        }
      },
    },
  },
});
