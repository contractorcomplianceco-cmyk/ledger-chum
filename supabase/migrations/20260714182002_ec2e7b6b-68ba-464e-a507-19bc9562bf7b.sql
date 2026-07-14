-- =====================================================================
-- M5 — Integration Layer foundation (generic; no client-specific rules)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.integration_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'inbound_api',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  contact_email TEXT,
  notes TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, source_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_sources TO authenticated;
GRANT ALL ON public.integration_sources TO service_role;
ALTER TABLE public.integration_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integration_sources_select"
  ON public.integration_sources FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "integration_sources_write"
  ON public.integration_sources FOR ALL TO authenticated
  USING (
    public.is_org_member(org_id)
    AND (
      public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead')
    )
  )
  WITH CHECK (
    public.is_org_member(org_id)
    AND (
      public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead')
    )
  );

DROP TRIGGER IF EXISTS integration_sources_set_updated_at ON public.integration_sources;
CREATE TRIGGER integration_sources_set_updated_at
  BEFORE UPDATE ON public.integration_sources
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.integration_event_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.integration_sources(id) ON DELETE CASCADE,
  external_event_type TEXT NOT NULL,
  ledger_object TEXT NOT NULL,
  account_purpose TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, source_id, external_event_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_event_mappings TO authenticated;
GRANT ALL ON public.integration_event_mappings TO service_role;
ALTER TABLE public.integration_event_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integration_event_mappings_select"
  ON public.integration_event_mappings FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "integration_event_mappings_write"
  ON public.integration_event_mappings FOR ALL TO authenticated
  USING (
    public.is_org_member(org_id)
    AND (
      public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead')
    )
  )
  WITH CHECK (
    public.is_org_member(org_id)
    AND (
      public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead')
    )
  );

DROP TRIGGER IF EXISTS integration_event_mappings_set_updated_at ON public.integration_event_mappings;
CREATE TRIGGER integration_event_mappings_set_updated_at
  BEFORE UPDATE ON public.integration_event_mappings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.sync_history
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES public.integration_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS event_type TEXT;

CREATE INDEX IF NOT EXISTS idx_sync_history_org_status
  ON public.sync_history(org_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_history_source
  ON public.sync_history(source_id) WHERE source_id IS NOT NULL;
