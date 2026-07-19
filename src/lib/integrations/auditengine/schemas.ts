import { z } from "zod";

/**
 * AuditEngine (Audit-Risk-Model) response contracts.
 *
 * Derived from the real Express routes in
 *   contractorcomplianceco-cmyk/Audit-Risk-Model/artifacts/api-server/src/routes/
 * AuditEngine is the governed source of truth; LedgerOS is a READ-ONLY consumer
 * that only ever receives Approved/Published, trade-secret-safe outputs.
 */

// GET /cca-rf-library  (jurisdictionRules.ts)
export const CcaRfLibraryRecordSchema = z.object({
  id: z.union([z.string(), z.number()]),
  factorCode: z.string(),
  title: z.string(),
  category: z.string().nullable(),
  isActive: z.boolean(),
});
export const CcaRfLibraryResponseSchema = z.object({
  ok: z.boolean(),
  source: z.string(),
  total: z.number(),
  records: z.array(CcaRfLibraryRecordSchema),
});
export type CcaRfLibraryResponse = z.infer<typeof CcaRfLibraryResponseSchema>;

// GET /jurisdiction-rules?state&limit&human_approved  (jurisdictionRules.ts)
// Read-only consumers pull `human_approved=true` = Approved + Published only.
export const JurisdictionRuleSchema = z.object({
  ccaRfCode: z.string().nullable(),
  stateCode: z.string().nullable(),
  domain: z.string().nullable(),
  riskFactorTitle: z.string().nullable(),
  statusExport: z.string().nullable(),
  humanApproved: z.boolean().nullable(),
  teamValidationMethod: z.string().nullable(),
  question: z.string().nullable(),
  answer: z.string().nullable(),
  officialUrl: z.string().nullable(),
  applicability: z.string().nullable(),
  severity: z.union([z.string(), z.number()]).nullable(),
  sourceResearchItemId: z.union([z.string(), z.number()]).nullable(),
  updatedAt: z.string().nullable(),
});
export const JurisdictionRulesResponseSchema = z.object({
  ok: z.boolean(),
  source: z.string(),
  phase: z.string().optional(),
  state: z.string().nullable(),
  total: z.number(),
  count: z.number(),
  records: z.array(JurisdictionRuleSchema),
});
export type JurisdictionRulesResponse = z.infer<typeof JurisdictionRulesResponseSchema>;

// GET /reference  (reference.ts -> buildSafeReference): safe, weight-free
// governance metadata. Shape is upstream-owned display data; validated as a
// structured object without asserting internal keys.
export const SafeReferenceSchema = z.record(z.unknown());
export type SafeReference = z.infer<typeof SafeReferenceSchema>;

// GET /public/trust-reports/:slug  (public.ts -> buildTrustReportPublic):
// consumer-facing published Trust Report. Validated on the fields LedgerOS
// consumes; upstream may add more (passthrough keeps forward-compat).
export const PublicTrustReportSchema = z
  .object({
    reportCode: z.string().optional(),
    status: z.string().optional(),
    shareSlug: z.string().optional(),
  })
  .passthrough();
export type PublicTrustReport = z.infer<typeof PublicTrustReportSchema>;
