import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { FeatureTable } from "@/components/feature-registry/feature-table";
import { FEATURE_REGISTRY } from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/all")({
  head: () => ({ meta: [{ title: "All Features — Feature Registry" }] }),
  component: () => (
    <FeatureRegistryPage
      title="All Features"
      description="Every record in the Master Feature Registry."
    >
      <FeatureTable features={FEATURE_REGISTRY} />
    </FeatureRegistryPage>
  ),
});
