import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEMO_MAPPINGS, fmtRelative } from "@/lib/mock/accountant-workspace";
import { CheckCircle2, AlertTriangle, Circle, Pencil } from "lucide-react";

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
      {
        property: "og:description",
        content:
          "Every integration event resolves an account through this mapping table. Unmapped purposes block posting.",
      },
    ],
  }),
  component: AccountMappingsPage,
});

function AccountMappingsPage() {
  const mapped = DEMO_MAPPINGS.filter((m) => m.status === "mapped").length;
  const review = DEMO_MAPPINGS.filter((m) => m.status === "review").length;
  const unmapped = DEMO_MAPPINGS.filter((m) => m.status === "unmapped").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 3"
        title="Account Mappings"
        description="ServiceConnect events resolve their ledger account through this table. Unmapped purposes fall back to a heuristic but should be pinned explicitly for production."
      />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-3">
          <Tile label="Mapped" value={mapped.toString()} tone="ok" />
          <Tile label="Needs review" value={review.toString()} tone={review > 0 ? "warn" : "muted"} />
          <Tile label="Unmapped" value={unmapped.toString()} tone={unmapped > 0 ? "warn" : "muted"} />
        </div>

        <Card className="overflow-hidden border-border/70 bg-surface shadow-card">
          <div className="grid grid-cols-[220px_1fr_1fr_120px_130px_80px] gap-3 border-b border-border/60 bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Purpose</div>
            <div>ServiceConnect source</div>
            <div>Ledger account</div>
            <div>Status</div>
            <div>Last updated</div>
            <div className="text-right">Action</div>
          </div>
          <div className="divide-y divide-border/60">
            {DEMO_MAPPINGS.map((m) => (
              <div
                key={m.purpose}
                className="grid grid-cols-[220px_1fr_1fr_120px_130px_80px] items-center gap-3 px-4 py-3 text-[13px]"
              >
                <div>
                  <div className="font-semibold text-foreground">{m.label}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">{m.purpose}</div>
                </div>
                <div className="truncate text-muted-foreground">{m.serviceConnectSource}</div>
                <div className="truncate">
                  {m.status === "unmapped" ? (
                    <span className="italic text-muted-foreground">Not mapped</span>
                  ) : (
                    <span className="text-foreground">{m.ledgerAccount}</span>
                  )}
                </div>
                <div><MappingStatus status={m.status} /></div>
                <div className="text-[12px] text-muted-foreground">{fmtRelative(m.updatedAt)}</div>
                <div className="text-right">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[12px]">
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            How mappings resolve
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] text-muted-foreground">
            <li>Exact match in <code className="font-mono text-foreground">account_mappings</code> for the org and purpose.</li>
            <li>Heuristic fallback by account type + name pattern (e.g. name ILIKE "%receivable%").</li>
            <li>If no match, the event is rejected and surfaced in the integration inbox.</li>
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
    <Badge
      variant="outline"
      className={cn(
        "inline-flex h-5 items-center gap-1 border-transparent text-[10px] font-semibold ring-1 ring-inset",
        m.cls,
      )}
    >
      <m.Icon className="h-3 w-3" />
      {m.label}
    </Badge>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "muted" }) {
  const cls =
    tone === "ok" ? "text-success" : tone === "warn" ? "text-warning" : "text-muted-foreground";
  return (
    <Card className="border-border/70 bg-surface p-4 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-tabular text-[26px] font-bold", cls)}>{value}</div>
    </Card>
  );
}
