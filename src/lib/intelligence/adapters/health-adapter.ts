import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFinancialHealthScore } from "@/lib/intelligence/services.functions";
import { useOrgId } from "@/hooks/use-current-org";
import type { IntelligenceEnvelope, IntelligenceItem } from "./types";

/**
 * healthAdapter — surfaces the composite Financial Health Score as an
 * IntelligenceItem. Advisory-only; never used to gate accounting actions.
 */
export function useHealthAdapter(): IntelligenceEnvelope<IntelligenceItem | null> {
  const orgId = useOrgId();
  const fn = useServerFn(getFinancialHealthScore);
  const query = useQuery({
    queryKey: ["intelligence", "health", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await fn({ data: { orgId: orgId! } });
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  if (!orgId || !query.data) {
    return {
      data: {
        id: "demo-health",
        kind: "health",
        title: "Financial Health Score",
        summary: "Demonstration score — connect an org to see live drivers.",
        displayValue: "—",
        numericValue: null,
        evidence: [],
        confidence: 0.3,
        freshness: "unavailable",
        assumptions: ["Composite of six canonical drivers."],
        missingData: ["No live metrics available."],
        demonstrationOnly: true,
        category: "company_health",
      },
      isDemo: true,
      loading: query.isLoading,
    };
  }

  const h = query.data;
  const item: IntelligenceItem = {
    id: "health-score",
    kind: "health",
    title: "Financial Health Score",
    summary: `Weighted composite across ${h.evidence.length} canonical drivers.`,
    displayValue: `${h.score}`,
    numericValue: h.score,
    evidence: h.evidence.map((e) => ({
      label: e.metric_key,
      value: `${e.score} · w${e.weight}`,
      ref: e.freshness,
    })),
    confidence: h.confidence,
    freshness: (h.freshness ?? "delayed") as IntelligenceItem["freshness"],
    assumptions: h.assumptions ?? [],
    missingData: h.missing_data ?? [],
    demonstrationOnly: false,
    category: "company_health",
  };
  return { data: item, isDemo: false, loading: query.isLoading };
}
