import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";

export const Route = createFileRoute("/estimates/new")({
  head: () => ({
    meta: [{ title: "New estimate — LedgerOS" }],
  }),
  component: NewEstimatePage,
});

function NewEstimatePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Sales"
        title="New estimate"
        description="Draft a scope, price it, preview allocation, then send to the client for acceptance."
      />
      <PageBody>
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/estimates">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to estimates
            </Link>
          </Button>
          <Button size="sm">
            <Send className="mr-1.5 h-3.5 w-3.5" /> Send to client
          </Button>
        </div>
        <Card className="mt-4 border border-dashed border-border/70 bg-surface p-10 text-center shadow-card">
          <div className="text-[15px] font-semibold text-foreground">Estimate builder</div>
          <p className="mx-auto mt-2 max-w-md text-[13px] text-muted-foreground">
            The estimate builder reuses the invoice line editor and allocation preview. Use the
            invoice builder for now — accepted estimates auto-convert into pre-allocated invoices.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link to="/invoices/new">Open invoice builder</Link>
          </Button>
        </Card>
      </PageBody>
    </AppShell>
  );
}
