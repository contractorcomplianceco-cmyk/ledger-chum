import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useOrgId } from "@/hooks/use-current-org";
import { listAccounts } from "@/lib/accounting/workspace.functions";
import {
  listAccountMappings, upsertAccountMapping,
} from "@/lib/accounting/account-mappings.functions";
import { DEMO_MAPPINGS, fmtRelative } from "@/lib/mock/accountant-workspace";
import { CheckCircle2, AlertTriangle, Circle, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/account-mappings")({
  head: () => ({
    meta: [
      { title: "Account Mappings — LedgerOS" },
      {
        name: "description",
        content:
          "Route ServiceConnect events to the right ledger accounts — AR, Cash, Labor Revenue, Material Revenue, Inventory, COGS, Refund clearing, Credit liability.",
      },
      { property: "og:title", content: "Account Mappings — LedgerOS" },
    ],
  }),
  component: AccountMappingsPage,
});

type Purpose =
  | "ar"
  | "cash_default"
  | "labor_revenue"
  | "material_revenue"
  | "inventory_asset"
  | "material_cogs"
  | "refund_clearing"
  | "credit_liability";

const PURPOSES: Array<{ id: Purpose; label: string; source: string }> = [
  { id: "ar", label: "Accounts Receivable", source: "invoice.created" },
  { id: "cash_default", label: "Cash (default)", source: "payment.received" },
  { id: "labor_revenue", label: "Labor Revenue", source: "work_order labor lines" },
  { id: "material_revenue", label: "Material Revenue", source: "work_order material lines" },
  { id: "inventory_asset", label: "Inventory Asset", source: "inventory.consumed" },
  { id: "material_cogs", label: "Material COGS", source: "inventory.consumed" },
  { id: "refund_clearing", label: "Refund Clearing", source: "refund.created" },
  { id: "credit_liability", label: "Customer Credit Liability", source: "credit.issued" },
];

