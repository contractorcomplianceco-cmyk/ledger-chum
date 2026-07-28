import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useOrgId } from "@/hooks/use-current-org";
import {
  listSystemConsumers,
  listConsumerClients,
  issueConsumerClient,
  type SystemConsumer,
} from "@/lib/admin/system-consumers.functions";
import { Copy, KeyRound, ShieldCheck, Link2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/contracts")({
  component: ContractsPage,
  head: () => ({
    meta: [
      { title: "External Consumer Contracts — LedgerOS" },
      {
        name: "description",
        content:
          "Manage read-API contracts for AuditEngine and internal CCA systems consuming LedgerOS financial data.",
      },
      { property: "og:title", content: "External Consumer Contracts — LedgerOS" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const READ_ENDPOINTS: { path: string; scope: string; description: string }[] = [
  { path: "/api/public/read/v1/metrics", scope: "read.metrics", description: "Canonical metrics catalog + latest value snapshot." },
  { path: "/api/public/read/v1/health", scope: "read.health", description: "Financial health score + underlying drivers." },
  { path: "/api/public/read/v1/close-status", scope: "read.close", description: "Recent close runs and completion status." },
  { path: "/api/public/read/v1/intelligence", scope: "read.intelligence", description: "Anomalies, recommendations, explanations feed." },
  { path: "/api/public/read/v1/journals", scope: "read.journals", description: "Posted journal entries (metadata only)." },
];

function ContractsPage() {
  const orgId = useOrgId();
  const consumersFn = useServerFn(listSystemConsumers);
  const clientsFn = useServerFn(listConsumerClients);

  const consumersQ = useQuery({
    queryKey: ["system-consumers"],
    queryFn: () => consumersFn(),
  });
  const clientsQ = useQuery({
    queryKey: ["consumer-clients", orgId],
    queryFn: () => (orgId ? clientsFn({ data: { orgId } }) : Promise.resolve([])),
    enabled: !!orgId,
  });

  const byConsumer = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clientsQ.data ?? []) {
      if (c.consumer_slug && c.active)
        map.set(c.consumer_slug, (map.get(c.consumer_slug) ?? 0) + 1);
    }
    return map;
  }, [clientsQ.data]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="M13"
        title="External Consumer Contracts"
        description="Read-only APIs LedgerOS publishes to AuditEngine and the other internal CCA systems. Every consumer is bound to an API key, a set of scopes, and a v1 contract."
        actions={
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Contract v1
          </Badge>
        }
      />
      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>Read API — v1 endpoints</CardTitle>
            <CardDescription>
              All endpoints require <code>Authorization: Bearer &lt;api-key&gt;</code> and the listed scope.
              Base URL: <code>https://ledger-chum.lovable.app</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {READ_ENDPOINTS.map((e) => (
                <div key={e.path} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs">{e.path}</code>
                    <Badge variant="outline" className="text-[10px]">{e.scope}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {(consumersQ.data ?? []).map((c) => (
            <ConsumerCard
              key={c.slug}
              consumer={c}
              activeCount={byConsumer.get(c.slug) ?? 0}
              orgId={orgId}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issued API keys</CardTitle>
            <CardDescription>Every read-API client bound to a CCA consumer for this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {(clientsQ.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No consumer API keys issued yet.</p>
            ) : (
              <div className="divide-y">
                {(clientsQ.data ?? []).map((k) => (
                  <div key={k.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium">{k.name}</div>
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="mr-1 text-[10px]">{k.consumer_slug}</Badge>
                        {k.key_prefix}…  · {(k.scopes ?? []).length} scopes · {k.environment}
                      </div>
                    </div>
                    <Badge variant={k.active ? "default" : "secondary"}>
                      {k.revoked_at ? "revoked" : k.active ? "active" : "inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </AppShell>
  );
}

function ConsumerCard({
  consumer,
  activeCount,
  orgId,
}: {
  consumer: SystemConsumer;
  activeCount: number;
  orgId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [issued, setIssued] = useState<{ token: string; keyPrefix: string } | null>(null);
  const qc = useQueryClient();
  const issueFn = useServerFn(issueConsumerClient);
  const [name, setName] = useState(`${consumer.name} — production`);
  const [scopes, setScopes] = useState<string[]>(consumer.default_scopes);
  const [environment, setEnvironment] = useState<"sandbox" | "production">("production");
  const [busy, setBusy] = useState(false);

  const toggle = (s: string) =>
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const onIssue = async () => {
    if (!orgId) {
      toast.error("Sign in to a workspace first.");
      return;
    }
    if (scopes.length === 0) {
      toast.error("Pick at least one scope.");
      return;
    }
    setBusy(true);
    try {
      const res = await issueFn({
        data: { orgId, consumerSlug: consumer.slug, name, scopes, environment },
      });
      setIssued({ token: res.token, keyPrefix: res.key_prefix ?? "" });
      qc.invalidateQueries({ queryKey: ["consumer-clients", orgId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to issue key");
    } finally {
      setBusy(false);
    }
  };

  const statusTone: Record<string, string> =
    { active: "default", planned: "secondary", deprecated: "destructive" };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              {consumer.name}
              <Badge variant="outline" className="text-[10px]">{consumer.contract_version}</Badge>
            </CardTitle>
            <CardDescription className="mt-1">{consumer.purpose}</CardDescription>
          </div>
          <Badge variant={(statusTone[consumer.status] as never) ?? "outline"}>
            {consumer.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {consumer.default_scopes.map((s) => (
            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <KeyRound className="h-3.5 w-3.5" /> {activeCount} active key{activeCount === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1">
            <Link2 className="h-3.5 w-3.5" /> slug: <code>{consumer.slug}</code>
          </span>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setIssued(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={consumer.status === "deprecated"}>Issue API key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue read-API key for {consumer.name}</DialogTitle>
              <DialogDescription>
                Bound to consumer <code>{consumer.slug}</code>. Only owner-role users can issue keys.
              </DialogDescription>
            </DialogHeader>
            {issued ? (
              <div className="space-y-3">
                <p className="text-sm">
                  Save this token — it is shown once and cannot be retrieved later.
                </p>
                <div className="rounded-md border bg-muted p-3 font-mono text-xs break-all">
                  {issued.token}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(issued.token);
                    toast.success("Token copied");
                  }}
                >
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy token
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Key name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Scopes</Label>
                  <div className="mt-1 grid gap-1">
                    {["read.metrics","read.health","read.close","read.intelligence","read.journals"].map((s) => (
                      <label key={s} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={scopes.includes(s)} onCheckedChange={() => toggle(s)} />
                        <code className="text-xs">{s}</code>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Environment</Label>
                  <div className="mt-1 flex gap-2">
                    {(["sandbox","production"] as const).map((env) => (
                      <Button
                        key={env}
                        type="button"
                        size="sm"
                        variant={environment === env ? "default" : "outline"}
                        onClick={() => setEnvironment(env)}
                      >{env}</Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              {issued ? (
                <Button onClick={() => setOpen(false)}>Done</Button>
              ) : (
                <Button onClick={onIssue} disabled={busy || !orgId}>
                  {busy ? "Issuing…" : "Issue key"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="text-xs">
          <a href="/docs/read-api" className="inline-flex items-center gap-1 text-primary hover:underline">
            Read-API docs <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
