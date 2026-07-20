import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrgId } from "@/hooks/use-current-org";
import { isDemoMode } from "@/lib/app-mode";
import { applyPreset, PROVIDER_PRESETS } from "@/integrations/email/config";
import type { EmailProviderPreset, EmailSettingsInput } from "@/integrations/email/types";
import {
  getEmailSettings,
  upsertEmailSettings,
  testEmailConnection,
  sendTestEmail,
} from "@/lib/email/email.functions";
import { toast } from "sonner";
import {
  Mail,
  Inbox,
  Plug,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/settings/email")({
  head: () => ({
    meta: [
      { title: "Email — LedgerOS" },
      {
        name: "description",
        content:
          "Configure provider-agnostic SMTP sending and IMAP/POP inbound mail, test the connection, and send a test email.",
      },
      { property: "og:title", content: "Email settings — LedgerOS" },
    ],
  }),
  component: EmailSettingsPage,
});

const DEFAULT_FORM: EmailSettingsInput = {
  provider: "custom",
  smtpEnabled: false,
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  smtpUsername: "",
  fromName: "",
  fromAddress: "",
  inboundEnabled: false,
  inboundProtocol: "imap",
  inboundHost: "",
  inboundPort: 993,
  inboundSecure: true,
  inboundUsername: "",
};

type TestState = { ok: boolean; msg: string } | null;

