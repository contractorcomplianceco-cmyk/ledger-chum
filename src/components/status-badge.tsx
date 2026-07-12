import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status =
  | "done"
  | "in_review"
  | "in_progress"
  | "todo"
  | "blocked"
  | "matched"
  | "needs_review"
  | "flagged"
  | "posted"
  | "draft";

const MAP: Record<Status, { label: string; className: string }> = {
  done: { label: "Complete", className: "bg-success/10 text-success border-success/30" },
  in_review: { label: "In review", className: "bg-info/10 text-info border-info/30" },
  in_progress: { label: "In progress", className: "bg-brand/10 text-brand border-brand/30" },
  todo: { label: "Not started", className: "bg-muted text-muted-foreground border-border" },
  blocked: { label: "Blocked", className: "bg-destructive/10 text-destructive border-destructive/30" },
  matched: { label: "Matched", className: "bg-success/10 text-success border-success/30" },
  needs_review: { label: "Needs review", className: "bg-warning/15 text-warning border-warning/40" },
  flagged: { label: "Flagged", className: "bg-destructive/10 text-destructive border-destructive/30" },
  posted: { label: "Posted", className: "bg-success/10 text-success border-success/30" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = MAP[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", s.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </Badge>
  );
}
