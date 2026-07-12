import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { API_ENDPOINTS, DATA_MAP, INTEGRATIONS, READINESS_SCORECARD } from "@/lib/mock/implementation";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/implementation/")({
  head: () => ({
    meta: [
      { title: "Production Integration Blueprint — LedgerOS" },
      { name: "description", content: "Phase 5 handoff package mapping every mock screen to real APIs, entities, permissions, and events." },
      { property: "og:title", content: "LedgerOS Phase 5 — Production Integration Blueprint" },
      { property: "og:description", content: "How every LedgerOS design lab screen becomes production without duplicating business logic." },
    ],
  }),
  component: BlueprintIndex,
});

function BlueprintIndex() {
  const avg = Math.round(READINESS_SCORECARD.reduce((s, r) => s + r.score, 0) / READINESS_SCORECARD.length);
  const newEndpoints = API_ENDPOINTS.filter((e) => e.status === "new").length;
  const extendEndpoints = API_ENDPOINTS.filter((e) => e.status === "extend").length;
  const existingEndpoints = API_ENDPOINTS.filter((e) => e.status === "exists").length;
  const newEntities = DATA_MAP.filter((d) => d.storage === "new").length;

  return (
    <ImplementationPage
      title="Production Integration Blueprint"
      description="Everything the backend team needs to safely connect the LedgerOS design lab to Express, Postgres, Navy Federal, Zoho, ADP, and CCA’s internal apps — without rebuilding business logic in Lovable."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Overall readiness" value={`${avg}%`} sub="Design → handoff → cutover" />
        <KpiCard label="API contract" value={`${API_ENDPOINTS.length} endpoints`} sub={`${existingEndpoints} exist · ${extendEndpoints} extend · ${newEndpoints} new`} />
        <KpiCard label="Data model" value={`${DATA_MAP.length} entities`} sub={`${newEntities} new tables required`} />
        <KpiCard label="Integrations" value={`${INTEGRATIONS.length} systems`} sub="Navy Federal, Zoho suite, ADP, CCA apps" />
      </section>

      <Card className="border-border/70 p-5">
        <h3 className="text-[14px] font-semibold">The Phase 5 principle</h3>
        <p className="mt-2 text-[13px] text-muted-foreground">
          LedgerOS must move from{" "}
          <span className="font-medium text-foreground">insight → recommendation → approval → action → result → audit record</span>{" "}
          — and Phase 5 is what makes that safe. No screen wires to real data until the API contract, permission matrix, event
          classification, and audit trail for that screen are frozen and approved. Ad-hoc backend wiring is what causes
          duplicate business logic, conflicting definitions of revenue and margin, and unsafe automatic posting.
        </p>
      </Card>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <NavCard to="/implementation/api-map" title="API Contract Map" body="24 endpoints across invoicing, expenses, cash, automation, intelligence — with permissions and audit events." />
        <NavCard to="/implementation/data-map" title="Data & Lineage Map" body="Every mock object mapped to a Postgres entity with source, transformation, confidence, approver." />
        <NavCard to="/implementation/permissions" title="Permission Matrix" body="Rose, Christin, Carmen, Accountant, Team, Integration — view, create, approve, override, export." />
        <NavCard to="/implementation/integrations" title="Integration Contracts" body="Navy Federal, Zoho CRM/Books/Billing/Forms, RUN by ADP, Command Center, Client Portal, QualifierConnect." />
        <NavCard to="/implementation/events" title="Events & Draft-vs-Post" body="Which automations may create drafts, which require approval, and which may never auto-post." />
        <NavCard to="/implementation/migration" title="Migration Plan" body="10 staged milestones from mock UI approved to full production, with parallel-run against Zoho Books." />
        <NavCard to="/implementation/testing" title="Acceptance Testing" body="10 end-to-end workflow tests covering allocation, recovery, bonus, guardrail, and integration failure paths." />
        <NavCard to="/implementation/security" title="Security & Data Lineage" body="Authn, authz, secrets, PII, audit, guardrails, change management." />
        <NavCard to="/implementation/cutover" title="Cutover Runbook" body="T-30 → T+7 checklist to move system of record from Zoho Books to LedgerOS." />
        <NavCard to="/implementation/readiness" title="Readiness Scorecard" body="Ten dimensions from design coverage to cutover plan, scored 0–100." />
        <NavCard to="/implementation/handoff" title="Handoff Package" body="Documents, owners, and formats that must ship before any production API wiring begins." />
      </section>
    </ImplementationPage>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-tabular text-[22px] font-bold">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </Card>
  );
}

function NavCard({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link
      to={to as "/implementation"}
      className={cn(
        "group rounded-lg border border-border/70 bg-card p-4 transition hover:border-brand/60 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[13.5px] font-semibold">{title}</div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">{body}</p>
    </Link>
  );
}
