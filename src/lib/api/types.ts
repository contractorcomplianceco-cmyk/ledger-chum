/**
 * Shared cross-domain types used by every service.
 * Domain-specific types live inside their service module.
 */

/** Currency amount in minor units? — we use decimal USD throughout the Design Lab. */
export type Money = number;

export type ISODate = string; // "2026-07-12"
export type ISODateTime = string; // "2026-07-12T14:00:00Z"
export type ID = string;

export type RoleKey =
  | "owner"
  | "accounting_lead"
  | "systems_reviewer"
  | "accountant"
  | "team_member"
  | "integration_service";

export interface CurrentUser {
  id: ID;
  name: string;
  email: string;
  role: RoleKey;
  permissions: string[];
  approvalLimits: Partial<
    Record<
      | "expense"
      | "invoice"
      | "payment"
      | "journal"
      | "commission"
      | "guardrail_override"
      | "budget_override",
      Money
    >
  >;
  sensitiveAccess: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    nextCursor?: string | null;
  };
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
  search?: string;
  sort?: string;
}

export interface AuditEventRef {
  id: ID;
  type: string;
  actor: string;
  at: ISODateTime;
  correlationId?: string;
}

/** Marker returned by every mock mutation. */
export interface DemoResult<T = unknown> {
  ok: true;
  demo: true;
  data: T;
  message: string;
}

export const DEMO_MUTATION_MESSAGE =
  "UI demonstration only — no accounting or commission record was modified.";
