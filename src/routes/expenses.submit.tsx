import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PolicyBadge } from "@/components/expenses/policy-badge";
import { ConfidenceBar } from "@/components/expenses/confidence-bar";
import { DemoNotice, DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import { currency } from "@/lib/mock/finance";
import { CATEGORY_META, type ExpenseCategory } from "@/lib/mock/expenses";
import { AlertTriangle, CheckCircle2, ReceiptText, Sparkles, Upload, Copy } from "lucide-react";

export const Route = createFileRoute("/expenses/submit")({
  component: SubmitExpensePage,
});

function SubmitExpensePage() {
  const [vendor, setVendor] = useState("Delta Airlines");
  const [amount, setAmount] = useState(812.4);
  const [category, setCategory] = useState<ExpenseCategory>("travel");
  const [department, setDepartment] = useState("Sales");
  const [client, setClient] = useState("ALD");
  const [reimbursable, setReimbursable] = useState(true);
  const [companyPaid, setCompanyPaid] = useState(true);
  const [purpose, setPurpose] = useState("Client visit — Q3 compliance planning");
  const [hasReceipt, setHasReceipt] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const suggestion = useMemo(() => ({
    category: "travel" as ExpenseCategory,
    department: "Sales",
    client: "ALD",
    duplicateWarning: amount === 812.4,
    confidence: 0.92,
  }), [amount]);

  const policyChecks = useMemo(() => {
    const checks: Array<{ label: string; result: "compliant" | "warning" | "explanation_required" | "approval_required" | "missing_documentation" }> = [];
    checks.push({ label: `Receipt required over $25`, result: hasReceipt || amount <= 25 ? "compliant" : "missing_documentation" });
    checks.push({ label: `Rose approval over $2,500`, result: amount > 2500 ? "approval_required" : "compliant" });
    checks.push({ label: `Travel requires preapproval`, result: category === "travel" ? "explanation_required" : "compliant" });
    checks.push({ label: `Client attribution present`, result: client ? "compliant" : "explanation_required" });
    return checks;
  }, [amount, hasReceipt, category, client]);

  const impact = useMemo(() => ({
    expense: amount,
    budgetRemaining: 4800 - amount,
    spendableCashDelta: -amount,
    departmentBudgetDelta: -amount,
    clientMargin: -amount,
    reimbursement: reimbursable ? amount * 1.1 : 0,
  }), [amount, reimbursable]);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* Form */}
      <div className="space-y-4">
        <Card className="border-border/70 p-5">
          <h3 className="text-[13px] font-semibold">Expense details</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-[12px]">Date</Label>
              <Input type="date" defaultValue="2026-07-08" className="mt-1 h-9 text-[13px]" />
            </div>
            <div>
              <Label className="text-[12px]">Vendor</Label>
              <Input value={vendor} onChange={(e) => setVendor(e.target.value)} className="mt-1 h-9 text-[13px]" />
            </div>
            <div>
              <Label className="text-[12px]">Amount</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1 h-9 font-tabular text-[13px]" />
            </div>
            <div>
              <Label className="text-[12px]">Currency</Label>
              <Select defaultValue="USD">
                <SelectTrigger className="mt-1 h-9 text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger className="mt-1 h-9 text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_META) as ExpenseCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_META[c].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 h-9 text-[13px]" />
            </div>
            <div>
              <Label className="text-[12px]">Client</Label>
              <Input value={client} onChange={(e) => setClient(e.target.value)} className="mt-1 h-9 text-[13px]" />
            </div>
            <div>
              <Label className="text-[12px]">Project</Label>
              <Input placeholder="Optional" className="mt-1 h-9 text-[13px]" />
            </div>
            <div>
              <Label className="text-[12px]">Product / App</Label>
              <Input placeholder="e.g. CCA, LedgerOS" className="mt-1 h-9 text-[13px]" />
            </div>
            <div>
              <Label className="text-[12px]">Payment method</Label>
              <Select defaultValue="amex">
                <SelectTrigger className="mt-1 h-9 text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amex">Amex •• 1004</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="ach">ACH</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-[12px]">Business purpose</Label>
              <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={2} className="mt-1 text-[13px]" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={companyPaid} onCheckedChange={setCompanyPaid} />
              <Label className="text-[12px]">Company-paid</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={reimbursable} onCheckedChange={setReimbursable} />
              <Label className="text-[12px]">Reimbursable to client</Label>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Receipt</h3>
            <ConfidenceBar value={hasReceipt ? 0.94 : 0} label="Extraction confidence" />
          </div>
          <div className="mt-3">
            <label
              htmlFor="receipt-upload"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-8 text-center text-[12.5px] text-muted-foreground hover:bg-muted/30"
            >
              <Upload className="h-5 w-5" />
              <span>{hasReceipt ? "delta-boarding-pass.pdf · 812.40" : "Drop a receipt or click to upload"}</span>
              <span className="text-[11px]">Photo, PDF, or forward to receipts@ledgeros.demo</span>
            </label>
            <input id="receipt-upload" type="file" className="sr-only" onChange={() => setHasReceipt(true)} />
          </div>
        </Card>

        {/* Smart assistance */}
        <Card className="border-border/70 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            <h3 className="text-[13px] font-semibold">Smart assistance</h3>
          </div>
          <ul className="mt-3 space-y-1.5 text-[12.5px]">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-success" /> Merchant normalized to "Delta Airlines" (98%)</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-success" /> Suggested category: Travel · Department: Sales · Client: ALD</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-success" /> Matched to card charge Amex •• 1004 · $812.40 on 2026-07-08</li>
            {suggestion.duplicateWarning && (
              <li className="flex items-start gap-2 text-warning"><Copy className="mt-0.5 h-3.5 w-3.5" /> Possible duplicate — RCP-510 uploaded by email on same day</li>
            )}
            {!hasReceipt && (
              <li className="flex items-start gap-2 text-warning"><ReceiptText className="mt-0.5 h-3.5 w-3.5" /> Missing receipt — required for expenses over $25</li>
            )}
          </ul>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" onClick={() => setConfirmed(false)}>Save draft</Button>
          <div className="flex items-center gap-2">
            <Button variant="outline">Request pre-spend</Button>
            <Button onClick={() => setConfirmed(true)}>Submit expense</Button>
          </div>
        </div>

        {confirmed && (
          <DemoNotice message={DEMO_ACTION_MESSAGE} />
        )}
      </div>

      {/* Right rail: Expense impact preview */}
      <aside className="space-y-4">
        <Card className="border-border/70 p-5">
          <h3 className="text-[13px] font-semibold">Expense impact preview</h3>
          <div className="mt-3 space-y-1.5 text-[13px]">
            <Row label="Expense amount" value={currency(impact.expense)} />
            <Row label="Budget remaining" value={currency(impact.budgetRemaining)} tone={impact.budgetRemaining < 0 ? "destructive" : "muted"} />
            <Row label="Spendable cash Δ" value={currency(impact.spendableCashDelta)} tone="destructive" />
            <Row label={`${department} budget Δ`} value={currency(impact.departmentBudgetDelta)} tone="destructive" />
            {client && <Row label={`${client} margin Δ`} value={currency(impact.clientMargin)} tone="destructive" />}
            {reimbursable && <Row label="Recoverable + markup" value={currency(impact.reimbursement)} tone="success" />}
          </div>
        </Card>

        <Card className="border-border/70 p-5">
          <h3 className="text-[13px] font-semibold">Policy checks</h3>
          <ul className="mt-3 space-y-2 text-[12.5px]">
            {policyChecks.map((p) => (
              <li key={p.label} className="flex items-center justify-between gap-2">
                <span className="text-foreground/85">{p.label}</span>
                <PolicyBadge result={p.result} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-border/70 p-5">
          <h3 className="text-[13px] font-semibold">Approval path</h3>
          <ol className="mt-3 space-y-2 text-[12.5px]">
            <Step label="Employee submits" done />
            <Step label="Manager approves" done={false} />
            <Step label="Accounting reviews" done={false} />
            {amount > 2500 && <Step label="Rose approves (>$2,500)" done={false} highlight />}
            <Step label="Reimbursed via payroll" done={false} />
          </ol>
        </Card>

        <Card className="border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-2 text-[12px] text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Mobile-first design lab preview — submission is not persisted.</span>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value, tone = "muted" }: { label: string; value: string; tone?: "muted" | "success" | "destructive" }) {
  const toneClass = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-tabular font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

function Step({ label, done, highlight }: { label: string; done: boolean; highlight?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold ${done ? "bg-success text-success-foreground" : highlight ? "bg-violet-500 text-white" : "bg-muted text-muted-foreground"}`}>
        {done ? "✓" : "•"}
      </span>
      <span className={highlight ? "font-semibold" : ""}>{label}</span>
    </li>
  );
}
