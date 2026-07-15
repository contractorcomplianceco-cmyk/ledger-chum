import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAnomalies } from "@/lib/intelligence/services.functions";
import { useOrgId } from "@/hooks/use-current-org";
import type { IntelligenceEnvelope, IntelligenceItem } from "./types";

/**
 * anomalyAdapter — normalizes financial_anomalies rows into IntelligenceItems.
 * APEX must consume anomalies via this adapter; direct DB reads are forbidden.
 */
export function useAnomalyAdapter(options?: {
  status?: "open" | "acknowledged" | "dismissed" | "resolved" | "all";
  severity?: "low" | "medium" | "high" | "critical" | "all";
  limit?: number;
}): IntelligenceEnvelope<IntelligenceItem[]> {
  const orgId = useOrgId();
  const fn = useServerFn(listAnomalies);
  const query = useQuery({
    queryKey: ["intelligence", "anomalies", orgId, options],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await fn({
          data: {
            orgId: orgId!,
            status: options?.status ?? "open",
            severity: options?.severity ?? "all",
            limit: options?.limit ?? 100,
          },
        });
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });

  if (!orgId) return { data: [], isDemo: true, loading: false };

  const items: IntelligenceItem[] = (query.data ?? []).map((a) => {
    const evidence = Array.isArray(a.evidence)
      ? (a.evidence as unknown[]).slice(0, 6).map((e, i) => ({
          label:
            typeof e === "object" && e && "label" in e
              ? String((e as { label: unknown }).label)
              : `Evidence ${i + 1}`,
          ref:
            typeof e === "object" && e && "ref" in e
              ? String((e as { ref: unknown }).ref)
              : undefined,
        }))
      : [];
    return {
      id: a.id,
      kind: "anomaly",
      title: a.title,
      summary: a.narrative ?? a.title,
      sourceMetricKey: a.metric_key ?? undefined,
      evidence,
      confidence: Number(a.confidence ?? 0),
      freshness: (a.freshness ?? "fresh") as IntelligenceItem["freshness"],
      assumptions: (a.assumptions as string[]) ?? [],
      missingData: (a.missing_data as string[]) ?? [],
      recommendedAction: a.recommended_action ?? undefined,
      approvalRequirement: a.approval_requirement ?? undefined,
      demonstrationOnly: a.demonstration_only ?? false,
      severity: (a.severity ?? "info") as IntelligenceItem["severity"],
      category: a.detector ?? "anomaly",
      createdAt: a.created_at,
    };
  });
  return { data: items, isDemo: false, loading: query.isLoading };
}
