import { apiConfig, isMockMode } from "./config";
import type { CommissionsService } from "./services/commissions";
import type { AdminService } from "./services/admin";
import type { IntegrationsService } from "./services/integrations";
import type { IntelligenceService } from "./services/intelligence";
import type { CompensationService, CompensationOperationsService } from "./services/compensation";
import { mockCommissions } from "./services/commissions";
import { mockAdmin } from "./services/admin";
import { mockIntegrations } from "./services/integrations";
import { mockIntelligence } from "./services/intelligence";
import { compensationService, compensationOperationsService } from "./services/compensation";
import { expressCommissions } from "./adapters/express-adapter";

export interface LedgerOSApi {
  mode: "mock" | "production";
  commissions: CommissionsService;
  compensation: CompensationService;
  compensationOps: CompensationOperationsService;
  admin: AdminService;
  integrations: IntegrationsService;
  intelligence: IntelligenceService;
}

/**
 * Central API client. UI code imports `api` and calls typed services.
 * Adapter selection happens once at module load based on VITE_LEDGEROS_API_MODE.
 */
export const api: LedgerOSApi = isMockMode()
  ? {
      mode: "mock",
      commissions: mockCommissions,
      compensation: compensationService,
      compensationOps: compensationOperationsService,
      admin: mockAdmin,
      integrations: mockIntegrations,
      intelligence: mockIntelligence,
    }
  : {
      mode: "production",
      commissions: expressCommissions ?? mockCommissions,
      compensation: compensationService,
      compensationOps: compensationOperationsService,
      admin: mockAdmin,
      integrations: mockIntegrations,
      intelligence: mockIntelligence,
    };

export { apiConfig };
