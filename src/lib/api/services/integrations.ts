import { mockGet, mockMutation } from "../adapters/mock-adapter";
import { DEMO_MUTATION_MESSAGE, type DemoResult, type ID } from "../types";

export type IntegrationCategory =
  | "crm"
  | "forms"
  | "accounting"
  | "billing"
  | "banking"
  | "payroll"
  | "internal_platform"
  | "portal"
  | "sales"
  | "marketing"
  | "devtools"
  | "ai";

export type IntegrationStatus = "connected" | "degraded" | "failed" | "disconnected" | "pending";

export interface Integration {
  id: ID;
  provider: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  environment: "production" | "sandbox";
  connectionType: "oauth2" | "api_key" | "webhook" | "sftp" | "manual";
  authType: string;
  owner: string;
  lastSuccessfulSync?: string;
  lastFailedSync?: string;
  health: "healthy" | "warning" | "critical";
  errorCount: number;
  actionRequired?: string;
  supportedObjects: string[];
  supportedEvents: string[];
  direction: "inbound" | "outbound" | "bidirectional";
  credentialExpires?: string;
}

export interface FieldMapping {
  id: ID;
  integrationId: ID;
  sourceObject: string;
  sourceField: string;
  targetEntity: string;
  targetField: string;
  transformation?: string;
  defaultValue?: string;
  required: boolean;
  validation?: string;
  active: boolean;
  version: number;
}

export type IntegrationEventType =
  | "customer.created" | "customer.updated"
  | "deal.closed_won" | "service.sold" | "service.milestone_completed"
  | "invoice.requested" | "invoice.created" | "invoice.approved" | "invoice.paid" | "invoice.refunded"
  | "payment.received" | "payment.cleared" | "payment.reversed"
  | "expense.created" | "expense.approved"
  | "bill.created" | "bill.approved"
  | "commission.projected" | "commission.earned" | "commission.approved" | "commission.paid" | "commission.clawback_required"
  | "subscription.started" | "subscription.changed" | "subscription.cancelled"
  | "payroll.summary_imported"
  | "marketing.spend_imported" | "marketing.conversion_attributed"
  | "integration.failed" | "integration.recovered";

export type IntegrationEventStatus = "received" | "processed" | "failed" | "dead_letter" | "retrying";

export interface IntegrationEvent {
  id: ID;
  integrationId: ID;
  source: string;
  type: IntegrationEventType;
  externalId: string;
  idempotencyKey: string;
  version: number;
  receivedAt: string;
  status: IntegrationEventStatus;
  relatedRecord?: string;
  retryCount: number;
  error?: string;
  payloadPreview: string;
}

export interface SyncRun {
  id: ID;
  integrationId: ID;
  startedAt: string;
  finishedAt?: string;
  status: "success" | "partial" | "failed" | "running";
  volume: number;
  rejected: number;
}

export interface DeadLetterEntry {
  id: ID;
  eventId: ID;
  reason: string;
  attempts: number;
  payloadSnapshot: string;
  owner: string;
  resolution: "unresolved" | "retried" | "dismissed" | "escalated";
  recommendedAction: string;
}

export interface IntegrationsService {
  list(): Promise<Integration[]>;
  get(id: ID): Promise<Integration>;
  listMappings(integrationId?: ID): Promise<FieldMapping[]>;
  saveMapping(input: Omit<FieldMapping, "id" | "version">): Promise<DemoResult<FieldMapping>>;
  previewMapping(input: { integrationId: ID; sample: Record<string, unknown> }): Promise<{ transformed: Record<string, unknown>; errors: string[] }>;
  listEvents(): Promise<IntegrationEvent[]>;
  listSyncRuns(): Promise<SyncRun[]>;
  listDeadLetter(): Promise<DeadLetterEntry[]>;
  retryDeadLetter(id: ID): Promise<DemoResult<DeadLetterEntry>>;
  listCredentials(): Promise<Array<{ id: ID; integrationId: ID; label: string; type: string; expiresAt?: string; rotatedAt?: string }>>;
  listHealth(): Promise<Array<{ integrationId: ID; provider: string; health: "healthy" | "warning" | "critical"; errorRate: number; latencyMs: number }>>;
  listContracts(): Promise<Array<{ event: IntegrationEventType; version: number; owner: string; schemaRef: string }>>;
}

