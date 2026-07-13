import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { FeatureTable } from "@/components/feature-registry/feature-table";
import { FEATURE_REGISTRY, isBuiltOrMock } from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/built")({
  head: () => ({ meta: [{ title: "Built / Mock Features — Feature Registry" }] }),
  component: () => {
    const rows = FEATURE_REGISTRY.filter(isBuiltOrMock);
    return (
      <FeatureRegistryPage
        title="Built / Mock UI Complete"
        description="Features already shipped or represented by a working Design Lab screen."
      >
        <FeatureTable features={rows} />
      </FeatureRegistryPage>
    );
  },
});
