import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { useOrgId } from "@/hooks/use-current-org";
import { getArAging } from "@/lib/accounting/aging.functions";

export const Route = createFileRoute("/accounts-receivable/aging")({
  head: () => ({
    meta: [
      { title: "AR Aging — LedgerOS" },
      { name: "description", content: "Accounts receivable aging buckets by customer." },
      { property: "og:title", content: "AR Aging — LedgerOS" },
      {
        property: "og:description",
        content: "Overdue receivables by customer and bucket, from posted invoices.",
      },
    ],
  }),
  component: ArAgingPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const BUCKETS = [
  { key: "current", label: "Current" },
  { key: "d1_30", label: "1–30" },
  { key: "d31_60", label: "31–60" },
  { key: "d61_90", label: "61–90" },
  { key: "d90_plus", label: "90+" },
] as const;

function ArAgingPage() {
  const orgId = useOrgId();
  const fn = useServerFn(getArAging);
  const q = useQuery({
    queryKey: ["ar.aging", orgId],
    queryFn: () => fn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });

  return (
    <AppShell>
      <PageHeader title="AR Aging" description="Open invoice balances bucketed by days past due." />
      <PageBody>
        <Card className="p-4">
          {!q.data ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-3">Customer</th>
                    {BUCKETS.map((b) => (
                      <th key={b.key} className="py-2 pr-3 text-right">
                        {b.label}
                      </th>
                    ))}
                    <th className="py-2 pr-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.rows.map((r) => (
                    <tr key={r.customerId} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{r.customerName}</td>
                      {BUCKETS.map((b) => (
                        <td key={b.key} className="py-2 pr-3 text-right tabular-nums">
                          {fmt(r.buckets[b.key])}
                        </td>
                      ))}
                      <td className="py-2 pr-3 text-right tabular-nums font-semibold">
                        {fmt(r.total)}
                      </td>
                    </tr>
                  ))}
                  {q.data.rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={BUCKETS.length + 2}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No open receivables.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t font-semibold">
                    <td className="py-2 pr-3">Total</td>
                    {BUCKETS.map((b) => (
                      <td key={b.key} className="py-2 pr-3 text-right tabular-nums">
                        {fmt(q.data.totals[b.key])}
                      </td>
                    ))}
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(q.data.grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      </PageBody>
    </AppShell>
  );
}
