import { IntegrationHttpClient, type IntegrationClientConfig } from "../shared/http-client";
import { resolveServiceConfig } from "../shared/config";
import {
  ListCertificationsResponseSchema,
  ListCrmActivitiesResponseSchema,
  ListLibraryResourcesResponseSchema,
  type ListCertificationsResponse,
  type ListCrmActivitiesResponse,
  type ListLibraryResourcesResponse,
} from "./schemas";

/**
 * SalesCoreOS client — reads sales-enablement content and (manager scope) CRM
 * activity from the CCA Sales Intelligence platform.
 *
 * Endpoints (CCA-SalesIntelligenceOS/.../routes/cca.ts, under /cca):
 *   GET /cca/library
 *   GET /cca/certifications
 *   GET /cca/crm/activities   (manager/admin)
 * Auth: Bearer session (requireAuth).
 */

export const SALESCORE_ENV = {
  service: "salescore",
  baseUrlVar: "SALESCORE_BASE_URL",
  apiKeyVar: "SALESCORE_API_KEY",
} as const;

export class SalesCoreClient {
  private readonly http: IntegrationHttpClient;

  constructor(config: Omit<IntegrationClientConfig, "service">) {
    this.http = new IntegrationHttpClient({
      service: SALESCORE_ENV.service,
      ...config,
    });
  }

  listLibraryResources(): Promise<ListLibraryResourcesResponse> {
    return this.http.request({
      method: "GET",
      path: "/cca/library",
      schema: ListLibraryResourcesResponseSchema,
    });
  }

  listCertifications(): Promise<ListCertificationsResponse> {
    return this.http.request({
      method: "GET",
      path: "/cca/certifications",
      schema: ListCertificationsResponseSchema,
    });
  }

  listCrmActivities(): Promise<ListCrmActivitiesResponse> {
    return this.http.request({
      method: "GET",
      path: "/cca/crm/activities",
      schema: ListCrmActivitiesResponseSchema,
    });
  }
}

export function createSalesCoreClient(
  overrides: Partial<IntegrationClientConfig> = {},
): SalesCoreClient {
  const cfg = resolveServiceConfig(SALESCORE_ENV);
  return new SalesCoreClient({
    baseUrl: overrides.baseUrl ?? cfg.baseUrl,
    apiKey: overrides.apiKey ?? cfg.apiKey,
    ...overrides,
  });
}
