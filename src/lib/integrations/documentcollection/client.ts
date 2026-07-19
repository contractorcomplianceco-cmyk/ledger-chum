import { IntegrationHttpClient, type IntegrationClientConfig } from "../shared/http-client";
import { resolveServiceConfig } from "../shared/config";
import {
  DocsCollectExportRequestListSchema,
  DocsCollectExportRequestSchema,
  type DocsCollectExportRequest,
  type DocsCollectExportRequestList,
} from "./schemas";

/**
 * DocumentCollectionOS client — reads the docs-collect export facts feed.
 *
 * Endpoints (Document-Collection/.../routes/docsCollectExport.ts):
 *   GET /export/docs-collect/v1/requests?limit&updated_since&cursor
 *   GET /export/docs-collect/v1/requests/:requestId
 * Auth: Bearer export token (DOCS_COLLECT_EXPORT_TOKEN).
 */

export const DOCUMENTCOLLECTION_ENV = {
  service: "documentcollection",
  baseUrlVar: "DOCUMENTCOLLECTION_BASE_URL",
  apiKeyVar: "DOCUMENTCOLLECTION_EXPORT_TOKEN",
} as const;

export class DocumentCollectionClient {
  private readonly http: IntegrationHttpClient;

  constructor(config: Omit<IntegrationClientConfig, "service">) {
    this.http = new IntegrationHttpClient({
      service: DOCUMENTCOLLECTION_ENV.service,
      ...config,
    });
  }

  /** Paginated export feed. Use `updatedSince`/`cursor` for incremental sync. */
  listRequests(
    opts: { limit?: number; updatedSince?: string; cursor?: string } = {},
  ): Promise<DocsCollectExportRequestList> {
    return this.http.request({
      method: "GET",
      path: "/export/docs-collect/v1/requests",
      query: {
        limit: opts.limit,
        updated_since: opts.updatedSince,
        cursor: opts.cursor,
      },
      schema: DocsCollectExportRequestListSchema,
    });
  }

  /** Single export fact by request id. */
  getRequest(requestId: string): Promise<DocsCollectExportRequest> {
    return this.http.request({
      method: "GET",
      path: `/export/docs-collect/v1/requests/${encodeURIComponent(requestId)}`,
      schema: DocsCollectExportRequestSchema,
    });
  }

  /** Convenience: iterate all pages from an optional watermark. */
  async *iterateRequests(opts: { updatedSince?: string; limit?: number } = {}) {
    let cursor: string | undefined;
    do {
      const page = await this.listRequests({ ...opts, cursor });
      for (const item of page.items) yield item;
      cursor = page.next_cursor ?? undefined;
    } while (cursor);
  }
}

export function createDocumentCollectionClient(
  overrides: Partial<IntegrationClientConfig> = {},
): DocumentCollectionClient {
  const cfg = resolveServiceConfig(DOCUMENTCOLLECTION_ENV);
  return new DocumentCollectionClient({
    baseUrl: overrides.baseUrl ?? cfg.baseUrl,
    apiKey: overrides.apiKey ?? cfg.apiKey,
    ...overrides,
  });
}
