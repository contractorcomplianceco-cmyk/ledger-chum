import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listInventoryItems,
  listInventoryTransactions,
} from "@/lib/accounting/inventory.functions";

export const Route = createFileRoute("/ledger/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — LedgerOS" },
      { name: "description", content: "Inventory items, cost tracking, and consumption movements." },
      { property: "og:title", content: "Inventory — LedgerOS" },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const orgId = useOrgId();
  const [search, setSearch] = useState("");
  const listItems = useServerFn(listInventoryItems);
  const listTxns = useServerFn(listInventoryTransactions);

  const items = useQuery({
    queryKey: ["inventory-items", orgId, search],
    queryFn: () => listItems({ data: { orgId: orgId!, search: search || undefined, limit: 200 } }),
    enabled: !!orgId,
  });
  const txns = useQuery({
    queryKey: ["inventory-txns", orgId],
    queryFn: () => listTxns({ data: { orgId: orgId!, limit: 50 } }),
    enabled: !!orgId,
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Inventory"
        title="Inventory & cost accounting"
        description="Master items, on-hand quantity, average cost, and movement history. No auto-posting — journal entries flow through the accounting engine."
      />
      <PageBody>
        {!orgId ? (
          <Card className="p-6 text-sm text-muted-foreground">Sign in to view your inventory.</Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Input placeholder="Search SKU or name" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
              <Badge variant="secondary">{items.data?.length ?? 0} items</Badge>
            </div>

            <Card className="p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">UoM</th>
                    <th className="px-3 py-2 text-right">On hand</th>
                    <th className="px-3 py-2 text-right">Avg cost</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.data?.map((it) => (
                    <tr key={it.id} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-[12px]">{it.sku}</td>
                      <td className="px-3 py-2">{it.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{it.unit_of_measure}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{Number(it.quantity_on_hand).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right tabular-nums">${Number(it.current_avg_cost).toFixed(2)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{it.cost_method}</td>
                      <td className="px-3 py-2">
                        <Badge variant={it.is_active ? "default" : "secondary"}>{it.is_active ? "Active" : "Inactive"}</Badge>
                      </td>
                    </tr>
                  ))}
                  {!items.isLoading && (items.data?.length ?? 0) === 0 && (
                    <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={7}>No items yet.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>

            <div>
              <h2 className="mb-2 text-sm font-semibold">Recent movements</h2>
              <Card className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">When</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit cost</th>
                      <th className="px-3 py-2 text-right">Total cost</th>
                      <th className="px-3 py-2">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.data?.map((t) => (
                      <tr key={t.id} className="border-t border-border">
                        <td className="px-3 py-2 text-muted-foreground">{new Date(t.occurred_at).toLocaleString()}</td>
                        <td className="px-3 py-2"><Badge variant="secondary">{t.txn_type}</Badge></td>
                        <td className="px-3 py-2 text-right tabular-nums">{Number(t.quantity).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right tabular-nums">${Number(t.unit_cost).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">${Number(t.total_cost).toFixed(2)}</td>
                        <td className="px-3 py-2 text-muted-foreground text-[12px]">{t.reference_type ?? "—"}</td>
                      </tr>
                    ))}
                    {!txns.isLoading && (txns.data?.length ?? 0) === 0 && (
                      <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>No inventory movements yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        )}
      </PageBody>
    </AppShell>
  );
}
