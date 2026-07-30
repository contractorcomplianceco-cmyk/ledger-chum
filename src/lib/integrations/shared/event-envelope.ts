import { z } from "zod";

/**
 * Shared CCA platform Event Envelope.
 *
 * Every CCA application (AuditEngine, SalesCoreOS, DocumentCollectionOS,
 * ComplianceConnectOS, LedgerOS) exchanges domain events using this envelope.
 * It mirrors the LedgerOS public-integration lineage fields (correlation_id,
 * idempotency) so events flowing in either direction share one shape.
 *
 * Shape (from the platform brief):
 *   { eventId, eventType, eventVersion, occurredAt, correlationId,
 *     causationId, actor, ruleVersion, payload }
 */
export const EventActorSchema = z.object({
  type: z.enum(["user", "service", "system"]),
  id: z.string(),
  label: z.string().optional(),
});
export type EventActor = z.infer<typeof EventActorSchema>;

export const EventEnvelopeSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  eventVersion: z.string(),
  occurredAt: z.string(),
  correlationId: z.string(),
  causationId: z.string().nullable().optional(),
  actor: EventActorSchema,
  ruleVersion: z.string().nullable().optional(),
  payload: z.unknown(),
});
export type EventEnvelope<TPayload = unknown> = Omit<
  z.infer<typeof EventEnvelopeSchema>,
  "payload"
> & { payload: TPayload };

/**
 * Builds a typed envelope schema for a specific payload. Use this to validate
 * inbound events whose payload contract is known.
 */
export function eventEnvelopeOf<T extends z.ZodTypeAny>(payload: T) {
  return EventEnvelopeSchema.extend({ payload });
}

/**
 * AuditEngine (governed source of truth) publishes these platform events.
 * LedgerOS subscribes read-only instead of polling where possible.
 */
export const AUDITENGINE_EVENT_TYPES = [
  "snapshot.published",
  "knowledge.approved",
  "knowledge.superseded",
] as const;
export type AuditEngineEventType = (typeof AUDITENGINE_EVENT_TYPES)[number];
