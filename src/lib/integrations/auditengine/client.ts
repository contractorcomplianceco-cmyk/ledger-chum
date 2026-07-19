import { IntegrationHttpClient, type IntegrationClientConfig } from "../shared/http-client";
import { resolveServiceConfig } from "../shared/config";
import {
  CcaRfLibraryResponseSchema,
  JurisdictionRulesResponseSchema,
  PublicTrustReportSchema,
  SafeReferenceSchema,
  type CcaRfLibraryResponse,
  type JurisdictionRulesResponse,
  type PublicTrustReport,
  type SafeReference,
} from "./schemas";

/**
 * AuditEngine client — LedgerOS reads governed, published knowledge ONLY.
 *
 * Never writes: AuditEngine is the governed source of truth. LedgerOS
 * registers as a read-only Application Connection (service identity + scoped
 * key) and pins the knowledge version it consumed for reproducibility.
 *
 * Contract note: the platform brief references a versioned Public Snapshot API
 * (`/public-snapshot`, `/v1/snapshots/current`). Those routes are NOT present
 * in the current Audit-Risk-Model server; the live governed-read surface is
 * `/reference`, `/cca-rf-library`, `/jurisdiction-rules` (human_approved) and
 * `/public/trust-reports/:slug`. Snapshot pinning is therefore modeled
 * client-side over those real endpoints (see `pinnedSnapshot`).
 */

export const AUDITENGINE_ENV = {
  service: "auditengine",
  baseUrlVar: "AUDITENGINE_BASE_URL",
  apiKeyVar: "AUDITENGINE_API_KEY",
} as const;

export interface AuditEngineConsumerRegistration {
  consumer: "ledgeros";
  mode: "read-only";
  /** Snapshot label / version the consumer has pinned, or "latest". */
  pinnedSnapshot: string;
  registeredAt: string;
}

export class AuditEngineClient {
  private readonly http: IntegrationHttpClient;
  private pinnedSnapshot = "latest";

  constructor(config: Omit<IntegrationClientConfig, "service">) {
    this.http = new IntegrationHttpClient({
      service: AUDITENGINE_ENV.service,
      ...config,
      defaultHeaders: {
        "x-cca-consumer": "ledgeros",
        ...config.defaultHeaders,
      },
    });
  }

  /**
   * Register LedgerOS as a read-only consumer and pin a knowledge version.
   * Pinning is local (no write to AuditEngine); "latest" follows published.
   */
  registerConsumer(snapshotLabel = "latest"): AuditEngineConsumerRegistration {
    this.pinnedSnapshot = snapshotLabel;
    return {
      consumer: "ledgeros",
      mode: "read-only",
      pinnedSnapshot: this.pinnedSnapshot,
      registeredAt: new Date().toISOString(),
    };
  }

  get snapshotPin(): string {
    return this.pinnedSnapshot;
  }

  /** Safe, weight-free reference/governance metadata. */
  getReference(): Promise<SafeReference> {
    return this.http.request({
      method: "GET",
      path: "/reference",
      schema: SafeReferenceSchema,
    });
  }

  /** Active CCA risk-factor library (approved knowledge index). */
  getCcaRfLibrary(): Promise<CcaRfLibraryResponse> {
    return this.http.request({
      method: "GET",
      path: "/cca-rf-library",
      schema: CcaRfLibraryResponseSchema,
    });
  }

  /**
   * Approved + Published jurisdiction rules. Read-only consumers always pull
   * `human_approved=true` so trade-secret/unapproved rows never reach LedgerOS.
   */
  listApprovedJurisdictionRules(
    opts: {
      state?: string;
      limit?: number;
    } = {},
  ): Promise<JurisdictionRulesResponse> {
    return this.http.request({
      method: "GET",
      path: "/jurisdiction-rules",
      query: {
        state: opts.state,
        limit: opts.limit,
        human_approved: "true",
      },
      schema: JurisdictionRulesResponseSchema,
    });
  }

  /** Public, share-slug-gated published Trust Report (no auth required). */
  getPublicTrustReport(slug: string): Promise<PublicTrustReport> {
    return this.http.request({
      method: "GET",
      path: `/public/trust-reports/${encodeURIComponent(slug)}`,
      schema: PublicTrustReportSchema,
    });
  }
}

/** Build a client from environment config (server-only). */
export function createAuditEngineClient(
  overrides: Partial<IntegrationClientConfig> = {},
): AuditEngineClient {
  const cfg = resolveServiceConfig(AUDITENGINE_ENV);
  return new AuditEngineClient({
    baseUrl: overrides.baseUrl ?? cfg.baseUrl,
    apiKey: overrides.apiKey ?? cfg.apiKey,
    ...overrides,
  });
}
