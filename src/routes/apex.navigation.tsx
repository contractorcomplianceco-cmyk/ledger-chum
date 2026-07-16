import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";
import { EXECUTIVE_WORKSPACES } from "@/lib/mock/nav-executive";
import { NavModeSwitcher } from "@/components/apex/nav-mode-switcher";

export const Route = createFileRoute("/apex/navigation")({
  head: () => ({ meta: [{ title: "Navigation 3.0 — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Navigation 3.0"
      description="Executive Workspace overlay: Home · Money · Growth · People · Company. Operational navigation remains available and is the default."
    >
      <ApexSection title="Nav mode preview">
        <div className="max-w-sm rounded-2xl border border-border/70 bg-gradient-to-br from-slate-950 to-indigo-950 p-4">
          <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Preview switcher
          </div>
          <NavModeSwitcher />
          <div className="mt-2 text-[11.5px] text-white/70">
            Preference persists to <code className="font-mono">localStorage</code> key{" "}
            <code className="font-mono">ledgeros.nav-mode</code>.
          </div>
        </div>
      </ApexSection>

      {EXECUTIVE_WORKSPACES.filter((w) => w.id !== "admin").map((w) => (
        <ApexSection key={w.id} title={`${w.title} workspace`} description={w.decision}>
          <Card className="border-border/70 p-3">
            <div className="grid gap-1 text-[12px] sm:grid-cols-2 lg:grid-cols-3">
              {w.items.map((i) => (
                <div
                  key={i.to}
                  className="flex items-center justify-between gap-2 border-b border-border/50 py-1 last:border-b-0"
                >
                  <span className="truncate">{i.title}</span>
                  <code className="truncate font-mono text-[11px] text-muted-foreground">
                    {i.to}
                  </code>
                </div>
              ))}
            </div>
          </Card>
        </ApexSection>
      ))}
    </ApexPage>
  ),
});
