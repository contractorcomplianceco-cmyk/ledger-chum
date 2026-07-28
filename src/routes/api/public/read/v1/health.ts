import { createFileRoute } from "@tanstack/react-router";
import {
  verifyReadClient,
  requireReadScope,
  readResponse,
  readErrorResponse,
} from "@/integrations/ledgeros-read-api/verify.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type MetricRow = { id: string; metric_key: string; metric_name: string };
type ValueRow = {
  metric_id: string;
  value: number | null;
  period_end: string | null;
  freshness_status: string | null;
  confidence_score: number | null;
};

const HEALTH_KEYS = [
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

          const { data: mData } = await supabaseAdmin
            .from("financial_metrics")
            .select("id, metric_key, metric_name")
            .eq("org_id", client.orgId)
            .in("metric_key", HEALTH_KEYS);
          const metrics = (mData ?? []) as unknown as MetricRow[];

          const ids = metrics.map((m) => m.id);
          const { data: vData } = ids.length
            ? await supabaseAdmin
                .from("financial_metric_values")
                .select("metric_id, value, period_end, freshness_status, confidence_score")
                .in("metric_id", ids)
                .order("calculation_timestamp", { ascending: false })
            : { data: [] };
          const values = (vData ?? []) as unknown as ValueRow[];

          const latest = new Map<string, ValueRow>();
          for (const v of values) if (!latest.has(v.metric_id)) latest.set(v.metric_id, v);

          return readResponse({
            org_id: client.orgId,
            consumer: client.consumerSlug,
            drivers: metrics.map((m) => ({
              key: m.metric_key,
              name: m.metric_name,
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
