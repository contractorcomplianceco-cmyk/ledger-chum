import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listLegalEntities,
  listIntercompanyTransactions,
  getIntercompanyBalances,
} from "@/lib/accounting/entities.functions";

export const Route = createFileRoute("/ledger/entities")({
  head: () => ({
    meta: [
      { title: "Legal Entities — LedgerOS" },
      { name: "description", content: "Multi-entity registry and intercompany transactions." },
      { property: "og:title", content: "Legal Entities — LedgerOS" },
    ],
  }),
  component: EntitiesPage,
});

function EntitiesPage() {
  const orgId = useOrgId();
  const le = useServerFn(listLegalEntities);
  const ic = useServerFn(listIntercompanyTransactions);
  const bal = useServerFn(getIntercompanyBalances);

  const entities = useQuery({ queryKey: ["legal-entities", orgId], queryFn: () => le({ data: { orgId: orgId! } }), enabled: !!orgId });
  const txns = useQuery({ queryKey: ["ic-txns", orgId], queryFn: () => ic({ data: { orgId: orgId!, status: "all" } }), enabled: !!orgId });
  const balances = useQuery({ queryKey: ["ic-balances", orgId], queryFn: () => bal({ data: { orgId: orgId! } }), enabled: !!orgId });

  const entityMap = new Map(entities.data?.map((e) => [e.id, e]) ?? []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Multi-Entity"
        title="Legal entities & intercompany"
        description="Multiple legal entities under one organization with intercompany transaction registry and due-to / due-from balances."
      />
      <PageBody>
        {!orgId ? (
          <Card className="p-6 text-sm text-muted-foreground">Sign in to view your entities.</Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden">
              <div className="border-b border-border p-3 text-sm font-semibold">Legal entities ({entities.data?.length ?? 0})</div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Code</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Currency</th><th className="px-3 py-2">Consolidated</th><th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.data?.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-[12px]">{e.code}</td>
                      <td className="px-3 py-2">{e.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{e.entity_type}</td>
                      <td className="px-3 py-2">{e.functional_currency}</td>
                      <td className="px-3 py-2">{e.is_consolidated ? "Yes" : "No"}</td>
                      <td className="px-3 py-2"><Badge variant={e.is_active ? "default" : "secondary"}>{e.is_active ? "Active" : "Inactive"}</Badge></td>
                    </tr>
                  ))}
                  {(entities.data?.length ?? 0) === 0 && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No legal entities configured.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>

            <Card className="p-4">
              <h2 className="mb-2 text-sm font-semibold">Due to / due from (posted, unsettled)</h2>
              <ul className="space-y-1 text-sm">
                {balances.data?.map((b, i) => {
                  const from = entityMap.get(b.from)?.code ?? b.from.slice(0, 8);
                  const to = entityMap.get(b.to)?.code ?? b.to.slice(0, 8);
                  return (
                    <li key={i} className="flex justify-between border-b border-border/50 py-1">
                      <span>{from} → {to}</span>
                      <span className="tabular-nums font-medium">${Number(b.net).toLocaleString()}</span>
                    </li>
                  );
                })}
                {(balances.data?.length ?? 0) === 0 && <li className="text-muted-foreground">No open intercompany balances.</li>}
              </ul>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="border-b border-border p-3 text-sm font-semibold">Intercompany transactions ({txns.data?.length ?? 0})</div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Date</th><th className="px-3 py-2">From</th><th className="px-3 py-2">To</th>
                    <th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2">Currency</th><th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.data?.map((t) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="px-3 py-2 text-muted-foreground">{t.txn_date}</td>
                      <td className="px-3 py-2">{entityMap.get(t.from_entity_id)?.code ?? t.from_entity_id.slice(0, 8)}</td>
                      <td className="px-3 py-2">{entityMap.get(t.to_entity_id)?.code ?? t.to_entity_id.slice(0, 8)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">${Number(t.amount).toLocaleString()}</td>
                      <td className="px-3 py-2">{t.currency}</td>
                      <td className="px-3 py-2"><Badge variant="secondary">{t.status}</Badge></td>
                    </tr>
                  ))}
                  {(txns.data?.length ?? 0) === 0 && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No intercompany transactions.</td></tr>
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
