import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMetricAiResponse } from "@/lib/intelligence/metrics.functions";
import { useOrgId } from "@/hooks/use-current-org";
import type { IntelligenceEnvelope, IntelligenceItem } from "./types";

/**
 * metricsAdapter
 *
 * Fetches a canonical metric's AI-ready envelope from the intelligence
 * services layer and normalizes it into an IntelligenceItem. When no org
 * context is available the adapter falls back to a demonstration envelope
 * so APEX cards keep rendering without leaking accounting internals.
 */

function fmtCurrency(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPercent(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

const CURRENCY_KEYS = new Set([
  "true_available_cash",
  "restricted_cash",
  "committed_cash",
  "cash_forecast_7d",
  "cash_forecast_30d",
  "revenue",
  "cogs",
  "gross_profit",
  "net_income",
  "working_capital",
  "ar_balance",
  "ap_balance",
]);

const PERCENT_KEYS = new Set(["gross_margin", "operating_margin", "net_margin"]);

function formatMetric(key: string, value: number | null | undefined): string {
  if (value == null) return "—";
  if (CURRENCY_KEYS.has(key)) return fmtCurrency(value);
  if (PERCENT_KEYS.has(key)) return fmtPercent(value);
  return new Intl.NumberFormat("en-US").format(value);
}

export function useMetricAdapter(
  metricKey: string,
  fallback?: Partial<IntelligenceItem>,
): IntelligenceEnvelope<IntelligenceItem | null> {
  const orgId = useOrgId();
  const fn = useServerFn(getMetricAiResponse);

  const query = useQuery({
    queryKey: ["intelligence", "metric", orgId, metricKey],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await fn({ data: { orgId: orgId!, metricKey } });
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  if (!orgId || !query.data) {
    const demo: IntelligenceItem = {
      id: `demo-metric-${metricKey}`,
      kind: "metric",
      title: fallback?.title ?? metricKey,
      summary: fallback?.summary ?? "Demonstration value — no live metric available.",
      displayValue: fallback?.displayValue,
      numericValue: fallback?.numericValue ?? null,
      sourceMetricKey: metricKey,
      evidence: fallback?.evidence ?? [],
      confidence: fallback?.confidence ?? 0.3,
      freshness: "unavailable",
      assumptions: fallback?.assumptions ?? ["No live metric value; using demonstration data."],
      missingData: fallback?.missingData ?? ["Live metric not yet calculated for this org."],
      recommendedAction: fallback?.recommendedAction,
      approvalRequirement: fallback?.approvalRequirement,
      demonstrationOnly: true,
      category: fallback?.category ?? "metric",
    };
    return { data: demo, isDemo: true, loading: query.isLoading };
  }

  const r = query.data;
  const item: IntelligenceItem = {
    id: r.metric.id,
    kind: "metric",
    title: r.metric.metric_name,
    summary: r.metric.description,
    displayValue: formatMetric(r.metric.metric_key, r.value?.value ?? null),
    numericValue: r.value?.value ?? null,
    sourceMetricKey: r.metric.metric_key,
    evidence: (r.evidence ?? []).slice(0, 6).map((e) => ({
      label: e.transformation_description || e.source_table || "Source",
      ref: e.source_field ?? undefined,
    })),
    confidence: r.confidence.score,
    freshness: (r.freshness ?? "unavailable") as IntelligenceItem["freshness"],
    assumptions: r.assumptions ?? [],
    missingData: r.missing_data ?? [],
    demonstrationOnly: r.demonstration_only,
    category: r.metric.category,
  };
  return { data: item, isDemo: false, loading: query.isLoading };
}
