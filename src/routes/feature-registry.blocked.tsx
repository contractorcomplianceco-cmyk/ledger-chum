import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { FeatureTable } from "@/components/feature-registry/feature-table";
import { FEATURE_REGISTRY, isBlocked } from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/blocked")({
  head: () => ({ meta: [{ title: "Blocked Features — Feature Registry" }] }),
  component: () => {
    const rows = FEATURE_REGISTRY.filter(isBlocked);
    return (
      <FeatureRegistryPage
        title="Blocked Features"
        description="Blocked by policy, legal, accounting, integration, or backend readiness."
      >
        <FeatureTable features={rows} />
      </FeatureRegistryPage>
    );
  },
});
