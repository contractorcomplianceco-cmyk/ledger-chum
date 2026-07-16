import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Building2,
  BookOpen,
  Plug,
  FlaskConical,
  Rocket,
  CheckCircle2,
  Circle,
  ClipboardList,
} from "lucide-react";

/**
 * M11 — Customer Implementation Workspace.
 *
 * Walks a new pilot org through the activation workflow:
 *   Organization → Configuration → Accounting → Integration → Testing → Activation
 *
 * No live cutover happens here. Each phase deep-links into the canonical
 * setup surface owned by its subsystem.
 */

export const Route = createFileRoute("/admin/customer-onboarding")({
  head: () => ({
    meta: [
      { title: "Customer Onboarding — LedgerOS" },
      {
        name: "description",
        content:
          "Guided activation workflow for pilot customers: organization setup, accounting, integrations, testing, and go-live checklist.",
      },
      { property: "og:title", content: "Customer Onboarding — LedgerOS" },
    ],
  }),
  component: CustomerOnboarding,
});

interface Task {
  id: string;
  title: string;
  description: string;
}

interface Stage {
  id: string;
  title: string;
  icon: typeof Building2;
  summary: string;
  tasks: Task[];
}

const STAGES: Stage[] = [
  {
    id: "org",
    title: "Organization setup",
    icon: Building2,
    summary: "Create the pilot org, invite core users, set roles and tenant isolation.",
    tasks: [
      { id: "org.create", title: "Create organization", description: "Create the pilot tenant with legal entity, base currency, and fiscal year." },
      { id: "org.roles", title: "Invite users and assign roles", description: "Owner, accountant, reviewer, and integration operator roles." },
      { id: "org.brand", title: "Complete organization profile", description: "Legal name, tax IDs, address, and contact — required for invoice output." },
    ],
  },
  {
    id: "accounting",
    title: "Accounting setup",
    icon: BookOpen,
    summary: "Chart of accounts, fiscal periods, opening balances, and mapping registry.",
    tasks: [
      { id: "acc.coa", title: "Import Chart of Accounts", description: "Load canonical account codes via /admin/migration and validate." },
      { id: "acc.periods", title: "Configure fiscal periods", description: "Fiscal year and monthly period cadence, open first period." },
      { id: "acc.balances", title: "Post opening balances", description: "Balanced opening journal entry through the accounting engine." },
      { id: "acc.mappings", title: "Confirm account mappings", description: "Purpose-based mappings (AR, cash, revenue, COGS, inventory, refunds)." },
    ],
  },
  {
    id: "integration",
    title: "Integration setup",
    icon: Plug,
    summary: "Register the ServiceConnect client and validate the Financial Event Bus contract.",
    tasks: [
      { id: "int.client", title: "Provision API client", description: "Issue ServiceConnect API client credentials and scopes." },
      { id: "int.mapping", title: "External ID mapping", description: "Map ServiceConnect customer / vendor / item IDs to LedgerOS entities." },
      { id: "int.events", title: "Verify event ingestion", description: "Send a work_order.completed event and confirm it lands in the Event Bus." },
    ],
  },
  {
    id: "testing",
    title: "Testing",
    icon: FlaskConical,
    summary: "Run the pilot validation harness end-to-end before activation.",
    tasks: [
      { id: "test.harness", title: "Run Integration Test Center", description: "Exercise auth, idempotency, ingestion, mapping, materialization, and error recovery." },
      { id: "test.lifecycle", title: "Full lifecycle rehearsal", description: "WO → event → materialization → posting → report → metric → APEX insight." },
      { id: "test.close", title: "Trial close", description: "Run a mock period close with the AI Controller advisory review." },
    ],
  },
  {
    id: "activation",
    title: "Go-live checklist",
    icon: Rocket,
    summary: "Cutover authorization and pilot activation.",
    tasks: [
      { id: "go.readiness", title: "Production Readiness green", description: "All categories on /admin/readiness marked ready." },
      { id: "go.approver", title: "Cutover approver sign-off", description: "Accounting lead and integration lead sign the go/no-go." },
      { id: "go.activate", title: "Activate ServiceConnect pilot", description: "Flip environment to production and enable live event ingestion." },
    ],
  },
];

function CustomerOnboarding() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const total = STAGES.reduce((s, st) => s + st.tasks.length, 0);
  const pct = Math.round((done.size / total) * 100);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Pilot activation"
        title="Customer Onboarding"
        description="Guided workflow from tenant creation to pilot go-live. Every step routes through canonical surfaces — no shortcuts around the accounting engine or Financial Event Bus."
        actions={
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {done.size} / {total} tasks
          </Badge>
        }
      />
      <PageBody>
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="font-semibold">Overall progress</div>
            <div className="text-muted-foreground">{pct}%</div>
          </div>
          <Progress value={pct} />
        </Card>

        {STAGES.map((stage) => {
          const stageDone = stage.tasks.filter((t) => done.has(t.id)).length;
          return (
            <Card key={stage.id} className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-muted p-2">
                    <stage.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{stage.title}</div>
                    <div className="text-xs text-muted-foreground">{stage.summary}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {stageDone} / {stage.tasks.length}
                </Badge>
              </div>
              <div className="divide-y divide-border">
                {stage.tasks.map((task) => {
                  const isDone = done.has(task.id);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => toggle(task.id)}
                      className="flex w-full items-start gap-3 py-3 text-left hover:bg-muted/40"
                    >
                      {isDone ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <div className={cn("text-sm font-medium", isDone && "text-muted-foreground line-through")}>
                          {task.title}
                        </div>
                        <div className="text-xs text-muted-foreground">{task.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}

        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <div className="text-sm font-semibold">Reference surfaces</div>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Data migration staging: <code>/admin/migration</code></li>
            <li>Integration Test Center: <code>/admin/integration-testing</code></li>
            <li>Production Readiness: <code>/admin/readiness</code></li>
            <li>Financial Event Bus: <code>/admin/financial-events</code></li>
            <li>Runbook: <code>docs/ledgeros/26-serviceconnect-pilot-runbook.md</code></li>
          </ul>
        </Card>
      </PageBody>
    </AppShell>
  );
}
