-- =========================================================
-- Phase 2B: Integration readiness + account mapping engine
-- =========================================================

-- 1. API client scopes + environment ----------------------
ALTER TABLE public.api_clients
  ADD COLUMN IF NOT EXISTS scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production'
    CHECK (environment IN ('sandbox','production'));

CREATE INDEX IF NOT EXISTS api_clients_scopes_gin
  ON public.api_clients USING gin (scopes);

-- Scope check helper (SECURITY DEFINER so admin flow via supabaseAdmin also works)
CREATE OR REPLACE FUNCTION public.client_has_scope(_client_id UUID, _scope TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.api_clients
     WHERE id = _client_id
       AND active = true
       AND _scope = ANY(scopes)
  )
$$;

-- 2. Account mapping engine -------------------------------
-- Purposes recognized by the ledger:
--   'ar'                — Accounts Receivable
--   'cash_default'      — default cash/bank (redundant with payment_account_mappings.default; kept for engine symmetry)
--   'labor_revenue'     — Labor line revenue
--   'material_revenue'  — Material line revenue
--   'inventory_asset'   — Inventory asset (BS)
--   'material_cogs'     — COGS on consumption
--   'refund_clearing'   — Cash/clearing used for refunds
--   'credit_liability'  — Customer credit liability

CREATE TABLE IF NOT EXISTS public.account_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, purpose)
);

