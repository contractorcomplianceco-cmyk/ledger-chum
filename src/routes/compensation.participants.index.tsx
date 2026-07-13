import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { CompensationParticipant } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/participants/")({
  head: () => ({ meta: [{ title: "Compensation Participants — LedgerOS" }] }),
  component: ParticipantsPage,
});

const TYPES = [
  "employee","brand_ambassador","salesperson","referral_partner","affiliate","strategic_partner",
  "channel_partner","consultant","contractor","investor","team_pool","external_entity","owner","profit_share_participant",
];

function ParticipantsPage() {
  const [rows, setRows] = useState<CompensationParticipant[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");

  useEffect(() => {
    api.compensation.listParticipants().then((r) => setRows(r.data));
  }, []);

  const filtered = useMemo(() => {
    let base = rows;
    if (type !== "all") base = base.filter((r) => r.type === type);
    if (q.trim()) base = base.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
    return base;
  }, [rows, q, type]);

  return (
    <CompensationShell
      title="Participants"
      description="Legally distinct participant types are preserved end-to-end for tax and disbursement classification."
    >
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="all">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <Input placeholder="Search participants…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Default role</TableHead>
              <TableHead>Active plans</TableHead>
              <TableHead>Attributions</TableHead>
              <TableHead>Payable</TableHead>
              <TableHead>Holdback</TableHead>
              <TableHead>Clawback</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Tax doc</TableHead>
              <TableHead>Legal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <Link to="/compensation/participants/$id" params={{ id: r.id }} className="hover:underline">{r.name}</Link>
                </TableCell>
                <TableCell><Badge variant="outline">{r.type.replaceAll("_", " ")}</Badge></TableCell>
                <TableCell className="text-xs">{r.department ?? "—"}</TableCell>
                <TableCell className="text-xs">{r.defaultRole}</TableCell>
                <TableCell>{r.activePlans}</TableCell>
                <TableCell>{r.attributionCount}</TableCell>
                <TableCell>{currency(r.payableBalance)}</TableCell>
                <TableCell>{currency(r.holdbackBalance)}</TableCell>
                <TableCell>{currency(r.clawbackExposure)}</TableCell>
                <TableCell className="text-xs">{r.paymentMethod}</TableCell>
                <TableCell className="text-xs">{r.taxDocumentStatus}</TableCell>
                <TableCell className="text-xs">{r.legalReviewStatus}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={r.active ? "border-success/40 bg-success/10 text-success" : "border-border bg-muted"}>
                    {r.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </CompensationShell>
  );
}
