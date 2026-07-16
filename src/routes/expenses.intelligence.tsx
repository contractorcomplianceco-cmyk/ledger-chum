import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AnomalyCard } from "@/components/expenses/anomaly-card";
import { ANOMALIES, type AnomalySeverity } from "@/lib/mock/expenses";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/intelligence")({
  component: AnomalyReviewPage,
});

const SEV: Array<{ id: "all" | AnomalySeverity; label: string }> = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

function AnomalyReviewPage() {
  const [sev, setSev] = useState<"all" | AnomalySeverity>("all");
  const rows = sev === "all" ? ANOMALIES : ANOMALIES.filter((a) => a.severity === sev);

  return (
    <div className="space-y-4">
      <Card className="border-border/70 p-4">
        <h3 className="text-[13px] font-semibold">Expense intelligence · anomaly review</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Every alert explains why it fired, its financial impact, and a recommended action.
          Confidence and evidence are always shown.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {SEV.map((s) => (
            <button
              key={s.id}
              onClick={() => setSev(s.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                sev === s.id
                  ? "border-transparent bg-gradient-brand-cool text-white shadow-sm"
                  : "border-border bg-surface text-foreground/80 hover:border-foreground/20",
              )}
            >
              {s.label}
              <span className="ml-1.5 rounded-full bg-black/10 px-1 text-[10px]">
                {s.id === "all"
                  ? ANOMALIES.length
                  : ANOMALIES.filter((a) => a.severity === s.id).length}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 xl:grid-cols-2">
        {rows.map((a) => (
          <AnomalyCard key={a.id} a={a} />
        ))}
        {rows.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border p-10 text-center text-[13px] text-muted-foreground">
            No anomalies at this severity.
          </div>
        )}
      </div>
    </div>
  );
}
