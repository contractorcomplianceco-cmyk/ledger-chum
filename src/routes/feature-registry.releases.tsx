import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { FeatureTable } from "@/components/feature-registry/feature-table";
import { Card } from "@/components/ui/card";
import { FEATURE_REGISTRY, RELEASE_LABELS, type ReleaseBucket } from "@/lib/mock/feature-registry";

const BUCKETS: ReleaseBucket[] = ["v1", "v1.5", "v2", "v3", "future", "post_launch"];

export const Route = createFileRoute("/feature-registry/releases")({
  head: () => ({ meta: [{ title: "Release Planning — Feature Registry" }] }),
  component: () => (
    <FeatureRegistryPage
      title="Release Planning"
      description="Feature buckets by target release. Priorities and buckets are editable in the underlying registry."
    >
      {BUCKETS.map((b) => {
        const rows = FEATURE_REGISTRY.filter((f) => f.targetRelease === b);
        return (
          <section key={b} className="space-y-2">
            <Card className="border-border/70 p-3">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold">{RELEASE_LABELS[b]}</div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {rows.length} features
                </div>
              </div>
            </Card>
            <FeatureTable features={rows} />
          </section>
        );
      })}
    </FeatureRegistryPage>
  ),
});
