import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api/client";
import type { CompensationParticipant } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/participants/$id")({
  head: ({ params }) => ({ meta: [{ title: `Participant ${params.id} — LedgerOS` }] }),
  component: ParticipantDetailPage,
});

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function ParticipantDetailPage() {
  const { id } = useParams({ from: "/compensation/participants/$id" });
  const [p, setP] = useState<CompensationParticipant | undefined>();

  useEffect(() => {
    api.compensation.getParticipant(id).then(setP);
  }, [id]);

  if (!p) {
    return (
      <CompensationShell title="Participant" description="Loading…">
        <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
      </CompensationShell>
    );
  }

  return (
    <CompensationShell
      title={p.name}
      description={`${p.type.replaceAll("_", " ")} · ${p.defaultRole}`}
      actions={
        <>
          <Badge
            variant="outline"
            className={p.active ? "border-success/40 bg-success/10 text-success" : ""}
          >
            {p.active ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline">Legal: {p.legalReviewStatus}</Badge>
        </>
      }
    >
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap">
          {[
            "overview",
            "plans",
            "attribution",
            "calculations",
            "payables",
            "statements",
            "holdbacks",
            "clawbacks",
            "documents",
            "tax_legal",
            "audit",
          ].map((k) => (
            <TabsTrigger key={k} value={k} className="capitalize">
              {k.replaceAll("_", " / ")}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Identity
            </h3>
            <KV label="Name" value={p.name} />
            <KV label="Type" value={p.type} />
            <KV label="Department" value={p.department ?? "—"} />
            <KV label="Default role" value={p.defaultRole} />
            <KV label="Payment method" value={p.paymentMethod} />
            <KV label="Tax document status" value={p.taxDocumentStatus} />
            <KV label="Legal review" value={p.legalReviewStatus} />
            <KV label="Survival rights" value={p.survivalRights ?? "—"} />
            {p.restrictions.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">Restrictions</div>
                <ul className="ml-4 list-disc text-sm">
                  {p.restrictions.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Balances
            </h3>
            <KV label="Total projected" value={currency(p.totalProjected)} />
            <KV label="Earned" value={currency(p.totalEarned)} />
            <KV label="Approved" value={currency(p.totalApproved)} />
            <KV label="Reserved" value={currency(p.totalReserved)} />
            <KV label="Payable" value={currency(p.totalPayable)} />
            <KV label="Paid" value={currency(p.totalPaid)} />
            <KV label="Held" value={currency(p.totalHeld)} />
            <KV label="Clawback" value={currency(p.totalClawback)} />
          </Card>
        </TabsContent>
        {[
          "plans",
          "attribution",
          "calculations",
          "payables",
          "statements",
          "holdbacks",
          "clawbacks",
          "documents",
          "tax_legal",
          "audit",
        ].map((k) => (
          <TabsContent key={k} value={k} className="mt-4">
            <Card className="p-6 text-sm text-muted-foreground">
              {k.replaceAll("_", " ")} tab content for {p.name}. Demo data only.
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </CompensationShell>
  );
}
