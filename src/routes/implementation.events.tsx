import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { EVENTS, DRAFT_MATRIX } from "@/lib/mock/implementation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/implementation/events")({
  head: () => ({ meta: [{ title: "Events & Draft-vs-Post Matrix — LedgerOS" }] }),
  component: EventsPage,
});

const BEHAVIOR_META = {
  recommendation: { label: "Recommendation", tone: "border-brand/40 bg-brand/10 text-brand" },
  task: { label: "Task", tone: "border-violet-500/40 bg-violet-500/10 text-violet-400" },
  draft: { label: "Draft", tone: "border-warning/40 bg-warning/10 text-warning" },
  approval: { label: "Approval", tone: "border-warning/40 bg-warning/10 text-warning" },
  post: { label: "Post (approved)", tone: "border-success/40 bg-success/10 text-success" },
  never_auto: {
    label: "Never auto",
    tone: "border-destructive/40 bg-destructive/10 text-destructive",
  },
} as const;

function EventsPage() {
  return (
    <ImplementationPage
      title="Events & Draft-vs-Post Matrix"
      description="Which automations may create drafts, which require approval, and which may never auto-post — the guardrails that keep LedgerOS from silently moving money."
    >
      <Card className="border-border/70 p-0">
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Event</span>
          <span>Producer</span>
          <span>Consumer</span>
          <span>Default behavior</span>
        </div>
        {EVENTS.map((e) => (
          <div
            key={e.event}
            className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_auto] items-center gap-2 border-b border-border px-4 py-2.5 text-[12px] last:border-b-0"
          >
            <code className="truncate font-mono text-[11.5px]">{e.event}</code>
            <span className="truncate text-muted-foreground">{e.producer}</span>
            <span className="truncate text-muted-foreground">{e.consumer}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
                BEHAVIOR_META[e.behavior].tone,
              )}
            >
              {BEHAVIOR_META[e.behavior].label}
            </span>
          </div>
        ))}
      </Card>

      <div>
        <h3 className="text-[14px] font-semibold">Draft-vs-post defaults</h3>
        <p className="text-[12px] text-muted-foreground">
          Automations start in the safest state. Escalations require an explicit rule change and a
          decision log entry.
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {DRAFT_MATRIX.map((d) => (
            <Card key={d.action} className="border-border/70 p-3 text-[12px]">
              <div className="font-medium">{d.action}</div>
              <div className="text-muted-foreground">{d.default}</div>
            </Card>
          ))}
        </div>
      </div>
    </ImplementationPage>
  );
}
