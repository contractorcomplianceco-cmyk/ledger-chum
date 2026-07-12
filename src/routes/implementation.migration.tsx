import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { MIGRATION_STAGES } from "@/lib/mock/implementation";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export const Route = createFileRoute("/implementation/migration")({
  head: () => ({ meta: [{ title: "Migration Plan — LedgerOS" }] }),
  component: MigrationPage,
});

function MigrationPage() {
  return (
    <ImplementationPage
      title="Migration Plan"
      description="Staged handoff from mock UI to production. Each stage has an entry criterion, an exit criterion, and an owner. LedgerOS runs parallel to Zoho Books before it replaces it."
    >
      <Card className="border-border/70 p-0">
        <ol className="divide-y divide-border">
          {MIGRATION_STAGES.map((s, i) => {
            const Icon = s.state === "done" ? CheckCircle2 : s.state === "in_progress" ? Clock : Circle;
            const tone =
              s.state === "done" ? "text-success" : s.state === "in_progress" ? "text-warning" : "text-muted-foreground";
            return (
              <li key={s.stage} className="grid grid-cols-[36px_minmax(0,1fr)_120px] items-start gap-3 px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                  <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>
                  <Icon className={cn("h-4 w-4", tone)} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold">{s.stage}</div>
                  <div className="text-[12px] text-muted-foreground">{s.detail}</div>
                </div>
                <span
                  className={cn(
                    "justify-self-end rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase",
                    s.state === "done"
                      ? "border-success/40 bg-success/10 text-success"
                      : s.state === "in_progress"
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
                  )}
                >
                  {s.state.replace("_", " ")}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="border-border/70 p-4 text-[12px] text-muted-foreground">
        <div className="font-semibold text-foreground">Rollback plan</div>
        <p className="mt-1">Zoho Books stays read-writable until stage 9. At any point through stage 8, rollback = disable LedgerOS mutations, keep read-only reporting, resume Zoho Books as system of record. No data is deleted; all journal proposals remain in draft.</p>
      </Card>
    </ImplementationPage>
  );
}
