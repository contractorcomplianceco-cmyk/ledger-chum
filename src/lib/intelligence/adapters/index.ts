/**
 * M9C — APEX Data Activation Adapters
 *
 * The single, sanctioned data path between LedgerOS intelligence services
 * and the APEX presentation layer. APEX components MUST import from this
 * module (or its siblings) and MUST NOT reach for accounting tables,
 * Supabase clients, or metric functions directly.
 *
 * Every adapter returns an IntelligenceEnvelope carrying an IntelligenceItem
 * with the mandatory AI response contract:
 *   value · evidence · confidence · freshness · assumptions · missing data ·
 *   recommended action · approval requirement · demonstration flag.
 *
 * Permission scoping is applied by consumers via `filterByAudience`; adapters
 * themselves stay data-shaped so they can be composed inside any workspace.
 */

export * from "./types";
export { useMetricAdapter } from "./metrics-adapter";
export { useAnomalyAdapter } from "./anomaly-adapter";
export { useRecommendationAdapter } from "./recommendation-adapter";
export { useExplanationAdapter } from "./explanation-adapter";
export { useHealthAdapter } from "./health-adapter";
export { useCloseAdapter } from "./close-adapter";

import type { ApexAudience, IntelligenceItem } from "./types";

/**
 * Permission-scoped intelligence filter used by APEX role workspaces.
 *
 *  Owner       → everything (governance-wide view)
 *  Accounting  → close, anomalies, recommendations for controller / close /
 *                accountant personas
 *  Sales       → revenue-tagged metrics + revenue-category recommendations
 *  Systems     → integration / data-freshness signals
 *  Team        → non-sensitive items only
 */
export function filterByAudience(
  items: IntelligenceItem[],
  audience: ApexAudience,
): IntelligenceItem[] {
  switch (audience) {
    case "owner":
      return items;
    case "accounting":
      return items.filter(
        (i) =>
          i.kind === "close" ||
          i.kind === "anomaly" ||
          (i.kind === "recommendation" &&
            ["controller", "close_assistant", "accountant_assistant"].includes(
              i.category ?? "",
            )) ||
          i.category === "close" ||
          i.category === "ar" ||
          i.category === "ap",
      );
    case "sales":
      return items.filter(
        (i) => i.category === "revenue" || i.category === "growth" || i.category === "ar",
      );
    case "systems":
      return items.filter(
        (i) => i.category === "operations" || i.category === "technology" || i.freshness !== "fresh",
      );
    case "team":
      return items.filter((i) => i.kind !== "health" && i.kind !== "close");
    default:
      return items;
  }
}