function AccountMappingsPage() {
  const orgId = useOrgId();
  const live = !!orgId;
  const qc = useQueryClient();
  const listFn = useServerFn(listAccountMappings);
  const accountsFn = useServerFn(listAccounts);
  const upsertFn = useServerFn(upsertAccountMapping);

  const mappingsQ = useQuery({
    queryKey: ["account-mappings", orgId],
    queryFn: () => listFn({ data: { orgId: orgId! } }),
    enabled: live, retry: false,
  });
  const accountsQ = useQuery({
    queryKey: ["accounts", orgId],
    queryFn: () => accountsFn({ data: { orgId: orgId! } }),
    enabled: live, retry: false,
  });

  const [editing, setEditing] = useState<Purpose | null>(null);
  const [pendingAccount, setPendingAccount] = useState<string>("");

  const mappingByPurpose = new Map(
    (mappingsQ.data ?? []).map((m) => [m.purpose as Purpose, m]),
  );
  const accountByIdMap = new Map(
    (accountsQ.data ?? []).map((a) => [a.id, `${a.code} · ${a.name}`]),
  );

  const rows = live
    ? PURPOSES.map((p) => {
        const m = mappingByPurpose.get(p.id);
        return {
          purpose: p.id,
          label: p.label,
          source: p.source,
          accountId: m?.account_id ?? null,
          accountLabel: m ? accountByIdMap.get(m.account_id) ?? "—" : null,
          updatedAt: m?.updated_at,
          status: (m ? "mapped" : "unmapped") as "mapped" | "review" | "unmapped",
        };
      })
    : DEMO_MAPPINGS.map((m) => ({
        purpose: m.purpose as Purpose,
        label: m.label,
        source: m.serviceConnectSource,
        accountId: null as string | null,
        accountLabel: m.status === "unmapped" ? null : m.ledgerAccount,
        updatedAt: m.updatedAt,
        status: m.status,
      }));

  const mapped = rows.filter((r) => r.status === "mapped").length;
  const unmapped = rows.filter((r) => r.status === "unmapped").length;

  const saveMapping = async (purpose: Purpose) => {
    if (!orgId || !pendingAccount) return;
    try {
      await upsertFn({ data: { orgId, purpose, accountId: pendingAccount } });
      toast.success(`Mapping saved for ${purpose}`);
      setEditing(null);
      setPendingAccount("");
      qc.invalidateQueries({ queryKey: ["account-mappings"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save mapping");
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={`LedgerOS · Phase 4 · ${live ? "Live" : "Demo"}`}
        title="Account Mappings"
        description="ServiceConnect events resolve their ledger account through this table. Unmapped purposes fall back to a heuristic but should be pinned explicitly for production."
      />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-3">
          <Tile label="Mapped" value={mapped.toString()} tone="ok" />
          <Tile label="Purposes" value={rows.length.toString()} tone="muted" />
          <Tile label="Unmapped" value={unmapped.toString()} tone={unmapped > 0 ? "warn" : "muted"} />
        </div>

        <Card className="overflow-hidden border-border/70 bg-surface shadow-card">
          <div className="grid grid-cols-[220px_1fr_1fr_120px_130px_100px] gap-3 border-b border-border/60 bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Purpose</div>
            <div>ServiceConnect source</div>
            <div>Ledger account</div>
            <div>Status</div>
            <div>Last updated</div>
            <div className="text-right">Action</div>
          </div>
          <div className="divide-y divide-border/60">
            {rows.map((m) => {
              const isEditing = editing === m.purpose;
              return (
                <div
                  key={m.purpose}
                  className="grid grid-cols-[220px_1fr_1fr_120px_130px_100px] items-center gap-3 px-4 py-3 text-[13px]"
                >
                  <div>
                    <div className="font-semibold text-foreground">{m.label}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{m.purpose}</div>
                  </div>
                  <div className="truncate text-muted-foreground">{m.source}</div>
                  <div className="truncate">
                    {isEditing && live ? (
                      <Select value={pendingAccount} onValueChange={setPendingAccount}>
                        <SelectTrigger className="h-8 text-[12px]">
                          <SelectValue placeholder="Select account…" />
                        </SelectTrigger>
                        <SelectContent>
                          {(accountsQ.data ?? []).map((a) => (
                            <SelectItem key={a.id} value={a.id} className="text-[12px]">
                              {a.code} · {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : m.accountLabel ? (
                      <span className="text-foreground">{m.accountLabel}</span>
                    ) : (
                      <span className="italic text-muted-foreground">Not mapped</span>
                    )}
                  </div>
                  <div><MappingStatus status={m.status} /></div>
                  <div className="text-[12px] text-muted-foreground">
                    {m.updatedAt ? fmtRelative(m.updatedAt) : "—"}
                  </div>
                  <div className="text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[12px]"
                          onClick={() => { setEditing(null); setPendingAccount(""); }}>
                          Cancel
                        </Button>
                        <Button size="sm" className="h-7 px-2 text-[12px]"
                          disabled={!pendingAccount}
                          onClick={() => saveMapping(m.purpose)}>
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm" variant="ghost" className="h-7 px-2 text-[12px]"
                        disabled={!live}
                        onClick={() => {
                          setEditing(m.purpose);
                          setPendingAccount(m.accountId ?? "");
                        }}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            How mappings resolve
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] text-muted-foreground">
            <li>Exact match in <code className="font-mono text-foreground">account_mappings</code> for the org and purpose.</li>
            <li>Fallback via <code className="font-mono text-foreground">resolve_account</code> RPC (heuristic by account type + name pattern).</li>
            <li>If no match, the integration event is rejected and surfaces in the integration inbox.</li>
          </ol>
          <div className="mt-2 text-[12px] text-muted-foreground">
            Every mapping change writes an <code className="font-mono">account_mapping.upserted</code> audit event.
          </div>
        </Card>
      </PageBody>
    </AppShell>
  );
}

function MappingStatus({ status }: { status: "mapped" | "review" | "unmapped" }) {
  const map = {
    mapped: { cls: "bg-success/10 text-success ring-success/20", Icon: CheckCircle2, label: "Mapped" },
    review: { cls: "bg-warning/15 text-warning ring-warning/25", Icon: AlertTriangle, label: "Review" },
    unmapped: { cls: "bg-muted text-muted-foreground ring-border", Icon: Circle, label: "Unmapped" },
  } as const;
  const m = map[status];
  return (
    <Badge variant="outline" className={cn(
      "inline-flex h-5 items-center gap-1 border-transparent text-[10px] font-semibold ring-1 ring-inset",
      m.cls,
    )}>
      <m.Icon className="h-3 w-3" /> {m.label}
    </Badge>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "muted" }) {
  const cls = tone === "ok" ? "text-success" : tone === "warn" ? "text-warning" : "text-muted-foreground";
  return (
    <Card className="border-border/70 bg-surface p-4 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-tabular text-[26px] font-bold", cls)}>{value}</div>
    </Card>
  );
}
