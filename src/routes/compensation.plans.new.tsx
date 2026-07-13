import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CompensationShell, DemoActionNotice, showDemoToast } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/compensation/plans/new")({
  head: () => ({ meta: [{ title: "New Compensation Plan — LedgerOS" }] }),
  component: NewPlanPage,
});

const STEPS = [
  { key: "identity", title: "Plan Identity", desc: "Name, description, family, class, owner, effective dates, review flags" },
  { key: "basis", title: "Calculation Basis", desc: "Select from 15 supported bases (collected NRSR, gross profit, milestone, team pool, revenue share…)" },
  { key: "eligibility", title: "Eligibility", desc: "Participants, roles, departments, services, products, apps, channels, entities, customer types, geography, house-account behavior, renewal/expansion, event, strategic relationship" },
  { key: "rate", title: "Rate & Formula", desc: "Percentage, fixed, tiered, accelerator, decelerator, min/max, cap, floor, pool size, split method, margin floor, per-plan overrides" },
  { key: "deductions", title: "Deductions & Exclusions", desc: "Invariant defaults preserved: pass-through excluded, uncollected excluded, refunds/credits/chargebacks/discounts deducted, noncommissionable excluded. Relaxation requires legal + Owner." },
  { key: "lifecycle", title: "Timing & Lifecycle", desc: "Payment-clearing lag, chargeback window, holdback %, holdback release, draw offset order, payable timing, payroll/AP destination, post-termination survival" },
  { key: "approval", title: "Approval Route", desc: "Verification owner, accounting reviewer, manager, Owner threshold, legal-review trigger, manual adjustment threshold, high-value threshold, margin-override threshold" },
  { key: "gl", title: "GL & Payment Mapping", desc: "Expense/payable/payroll/AP/reserve/holdback/clawback accounts, entity assignment" },
  { key: "summary", title: "Plain-Language Summary", desc: "Human-readable explanation shown to reviewers and participants" },
  { key: "preview", title: "Preview & Submit", desc: "Example calculation, margin/cash impact, invariant checks, resolved policy snapshot, required approvals" },
];

const BASES = [
  "collected_realized_service_revenue",
  "collected_retained_revenue",
  "collected_and_cleared_nrsr",
  "gross_profit",
  "contribution_profit",
  "fixed_amount",
  "milestone_amount",
  "tiered_amount",
  "team_pool",
  "revenue_share",
  "profit_share",
  "renewal_amount",
  "expansion_amount",
  "subscription_amount",
  "discretionary_amount",
];

function NewPlanPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [family, setFamily] = useState("sales_commission");
  const [basis, setBasis] = useState<string>("collected_and_cleared_nrsr");
  const [rate, setRate] = useState("0.10");
  const [summary, setSummary] = useState("");

  return (
    <CompensationShell
      title="New compensation plan"
      description="Guided plan builder. §11 defaults remain approved and configurable; invariants are enforced."
    >
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="p-3">
          <ol className="space-y-1">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => setStep(i)}
                    className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                      active ? "bg-brand/10 text-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                    ) : (
                      <Circle className={`mt-0.5 h-4 w-4 ${active ? "text-brand" : "text-muted-foreground"}`} />
                    )}
                    <div>
                      <div className="font-medium">{i + 1}. {s.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2">{s.desc}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <Badge variant="outline">Step {step + 1} of {STEPS.length}</Badge>
            <h2 className="mt-2 text-lg font-semibold">{STEPS[step].title}</h2>
            <p className="text-sm text-muted-foreground">{STEPS[step].desc}</p>
          </div>

          {step === 0 && (
            <div className="space-y-3">
              <div>
                <Label>Plan name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard Sales Pool — 10% Collected" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Plan family</Label>
                  <select
                    value={family}
                    onChange={(e) => setFamily(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {[
                      "sales_commission","brand_ambassador_participation","referral","strategic_partner_share",
                      "affiliate","software_participation","milestone_bonus","retainer","event_stipend",
                      "profit_sharing","equity_milestone","investor_milestone_bonus","team_bonus","manager_override",
                    ].map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Owner</Label>
                  <Input placeholder="Rose Delacroix" />
                </div>
                <div>
                  <Label>Effective date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Expiration date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Legal review required</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Accounting review required</label>
                <label className="flex items-center gap-2"><input type="checkbox" /> Active</label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {BASES.map((b) => (
                <label key={b} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 ${basis === b ? "border-brand bg-brand/5" : "border-border"}`}>
                  <input type="radio" checked={basis === b} onChange={() => setBasis(b)} />
                  {b.replaceAll("_", " ")}
                </label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 text-sm">
              {["Participants","Roles","Departments","Services","Products","Apps","Channels","Entities","Customer types","Geography","Renewal/expansion","Event","Strategic relationship"].map((f) => (
                <div key={f}>
                  <Label>{f}</Label>
                  <Input placeholder={`Comma-separated ${f.toLowerCase()}…`} />
                </div>
              ))}
              <div>
                <Label>House-account behavior</Label>
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  <option value="suppress">Suppress (default)</option>
                  <option value="reduce">Reduce to configurable %</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label>Percentage</Label>
                <Input value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.10" />
              </div>
              <div><Label>Fixed amount</Label><Input placeholder="0.00" /></div>
              <div><Label>Tiered rate table</Label><Input placeholder="0-50k @ 8%; 50k+ @ 12%" /></div>
              <div><Label>Accelerator</Label><Input placeholder="×1.25 above 120% quota" /></div>
              <div><Label>Decelerator</Label><Input placeholder="×0.5 below 60% quota" /></div>
              <div><Label>Minimum threshold</Label><Input /></div>
              <div><Label>Maximum payout</Label><Input /></div>
              <div><Label>Cap</Label><Input /></div>
              <div><Label>Floor</Label><Input /></div>
              <div><Label>Pool size</Label><Input placeholder="10% of realized NRSR" /></div>
              <div><Label>Split method</Label><Input placeholder="Even, weighted, evidence-weighted…" /></div>
              <div><Label>Margin floor</Label><Input placeholder="45%" /></div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2 text-sm">
              <div className="rounded-md border border-warning/40 bg-warning/5 p-3">
                Invariant defaults apply: pass-through excluded, uncollected revenue excluded, refunds/credits/chargebacks/discounts deducted, noncommissionable items excluded. Relaxing these requires legal + Owner approval with a written reason.
              </div>
              {["Pass-through","Uncollected revenue","Refunds","Credits","Chargebacks","Discounts","Noncommissionable items","Merchant fees","Third-party costs"].map((d) => (
                <label key={d} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                  <span>{d}</span>
                  <select className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                    <option>Deducted (default)</option>
                    <option>Excluded from base</option>
                    <option>Included (requires override)</option>
                  </select>
                </label>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><Label>Payment-clearing lag (days)</Label><Input defaultValue="3" /></div>
              <div><Label>Chargeback window (days)</Label><Input defaultValue="90" /></div>
              <div><Label>Holdback %</Label><Input defaultValue="10" /></div>
              <div>
                <Label>Holdback release</Label>
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  <option>Automatic on window expiry</option>
                  <option>Requires Owner approval</option>
                </select>
              </div>
              <div>
                <Label>Draw offset order</Label>
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  <option>Payable (default)</option>
                  <option>Approved</option>
                  <option>Paid only</option>
                </select>
              </div>
              <div><Label>Payable timing</Label><Input placeholder="Monthly, after clearing" /></div>
              <div>
                <Label>Payroll / AP destination</Label>
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  <option>Payroll</option>
                  <option>AP</option>
                  <option>External wire</option>
                </select>
              </div>
              <div>
                <Label>Post-termination survival</Label>
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  <option>12 months (default)</option>
                  <option>Life of account</option>
                  <option>None</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><Label>Verification owner</Label><Input placeholder="Accounting Lead" /></div>
              <div><Label>Accounting reviewer</Label><Input placeholder="Accountant" /></div>
              <div><Label>Manager reviewer</Label><Input placeholder="Department head" /></div>
              <div><Label>Owner approval threshold</Label><Input placeholder="$5,000" /></div>
              <div><Label>Legal-review trigger</Label><Input placeholder="Investor, equity, sensitive" /></div>
              <div><Label>Manual adjustment threshold</Label><Input placeholder="$500" /></div>
              <div><Label>High-value threshold</Label><Input placeholder="$10,000" /></div>
              <div><Label>Margin-override threshold</Label><Input placeholder="40%" /></div>
            </div>
          )}

          {step === 7 && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {["Expense account","Payable account","Payroll treatment","AP treatment","Reserve account","Holdback account","Clawback account","Entity assignment"].map((k) => (
                <div key={k}><Label>{k}</Label><Input /></div>
              ))}
            </div>
          )}

          {step === 8 && (
            <div>
              <Label>Plain-language summary</Label>
              <Textarea
                rows={6}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Pay 10% of collected and cleared CCA service revenue after excluding pass-through funds, refunds, credits, chargebacks, and noncommissionable items. When Tara qualifies at 5%, the salesperson receives the remaining portion of the standard 10% pool."
              />
            </div>
          )}

          {step === 9 && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md border border-border/60 p-3">
                <div className="font-semibold">Example calculation</div>
                <p className="text-muted-foreground">$12,000 gross → $10,800 realized (10% pass-through excluded) → $1,080 pool → 50/50 split → $540 Tara / $540 salesperson.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border/60 p-3">
                  <div className="text-xs text-muted-foreground">Margin impact</div>
                  <div className="font-semibold">-10%</div>
                </div>
                <div className="rounded-md border border-border/60 p-3">
                  <div className="text-xs text-muted-foreground">Cash impact</div>
                  <div className="font-semibold">-$1,080</div>
                </div>
              </div>
              <div className="rounded-md border border-border/60 p-3">
                <div className="mb-1 font-semibold">Invariant checks</div>
                <ul className="ml-4 list-disc space-y-0.5 text-xs">
                  <li>Pass-through excluded from base ✓</li>
                  <li>Base uses collected & cleared revenue only ✓</li>
                  <li>No double-dip on the same basis ✓</li>
                  <li>Attribution split totals exactly 100% per pool ✓</li>
                </ul>
              </div>
              <div className="rounded-md border border-border/60 p-3">
                <div className="mb-1 font-semibold">Required approvals</div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">Accounting Lead</Badge>
                  <Badge variant="outline">Owner</Badge>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <Button onClick={() => showDemoToast("Plan submitted for review")}>Submit for review</Button>
            )}
          </div>
        </Card>
      </div>
      <DemoActionNotice className="mt-4" />
    </CompensationShell>
  );
}
