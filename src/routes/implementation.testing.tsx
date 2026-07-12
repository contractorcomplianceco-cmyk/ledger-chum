import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { TEST_SUITES } from "@/lib/mock/implementation";

export const Route = createFileRoute("/implementation/testing")({
  head: () => ({ meta: [{ title: "Acceptance Test Plan — LedgerOS" }] }),
  component: TestingPage,
});

const CRITERIA = [
  "Every mutation writes an audit event with actor, before, after.",
  "No workflow may auto-post value to the GL without an approval trail.",
  "Every displayed number must resolve back to source records via lineage links.",
  "Every integration failure must open an exception, retry with backoff, and resolve without duplicate posting.",
  "Every guardrail override must expire and require re-approval.",
  "Every role in the permission matrix is validated end-to-end.",
];

function TestingPage() {
  return (
    <ImplementationPage
      title="Acceptance Test Plan"
      description="Ten end-to-end workflow tests. Each covers a full LedgerOS journey — from event to audit — across the modules involved."
    >
      <Card className="border-border/70 p-0">
        <div className="grid grid-cols-[60px_minmax(0,3fr)_80px_minmax(0,1.6fr)] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>ID</span>
          <span>Workflow</span>
          <span>Steps</span>
          <span>Coverage</span>
        </div>
        {TEST_SUITES.map((t) => (
          <div key={t.id} className="grid grid-cols-[60px_minmax(0,3fr)_80px_minmax(0,1.6fr)] items-center gap-2 border-b border-border px-4 py-2.5 text-[12px] last:border-b-0">
            <code className="font-mono text-[11.5px] font-semibold">{t.id}</code>
            <span>{t.name}</span>
            <span className="font-tabular text-muted-foreground">{t.steps}</span>
            <span className="text-muted-foreground">{t.coverage}</span>
          </div>
        ))}
      </Card>

      <Card className="border-border/70 p-4 text-[12px]">
        <div className="text-[13px] font-semibold">Universal pass criteria</div>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
          {CRITERIA.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </Card>
    </ImplementationPage>
  );
}
