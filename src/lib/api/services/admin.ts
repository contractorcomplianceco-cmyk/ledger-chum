import { mockGet, mockMutation } from "../adapters/mock-adapter";
import { DEMO_MUTATION_MESSAGE, type DemoResult, type ID, type Money, type RoleKey } from "../types";

export type UserStatus = "invited" | "active" | "suspended" | "locked" | "deactivated" | "pending_review";

export interface AdminUser {
  id: ID;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  manager?: string;
  role: RoleKey;
  status: UserStatus;
  companyAccess: string[];
  sensitiveAccess: boolean;
  approvalLimits: {
    expense?: Money;
    invoice?: Money;
    payment?: Money;
    journal?: Money;
    commission?: Money;
    guardrail_override?: Money;
    budget_override?: Money;
  };
  mfaEnabled: boolean;
  lastLogin?: string;
}

export interface AdminRole {
  key: RoleKey | string;
  name: string;
  description: string;
  builtin: boolean;
  memberCount: number;
  permissions: string[];
}

export type PermissionScope =
  | "own"
  | "assigned"
  | "department"
  | "company"
  | "all"
  | "sensitive_masked"
  | "sensitive_visible";

export interface PermissionEntry {
  key: string;
  group: string;
  label: string;
  scopes: PermissionScope[];
}

export interface AdminSession {
  id: ID;
  user: string;
  ip: string;
  userAgent: string;
  startedAt: string;
  lastSeenAt: string;
  active: boolean;
}

export interface SecurityEvent {
  id: ID;
  type: string;
  user: string;
  at: string;
  ip?: string;
  severity: "info" | "warning" | "critical";
  detail: string;
}

export interface LoginRecord {
  id: ID;
  user: string;
  at: string;
  ip: string;
  result: "success" | "failed" | "mfa_challenge";
  reason?: string;
}

export interface ServiceAccount {
  id: ID;
  name: string;
  scope: string;
  createdBy: string;
  createdAt: string;
  lastUsedAt?: string;
  active: boolean;
}

export interface AdminService {
  listUsers(): Promise<AdminUser[]>;
  getUser(id: ID): Promise<AdminUser>;
  inviteUser(input: Partial<AdminUser> & { email: string; name: string }): Promise<DemoResult<AdminUser>>;
  updateUserStatus(id: ID, status: UserStatus, reason: string): Promise<DemoResult<AdminUser>>;
  resetPassword(id: ID, reason: string): Promise<DemoResult<{ id: ID }>>;
  revokeSessions(id: ID, reason: string): Promise<DemoResult<{ id: ID }>>;
  listRoles(): Promise<AdminRole[]>;
  getRole(key: string): Promise<AdminRole>;
  listPermissions(): Promise<PermissionEntry[]>;
  listSessions(): Promise<AdminSession[]>;
  listSecurityEvents(): Promise<SecurityEvent[]>;
  listLoginHistory(): Promise<LoginRecord[]>;
  listServiceAccounts(): Promise<ServiceAccount[]>;
  listAudit(): Promise<Array<{ id: ID; type: string; actor: string; at: string; summary: string }>>;
}

const MOCK_USERS: AdminUser[] = [
  {
    id: "u_1",
    name: "Rose Delacroix",
    email: "rose@example.com",
    jobTitle: "Founder & CEO",
    department: "Executive",
    role: "owner",
    status: "active",
    companyAccess: ["All"],
    sensitiveAccess: true,
    approvalLimits: { expense: 100_000, invoice: 250_000, payment: 250_000, commission: 100_000, guardrail_override: 500_000 },
    mfaEnabled: true,
    lastLogin: "2026-07-12T08:00:00Z",
  },
  {
    id: "u_2",
    name: "Christin Vale",
    email: "christin@example.com",
    jobTitle: "Accounting Lead",
    department: "Finance",
    manager: "Rose Delacroix",
    role: "accounting_lead",
    status: "active",
    companyAccess: ["All"],
    sensitiveAccess: true,
    approvalLimits: { expense: 25_000, invoice: 50_000, payment: 50_000, commission: 25_000 },
    mfaEnabled: true,
    lastLogin: "2026-07-12T07:40:00Z",
  },
  {
    id: "u_3",
    name: "Carmen Ito",
    email: "carmen@example.com",
    jobTitle: "Systems Reviewer",
    department: "Operations",
    manager: "Rose Delacroix",
    role: "systems_reviewer",
    status: "active",
    companyAccess: ["All"],
    sensitiveAccess: false,
    approvalLimits: {},
    mfaEnabled: true,
    lastLogin: "2026-07-11T18:20:00Z",
  },
  {
    id: "u_4",
    name: "Jamie Rivera",
    email: "jamie@example.com",
    jobTitle: "Senior Sales",
    department: "Sales",
    manager: "Rose Delacroix",
    role: "team_member",
    status: "active",
    companyAccess: ["Own"],
    sensitiveAccess: false,
    approvalLimits: { expense: 2_500 },
    mfaEnabled: false,
    lastLogin: "2026-07-11T15:00:00Z",
  },
  {
    id: "u_5",
    name: "Zoho Sync Service",
    email: "svc-zoho@internal",
    jobTitle: "Integration",
    department: "Systems",
    role: "integration_service",
    status: "active",
    companyAccess: ["Integration"],
    sensitiveAccess: false,
    approvalLimits: {},
    mfaEnabled: false,
    lastLogin: "2026-07-12T09:00:00Z",
  },
];

