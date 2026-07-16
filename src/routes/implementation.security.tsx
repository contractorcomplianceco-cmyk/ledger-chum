import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { SECURITY_CONTROLS } from "@/lib/mock/implementation";

export const Route = createFileRoute("/implementation/security")({
  head: () => ({ meta: [{ title: "Security & Data Lineage — LedgerOS" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <ImplementationPage
      title="Security & Data Lineage"
      description="Authentication, authorization, secrets, PII, audit, and automation guardrails. Every number in LedgerOS must survive an audit."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {SECURITY_CONTROLS.map((c) => (
          <Card key={c.control} className="border-border/70 p-4">
            <div className="text-[13px] font-semibold">{c.control}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">{c.detail}</div>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 p-4 text-[12px]">
        <div className="text-[13px] font-semibold">Non-negotiables</div>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            Cash transfers between accounts are always human-initiated. No automation may move
            funds.
          </li>
          <li>
            Subscription cancellations require a human confirmation — LedgerOS surfaces the action
            but never executes.
          </li>
          <li>
            Any journal posted by a rule must include the rule id, rule version, and the approver.
          </li>
          <li>
            All sensitive exports (payroll, bank data) require MFA re-auth within the last 5
            minutes.
          </li>
          <li>
            Automation may not disable another automation. Rule changes go through the Decision Log.
          </li>
        </ul>
      </Card>
    </ImplementationPage>
  );
}
