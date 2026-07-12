import { createFileRoute, Link } from "@tanstack/react-router";
import { IntelligencePage } from "@/components/intelligence/intelligence-page";
import { Card } from "@/components/ui/card";
import { MarginIndicator } from "@/components/intelligence/margin-indicator";
import { currency } from "@/lib/mock/finance";
import { CLIENT_PROFITABILITY, SERVICE_PROFITABILITY, DEPARTMENT_PROFITABILITY } from "@/lib/mock/intelligence";
import { PieChart as PieIcon, Users2, Wrench, Building2 } from "lucide-react";

export const Route = createFileRoute("/intelligence/profitability")({
  head: () => ({ meta: [{ title: "Profitability — LedgerOS" }] }),
  component: ProfitabilityHome,
});

function ProfitabilityHome() {
  const totalRevenue = CLIENT_PROFITABILITY.reduce((s, c) => s + c.revenue, 0);
  const totalContribution = CLIENT_PROFITABILITY.reduce((s, c) => s + c.contribution, 0);
  const avgMargin = (totalContribution / totalRevenue) * 100;

  return (
    <IntelligencePage
      title="Profitability Command Center"
      description="Contribution profit across clients, services, and departments — using true unit economics."
    >
      <section>
        <Card className="rounded-xl border-info/30 bg-info/[0.06] p-4 text-[12.5px] text-info">
          <div className="font-semibold">Contribution profit formula</div>
          <div className="mt-1 font-mono text-[11.5px] leading-relaxed">
            Collected revenue − Pass-through − Commissions − Direct fulfillment labor − Direct vendor costs − Technology allocation − Marketing acquisition − Refunds − Chargebacks = Contribution profit
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard label="Total collected revenue" value={currency(totalRevenue)} />
        <MetricCard label="Total contribution profit" value={currency(totalContribution)} tone="success" />
        <MetricCard label="Average contribution margin" value={`${avgMargin.toFixed(1)}%`} />
        <MetricCard label="Unprofitable clients" value={String(CLIENT_PROFITABILITY.filter((c) => c.contribution < 0).length)} tone="destructive" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <DimensionCard
          icon={Users2}
          title="By client"
          to="/intelligence/clients"
          rows={CLIENT_PROFITABILITY.slice(0, 5).map((c) => ({
            label: c.client,
            value: currency(c.contribution),
            margin: c.margin,
          }))}
        />
        <DimensionCard
          icon={Wrench}
          title="By service"
          to="/intelligence/services"
          rows={SERVICE_PROFITABILITY.slice(0, 5).map((s) => ({
            label: s.name,
            value: currency(s.contribution),
            margin: (s.contribution / s.avgPrice) * 100,
          }))}
        />
        <DimensionCard
          icon={Building2}
          title="By department"
          to="/intelligence/departments"
          rows={DEPARTMENT_PROFITABILITY.slice(0, 5).map((d) => ({
            label: d.name,
            value: currency(d.contribution),
            margin: d.efficiency * 100,
          }))}
        />
      </section>

      <section>
        <Card className="border-border/70 p-4">
          <div className="flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-info" />
            <h3 className="text-[13px] font-semibold">Profitability dimensions available</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11.5px]">
            {[
              "Client", "Service", "Department", "Employee", "Salesperson", "State",
              "Product", "App", "Campaign", "Lead source", "Project", "Subscription plan", "Qualifier placement",
            ].map((d) => (
              <span key={d} className="rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-muted-foreground">
                {d}
              </span>
            ))}
          </div>
        </Card>
      </section>
    </IntelligencePage>
  );
}

function MetricCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "destructive" }) {
  const toneCls =
    tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card className="border-border/70 p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-tabular text-[22px] font-bold ${toneCls}`}>{value}</div>
    </Card>
  );
}

function DimensionCard({
  icon: Icon,
  title,
  to,
  rows,
}: {
  icon: typeof Users2;
  title: string;
  to: string;
  rows: { label: string; value: string; margin: number }[];
}) {
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-info" />
          <h3 className="text-[13px] font-semibold">{title}</h3>
        </div>
        <Link to={to as "/intelligence"} className="text-[11.5px] text-muted-foreground hover:text-foreground">
          Open →
        </Link>
      </div>
      <div className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="rounded-md border border-border/70 p-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="truncate font-medium">{r.label}</span>
              <span className="font-tabular font-semibold">{r.value}</span>
            </div>
            <div className="mt-1">
              <MarginIndicator value={r.margin} target={30} compact />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
