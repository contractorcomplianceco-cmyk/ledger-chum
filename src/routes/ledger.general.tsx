import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOrgId } from "@/hooks/use-current-org";
import { listLedgerLines } from "@/lib/accounting/general-ledger.functions";
import { listAccountTree } from "@/lib/accounting/accounts.functions";
import { Download, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  accountId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sourceType: z.string().optional(),
  status: z.enum(["draft", "posted", "void"]).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/ledger/general")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "General Ledger — LedgerOS" },
      { name: "description", content: "Every posted journal line, filterable by account, date, source, and status." },
      { property: "og:title", content: "General Ledger — LedgerOS" },
      { property: "og:description", content: "Line-level detail across all posted transactions in your ledger." },
    ],
  }),
  component: GeneralLedgerPage,
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "invoice", label: "Invoice" },
  { value: "payment", label: "Payment" },
  { value: "refund", label: "Refund" },
  { value: "inventory_consumption", label: "Inventory" },
  { value: "manual", label: "Manual" },
  { value: "reversal", label: "Reversal" },
];

type Row = {
  id: string;
  debit: number;
  credit: number;
  memo: string | null;
  account: { id: string; code: string; name: string; type: string; normal_balance: string };
  journal: {
    id: string; entry_date: string; memo: string | null; description: string | null;
    source_type: string | null; source_id: string | null; status: string;
    posted_at: string | null; reversal_of: string | null; reversed_by: string | null;
  };
};

