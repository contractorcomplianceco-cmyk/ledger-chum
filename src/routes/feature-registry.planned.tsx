import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { FeatureTable } from "@/components/feature-registry/feature-table";
import { FEATURE_REGISTRY } from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/planned")({
  head: () => ({ meta: [{ title: "Planned Features — Feature Registry" }] }),
  component: () => {
    const rows = FEATURE_REGISTRY.filter((f) => f.status === "planned");
    return (
      <FeatureRegistryPage
        title="Planned Features"
        description="Approved for the roadmap, not yet designed or built."
      >
        <FeatureTable features={rows} />
      </FeatureRegistryPage>
    );
  },
});
