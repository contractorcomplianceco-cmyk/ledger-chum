import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CompensationShell, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type {
  CompensationPlan,
  CompensationPlanStatus,
} from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";
import { Plus, Filter } from "lucide-react";

export const Route = createFileRoute("/compensation/plans/")({
  head: () => ({
    meta: [
      { title: "Compensation Plans — LedgerOS" },
      {
        name: "description",
        content:
          "Compensation plan library with saved views for active, draft, pending, and legal-review states.",
      },
    ],
  }),
  component: PlansPage,
});

type SavedView =
  | "all"
  | "active"
  | "draft"
  | "pending_approval"
  | "future_effective"
  | "expiring_soon"
  | "inactive"
  | "requires_legal_review"
  | "requires_accounting_review"
  | "tara"
  | "sales"
  | "software"
  | "custom_overrides";

const VIEWS: Array<{ key: SavedView; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "pending_approval", label: "Pending Approval" },
  { key: "future_effective", label: "Future Effective" },
  { key: "expiring_soon", label: "Expiring Soon" },
  { key: "inactive", label: "Inactive" },
  { key: "requires_legal_review", label: "Requires Legal Review" },
  { key: "requires_accounting_review", label: "Requires Accounting Review" },
  { key: "tara", label: "Tara Plans" },
  { key: "sales", label: "Sales Plans" },
  { key: "software", label: "Software Participation" },
  { key: "custom_overrides", label: "Custom Overrides" },
];

function statusTone(s: CompensationPlanStatus): string {
  switch (s) {
    case "active":
      return "border-success/40 bg-success/10 text-success";
    case "draft":
      return "border-border bg-muted text-muted-foreground";
    case "pending_approval":
    case "requires_accounting_review":
      return "border-warning/40 bg-warning/10 text-warning";
    case "requires_legal_review":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "future_effective":
      return "border-info/40 bg-info/10 text-info";
    case "expiring_soon":
      return "border-warning/40 bg-warning/10 text-warning";
    case "inactive":
      return "border-border bg-muted text-muted-foreground";
  }
}

function PlansPage() {
  const [plans, setPlans] = useState<CompensationPlan[]>([]);
  const [view, setView] = useState<SavedView>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.compensation.listPlans().then((r) => setPlans(r.data));
  }, []);

  const filtered = useMemo(() => {
    let base = plans;
    switch (view) {
      case "active":
        base = base.filter((p) => p.status === "active");
        break;
      case "draft":
        base = base.filter((p) => p.status === "draft");
        break;
      case "pending_approval":
        base = base.filter((p) => p.status === "pending_approval");
        break;
      case "future_effective":
        base = base.filter((p) => new Date(p.effectiveDate) > new Date());
        break;
      case "expiring_soon":
        base = base.filter((p) => p.expirationDate && new Date(p.expirationDate).getTime() - Date.now() < 60 * 24 * 3600 * 1000);
        break;
      case "inactive":
        base = base.filter((p) => !p.active);
        break;
      case "requires_legal_review":
        base = base.filter((p) => p.legalReviewRequired && p.legalReviewStatus !== "cleared");
        break;
      case "requires_accounting_review":
        base = base.filter((p) => p.accountingReviewRequired && p.accountingReviewStatus !== "cleared");
        break;
      case "tara":
        base = base.filter((p) => p.family === "brand_ambassador_participation");
        break;
      case "sales":
        base = base.filter((p) => p.family === "sales_commission");
        break;
      case "software":
        base = base.filter((p) => p.family === "software_participation");
        break;
      case "custom_overrides":
        base = base.filter((p) => !!p.policyOverrides);
        break;
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      base = base.filter((p) => `${p.name} ${p.family} ${p.owner}`.toLowerCase().includes(s));
    }
    return base;
  }, [plans, view, q]);

  return (
    <CompensationShell
      title="Compensation Plans"
      description="Every plan links to a versioned policy snapshot. §11 defaults remain approved and configurable."
      actions={
        <Button asChild size="sm" className="gap-1.5">
          <Link to="/compensation/plans/new">
            <Plus className="h-4 w-4" />
            New plan
          </Link>
        </Button>
      }
    >
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {VIEWS.map((v) => (
            <Button
              key={v.key}
              size="sm"
              variant={view === v.key ? "default" : "outline"}
              onClick={() => setView(v.key)}
              className="h-8"
            >
              {v.label}
            </Button>
          ))}
          <div className="ml-auto w-64">
            <Input placeholder="Search plans…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Family</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Basis</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Pass-through</TableHead>
              <TableHead>Chargeback</TableHead>
              <TableHead>Holdback</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <Link to="/compensation/plans/$id" params={{ id: p.id }} className="hover:underline">
                    {p.name}
                  </Link>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                </TableCell>
                <TableCell><Badge variant="outline">{p.family.replaceAll("_", " ")}</Badge></TableCell>
                <TableCell className="text-xs">{p.disbursementClass.replaceAll("_", " ")}</TableCell>
                <TableCell className="text-xs">{p.basis.replaceAll("_", " ")}</TableCell>
                <TableCell>{p.defaultRate ? `${(p.defaultRate * 100).toFixed(1)}%` : p.fixedAmount ? currency(p.fixedAmount) : "—"}</TableCell>
                <TableCell className="text-xs">{p.effectiveDate}{p.expirationDate ? ` → ${p.expirationDate}` : ""}</TableCell>
                <TableCell>{p.participantCount}</TableCell>
                <TableCell className="text-xs">{p.collectionRequirement.replaceAll("_", " ")}</TableCell>
                <TableCell className="text-xs">{p.passThroughTreatment.replaceAll("_", " ")}</TableCell>
                <TableCell className="text-xs">{p.chargebackWindowDays}d</TableCell>
                <TableCell className="text-xs">{(p.holdbackPercent * 100).toFixed(0)}%</TableCell>
                <TableCell>v{p.currentVersion}</TableCell>
                <TableCell className="text-xs">{p.owner}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusTone(p.status)}>
                    {p.status.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => showDemoToast(`Opened ${p.name}`)} asChild>
                    <Link to="/compensation/plans/$id" params={{ id: p.id }}>Open</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </CompensationShell>
  );
}
