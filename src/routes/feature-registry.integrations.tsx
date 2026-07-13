import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { FeatureTable } from "@/components/feature-registry/feature-table";
import { FEATURE_REGISTRY } from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/integrations")({
  head: () => ({ meta: [{ title: "Integration Dependencies — Feature Registry" }] }),
  component: () => {
    const rows = FEATURE_REGISTRY.filter(
      (f) => f.flags.includes("requires_integration") || f.module === "Integrations",
    );
    return (
      <FeatureRegistryPage
        title="Integration Dependencies"
        description="Features that require an external system before production wiring."
      >
        <FeatureTable features={rows} />
      </FeatureRegistryPage>
    );
  },
});
