import { createFileRoute } from "@tanstack/react-router";
import {
  verifyReadClient,
  requireReadScope,
  readResponse,
  readErrorResponse,
} from "@/integrations/ledgeros-read-api/verify.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type MetricRow = {
  id: string;
  metric_key: string;
  metric_name: string;
  category: string;
  refresh_frequency: string | null;
  description: string | null;
};
type ValueRow = {
  metric_id: string;
  value: number | null;
  value_json: unknown;
  period_end: string | null;
  calculation_timestamp: string | null;
  freshness_status: string | null;
  confidence_score: number | null;
};

export const Route = createFileRoute("/api/public/read/v1/metrics")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const client = await verifyReadClient(request);
          requireReadScope(client, "read.metrics");

          const url = new URL(request.url);
          const key = url.searchParams.get("key");

          let mq = supabaseAdmin
            .from("financial_metrics")
            .select("id, metric_key, metric_name, category, refresh_frequency, description")
            .eq("org_id", client.orgId)
            .eq("status", "active")
            .order("category");
          if (key) mq = mq.eq("metric_key", key);
          const { data: metricsData, error } = await mq;
          if (error) throw new Error(error.message);
          const metrics = (metricsData ?? []) as unknown as MetricRow[];

          const ids = metrics.map((m) => m.id);
          const { data: valuesData } = ids.length
            ? await supabaseAdmin
                .from("financial_metric_values")
                .select("metric_id, value, value_json, period_end, calculation_timestamp, freshness_status, confidence_score")
                .in("metric_id", ids)
                .order("calculation_timestamp", { ascending: false })
            : { data: [] };
          const values = (valuesData ?? []) as unknown as ValueRow[];

          const latest = new Map<string, ValueRow>();
          for (const v of values) if (!latest.has(v.metric_id)) latest.set(v.metric_id, v);

          return readResponse({
            org_id: client.orgId,
            consumer: client.consumerSlug,
            count: metrics.length,
            metrics: metrics.map((m) => ({
              key: m.metric_key,
              name: m.metric_name,
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
