import { Link } from "@tanstack/react-router";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

/**
 * Rendered in production mode for routes whose only content is demo/mock or an
 * unbuilt placeholder. Keeps the shell/nav present and points the user at the
 * canonical live surface instead of silently showing sample data.
 */
export function ProductionUnavailable({
  title,
  description = "This is a demo-only design-lab surface. It is not part of the production product.",
  to,
  toLabel,
}: {
  title: string;
  description?: string;
  to?: string;
  toLabel?: string;
}) {
  return (
    <AppShell>
      <PageHeader eyebrow="LedgerOS" title={title} description="Not available in production" />
      <PageBody>
        <Card className="border-border/60 p-10 text-center shadow-elegant">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Not available in production</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            {to && (
              <Button asChild size="sm">
                <Link to={to}>{toLabel ?? "Go to the live experience"}</Link>
              </Button>
            )}
          </div>
        </Card>
      </PageBody>
    </AppShell>
  );
}
