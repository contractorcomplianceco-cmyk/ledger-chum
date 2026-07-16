import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  findFeature,
  STATUS_LABELS,
  FLAG_LABELS,
  RELEASE_LABELS,
  type FeatureRecord,
} from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/$id")({
  head: ({ params }) => {
    const f = findFeature(params.id);
    return {
      meta: [
        { title: f ? `${f.name} — Feature Registry` : "Feature — Feature Registry" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  loader: ({ params }) => {
    const f = findFeature(params.id);
    if (!f) throw notFound();
    return { feature: f };
  },
  notFoundComponent: () => (
    <FeatureRegistryPage
      title="Feature not found"
      description="No feature with that ID exists in the registry."
    >
      <Card className="border-border/70 p-4 text-[12px]">
        <Link to="/feature-registry/all" className="text-brand hover:underline">
          Back to all features
        </Link>
      </Card>
    </FeatureRegistryPage>
  ),
  component: FeatureDetail,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,180px)_1fr] gap-3 border-t border-border/60 py-2 first:border-t-0">
      <div className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-[12.5px] text-foreground">
        {value || <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

function FeatureDetail() {
  const { feature: f } = Route.useLoaderData() as { feature: FeatureRecord };
  return (
    <FeatureRegistryPage title={f.name} description={f.description}>
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Overview</div>
          <div className="mt-2">
            <Row
              label="Feature ID"
              value={<code className="font-mono text-[11.5px]">{f.id}</code>}
            />
            <Row label="Module" value={f.module} />
            <Row label="Submodule" value={f.submodule} />
            <Row label="Status" value={STATUS_LABELS[f.status]} />
            <Row label="Priority" value={f.priority} />
            <Row label="Target Release" value={RELEASE_LABELS[f.targetRelease]} />
            <Row label="Owner" value={f.owner} />
            <Row label="Reviewer" value={f.reviewer} />
            <Row label="Last Updated" value={f.lastUpdated} />
          </div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Navigation</div>
          <div className="mt-2">
            <Row
              label="Existing Route"
              value={f.existingRoute && <code className="font-mono">{f.existingRoute}</code>}
            />
            <Row
              label="Future Route"
              value={f.futureRoute && <code className="font-mono">{f.futureRoute}</code>}
            />
            <Row label="Existing Nav Group" value={f.existingNavGroup} />
            <Row label="Future Nav Group" value={f.futureNavGroup} />
            <Row label="Placement" value={f.placement} />
          </div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Access</div>
          <div className="mt-2">
            <Row label="Roles" value={f.roles.join(", ")} />
            <Row label="Permissions" value={f.permissions.join(", ")} />
            <Row label="Sensitive Data" value={f.flags.includes("sensitive_data") ? "Yes" : "No"} />
            <Row label="Security Risk" value={f.securityRisk} />
          </div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Backend & data</div>
          <div className="mt-2">
            <Row label="Backend Required" value={f.backendRequired ? "Yes" : "No"} />
            <Row label="Entities" value={(f.entities ?? []).join(", ")} />
            <Row label="Endpoints" value={(f.endpoints ?? []).join(", ")} />
            <Row label="Integrations" value={(f.integrations ?? []).join(", ")} />
            <Row label="Source Systems" value={(f.sourceSystems ?? []).join(", ")} />
          </div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Risk</div>
          <div className="mt-2">
            <Row label="Financial Impact" value={f.financialImpact} />
            <Row label="Legal Risk" value={f.legalRisk} />
            <Row label="Accounting Risk" value={f.accountingRisk} />
            <Row label="Tax Risk" value={f.taxRisk} />
            <Row label="Security Risk" value={f.securityRisk} />
          </div>
        </Card>
        <Card className="border-border/70 p-4">
          <div className="text-[13px] font-semibold">Flags</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {f.flags.length === 0 ? (
              <span className="text-[12px] text-muted-foreground">None</span>
            ) : (
              f.flags.map((fl) => (
                <Badge key={fl} variant="outline" className="text-[10.5px]">
                  {FLAG_LABELS[fl]}
                </Badge>
              ))
            )}
          </div>
        </Card>
        <Card className="border-border/70 p-4 md:col-span-2">
          <div className="text-[13px] font-semibold">Acceptance & notes</div>
          <div className="mt-2">
            <Row
              label="Acceptance Criteria"
              value={
                (f.acceptanceCriteria ?? []).length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {f.acceptanceCriteria!.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  ""
                )
              }
            />
            <Row label="Dependencies" value={(f.dependencies ?? []).join(", ")} />
            <Row label="Blocking Decisions" value={(f.blockingDecisions ?? []).join(", ")} />
            <Row label="Notes" value={f.notes} />
            <Row label="Linked Spec" value={f.linkedSpec} />
            <Row label="Linked Mock Screen" value={f.linkedMockScreen} />
            <Row label="Linked Audit Events" value={(f.linkedAuditEvents ?? []).join(", ")} />
            <Row label="Linked Test Cases" value={(f.linkedTestCases ?? []).join(", ")} />
          </div>
        </Card>
      </div>
      <div className="text-[12px]">
        <Link to="/feature-registry/all" className="text-brand hover:underline">
          ← Back to all features
        </Link>
      </div>
    </FeatureRegistryPage>
  );
}