CREATE INDEX IF NOT EXISTS account_mappings_org_idx ON public.account_mappings(org_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_mappings TO authenticated;
GRANT ALL ON public.account_mappings TO service_role;
ALTER TABLE public.account_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners manage account mappings" ON public.account_mappings;
CREATE POLICY "owners manage account mappings" ON public.account_mappings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner'))
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner'));

DROP POLICY IF EXISTS "members read account mappings" ON public.account_mappings;
CREATE POLICY "members read account mappings" ON public.account_mappings
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

DROP TRIGGER IF EXISTS account_mappings_set_updated_at ON public.account_mappings;
CREATE TRIGGER account_mappings_set_updated_at
  BEFORE UPDATE ON public.account_mappings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Resolver: mapping → fallback by heuristic (existing behavior) → NULL
CREATE OR REPLACE FUNCTION public.resolve_account(_org UUID, _purpose TEXT)
RETURNS UUID
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _id UUID;
BEGIN
  SELECT account_id INTO _id
    FROM public.account_mappings
   WHERE org_id = _org AND purpose = _purpose;
  IF _id IS NOT NULL THEN RETURN _id; END IF;

  -- Heuristic fallbacks used before Phase 2B introduced explicit mappings.
  IF _purpose = 'ar' THEN
    SELECT id INTO _id FROM public.accounts
     WHERE org_id = _org AND type = 'asset' AND is_active
       AND name ILIKE '%receivable%' ORDER BY code LIMIT 1;
  ELSIF _purpose IN ('cash_default','refund_clearing') THEN
    SELECT id INTO _id FROM public.accounts
     WHERE org_id = _org AND type = 'asset' AND is_active
       AND (name ILIKE '%bank%' OR name ILIKE '%cash%')
     ORDER BY code LIMIT 1;
  ELSIF _purpose IN ('labor_revenue','material_revenue') THEN
    SELECT id INTO _id FROM public.accounts
     WHERE org_id = _org AND type = 'revenue' AND is_active
     ORDER BY code LIMIT 1;
  ELSIF _purpose = 'inventory_asset' THEN
    SELECT id INTO _id FROM public.accounts
     WHERE org_id = _org AND type = 'asset' AND is_active
       AND name ILIKE '%inventory%' ORDER BY code LIMIT 1;
  ELSIF _purpose = 'material_cogs' THEN
    SELECT id INTO _id FROM public.accounts
     WHERE org_id = _org AND type = 'expense' AND is_active
       AND (name ILIKE '%cogs%' OR name ILIKE '%cost of goods%' OR name ILIKE '%cost of sales%')
     ORDER BY code LIMIT 1;
  ELSIF _purpose = 'credit_liability' THEN
    SELECT id INTO _id FROM public.accounts
     WHERE org_id = _org AND type = 'liability' AND is_active
       AND (name ILIKE '%credit%' OR name ILIKE '%unearned%' OR name ILIKE '%deferred%')
     ORDER BY code LIMIT 1;
  END IF;

  RETURN _id;
END $$;

-- 3. Inventory consumption: link to journal entry ---------
ALTER TABLE public.inventory_consumption
  ADD COLUMN IF NOT EXISTS journal_entry_id UUID
    REFERENCES public.journal_entries(id);

-- 4. Inventory COGS posting RPC ---------------------------
CREATE OR REPLACE FUNCTION public.record_inventory_consumption_with_posting(
  _org_id UUID,
  _external_source TEXT,
  _external_id TEXT,
  _work_order_ref TEXT,
  _item_ref TEXT,
  _item_description TEXT,
  _quantity NUMERIC,
  _unit_cost NUMERIC,
  _consumed_at TIMESTAMPTZ,
  _actor_type TEXT,
  _actor_id TEXT,
  _correlation_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _row_id UUID;
  _je_id UUID;
  _cogs UUID;
  _inv UUID;
  _total NUMERIC(18,2);
  _date DATE;
BEGIN
  IF _quantity <= 0 OR _unit_cost < 0 THEN
    RAISE EXCEPTION 'quantity must be positive and unit_cost non-negative';
  END IF;

  _total := ROUND(_quantity * _unit_cost, 2);
  _date  := COALESCE(_consumed_at, now())::date;

  IF NOT public.is_period_open(_org_id, _date) THEN
    RAISE EXCEPTION 'Consumption date % is not within an open fiscal period', _date;
  END IF;

  _cogs := public.resolve_account(_org_id, 'material_cogs');
  _inv  := public.resolve_account(_org_id, 'inventory_asset');
  IF _cogs IS NULL OR _inv IS NULL THEN
    RAISE EXCEPTION 'Missing account mapping: material_cogs or inventory_asset';
  END IF;

  INSERT INTO public.inventory_consumption
    (org_id, external_source, external_id, work_order_ref, item_ref,
     item_description, quantity, unit_cost, total_cost, consumed_at)
  VALUES
    (_org_id, _external_source, _external_id, _work_order_ref, _item_ref,
     _item_description, _quantity, _unit_cost, _total, COALESCE(_consumed_at, now()))
  RETURNING id INTO _row_id;

  -- Skip zero-value postings.
  IF _total > 0 THEN
    INSERT INTO public.journal_entries
      (org_id, entry_date, memo, source_type, source_id, status, correlation_id)
    VALUES
      (_org_id, _date,
       'Inventory consumption ' || COALESCE(_work_order_ref, _item_ref),
       'inventory_consumption', _row_id, 'draft', _correlation_id)
    RETURNING id INTO _je_id;

    INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order)
      VALUES (_je_id, _cogs, _total, 0, 'COGS ' || _item_ref, 0);
    INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order)
      VALUES (_je_id, _inv, 0, _total, 'Inventory relief ' || _item_ref, 1);

    UPDATE public.journal_entries
       SET status = 'posted', posted_at = now()
     WHERE id = _je_id;

    UPDATE public.inventory_consumption
       SET journal_entry_id = _je_id
     WHERE id = _row_id;
  END IF;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source, correlation_id)
  VALUES
    (_org_id, _actor_type, _actor_id,
     'inventory.consumed', 'posted',
     'inventory_consumption', _row_id::text,
     jsonb_build_object(
       'consumption_id', _row_id,
       'journal_id', _je_id,
       'total_cost', _total,
       'cogs_account_id', _cogs,
       'inventory_account_id', _inv,
       'work_order_ref', _work_order_ref,
       'item_ref', _item_ref
     ),
     COALESCE(_external_source, 'ledgeros.system'), _correlation_id);

  RETURN jsonb_build_object(
    'consumption_id', _row_id,
    'journal_id', _je_id,
    'total_cost', _total
  );
END $$;