function EmailSettingsPage() {
  const orgId = useOrgId();
  const demo = isDemoMode();
  const live = !!orgId || demo;
  const qc = useQueryClient();

  const getFn = useServerFn(getEmailSettings);
  const upsertFn = useServerFn(upsertEmailSettings);
  const testFn = useServerFn(testEmailConnection);
  const sendTestFn = useServerFn(sendTestEmail);

  const settingsQ = useQuery({
    queryKey: ["email.settings", orgId, demo],
    queryFn: () => getFn({ data: { orgId: orgId ?? "00000000-0000-4000-8000-000000dec0de" } }),
    enabled: live,
    retry: false,
  });

  const [form, setForm] = useState<EmailSettingsInput>(DEFAULT_FORM);
  const [smtpPassword, setSmtpPassword] = useState("");
  const [inboundPassword, setInboundPassword] = useState("");
  const [hasSmtpPassword, setHasSmtpPassword] = useState(false);
  const [hasInboundPassword, setHasInboundPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testTarget, setTestTarget] = useState<"smtp" | "inbound" | null>(null);
  const [testResult, setTestResult] = useState<TestState>(null);
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const d = settingsQ.data;
    if (!d) return;
    setForm({
      provider: d.provider,
      smtpEnabled: d.smtpEnabled,
      smtpHost: d.smtpHost,
      smtpPort: d.smtpPort,
      smtpSecure: d.smtpSecure,
      smtpUsername: d.smtpUsername,
      fromName: d.fromName,
      fromAddress: d.fromAddress,
      inboundEnabled: d.inboundEnabled,
      inboundProtocol: d.inboundProtocol,
      inboundHost: d.inboundHost,
      inboundPort: d.inboundPort,
      inboundSecure: d.inboundSecure,
      inboundUsername: d.inboundUsername,
    });
    setHasSmtpPassword(d.hasSmtpPassword);
    setHasInboundPassword(d.hasInboundPassword);
  }, [settingsQ.data]);

  const set = <K extends keyof EmailSettingsInput>(k: K, v: EmailSettingsInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onProvider = (p: EmailProviderPreset) => setForm((f) => applyPreset(p, f));

  const save = async () => {
    if (!orgId && !demo) return;
    setSaving(true);
    try {
      const res = await upsertFn({
        data: {
          orgId: orgId ?? "00000000-0000-4000-8000-000000dec0de",
          ...form,
          ...(smtpPassword ? { smtpPassword } : {}),
          ...(inboundPassword ? { inboundPassword } : {}),
        },
      });
      setHasSmtpPassword(res.hasSmtpPassword);
      setHasInboundPassword(res.hasInboundPassword);
      setSmtpPassword("");
      setInboundPassword("");
      toast.success(demo ? "Saved (demo — not persisted)" : "Email settings saved");
      qc.invalidateQueries({ queryKey: ["email.settings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const runTest = async (target: "smtp" | "inbound") => {
    if (!orgId && !demo) return;
    setTestTarget(target);
    setTestResult(null);
    try {
      const res = await testFn({
        data: { orgId: orgId ?? "00000000-0000-4000-8000-000000dec0de", target },
      });
      setTestResult({
        ok: true,
        msg: `${target === "smtp" ? "SMTP" : "Inbound"} connection healthy · ${res.latencyMs}ms${res.simulated ? " (simulated)" : ""}`,
      });
    } catch (e) {
      setTestResult({ ok: false, msg: e instanceof Error ? e.message : "Connection failed" });
    } finally {
      setTestTarget(null);
    }
  };

  const doSendTest = async () => {
    if ((!orgId && !demo) || !testTo) return;
    setSending(true);
    try {
      const res = await sendTestFn({
        data: { orgId: orgId ?? "00000000-0000-4000-8000-000000dec0de", to: testTo },
      });
      toast.success(
        `Test email ${res.simulated ? "simulated" : "sent"} · id ${res.messageId.slice(0, 24)}…`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  const presetNote = PROVIDER_PRESETS[form.provider]?.note;

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Settings · Connectors"
        title="Email"
        description="Provider-agnostic outbound (SMTP) and inbound (IMAP/POP) mail. Works with Zoho, Gmail/Workspace, or any custom host."
        actions={
          <Button size="sm" variant="outline" asChild className="h-9">
            <Link to="/email/inbox">
              <Inbox className="mr-1.5 h-3.5 w-3.5" /> View inbox
            </Link>
          </Button>
        }
      />
      <PageBody>
        {demo && (
          <Card className="border-primary/30 bg-primary/5 p-4 shadow-card">
            <div className="flex items-start gap-2">
              <Badge className="mt-0.5">Demo</Badge>
              <div className="text-[13px] text-foreground">
                Demo mode simulates sending and inbox fetching with sample data — no real network
                calls are made and changes are not persisted. Set{" "}
                <code className="font-mono">VITE_APP_MODE=production</code> to use real connections.
              </div>
            </div>
          </Card>
        )}

        {!live && (
          <Card className="border-warning/40 bg-warning/5 p-4 shadow-card">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-warning" />
              <div className="text-[13px]">
                Sign in and connect an organization to manage email settings.
              </div>
            </div>
          </Card>
        )}

        {/* Provider preset */}
        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="grid gap-3 md:grid-cols-[240px_1fr] md:items-center">
            <div>
              <Label className="text-[12px]">Provider preset</Label>
              <Select
                value={form.provider}
                onValueChange={(v) => onProvider(v as EmailProviderPreset)}
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PROVIDER_PRESETS) as EmailProviderPreset[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PROVIDER_PRESETS[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {presetNote && (
              <div className="text-[12px] text-muted-foreground md:pt-5">{presetNote}</div>
            )}
          </div>
        </Card>

        {/* SMTP */}
        <Card className="border-border/70 bg-surface p-4 shadow-card space-y-4">
          <SectionHead
            icon={<Mail className="h-4 w-4" />}
            title="Outbound · SMTP"
            right={
              <div className="flex items-center gap-2">
                <Label className="text-[12px] text-muted-foreground">Enabled</Label>
                <Switch checked={form.smtpEnabled} onCheckedChange={(v) => set("smtpEnabled", v)} />
              </div>
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            <FieldInput
              label="Host"
              value={form.smtpHost}
              onChange={(v) => set("smtpHost", v)}
              placeholder="smtp.zoho.com"
            />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput
                label="Port"
                type="number"
                value={String(form.smtpPort)}
                onChange={(v) => set("smtpPort", Number(v) || 0)}
              />
              <div className="flex items-end gap-2 pb-1.5">
                <Switch checked={form.smtpSecure} onCheckedChange={(v) => set("smtpSecure", v)} />
                <Label className="text-[12px] text-muted-foreground">TLS (secure)</Label>
              </div>
            </div>
            <FieldInput
              label="Username"
              value={form.smtpUsername}
              onChange={(v) => set("smtpUsername", v)}
              placeholder="billing@yourco.com"
            />
            <FieldInput
              label={`Password${hasSmtpPassword ? " (saved — leave blank to keep)" : ""}`}
              type="password"
              value={smtpPassword}
              onChange={setSmtpPassword}
              placeholder={hasSmtpPassword ? "••••••••" : "app password"}
            />
            <FieldInput
              label="From name"
              value={form.fromName}
              onChange={(v) => set("fromName", v)}
              placeholder="Your Company"
            />
            <FieldInput
              label="From address"
              value={form.fromAddress}
              onChange={(v) => set("fromAddress", v)}
              placeholder="billing@yourco.com"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              disabled={!live || testTarget === "smtp"}
              onClick={() => runTest("smtp")}
            >
              {testTarget === "smtp" ? (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plug className="mr-1.5 h-3.5 w-3.5" />
              )}
              Test SMTP
            </Button>
          </div>
        </Card>

        {/* Inbound */}
        <Card className="border-border/70 bg-surface p-4 shadow-card space-y-4">
          <SectionHead
            icon={<Inbox className="h-4 w-4" />}
            title="Inbound · IMAP / POP3"
            right={
              <div className="flex items-center gap-2">
                <Label className="text-[12px] text-muted-foreground">Enabled</Label>
                <Switch
                  checked={form.inboundEnabled}
                  onCheckedChange={(v) => set("inboundEnabled", v)}
                />
              </div>
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-[12px]">Protocol</Label>
              <Select
                value={form.inboundProtocol}
                onValueChange={(v) => set("inboundProtocol", v as "imap" | "pop3")}
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imap">IMAP</SelectItem>
                  <SelectItem value="pop3">POP3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldInput
                label="Port"
                type="number"
                value={String(form.inboundPort)}
                onChange={(v) => set("inboundPort", Number(v) || 0)}
              />
              <div className="flex items-end gap-2 pb-1.5">
                <Switch
                  checked={form.inboundSecure}
                  onCheckedChange={(v) => set("inboundSecure", v)}
                />
                <Label className="text-[12px] text-muted-foreground">TLS (secure)</Label>
              </div>
            </div>
            <FieldInput
              label="Host"
              value={form.inboundHost}
              onChange={(v) => set("inboundHost", v)}
              placeholder="imap.zoho.com"
            />
            <FieldInput
              label="Username"
              value={form.inboundUsername}
              onChange={(v) => set("inboundUsername", v)}
              placeholder="billing@yourco.com"
            />
            <FieldInput
              label={`Password${hasInboundPassword ? " (saved — leave blank to keep)" : ""}`}
              type="password"
              value={inboundPassword}
              onChange={setInboundPassword}
              placeholder={hasInboundPassword ? "••••••••" : "app password"}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              disabled={!live || testTarget === "inbound"}
              onClick={() => runTest("inbound")}
            >
              {testTarget === "inbound" ? (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plug className="mr-1.5 h-3.5 w-3.5" />
              )}
              Test inbound
            </Button>
          </div>
        </Card>

        {testResult && (
          <Card className="border-border/70 bg-surface p-3 shadow-card">
            <div
              className={`flex items-center gap-2 text-[13px] ${testResult.ok ? "text-success" : "text-destructive"}`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>{testResult.msg}</span>
            </div>
          </Card>
        )}

        {/* Save + send test */}
        <Card className="border-border/70 bg-surface p-4 shadow-card">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-2">
              <div>
                <Label className="text-[12px]">Send a test email to</Label>
                <Input
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="you@yourco.com"
                  className="mt-1 h-9 w-64"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                disabled={!live || sending || !testTo}
                onClick={doSendTest}
              >
                {sending ? (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                )}
                Send test
              </Button>
            </div>
            <Button size="sm" className="h-9" disabled={!live || saving} onClick={save}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </Card>
      </PageBody>
    </AppShell>
  );
}

function SectionHead({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {icon} {title}
      </div>
      {right}
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-[12px]">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-9"
      />
    </div>
  );
}