const MOCK_INTEGRATIONS: Integration[] = [
  { id: "int_zoho_crm", provider: "Zoho CRM", category: "crm", status: "connected", environment: "production", connectionType: "oauth2", authType: "OAuth 2.0 · refresh token", owner: "Rose", lastSuccessfulSync: "2026-07-12T09:00:00Z", health: "healthy", errorCount: 0, supportedObjects: ["Contact", "Account", "Deal"], supportedEvents: ["customer.created", "customer.updated", "deal.closed_won"], direction: "bidirectional" },
  { id: "int_zoho_forms", provider: "Zoho Forms", category: "forms", status: "connected", environment: "production", connectionType: "webhook", authType: "Signed webhook", owner: "Christin", lastSuccessfulSync: "2026-07-12T12:15:00Z", health: "healthy", errorCount: 0, supportedObjects: ["FormSubmission"], supportedEvents: ["customer.created"], direction: "inbound" },
  { id: "int_zoho_books_migration", provider: "Zoho Books (migration)", category: "accounting", status: "pending", environment: "production", connectionType: "api_key", authType: "API key", owner: "Rose", health: "warning", errorCount: 0, actionRequired: "Awaiting historical export approval", supportedObjects: ["Invoice", "Bill", "Journal"], supportedEvents: [], direction: "inbound" },
  { id: "int_zoho_billing", provider: "Zoho Billing", category: "billing", status: "connected", environment: "production", connectionType: "oauth2", authType: "OAuth 2.0", owner: "Christin", lastSuccessfulSync: "2026-07-12T08:00:00Z", health: "healthy", errorCount: 0, supportedObjects: ["Subscription", "Invoice"], supportedEvents: ["subscription.started", "subscription.changed", "subscription.cancelled", "invoice.paid"], direction: "bidirectional" },
  { id: "int_navy_federal", provider: "Navy Federal Import", category: "banking", status: "connected", environment: "production", connectionType: "sftp", authType: "SFTP + PGP", owner: "Christin", lastSuccessfulSync: "2026-07-12T04:00:00Z", health: "healthy", errorCount: 0, supportedObjects: ["BankTransaction"], supportedEvents: ["payment.received"], direction: "inbound" },
  { id: "int_run_adp", provider: "RUN ADP", category: "payroll", status: "connected", environment: "production", connectionType: "api_key", authType: "API key", owner: "Christin", lastSuccessfulSync: "2026-07-05T15:00:00Z", health: "healthy", errorCount: 0, supportedObjects: ["PayrollSummary"], supportedEvents: ["payroll.summary_imported"], direction: "inbound" },
  { id: "int_command_center", provider: "Command Center", category: "internal_platform", status: "connected", environment: "production", connectionType: "webhook", authType: "Signed webhook", owner: "Rose", lastSuccessfulSync: "2026-07-12T11:00:00Z", health: "healthy", errorCount: 0, supportedObjects: ["Task", "Project"], supportedEvents: ["service.milestone_completed"], direction: "bidirectional" },
  { id: "int_client_portal", provider: "Client Portal", category: "portal", status: "connected", environment: "production", connectionType: "oauth2", authType: "Portal SSO", owner: "Rose", lastSuccessfulSync: "2026-07-12T10:00:00Z", health: "healthy", errorCount: 0, supportedObjects: ["ClientAccount"], supportedEvents: ["invoice.paid"], direction: "bidirectional" },
  { id: "int_bsh", provider: "Business Services Hub", category: "internal_platform", status: "connected", environment: "production", connectionType: "webhook", authType: "Signed webhook", owner: "Carmen", lastSuccessfulSync: "2026-07-12T09:30:00Z", health: "healthy", errorCount: 0, supportedObjects: ["ServiceOrder"], supportedEvents: ["service.sold"], direction: "inbound" },
  { id: "int_qualifier_connect", provider: "QualifierConnect", category: "sales", status: "connected", environment: "production", connectionType: "webhook", authType: "Signed webhook", owner: "Rose", lastSuccessfulSync: "2026-07-12T08:20:00Z", health: "healthy", errorCount: 0, supportedObjects: ["Qualification"], supportedEvents: ["customer.created"], direction: "inbound" },
  { id: "int_compliance_connect", provider: "ComplianceConnect", category: "sales", status: "connected", environment: "production", connectionType: "webhook", authType: "Signed webhook", owner: "Rose", lastSuccessfulSync: "2026-07-12T08:25:00Z", health: "healthy", errorCount: 0, supportedObjects: ["ComplianceCheck"], supportedEvents: ["customer.updated"], direction: "inbound" },
  { id: "int_sales_intel", provider: "Sales Intelligence OS", category: "sales", status: "degraded", environment: "production", connectionType: "api_key", authType: "API key", owner: "Rose", lastSuccessfulSync: "2026-07-11T22:00:00Z", lastFailedSync: "2026-07-12T06:00:00Z", health: "warning", errorCount: 3, actionRequired: "Rate limit backoff engaged", supportedObjects: ["Signal"], supportedEvents: [], direction: "inbound" },
  { id: "int_guided_sales", provider: "Guided Sales", category: "sales", status: "connected", environment: "production", connectionType: "webhook", authType: "Signed webhook", owner: "Rose", lastSuccessfulSync: "2026-07-12T07:00:00Z", health: "healthy", errorCount: 0, supportedObjects: ["Playbook"], supportedEvents: [], direction: "inbound" },
  { id: "int_tara", provider: "Tara OS", category: "internal_platform", status: "connected", environment: "production", connectionType: "webhook", authType: "Signed webhook", owner: "Rose", lastSuccessfulSync: "2026-07-12T09:15:00Z", health: "healthy", errorCount: 0, supportedObjects: ["Insight"], supportedEvents: [], direction: "bidirectional" },
  { id: "int_marketing", provider: "Marketing Platforms", category: "marketing", status: "connected", environment: "production", connectionType: "api_key", authType: "API key per platform", owner: "Rose", lastSuccessfulSync: "2026-07-12T06:00:00Z", health: "healthy", errorCount: 0, supportedObjects: ["Campaign", "Spend"], supportedEvents: ["marketing.spend_imported", "marketing.conversion_attributed"], direction: "inbound" },
  { id: "int_replit", provider: "Replit", category: "devtools", status: "connected", environment: "production", connectionType: "api_key", authType: "API key", owner: "Rose", lastSuccessfulSync: "2026-07-10T00:00:00Z", health: "healthy", errorCount: 0, supportedObjects: [], supportedEvents: [], direction: "outbound" },
  { id: "int_lovable", provider: "Lovable", category: "devtools", status: "connected", environment: "production", connectionType: "api_key", authType: "API key", owner: "Rose", lastSuccessfulSync: "2026-07-12T13:00:00Z", health: "healthy", errorCount: 0, supportedObjects: [], supportedEvents: [], direction: "outbound" },
  { id: "int_vercel", provider: "Vercel", category: "devtools", status: "connected", environment: "production", connectionType: "oauth2", authType: "OAuth 2.0", owner: "Rose", lastSuccessfulSync: "2026-07-12T11:30:00Z", health: "healthy", errorCount: 0, supportedObjects: [], supportedEvents: [], direction: "outbound" },
  { id: "int_github", provider: "GitHub", category: "devtools", status: "connected", environment: "production", connectionType: "oauth2", authType: "OAuth 2.0 · fine-grained token", owner: "Rose", lastSuccessfulSync: "2026-07-12T12:00:00Z", health: "healthy", errorCount: 0, supportedObjects: ["Repo", "Deploy"], supportedEvents: [], direction: "bidirectional" },
  { id: "int_openai", provider: "OpenAI", category: "ai", status: "connected", environment: "production", connectionType: "api_key", authType: "API key", owner: "Rose", lastSuccessfulSync: "2026-07-12T13:00:00Z", health: "healthy", errorCount: 0, supportedObjects: [], supportedEvents: [], direction: "outbound" },
  { id: "int_ai_gateway", provider: "Other AI providers", category: "ai", status: "connected", environment: "production", connectionType: "api_key", authType: "Gateway API key", owner: "Rose", lastSuccessfulSync: "2026-07-12T13:00:00Z", health: "healthy", errorCount: 0, supportedObjects: [], supportedEvents: [], direction: "outbound" },
];

