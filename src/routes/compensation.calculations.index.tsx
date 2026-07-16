import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
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
  CompensationCalculation,
  CompensationCalculationStatus,
} from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/compensation/calculations/")({
  head: () => ({ meta: [{ title: "Compensation Calculations — LedgerOS" }] }),
  component: CalcsList,
});

const VIEWS: Array<{ key: "all" | CompensationCalculationStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "projected", label: "Projected" },
  { key: "pending_collection", label: "Pending Collection" },
  { key: "pending_clearance", label: "Pending Clearance" },
  { key: "eligible", label: "Eligible" },
  { key: "calculated", label: "Calculated" },
  { key: "pending_verification", label: "Pending Verification" },
  { key: "pending_manager_review", label: "Pending Manager" },
  { key: "pending_accounting_review", label: "Pending Accounting" },
  { key: "pending_approval", label: "Pending Approval" },
  { key: "approved", label: "Approved" },
  { key: "reserved", label: "Reserved" },
  { key: "payable", label: "Payable" },
  { key: "scheduled", label: "Scheduled" },
  { key: "paid", label: "Paid" },
  { key: "held", label: "Held" },
  { key: "adjusted", label: "Adjusted" },
  { key: "reversed", label: "Reversed" },
  { key: "clawback_required", label: "Clawback" },
  { key: "disputed", label: "Disputed" },
  { key: "closed", label: "Closed" },
];

function CalcsList() {
  const [rows, setRows] = useState<CompensationCalculation[]>([]);
  const [view, setView] = useState<(typeof VIEWS)[number]["key"]>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.compensationOps.listCalculations().then((r) => setRows(r.data));
  }, []);

  const filtered = useMemo(() => {
    let base = view === "all" ? rows : rows.filter((r) => r.status === view);
    if (q) {
      const s = q.toLowerCase();
      base = base.filter((r) =>
        `${r.participantName} ${r.opportunityName ?? ""} ${r.customerName ?? ""} ${r.planName}`
          .toLowerCase()
          .includes(s),
      );
    }
    return base;
  }, [rows, view, q]);

  return (
    <CompensationShell
      title="Calculations"
      description="Every calculation carries a resolved policy snapshot, invariant checks, and full audit history."
      actions={
        <Button asChild size="sm" className="gap-1.5">
          <Link to="/compensation/calculations/new">
            <Plus className="h-4 w-4" />
            New calculation
          </Link>
        </Button>
      }
    >
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
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
            <Input
              placeholder="Search calculations…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Opportunity</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Pass-thru</TableHead>
              <TableHead className="text-right">Realized</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Gross Comp</TableHead>
              <TableHead className="text-right">Holdback</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">
                  <Link
                    to="/compensation/calculations/$id"
                    params={{ id: r.id }}
                    className="hover:underline"
                  >
                    {r.id}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{r.participantName}</TableCell>
                <TableCell className="text-xs">
                  {r.opportunityName ?? "—"}
                  <div className="text-muted-foreground">{r.customerName ?? ""}</div>
                </TableCell>
                <TableCell className="text-xs">
                  {r.planName} <span className="text-muted-foreground">v{r.planVersion}</span>
                </TableCell>
                <TableCell className="text-xs">{r.source.label}</TableCell>
                <TableCell className="text-right font-tabular">
                  {currency(r.grossPayment)}
                </TableCell>
                <TableCell className="text-right font-tabular text-muted-foreground">
                  {currency(r.passThroughExcluded)}
                </TableCell>
                <TableCell className="text-right font-tabular">
                  {currency(r.realizedRevenue)}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {r.lines[0]?.rate ? `${(r.lines[0].rate * 100).toFixed(1)}%` : "—"}
                </TableCell>
                <TableCell className="text-right font-tabular">{currency(r.totalGross)}</TableCell>
                <TableCell className="text-right font-tabular text-muted-foreground">
                  {currency(r.totalHoldback)}
                </TableCell>
                <TableCell className="text-right font-tabular font-semibold">
                  {currency(r.totalNetPayable)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {r.status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-warning">
                  {r.riskFlags.join(", ") || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to="/compensation/calculations/$id" params={{ id: r.id }}>
                      Open
                    </Link>
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
