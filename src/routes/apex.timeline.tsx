import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mock/finance";
import {
  TIMELINE_SUBJECTS,
  TIMELINE_EVENTS,
  TIMELINE_VIEWS,
  ASK_LEDGEROS_TIMELINE,
  type TimelineView,
} from "@/lib/mock/apex-timeline";
import { AskLedgerOS } from "@/components/apex/experience-kit";

export const Route = createFileRoute("/apex/timeline")({
  head: () => ({
    meta: [
      { title: "Financial Timeline — Project APEX" },
      {
        name: "description",
        content:
          "Chronological view of every financial event on a subject with evidence and audit links.",
      },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const [subjectId, setSubjectId] = useState(TIMELINE_SUBJECTS[0].id);
  const [view, setView] = useState<TimelineView>("All Events");

  const subject = TIMELINE_SUBJECTS.find((s) => s.id === subjectId)!;
  const events = (TIMELINE_EVENTS[subjectId] ?? []).filter((e) => e.views.includes(view));

  return (
    <ApexPage
      title="Financial Timeline"
      description="Complete chronology for any company, client, invoice, payment, employee, campaign, or vendor."
      decision="What is the financial history of this subject?"
    >
      <ApexSection title="Subject">
        <div className="flex flex-wrap gap-1.5">
          {TIMELINE_SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubjectId(s.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11.5px] font-medium transition",
                subjectId === s.id
                  ? "border-info bg-info text-info-foreground"
                  : "border-border/70 bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label} <span className="ml-1 text-[10px] opacity-70">{s.type}</span>
            </button>
          ))}
        </div>
      </ApexSection>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {TIMELINE_VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-medium transition",
                  view === v
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/70 bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>

          <Card className="border-border/70 p-3">
            <div className="text-[12.5px] font-semibold text-foreground">{subject.label}</div>
            <div className="text-[11px] text-muted-foreground">{subject.summary}</div>
          </Card>

          <ol className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="relative pl-6">
                <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_0_3px_rgba(59,130,246,0.18)]" />
                <Card className="border-border/70 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>
                      {e.date} · {e.time}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                      {e.kind}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        e.status === "posted" && "bg-emerald-500/15 text-emerald-700",
                        e.status === "review" && "bg-amber-500/15 text-amber-700",
                        e.status === "draft" && "bg-muted text-muted-foreground",
                        e.status === "flagged" && "bg-rose-500/15 text-rose-700",
                      )}
                    >
                      {e.status}
                    </span>
                    <span className="ml-auto">
                      {e.source} · {e.actor}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <Link
                      to="/apex/timeline/$id"
                      params={{ id: e.id }}
                      className="text-[13px] font-semibold text-foreground hover:text-info"
                    >
                      {e.title}
                    </Link>
                    {typeof e.amount === "number" && (
                      <div className="text-[13px] font-bold tabular-nums">{currency(e.amount)}</div>
                    )}
                  </div>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">{e.explanation}</p>
                  {e.relatedIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 text-[10.5px]">
                      {e.relatedIds.map((r) => (
                        <span
                          key={r}
                          className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </li>
            ))}
            {events.length === 0 && (
              <Card className="border-dashed p-6 text-center text-[12.5px] text-muted-foreground">
                No events for this view.
              </Card>
            )}
          </ol>
        </div>

        <aside className="space-y-3">
          <AskLedgerOS prompts={ASK_LEDGEROS_TIMELINE} />
          <Card className="border-border/70 p-4">
            <div className="text-[12.5px] font-semibold text-foreground">Cross-experience</div>
            <ul className="mt-2 space-y-1 text-[11.5px]">
              <li>
                <Link to="/apex/financial-dna" className="text-info hover:underline">
                  View related DNA
                </Link>
              </li>
              <li>
                <Link to="/apex/relationship-graph" className="text-info hover:underline">
                  Open Relationship Graph
                </Link>
              </li>
              <li>
                <Link to="/apex/opportunities" className="text-info hover:underline">
                  View source opportunities
                </Link>
              </li>
              <li>
                <Link to="/apex/digital-twin" className="text-info hover:underline">
                  Simulate change
                </Link>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </ApexPage>
  );
}
