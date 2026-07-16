import { createFileRoute, Link } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_ORDER, ROLE_WORKSPACES } from "@/lib/mock/apex-role-workspaces";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apex/workspaces/")({
  head: () => ({
    meta: [
      { title: "Role Workspaces — Project APEX" },
      {
        name: "description",
        content:
          "Purpose-built operating environments per role — Owner, Accounting, Sales, Operations, Systems, Team.",
      },
    ],
  }),
  component: WorkspacesIndex,
});

function WorkspacesIndex() {
  return (
    <ApexPage
      title="Role Workspaces"
      description="Every role gets a purpose-built operating environment. Sensitive data is masked by role. Preview any role below."
      decision="Which operating environment fits the role in front of me?"
    >
      <ApexSection title="Available role workspaces">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ROLE_ORDER.map((key) => {
            const ws = ROLE_WORKSPACES[key];
            return (
              <Link
                key={key}
                to="/apex/workspaces/$role"
                params={{ role: ws.slug }}
                className="group block"
              >
                <Card className="h-full overflow-hidden border-border/70 p-0 transition hover:border-primary/60">
                  <div className={cn("bg-gradient-to-br p-4 text-white", ws.theme.soft)}>
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      {ws.name}
                    </div>
                    <div className="mt-1 text-[16px] font-semibold">{ws.title}</div>
                    <div className="mt-2 text-[12px] text-white/80">{ws.subtitle}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-white/30 bg-white/10 text-[10px] text-white",
                          ws.theme.accent,
                        )}
                      >
                        Health {ws.healthScore.value}
                      </Badge>
                      <span className="text-[11px] text-white/70">{ws.healthScore.label}</span>
                    </div>
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Primary decision
                    </div>
                    <div className="text-[12.5px] text-foreground">{ws.decisionQuestion}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Sensitive data:{" "}
                      <span className={ws.sensitiveVisible ? "text-emerald-600" : "text-rose-600"}>
                        {ws.sensitiveVisible ? "permitted" : "masked"}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </ApexSection>
    </ApexPage>
  );
}
