import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { Card } from "@/components/ui/card";
import { FEATURE_REGISTRY } from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/dependencies")({
  head: () => ({ meta: [{ title: "Dependency Map — Feature Registry" }] }),
  component: () => {
    const withDeps = FEATURE_REGISTRY.filter(
      (f) => (f.dependencies?.length ?? 0) > 0 || (f.blockingDecisions?.length ?? 0) > 0,
    );
    return (
      <FeatureRegistryPage
        title="Dependency Map"
        description="Parent, blocking, integration, policy, legal, accounting, data, and release dependencies."
      >
        <Card className="border-border/70 p-4 text-[12px] text-muted-foreground">
          Dependency records are captured at the feature level. Legal, accounting, and integration
          blockers are visible in the flag columns of every feature table. Full transitive
          dependency graphs will be generated at production-build handoff time.
        </Card>
        <Card className="border-border/70 p-0 overflow-hidden">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Feature</span>
            <span>Dependencies</span>
            <span>Blocking decisions</span>
          </div>
          {withDeps.length === 0 && (
            <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">
              No explicit inter-feature dependencies registered yet. Legal, accounting, and
              integration flags on each feature carry the blockers.
            </div>
          )}
          {withDeps.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)] gap-2 border-b border-border px-4 py-2 text-[12px] last:border-b-0"
            >
              <span className="truncate">{f.name}</span>
              <span className="truncate text-muted-foreground">
                {(f.dependencies ?? []).join(", ") || "—"}
              </span>
              <span className="truncate text-muted-foreground">
                {(f.blockingDecisions ?? []).join(", ") || "—"}
              </span>
            </div>
          ))}
        </Card>
      </FeatureRegistryPage>
    );
  },
});
