import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOrgId } from "@/hooks/use-current-org";
import { listVendors, upsertVendor, getVendorBalances } from "@/lib/accounting/vendors.functions";
import { listAccountTree } from "@/lib/accounting/accounts.functions";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts-payable/vendors")({
  head: () => ({
    meta: [
      { title: "Vendors — LedgerOS" },
      { name: "description", content: "Vendor master with open payable balances." },
      { property: "og:title", content: "Vendors — LedgerOS" },
      { property: "og:description", content: "Manage vendors, terms, and payable balances." },
    ],
  }),
  component: VendorsPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function VendorsPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const listFn = useServerFn(listVendors);
  const balFn = useServerFn(getVendorBalances);
  const upsertFn = useServerFn(upsertVendor);
  const accountsFn = useServerFn(listAccountTree);

  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<{
    id?: string; name: string; email: string; phone: string; termsDays: number;
    defaultExpenseAccountId: string | null; memo: string; status: "active" | "inactive";
  } | null>(null);

  const vendorsQ = useQuery({
    queryKey: ["ap.vendors", orgId, search],
    queryFn: () => listFn({ data: { orgId: orgId!, search: search || undefined } }),
    enabled: !!orgId,
  });
  const balancesQ = useQuery({
    queryKey: ["ap.vendorBalances", orgId],
    queryFn: () => balFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });
  const accountsQ = useQuery({
    queryKey: ["accounts.tree", orgId],
    queryFn: () => accountsFn({ data: { orgId: orgId! } }),
    enabled: !!orgId && editOpen,
  });

  const balanceMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of balancesQ.data ?? []) m.set(b.vendorId, b.balance);
    return m;
  }, [balancesQ.data]);

  const expenseAccounts = useMemo(
    () => (accountsQ.data ?? []).filter((a) => a.type === "expense" && a.is_active),
    [accountsQ.data],
  );

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      await upsertFn({
        data: {
          id: editing.id,
          orgId: orgId!,
          name: editing.name,
          email: editing.email,
          phone: editing.phone,
          termsDays: editing.termsDays,
          defaultExpenseAccountId: editing.defaultExpenseAccountId,
          memo: editing.memo,
          status: editing.status,
        },
      });
    },
    onSuccess: () => {
      toast.success("Vendor saved");
      setEditOpen(false);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["ap.vendors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startNew = () => {
    setEditing({
      name: "", email: "", phone: "", termsDays: 30,
      defaultExpenseAccountId: null, memo: "", status: "active",
    });
    setEditOpen(true);
  };

  const totalOpen = Array.from(balanceMap.values()).reduce((a, b) => a + b, 0);

  return (
    <AppShell>
      <PageHeader
        title="Vendors"
        description="Payable counterparties with open balances from posted bills."
        actions={
          <Button onClick={startNew}>
            <Plus className="mr-1 size-4" /> New vendor
          </Button>
        }
      />
      <PageBody>
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Total open payable</div>
            <div className="text-2xl font-semibold tabular-nums">{fmt(totalOpen)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Vendors</div>
            <div className="text-2xl font-semibold tabular-nums">{vendorsQ.data?.length ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">With open balance</div>
            <div className="text-2xl font-semibold tabular-nums">{balanceMap.size}</div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Terms</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Open balance</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {(vendorsQ.data ?? []).map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 pr-3 font-medium">{v.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{v.email ?? "—"}</td>
                    <td className="py-2 pr-3">Net {v.terms_days}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={v.status === "active" ? "default" : "secondary"}>
                        {v.status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {fmt(balanceMap.get(v.id) ?? 0)}
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing({
                            id: v.id, name: v.name, email: v.email ?? "",
                            phone: v.phone ?? "", termsDays: v.terms_days,
                            defaultExpenseAccountId: v.default_expense_account_id,
                            memo: v.memo ?? "",
                            status: (v.status as "active" | "inactive") ?? "active",
                          });
                          setEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {vendorsQ.data && vendorsQ.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No vendors yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing?.id ? "Edit vendor" : "New vendor"}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="grid gap-3">
                <div>
                  <Label>Name</Label>
                  <Input value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Email</Label>
                    <Input value={editing.email}
                      onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={editing.phone}
                      onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Terms (days)</Label>
                    <Input type="number" value={editing.termsDays}
                      onChange={(e) => setEditing({ ...editing, termsDays: Number(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={editing.status}
                      onValueChange={(v) => setEditing({ ...editing, status: v as "active" | "inactive" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Default expense account</Label>
                  <Select
                    value={editing.defaultExpenseAccountId ?? ""}
                    onValueChange={(v) =>
                      setEditing({ ...editing, defaultExpenseAccountId: v || null })
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
                    <SelectContent>
                      {expenseAccounts.map((a) => (
                        <SelectItem key={a.account_id} value={a.account_id}>
                          {a.code} · {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Memo</Label>
                  <Input value={editing.memo}
                    onChange={(e) => setEditing({ ...editing, memo: e.target.value })} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button
                disabled={!editing?.name || saveMut.isPending}
                onClick={() => saveMut.mutate()}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageBody>
    </AppShell>
  );
}
