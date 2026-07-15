import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRecommendations } from "@/lib/intelligence/services.functions";
import { useOrgId } from "@/hooks/use-current-org";
import type { IntelligenceEnvelope, IntelligenceItem } from "./types";

/**
 * recommendationAdapter — normalizes financial_recommendations rows into
 * IntelligenceItems. AI-generated; users may only change state
 * (accept / dismiss / convert). Never used to post accounting actions.
 */
export function useRecommendationAdapter(options?: {
  persona?: "controller" | "close_assistant" | "accountant_assistant" | "all";
  state?:
    | "generated"
    | "needs_review"
    | "accepted"
    | "dismissed"
    | "converted_to_task"
    | "converted_to_draft"
    | "approved_for_action"
    | "completed"
    | "outcome_measured"
    | "all";
  limit?: number;
}): IntelligenceEnvelope<IntelligenceItem[]> {
  const orgId = useOrgId();
  const fn = useServerFn(listRecommendations);
  const query = useQuery({
    queryKey: ["intelligence", "recommendations", orgId, options],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await fn({
          data: {
            orgId: orgId!,
            state: options?.state ?? "all",
            persona: options?.persona ?? "all",
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

  const items: IntelligenceItem[] = (query.data ?? []).map((r) => ({
    id: r.id,
    kind: "recommendation",
    title: r.title,
    summary: r.narrative ?? r.title,
    sourceMetricKey: r.supporting_metric_keys?.[0] ?? undefined,
    evidence: Array.isArray(r.evidence)
      ? (r.evidence as unknown[]).slice(0, 6).map((e, i) => ({
          label:
            typeof e === "object" && e && "label" in e
              ? String((e as { label: unknown }).label)
              : `Evidence ${i + 1}`,
        }))
      : [],
    confidence: Number(r.confidence ?? 0),
    freshness: (r.freshness ?? "fresh") as IntelligenceItem["freshness"],
    assumptions: (r.assumptions as string[]) ?? [],
    missingData: (r.missing_data as string[]) ?? [],
    recommendedAction: r.recommended_action ?? undefined,
    approvalRequirement: r.approval_requirement ?? undefined,
    demonstrationOnly: r.demonstration_only ?? false,
    severity: "info",
    category: r.persona ?? "recommendation",
    createdAt: r.created_at,
  }));

  return { data: items, isDemo: false, loading: query.isLoading };
}
