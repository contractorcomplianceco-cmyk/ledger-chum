import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrgId } from "@/hooks/use-current-org";
import { isMockMode } from "@/lib/api/config";
import { mockCashFlow } from "@/lib/mock/ledger";
import { getCashFlow } from "@/lib/accounting/financial-reports.functions";

export const Route = createFileRoute("/reports/cash-flow")({
  head: () => ({
    meta: [
      { title: "Cash Flow — LedgerOS" },
      { name: "description", content: "Operating cash flow via the indirect method, from posted journal lines." },
      { property: "og:title", content: "Cash Flow — LedgerOS" },
      { property: "og:description", content: "Indirect cash flow: Net Income adjusted for working capital changes." },
    ],
  }),
  component: CashFlowPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function Row({ label, amount, muted, strong }: { label: string; amount: number; muted?: boolean; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-2 ${strong ? "font-bold border-t-2 mt-2 pt-3" : "border-b"} ${muted ? "text-muted-foreground pl-6" : ""}`}>
      <span>{label}</span>
      <span className="tabular-nums">{fmt(amount)}</span>
    </div>
  );
}

function CashFlowPage() {
  const orgId = useOrgId();
  const today = new Date();
  const [from, setFrom] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(today.toISOString().slice(0, 10));
  const fn = useServerFn(getCashFlow);
  const q = useQuery({
    queryKey: ["report.cf", orgId, from, to],
    queryFn: () => fn({ data: { orgId: orgId!, from, to } }),
    enabled: !!orgId,
  });

  const report = orgId ? q.data : isMockMode() ? mockCashFlow(from, to) : undefined;

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Reporting"
        title="Cash Flow (indirect)"
        description="Operating = Net Income + ΔAP − ΔAR − ΔInventory. Investing/Financing arrive with M4."
      />
      <PageBody>
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
        </Card>
        <Card className="p-6">
          {!report ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="max-w-xl">
              <Row label="Net Income" amount={report.netIncome} />
              <div className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Working capital adjustments</div>
              <Row label="− Increase in Accounts Receivable" amount={-report.adjustments.arIncrease} muted />
              <Row label="− Increase in Inventory" amount={-report.adjustments.inventoryIncrease} muted />
              <Row label="+ Increase in Accounts Payable" amount={report.adjustments.apIncrease} muted />
              <Row label="Cash from Operating" amount={report.operating} strong />
              <Row label="Cash from Investing" amount={report.investing} />
              <Row label="Cash from Financing" amount={report.financing} />
              <Row label="Net Change in Cash" amount={report.netChange} strong />
            </div>
          )}
        </Card>
      </PageBody>
    </AppShell>
  );
}
