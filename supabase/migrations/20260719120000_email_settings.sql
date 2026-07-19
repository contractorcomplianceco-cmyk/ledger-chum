-- =========================================================
-- Email integration — per-org SMTP + IMAP/POP configuration
-- =========================================================
-- One row per organization. Secrets (smtp_password, inbound_password) are
-- written only via server functions and are never selected into client
-- responses. Access is org-scoped through RLS, consistent with
-- organization_settings: members read, owners/accounting_leads write.

CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,

  provider TEXT NOT NULL DEFAULT 'custom'
    CHECK (provider IN ('zoho','gmail','custom')),

  -- Outbound (SMTP)
  smtp_enabled BOOLEAN NOT NULL DEFAULT false,
  smtp_host TEXT NOT NULL DEFAULT '',
  smtp_port INT NOT NULL DEFAULT 587 CHECK (smtp_port BETWEEN 1 AND 65535),
  smtp_secure BOOLEAN NOT NULL DEFAULT false,
  smtp_username TEXT NOT NULL DEFAULT '',
  smtp_password TEXT NOT NULL DEFAULT '',
  from_name TEXT NOT NULL DEFAULT '',
  from_address TEXT NOT NULL DEFAULT '',

  -- Inbound (IMAP / POP3)
  inbound_enabled BOOLEAN NOT NULL DEFAULT false,
  inbound_protocol TEXT NOT NULL DEFAULT 'imap'
    CHECK (inbound_protocol IN ('imap','pop3')),
  inbound_host TEXT NOT NULL DEFAULT '',
  inbound_port INT NOT NULL DEFAULT 993 CHECK (inbound_port BETWEEN 1 AND 65535),
  inbound_secure BOOLEAN NOT NULL DEFAULT true,
  inbound_username TEXT NOT NULL DEFAULT '',
  inbound_password TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_settings TO authenticated;
GRANT ALL ON public.email_settings TO service_role;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members read email settings" ON public.email_settings;
CREATE POLICY "members read email settings"
  ON public.email_settings FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

DROP POLICY IF EXISTS "leads write email settings" ON public.email_settings;
CREATE POLICY "leads write email settings"
  ON public.email_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'))
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'));

DROP TRIGGER IF EXISTS email_settings_set_updated_at ON public.email_settings;
CREATE TRIGGER email_settings_set_updated_at
  BEFORE UPDATE ON public.email_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
