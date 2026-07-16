import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrgId } from "@/hooks/use-current-org";
import { listFixedAssets } from "@/lib/accounting/fixed-assets.functions";

export const Route = createFileRoute("/ledger/fixed-assets")({
  head: () => ({
    meta: [
      { title: "Fixed Assets — LedgerOS" },
      {
        name: "description",
        content: "Fixed asset register, book value, and depreciation schedule.",
      },
      { property: "og:title", content: "Fixed Assets — LedgerOS" },
    ],
  }),
  component: FixedAssetsPage,
});

function FixedAssetsPage() {
  const orgId = useOrgId();
  const list = useServerFn(listFixedAssets);
  const assets = useQuery({
    queryKey: ["fixed-assets", orgId],
    queryFn: () => list({ data: { orgId: orgId!, status: "all", limit: 200 } }),
    enabled: !!orgId,
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Fixed Assets"
        title="Fixed asset register"
        description="Asset records, acquisition cost, accumulated depreciation, and book value. Depreciation posts through the accounting engine."
      />
      <PageBody>
        {!orgId ? (
          <Card className="p-6 text-sm text-muted-foreground">Sign in to view your assets.</Card>
        ) : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Asset #</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Acquired</th>
                  <th className="px-3 py-2 text-right">Cost</th>
                  <th className="px-3 py-2 text-right">Accum. depr.</th>
                  <th className="px-3 py-2 text-right">Book value</th>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.data?.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-[12px]">{a.asset_number}</td>
                    <td className="px-3 py-2">{a.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.acquisition_date}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      ${Number(a.acquisition_cost).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      ${Number(a.accumulated_depreciation).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">
                      ${Number(a.book_value).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{a.depreciation_method}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">{a.status}</Badge>
                    </td>
                  </tr>
                ))}
                {!assets.isLoading && (assets.data?.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-muted-foreground" colSpan={8}>
                      No fixed assets recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </PageBody>
    </AppShell>
  );
}
