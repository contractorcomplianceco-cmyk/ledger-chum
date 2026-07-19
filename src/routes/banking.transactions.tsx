import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DemoNotice } from "@/components/banking/demo-notice";
import { TransactionFilterBar, type SavedView } from "@/components/banking/transaction-filter-bar";
import { TransactionTable } from "@/components/banking/transaction-table";
import { TransactionDetailPanel } from "@/components/banking/transaction-detail-panel";
import { CategoryPicker } from "@/components/banking/category-picker";
import { MatchPicker } from "@/components/banking/match-picker";
import { SplitTransactionModal } from "@/components/banking/split-transaction-modal";
import { TRANSACTIONS, type Tx } from "@/lib/mock/banking";
import { useIsMobile } from "@/hooks/use-mobile";
import { isProductionMode } from "@/lib/app-mode";
import { ProductionUnavailable } from "@/components/production-unavailable";
import { Download, Wand2 } from "lucide-react";

export const Route = createFileRoute("/banking/transactions")({
  head: () => ({
    meta: [
      { title: "Transaction Review — LedgerOS UI Design Lab" },
      {
        name: "description",
        content:
          "Review, categorize, match, split, and approve imported bank transactions in a workspace built for daily accounting.",
      },
      { property: "og:title", content: "Transaction Review — LedgerOS" },
      {
        property: "og:description",
        content: "Split-screen transaction review with match candidates and audit history.",
      },
    ],
  }),
  component: TransactionReview,
});

function TransactionReview() {
  if (isProductionMode()) {
    return (
      <ProductionUnavailable
        title="Transaction Review"
        description="This is the design-lab transaction review preview. Live bank transactions live under Ledger."
        to="/ledger/banking"
        toLabel="Go to live banking"
      />
    );
  }
  return <TransactionReviewWorkspace />;
}

function TransactionReviewWorkspace() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<SavedView>("all");
  const [account, setAccount] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | undefined>(TRANSACTIONS[0]?.id);
  const [bulk, setBulk] = useState<Set<string>>(new Set());
  const [catOpen, setCatOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((tx) => {
      if (account !== "all" && tx.accountId !== account) return false;
      if (status !== "all" && tx.status !== status) return false;
      if (
        search &&
        !`${tx.merchant} ${tx.bankDescription} ${tx.bankRef}`.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      switch (view) {
        case "needs_review":
          return tx.status === "pending_review";
        case "unmatched":
          return !tx.suggestedMatch && tx.status !== "matched" && tx.status !== "reconciled" && tx.status !== "transfer";
        case "missing_receipt":
          return tx.receipt === "missing";
        case "large":
          return Math.abs(tx.amount) >= 50_000;
        case "duplicates":
          return !!tx.possibleDuplicateOf;
        case "transfers":
          return tx.kind === "transfer";
        case "ready_reconcile":
          return tx.status === "categorized" || tx.status === "matched";
        case "flagged":
          return tx.status === "flagged";
        default:
          return true;
      }
    });
  }, [search, view, account, status]);

  const selected: Tx | undefined = filtered.find((t) => t.id === selectedId) ?? filtered[0];
  const activeFilters =
    (search ? 1 : 0) + (view !== "all" ? 1 : 0) + (account !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setView("all");
    setAccount("all");
    setStatus("all");
  };

  const onSelect = (id: string) => {
    setSelectedId(id);
    if (isMobile) setMobileDetailOpen(true);
  };

  const detailPanel = (
    <TransactionDetailPanel
      tx={selected}
      onCategorize={() => setCatOpen(true)}
      onMatch={() => setMatchOpen(true)}
      onSplit={() => setSplitOpen(true)}
    />
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Banking"
        title="Transaction review"
        description="Review, categorize, match, split, and approve imported bank activity"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm" className="h-9" disabled={bulk.size === 0}>
              <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Bulk actions {bulk.size > 0 && `(${bulk.size})`}
            </Button>
          </>
        }
      />

      <PageBody>
        <DemoNotice />

        <TransactionFilterBar
          search={search}
          onSearch={setSearch}
          view={view}
          onView={setView}
          accountId={account}
          onAccount={setAccount}
          status={status}
          onStatus={setStatus}
          onClear={clearFilters}
          activeCount={activeFilters}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <TransactionTable
              transactions={filtered}
              selectedId={selected?.id}
              onSelect={onSelect}
              bulkSelection={bulk}
              onBulkToggle={(id) => {
                setBulk((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              }}
            />
          </div>
          <aside className="hidden min-w-0 lg:block">{detailPanel}</aside>
        </div>

        {/* Mobile / tablet detail sheet */}
        <Sheet open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
          <SheetContent side="right" className="w-full p-0 sm:max-w-lg lg:hidden">
            <div className="h-full p-0">{detailPanel}</div>
          </SheetContent>
        </Sheet>

        <CategoryPicker open={catOpen} onOpenChange={setCatOpen} />
        <MatchPicker open={matchOpen} onOpenChange={setMatchOpen} />
        <SplitTransactionModal
          open={splitOpen}
          onOpenChange={setSplitOpen}
          originalAmount={Math.abs(selected?.amount ?? 0)}
        />
      </PageBody>
    </AppShell>
  );
}
