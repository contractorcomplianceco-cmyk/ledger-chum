import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  beginIntegrationCall,
  errorResponse,
  finishIntegrationCall,
  integrationResponse,
  recordIntegrationError,
  IntegrationError,
  type IntegrationContext,
} from "@/integrations/serviceconnect/verify.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";

/**
 * Public financial-event ingestion endpoint.
 *
 * External systems POST events here. LedgerOS records them on the
 * `financial_events` bus with idempotency + audit lineage. Journals are
 * NEVER created directly from this route — approval + materialization
 * are separate steps handled by the accountant workspace.
 */

const schema = z.object({
  external_event_type: z.string().min(1).max(200),
  external_id: z.string().optional().nullable(),
  payload: z.record(z.unknown()).default({}),
});

export const Route = createFileRoute("/api/public/integrations/events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let ctx: IntegrationContext | null = null;
        let body: unknown = null;
        try {
          const start = await beginIntegrationCall(
            request,
            "/events",
            "events.ingest",
          );
          if (start.status === "duplicate") return integrationResponse(start.response);
          ctx = start.ctx;
          body = start.body;

          const parsed = schema.safeParse(body);
          if (!parsed.success) throw new IntegrationError(422, parsed.error.message);
          const p = parsed.data;

          // Resolve the source row for this API client (by source_key
          // matching the client name — configurable via
          // integration_sources table).
          const { data: source } = await supabaseAdmin
            .from("integration_sources")
            .select("id")
            .eq("org_id", ctx.orgId)
            .eq("source_key", "serviceconnect")
            .maybeSingle();

          const { data: ingest, error } = await supabaseAdmin.rpc(
            "ingest_financial_event",
            {
              _org_id: ctx.orgId,
              _source_id: source?.id ?? null,
              _source_system: "serviceconnect",
              _external_event_type: p.external_event_type,
              _external_id: p.external_id ?? null,
              _idempotency_key: ctx.idempotencyKey,
              _correlation_id: ctx.correlationId,
              _payload: p.payload as Json,
            },
          );
          if (error) throw new IntegrationError(500, error.message);

          const response = {
            ...(ingest as Record<string, unknown>),
            idempotency_key: ctx.idempotencyKey,
            correlation_id: ctx.correlationId,
          };
          await finishIntegrationCall(ctx, p.external_id ?? null, body, response);
          return integrationResponse(response, 202);
        } catch (err) {
          await recordIntegrationError(ctx, body, err);
          return errorResponse(err);
        }
      },
    },
  },
});
