import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { KpiCard } from "@/components/feature-registry/feature-table";
import {
  FEATURE_REGISTRY,
  REGISTRY_STATS,
  RELEASE_LABELS,
  STATUS_LABELS,
  FLAG_LABELS,
} from "@/lib/mock/feature-registry";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/feature-registry/")({
  head: () => ({
    meta: [
      { title: "Master Feature Registry — LedgerOS" },
      {
        name: "description",
        content:
          "Authoritative source of truth for every LedgerOS feature: status, dependencies, releases, and blockers.",
      },
    ],
  }),
  component: Summary,
});

function Summary() {
  const stats = REGISTRY_STATS();
  const flag = (k: string) => stats.byFlag[k] ?? 0;
  const status = (k: string) => stats.byStatus[k] ?? 0;
  const rel = (k: string) => stats.byRelease[k] ?? 0;

  return (
    <FeatureRegistryPage
      title="Master Feature Registry"
      description="Every LedgerOS feature discussed — with current status, blockers, release bucket, and future navigation location."
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Features" value={stats.total} sub="All modules combined" />
        <KpiCard label="Built" value={status("built")} sub="Shipped in production" />
        <KpiCard
          label="Mock UI Complete"
          value={status("mock_ui_complete")}
          sub="Design Lab screen exists"
        />
        <KpiCard
          label="Typed / API Ready"
          value={status("typed_api_ready") + status("designed")}
          sub="Contract-ready"
        />
        <KpiCard label="Planned" value={status("planned")} sub="Awaiting design or build" />
        <KpiCard
          label="Blocked"
          value={
            status("blocked_policy") +
            status("blocked_legal") +
            status("blocked_accounting") +
            status("blocked_integration") +
            status("blocked_backend")
          }
          sub="Blocked by policy, legal, accounting, integration, or backend"
        />
        <KpiCard
          label="Requires Backend"
          value={flag("requires_backend")}
          sub="Cannot ship without server"
        />
        <KpiCard
          label="Requires Integration"
          value={flag("requires_integration")}
          sub="External system dependency"
        />
        <KpiCard
          label="Requires Legal Review"
          value={flag("requires_legal_review")}
          sub="Legal sign-off gate"
        />
        <KpiCard
          label="Requires Accountant Review"
          value={flag("requires_accountant_review")}
          sub="Christin / Carmen gate"
        />
        <KpiCard
          label="Production Critical"
          value={flag("production_critical")}
          sub="Must ship before launch"
        />
        <KpiCard
          label="Sensitive Data"
          value={flag("sensitive_data")}
          sub="PII / financial sensitivity"
        />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Release plan</div>
          <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
            {(["v1", "v1.5", "v2", "v3", "future", "post_launch"] as const).map((k) => (
              <li key={k} className="flex justify-between">
                <span>{RELEASE_LABELS[k]}</span>
                <span className="font-mono text-foreground">{rel(k)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Status distribution</div>
          <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
            {(Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>).map((k) => (
              <li key={k} className="flex justify-between">
                <span>{STATUS_LABELS[k]}</span>
                <span className="font-mono text-foreground">{status(k)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Blocker flags</div>
          <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
            {(Object.keys(FLAG_LABELS) as Array<keyof typeof FLAG_LABELS>)
              .filter((k) => flag(k) > 0)
              .map((k) => (
                <li key={k} className="flex justify-between">
                  <span>{FLAG_LABELS[k]}</span>
                  <span className="font-mono text-foreground">{flag(k)}</span>
                </li>
              ))}
          </ul>
        </Card>
      </section>

      <Card className="border-border/70 p-4 text-[12px] text-muted-foreground">
        <div className="font-semibold text-foreground">How to use the registry</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Every feature has one authoritative record — never duplicate.</li>
          <li>
            Status transitions are: Planned → Designed → Typed/API Ready → In Production Build →
            Ready for Testing → Ready for Parallel Run → Ready for Cutover → Built.
          </li>
          <li>
            Blocked statuses require a documented owner and unblock plan; see Legal & Accounting and
            Integrations views.
          </li>
          <li>No planned feature is added to the live sidebar until it moves to Built.</li>
          <li>
            Backend, database, Supabase, or auth changes are out of scope for this planning phase.
          </li>
        </ul>
        <div className="mt-2 text-[11.5px]">
          Total records:{" "}
          <span className="font-mono text-foreground">{FEATURE_REGISTRY.length}</span>
        </div>
      </Card>
    </FeatureRegistryPage>
  );
}
