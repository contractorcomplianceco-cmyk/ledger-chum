/**
 * Typed client layer for the four external CCA services.
 *
 * Each service module exposes: a typed client class, a `create*Client()`
 * env-driven factory (server-only — reads scoped API keys from process.env),
 * and Zod schemas modeled on the real target-repo route contracts.
 *
 * See docs/integrations/README.md for contracts referenced and env vars.
 */
export * from "./shared/event-envelope";
export {
  IntegrationHttpClient,
  IntegrationError,
  type IntegrationClientConfig,
} from "./shared/http-client";
export {
  resolveServiceConfig,
  requireServiceConfig,
  type ResolvedServiceConfig,
} from "./shared/config";

export {
  AuditEngineClient,
  createAuditEngineClient,
  AUDITENGINE_ENV,
  type AuditEngineConsumerRegistration,
} from "./auditengine/client";
export * as auditengineSchemas from "./auditengine/schemas";

export { SalesCoreClient, createSalesCoreClient, SALESCORE_ENV } from "./salescore/client";
export * as salescoreSchemas from "./salescore/schemas";

export {
  DocumentCollectionClient,
  createDocumentCollectionClient,
  DOCUMENTCOLLECTION_ENV,
} from "./documentcollection/client";
export * as documentcollectionSchemas from "./documentcollection/schemas";

export {
  ComplianceConnectClient,
  createComplianceConnectClient,
  COMPLIANCECONNECT_ENV,
} from "./complianceconnect/client";
export * as complianceconnectSchemas from "./complianceconnect/schemas";
