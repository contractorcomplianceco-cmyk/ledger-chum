import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { DATA_MAP } from "@/lib/mock/implementation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/implementation/data-map")({
  head: () => ({ meta: [{ title: "Data & Lineage Map — LedgerOS" }] }),
  component: DataMap,
});

const STORAGE_META = {
  exists: { label: "In Postgres", tone: "border-success/40 bg-success/10 text-success" },
  extend: { label: "Extend schema", tone: "border-warning/40 bg-warning/10 text-warning" },
  new: { label: "New table", tone: "border-brand/40 bg-brand/10 text-brand" },
} as const;

const LINEAGE = [
  { number: "True available cash", source: "Cash Availability engine", inputs: "Bank balances · Pass-through obligations · Commission reserves · Payroll accrual", confidence: "High · reconciled hourly" },
  { number: "Marketing ROI", source: "Attribution + GL", inputs: "Ad spend (per campaign) · Attributed revenue (per client) · Contribution margin", confidence: "Medium · attribution model dependent" },
  { number: "Bonus obligation", source: "Bonus engine", inputs: "Invoice paid · Commission plan · Verification · Approval", confidence: "High post-verification" },
  { number: "Technology ROI", source: "Tech portfolio", inputs: "Provider invoice · Usage telemetry · Attributed revenue · Adoption", confidence: "Medium" },
  { number: "Client profitability", source: "Profitability engine", inputs: "Revenue · COGS · Attributed marketing · Support · Overhead allocation", confidence: "Medium" },
  { number: "Revenue leakage", source: "Leakage engine", inputs: "Reimbursable expenses · Untracked hours · Milestone completion · Contract terms", confidence: "Medium — must be verified before invoicing" },
  { number: "Financial Confidence Score", source: "Confidence engine", inputs: "13 signals · data freshness · reconciliation gap · approval coverage", confidence: "High for score, low for individual signals" },
  { number: "Forecasts", source: "Forecasting engine", inputs: "Historical actuals · Booked pipeline · Scenario assumptions", confidence: "Scenario-dependent — always shown with range" },
];

function DataMap() {
  return (
    <ImplementationPage
      title="Data Model & Lineage Map"
      description="Every mock object mapped to a Postgres entity. Every displayed number disclosed to its source, transformation, and confidence."
    >
      <Card className="border-border/70 p-0">
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,2.3fr)_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Mock Object</span>
          <span>File</span>
          <span>Entity</span>
          <span>Key columns</span>
          <span>Storage</span>
        </div>
        {DATA_MAP.map((d, i) => (
          <div
            key={i}
            className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,2.3fr)_auto] items-center gap-2 border-b border-border px-4 py-2.5 text-[12px] last:border-b-0 hover:bg-muted/20"
          >
            <span className="truncate font-semibold">{d.mockObject}</span>
            <code className="truncate font-mono text-[11px] text-muted-foreground">{d.file}</code>
            <code className="truncate font-mono text-[11px]">{d.entity}</code>
            <code className="truncate font-mono text-[11px] text-muted-foreground">{d.keys}</code>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-semibold", STORAGE_META[d.storage].tone)}>
              {STORAGE_META[d.storage].label}
            </span>
          </div>
        ))}
      </Card>

      <div>
        <h3 className="text-[14px] font-semibold">Number lineage</h3>
        <p className="text-[12px] text-muted-foreground">Every high-stakes figure surfaced in LedgerOS must disclose its lineage in-context.</p>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {LINEAGE.map((l) => (
            <Card key={l.number} className="border-border/70 p-4 text-[12px]">
              <div className="text-[13px] font-semibold">{l.number}</div>
              <div className="mt-1 text-muted-foreground"><span className="font-medium text-foreground">Source:</span> {l.source}</div>
              <div className="text-muted-foreground"><span className="font-medium text-foreground">Inputs:</span> {l.inputs}</div>
              <div className="text-muted-foreground"><span className="font-medium text-foreground">Confidence:</span> {l.confidence}</div>
            </Card>
          ))}
        </div>
      </div>
    </ImplementationPage>
  );
}
