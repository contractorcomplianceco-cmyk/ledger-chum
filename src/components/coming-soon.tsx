import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function ComingSoon({
  eyebrow,
  title,
  description,
  phase,
}: {
  eyebrow: string;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <AppShell>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <PageBody>
        <Card className="relative overflow-hidden border-border/60 p-10 text-center shadow-elegant">
          <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-50" />
          <div className="relative mx-auto max-w-lg space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-6 w-6 text-brand-foreground" />
            </div>
            <Badge variant="outline" className="border-brand/30 bg-brand/10 text-brand">
              {phase}
            </Badge>
            <h2 className="text-xl font-semibold tracking-tight">Design in progress</h2>
            <p className="text-sm text-muted-foreground">
              This screen is scheduled for an upcoming phase of the LedgerOS UI Design Lab. The
              executive dashboard and app shell are live for review — additional workspaces will
              land phase by phase.
            </p>
          </div>
        </Card>
      </PageBody>
    </AppShell>
  );
}
