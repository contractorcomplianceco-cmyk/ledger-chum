import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceChip, FreshnessChip, DemoBadge } from "@/components/apex/chips";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mock/finance";
import { toast } from "sonner";
import { DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import type {
  Opportunity,
  OppEffort,
  OppStatus,
  OppImpact,
} from "@/lib/mock/apex-opportunities";

function demo(label: string) {
  toast(label, { description: DEMO_ACTION_MESSAGE });
}

/* ============ Opportunity kit ============ */

const IMPACT_TONE: Record<OppImpact, string> = {
  Revenue: "bg-emerald-500/15 text-emerald-600",
  Margin: "bg-violet-500/15 text-violet-600",
  Cost: "bg-sky-500/15 text-sky-600",
  Cash: "bg-teal-500/15 text-teal-600",
  Risk: "bg-rose-500/15 text-rose-600",
  Growth: "bg-amber-500/15 text-amber-600",
};

const EFFORT_TONE: Record<OppEffort, string> = {
  Low: "bg-success/15 text-success",
  Medium: "bg-info/15 text-info",
  High: "bg-warning/20 text-warning-foreground",
};

const STATUS_TONE: Partial<Record<OppStatus, string>> = {
  New: "bg-muted text-foreground",
  "Under Review": "bg-info/15 text-info",
  Accepted: "bg-emerald-500/15 text-emerald-700",
  "Pending Approval": "bg-amber-500/15 text-amber-700",
  Approved: "bg-emerald-500/20 text-emerald-700",
  "In Progress": "bg-sky-500/15 text-sky-700",
  Completed: "bg-emerald-500/25 text-emerald-800",
  "Outcome Measured": "bg-emerald-500/25 text-emerald-800",
  "Converted to Task": "bg-violet-500/15 text-violet-700",
  Dismissed: "bg-muted text-muted-foreground",
};

export function OpportunityImpactBadge({ impact }: { impact: OppImpact }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide", IMPACT_TONE[impact])}>
      {impact}
    </span>
  );
}

export function OpportunityEffortBadge({ effort }: { effort: OppEffort }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-semibold", EFFORT_TONE[effort])}>
      {effort} effort
    </span>
  );
}

export function OpportunityStatusBadge({ status }: { status: OppStatus }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-semibold", STATUS_TONE[status] ?? "bg-muted text-foreground")}>
      {status}
    </span>
  );
}

export function OpportunityCard({ o }: { o: Opportunity }) {
  return (
    <Card className="group flex flex-col gap-3 border-border/70 bg-surface p-4 transition hover:border-info/40 hover:shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{o.category}</span>
            <span>·</span>
            <span>{o.entity}</span>
          </div>
          <Link
            to="/apex/opportunities/$id"
            params={{ id: o.id }}
            className="mt-0.5 block text-[14px] font-semibold text-foreground hover:text-info"
          >
            {o.title}
          </Link>
          <div className="text-[11.5px] text-muted-foreground">{o.subject}</div>
        </div>
        <div className="text-right">
          <div className="text-[16px] font-bold text-foreground tabular-nums">{currency(o.financialImpact)}</div>
          <OpportunityImpactBadge impact={o.impactType} />
        </div>
      </div>

      <p className="text-[12px] text-muted-foreground line-clamp-2">{o.description}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <ConfidenceChip value={o.confidence} />
        <OpportunityEffortBadge effort={o.effort} />
        <FreshnessChip label={`TTV ${o.timeToValue}`} />
        <OpportunityStatusBadge status={o.status} />
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] text-muted-foreground">
          {o.evidence.length} evidence
        </span>
      </div>

      <div className="border-t border-border/60 pt-2 text-[11.5px] text-muted-foreground">
        <span className="font-semibold text-foreground">Next: </span>
        {o.recommendedAction}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-muted-foreground">Approver: <strong className="text-foreground">{o.approver}</strong></span>
        <span className="ml-auto flex gap-1.5">
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => demo("Opportunity accepted")}>
            Accept
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => demo("Converted to task")}>
            Convert
          </Button>
          <Link to="/apex/opportunities/$id" params={{ id: o.id }}>
            <Button size="sm" className="h-7 px-2 text-[11px]">
              Open <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </span>
      </div>
    </Card>
  );
}

/* ============ Ask LedgerOS ============ */

export function AskLedgerOS({ title = "Ask LedgerOS", prompts }: { title?: string; prompts: string[] }) {
  return (
    <Card className="border-border/70 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 dark:from-indigo-950/30 dark:via-slate-950 dark:to-cyan-950/20">
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground">
        <Sparkles className="h-3.5 w-3.5 text-info" />
        {title}
        <DemoBadge className="ml-auto" />
      </div>
      <div className="mt-3 grid gap-1.5">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => demo(`Ask LedgerOS: ${p}`)}
            className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-left text-[12px] text-foreground transition hover:border-info/60 hover:bg-info/5"
          >
            {p}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10.5px] text-muted-foreground">
        AI outputs include evidence, confidence, freshness, assumptions, and required approval.
        AI cannot post entries or move money.
      </p>
    </Card>
  );
}

/* ============ Cross-experience links ============ */

export function CrossExperienceLinks({
  opportunityId,
  dnaId,
  timelineId,
  graphNodeId,
  scenarioId,
}: {
  opportunityId?: string;
  dnaId?: string;
  timelineId?: string;
  graphNodeId?: string;
  scenarioId?: string;
}) {
  const links: Array<{ to: string; label: string; params?: Record<string, string> }> = [];
  if (opportunityId) links.push({ to: "/apex/opportunities/$id", label: "View Opportunity", params: { id: opportunityId } });
  if (dnaId) links.push({ to: "/apex/financial-dna/$id", label: "View Financial DNA", params: { id: dnaId } });
  if (timelineId) links.push({ to: "/apex/timeline/$id", label: "View Timeline", params: { id: timelineId } });
  if (graphNodeId) links.push({ to: "/apex/relationship-graph", label: "Open Relationship Graph" });
  if (scenarioId) links.push({ to: "/apex/digital-twin/scenarios/$id", label: "Run Digital Twin Scenario", params: { id: scenarioId } });
  links.push({ to: "/apex/digital-twin", label: "Digital Twin" });

  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {links.map((l) => (
        <Link
          key={l.label}
          to={l.to as never}
          params={l.params as never}
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:border-info/60 hover:bg-info/5"
        >
          {l.label} <ArrowRight className="h-3 w-3" />
        </Link>
      ))}
    </div>
  );
}

/* ============ Section shell ============ */

export function ExperienceStat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "info";
}) {
  const toneCls =
    tone === "success"
      ? "text-emerald-600"
      : tone === "warning"
        ? "text-amber-600"
        : tone === "info"
          ? "text-info"
          : "text-foreground";
  return (
    <Card className="border-border/70 bg-surface p-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-[18px] font-bold tabular-nums", toneCls)}>{value}</div>
      {hint && <div className="text-[10.5px] text-muted-foreground">{hint}</div>}
    </Card>
  );
}

export function KVRow({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-2 border-b border-border/50 py-1.5 text-[12px] last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}

export function EvidenceList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 text-[11.5px] text-muted-foreground">
      {items.map((e) => (
        <li key={e} className="flex gap-1.5">
          <Badge variant="secondary" className="h-4 w-4 shrink-0 rounded-full p-0" />
          <span>{e}</span>
        </li>
      ))}
    </ul>
  );
}
