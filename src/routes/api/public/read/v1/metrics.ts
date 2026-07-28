import { createFileRoute } from "@tanstack/react-router";
import {
  verifyReadClient,
  requireReadScope,
  readResponse,
  readErrorResponse,
} from "@/integrations/ledgeros-read-api/verify.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/read/v1/metrics")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const client = await verifyReadClient(request);
          requireReadScope(client, "read.metrics");

          const url = new URL(request.url);
          const slug = url.searchParams.get("slug");

          let query = supabaseAdmin
            .from("financial_metrics")
            .select("id, slug, name, category, status, refresh_frequency, description")
            .eq("org_id", client.orgId)
            .eq("status", "active")
            .order("category");
          if (slug) query = query.eq("slug", slug);
          const { data: metrics, error } = await query;
          if (error) throw new Error(error.message);

          const metricIds = (metrics ?? []).map((m) => m.id);
          const { data: values } = metricIds.length
            ? await supabaseAdmin
                .from("financial_metric_values")
                .select("metric_id, value_numeric, value_json, as_of, computed_at, freshness, confidence")
                .in("metric_id", metricIds)
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
            count: metrics?.length ?? 0,
            metrics: (metrics ?? []).map((m) => ({
              slug: m.slug,
              name: m.name,
              category: m.category,
              refresh_frequency: m.refresh_frequency,
              description: m.description,
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
