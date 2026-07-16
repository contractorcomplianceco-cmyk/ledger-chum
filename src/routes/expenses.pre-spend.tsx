import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { PRESPENDS, type PreSpendStatus } from "@/lib/mock/expenses";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/expenses/pre-spend")({
  component: PreSpendPage,
});

const STATUS_LABEL: Record<PreSpendStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", className: "bg-brand/10 text-brand" },
  needs_info: { label: "Needs Info", className: "bg-warning/15 text-warning" },
  pending_manager: { label: "Pending Manager", className: "bg-brand/10 text-brand" },
  pending_accounting: { label: "Pending Accounting", className: "bg-brand/10 text-brand" },
  pending_rose: { label: "Pending Rose", className: "bg-violet-500/10 text-violet-500" },
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
  converted: { label: "Converted", className: "bg-success/10 text-success" },
};

function PreSpendPage() {
  const [status, setStatus] = useState<"all" | PreSpendStatus>("all");
  const rows = status === "all" ? PRESPENDS : PRESPENDS.filter((p) => p.status === status);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[13px] text-muted-foreground">
          Pre-approve software, marketing, travel, and services — with cash guardrails, duplicate
          checks, and payback preview.
        </div>
        <Button size="sm" className="h-9">
          New request
        </Button>
      </div>

      <Card className="border-border/70 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              "all",
              "submitted",
              "pending_manager",
              "pending_rose",
              "approved",
              "needs_info",
              "rejected",
              "converted",
            ] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s as "all" | PreSpendStatus)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                status === s
                  ? "border-transparent bg-gradient-brand-cool text-white shadow-sm"
                  : "border-border bg-surface text-foreground/80 hover:border-foreground/20",
              )}
            >
              {s === "all" ? "All" : STATUS_LABEL[s].label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((p) => {
          const meta = STATUS_LABEL[p.status];
          return (
            <Card key={p.id} className="border-border/70 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.vendor}</span>
                    <span className="text-[11.5px] text-muted-foreground">· {p.type}</span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">
                    {p.requester} · {p.department} · Needed by {p.neededBy}
                  </div>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${meta.className} whitespace-nowrap`}
                >
                  {meta.label}
                </span>
              </div>

              <p className="mt-2 text-[13px]">{p.description}</p>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">Amount</div>
                  <div className="font-tabular font-semibold">
                    {currency(p.amount)}
                    <span className="text-[10.5px] font-normal text-muted-foreground">
                      /{p.frequency === "one_time" ? "once" : p.frequency}
                    </span>
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">Expected outcome</div>
                  <div className="text-[11.5px]">{p.expectedOutcome}</div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Payback
                  </div>
                  <div className="font-tabular font-semibold">{p.paybackMonths ?? "—"} mo</div>
                </div>
              </div>

              {p.duplicateRisk && (
                <div className="mt-3 flex items-start gap-1.5 rounded-md border border-warning/30 bg-warning/5 p-2 text-[12px] text-warning">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <strong className="font-semibold">Duplicate capability:</strong>{" "}
                    {p.duplicateRisk}
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-1.5">
                <Button size="sm" className="h-7 text-[11.5px]">
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
                  Request info
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11.5px]">
                  Reject
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