const MOCK_MAPPINGS: FieldMapping[] = [
  { id: "map_1", integrationId: "int_zoho_crm", sourceObject: "Deal", sourceField: "Amount", targetEntity: "Opportunity", targetField: "amount", transformation: "toNumber", required: true, active: true, version: 3 },
  { id: "map_2", integrationId: "int_zoho_crm", sourceObject: "Contact", sourceField: "Email", targetEntity: "Customer", targetField: "primary_email", validation: "email", required: true, active: true, version: 2 },
  { id: "map_3", integrationId: "int_navy_federal", sourceObject: "Transaction", sourceField: "post_date", targetEntity: "BankTransaction", targetField: "posted_at", transformation: "toISODate", required: true, active: true, version: 1 },
];

const MOCK_EVENTS: IntegrationEvent[] = [
  { id: "evt_1", integrationId: "int_zoho_crm", source: "Zoho CRM", type: "deal.closed_won", externalId: "deal_44", idempotencyKey: "zoho:deal:44:v3", version: 3, receivedAt: "2026-07-12T09:00:00Z", status: "processed", relatedRecord: "inv_2145", retryCount: 0, payloadPreview: "{ dealId: 44, amount: 5000, owner: 'Jamie R.' }" },
  { id: "evt_2", integrationId: "int_zoho_billing", source: "Zoho Billing", type: "invoice.paid", externalId: "inv_2145", idempotencyKey: "zbil:inv:2145:paid", version: 1, receivedAt: "2026-07-12T10:00:00Z", status: "processed", relatedRecord: "pay_9931", retryCount: 0, payloadPreview: "{ invoiceId: 'inv_2145', amount: 5000 }" },
  { id: "evt_3", integrationId: "int_sales_intel", source: "Sales Intelligence OS", type: "customer.updated", externalId: "cust_apex", idempotencyKey: "sio:cust:apex:v11", version: 11, receivedAt: "2026-07-12T06:00:00Z", status: "failed", retryCount: 3, error: "429 rate limit", payloadPreview: "{ customerId: 'cust_apex', signals: [...] }" },
];

