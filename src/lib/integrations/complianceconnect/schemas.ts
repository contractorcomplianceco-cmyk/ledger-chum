import { z } from "zod";

/**
 * ComplianceConnectOS (Client-Portal) contracts.
 *
 * Derived from real routes:
 *   Client-Portal/artifacts/api-server/src/routes/compliance-scores.ts
 *   Client-Portal/artifacts/api-server/src/routes/admin/monitoring-ingest.ts
 * Compliance reads expose ONLY approved score views (no source audit id,
 * reviewer notes, or formula internals).
 */

// GET /compliance/score?locationId  -> { score, state, location?, message? }
export const ClientApprovedScoreViewSchema = z
  .object({
    locationId: z.string(),
    overallRisk: z.union([z.string(), z.number()]).nullable().optional(),
    posture: z.string().nullable().optional(),
    band: z.string().nullable().optional(),
    domainScores: z.unknown().optional(),
    lifecycleSummary: z.unknown().optional(),
    outstandingDocuments: z.unknown().optional(),
    approvedExplanations: z.unknown().optional(),
    computedAt: z.string().nullable().optional(),
    approvedAt: z.string().nullable().optional(),
  })
  .passthrough();

export const ComplianceScoreResponseSchema = z.object({
  score: ClientApprovedScoreViewSchema.nullable(),
  state: z.enum(["approved", "no_locations", "no_approved_score"]),
  location: z
    .object({
      id: z.string(),
      name: z.string().nullable().optional(),
      addressState: z.string().nullable().optional(),
    })
    .optional(),
  message: z.string().optional(),
});
export type ComplianceScoreResponse = z.infer<typeof ComplianceScoreResponseSchema>;

// POST /admin/monitoring/ingest/:locationId  (staff) — batch touch-point facts.
export const MonitoringIngestRowSchema = z.object({
  riskId: z.string(),
  complianceStatus: z.string(),
  scoreDomain: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  applicability: z.string().nullable().optional(),
  severity: z.union([z.string(), z.number()]).nullable().optional(),
  likelihood: z.union([z.string(), z.number()]).nullable().optional(),
  evidenceStatus: z.string().nullable().optional(),
  expiresOn: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  monitored: z.boolean(),
});
export type MonitoringIngestRow = z.infer<typeof MonitoringIngestRowSchema>;

export const MonitoringIngestBodySchema = z.object({
  organizationId: z.string().optional(),
  sourceAuditId: z.string().nullable().optional(),
  rows: z.array(MonitoringIngestRowSchema),
});
export type MonitoringIngestBody = z.infer<typeof MonitoringIngestBodySchema>;

// Response is upstream-owned; validate loosely (written count + status).
export const MonitoringIngestResponseSchema = z.record(z.unknown());
export type MonitoringIngestResponse = z.infer<typeof MonitoringIngestResponseSchema>;
