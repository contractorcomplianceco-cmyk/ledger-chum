import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listExplanations } from "@/lib/intelligence/services.functions";
import { useOrgId } from "@/hooks/use-current-org";
import type { IntelligenceEnvelope, IntelligenceItem } from "./types";

/**
 * explanationAdapter — normalizes intelligence_explanations (the AI advisory
 * log) into IntelligenceItems. Append-only at the DB level.
 */
export function useExplanationAdapter(options?: {
  subject_type?: "metric" | "anomaly" | "recommendation" | "question" | "all";
  subject_key?: string;
  limit?: number;
}): IntelligenceEnvelope<IntelligenceItem[]> {
  const orgId = useOrgId();
  const fn = useServerFn(listExplanations);
  const query = useQuery({
    queryKey: ["intelligence", "explanations", orgId, options],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await fn({
          data: {
            orgId: orgId!,
            subject_type: options?.subject_type ?? "all",
            subject_key: options?.subject_key,
            limit: options?.limit ?? 50,
          },
        });
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });

  if (!orgId) return { data: [], isDemo: true, loading: false };

  const items: IntelligenceItem[] = (query.data ?? []).map((e) => ({
    id: e.id,
    kind: "explanation",
    title: e.question ?? `${e.subject_type}: ${e.subject_key}`,
    summary: e.answer,
    sourceMetricKey: e.subject_type === "metric" ? e.subject_key : e.supporting_metric_keys?.[0],
    evidence: Array.isArray(e.evidence)
      ? (e.evidence as unknown[]).slice(0, 6).map((v, i) => ({
          label:
            typeof v === "object" && v && "label" in v
              ? String((v as { label: unknown }).label)
              : `Evidence ${i + 1}`,
        }))
      : [],
    confidence: Number(e.confidence ?? 0),
    freshness: (e.freshness ?? "fresh") as IntelligenceItem["freshness"],
    assumptions: (e.assumptions as string[]) ?? [],
    missingData: (e.missing_data as string[]) ?? [],
    recommendedAction: e.recommended_action ?? undefined,
    approvalRequirement: e.approval_requirement ?? undefined,
    demonstrationOnly: e.demonstration_only ?? false,
    severity: "info",
    category: e.subject_type,
    createdAt: e.created_at,
  }));

  return { data: items, isDemo: false, loading: query.isLoading };
}
