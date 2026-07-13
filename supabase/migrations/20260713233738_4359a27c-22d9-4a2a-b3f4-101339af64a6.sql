
-- =========================================================
-- LedgerOS Phase 1 — Foundation
-- =========================================================

-- ---------- ORGANIZATIONS ----------
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS fiscal_year_start_month SMALLINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_status_check;
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_status_check
  CHECK (status IN ('active','suspended','archived'));

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_fiscal_month_check;
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_fiscal_month_check
  CHECK (fiscal_year_start_month BETWEEN 1 AND 12);

-- expanded write policies on organizations
DROP POLICY IF EXISTS "owners update their org" ON public.organizations;
CREATE POLICY "owners update their org"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), id, 'owner'))
  WITH CHECK (public.has_role(auth.uid(), id, 'owner'));

-- shared updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS organizations_set_updated_at ON public.organizations;
CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- ORGANIZATION SETTINGS ----------
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  accounting_basis TEXT NOT NULL DEFAULT 'accrual'
    CHECK (accounting_basis IN ('cash','accrual')),
  default_currency TEXT NOT NULL DEFAULT 'USD',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  fiscal_calendar TEXT NOT NULL DEFAULT 'gregorian_monthly',
  close_policy JSONB NOT NULL DEFAULT '{"soft_close_days":5,"hard_close_days":15}'::jsonb,
  audit_retention_months INT NOT NULL DEFAULT 84,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_settings TO authenticated;
GRANT ALL ON public.organization_settings TO service_role;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read org settings"
  ON public.organization_settings FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "leads write org settings"
  ON public.organization_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'))
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'));

DROP TRIGGER IF EXISTS organization_settings_set_updated_at ON public.organization_settings;
CREATE TRIGGER organization_settings_set_updated_at
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- FISCAL YEARS ----------
CREATE TABLE IF NOT EXISTS public.fiscal_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  year INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','pending_close','closed','locked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, year),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS fiscal_years_org_idx ON public.fiscal_years (org_id, year DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiscal_years TO authenticated;
GRANT ALL ON public.fiscal_years TO service_role;
ALTER TABLE public.fiscal_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read fiscal years"
  ON public.fiscal_years FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "leads write fiscal years"
  ON public.fiscal_years FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'))
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'));

DROP TRIGGER IF EXISTS fiscal_years_set_updated_at ON public.fiscal_years;
CREATE TRIGGER fiscal_years_set_updated_at
  BEFORE UPDATE ON public.fiscal_years
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- FISCAL PERIODS ----------
CREATE TABLE IF NOT EXISTS public.fiscal_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  fiscal_year_id UUID NOT NULL REFERENCES public.fiscal_years(id) ON DELETE CASCADE,
  period_number SMALLINT NOT NULL CHECK (period_number BETWEEN 1 AND 13),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','pending_close','closed','locked')),
  closed_at TIMESTAMPTZ,
  closed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (fiscal_year_id, period_number),
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS fiscal_periods_org_range_idx
  ON public.fiscal_periods (org_id, start_date, end_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiscal_periods TO authenticated;
GRANT ALL ON public.fiscal_periods TO service_role;
ALTER TABLE public.fiscal_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read fiscal periods"
  ON public.fiscal_periods FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "leads write fiscal periods"
  ON public.fiscal_periods FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'))
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'));

DROP TRIGGER IF EXISTS fiscal_periods_set_updated_at ON public.fiscal_periods;
CREATE TRIGGER fiscal_periods_set_updated_at
  BEFORE UPDATE ON public.fiscal_periods
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Helper: is a given date within an open period for the org?
CREATE OR REPLACE FUNCTION public.is_period_open(_org UUID, _date DATE)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.fiscal_periods
    WHERE org_id = _org
      AND _date BETWEEN start_date AND end_date
      AND status = 'open'
  )
$$;

-- ---------- AUDIT EVENTS: expand + make immutable ----------
ALTER TABLE public.audit_events
  ADD COLUMN IF NOT EXISTS action TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT;

CREATE OR REPLACE FUNCTION public.tg_audit_immutable()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- service_role bypasses via SECURITY, but this trigger applies to all roles
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  RAISE EXCEPTION 'audit_events is append-only';
END $$;

DROP TRIGGER IF EXISTS audit_events_no_update ON public.audit_events;
CREATE TRIGGER audit_events_no_update
  BEFORE UPDATE ON public.audit_events
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_immutable();

DROP TRIGGER IF EXISTS audit_events_no_delete ON public.audit_events;
CREATE TRIGGER audit_events_no_delete
  BEFORE DELETE ON public.audit_events
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_immutable();

-- Ensure INSERT policy exists for authenticated (service_role bypasses RLS)
DROP POLICY IF EXISTS "members insert audit" ON public.audit_events;
CREATE POLICY "members insert audit"
  ON public.audit_events FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id));

-- ---------- API CLIENTS: extend ----------
ALTER TABLE public.api_clients
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'generic',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS api_clients_set_updated_at ON public.api_clients;
CREATE TRIGGER api_clients_set_updated_at
  BEFORE UPDATE ON public.api_clients
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP POLICY IF EXISTS "owners write their org api clients" ON public.api_clients;
CREATE POLICY "owners write their org api clients"
  ON public.api_clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner'))
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner'));

-- ---------- PILOT ORG SEED ----------
-- Idempotent: only inserts if the pilot org does not exist.
DO $$
DECLARE
  _org UUID;
  _fy UUID;
  _y INT := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  _m INT;
BEGIN
  SELECT id INTO _org FROM public.organizations WHERE slug = 'cca-pilot';
  IF _org IS NULL THEN
    INSERT INTO public.organizations
      (name, slug, legal_name, display_name, status, industry, timezone, currency, country, fiscal_year_start_month)
    VALUES
      ('CCA Pilot Financials','cca-pilot','CCA Pilot Financials, LLC','CCA Pilot','active',
       'field_services','America/New_York','USD','US',1)
    RETURNING id INTO _org;

    INSERT INTO public.organization_settings (org_id) VALUES (_org);

    INSERT INTO public.fiscal_years (org_id, year, start_date, end_date, status)
    VALUES (_org, _y, make_date(_y,1,1), make_date(_y,12,31), 'open')
    RETURNING id INTO _fy;

    FOR _m IN 1..12 LOOP
      INSERT INTO public.fiscal_periods
        (org_id, fiscal_year_id, period_number, start_date, end_date, status)
      VALUES
        (_org, _fy, _m,
         make_date(_y,_m,1),
         (make_date(_y,_m,1) + INTERVAL '1 month' - INTERVAL '1 day')::date,
         'open');
    END LOOP;
  END IF;
END $$;
