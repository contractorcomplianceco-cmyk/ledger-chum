import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCloseCompletionScore } from "@/lib/intelligence/services.functions";
import { useOrgId } from "@/hooks/use-current-org";
import type { IntelligenceEnvelope, IntelligenceItem } from "./types";

/**
 * closeAdapter — surfaces the current close-run completion score. The close
 * workflow remains the source of truth; this is advisory.
 */
export function useCloseAdapter(): IntelligenceEnvelope<IntelligenceItem | null> {
  const orgId = useOrgId();
  const fn = useServerFn(getCloseCompletionScore);
  const query = useQuery({
    queryKey: ["intelligence", "close", orgId],
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
        id: "demo-close",
        kind: "close",
        title: "Close Completion",
        summary: "Demonstration close-run — no live data.",
        displayValue: "—",
        evidence: [],
        confidence: 0.2,
        freshness: "unavailable",
        assumptions: [],
        missingData: ["No live close run."],
        demonstrationOnly: true,
        category: "close",
      },
      isDemo: true,
      loading: query.isLoading,
    };
  }

  const c = query.data;
  const item: IntelligenceItem = {
    id: "close-score",
    kind: "close",
    title: "Close Completion",
    summary: "% of tasks completed on the current close run.",
    displayValue: `${c.score}%`,
    numericValue: c.score,
    evidence: c.evidence.map((e) => ({
      label: "Close run",
      value: `${e.completed_tasks}/${e.total_tasks} tasks`,
      ref: e.run_id,
    })),
    confidence: c.confidence,
    freshness: c.freshness as IntelligenceItem["freshness"],
    assumptions: c.assumptions ?? [],
    missingData: c.missing_data ?? [],
    demonstrationOnly: false,
    category: "close",
  };
  return { data: item, isDemo: false, loading: query.isLoading };
}
