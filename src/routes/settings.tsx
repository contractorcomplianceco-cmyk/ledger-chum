import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOrgId } from "@/hooks/use-current-org";
import {
  getOrganizationSettings, upsertOrganizationSettings,
} from "@/lib/accounting/settings.functions";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LedgerOS" },
      { name: "description", content: "Organization accounting settings, fiscal calendar, integrations, and account mappings." },
      { property: "og:title", content: "Settings — LedgerOS" },
      { property: "og:description", content: "Configure the accounting engine for your organization." },
    ],
  }),
  component: SettingsPage,
});

type ClosePolicy = { soft_close_days?: number; hard_close_days?: number } | null;

function SettingsPage() {
  const orgId = useOrgId();
  const qc = useQueryClient();
  const getFn = useServerFn(getOrganizationSettings);
  const upsertFn = useServerFn(upsertOrganizationSettings);

  const settingsQ = useQuery({
    queryKey: ["settings.org", orgId],
    queryFn: () => getFn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });

  const [form, setForm] = useState({
    accountingBasis: "accrual" as "cash" | "accrual",
    defaultCurrency: "USD",
    timezone: "UTC",
    fiscalCalendar: "gregorian_monthly",
    softCloseDays: 5,
    hardCloseDays: 15,
    auditRetentionMonths: 84,
  });

  useEffect(() => {
    if (settingsQ.data) {
      const cp = (settingsQ.data.close_policy ?? null) as ClosePolicy;
      setForm({
        accountingBasis: (settingsQ.data.accounting_basis ?? "accrual") as "cash" | "accrual",
        defaultCurrency: settingsQ.data.default_currency ?? "USD",
        timezone: settingsQ.data.timezone ?? "UTC",
        fiscalCalendar: settingsQ.data.fiscal_calendar ?? "gregorian_monthly",
        softCloseDays: cp?.soft_close_days ?? 5,
        hardCloseDays: cp?.hard_close_days ?? 15,
        auditRetentionMonths: settingsQ.data.audit_retention_months ?? 84,
      });
    }
  }, [settingsQ.data]);

  const save = async () => {
    if (!orgId) return;
    try {
      await upsertFn({ data: { orgId, ...form } });
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["settings.org"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="LedgerOS · Phase 5 · M4"
        title="Settings"
        description="Configure the accounting engine for your organization."
      />
      <PageBody>
        {!orgId ? (
          <Card className="p-6 text-sm text-muted-foreground">Sign in to manage settings.</Card>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <SettingsLink to="/settings/account-mappings" label="Account Mappings" hint="Route integrations to ledger accounts" />
              <SettingsLink to="/controls" label="Control Center" hint="Close status, exceptions, aging" />
              <SettingsLink to="/close" label="Monthly Close" hint="Checklist and period locking" />
            </div>

            <Card className="p-6 space-y-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Accounting basis
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Accounting basis">
                    <Select value={form.accountingBasis}
                      onValueChange={(v) => setForm({ ...form, accountingBasis: v as "cash" | "accrual" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accrual">Accrual</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Default currency">
                    <Input value={form.defaultCurrency}
                      onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value.toUpperCase().slice(0, 3) })} />
                  </Field>
                  <Field label="Timezone">
                    <Input value={form.timezone}
                      onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
                  </Field>
                  <Field label="Fiscal calendar">
                    <Select value={form.fiscalCalendar}
                      onValueChange={(v) => setForm({ ...form, fiscalCalendar: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gregorian_monthly">Gregorian · Monthly</SelectItem>
                        <SelectItem value="gregorian_quarterly">Gregorian · Quarterly</SelectItem>
                        <SelectItem value="fiscal_454">Retail 4-4-5</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Close policy
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Soft close (days after period end)">
                    <Input type="number" min={0} max={31} value={form.softCloseDays}
                      onChange={(e) => setForm({ ...form, softCloseDays: Number(e.target.value) })} />
                  </Field>
                  <Field label="Hard close (days after period end)">
                    <Input type="number" min={0} max={60} value={form.hardCloseDays}
                      onChange={(e) => setForm({ ...form, hardCloseDays: Number(e.target.value) })} />
                  </Field>
                  <Field label="Audit retention (months)">
                    <Input type="number" min={12} max={240} value={form.auditRetentionMonths}
                      onChange={(e) => setForm({ ...form, auditRetentionMonths: Number(e.target.value) })} />
                  </Field>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={save}>Save settings</Button>
              </div>
            </Card>
          </div>
        )}
      </PageBody>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[12px]">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function SettingsLink({ to, label, hint }: { to: string; label: string; hint: string }) {
  return (
    <Link to={to} className="block">
      <Card className="p-4 hover:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Card>
    </Link>
  );
}
