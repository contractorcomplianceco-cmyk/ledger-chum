import { IntegrationHttpClient, type IntegrationClientConfig } from "../shared/http-client";
import { resolveServiceConfig } from "../shared/config";
import {
  ComplianceScoreResponseSchema,
  MonitoringIngestResponseSchema,
  type ComplianceScoreResponse,
  type MonitoringIngestBody,
  type MonitoringIngestResponse,
} from "./schemas";

/**
 * ComplianceConnectOS client — read approved compliance posture, and (staff
 * scope) push monitoring touch-point facts.
 *
 * Endpoints (Client-Portal/.../routes):
 *   GET  /compliance/score?locationId            (approved score view)
 *   POST /admin/monitoring/ingest/:locationId    (staff batch upsert)
 */

export const COMPLIANCECONNECT_ENV = {
  service: "complianceconnect",
  baseUrlVar: "COMPLIANCECONNECT_BASE_URL",
  apiKeyVar: "COMPLIANCECONNECT_API_KEY",
} as const;

export class ComplianceConnectClient {
  private readonly http: IntegrationHttpClient;

  constructor(config: Omit<IntegrationClientConfig, "service">) {
    this.http = new IntegrationHttpClient({
      service: COMPLIANCECONNECT_ENV.service,
      ...config,
    });
  }

  /** Approved compliance score for a location (or latest for the org). */
  getComplianceScore(opts: { locationId?: string } = {}): Promise<ComplianceScoreResponse> {
    return this.http.request({
      method: "GET",
      path: "/compliance/score",
      query: { locationId: opts.locationId },
      schema: ComplianceScoreResponseSchema,
    });
  }

  /**
   * Staff-scope monitoring ingest. Write path — requires an idempotency key so
   * a retried batch upsert stays safe.
   */
  ingestMonitoring(
    locationId: string,
    body: MonitoringIngestBody,
    idempotencyKey: string,
  ): Promise<MonitoringIngestResponse> {
    return this.http.request({
      method: "POST",
      path: `/admin/monitoring/ingest/${encodeURIComponent(locationId)}`,
      body,
      idempotencyKey,
      schema: MonitoringIngestResponseSchema,
    });
  }
}

export function createComplianceConnectClient(
  overrides: Partial<IntegrationClientConfig> = {},
): ComplianceConnectClient {
  const cfg = resolveServiceConfig(COMPLIANCECONNECT_ENV);
  return new ComplianceConnectClient({
    baseUrl: overrides.baseUrl ?? cfg.baseUrl,
    apiKey: overrides.apiKey ?? cfg.apiKey,
    ...overrides,
  });
}
