import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrgId, useCurrentOrg } from "@/hooks/use-current-org";
import {
  listApiClients,
  issueApiClient,
  rotateApiClient,
  revokeApiClient,
} from "@/lib/admin/api-clients.functions";
import { testIntegrationConnection } from "@/lib/accounting/workspace.functions";
import { toast } from "sonner";
import { Copy, CheckCircle2, XCircle, RefreshCw, Plug, Beaker, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/settings/serviceconnect")({
  head: () => ({
    meta: [
      { title: "ServiceConnect Financial Connection — LedgerOS" },
      {
        name: "description",
        content:
          "Configure the ServiceConnect Financial Integration — endpoint, org, API client, scopes, sandbox/production, test connection, and sync history.",
      },
      { property: "og:title", content: "ServiceConnect Financial Connection — LedgerOS" },
    ],
  }),
  component: ServiceConnectSettings,
});

function ServiceConnectSettings() {
  const orgId = useOrgId();
  const { data: orgData } = useCurrentOrg();
  const live = !!orgId;
  const qc = useQueryClient();

  const listFn = useServerFn(listApiClients);
  const issueFn = useServerFn(issueApiClient);
  const rotateFn = useServerFn(rotateApiClient);
  const revokeFn = useServerFn(revokeApiClient);
  const testFn = useServerFn(testIntegrationConnection);

  const clientsQ = useQuery({
    queryKey: ["api-clients", orgId],
    queryFn: () => listFn({ data: { orgId: orgId! } }),
    enabled: live,
    retry: false,
  });

  const [name, setName] = useState("ServiceConnect (sandbox)");
  const [issuing, setIssuing] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    latencyMs?: number;
    err?: string;
    mapped?: number;
    clients?: number;
    period?: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const endpointBase =
    typeof window !== "undefined" ? window.location.origin : "https://ledger-chum.lovable.app";

  const handleIssue = async () => {
    if (!orgId) return;
    setIssuing(true);
    try {
      const res = await issueFn({
        data: { orgId, name, provider: "serviceconnect" },
      });
      setNewToken(res.token);
      toast.success("API client issued. Copy the token now — it won't be shown again.");
      qc.invalidateQueries({ queryKey: ["api-clients"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to issue client");
    } finally {
      setIssuing(false);
    }
  };

  const handleRotate = async (id: string) => {
    if (!orgId) return;
    try {
      const res = await rotateFn({ data: { id, orgId } });
      setNewToken(res.token);
      toast.success("Key rotated. Update ServiceConnect with the new token.");
      qc.invalidateQueries({ queryKey: ["api-clients"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rotate failed");
    }
  };

  const handleRevoke = async (id: string) => {
    if (!orgId) return;
    if (!confirm("Revoke this API client? ServiceConnect will lose access immediately.")) return;
    try {
      await revokeFn({ data: { id, orgId } });
      toast.success("API client revoked");
      qc.invalidateQueries({ queryKey: ["api-clients"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Revoke failed");
    }
  };

  const handleTest = async () => {
    if (!orgId) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testFn({ data: { orgId } });
      setTestResult({
        ok: true,
        latencyMs: res.latencyMs,
        mapped: res.mappedPurposes.length,
        clients: res.apiClients.length,
        period: res.currentPeriod ? `${res.currentPeriod.status}` : "no open period",
      });
    } catch (err) {
      setTestResult({ ok: false, err: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 4 · Connectors"
        title="ServiceConnect Financial Connection"
        description="Configure the API client, scopes, and environment used by ServiceConnect to sync work orders, invoices, payments, and inventory into LedgerOS."
        actions={
          <Button size="sm" variant="outline" asChild className="h-9">
            <Link to="/integrations/sandbox">
              <Beaker className="mr-1.5 h-3.5 w-3.5" /> Try sandbox
            </Link>
          </Button>
        }
      />
      <PageBody>
        {!live && (
          <Card className="border-warning/40 bg-warning/5 p-4 shadow-card">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-warning" />
              <div className="text-[13px] text-foreground">
                Sign in and connect an organization to manage real API clients. This screen shows
                demo content while unauthenticated.
              </div>
            </div>
          </Card>
        )}

        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Connection details
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Field
              label="LedgerOS endpoint"
              value={`${endpointBase}/api/public/integrations`}
              mono
            />
            <Field
              label="Organization"
              value={orgData?.org?.name ?? "—"}
              sub={orgId ?? "not authenticated"}
              mono
            />
            <Field label="Auth header" value="Authorization: Bearer <api_client_key>" mono />
            <Field label="Idempotency" value="Idempotency-Key: <uuid> (required)" mono />
          </div>
        </Card>

        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Test connection
              </div>
              <div className="text-[13px] text-muted-foreground">
                Verifies auth, org access, mapping coverage, and fiscal period status.
              </div>
            </div>
            <Button size="sm" onClick={handleTest} disabled={!live || testing} className="h-9">
              {testing ? (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plug className="mr-1.5 h-3.5 w-3.5" />
              )}
              {testing ? "Testing…" : "Test connection"}
            </Button>
          </div>
          {testResult && (
            <div className="mt-3 rounded-md border border-border/60 bg-background p-3 text-[13px]">
              {testResult.ok ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-semibold">Connection healthy</span>
                  <span className="text-muted-foreground">
                    · {testResult.latencyMs}ms · {testResult.clients} active client(s) ·{" "}
                    {testResult.mapped} mapping(s) · fiscal period: {testResult.period}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span>{testResult.err}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Issue API client
              </div>
              <div className="text-[13px] text-muted-foreground">
                Owner-only. Token is shown once. Store it in ServiceConnect immediately.
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <Label className="text-[11px] text-muted-foreground">Client name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-64 text-[13px]"
                />
              </div>
              <Button size="sm" onClick={handleIssue} disabled={!live || issuing} className="h-9">
                {issuing ? "Issuing…" : "Issue"}
              </Button>
            </div>
          </div>
          {newToken && (
            <div className="mt-3 rounded-md border border-warning/40 bg-warning/5 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-warning">
                Save this token — it will not be shown again
              </div>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-background px-2 py-1 font-mono text-[12px]">
                  {newToken}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(newToken);
                    toast.success("Token copied");
                  }}
                >
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden border-border/70 bg-surface shadow-card">
          <div className="border-b border-border/60 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Existing API clients
            </div>
          </div>
          <div className="grid grid-cols-[1fr_130px_100px_140px_140px_170px] gap-3 border-b border-border/60 bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Name</div>
            <div>Provider</div>
            <div>Prefix</div>
            <div>Last used</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-border/60">
            {(clientsQ.data ?? []).map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_130px_100px_140px_140px_170px] items-center gap-3 px-4 py-3 text-[13px]"
              >
                <div>
                  <div className="font-semibold text-foreground">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.description ?? "—"}</div>
                </div>
                <div className="text-muted-foreground">{c.provider}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{c.key_prefix}…</div>
                <div className="text-[12px] text-muted-foreground">
                  {c.last_used_at ? new Date(c.last_used_at).toLocaleString() : "never"}
                </div>
                <div>
                  {c.active ? (
                    <Badge
                      variant="outline"
                      className="h-5 border-transparent bg-success/10 text-[10px] font-semibold text-success ring-1 ring-inset ring-success/20"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="h-5 border-transparent bg-muted text-[10px] font-semibold text-muted-foreground ring-1 ring-inset ring-border"
                    >
                      Revoked
                    </Badge>
                  )}
                </div>
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[12px]"
                    disabled={!c.active}
                    onClick={() => handleRotate(c.id)}
                  >
                    Rotate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[12px] text-destructive"
                    disabled={!c.active}
                    onClick={() => handleRevoke(c.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
            {(!live || (clientsQ.data ?? []).length === 0) && (
              <div className="px-4 py-8 text-center text-[12px] text-muted-foreground">
                {live
                  ? "No API clients yet — issue one above to enable ServiceConnect."
                  : "Sign in to manage API clients."}
              </div>
            )}
          </div>
        </Card>

        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Required scopes
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              "customers.read",
              "customers.write",
              "work_orders.completed",
              "invoices.create",
              "invoices.read",
              "payments.create",
              "inventory.consume",
              "refunds.create",
            ].map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="h-6 border-border/70 bg-background text-[11px] font-mono font-normal"
              >
                {s}
              </Badge>
            ))}
          </div>
          <div className="mt-2 text-[12px] text-muted-foreground">
            Scopes are stored per-client on <code className="font-mono">api_clients.scopes</code>{" "}
            and enforced by <code className="font-mono">requireScope</code> on every
            /api/public/integrations/* handler.
          </div>
        </Card>
      </PageBody>
    </AppShell>
  );
}

function Field({
  label,
  value,
  sub,
  mono,
}: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 truncate text-[13px] text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] font-mono text-muted-foreground">{sub}</div>}
    </div>
  );
}
