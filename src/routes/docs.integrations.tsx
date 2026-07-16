import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Zap, RefreshCcw, AlertTriangle, ShieldCheck, Timer } from "lucide-react";

/**
 * M11 — Customer-facing Integration Documentation.
 *
 * Public reference for external systems integrating with LedgerOS via the
 * Financial Event Bus. Read-only documentation. No secrets, no live keys.
 */

export const Route = createFileRoute("/docs/integrations")({
  head: () => ({
    meta: [
      { title: "Integration Documentation — LedgerOS" },
      {
        name: "description",
        content:
          "External integration reference for LedgerOS: authentication, events, idempotency, errors, security, and retry behavior.",
      },
      { property: "og:title", content: "Integration Documentation — LedgerOS" },
    ],
  }),
  component: IntegrationDocs,
});

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof KeyRound;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-md bg-muted p-2">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground">{children}</div>
    </Card>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
      <code>{children}</code>
    </pre>
  );
}

function IntegrationDocs() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="External integrations"
        title="Integration Documentation"
        description="How external operational systems publish financial events to LedgerOS. External systems never post journal entries directly — every event flows through the Financial Event Bus."
        actions={
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            v1
          </Badge>
        }
      />
      <PageBody>
        <Section icon={KeyRound} title="Authentication">
          <p>
            All requests authenticate with an API client credential issued per environment.
            Credentials are scoped to a single organization and a fixed set of event types. Signed
            requests carry an HMAC-SHA256 signature over the raw request body using a shared secret.
          </p>
          <Code>{`Authorization: Bearer <client_token>
X-LedgerOS-Timestamp: 1739462400
X-LedgerOS-Signature: sha256=<hex>`}</Code>
          <p>
            Signatures are verified with a constant-time compare; the timestamp must be within 300
            seconds.
          </p>
        </Section>

        <Section icon={Zap} title="Events">
          <p>
            Post events to the Financial Event Bus endpoint. Each event is validated against its
            schema, routed to a rule, and materialized into a financial object. External systems
            never post journal entries directly.
          </p>
          <Code>{`POST /api/public/integrations/events
Content-Type: application/json

{
  "event_type": "work_order.completed",
  "external_id": "WO-10001",
  "occurred_at": "2026-07-16T14:03:00Z",
  "payload": { "...": "..." }
}`}</Code>
          <p>
            Supported event types include <code>work_order.completed</code>,{" "}
            <code>invoice.created</code>,<code> payment.received</code>,{" "}
            <code>inventory.consumed</code>, and <code>refund.created</code>.
          </p>
        </Section>

        <Section icon={RefreshCcw} title="Idempotency">
          <p>
            Every event must include an <code>Idempotency-Key</code> header. The bus deduplicates
            for 24 hours: a duplicate key returns the original response with{" "}
            <code>X-LedgerOS-Idempotent-Replayed: true</code>.
          </p>
          <Code>{`Idempotency-Key: 6f2e3d90-b0a5-42d7-9e5f-4c9d1e75c001`}</Code>
        </Section>

        <Section icon={AlertTriangle} title="Errors">
          <p>
            Errors use structured JSON with a stable <code>code</code> and a human{" "}
            <code>message</code>.
          </p>
          <Code>{`HTTP/1.1 422 Unprocessable Entity

{
  "code": "unknown_customer",
  "message": "External customer SC-CUST-99 is not mapped.",
  "correlation_id": "corr_9f21",
  "retryable": false
}`}</Code>
          <p>
            Non-retryable errors are surfaced as exceptions in the accountant workspace for manual
            resolution.
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Security">
          <ul className="list-disc space-y-1 pl-5">
            <li>TLS 1.2+ required. Non-TLS requests are refused.</li>
            <li>Client secrets are never returned after creation; rotate via the admin surface.</li>
            <li>Row-level security enforces tenant isolation on every read and write.</li>
            <li>All requests are recorded in the audit log with correlation IDs.</li>
          </ul>
        </Section>

        <Section icon={Timer} title="Retry behavior">
          <p>
            Transient failures (<code>5xx</code>, <code>429</code>, network) are retried with
            exponential backoff and jitter: 30s, 2m, 8m, 30m, 2h — up to 5 attempts. Non-retryable
            errors (<code>4xx</code> other than 408 / 429) are moved to the exception queue
            immediately.
          </p>
          <p>
            Publishers should honor <code>Retry-After</code> when present and MUST NOT retry with a
            different
            <code> Idempotency-Key</code> for the same logical event.
          </p>
        </Section>
      </PageBody>
    </AppShell>
  );
}
