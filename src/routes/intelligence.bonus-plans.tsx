import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currency } from "@/lib/mock/finance";
import { BONUS_PLANS, BONUS_PLAN_TYPES } from "@/lib/mock/intelligence";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/intelligence/bonus-plans")({
  head: () => ({ meta: [{ title: "Bonus Plans — LedgerOS" }] }),
  component: BonusPlansPage,
});

const CALC_TYPES = ["Fixed", "Percentage", "Tiered", "Per milestone", "Profit share", "Team pool", "Weighted score", "Discretionary"];

function BonusPlansPage() {
  const [name, setName] = useState("New bonus plan");
  const [type, setType] = useState(BONUS_PLAN_TYPES[0]);
  const [calc, setCalc] = useState("Percentage");

  return (
    <IntelligencePage
      title="Bonus Plan Builder"
      description="Configure commission, milestone, retention, accuracy, and discretionary plans."
    >
      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card className="border-border/70 p-4">
          <h3 className="text-[13px] font-semibold">New plan</h3>
          <div className="mt-3 space-y-3 text-[12px]">
            <Field label="Plan name">
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" />
            </Field>
            <Field label="Plan type">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BONUS_PLAN_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Calculation type">
              <Select value={calc} onValueChange={setCalc}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CALC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Threshold"><Input placeholder="$30,000" className="h-8" /></Field>
              <Field label="Percentage"><Input placeholder="6%" className="h-8" /></Field>
              <Field label="Fixed amount"><Input placeholder="$500" className="h-8" /></Field>
              <Field label="Maximum"><Input placeholder="$12,000" className="h-8" /></Field>
              <Field label="Minimum"><Input placeholder="$0" className="h-8" /></Field>
              <Field label="Chargeback hold"><Input placeholder="10% / 60d" className="h-8" /></Field>
            </div>
            <Field label="Approval route">
              <Select defaultValue="rose">
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rose">Rose (Owner)</SelectItem>
                  <SelectItem value="christin">Christin (Accounting)</SelectItem>
                  <SelectItem value="both">Christin → Rose</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Effective date"><Input type="date" className="h-8" /></Field>
              <Field label="Expiration"><Input type="date" className="h-8" /></Field>
            </div>
            <Field label="GL account"><Input placeholder="5100 · Payroll · Bonus expense" className="h-8" /></Field>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10.5px] italic text-muted-foreground">Demonstration only — plan is not saved.</span>
              <Button
                size="sm"
                className="h-8"
                onClick={() => toast.success("Plan saved (demo)", { description: "No accounting record was modified." })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Save plan
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 p-0">
          <div className="border-b border-border/70 p-3">
            <h3 className="text-[13px] font-semibold">Active plans</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Eligible</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Metric</th>
                  <th className="px-3 py-2 text-left">Trigger</th>
                  <th className="px-3 py-2 text-left">Calc</th>
                  <th className="px-3 py-2 text-right">Max</th>
                  <th className="px-3 py-2 text-left">Holdback</th>
                  <th className="px-3 py-2 text-left">Approver</th>
                </tr>
              </thead>
              <tbody>
                {BONUS_PLANS.map((p) => (
                  <tr key={p.id} className="border-t border-border/70 hover:bg-muted/30">
                    <td className="px-3 py-2 font-semibold">{p.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.type}</td>
                    <td className="px-3 py-2 text-right font-tabular">{p.eligible}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.department}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.metric}</td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">{p.trigger}</td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">{p.calc}</td>
                    <td className="px-3 py-2 text-right font-tabular">{currency(p.max)}</td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">{p.holdback}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.approver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </IntelligencePage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
