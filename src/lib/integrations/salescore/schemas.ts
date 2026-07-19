import { z } from "zod";

/**
 * SalesCoreOS (CCA-SalesIntelligenceOS) contracts.
 *
 * Derived from the real route
 *   CCA-SalesIntelligenceOS/artifacts/api-server/src/routes/cca.ts
 * (mounted under /cca, behind requireAuth). Handlers validate responses with
 * generated @workspace/api-zod schemas (ListLibraryResourcesResponse,
 * ListCertificationsResponse, ListCrmActivitiesResponse, ...). The published
 * field lists are upstream-owned; we validate the array/record shape and keep
 * passthrough so new fields don't break the consumer. Tighten once the SalesOS
 * OpenAPI is vendored.
 */

export const LibraryResourceSchema = z
  .object({ id: z.union([z.string(), z.number()]) })
  .passthrough();
export const ListLibraryResourcesResponseSchema = z.array(LibraryResourceSchema);
export type ListLibraryResourcesResponse = z.infer<typeof ListLibraryResourcesResponseSchema>;

export const CertificationSchema = z
  .object({ id: z.union([z.string(), z.number()]) })
  .passthrough();
export const ListCertificationsResponseSchema = z.array(CertificationSchema);
export type ListCertificationsResponse = z.infer<typeof ListCertificationsResponseSchema>;

export const CrmActivitySchema = z.object({ id: z.union([z.string(), z.number()]) }).passthrough();
export const ListCrmActivitiesResponseSchema = z.array(CrmActivitySchema);
export type ListCrmActivitiesResponse = z.infer<typeof ListCrmActivitiesResponseSchema>;
