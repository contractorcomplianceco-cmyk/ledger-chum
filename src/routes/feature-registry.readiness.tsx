import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { KpiCard } from "@/components/feature-registry/feature-table";
import { Card } from "@/components/ui/card";
import { FEATURE_REGISTRY, REGISTRY_STATS } from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/readiness")({
  head: () => ({ meta: [{ title: "Production Readiness — Feature Registry" }] }),
  component: () => {
    const s = REGISTRY_STATS();
    const v1 = FEATURE_REGISTRY.filter((f) => f.targetRelease === "v1");
    const v1Built = v1.filter((f) =>
      ["built", "mock_ui_complete", "typed_api_ready", "designed"].includes(f.status),
    ).length;
    const v1Blocked = v1.filter((f) => f.status.startsWith("blocked")).length;
    const readinessPct = Math.round((v1Built / Math.max(1, v1.length)) * 100);

    return (
      <FeatureRegistryPage
        title="Production Readiness"
        description="How close each release bucket is to production, and what still blocks V1."
      >
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="V1 features" value={v1.length} />
          <KpiCard
            label="V1 designed or built"
            value={v1Built}
            sub={`${readinessPct}% covered by mocks or design`}
          />
          <KpiCard
            label="V1 blocked"
            value={v1Blocked}
            sub="Requires legal / integration / backend"
          />
          <KpiCard label="Production critical" value={s.byFlag["production_critical"] ?? 0} />
        </section>
        <Card className="border-border/70 p-4 text-[12px] text-muted-foreground">
          <div className="font-semibold text-foreground">Notes</div>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              Every V1 feature must have Christin or Carmen review recorded before parallel-run.
            </li>
            <li>
              Backend, Supabase, and auth changes are explicitly excluded from this planning phase.
            </li>
            <li>
              Owner Transactions, Profit Sharing, Investor Distributions, and Check Writing require
              legal + tax review before implementation.
            </li>
            <li>Dormant Pass-Through Review requires escheatment-policy sign-off.</li>
          </ul>
        </Card>
      </FeatureRegistryPage>
    );
  },
});
