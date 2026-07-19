import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrgId } from "@/hooks/use-current-org";
import { isDemoMode } from "@/lib/app-mode";
import { listInboxMessages, fetchInboxMessage } from "@/lib/email/email.functions";
import { Inbox, Paperclip, RefreshCw, Settings2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/email/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — LedgerOS" },
      {
        name: "description",
        content: "Recent messages fetched from the configured inbound mailbox.",
      },
    ],
  }),
  component: InboxPage,
});

const DEMO_ORG = "00000000-0000-4000-8000-000000dec0de";

function InboxPage() {
  const orgId = useOrgId();
  const demo = isDemoMode();
  const live = !!orgId || demo;
  const org = orgId ?? DEMO_ORG;

  const listFn = useServerFn(listInboxMessages);
  const fetchFn = useServerFn(fetchInboxMessage);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const listQ = useQuery({
    queryKey: ["email.inbox", org, demo],
    queryFn: () => listFn({ data: { orgId: org, mailbox: "INBOX", limit: 25 } }),
    enabled: live,
    retry: false,
  });

  const msgQ = useQuery({
    queryKey: ["email.message", org, selectedUid],
    queryFn: () => fetchFn({ data: { orgId: org, mailbox: "INBOX", uid: selectedUid! } }),
    enabled: live && !!selectedUid,
    retry: false,
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Email"
        title="Inbox"
        description="Recent messages from the configured inbound mailbox (INBOX)."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              onClick={() => listQ.refetch()}
              disabled={!live || listQ.isFetching}
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${listQ.isFetching ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </Button>
            <Button size="sm" variant="outline" asChild className="h-9">
              <Link to="/settings/email">
                <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Email settings
              </Link>
            </Button>
          </div>
        }
      />
      <PageBody>
        {demo && (
          <Card className="border-primary/30 bg-primary/5 p-3 shadow-card">
            <div className="flex items-center gap-2 text-[13px]">
              <Badge>Demo</Badge> Showing simulated inbox data — no mailbox is contacted.
            </div>
          </Card>
        )}

        {listQ.isError && (
          <Card className="border-destructive/40 bg-destructive/5 p-3 text-[13px] text-destructive">
            {listQ.error instanceof Error ? listQ.error.message : "Failed to load inbox"}
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Card className="overflow-hidden border-border/70 bg-surface shadow-card">
            <div className="border-b border-border/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Messages
            </div>
            <div className="divide-y divide-border/60">
              {(listQ.data ?? []).map((m) => (
                <button
                  key={m.uid}
                  onClick={() => setSelectedUid(m.uid)}
                  className={`block w-full px-4 py-3 text-left transition-colors hover:bg-muted/40 ${selectedUid === m.uid ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-[13px] ${m.seen ? "text-foreground" : "font-semibold text-foreground"}`}
                    >
                      {m.from || "(unknown sender)"}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(m.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {m.hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                    <span className="truncate text-[13px] text-foreground">{m.subject}</span>
                  </div>
                  {m.snippet && (
                    <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {m.snippet}
                    </div>
                  )}
                </button>
              ))}
              {live && !listQ.isLoading && (listQ.data ?? []).length === 0 && (
                <div className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                  <Inbox className="mx-auto mb-2 h-5 w-5" /> No messages.
                </div>
              )}
              {!live && (
                <div className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                  Sign in to view the inbox.
                </div>
              )}
            </div>
          </Card>

          <Card className="border-border/70 bg-surface p-4 shadow-card">
            {!selectedUid ? (
              <div className="py-16 text-center text-[13px] text-muted-foreground">
                Select a message to read it.
              </div>
            ) : msgQ.isLoading ? (
              <div className="py-16 text-center text-[13px] text-muted-foreground">Loading…</div>
            ) : !msgQ.data ? (
              <div className="py-16 text-center text-[13px] text-muted-foreground">
                Message not found.
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedUid(null)}
                  className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground lg:hidden"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <div>
                  <div className="text-[15px] font-semibold text-foreground">
                    {msgQ.data.subject}
                  </div>
                  <div className="mt-1 text-[12px] text-muted-foreground">
                    From <span className="text-foreground">{msgQ.data.from}</span> ·{" "}
                    {new Date(msgQ.data.date).toLocaleString()}
                  </div>
                  <div className="text-[12px] text-muted-foreground">To {msgQ.data.to}</div>
                </div>
                {msgQ.data.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msgQ.data.attachments.map((a) => (
                      <Badge
                        key={a.filename}
                        variant="outline"
                        className="h-6 gap-1 border-border/70 bg-background text-[11px] font-normal"
                      >
                        <Paperclip className="h-3 w-3" /> {a.filename} ({Math.round(a.size / 1024)}{" "}
                        KB)
                      </Badge>
                    ))}
                  </div>
                )}
                {/* Render inbound bodies as plain text only. Raw email HTML is
                    untrusted and is never injected into the DOM (XSS guard). */}
                <div className="rounded-md border border-border/60 bg-background p-3">
                  <pre className="whitespace-pre-wrap break-words font-sans text-[13px] text-foreground">
                    {msgQ.data.text}
                  </pre>
                  {msgQ.data.html && !msgQ.data.text && (
                    <div className="text-[12px] text-muted-foreground">
                      (HTML-only message — displayed as text)
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </PageBody>
    </AppShell>
  );
}
