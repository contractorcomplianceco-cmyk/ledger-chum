/**
 * M9A — Canonical Financial Metrics Layer
 *
 * Shared contract types for the metric registry. APEX / reports / AI must
 * consume metric values through this contract — never by querying accounting
 * tables directly.
 */

export type MetricCategory =
  | "cash"
  | "revenue"
  | "profitability"
  | "ar"
  | "ap"
  | "expenses"
  | "banking"
  | "growth"
  | "operations"
  | "people"
  | "compensation"
  | "technology"
  | "risk"
  | "company_health";

export type MetricStatus = "draft" | "active" | "deprecated";

export type MetricFreshness = "fresh" | "delayed" | "stale" | "unavailable";

export type MetricRefreshFrequency =
  | "realtime"
  | "minutely"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "on_demand";

export type MetricSourceType =
  | "table"
  | "view"
  | "rpc"
  | "derived"
  | "external";

export interface FinancialMetric {
  id: string;
  org_id: string;
  metric_key: string;
  metric_name: string;
  category: MetricCategory;
  description: string;
  formula_definition: string;
  calculation_method: string;
  owner_role: string;
  refresh_frequency: MetricRefreshFrequency;
  status: MetricStatus;
  required_permission: string | null;
  is_sensitive: boolean;
  confidence_rule: string | null;
  demonstration_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetricValue {
  id: string;
  metric_id: string;
  value: number | null;
  value_json: unknown;
  period_start: string | null;
  period_end: string | null;
  calculation_timestamp: string;
  confidence_score: number;
  freshness_status: MetricFreshness;
  source_count: number;
  assumptions: string[];
  missing_data: string[];
  notes: string | null;
}

export interface MetricLineage {
  id: string;
  metric_id: string;
  source_type: MetricSourceType;
  source_table: string | null;
  source_field: string | null;
  transformation_description: string;
  dependency_metric_key: string | null;
}

export interface MetricDependency {
  metric_key: string;
  depends_on: string[];
}

export interface MetricConfidence {
  score: number; // 0..1
  rationale: string;
}

/**
 * AI-ready contract. Every metric response returned to intelligence
 * consumers MUST include these fields.
 */
export interface MetricAiResponse {
  metric: FinancialMetric;
  value: MetricValue | null;
  formula: string;
  evidence: MetricLineage[];
  confidence: MetricConfidence;
  freshness: MetricFreshness;
  assumptions: string[];
  missing_data: string[];
  demonstration_only: boolean;
}
