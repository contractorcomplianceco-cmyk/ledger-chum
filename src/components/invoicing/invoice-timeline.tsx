import type { TimelineEvent } from "@/lib/mock/invoicing";
import { Card } from "@/components/ui/card";

export function InvoiceTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <Card className="border border-border/70 bg-surface p-4 shadow-card">
      <div className="text-[13.5px] font-semibold text-foreground">Activity timeline</div>
      <div className="mt-1 text-[11.5px] text-muted-foreground">Every action leaves an audit trail</div>
      <ol className="mt-4 space-y-3">
        {events.map((e, i) => (
          <li key={i} className="relative pl-6">
            <span className="absolute left-0 top-1 grid h-4 w-4 place-items-center rounded-full bg-gradient-brand-cool text-[9px] font-bold text-white shadow-[0_0_0_3px_rgba(59,130,246,0.14)]">
              {i + 1}
            </span>
            <div className="text-[12.5px] font-medium text-foreground">{e.action}</div>
            <div className="mt-0.5 text-[10.5px] text-muted-foreground">
              {e.at} · {e.actor}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
