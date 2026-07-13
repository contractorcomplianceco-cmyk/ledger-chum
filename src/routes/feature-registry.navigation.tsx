import { createFileRoute } from "@tanstack/react-router";
import { FeatureRegistryPage } from "@/components/feature-registry/feature-registry-page";
import { Card } from "@/components/ui/card";
import { FEATURE_REGISTRY, FUTURE_NAV_MAP } from "@/lib/mock/feature-registry";

export const Route = createFileRoute("/feature-registry/navigation")({
  head: () => ({ meta: [{ title: "Future Navigation Map — Feature Registry" }] }),
  component: () => (
    <FeatureRegistryPage
      title="Future Navigation Map"
      description="Planned sidebar structure. Not the live navigation — planned modules stay hidden until built."
    >
      {FUTURE_NAV_MAP.map((g) => {
        const rows = FEATURE_REGISTRY.filter((f) => f.futureNavGroup === g.id);
        return (
          <Card key={g.id} className="border-border/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold">{g.title}</div>
                <div className="text-[12px] text-muted-foreground">{g.description}</div>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {rows.length} features
              </div>
            </div>
            <div className="mt-3 grid gap-1 text-[12px]">
              {rows.slice(0, 40).map((f) => (
                <div
                  key={f.id}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center gap-2 border-t border-border/60 py-1.5 first:border-t-0"
                >
                  <span className="truncate">{f.name}</span>
                  <span className="truncate text-muted-foreground">{f.module}</span>
                  <span className="truncate text-[11px] text-muted-foreground">{f.placement}</span>
                  <code className="truncate font-mono text-[11px] text-muted-foreground">
                    {f.existingRoute ?? "—"}
                  </code>
                </div>
              ))}
              {rows.length > 40 && (
                <div className="pt-1 text-[11px] text-muted-foreground">
                  … {rows.length - 40} more
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </FeatureRegistryPage>
  ),
});
