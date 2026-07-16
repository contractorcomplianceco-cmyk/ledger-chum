import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Status =
  | "done"
  | "in_review"
  | "in_progress"
  | "todo"
  | "blocked"
  | "matched"
  | "needs_review"
  | "flagged"
  | "posted"
  | "draft"
  // Transaction statuses
  | "pending_review"
  | "suggested_match"
  | "categorized"
  | "split"
  | "transfer"
  | "needs_receipt"
  | "reconciled"
  | "excluded"
  // Reconciliation statuses
  | "not_started"
  | "ready_for_approval"
  | "overdue"
  | "variance";

const MAP: Record<Status, { label: string; className: string }> = {
  done: { label: "Complete", className: "bg-success/10 text-success border-success/30" },
  in_review: { label: "In review", className: "bg-info/10 text-info border-info/30" },
  in_progress: { label: "In progress", className: "bg-brand/10 text-brand border-brand/30" },
  todo: { label: "Not started", className: "bg-muted text-muted-foreground border-border" },
  blocked: {
    label: "Blocked",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  matched: { label: "Matched", className: "bg-success/10 text-success border-success/30" },
  needs_review: {
    label: "Needs review",
    className: "bg-warning/15 text-warning border-warning/40",
  },
  flagged: {
    label: "Flagged",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  posted: { label: "Posted", className: "bg-success/10 text-success border-success/30" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  pending_review: {
    label: "Pending review",
    className: "bg-warning/15 text-warning border-warning/40",
  },
  suggested_match: { label: "Suggested match", className: "bg-info/10 text-info border-info/30" },
  categorized: { label: "Categorized", className: "bg-brand/10 text-brand border-brand/30" },
  split: {
    label: "Split",
    className: "bg-brand-violet/15 text-brand-violet border-brand-violet/40",
  },
  transfer: {
    label: "Transfer",
    className: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/40",
  },
  needs_receipt: {
    label: "Needs receipt",
    className: "bg-warning/15 text-warning border-warning/40",
  },
  reconciled: { label: "Reconciled", className: "bg-success/10 text-success border-success/30" },
  excluded: { label: "Excluded", className: "bg-muted text-muted-foreground border-border" },
  not_started: { label: "Not started", className: "bg-muted text-muted-foreground border-border" },
  ready_for_approval: {
    label: "Ready for approval",
    className: "bg-info/10 text-info border-info/30",
  },
  overdue: {
    label: "Overdue",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  variance: {
    label: "Variance",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const s = MAP[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", s.className, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </Badge>
  );
}
