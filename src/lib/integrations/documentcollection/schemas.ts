import { z } from "zod";

/**
 * DocumentCollectionOS (Document-Collection) export contract.
 *
 * Derived from the real route
 *   Document-Collection/artifacts/api-server/src/routes/docsCollectExport.ts
 * and its fact builder in lib/docsCollectExport.ts. Auth is a Bearer export
 * token (`DOCS_COLLECT_EXPORT_TOKEN`) or a staff session.
 */

export const ExportDocumentSchema = z.object({
  id: z.string(),
  parentRequestId: z.string(),
  documentCategory: z.string().nullable(),
  status: z.string().nullable(),
  returnedFileId: z.string().nullable(),
  requestedDate: z.string().nullable(),
  returnedDate: z.string().nullable(),
  reviewDate: z.string().nullable(),
  acceptedDate: z.string().nullable(),
  revisionRequestedDate: z.string().nullable(),
  revisionReceivedDate: z.string().nullable(),
});

export const ExportSubmissionSchema = z.object({
  submissionId: z.string(),
  requestId: z.string().nullable(),
  clientAccountRef: z.string().nullable(),
  status: z.string().nullable(),
  reviewStatus: z.string().nullable(),
  fileCount: z.number().nullable(),
  prefillCandidateCount: z.number().nullable(),
  reviewedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

// Fact top-level fields are confirmed (request_id, updated_at). The upstream
// builder composes additional request/document/submission detail; passthrough
// keeps forward-compatibility without over-asserting unseen keys.
export const DocsCollectExportRequestSchema = z
  .object({
    request_id: z.string(),
    updated_at: z.string(),
  })
  .passthrough();
export type DocsCollectExportRequest = z.infer<typeof DocsCollectExportRequestSchema>;

export const DocsCollectExportRequestListSchema = z.object({
  items: z.array(DocsCollectExportRequestSchema),
  next_cursor: z.string().nullable(),
  generated_at: z.string(),
});
export type DocsCollectExportRequestList = z.infer<typeof DocsCollectExportRequestListSchema>;