const MOCK_ROLES: AdminRole[] = [
  { key: "owner", name: "Owner", description: "Final override on cash, guardrails, pricing.", builtin: true, memberCount: 1, permissions: ["*"] },
  { key: "accounting_lead", name: "Accounting Lead", description: "Reclassifications, approvals, verification.", builtin: true, memberCount: 1, permissions: ["invoices.*", "expenses.*", "commissions.verify", "commissions.approve", "ledger.*"] },
  { key: "systems_reviewer", name: "Systems Reviewer", description: "Attestation and audit — never posts value.", builtin: true, memberCount: 1, permissions: ["*.view", "audit.*", "integrations.*"] },
  { key: "accountant", name: "Accountant / Tax Advisor", description: "Day-to-day ledger operator; bounded approval limits.", builtin: true, memberCount: 0, permissions: ["ledger.*", "reports.*", "commissions.view"] },
  { key: "team_member", name: "Team Member", description: "Submit and view own scope.", builtin: true, memberCount: 12, permissions: ["expenses.submit", "expenses.view.own", "commissions.view.own"] },
  { key: "integration_service", name: "Integration Service", description: "Signed events only; no interactive login.", builtin: true, memberCount: 6, permissions: ["events.ingest", "sync.*"] },
];

const PERMISSION_ENTRIES: PermissionEntry[] = [
  { key: "users.view", group: "Users", label: "View users", scopes: ["own", "department", "company"] },
  { key: "users.manage", group: "Users", label: "Invite / suspend / deactivate users", scopes: ["company"] },
  { key: "roles.manage", group: "Roles", label: "Create and edit roles", scopes: ["company"] },
  { key: "banking.view", group: "Banking", label: "View bank accounts and balances", scopes: ["sensitive_masked", "sensitive_visible"] },
  { key: "banking.reconcile", group: "Banking", label: "Reconcile transactions", scopes: ["company"] },
  { key: "ledger.post", group: "Ledger", label: "Post journal entries", scopes: ["company"] },
  { key: "invoices.approve", group: "Invoices", label: "Approve invoices", scopes: ["assigned", "company"] },
  { key: "invoices.send", group: "Invoices", label: "Send invoices to customers", scopes: ["assigned", "company"] },
  { key: "payments.record", group: "Payments", label: "Record customer payments", scopes: ["company"] },
  { key: "expenses.submit", group: "Expenses", label: "Submit expenses", scopes: ["own"] },
  { key: "expenses.approve", group: "Expenses", label: "Approve expenses", scopes: ["department", "company"] },
  { key: "commissions.view", group: "Commissions", label: "View commissions", scopes: ["own", "department", "company"] },
  { key: "commissions.verify", group: "Commissions", label: "Verify commission calculations", scopes: ["company"] },
  { key: "commissions.approve", group: "Commissions", label: "Approve commission payables", scopes: ["company"] },
  { key: "commissions.override", group: "Commissions", label: "Override commission rules", scopes: ["company"] },
  { key: "reports.view", group: "Reports", label: "View reports and exports", scopes: ["department", "company"] },
  { key: "integrations.manage", group: "Integrations", label: "Configure integrations", scopes: ["company"] },
  { key: "ai.query", group: "AI", label: "Query LedgerOS Intelligence", scopes: ["department", "company"] },
  { key: "ai.policies", group: "AI", label: "Manage AI policies", scopes: ["company"] },
  { key: "security.audit", group: "Security", label: "Review security events", scopes: ["company"] },
  { key: "audit.export", group: "Audit", label: "Export audit trail", scopes: ["company"] },
];

