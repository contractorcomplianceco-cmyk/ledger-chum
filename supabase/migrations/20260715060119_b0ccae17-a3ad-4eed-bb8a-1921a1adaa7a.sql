-- ============================================================
-- M8: Accounting Completeness Layer
-- Inventory · Fixed Assets · Tax · Multi-Entity · AI Advisory
-- ============================================================

-- ============================================================
-- 1. INVENTORY & COST ACCOUNTING
-- ============================================================

CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  cogs_account_id UUID REFERENCES public.accounts(id),
  asset_account_id UUID REFERENCES public.accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_categories TO authenticated;
GRANT ALL ON public.inventory_categories TO service_role;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read inventory_categories" ON public.inventory_categories
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write inventory_categories" ON public.inventory_categories
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_inv_cat_updated_at BEFORE UPDATE ON public.inventory_categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_locations TO authenticated;
GRANT ALL ON public.inventory_locations TO service_role;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read inventory_locations" ON public.inventory_locations
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write inventory_locations" ON public.inventory_locations
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_inv_loc_updated_at BEFORE UPDATE ON public.inventory_locations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  unit_of_measure TEXT NOT NULL DEFAULT 'each',
  cost_method TEXT NOT NULL DEFAULT 'average'
    CHECK (cost_method IN ('average','fifo','standard','specific')),
  standard_cost NUMERIC(18,4),
  current_avg_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
  quantity_on_hand NUMERIC(18,4) NOT NULL DEFAULT 0,
  is_tracked BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  cogs_account_id UUID REFERENCES public.accounts(id),
  asset_account_id UUID REFERENCES public.accounts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, sku)
);
CREATE INDEX idx_inv_items_org_active ON public.inventory_items(org_id) WHERE is_active;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read inventory_items" ON public.inventory_items
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write inventory_items" ON public.inventory_items
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_inv_item_updated_at BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.inventory_locations(id) ON DELETE SET NULL,
  txn_type TEXT NOT NULL
    CHECK (txn_type IN ('receipt','issue','adjustment','transfer_in','transfer_out','consumption','revaluation')),
  quantity NUMERIC(18,4) NOT NULL,
  unit_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
  reference_type TEXT,
  reference_id UUID,
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  memo TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_txn_item ON public.inventory_transactions(org_id, item_id, occurred_at DESC);
CREATE INDEX idx_inv_txn_ref ON public.inventory_transactions(org_id, reference_type, reference_id);
GRANT SELECT, INSERT ON public.inventory_transactions TO authenticated;
GRANT ALL ON public.inventory_transactions TO service_role;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read inventory_transactions" ON public.inventory_transactions
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members insert inventory_transactions" ON public.inventory_transactions
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id));

-- ============================================================
-- 2. FIXED ASSETS
-- ============================================================

CREATE TABLE public.fixed_asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  default_useful_life_months INTEGER,
  default_depreciation_method TEXT NOT NULL DEFAULT 'straight_line'
    CHECK (default_depreciation_method IN ('straight_line','declining_balance','units_of_production','none')),
  asset_account_id UUID REFERENCES public.accounts(id),
  accumulated_depreciation_account_id UUID REFERENCES public.accounts(id),
  depreciation_expense_account_id UUID REFERENCES public.accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fixed_asset_categories TO authenticated;
