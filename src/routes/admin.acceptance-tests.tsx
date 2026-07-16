import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  CreditCard,
  Wallet2,
  Undo2,
  AlertTriangle,
  Repeat,
  BookOpenCheck,
} from "lucide-react";

/**
 * M12 — Accounting Acceptance Tests.
 *
 * A curated scenario catalog. Each scenario names the canonical surface
 * where it is exercised. Nothing is executed here — the accounting
 * engine remains the only writer. Advisory / documentation only.
 */

export const Route = createFileRoute("/admin/acceptance-tests")({
  head: () => ({
    meta: [
      { title: "Accounting Acceptance Tests — LedgerOS" },
      {
        name: "description",
        content:
          "Acceptance scenario catalog covering revenue, payments, expenses, refunds, errors, reconciliation, and close.",
      },
      { property: "og:title", content: "Accounting Acceptance Tests — LedgerOS" },
    ],
  }),
  component: AcceptanceTestsPage,
});

type Scenario = {
  id: string;
  title: string;
  detail: string;
  surface: { label: string; to: string };
  expected: string[];
};

type Section = {
  id: string;
  title: string;
  icon: typeof Receipt;
  scenarios: Scenario[];
};

const SECTIONS: Section[] = [
  {
    id: "revenue",
    title: "Revenue",
    icon: Receipt,
    scenarios: [
      {
        id: "rev-invoice",
        title: "Post a customer invoice",
        detail: "Create an invoice with taxable line items and confirm journal + AR.",
        surface: { label: "Invoices", to: "/invoices" },
        expected: [
          "Balanced journal: DR Accounts Receivable, CR Revenue, CR Tax Payable",
          "Trial balance still ties",
          "AR aging reflects the invoice",
        ],
      },
      {
        id: "rev-recurring",
        title: "Recurring invoice generation",
        detail: "Confirm the next occurrence produces a new draft honoring the schedule.",
        surface: { label: "Recurring invoices", to: "/invoices/recurring" },
        expected: ["New draft created", "No duplicates on re-run", "Audit trail present"],
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    scenarios: [
      {
        id: "pay-apply",
        title: "Apply a customer payment",
        detail: "Match a payment to an open invoice, in full and then partial.",
        surface: { label: "Payments", to: "/payments" },
        expected: [
          "Balanced journal: DR Cash, CR Accounts Receivable",
          "Invoice status transitions to Paid / Partially Paid",
          "AR aging reflects the change",
        ],
      },
    ],
  },
  {
    id: "expenses",
    title: "Expenses",
    icon: Wallet2,
    scenarios: [
      {
        id: "exp-bill",
        title: "Record a vendor bill",
        detail: "Create a bill with expense allocations and confirm AP.",
        surface: { label: "Bills", to: "/bills" },
        expected: [
          "Balanced journal: DR Expense (or Inventory), CR Accounts Payable",
          "AP aging reflects the bill",
        ],
      },
      {
        id: "exp-billpay",
        title: "Pay a vendor bill",
        detail: "Apply a payment against an open bill.",
        surface: { label: "Bills", to: "/bills" },
        expected: [
          "Balanced journal: DR Accounts Payable, CR Cash",
          "Bill marked Paid; AP aging updates",
        ],
      },
    ],
  },
  {
    id: "refunds",
    title: "Refunds",
    icon: Undo2,
    scenarios: [
      {
        id: "ref-credit",
        title: "Issue a credit note and refund",
        detail: "Create a credit note against an invoice, then a customer refund.",
        surface: { label: "Credit notes", to: "/invoices/credit-notes" },
        expected: [
          "Credit note reduces AR",
          "Refund journal: DR Credit balance / Revenue contra, CR Cash",
          "Audit trail links credit → refund",
        ],
      },
    ],
  },
  {
    id: "errors",
    title: "Errors",
    icon: AlertTriangle,
    scenarios: [
      {
        id: "err-event",
        title: "Rejected event recovery",
        detail: "Fire an invalid payload, confirm rejection, then a valid retry.",
        surface: { label: "Financial Event Bus", to: "/admin/financial-events" },
        expected: [
          "financial_events row in error/rejected",
          "sync_history reflects the failure",
          "Retry with valid payload succeeds without duplicate side effects",
        ],
      },
      {
        id: "err-mapping",
        title: "Unmapped event",
        detail: "Emit an external event with no mapping and confirm it lands as pending.",
        surface: { label: "Financial Event Bus", to: "/admin/financial-events" },
        expected: [
          "Event visible on the bus in pending state",
          "No materialization occurs until mapping is created",
        ],
      },
    ],
  },
  {
    id: "reconciliation",
    title: "Reconciliation",
    icon: Repeat,
    scenarios: [
      {
        id: "rec-bank",
        title: "Bank reconciliation",
        detail: "Reconcile a bank statement against ledger transactions.",
        surface: { label: "Banking", to: "/banking" },
        expected: [
          "Matched transactions cleared",
          "Unmatched items flagged for follow-up",
          "Ending balance ties to statement",
        ],
      },
    ],
  },
  {
    id: "close",
    title: "Close workflow",
    icon: BookOpenCheck,
    scenarios: [
      {
        id: "close-period",
        title: "Close a fiscal period",
        detail: "Run the close checklist and confirm the period locks.",
        surface: { label: "Close", to: "/close" },
        expected: [
          "All close tasks complete",
          "Period marked Closed",
          "Post-close entries blocked without override",
        ],
      },
    ],
  },
];

function AcceptanceTestsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M12"
        title="Accounting Acceptance Tests"
        description="Scenario catalog exercising the accounting engine through its canonical surfaces."
      />
      <PageBody className="space-y-6">
        <Card className="border-border/60 bg-muted/20 p-5">
          <div className="text-sm font-medium">How to use this catalog</div>
          <ul className="mt-2 space-y-1 text-[13px] text-muted-foreground">
            <li>• Execute each scenario on its named surface — no shortcuts.</li>
            <li>• The accounting engine is the only writer to journals.</li>
            <li>• Confirm the expected outcome and record the run in your test log.</li>
            <li>• AI assistance during test runs is advisory-only.</li>
          </ul>
        </Card>

        {SECTIONS.map((s) => (
          <Card key={s.id} className="border-border/60 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <s.icon className="h-4 w-4 text-brand" />
              {s.title}
              <Badge variant="outline" className="ml-1 text-[10px]">
                {s.scenarios.length} scenarios
              </Badge>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {s.scenarios.map((sc) => (
                <div key={sc.id} className="rounded-md border border-border/60 bg-muted/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[13px] font-medium">{sc.title}</div>
                    <Link
                      to={sc.surface.to}
                      className="text-[11px] text-brand hover:underline whitespace-nowrap"
                    >
                      {sc.surface.label} →
                    </Link>
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">{sc.detail}</p>
                  <div className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    Expected
                  </div>
                  <ul className="mt-1 space-y-1 text-[12px] text-muted-foreground">
                    {sc.expected.map((e, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </PageBody>
    </AppShell>
  );
}
