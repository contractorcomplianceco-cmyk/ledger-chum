import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PolicyBadge } from "@/components/expenses/policy-badge";
import { POLICIES, type Policy } from "@/lib/mock/expenses";
import { Plus, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/policies")({
  component: PoliciesPage,
});

const SEV_ICON = { info: ShieldCheck, warning: AlertTriangle, critical: ShieldAlert };
const SEV_TONE = { info: "text-brand", warning: "text-warning", critical: "text-destructive" };

function PoliciesPage() {
  const [selected, setSelected] = useState<Policy>(POLICIES[0]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[13px] text-muted-foreground">
          <strong className="font-semibold text-foreground">{POLICIES.filter((p) => p.active).length}</strong> active policies enforcing receipts, thresholds, attribution, and duplicates.
        </div>
        <Button size="sm" className="h-9"><Plus className="mr-1.5 h-3.5 w-3.5" /> New policy</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-border/70 p-0 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Policy</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Applies to</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2 text-right">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {POLICIES.map((p) => {
                const Icon = SEV_ICON[p.severity];
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={cn("cursor-pointer", selected.id === p.id ? "bg-brand/5" : "hover:bg-muted/30")}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-3.5 w-3.5", SEV_TONE[p.severity])} />
                        <div className="font-medium">{p.name}</div>
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">{p.condition}</div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{p.category}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.applies}</td>
                    <td className="px-3 py-2"><PolicyBadge result={p.action} /></td>
                    <td className="px-3 py-2 text-right">
                      <Switch defaultChecked={p.active} onClick={(e) => e.stopPropagation()} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card className="border-border/70 p-5">
          <div className="flex items-center gap-2">
            {(() => { const Icon = SEV_ICON[selected.severity]; return <Icon className={cn("h-4 w-4", SEV_TONE[selected.severity])} />; })()}
            <h3 className="text-[13px] font-semibold">{selected.name}</h3>
          </div>
          <div className="mt-3 space-y-2 text-[12.5px]">
            <Row label="Category" value={selected.category} />
            <Row label="Applies to" value={selected.applies} />
            <Row label="Condition" value={selected.condition} />
            {selected.threshold && <Row label="Threshold" value={selected.threshold} />}
            <Row label="Severity" value={selected.severity} />
            <Row label="Owner" value={selected.owner} />
          </div>

          <div className="mt-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Result on violation</div>
            <div className="mt-1"><PolicyBadge result={selected.action} /></div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">All possible results</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <PolicyBadge result="compliant" />
              <PolicyBadge result="warning" />
              <PolicyBadge result="explanation_required" />
              <PolicyBadge result="approval_required" />
              <PolicyBadge result="blocked" />
              <PolicyBadge result="possible_duplicate" />
              <PolicyBadge result="missing_documentation" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" className="h-8">Edit rule</Button>
            <Button size="sm" variant="outline" className="h-8">Test against history</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium capitalize">{value}</span>
    </div>
  );
}