function GeneralLedgerPage() {
  const orgId = useOrgId();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const listFn = useServerFn(listLedgerLines);
  const accountsFn = useServerFn(listAccountTree);
  const [localSearch, setLocalSearch] = useState(search.q ?? "");

  const accountsQ = useQuery({
    queryKey: ["accounts", orgId],
    queryFn: () => accountsFn({ data: { orgId: orgId! } }),
    enabled: !!orgId, retry: false,
  });

  const linesQ = useQuery({
    queryKey: ["gl", orgId, search],
    queryFn: () =>
      listFn({
        data: {
          orgId: orgId!,
          accountId: search.accountId,
          from: search.from,
          to: search.to,
          sourceType: search.sourceType,
          status: search.status,
          search: search.q,
          limit: 500,
        },
      }),
    enabled: !!orgId, retry: false,
  });

  const rows: Row[] = useMemo(
    () => (linesQ.data as unknown as Row[]) ?? [],
    [linesQ.data],
  );

  const totals = useMemo(() => {
    const d = rows.reduce((s, r) => s + Number(r.debit ?? 0), 0);
    const c = rows.reduce((s, r) => s + Number(r.credit ?? 0), 0);
    return { debit: d, credit: c, net: d - c };
  }, [rows]);

  // Running balance grouped by account (chronological asc)
  const withRunning = useMemo(() => {
    if (!search.accountId) return rows.map((r) => ({ ...r, running: null as number | null }));
    const asc = [...rows].reverse();
    let running = 0;
    const normal = asc[0]?.account.normal_balance ?? "debit";
    const withBal = asc.map((r) => {
      running += normal === "debit"
        ? Number(r.debit) - Number(r.credit)
        : Number(r.credit) - Number(r.debit);
      return { ...r, running };
    });
    return withBal.reverse();
  }, [rows, search.accountId]);

  const exportCsv = () => {
    const header = ["Date", "Journal", "Account Code", "Account", "Debit", "Credit", "Memo", "Source"];
    const csv = [header.join(",")]
      .concat(
        rows.map((r) =>
          [
            r.journal.entry_date,
            r.journal.memo ?? "",
            r.account.code,
            r.account.name,
            r.debit,
            r.credit,
            (r.memo ?? "").replace(/,/g, ";"),
            r.journal.source_type ?? "",
          ].join(","),
        ),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `general-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const accounts = (accountsQ.data ?? []) as Array<{
    account_id: string; code: string; name: string; type: string;
  }>;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Ledger"
        title="General Ledger"
        description="Every posted journal line across your ledger. Filter, drill down, export."
        actions={
          <Button variant="outline" onClick={exportCsv} className="gap-2" disabled={rows.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <PageBody>
        {!orgId && (
          <Card className="border-dashed p-6 text-sm text-muted-foreground">
            Sign in to view the general ledger.
          </Card>
        )}
        {orgId && (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Filter className="h-3.5 w-3.5" /> Filters
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                <div className="md:col-span-2">
                  <Label className="text-[11px]">Account</Label>
                  <Select
                    value={search.accountId ?? "all"}
                    onValueChange={(v) => navigate({ to: ".", search: (prev: typeof search) => ({ ...prev, accountId: v === "all" ? undefined : v }) })}
                  >
                    <SelectTrigger><SelectValue placeholder="All accounts" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All accounts</SelectItem>
                      {accounts.map((a) => (
                        <SelectItem key={a.account_id} value={a.account_id}>
                          {a.code} — {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px]">From</Label>
                  <Input
                    type="date"
                    value={search.from ?? ""}
                    onChange={(e) => navigate({ to: ".", search: (prev: typeof search) => ({ ...prev, from: e.target.value || undefined }) })}
                  />
                </div>
                <div>
                  <Label className="text-[11px]">To</Label>
                  <Input
                    type="date"
                    value={search.to ?? ""}
                    onChange={(e) => navigate({ to: ".", search: (prev: typeof search) => ({ ...prev, to: e.target.value || undefined }) })}
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Source</Label>
                  <Select
                    value={search.sourceType ?? "all"}
                    onValueChange={(v) => navigate({ to: ".", search: (prev: typeof search) => ({ ...prev, sourceType: v === "all" ? undefined : v }) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px]">Status</Label>
                  <Select
                    value={search.status ?? "posted"}
                    onValueChange={(v) => navigate({ to: ".", search: (prev: typeof search) => ({ ...prev, status: v as "draft" | "posted" | "void" }) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="posted">Posted</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="void">Void</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Input
                  placeholder="Search memo…"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate({ to: ".", search: (prev: typeof search) => ({ ...prev, q: localSearch || undefined }) });
                  }}
                  className="max-w-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocalSearch("");
                    navigate({ search: {} });
                  }}
                >
                  <RotateCcw className="mr-1 h-3 w-3" /> Reset
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Total debits
                </div>
                <div className="mt-1 font-mono text-xl tabular-nums">{fmt(totals.debit)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Total credits
                </div>
                <div className="mt-1 font-mono text-xl tabular-nums">{fmt(totals.credit)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Net movement
                </div>
                <div
                  className={cn(
                    "mt-1 font-mono text-xl tabular-nums",
                    Math.abs(totals.net) < 0.005 ? "text-emerald-500" : "text-amber-500",
                  )}
                >
                  {fmt(totals.net)}
                </div>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Journal</th>
                    <th className="px-4 py-2 font-medium">Account</th>
                    <th className="px-4 py-2 font-medium">Memo</th>
                    <th className="px-4 py-2 text-right font-medium">Debit</th>
                    <th className="px-4 py-2 text-right font-medium">Credit</th>
                    {search.accountId && <th className="px-4 py-2 text-right font-medium">Running</th>}
                    <th className="px-4 py-2 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {withRunning.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2 font-mono text-xs">{r.journal.entry_date}</td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{r.journal.memo}</div>
                        {r.journal.reversal_of && (
                          <Badge variant="outline" className="mt-0.5 h-4 text-[9px]">Reversal</Badge>
                        )}
                        {r.journal.reversed_by && (
                          <Badge variant="outline" className="mt-0.5 h-4 text-[9px] text-amber-500">Reversed</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-mono text-xs">{r.account.code}</span> {r.account.name}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{r.memo}</td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">
                        {Number(r.debit) ? fmt(Number(r.debit)) : ""}
                      </td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">
                        {Number(r.credit) ? fmt(Number(r.credit)) : ""}
                      </td>
                      {search.accountId && (
                        <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums">
                          {r.running !== null ? fmt(r.running) : ""}
                        </td>
                      )}
                      <td className="px-4 py-2 text-xs uppercase text-muted-foreground">
                        {r.journal.source_type}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && !linesQ.isLoading && (
                    <tr>
                      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={search.accountId ? 8 : 7}>
                        No lines match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </PageBody>
    </AppShell>
  );
}
