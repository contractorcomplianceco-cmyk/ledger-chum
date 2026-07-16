import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { INTEGRATIONS } from "@/lib/mock/implementation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/implementation/integrations")({
  head: () => ({ meta: [{ title: "Integration Contracts — LedgerOS" }] }),
  component: IntegrationsPage,
});

const CAT_TONE = {
  ingest: "border-brand/40 bg-brand/10 text-brand",
  sync: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  post: "border-success/40 bg-success/10 text-success",
} as const;

const STATUS_TONE = {
  existing: "border-success/40 bg-success/10 text-success",
  spec: "border-warning/40 bg-warning/10 text-warning",
  planned: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
} as const;

function IntegrationsPage() {
  return (
    <ImplementationPage
      title="Integration Contracts"
      description="How Navy Federal, the Zoho suite, ADP payroll, and every CCA app talk to LedgerOS — direction, cadence, and contract shape."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((i) => (
          <Card key={i.system} className="border-border/70 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="text-[13.5px] font-semibold">{i.system}</div>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase",
                  STATUS_TONE[i.status],
                )}
              >
                {i.status}
              </span>
            </div>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase",
                CAT_TONE[i.category],
              )}
            >
              {i.category}
            </span>
            <dl className="mt-3 space-y-1.5 text-[12px]">
              <Row k="Scope" v={i.scope} />
              <Row k="Cadence" v={i.cadence} />
              <Row k="Contract" v={i.contract} />
            </dl>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 p-4 text-[12px] text-muted-foreground">
        <div className="font-semibold text-foreground">Integration principles</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Signed webhooks only. HMAC over raw body with rotating secrets stored in vault.</li>
          <li>
            Every inbound event lands in the Integration Inbox first — never posts directly to the
            GL.
          </li>
          <li>
            Retries are idempotent by <code>external_id</code>; duplicates are deduped, not
            re-posted.
          </li>
          <li>
            Zoho Books stays parallel until reconciliation variance is under 0.5% for 30 days.
          </li>
        </ul>
      </Card>
    </ImplementationPage>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2">
      <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        {k}
      </dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  );
}
