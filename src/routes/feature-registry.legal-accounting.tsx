import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { FeatureTable } from "@/components/feature-registry/feature-table";
import { FEATURE_REGISTRY } from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/legal-accounting")({
  head: () => ({ meta: [{ title: "Legal & Accounting Review — Feature Registry" }] }),
  component: () => {
    const rows = FEATURE_REGISTRY.filter(
      (f) =>
        f.flags.includes("requires_legal_review") ||
        f.flags.includes("requires_accountant_review") ||
        f.flags.includes("requires_tax_review"),
    );
    return (
      <FeatureRegistryPage
        title="Legal & Accounting Review Register"
        description="Every feature that requires legal, accounting, or tax review before production."
      >
        <FeatureTable features={rows} />
      </FeatureRegistryPage>
    );
  },
});
