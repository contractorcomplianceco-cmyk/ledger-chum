import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { DemoNotice, DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import { ReconciliationAccountCard } from "@/components/banking/reconciliation-account-card";
import { ReconciliationSummaryPanel } from "@/components/banking/reconciliation-summary-panel";
import { ReconciliationStepHeader } from "@/components/banking/reconciliation-step-header";
import { ReconciliationHistoryTable } from "@/components/banking/reconciliation-history-table";
import { TxKindIcon } from "@/components/banking/transaction-icons";
import { BANK_ACCOUNTS, TRANSACTIONS, type BankAccount } from "@/lib/mock/banking";
import { currencyPrecise } from "@/lib/mock/finance";
import { ArrowLeft, ArrowRight, Check, FileUp, History, Lock, Send, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/banking/reconciliation")({
  head: () => ({
    meta: [
      { title: "Reconciliation Workspace — LedgerOS UI Design Lab" },
      {
        name: "description",
        content:
          "Guided bank reconciliation with cleared/uncleared tracking, exception resolution, and approval workflow.",
      },
      { property: "og:title", content: "Reconciliation — LedgerOS" },
      {
        property: "og:description",
        content: "Fortune-500-grade bank reconciliation workspace for accounting operations.",
      },
    ],
  }),
  component: ReconciliationPage,
});

const STEPS = [
  { id: 1, label: "Select account" },
  { id: 2, label: "Statement details" },
  { id: 3, label: "Clear transactions" },
  { id: 4, label: "Resolve exceptions" },
  { id: 5, label: "Review" },
  { id: 6, label: "Submit" },
  { id: 7, label: "Approval" },
];

function ReconciliationPage() {
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const activeAccount = BANK_ACCOUNTS.find((a) => a.id === activeAccountId) ?? null;

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Banking"
        title="Reconciliation"
        description="Match feed to ledger, resolve exceptions, and lock reconciled periods"
        actions={
          activeAccount && (
            <Button variant="ghost" size="sm" onClick={() => setActiveAccountId(null)}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to accounts
            </Button>
          )
        }
      />

      <PageBody>
        <DemoNotice />

        {!activeAccount ? (
          <Landing onStart={(id) => setActiveAccountId(id)} />
        ) : (
          <ReconciliationFlow account={activeAccount} onExit={() => setActiveAccountId(null)} />
        )}
      </PageBody>
    </AppShell>
  );
}

