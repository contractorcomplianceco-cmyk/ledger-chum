/**
 * M9C — APEX Data Activation Layer
 *
 * Normalized envelope every APEX-consumable adapter returns. APEX components
 * MUST consume these envelopes and MUST NOT query accounting tables or raw
 * Supabase directly. Every intelligence item carries evidence + confidence +
 * freshness so the UI can render the mandatory AI response contract.
 */

export type IntelligenceFreshness = "fresh" | "delayed" | "stale" | "unavailable";

export type IntelligenceKind =
  | "metric"
  | "anomaly"
  | "recommendation"
  | "explanation"
  | "health"
  | "close";

export interface IntelligenceEvidence {
  label: string;
  ref?: string;
  value?: string | number;
}

export interface IntelligenceItem {
  id: string;
  kind: IntelligenceKind;
  title: string;
  summary: string;
  /** Rendered value (formatted). Adapters format at the edge. */
  displayValue?: string;
  /** Raw numeric where relevant. */
  numericValue?: number | null;
  sourceMetricKey?: string;
  evidence: IntelligenceEvidence[];
  confidence: number; // 0..1
  freshness: IntelligenceFreshness;
  assumptions: string[];
  missingData: string[];
  recommendedAction?: string;
  approvalRequirement?: string;
  /** True when this item is served from local demo data (no org/session). */
  demonstrationOnly: boolean;
  /** For filtering the unified feed. */
  severity?: "info" | "low" | "medium" | "high" | "critical";
  category?: string;
  createdAt?: string;
}

export interface IntelligenceEnvelope<T> {
  data: T;
  isDemo: boolean;
  loading: boolean;
  error?: string;
}

/**
 * The permission-scoped roles APEX role workspaces consume. Enforced at the
 * adapter boundary (adapters filter items by permission before returning).
 */
export type ApexAudience = "owner" | "accounting" | "sales" | "systems" | "team";
