import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import type { CompensationApproval } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

const TABS = ["awaiting", "manager", "accounting", "owner", "legal", "high_value", "margin_override", "policy_override", "manual_adjustment", "clawback", "approved", "rejected"] as const;

export const Route = createFileRoute("/compensation/approvals")({
  head: () => ({ meta: [{ title: "Approval Center — LedgerOS" }] }),
  component: Approvals,
});

function Approvals() {
  const [rows, setRows] = useState<CompensationApproval[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("awaiting");

  useEffect(() => { api.compensationOps.listApprovals().then(setRows); }, []);

  const filtered = useMemo(() => {
    if (tab === "awaiting") return rows.filter((r) => r.status === "awaiting");
    if (tab === "approved") return rows.filter((r) => r.status === "approved" || r.status === "approved_with_conditions");
    if (tab === "rejected") return rows.filter((r) => r.status === "rejected");
    return rows.filter((r) => r.requiredApproval === tab);
  }, [rows, tab]);

  return (
    <CompensationShell
      title="Approval Center"
      description="Owner approval required for high-value, manual overrides, below-margin, legal exceptions, clawbacks, post-termination disputes, and investor-related compensation."
    >
      <Card className="p-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)} className="h-8 capitalize">{t.replace(/_/g, " ")}</Button>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((a) => (
          <Card key={a.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{a.participantName}</div>
              <Badge variant="outline">{a.requiredApproval.replace(/_/g, " ")}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">{a.planName} · {a.compensationClass}</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><div className="text-xs text-muted-foreground">Amount</div><div className="font-tabular font-semibold">{currency(a.amount)}</div></div>
              <div><div className="text-xs text-muted-foreground">Margin</div><div className="font-tabular">{(a.marginImpact * 100).toFixed(1)}%</div></div>
              <div><div className="text-xs text-muted-foreground">Reserve</div><div className="font-tabular">{currency(a.reserveImpact)}</div></div>
            </div>
            <div className="text-xs">Recommendation: <span className="italic">{a.recommendation}</span></div>
            {a.riskFlags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {a.riskFlags.map((f) => <Badge key={f} variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">{f}</Badge>)}
              </div>
            )}
            <div className="text-[11px] text-muted-foreground">Deadline: {a.deadline ?? "—"} · Status: {a.status}</div>
            {a.status === "awaiting" && (
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" onClick={() => showDemoToast("Approved")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => showDemoToast("Approved with conditions")}>Approve w/ conditions</Button>
                <Button size="sm" variant="ghost" onClick={() => showDemoToast("Changes requested")}>Request changes</Button>
                <Button size="sm" variant="ghost" onClick={() => showDemoToast("Held")}>Hold</Button>
                <Button size="sm" variant="ghost" onClick={() => showDemoToast("Rejected")}>Reject</Button>
                <Button size="sm" variant="ghost" onClick={() => showDemoToast("Escalated")}>Escalate</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      <DemoActionNotice />
    </CompensationShell>
  );
}
