import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listAccountTree, createAccount, updateAccount,
} from "@/lib/accounting/accounts.functions";
import { ChevronRight, Plus, Search, Lock, Circle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/ledger/accounts")({
  head: () => ({
    meta: [
      { title: "Chart of Accounts — LedgerOS" },
      { name: "description", content: "Manage the chart of accounts, hierarchy, and running balances for your ledger." },
      { property: "og:title", content: "Chart of Accounts — LedgerOS" },
      { property: "og:description", content: "Full hierarchy of assets, liabilities, equity, revenue, and expense accounts with live balances." },
    ],
  }),
  component: ChartOfAccountsPage,
});

type AccountRow = {
  account_id: string;
  code: string;
  name: string;
  type: string;
  normal_balance: string;
  parent_id: string | null;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
  debit_total: number;
  credit_total: number;
  balance: number;
};

const TYPE_ORDER = ["asset", "liability", "equity", "revenue", "expense"] as const;
const TYPE_LABEL: Record<string, string> = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  revenue: "Revenue",
  expense: "Expenses",
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function ChartOfAccountsPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const listFn = useServerFn(listAccountTree);
  const createFn = useServerFn(createAccount);
  const updateFn = useServerFn(updateAccount);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AccountRow | null>(null);

  const accountsQ = useQuery({
    queryKey: ["accounts", orgId],
    queryFn: () => listFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
    retry: false,
  });

  const rows: AccountRow[] = useMemo(
    () => (accountsQ.data ?? []) as AccountRow[],
    [accountsQ.data],
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) => r.code.toLowerCase().includes(s) || r.name.toLowerCase().includes(s),
    );
  }, [rows, search]);

  const grouped = useMemo(() => {
    const g = new Map<string, AccountRow[]>();
    for (const type of TYPE_ORDER) g.set(type, []);
    for (const r of filtered) {
      if (!g.has(r.type)) g.set(r.type, []);
      g.get(r.type)!.push(r);
    }
    return g;
  }, [filtered]);

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const [type, list] of grouped) {
      t[type] = list.reduce((s, r) => s + Number(r.balance ?? 0), 0);
    }
    return t;
  }, [grouped]);

  const createMut = useMutation({
    mutationFn: (input: {
      orgId: string; code: string; name: string;
      type: "asset" | "liability" | "equity" | "revenue" | "expense";
      normalBalance: "debit" | "credit"; sortOrder: number;
    }) => createFn({ data: input }),
    onSuccess: () => {
      toast.success("Account created");
      qc.invalidateQueries({ queryKey: ["accounts", orgId] });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: (input: {
      id: string; name?: string; code?: string; sortOrder?: number; isActive?: boolean;
    }) => updateFn({ data: input }),
    onSuccess: () => {
      toast.success("Account updated");
      qc.invalidateQueries({ queryKey: ["accounts", orgId] });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Ledger"
        title="Chart of Accounts"
        description="The backbone of your ledger. Balances update automatically as journal entries are posted."
        actions={
          <>
            {orgId && (
              <Button
                onClick={() => { setEditing(null); setDialogOpen(true); }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> New account
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        {!orgId && (
          <Card className="border-dashed p-6 text-sm text-muted-foreground">
            Sign in to view your organization's chart of accounts.
          </Card>
        )}

        {orgId && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by code or name"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                {rows.length} account{rows.length === 1 ? "" : "s"}
              </div>
            </div>

            {accountsQ.isLoading && (
              <Card className="p-8 text-center text-sm text-muted-foreground">Loading…</Card>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {TYPE_ORDER.map((t) => (
                <Card key={t} className="p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {TYPE_LABEL[t]}
                  </div>
                  <div className="mt-1 font-mono text-lg tabular-nums">
                    {fmt(totals[t] ?? 0)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {(grouped.get(t) ?? []).length} accounts
                  </div>
                </Card>
              ))}
            </div>

            {TYPE_ORDER.map((type) => {
              const list = grouped.get(type) ?? [];
              if (list.length === 0) return null;
              return (
                <Card key={type} className="overflow-hidden">
                  <div className="flex items-center justify-between border-b px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <div className="font-semibold">{TYPE_LABEL[type]}</div>
                      <Badge variant="outline" className="ml-1">{list.length}</Badge>
                    </div>
                    <div className="font-mono text-sm font-semibold tabular-nums">
                      {fmt(totals[type] ?? 0)}
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 font-medium">Code</th>
                        <th className="px-4 py-2 font-medium">Name</th>
                        <th className="px-4 py-2 font-medium">Normal</th>
                        <th className="px-4 py-2 text-right font-medium">Debits</th>
                        <th className="px-4 py-2 text-right font-medium">Credits</th>
                        <th className="px-4 py-2 text-right font-medium">Balance</th>
                        <th className="px-4 py-2 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((r) => (
                        <tr
                          key={r.account_id}
                          className={cn(
                            "border-b last:border-0 hover:bg-muted/30",
                            !r.is_active && "opacity-50",
                          )}
                        >
                          <td className="px-4 py-2 font-mono text-xs">{r.code}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="text-left font-medium hover:underline"
                                onClick={() => {
                                  setEditing(r);
                                  setDialogOpen(true);
                                }}
                              >
                                {r.name}
                              </button>
                              {r.is_system && (
                                <span title="System account">
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-xs uppercase text-muted-foreground">
                            {r.normal_balance}
                          </td>
                          <td className="px-4 py-2 text-right font-mono tabular-nums">
                            {fmt(Number(r.debit_total ?? 0))}
                          </td>
                          <td className="px-4 py-2 text-right font-mono tabular-nums">
                            {fmt(Number(r.credit_total ?? 0))}
                          </td>
                          <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums">
                            {fmt(Number(r.balance ?? 0))}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Link
                              to="/ledger/general"
                              search={{ accountId: r.account_id } as never}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              GL <ChevronRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              );
            })}
          </>
        )}
      </PageBody>

      <AccountDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editing={editing}
        onSubmit={(values) => {
          if (editing) {
            updateMut.mutate({
              id: editing.account_id,
              name: values.name,
              code: values.code,
              sortOrder: values.sortOrder,
              isActive: values.isActive,
            });
          } else if (orgId) {
            createMut.mutate({
              orgId,
              code: values.code,
              name: values.name,
              type: values.type,
              normalBalance: values.normalBalance,
              sortOrder: values.sortOrder,
            });
          }
        }}
        busy={createMut.isPending || updateMut.isPending}
      />
    </AppShell>
  );
}

function AccountDialog({
  open, onOpenChange, editing, onSubmit, busy,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: AccountRow | null;
  onSubmit: (v: {
    code: string; name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    normalBalance: "debit" | "credit";
    sortOrder: number; isActive: boolean;
  }) => void;
  busy: boolean;
}) {
  const [code, setCode] = useState(editing?.code ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [type, setType] = useState<AccountRow["type"]>(editing?.type ?? "asset");
  const [normalBalance, setNormalBalance] = useState<string>(editing?.normal_balance ?? "debit");
  const [sortOrder, setSortOrder] = useState(editing?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(editing?.is_active ?? true);

  // Reset form fields whenever the dialog opens or the edit target changes
  useEffect(() => {
    if (!open) return;
    setCode(editing?.code ?? "");
    setName(editing?.name ?? "");
    setType(editing?.type ?? "asset");
    setNormalBalance(editing?.normal_balance ?? "debit");
    setSortOrder(editing?.sort_order ?? 0);
    setIsActive(editing?.is_active ?? true);
  }, [editing, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit account" : "New account"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="1000" />
          </div>
          <div className="col-span-1">
            <Label>Sort order</Label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
          <div className="col-span-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Accounts Receivable" />
          </div>
          <div className="col-span-1">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v);
                setNormalBalance(v === "asset" || v === "expense" ? "debit" : "credit");
              }}
              disabled={!!editing}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPE_ORDER.map((t) => (
                  <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Label>Normal balance</Label>
            <Select value={normalBalance} onValueChange={setNormalBalance} disabled={!!editing}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {editing && (
            <div className="col-span-2 flex items-center gap-2">
              <Circle
                className={cn(
                  "h-3 w-3 cursor-pointer",
                  isActive ? "fill-emerald-500 text-emerald-500" : "text-muted-foreground",
                )}
                onClick={() => setIsActive(!isActive)}
              />
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {isActive ? "Active" : "Inactive"}
              </button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={busy || !code || !name}
            onClick={() => onSubmit({
              code, name,
              type: type as "asset" | "liability" | "equity" | "revenue" | "expense",
              normalBalance: normalBalance as "debit" | "credit",
              sortOrder, isActive,
            })}
          >
            {editing ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
