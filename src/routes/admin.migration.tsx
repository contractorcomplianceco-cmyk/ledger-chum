import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users2, Building2, Wallet2, History, Download, ShieldCheck } from "lucide-react";

/**
 * M10 — Data Migration Framework.
 *
 * Prepares imports only. Files are staged and validated; execution stays
 * in the accounting engine under normal controls. No shortcuts.
 */

export const Route = createFileRoute("/admin/migration")({
  head: () => ({
    meta: [
      { title: "Data Migration — LedgerOS" },
      {
        name: "description",
        content:
          "Prepare imports for chart of accounts, customers, vendors, opening balances, and historical transactions. Preparation only — execution happens through the accounting engine.",
      },
      { property: "og:title", content: "Data Migration — LedgerOS" },
    ],
  }),
  component: MigrationPage,
});

type Status = "pending" | "validated" | "blocked";

interface MigrationSpec {
  id: string;
  title: string;
  icon: typeof BookOpen;
  description: string;
  templateColumns: string[];
  status: Status;
  owner: string;
  notes: string;
}

const SPECS: MigrationSpec[] = [
  {
    id: "coa",
    title: "Chart of Accounts",
    icon: BookOpen,
    description:
      "Canonical account list keyed by account_code. Loaded before any transactional import.",
    templateColumns: ["account_code", "name", "type", "subtype", "parent_code", "active"],
    status: "pending",
    owner: "Accounting Lead",
    notes: "Awaiting final Zoho Books mapping review.",
  },
  {
    id: "customers",
    title: "Customers",
    icon: Users2,
    description:
      "Customers keyed by external_id (Zoho contact ID) with billing/shipping addresses.",
    templateColumns: ["external_id", "name", "email", "phone", "billing_address_json", "status"],
    status: "pending",
    owner: "Ops",
    notes: "Zoho export scheduled; dedup against ServiceConnect customer IDs pending.",
  },
  {
    id: "vendors",
    title: "Vendors",
    icon: Building2,
    description: "Vendors and payables terms keyed by external_id.",
    templateColumns: ["external_id", "name", "tax_id", "terms_days", "default_expense_account"],
    status: "pending",
    owner: "AP",
    notes: "Vendor consolidation still in review with the accounting lead.",
  },
  {
    id: "opening",
    title: "Opening Balances",
    icon: Wallet2,
    description:
      "Per-account debit/credit balances as of the cutover date. Posted as a single opening-balance journal under normal controls.",
    templateColumns: ["account_code", "debit", "credit", "as_of_date", "memo"],
    status: "blocked",
    owner: "Controller",
    notes: "Blocked on final cutover date + Zoho trial balance reconciliation.",
  },
  {
    id: "history",
    title: "Historical Transactions",
    icon: History,
    description:
      "Last N months of ledger-preserving history. Posted through the Financial Event Bus — no direct writes.",
    templateColumns: ["external_id", "event_type", "occurred_at", "payload_json"],
    status: "blocked",
    owner: "Integration Owner",
    notes: "Awaiting Zoho export cadence + retention decision.",
  },
];

const TONE: Record<Status, string> = {
  pending: "bg-muted text-muted-foreground",
  validated: "bg-emerald-500/10 text-emerald-500",
  blocked: "bg-red-500/10 text-red-500",
};

function MigrationPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M10"
        title="Data Migration Framework"
        description="Prepare imports for cutover. Execution runs through the accounting engine and the Financial Event Bus — never directly into ledger tables."
      />
      <PageBody className="space-y-6">
        <Card className="border-border/60 bg-muted/20 p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            Migration invariants
          </div>
          <ul className="mt-2 space-y-1 text-[13px] text-muted-foreground">
            <li>• Historical rows land as financial events, not as raw journal entries.</li>
            <li>
              • Opening balances post as a single balanced journal under normal approval controls.
            </li>
            <li>• No client-specific rules encoded in this UI — templates are source-agnostic.</li>
            <li>
              • Preparation only: files are staged for review; execution is a separate operator run.
            </li>
          </ul>
        </Card>

        <div className="space-y-4">
          {SPECS.map((s) => (
            <Card key={s.id} className="border-border/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-brand" />
                    <div className="text-sm font-semibold">{s.title}</div>
                    <Badge className={TONE[s.status]}>{s.status}</Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">{s.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.templateColumns.map((c) => (
                      <span
                        key={c}
                        className="rounded border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[11px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-1 text-[12px] text-muted-foreground sm:grid-cols-2">
                    <div>
                      <span className="text-foreground">Owner:</span> {s.owner}
                    </div>
                    <div>
                      <span className="text-foreground">Notes:</span> {s.notes}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <Button variant="outline" size="sm" disabled>
                    <Download className="mr-1 h-3.5 w-3.5" />
                    Template
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </AppShell>
  );
}