function Landing({ onStart }: { onStart: (id: string) => void }) {
  const daysOverdue: Record<string, number> = { "acct-sav": 12 };
  const unreconciledByAccount = BANK_ACCOUNTS.reduce<Record<string, number>>((acc, a) => {
    acc[a.id] = TRANSACTIONS.filter((t) => t.accountId === a.id && !t.reconciled).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-1.5 h-3.5 w-3.5" /> History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {BANK_ACCOUNTS.map((a) => (
              <ReconciliationAccountCard
                key={a.id}
                account={a}
                daysOverdue={daysOverdue[a.id]}
                unreconciledCount={unreconciledByAccount[a.id] ?? 0}
                onStart={() => onStart(a.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <ReconciliationHistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReconciliationFlow({ account, onExit }: { account: BankAccount; onExit: () => void }) {
  const [step, setStep] = useState(3); // Jump straight to clear step for demo
  const [statementStart, setStatementStart] = useState("2026-07-01");
  const [statementEnd, setStatementEnd] = useState("2026-07-31");
  const [startingBalance] = useState(1_620_400.11);
  const [endingBalance, setEndingBalance] = useState(1_838_902.11);
  const [notes, setNotes] = useState("");

  const accountTx = useMemo(
    () => TRANSACTIONS.filter((t) => t.accountId === account.id),
    [account.id],
  );
  const [cleared, setCleared] = useState<Set<string>>(
    () => new Set(accountTx.filter((t) => t.reconciled || t.status === "matched").map((t) => t.id)),
  );

  const clearedTx = accountTx.filter((t) => cleared.has(t.id));
  const unclearedTx = accountTx.filter((t) => !cleared.has(t.id));
  const clearedSum = clearedTx.reduce((s, t) => s + t.amount, 0);
  const clearedBalance = startingBalance + clearedSum;
  const unclearedSum = unclearedTx.reduce((s, t) => s + t.amount, 0);
  const difference = endingBalance - clearedBalance;
  const balanced = Math.abs(difference) < 0.005;

  const isLocked = account.reconciliation === "reconciled" && step >= 7;

  const toggle = (id: string) =>
    setCleared((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Reconciling
            </div>
            <div className="mt-0.5 text-lg font-semibold">
              {account.nickname}{" "}
              <span className="font-mono text-xs text-muted-foreground">{account.mask}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {account.institution} · Statement {statementStart} → {statementEnd}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={account.reconciliation} />
            {isLocked && (
              <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
                <Lock className="mr-1 h-3 w-3" /> Locked
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-4">
          <ReconciliationStepHeader steps={STEPS} current={step} onStepClick={setStep} />
        </div>
      </Card>

      {step === 1 && (
        <Card className="p-6">
          <div className="text-sm">
            Selected account: <strong>{account.nickname}</strong> {account.mask}
          </div>
          <Button className="mt-4" onClick={next}>
            Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold">Statement details</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ss">Statement start</Label>
              <Input
                id="ss"
                type="date"
                value={statementStart}
                onChange={(e) => setStatementStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="se">Statement end</Label>
              <Input
                id="se"
                type="date"
                value={statementEnd}
                onChange={(e) => setStatementEnd(e.target.value)}
              />
            </div>
            <div>
              <Label>Starting balance</Label>
              <Input value={currencyPrecise(startingBalance)} readOnly className="font-tabular" />
            </div>
            <div>
              <Label htmlFor="eb">Ending balance</Label>
              <Input
                id="eb"
                type="number"
                step="0.01"
                value={endingBalance}
                onChange={(e) => setEndingBalance(Number(e.target.value))}
                className="font-tabular"
              />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Statement attachment</Label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                <FileUp className="h-4 w-4" /> Drop statement PDF (mock upload only)
              </div>
            </div>
            <div>
              <Label htmlFor="rn">Reconciliation notes</Label>
              <Textarea
                id="rn"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Context for reviewers…"
                className="min-h-[70px]"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={back}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
            <Button onClick={next}>
              Clear transactions <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold">Clear transactions</h3>
                <p className="text-xs text-muted-foreground">
                  Check items that appear on the bank statement.
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {clearedTx.length} cleared · {unclearedTx.length} uncleared
              </div>
            </div>
            <div className="max-h-[540px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground backdrop-blur">
                  <tr>
                    <th className="w-10 px-3 py-2.5"></th>
                    <th className="px-2 py-2.5 text-left">Date</th>
                    <th className="px-2 py-2.5 text-left">Description</th>
                    <th className="px-2 py-2.5 text-right">Amount</th>
                    <th className="px-2 py-2.5 text-left">Status</th>
                    <th className="px-2 py-2.5 text-left">Match</th>
                    <th className="px-2 py-2.5 text-left">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {accountTx.map((t) => {
                    const isCleared = cleared.has(t.id);
                    return (
                      <tr
                        key={t.id}
                        className={cn(
                          "border-t border-border/60 transition-colors hover:bg-muted/40",
                          isCleared && "bg-success/5",
                        )}
                      >
                        <td className="px-3 py-2">
                          <Checkbox
                            checked={isCleared}
                            onCheckedChange={() => toggle(t.id)}
                            aria-label={`Mark ${t.merchant} cleared`}
                          />
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 font-tabular text-xs text-muted-foreground">
                          {t.date}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <TxKindIcon kind={t.kind} />
                            <span className="truncate font-medium">{t.merchant}</span>
                          </div>
                        </td>
                        <td
                          className={cn(
                            "whitespace-nowrap px-2 py-2 text-right font-tabular",
                            t.amount > 0 ? "text-success" : "",
                          )}
                        >
                          {t.amount > 0 ? "+" : "−"}
                          {currencyPrecise(Math.abs(t.amount))}
                        </td>
                        <td className="px-2 py-2">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-2 py-2 text-xs">
                          {t.suggestedMatch ? (
                            <span className="text-info">✓ Matched</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs">
                          {t.receipt === "attached" ? (
                            <span className="text-success">Attached</span>
                          ) : t.receipt === "missing" ? (
                            <span className="text-warning">Missing</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
              </Button>
              <Button onClick={next}>
                Resolve exceptions <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          <div>
            <ReconciliationSummaryPanel
              statementEnding={endingBalance}
              clearedBalance={clearedBalance}
              unclearedAmount={unclearedSum}
              clearedCount={clearedTx.length}
              unclearedCount={unclearedTx.length}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold">Resolve exceptions</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Every exception below must be resolved or documented before the reconciliation can
            complete.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {EXCEPTIONS.map((e) => (
              <ExceptionCard key={e.id} {...e} />
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={back}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
            <Button onClick={next}>
              Review <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      )}

      {step === 5 && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="space-y-5 p-6">
            <div>
              <h3 className="text-sm font-semibold">Review</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Confirm cleared items, exceptions, and evidence before submitting for approval.
              </p>
            </div>

            <ReviewSection title="Statement">
              <ReviewRow label="Period" value={`${statementStart} → ${statementEnd}`} />
              <ReviewRow label="Starting balance" value={currencyPrecise(startingBalance)} />
              <ReviewRow label="Ending balance" value={currencyPrecise(endingBalance)} />
            </ReviewSection>

            <Separator />

            <ReviewSection title="Activity">
              <ReviewRow label="Cleared transactions" value={`${clearedTx.length}`} />
              <ReviewRow label="Uncleared transactions" value={`${unclearedTx.length}`} />
              <ReviewRow label="Exceptions resolved" value={`${EXCEPTIONS.length}`} />
              <ReviewRow label="Adjustments" value="0 (no journal entries created)" />
            </ReviewSection>

            <Separator />

            <ReviewSection title="Prepared by">
              <ReviewRow label="Preparer" value="K. Chen (Accounting)" />
              <ReviewRow label="Notes" value={notes || "—"} />
              <ReviewRow label="Attachments" value="statement-jul-2026.pdf (mock)" />
            </ReviewSection>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
              </Button>
              <Button onClick={next} disabled={!balanced}>
                Submit for approval <Send className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
          <div>
            <ReconciliationSummaryPanel
              statementEnding={endingBalance}
              clearedBalance={clearedBalance}
              unclearedAmount={unclearedSum}
              clearedCount={clearedTx.length}
              unclearedCount={unclearedTx.length}
            />
          </div>
        </div>
      )}

      {step === 6 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold">Submit for approval</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Approvals ensure segregation of duties before the period is locked.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ApproverRow name="Morgan Rose" role="Owner" required />
            <ApproverRow name="Christin Park" role="Accounting Lead" />
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={back}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
            <Button
              onClick={() => {
                toast("Submitted for approval", { description: DEMO_ACTION_MESSAGE });
                next();
              }}
            >
              Send for approval <Send className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      )}

      {step === 7 && (
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <StatusBadge status="ready_for_approval" />
            <span className="text-sm">Awaiting Rose approval — 12 min ago</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Reopening a completed reconciliation requires elevated approval. Audit history remains
            visible on all outcomes.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => toast("Reconciliation approved", { description: DEMO_ACTION_MESSAGE })}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => toast("Changes requested", { description: DEMO_ACTION_MESSAGE })}
            >
              <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Request changes
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast("Rejected", { description: DEMO_ACTION_MESSAGE })}
            >
              <X className="mr-1.5 h-3.5 w-3.5" /> Reject
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast("Note added", { description: DEMO_ACTION_MESSAGE })}
            >
              Add note
            </Button>
          </div>

          <Separator />
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Approval timeline
              </h4>
            </div>
            <ol className="space-y-2 border-l border-border pl-3 text-xs">
              <li>
                <div className="font-medium">Submitted for approval</div>
                <div className="text-muted-foreground">K. Chen · 12 min ago</div>
              </li>
              <li>
                <div className="font-medium">Cleared 8 transactions</div>
                <div className="text-muted-foreground">K. Chen · 24 min ago</div>
              </li>
              <li>
                <div className="font-medium">Statement details captured</div>
                <div className="text-muted-foreground">K. Chen · 32 min ago</div>
              </li>
            </ol>
          </div>

          <Button variant="ghost" onClick={onExit} className="w-fit">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to reconciliation list
          </Button>
        </Card>
      )}
    </div>
  );
}

const EXCEPTIONS = [
  {
    id: "ex-1",
    type: "Duplicate transaction",
    detail: "AWS charge appears twice within 6 days on Operating.",
    severity: "critical" as const,
  },
  {
    id: "ex-2",
    type: "Missing receipt",
    detail: "Ramp T&E settlement above $500 threshold.",
    severity: "warning" as const,
  },
  {
    id: "ex-3",
    type: "Unclassified transfer",
    detail: "$60,000 internal transfer to Tax Reserve not yet paired.",
    severity: "review" as const,
  },
  {
    id: "ex-4",
    type: "Amount mismatch",
    detail: "Bill payment differs from expected by $12.00.",
    severity: "review" as const,
  },
];

function ExceptionCard({
  type,
  detail,
  severity,
}: {
  type: string;
  detail: string;
  severity: "critical" | "warning" | "review";
}) {
  const tone =
    severity === "critical"
      ? "border-destructive/40 bg-destructive/5"
      : severity === "warning"
        ? "border-warning/40 bg-warning/5"
        : "border-info/30 bg-info/5";
  return (
    <div className={cn("rounded-xl border p-3", tone)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {severity}
          </div>
          <div className="mt-0.5 text-sm font-semibold">{type}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast(`${type} resolved`, { description: DEMO_ACTION_MESSAGE })}
        >
          Resolve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => toast("Documented as reviewed", { description: DEMO_ACTION_MESSAGE })}
        >
          Document review
        </Button>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h4>
      <dl className="space-y-1 text-sm">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,180px)_minmax(0,1fr)] gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xs font-medium">{value}</dd>
    </div>
  );
}

function ApproverRow({ name, role, required }: { name: string; role: string; required?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-brand" />
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
      {required && <Badge variant="outline">Required</Badge>}
    </div>
  );
}
