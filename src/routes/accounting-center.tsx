import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  BookOpenCheck,
  CalendarClock,
  Activity,
  ClipboardList,
  Brain,
} from "lucide-react";

/**
 * M11 — Accountant Workspace.
 *
 * Advisory rollup that funnels a working accountant through pending work
 * without bypassing the accounting engine. Every action deep-links into
 * the canonical surface (approvals queue, drafts, close, reconciliation).
 */

export const Route = createFileRoute("/accounting-center")({
  head: () => ({
    meta: [
      { title: "Accounting Center — LedgerOS" },
      {
        name: "description",
        content:
          "Single workspace for accountants: pending approvals, draft financial objects, exceptions, reconciliation, close status, and accounting health.",
      },
      { property: "og:title", content: "Accounting Center — LedgerOS" },
    ],
  }),
  component: AccountingCenter,
});

type Tone = "ok" | "warn" | "crit" | "neutral";

const TONE: Record<Tone, string> = {
  ok: "bg-emerald-500/10 text-emerald-500",
  warn: "bg-amber-500/10 text-amber-500",
  crit: "bg-red-500/10 text-red-500",
  neutral: "bg-muted text-muted-foreground",
};

interface Tile {
  title: string;
  count: number | string;
  tone: Tone;
  description: string;
  to: string;
  icon: typeof ShieldCheck;
  cta: string;
}

const TILES: Tile[] = [
  {
    title: "Pending approvals",
    count: 6,
    tone: "warn",
    description: "Journals, invoices, bills, and financial events awaiting reviewer sign-off.",
    to: "/automation/approvals",
    icon: ShieldCheck,
    cta: "Open approvals",
  },
  {
    title: "Draft financial objects",
    count: 4,
    tone: "neutral",
    description: "Materialized drafts (invoices, bills, payments) pending posting into the ledger.",
    to: "/invoices/review",
    icon: FileText,
    cta: "Review drafts",
  },
  {
    title: "Exceptions",
    count: 3,
    tone: "crit",
    description: "Ingestion, validation, and mapping failures held in the Financial Event Bus.",
    to: "/admin/financial-events",
    icon: AlertTriangle,
    cta: "Investigate",
  },
  {
    title: "Reconciliation tasks",
    count: 12,
    tone: "warn",
    description: "Unmatched bank transactions and open reconciliation windows.",
    to: "/ledger/banking/reconcile",
    icon: BookOpenCheck,
    cta: "Reconcile",
  },
  {
    title: "Close status",
    count: "Day 3 of 5",
    tone: "warn",
    description: "Current period close progress and blocking tasks.",
    to: "/close",
    icon: CalendarClock,
    cta: "Open close",
  },
  {
    title: "Accounting health",
    count: "97%",
    tone: "ok",
    description: "Balanced journals, mapped accounts, healthy sync history.",
    to: "/controls",
    icon: Activity,
    cta: "Control Center",
  },
];

const QUEUES: Array<{ title: string; description: string; to: string }> = [
  {
    title: "Financial event exceptions",
    description: "Events failing validation or mapping — resolve before materialization.",
    to: "/admin/financial-events",
  },
  {
    title: "Draft invoice review",
    description: "Invoices materialized from ServiceConnect work orders awaiting posting.",
    to: "/invoices/review",
  },
  {
    title: "Bank reconciliation",
    description: "Unmatched bank feed lines and open reconciliation windows.",
    to: "/ledger/banking/reconcile",
  },
  {
    title: "Company approvals",
    description: "All approver-gated financial actions across the platform.",
    to: "/automation/approvals",
  },
  {
    title: "AI Controller advisories",
    description: "Advisory insights from the Close Assistant — never mutates the ledger.",
    to: "/close/ai-assistant",
  },
];

function AccountingCenter() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Accountant workspace"
        title="Accounting Center"
        description="Everything an accountant needs to keep LedgerOS clean, closed, and auditable. Advisory rollup — all actions execute through the accounting engine."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/close/ai-assistant">
              <Brain className="mr-2 h-4 w-4" />
              AI Controller
            </Link>
          </Button>
        }
      />
      <PageBody>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TILES.map((t) => (
            <Card key={t.title} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-muted p-2">
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold">{t.title}</div>
                </div>
                <Badge className={TONE[t.tone]} variant="secondary">
                  {t.count}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <div>
                <Button asChild size="sm" variant="secondary">
                  <Link to={t.to}>{t.cta}</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <div className="text-sm font-semibold">Review queues</div>
          </div>
          <div className="divide-y divide-border">
            {QUEUES.map((q) => (
              <div key={q.to} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{q.title}</div>
                  <div className="text-xs text-muted-foreground">{q.description}</div>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <Link to={q.to}>Open</Link>
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-2 text-sm font-semibold">Architectural guardrails</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              All posting happens through the accounting engine. This workspace never writes journal
              entries directly.
            </li>
            <li>
              AI outputs here are advisory-only and always carry evidence, confidence, and
              freshness.
            </li>
            <li>
              External systems reach the ledger only via the Financial Event Bus and
              materialization.
            </li>
          </ul>
        </Card>
      </PageBody>
    </AppShell>
  );
}
