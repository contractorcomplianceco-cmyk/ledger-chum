import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users2,
  CalendarClock,
  BookOpen,
  Plug,
  Split,
  ArrowRight,
} from "lucide-react";

/**
 * M12 — First Pilot Simulation.
 *
 * Presentation-only walkthrough of a fictional pilot company and the
 * mandated end-to-end lifecycle. No database writes happen here — actual
 * activation is performed through Customer Onboarding + the Financial
 * Event Bus + the Accounting Engine.
 */

export const Route = createFileRoute("/admin/pilot-simulation")({
  head: () => ({
    meta: [
      { title: "Pilot Simulation — LedgerOS" },
      {
        name: "description",
        content:
          "Fictional pilot company and end-to-end lifecycle walkthrough proving the LedgerOS architecture.",
      },
      { property: "og:title", content: "Pilot Simulation — LedgerOS" },
    ],
  }),
  component: PilotSimulationPage,
});

const PILOT = {
  org: {
    name: "Northwind Field Services",
    legalName: "Northwind Field Services, LLC",
    baseCurrency: "USD",
    fiscalYearStart: "Jan 1",
    country: "United States",
  },
  users: [
    { name: "Alex Owner", role: "Owner", perms: "*" },
    { name: "Rita Controller", role: "Accounting Lead", perms: "accounting.*" },
    { name: "Sam Ops", role: "Operations Manager", perms: "operations.view" },
    { name: "Priya Admin", role: "Systems Admin", perms: "admin.view" },
  ],
  fiscalPeriods: [
    { label: "FY2026 Q1", status: "Open" },
    { label: "FY2026 Q2", status: "Future" },
    { label: "FY2025 Q4", status: "Closed" },
  ],
  coa: [
    { code: "1000", name: "Cash — Operating", type: "Asset" },
    { code: "1200", name: "Accounts Receivable", type: "Asset" },
    { code: "1400", name: "Inventory", type: "Asset" },
    { code: "2000", name: "Accounts Payable", type: "Liability" },
    { code: "2200", name: "Sales Tax Payable", type: "Liability" },
    { code: "3000", name: "Owner's Equity", type: "Equity" },
    { code: "4000", name: "Service Revenue", type: "Revenue" },
    { code: "5000", name: "Cost of Services", type: "Expense" },
    { code: "6000", name: "Operating Expenses", type: "Expense" },
  ],
  integration: {
    sourceKey: "serviceconnect",
    displayName: "ServiceConnect (pilot)",
    endpoint: "/api/public/integrations/events",
    status: "Configured",
  },
  mappings: [
    { external: "work_order.completed", ledger: "Invoice draft" },
    { external: "payment.received", ledger: "Payment application" },
    { external: "expense.recorded", ledger: "Bill draft" },
    { external: "refund.issued", ledger: "Credit note draft" },
  ],
};

const LIFECYCLE = [
  { stage: "Operational Event", detail: "ServiceConnect emits work_order.completed for Job #WO-1042." },
  { stage: "Financial Event Bus", detail: "POST /api/public/integrations/events — recorded on financial_events with idempotency + correlation." },
  { stage: "Validation", detail: "Payload schema + tenant + source authenticated. Duplicates short-circuit." },
  { stage: "Mapping", detail: "integration_event_mappings resolves work_order.completed → invoice draft." },
  { stage: "Approval", detail: "Rules or a human accountant approve the event. AI is advisory only." },
  { stage: "Materialization", detail: "materialize_financial_event creates the invoice via existing engine." },
  { stage: "Financial Object", detail: "Invoice draft appears in the invoice workspace, awaiting standard controls." },
  { stage: "Accounting Engine", detail: "Posting creates balanced journal lines. Trial balance ties." },
  { stage: "Reports", detail: "P&L, Balance Sheet, and AR aging reflect the new activity." },
  { stage: "Metrics", detail: "Canonical metric values refresh with lineage + confidence + freshness." },
  { stage: "APEX Insight", detail: "Executive experience surfaces the change through intelligence adapters — no direct ledger access." },
];

function PilotSimulationPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M12"
        title="First Pilot Simulation"
        description="Fictional pilot company and the end-to-end lifecycle proving the LedgerOS architecture."
      />
      <PageBody className="space-y-6">
        <Card className="border-border/60 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Pilot organization</div>
              <div className="mt-1 flex items-center gap-2 text-xl font-semibold">
                <Building2 className="h-5 w-5 text-brand" />
                {PILOT.org.name}
              </div>
              <p className="text-sm text-muted-foreground">{PILOT.org.legalName}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] text-muted-foreground">
              <div>Base currency</div><div className="text-foreground">{PILOT.org.baseCurrency}</div>
              <div>Fiscal year start</div><div className="text-foreground">{PILOT.org.fiscalYearStart}</div>
              <div>Country</div><div className="text-foreground">{PILOT.org.country}</div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/60 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users2 className="h-4 w-4 text-brand" /> Users &amp; roles
            </div>
            <div className="mt-3 divide-y divide-border/60 text-[13px]">
              {PILOT.users.map((u) => (
                <div key={u.name} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-muted-foreground">{u.role}</div>
                  </div>
                  <code className="text-[11px] text-muted-foreground">{u.perms}</code>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-border/60 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="h-4 w-4 text-brand" /> Fiscal periods
            </div>
            <div className="mt-3 space-y-2 text-[13px]">
              {PILOT.fiscalPeriods.map((p) => (
                <div key={p.label} className="flex items-center justify-between">
                  <span>{p.label}</span>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-border/60 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4 text-brand" /> Chart of accounts
            </div>
            <div className="mt-3 divide-y divide-border/60 text-[13px]">
              {PILOT.coa.map((a) => (
                <div key={a.code} className="grid grid-cols-[64px_1fr_auto] items-center gap-2 py-1.5">
                  <code className="text-muted-foreground">{a.code}</code>
                  <span>{a.name}</span>
                  <Badge variant="outline">{a.type}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-border/60 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Plug className="h-4 w-4 text-brand" /> Integration source
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
              <div className="text-muted-foreground">Key</div>
              <code className="text-foreground">{PILOT.integration.sourceKey}</code>
              <div className="text-muted-foreground">Display</div>
              <div>{PILOT.integration.displayName}</div>
              <div className="text-muted-foreground">Endpoint</div>
              <code className="text-foreground">{PILOT.integration.endpoint}</code>
              <div className="text-muted-foreground">Status</div>
              <div><Badge className="bg-emerald-500/10 text-emerald-500">{PILOT.integration.status}</Badge></div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
              <Split className="h-4 w-4 text-brand" /> Event mappings
            </div>
            <div className="mt-2 divide-y divide-border/60 text-[13px]">
              {PILOT.mappings.map((m) => (
                <div key={m.external} className="flex items-center justify-between py-1.5">
                  <code className="text-muted-foreground">{m.external}</code>
                  <span className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    {m.ledger}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="border-border/60 p-5">
          <div className="text-sm font-semibold">End-to-end lifecycle</div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            No shortcut is permitted at any stage. External systems only interact via the Financial Event Bus.
          </p>
          <ol className="mt-4 space-y-2 text-[13px]">
            {LIFECYCLE.map((s, i) => (
              <li key={s.stage} className="flex gap-3 rounded-md border border-border/60 bg-muted/10 p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[11px] font-semibold text-brand">
                  {i + 1}
                </div>
                <div>
                  <div className="font-medium">{s.stage}</div>
                  <div className="text-muted-foreground">{s.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="border-border/60 bg-muted/20 p-5">
          <div className="text-sm font-medium">Invariants</div>
          <ul className="mt-2 space-y-1 text-[13px] text-muted-foreground">
            <li>• The pilot profile above is presentation data — activation happens through Customer Onboarding.</li>
            <li>• No direct external → journal path.</li>
            <li>• Materialization is the only writer to financial objects.</li>
            <li>• AI is advisory-only.</li>
            <li>• LedgerOS remains the independent financial operating system.</li>
          </ul>
        </Card>
      </PageBody>
    </AppShell>
  );
}
