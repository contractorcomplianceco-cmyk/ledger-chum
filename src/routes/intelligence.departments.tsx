import { createFileRoute } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/mock/finance";
import { DEPARTMENT_PROFITABILITY } from "@/lib/mock/intelligence";
import { cn } from "@/lib/utils";

const KIND_META = {
  direct: { label: "Direct profitability", cls: "bg-success/10 text-success" },
  support: { label: "Strategic support", cls: "bg-info/10 text-info" },
  strategic: { label: "Strategic leadership", cls: "bg-info/15 text-info" },
} as const;

export const Route = createFileRoute("/intelligence/departments")({
  head: () => ({ meta: [{ title: "Department Profitability — LedgerOS" }] }),
  component: DepartmentProfitPage,
});

function DepartmentProfitPage() {
  return (
    <IntelligencePage
      title="Department Economics"
      description="Direct revenue is not the only measure of value. Support departments show strategic-support value."
    >
      <section>
        <Card className="rounded-xl border-info/30 bg-info/[0.06] p-3 text-[11.5px] text-info">
          Support departments (Fulfillment, Compliance Ops, Systems, Admin, Accounting) do not generate direct revenue —
          their value is measured through revenue supported, quality, capacity, and risk reduction.
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {DEPARTMENT_PROFITABILITY.map((d) => {
          const meta = KIND_META[d.kind];
          const totalCost = d.directCost + d.overhead + d.payroll + d.tech + d.bonus;
          return (
            <Card key={d.name} className="border-border/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold">{d.name}</div>
                  <Badge className={cn("mt-1 h-5 border-0 px-1.5 text-[10.5px]", meta.cls)} variant="secondary">
                    {meta.label}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Contribution
                  </div>
                  <div
                    className={cn(
                      "font-tabular text-[18px] font-bold",
                      d.contribution < 0 ? "text-destructive" : d.contribution > 0 ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {d.kind === "direct" ? currency(d.contribution) : "—"}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
                <Cell label="Revenue supported" value={currency(d.revenueSupported)} />
                <Cell label="Direct revenue" value={currency(d.directRevenue)} />
                <Cell label="Direct cost" value={currency(d.directCost)} />
                <Cell label="Allocated overhead" value={currency(d.overhead)} />
                <Cell label="Payroll" value={currency(d.payroll)} />
                <Cell label="Technology" value={currency(d.tech)} />
                <Cell label="Bonus obligations" value={currency(d.bonus)} />
                <Cell label="Total cost" value={currency(totalCost)} />
              </div>

              {d.kind === "direct" && (
                <div className="mt-3 text-[11px] text-muted-foreground">
                  Cost efficiency:{" "}
                  <span className="font-tabular font-semibold text-foreground">{d.efficiency.toFixed(2)}x</span>{" "}
                  revenue per cost dollar
                </div>
              )}
            </Card>
          );
        })}
      </section>
    </IntelligencePage>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-tabular font-semibold text-foreground">{value}</div>
    </div>
  );
}
