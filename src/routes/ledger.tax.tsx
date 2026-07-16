import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listJurisdictions,
  listTaxCategories,
  listTaxRates,
  listTaxLiabilities,
} from "@/lib/accounting/tax.functions";

export const Route = createFileRoute("/ledger/tax")({
  head: () => ({
    meta: [
      { title: "Tax Framework — LedgerOS" },
      { name: "description", content: "Tax jurisdictions, categories, rates, and liabilities." },
      { property: "og:title", content: "Tax Framework — LedgerOS" },
    ],
  }),
  component: TaxPage,
});

function TaxPage() {
  const orgId = useOrgId();
  const j = useServerFn(listJurisdictions);
  const c = useServerFn(listTaxCategories);
  const r = useServerFn(listTaxRates);
  const l = useServerFn(listTaxLiabilities);

  const jurisdictions = useQuery({
    queryKey: ["tax-jurisdictions", orgId],
    queryFn: () => j({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const categories = useQuery({
    queryKey: ["tax-categories", orgId],
    queryFn: () => c({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const rates = useQuery({
    queryKey: ["tax-rates", orgId],
    queryFn: () => r({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const liabilities = useQuery({
    queryKey: ["tax-liabilities", orgId],
    queryFn: () => l({ data: { orgId: orgId!, status: "all" } }),
    enabled: !!orgId,
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Tax"
        title="Tax framework"
        description="Jurisdictions, categories, rates, and liability tracking. Framework only — no automatic calculation."
      />
      <PageBody>
        {!orgId ? (
          <Card className="p-6 text-sm text-muted-foreground">
            Sign in to view your tax framework.
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-4">
              <h2 className="mb-2 text-sm font-semibold">
                Jurisdictions ({jurisdictions.data?.length ?? 0})
              </h2>
              <ul className="space-y-1 text-sm">
                {jurisdictions.data?.map((x) => (
                  <li key={x.id} className="flex justify-between border-b border-border/50 py-1">
                    <span>
                      <span className="font-mono text-[12px]">{x.code}</span> — {x.name}
                    </span>
                    <Badge variant={x.is_active ? "default" : "secondary"}>
                      {x.country ?? "—"}
                    </Badge>
                  </li>
                ))}
                {(jurisdictions.data?.length ?? 0) === 0 && (
                  <li className="text-muted-foreground">None configured.</li>
                )}
              </ul>
            </Card>

            <Card className="p-4">
              <h2 className="mb-2 text-sm font-semibold">
                Categories ({categories.data?.length ?? 0})
              </h2>
              <ul className="space-y-1 text-sm">
                {categories.data?.map((x) => (
                  <li key={x.id} className="flex justify-between border-b border-border/50 py-1">
                    <span>
                      <span className="font-mono text-[12px]">{x.code}</span> — {x.name}
                    </span>
                    <Badge variant="secondary">{x.kind}</Badge>
                  </li>
                ))}
                {(categories.data?.length ?? 0) === 0 && (
                  <li className="text-muted-foreground">None configured.</li>
                )}
              </ul>
            </Card>

            <Card className="p-4 md:col-span-2">
              <h2 className="mb-2 text-sm font-semibold">Rates ({rates.data?.length ?? 0})</h2>
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="py-1">Jurisdiction</th>
                    <th>Category</th>
                    <th className="text-right">Rate</th>
                    <th>Effective</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.data?.map((x) => (
                    <tr key={x.id} className="border-t border-border/50">
                      <td className="py-1 font-mono text-[12px]">
                        {x.jurisdiction_id.slice(0, 8)}
                      </td>
                      <td className="font-mono text-[12px]">{x.category_id.slice(0, 8)}</td>
                      <td className="text-right tabular-nums">
                        {(Number(x.rate) * 100).toFixed(3)}%
                      </td>
                      <td className="text-muted-foreground">
                        {x.effective_from} → {x.effective_to ?? "…"}
                      </td>
                    </tr>
                  ))}
                  {(rates.data?.length ?? 0) === 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 text-muted-foreground">
                        No rates configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>

            <Card className="p-4 md:col-span-2">
              <h2 className="mb-2 text-sm font-semibold">
                Liabilities ({liabilities.data?.length ?? 0})
              </h2>
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="py-1">Period</th>
                    <th className="text-right">Taxable</th>
                    <th className="text-right">Tax</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liabilities.data?.map((x) => (
                    <tr key={x.id} className="border-t border-border/50">
                      <td className="py-1 text-muted-foreground">
                        {x.period_start} → {x.period_end}
                      </td>
                      <td className="text-right tabular-nums">
                        ${Number(x.taxable_amount).toLocaleString()}
                      </td>
                      <td className="text-right tabular-nums">
                        ${Number(x.tax_amount).toLocaleString()}
                      </td>
                      <td>
                        <Badge variant="secondary">{x.status}</Badge>
                      </td>
                    </tr>
                  ))}
                  {(liabilities.data?.length ?? 0) === 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 text-muted-foreground">
                        No liabilities recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </PageBody>
    </AppShell>
  );
}
