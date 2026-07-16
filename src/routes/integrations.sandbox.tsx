import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrgId } from "@/hooks/use-current-org";
import { seedSandboxWorkOrder, listIntegrationEvents } from "@/lib/accounting/workspace.functions";
import { toast } from "sonner";
import { ArrowRight, Beaker, ShieldAlert, Sparkles, FileText } from "lucide-react";
import { currency, fmtRelative } from "@/lib/mock/accountant-workspace";

export const Route = createFileRoute("/integrations/sandbox")({
  head: () => ({
    meta: [
      { title: "Integration Sandbox — LedgerOS" },
      {
        name: "description",
        content:
          "Generate demo customers, work orders, invoices, and payments in your LedgerOS org — clearly marked as sandbox data — to walk through the ServiceConnect financial workflow end-to-end.",
      },
      { property: "og:title", content: "Integration Sandbox — LedgerOS" },
    ],
  }),
  component: SandboxPage,
});

function SandboxPage() {
  const orgId = useOrgId();
  const live = !!orgId;
  const qc = useQueryClient();
  const seedFn = useServerFn(seedSandboxWorkOrder);
  const eventsFn = useServerFn(listIntegrationEvents);

  const eventsQ = useQuery({
    queryKey: ["integration-events", orgId, "sandbox"],
    queryFn: () => eventsFn({ data: { orgId: orgId!, limit: 50 } }),
    enabled: live,
    retry: false,
  });
  const sandboxEvents = (eventsQ.data ?? []).filter(
    (e) => (e.source ?? "").includes("sandbox") || e.event_type.startsWith("sandbox."),
  );

  const [customerName, setCustomerName] = useState("Sandbox Marine Co.");
  const [seeding, setSeeding] = useState(false);
  const [lastResult, setLastResult] = useState<{
    invoiceNumber: string;
    workOrderRef: string;
    total: number;
  } | null>(null);

  const seed = async () => {
    if (!orgId) return;
    setSeeding(true);
    try {
      const res = await seedFn({ data: { orgId, customerName } });
      setLastResult({
        invoiceNumber: res.invoiceNumber,
        workOrderRef: res.workOrderRef,
        total: res.total,
      });
      toast.success(`Sandbox work order ${res.workOrderRef} → draft ${res.invoiceNumber}`);
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      qc.invalidateQueries({ queryKey: ["integration-events"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to seed sandbox data");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 4 · Sandbox"
        title="Integration Sandbox"
        description="Generate a demo customer, work order, and draft invoice — all clearly labelled as sandbox data — so you can walk the full ServiceConnect → LedgerOS financial flow."
        actions={
          <Button size="sm" variant="outline" asChild className="h-9">
            <Link to="/settings/serviceconnect">
              Connector settings <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />
      <PageBody>
        <Card className="border-warning/40 bg-warning/5 p-4 shadow-card">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-warning" />
            <div className="text-[13px] text-foreground">
              Sandbox data is inserted directly into your org with{" "}
              <code className="font-mono">SANDBOX-*</code> identifiers so it's clearly labelled. Do
              not enable this on a production ledger without a dedicated demo period.
            </div>
          </div>
        </Card>

        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Beaker className="h-3.5 w-3.5" /> Generate a sandbox work order
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-[11px] text-muted-foreground">Customer name</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9 w-72 text-[13px]"
              />
            </div>
            <Button onClick={seed} disabled={!live || seeding} className="h-9">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {seeding ? "Seeding…" : "Create work order + draft invoice"}
            </Button>
          </div>
          <div className="mt-3 text-[12px] text-muted-foreground">
            Creates 1 customer + 1 draft invoice with a labor line (4h @ $125) and 1 material line
            ($150). Accounts are resolved via <code className="font-mono">resolve_account</code>.
          </div>
          {!live && (
            <div className="mt-3 text-[12px] font-semibold text-warning">
              Sign in and connect an org before seeding.
            </div>
          )}
          {lastResult && (
            <div className="mt-3 rounded-md border border-success/30 bg-success/5 p-3 text-[13px]">
              <div className="font-semibold text-success">Seeded successfully</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                <span>
                  Work order{" "}
                  <code className="font-mono text-foreground">{lastResult.workOrderRef}</code>
                </span>
                <span>·</span>
                <span>
                  Draft invoice{" "}
                  <code className="font-mono text-foreground">{lastResult.invoiceNumber}</code>
                </span>
                <span>·</span>
                <span>
                  Total{" "}
                  <span className="font-tabular font-semibold text-foreground">
                    {currency(lastResult.total)}
                  </span>
                </span>
              </div>
              <div className="mt-2">
                <Button size="sm" asChild variant="outline" className="h-8">
                  <Link to="/invoices/review">
                    Review draft <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden border-border/70 bg-surface shadow-card">
          <div className="border-b border-border/60 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Sandbox activity
            </div>
            <div className="text-[13px] text-muted-foreground">
              Audit events tagged with source <code className="font-mono">ledgeros.sandbox</code>.
            </div>
          </div>
          <div className="divide-y divide-border/60">
            {sandboxEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3 text-[13px]">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold text-foreground">{e.event_type}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {(e.after as { workOrderRef?: string } | null)?.workOrderRef ??
                        e.target_id.slice(0, 8)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="h-5 border-transparent bg-warning/10 text-[10px] font-semibold text-warning ring-1 ring-inset ring-warning/20"
                  >
                    SANDBOX
                  </Badge>
                  <div className="text-[12px] text-muted-foreground">
                    {fmtRelative(e.created_at)}
                  </div>
                </div>
              </div>
            ))}
            {sandboxEvents.length === 0 && (
              <div className="px-4 py-8 text-center text-[12px] text-muted-foreground">
                No sandbox activity yet.
              </div>
            )}
          </div>
        </Card>
      </PageBody>
    </AppShell>
  );
}
