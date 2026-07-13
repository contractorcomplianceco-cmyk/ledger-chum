import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FEATURE_REGISTRY,
  STATUS_LABELS,
  RELEASE_LABELS,
  type FeatureRecord,
  type FeatureStatus,
} from "@/lib/mock/feature-registry";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<FeatureStatus, string> = {
  built: "border-success/40 bg-success/10 text-success",
  mock_ui_complete: "border-brand/40 bg-brand/10 text-brand",
  typed_api_ready: "border-info/40 bg-info/10 text-info",
  designed: "border-info/40 bg-info/10 text-info",
  planned: "border-border bg-muted text-muted-foreground",
  blocked_policy: "border-warning/40 bg-warning/10 text-warning",
  blocked_legal: "border-destructive/40 bg-destructive/10 text-destructive",
  blocked_accounting: "border-destructive/40 bg-destructive/10 text-destructive",
  blocked_integration: "border-warning/40 bg-warning/10 text-warning",
  blocked_backend: "border-warning/40 bg-warning/10 text-warning",
  in_production_build: "border-brand/40 bg-brand/10 text-brand",
  ready_for_testing: "border-info/40 bg-info/10 text-info",
  ready_for_parallel_run: "border-info/40 bg-info/10 text-info",
  ready_for_cutover: "border-success/40 bg-success/10 text-success",
  post_launch: "border-border bg-muted text-muted-foreground",
};

export function FeatureTable({ features }: { features: FeatureRecord[] }) {
  return (
    <Card className="border-border/70 p-0 overflow-hidden">
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_80px_minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Feature</span>
        <span>Module</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Release</span>
        <span>Route</span>
        <span>Flags</span>
      </div>
      {features.map((f) => (
        <Link
          key={f.id}
          to="/feature-registry/$id"
          params={{ id: f.id }}
          className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_80px_minmax(0,1fr)_minmax(0,1.2fr)_auto] items-center gap-2 border-b border-border px-4 py-2.5 text-[12px] last:border-b-0 hover:bg-muted/20"
        >
          <span className="truncate font-medium text-foreground">{f.name}</span>
          <span className="truncate text-muted-foreground">{f.module}</span>
          <span
            className={cn(
              "truncate rounded-full border px-2 py-0.5 text-[10.5px] font-semibold text-center",
              STATUS_TONE[f.status],
            )}
          >
            {STATUS_LABELS[f.status]}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">{f.priority}</span>
          <span className="truncate text-[11px] text-muted-foreground">
            {RELEASE_LABELS[f.targetRelease].split(" — ")[0]}
          </span>
          <code className="truncate font-mono text-[11px] text-muted-foreground">
            {f.existingRoute ?? "—"}
          </code>
          <div className="flex flex-wrap gap-1 justify-end">
            {f.flags.slice(0, 3).map((fl) => (
              <Badge key={fl} variant="outline" className="h-4 px-1 text-[9.5px] font-medium">
                {fl.replace(/_/g, " ")}
              </Badge>
            ))}
            {f.flags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{f.flags.length - 3}</span>
            )}
          </div>
        </Link>
      ))}
      {features.length === 0 && (
        <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">
          No features match this view.
        </div>
      )}
    </Card>
  );
}

export function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-tabular text-[24px] font-bold text-foreground">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </Card>
  );
}

export function useRegistry() {
  return FEATURE_REGISTRY;
}