GRANT ALL ON public.fixed_asset_categories TO service_role;
ALTER TABLE public.fixed_asset_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read fixed_asset_categories" ON public.fixed_asset_categories
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write fixed_asset_categories" ON public.fixed_asset_categories
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_fa_cat_updated_at BEFORE UPDATE ON public.fixed_asset_categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.fixed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.fixed_asset_categories(id) ON DELETE SET NULL,
  acquisition_date DATE NOT NULL,
  in_service_date DATE,
  disposal_date DATE,
  acquisition_cost NUMERIC(18,2) NOT NULL,
  salvage_value NUMERIC(18,2) NOT NULL DEFAULT 0,
  useful_life_months INTEGER,
  depreciation_method TEXT NOT NULL DEFAULT 'straight_line'
    CHECK (depreciation_method IN ('straight_line','declining_balance','units_of_production','none')),
  accumulated_depreciation NUMERIC(18,2) NOT NULL DEFAULT 0,
  book_value NUMERIC(18,2) GENERATED ALWAYS AS (acquisition_cost - accumulated_depreciation) STORED,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','disposed','impaired','pending')),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, asset_number)
);
CREATE INDEX idx_fa_org_status ON public.fixed_assets(org_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fixed_assets TO authenticated;
GRANT ALL ON public.fixed_assets TO service_role;
ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read fixed_assets" ON public.fixed_assets
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write fixed_assets" ON public.fixed_assets
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_fa_updated_at BEFORE UPDATE ON public.fixed_assets
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.fixed_asset_depreciation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.fixed_assets(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  depreciation_amount NUMERIC(18,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','posted','skipped')),
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  posted_at TIMESTAMPTZ,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, asset_id, period_start)
);
CREATE INDEX idx_fad_asset ON public.fixed_asset_depreciation(org_id, asset_id, period_start);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fixed_asset_depreciation TO authenticated;
GRANT ALL ON public.fixed_asset_depreciation TO service_role;
ALTER TABLE public.fixed_asset_depreciation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read fixed_asset_depreciation" ON public.fixed_asset_depreciation
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write fixed_asset_depreciation" ON public.fixed_asset_depreciation
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_fad_updated_at BEFORE UPDATE ON public.fixed_asset_depreciation
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 3. TAX FRAMEWORK (framework only — no calculation logic)
-- ============================================================

CREATE TABLE public.tax_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  region TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tax_jurisdictions TO authenticated;
GRANT ALL ON public.tax_jurisdictions TO service_role;
ALTER TABLE public.tax_jurisdictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read tax_jurisdictions" ON public.tax_jurisdictions
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write tax_jurisdictions" ON public.tax_jurisdictions
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_tj_updated_at BEFORE UPDATE ON public.tax_jurisdictions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.tax_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'sales'
    CHECK (kind IN ('sales','use','vat','gst','withholding','payroll','excise','other')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tax_categories TO authenticated;
GRANT ALL ON public.tax_categories TO service_role;
ALTER TABLE public.tax_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read tax_categories" ON public.tax_categories
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write tax_categories" ON public.tax_categories
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_tc_updated_at BEFORE UPDATE ON public.tax_categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  jurisdiction_id UUID NOT NULL REFERENCES public.tax_jurisdictions(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.tax_categories(id) ON DELETE CASCADE,
  rate NUMERIC(9,6) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  liability_account_id UUID REFERENCES public.accounts(id),
  expense_account_id UUID REFERENCES public.accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, jurisdiction_id, category_id, effective_from)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tax_rates TO authenticated;
GRANT ALL ON public.tax_rates TO service_role;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read tax_rates" ON public.tax_rates
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write tax_rates" ON public.tax_rates
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_tr_updated_at BEFORE UPDATE ON public.tax_rates
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.tax_liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  jurisdiction_id UUID NOT NULL REFERENCES public.tax_jurisdictions(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.tax_categories(id) ON DELETE RESTRICT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  taxable_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','filed','paid','void')),
  filed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tl_org_period ON public.tax_liabilities(org_id, period_start);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tax_liabilities TO authenticated;
GRANT ALL ON public.tax_liabilities TO service_role;
ALTER TABLE public.tax_liabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read tax_liabilities" ON public.tax_liabilities
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write tax_liabilities" ON public.tax_liabilities
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_tl_updated_at BEFORE UPDATE ON public.tax_liabilities
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 4. MULTI-ENTITY FOUNDATION
-- ============================================================

CREATE TABLE public.legal_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'llc'
    CHECK (entity_type IN ('llc','corporation','partnership','sole_proprietor','nonprofit','branch','division','other')),
  parent_entity_id UUID REFERENCES public.legal_entities(id) ON DELETE SET NULL,
  country TEXT,
  tax_id TEXT,
  functional_currency TEXT NOT NULL DEFAULT 'USD',
  is_consolidated BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  intercompany_ar_account_id UUID REFERENCES public.accounts(id),
  intercompany_ap_account_id UUID REFERENCES public.accounts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_entities TO authenticated;
GRANT ALL ON public.legal_entities TO service_role;
ALTER TABLE public.legal_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read legal_entities" ON public.legal_entities
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write legal_entities" ON public.legal_entities
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_le_updated_at BEFORE UPDATE ON public.legal_entities
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.intercompany_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  from_entity_id UUID NOT NULL REFERENCES public.legal_entities(id) ON DELETE RESTRICT,
  to_entity_id UUID NOT NULL REFERENCES public.legal_entities(id) ON DELETE RESTRICT,
  txn_date DATE NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','posted','settled','void')),
  from_journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  to_journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  settled_at TIMESTAMPTZ,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_entity_id <> to_entity_id)
);
CREATE INDEX idx_ic_org ON public.intercompany_transactions(org_id, txn_date DESC);
CREATE INDEX idx_ic_pair ON public.intercompany_transactions(org_id, from_entity_id, to_entity_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.intercompany_transactions TO authenticated;
GRANT ALL ON public.intercompany_transactions TO service_role;
ALTER TABLE public.intercompany_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read intercompany_transactions" ON public.intercompany_transactions
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write intercompany_transactions" ON public.intercompany_transactions
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_ic_updated_at BEFORE UPDATE ON public.intercompany_transactions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 5. ACCOUNTING INTELLIGENCE (advisory only)
-- ============================================================

CREATE TABLE public.accounting_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  persona TEXT NOT NULL DEFAULT 'controller'
    CHECK (persona IN ('controller','close_assistant','accountant_assistant')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  why TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.5
    CHECK (confidence >= 0 AND confidence <= 1),
  recommended_action TEXT,
  advisory_only BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','acknowledged','dismissed','resolved')),
  related_object_type TEXT,
  related_object_id UUID,
  period_start DATE,
  period_end DATE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_insights_org_status ON public.accounting_insights(org_id, status, created_at DESC);
CREATE INDEX idx_insights_persona ON public.accounting_insights(org_id, persona);
GRANT SELECT, UPDATE ON public.accounting_insights TO authenticated;
GRANT ALL ON public.accounting_insights TO service_role;
ALTER TABLE public.accounting_insights ENABLE ROW LEVEL SECURITY;
-- Read: org members. Update: only acknowledge/dismiss status transitions (open ledger controls unaffected).
CREATE POLICY "org members read accounting_insights" ON public.accounting_insights
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members update accounting_insights" ON public.accounting_insights
  FOR UPDATE TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
-- Insertion is intentionally service-role only. Advisory rows are generated
-- by scheduled server processes, never by end users through the app.
CREATE TRIGGER trg_insight_updated_at BEFORE UPDATE ON public.accounting_insights
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Immutable core: insights MUST remain advisory. Prevent any UPDATE that
-- toggles advisory_only, alters the narrative/evidence, or attempts to link
-- to a journal action. Only status transitions and acknowledgement are permitted.
CREATE OR REPLACE FUNCTION public.tg_insights_advisory_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.advisory_only IS DISTINCT FROM OLD.advisory_only
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.what_happened IS DISTINCT FROM OLD.what_happened
     OR NEW.why IS DISTINCT FROM OLD.why
     OR NEW.evidence::text IS DISTINCT FROM OLD.evidence::text
     OR NEW.confidence IS DISTINCT FROM OLD.confidence
     OR NEW.recommended_action IS DISTINCT FROM OLD.recommended_action
     OR NEW.persona IS DISTINCT FROM OLD.persona
     OR NEW.category IS DISTINCT FROM OLD.category
     OR NEW.related_object_type IS DISTINCT FROM OLD.related_object_type
     OR NEW.related_object_id IS DISTINCT FROM OLD.related_object_id
  THEN
    RAISE EXCEPTION 'accounting_insights are immutable except for status/acknowledgement fields';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_insight_advisory_guard
  BEFORE UPDATE ON public.accounting_insights
  FOR EACH ROW EXECUTE FUNCTION public.tg_insights_advisory_guard();