const MOCK_SYNC_RUNS: SyncRun[] = [
  { id: "sr_1", integrationId: "int_zoho_crm", startedAt: "2026-07-12T09:00:00Z", finishedAt: "2026-07-12T09:01:20Z", status: "success", volume: 412, rejected: 0 },
  { id: "sr_2", integrationId: "int_sales_intel", startedAt: "2026-07-12T06:00:00Z", finishedAt: "2026-07-12T06:00:30Z", status: "failed", volume: 0, rejected: 128 },
];

const MOCK_DLQ: DeadLetterEntry[] = [
  { id: "dl_1", eventId: "evt_3", reason: "429 rate limit exceeded", attempts: 3, payloadSnapshot: "{ customerId: 'cust_apex', ... }", owner: "Carmen", resolution: "unresolved", recommendedAction: "Wait 15m and retry; investigate throttle policy" },
];

export const mockIntegrations: IntegrationsService = {
  list: () => mockGet(() => MOCK_INTEGRATIONS),
  get: (id) =>
    mockGet(() => {
      const i = MOCK_INTEGRATIONS.find((x) => x.id === id);
      if (!i) throw new Error("Integration not found");
      return i;
    }),
  listMappings: (integrationId) =>
    mockGet(() => (integrationId ? MOCK_MAPPINGS.filter((m) => m.integrationId === integrationId) : MOCK_MAPPINGS)),
  saveMapping: (input) =>
    mockMutation(() => ({ ...input, id: `map_${Date.now()}`, version: 1 }) as FieldMapping, DEMO_MUTATION_MESSAGE),
  previewMapping: (input) =>
    mockGet(() => ({
      transformed: {
        target_entity: "Customer",
        primary_email: (input.sample.Email as string | undefined) ?? "",
        amount: Number(input.sample.Amount ?? 0),
      },
      errors: [],
    })),
  listEvents: () => mockGet(() => MOCK_EVENTS),
  listSyncRuns: () => mockGet(() => MOCK_SYNC_RUNS),
  listDeadLetter: () => mockGet(() => MOCK_DLQ),
  retryDeadLetter: (id) =>
    mockMutation(() => {
      const d = MOCK_DLQ.find((x) => x.id === id);
      if (!d) throw new Error("Dead-letter entry not found");
      return { ...d, resolution: "retried" as const, attempts: d.attempts + 1 };
    }, DEMO_MUTATION_MESSAGE),
  listCredentials: () =>
    mockGet(() => [
      { id: "cred_1", integrationId: "int_zoho_crm", label: "OAuth refresh token", type: "oauth2", expiresAt: "2026-10-01", rotatedAt: "2026-06-01" },
      { id: "cred_2", integrationId: "int_openai", label: "API key (masked)", type: "api_key", rotatedAt: "2026-05-15" },
    ]),
  listHealth: () =>
    mockGet(() =>
      MOCK_INTEGRATIONS.map((i) => ({
        integrationId: i.id,
        provider: i.provider,
        health: i.health,
        errorRate: i.errorCount / 100,
        latencyMs: 200 + Math.round(Math.random() * 300),
      })),
    ),
  listContracts: () =>
    mockGet(() => [
      { event: "invoice.paid", version: 2, owner: "Finance", schemaRef: "schemas/events/invoice.paid.v2.json" },
      { event: "commission.approved", version: 1, owner: "Finance", schemaRef: "schemas/events/commission.approved.v1.json" },
      { event: "payroll.summary_imported", version: 1, owner: "Payroll", schemaRef: "schemas/events/payroll.summary.v1.json" },
    ]),
};