const MOCK_SESSIONS: AdminSession[] = [
  { id: "s_1", user: "Rose Delacroix", ip: "203.0.113.14", userAgent: "Chrome / macOS", startedAt: "2026-07-12T08:00:00Z", lastSeenAt: "2026-07-12T13:45:00Z", active: true },
  { id: "s_2", user: "Christin Vale", ip: "198.51.100.7", userAgent: "Safari / iPad", startedAt: "2026-07-12T07:40:00Z", lastSeenAt: "2026-07-12T13:12:00Z", active: true },
];

const MOCK_SECURITY: SecurityEvent[] = [
  { id: "sec_1", type: "login.failed", user: "jamie@example.com", at: "2026-07-11T22:14:00Z", ip: "192.0.2.55", severity: "warning", detail: "3 failed attempts, MFA not enrolled" },
  { id: "sec_2", type: "permission.change", user: "Rose Delacroix", at: "2026-07-10T09:00:00Z", severity: "info", detail: "Granted commissions.approve to accounting_lead role" },
];

const MOCK_LOGINS: LoginRecord[] = [
  { id: "l_1", user: "rose@example.com", at: "2026-07-12T08:00:00Z", ip: "203.0.113.14", result: "success" },
  { id: "l_2", user: "jamie@example.com", at: "2026-07-11T22:14:00Z", ip: "192.0.2.55", result: "failed", reason: "invalid_password" },
];

const MOCK_SERVICE_ACCOUNTS: ServiceAccount[] = [
  { id: "sa_1", name: "Zoho CRM Sync", scope: "events.ingest, customers.read", createdBy: "Rose", createdAt: "2026-01-04T10:00:00Z", lastUsedAt: "2026-07-12T09:00:00Z", active: true },
  { id: "sa_2", name: "Navy Federal Importer", scope: "banking.import", createdBy: "Christin", createdAt: "2026-02-14T10:00:00Z", lastUsedAt: "2026-07-12T04:00:00Z", active: true },
];

export const mockAdmin: AdminService = {
  listUsers: () => mockGet(() => MOCK_USERS),
  getUser: (id) =>
    mockGet(() => {
      const u = MOCK_USERS.find((x) => x.id === id);
      if (!u) throw new Error("User not found");
      return u;
    }),
  inviteUser: (input) =>
    mockMutation(
      () =>
        ({
          id: `u_${Date.now()}`,
          jobTitle: "—",
          department: "—",
          role: "team_member",
          status: "invited",
          companyAccess: ["Own"],
          sensitiveAccess: false,
          approvalLimits: {},
          mfaEnabled: false,
          ...input,
        }) as AdminUser,
      DEMO_MUTATION_MESSAGE,
    ),
  updateUserStatus: (id, status, reason) =>
    mockMutation(() => {
      const u = MOCK_USERS.find((x) => x.id === id);
      if (!u) throw new Error("User not found");
      return { ...u, status, _reason: reason } as AdminUser;
    }, DEMO_MUTATION_MESSAGE),
  resetPassword: (id, _reason) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  revokeSessions: (id, _reason) => mockMutation(() => ({ id }), DEMO_MUTATION_MESSAGE),
  listRoles: () => mockGet(() => MOCK_ROLES),
  getRole: (key) =>
    mockGet(() => {
      const r = MOCK_ROLES.find((x) => x.key === key);
      if (!r) throw new Error("Role not found");
      return r;
    }),
  listPermissions: () => mockGet(() => PERMISSION_ENTRIES),
  listSessions: () => mockGet(() => MOCK_SESSIONS),
  listSecurityEvents: () => mockGet(() => MOCK_SECURITY),
  listLoginHistory: () => mockGet(() => MOCK_LOGINS),
  listServiceAccounts: () => mockGet(() => MOCK_SERVICE_ACCOUNTS),
  listAudit: () =>
    mockGet(() => [
      { id: "aud_u_1", type: "user.status_changed", actor: "Rose", at: "2026-07-08T10:00:00Z", summary: "u_4 → active" },
      { id: "aud_u_2", type: "role.permission_added", actor: "Rose", at: "2026-07-05T09:00:00Z", summary: "commissions.approve → accounting_lead" },
    ]),
};
