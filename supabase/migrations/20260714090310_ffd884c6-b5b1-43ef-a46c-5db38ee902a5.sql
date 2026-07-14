
-- =========================================================================
-- M2: AR expansion + AP foundation, dimensions & source-lineage framework
-- =========================================================================

-- 1. Dimensions on journal_lines (all nullable, indexed)
ALTER TABLE public.journal_lines
  ADD COLUMN IF NOT EXISTS department_id uuid,
  ADD COLUMN IF NOT EXISTS location_id   uuid,
  ADD COLUMN IF NOT EXISTS project_id    uuid,
  ADD COLUMN IF NOT EXISTS customer_id   uuid,
  ADD COLUMN IF NOT EXISTS vendor_id     uuid,
  ADD COLUMN IF NOT EXISTS service_id    uuid,
  ADD COLUMN IF NOT EXISTS product_id    uuid,
  ADD COLUMN IF NOT EXISTS entity_id     uuid;

CREATE INDEX IF NOT EXISTS idx_jl_department ON public.journal_lines(department_id) WHERE department_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jl_location   ON public.journal_lines(location_id)   WHERE location_id   IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jl_project    ON public.journal_lines(project_id)    WHERE project_id    IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jl_customer   ON public.journal_lines(customer_id)   WHERE customer_id   IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jl_vendor     ON public.journal_lines(vendor_id)     WHERE vendor_id     IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jl_service    ON public.journal_lines(service_id)    WHERE service_id    IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jl_product    ON public.journal_lines(product_id)    WHERE product_id    IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jl_entity     ON public.journal_lines(entity_id)     WHERE entity_id     IS NOT NULL;

-- 2. Source-lineage framework on journal_entries
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS source_system  text,
  ADD COLUMN IF NOT EXISTS source_ref     text,
  ADD COLUMN IF NOT EXISTS ledger_impact  jsonb,
  ADD COLUMN IF NOT EXISTS external_id    text;

CREATE INDEX IF NOT EXISTS idx_je_source_lineage
  ON public.journal_entries(org_id, source_system, external_id)
  WHERE external_id IS NOT NULL;

-- =========================================================================
-- 3. AP core tables
-- =========================================================================

-- vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_source text,
  external_id text,
  name text NOT NULL,
  email text,
  phone text,
  address jsonb,
  terms_days integer NOT NULL DEFAULT 30,
  default_expense_account_id uuid REFERENCES public.accounts(id),
  memo text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, external_source, external_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_org_read"  ON public.vendors FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));
CREATE POLICY "vendors_org_write" ON public.vendors FOR ALL TO authenticated
  USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));

CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- bills
CREATE TABLE IF NOT EXISTS public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  bill_number text NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','open','partial','paid','void')),
  subtotal numeric(18,2) NOT NULL DEFAULT 0,
  tax numeric(18,2) NOT NULL DEFAULT 0,
  total numeric(18,2) NOT NULL DEFAULT 0,
  balance numeric(18,2) NOT NULL DEFAULT 0,
  memo text,
  external_source text,
  external_id text,
  source_system text,
  source_ref text,
  posted_journal_id uuid REFERENCES public.journal_entries(id),
  posted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, external_source, external_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bills TO authenticated;
GRANT ALL ON public.bills TO service_role;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bills_org_read"  ON public.bills FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));
CREATE POLICY "bills_org_write" ON public.bills FOR ALL TO authenticated
  USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));

CREATE INDEX IF NOT EXISTS idx_bills_vendor ON public.bills(org_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills(org_id, status);
CREATE TRIGGER trg_bills_updated_at BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- bill_lines
CREATE TABLE IF NOT EXISTS public.bill_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  line_order integer NOT NULL DEFAULT 0,
  description text,
  quantity numeric(18,4) NOT NULL DEFAULT 1,
  unit_price numeric(18,4) NOT NULL DEFAULT 0,
  amount numeric(18,2) NOT NULL DEFAULT 0,
  account_id uuid NOT NULL REFERENCES public.accounts(id),
  department_id uuid,
  location_id uuid,
  project_id uuid,
  service_id uuid,
  product_id uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bill_lines TO authenticated;
GRANT ALL ON public.bill_lines TO service_role;
ALTER TABLE public.bill_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bill_lines_org_all" ON public.bill_lines FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bills b WHERE b.id = bill_lines.bill_id AND public.is_org_member(b.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.bills b WHERE b.id = bill_lines.bill_id AND public.is_org_member(b.org_id)));

-- bill_payments
CREATE TABLE IF NOT EXISTS public.bill_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  payment_date date NOT NULL,
  method text,
  reference text,
  amount numeric(18,2) NOT NULL CHECK (amount > 0),
  unapplied_amount numeric(18,2) NOT NULL DEFAULT 0,
  memo text,
  external_source text,
  external_id text,
  source_system text,
  source_ref text,
  posted_journal_id uuid REFERENCES public.journal_entries(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, external_source, external_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bill_payments TO authenticated;
GRANT ALL ON public.bill_payments TO service_role;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bill_payments_org_read"  ON public.bill_payments FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));
CREATE POLICY "bill_payments_org_write" ON public.bill_payments FOR ALL TO authenticated
  USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));

CREATE TRIGGER trg_bill_payments_updated_at BEFORE UPDATE ON public.bill_payments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- bill_payment_applications
CREATE TABLE IF NOT EXISTS public.bill_payment_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_payment_id uuid NOT NULL REFERENCES public.bill_payments(id) ON DELETE CASCADE,
  bill_id uuid NOT NULL REFERENCES public.bills(id) ON DELETE RESTRICT,
  amount_applied numeric(18,2) NOT NULL CHECK (amount_applied > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bill_payment_applications TO authenticated;
GRANT ALL ON public.bill_payment_applications TO service_role;
ALTER TABLE public.bill_payment_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bill_pay_app_org_all" ON public.bill_payment_applications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bill_payments p WHERE p.id = bill_payment_applications.bill_payment_id AND public.is_org_member(p.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.bill_payments p WHERE p.id = bill_payment_applications.bill_payment_id AND public.is_org_member(p.org_id)));

CREATE INDEX IF NOT EXISTS idx_bpa_bill ON public.bill_payment_applications(bill_id);

-- =========================================================================
-- 4. RPCs
-- =========================================================================

CREATE OR REPLACE FUNCTION public.post_bill_with_posting(
  _org_id uuid,
  _vendor_id uuid,
  _bill_number text,
  _issue_date date,
  _due_date date,
  _memo text,
  _lines jsonb,             -- [{account_id, description, quantity, unit_price, amount, department_id?, location_id?, project_id?, service_id?, product_id?}]
  _tax numeric,
  _external_source text,
  _external_id text,
  _source_system text,
  _source_ref text,
  _correlation_id text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _bill_id uuid;
  _je_id uuid;
  _ap uuid;
  _subtotal numeric(18,2) := 0;
  _total numeric(18,2);
  _line jsonb;
  _idx int := 0;
BEGIN
  IF NOT public.is_org_member(_org_id) THEN
    RAISE EXCEPTION 'Not authorized for org %', _org_id;
  END IF;
  IF NOT public.is_period_open(_org_id, _issue_date) THEN
    RAISE EXCEPTION 'Bill date % is not within an open fiscal period', _issue_date;
  END IF;
  IF jsonb_typeof(_lines) <> 'array' OR jsonb_array_length(_lines) = 0 THEN
    RAISE EXCEPTION 'Bill requires at least one line';
  END IF;

  SELECT COALESCE(SUM((l->>'amount')::numeric), 0)
    INTO _subtotal FROM jsonb_array_elements(_lines) l;
  _total := ROUND(_subtotal + COALESCE(_tax, 0), 2);
  IF _total <= 0 THEN
    RAISE EXCEPTION 'Bill total must be positive';
  END IF;

  -- AP account
  SELECT id INTO _ap FROM public.accounts
   WHERE org_id = _org_id AND type = 'liability' AND is_active
     AND name ILIKE '%payable%'
   ORDER BY code LIMIT 1;
  IF _ap IS NULL THEN
    RAISE EXCEPTION 'No Accounts Payable account configured for org %', _org_id;
  END IF;

  INSERT INTO public.bills
    (org_id, vendor_id, bill_number, issue_date, due_date, status,
     subtotal, tax, total, balance, memo,
     external_source, external_id, source_system, source_ref)
  VALUES
    (_org_id, _vendor_id, _bill_number, _issue_date, _due_date, 'open',
     _subtotal, COALESCE(_tax,0), _total, _total, _memo,
     _external_source, _external_id, COALESCE(_source_system,'ledgeros.manual'), _source_ref)
  RETURNING id INTO _bill_id;

  FOR _line IN SELECT value FROM jsonb_array_elements(_lines) LOOP
    INSERT INTO public.bill_lines
      (bill_id, line_order, description, quantity, unit_price, amount, account_id,
       department_id, location_id, project_id, service_id, product_id)
    VALUES
      (_bill_id, _idx,
       NULLIF(_line->>'description',''),
       COALESCE((_line->>'quantity')::numeric, 1),
       COALESCE((_line->>'unit_price')::numeric, 0),
       COALESCE((_line->>'amount')::numeric, 0),
       (_line->>'account_id')::uuid,
       NULLIF(_line->>'department_id','')::uuid,
       NULLIF(_line->>'location_id','')::uuid,
       NULLIF(_line->>'project_id','')::uuid,
       NULLIF(_line->>'service_id','')::uuid,
       NULLIF(_line->>'product_id','')::uuid);
    _idx := _idx + 1;
  END LOOP;

  INSERT INTO public.journal_entries
    (org_id, entry_date, memo, source_type, source_id, status,
     source_system, source_ref, external_id, correlation_id)
  VALUES
    (_org_id, _issue_date,
     'Bill ' || _bill_number,
     'bill', _bill_id, 'draft',
     COALESCE(_source_system,'ledgeros.manual'), _source_ref,
     _external_id, _correlation_id)
  RETURNING id INTO _je_id;

  -- DR each line's expense account
  _idx := 0;
  FOR _line IN SELECT value FROM jsonb_array_elements(_lines) LOOP
    INSERT INTO public.journal_lines
      (journal_id, account_id, debit, credit, memo, line_order,
       vendor_id, department_id, location_id, project_id, service_id, product_id)
    VALUES
      (_je_id, (_line->>'account_id')::uuid,
       COALESCE((_line->>'amount')::numeric, 0), 0,
       NULLIF(_line->>'description',''), _idx,
       _vendor_id,
       NULLIF(_line->>'department_id','')::uuid,
       NULLIF(_line->>'location_id','')::uuid,
       NULLIF(_line->>'project_id','')::uuid,
       NULLIF(_line->>'service_id','')::uuid,
       NULLIF(_line->>'product_id','')::uuid);
    _idx := _idx + 1;
  END LOOP;

  -- Tax to AP as well (kept simple for M2; tax accounts arrive in M4)
  -- CR AP for full total
  INSERT INTO public.journal_lines
    (journal_id, account_id, debit, credit, memo, line_order, vendor_id)
  VALUES
    (_je_id, _ap, 0, _total, 'AP ' || _bill_number, _idx, _vendor_id);

  UPDATE public.journal_entries
     SET status = 'posted', posted_at = now(),
         ledger_impact = jsonb_build_object(
           'bill_id', _bill_id, 'total', _total,
           'ap_account_id', _ap, 'line_count', jsonb_array_length(_lines))
   WHERE id = _je_id;

  UPDATE public.bills
     SET posted_journal_id = _je_id, posted_at = now()
   WHERE id = _bill_id;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source, correlation_id)
  VALUES
    (_org_id, 'user', COALESCE(auth.uid()::text,'system'),
     'bill.posted', 'posted',
     'bill', _bill_id::text,
     jsonb_build_object(
       'bill_id', _bill_id, 'journal_id', _je_id,
       'total', _total, 'ap_account_id', _ap, 'vendor_id', _vendor_id),
     COALESCE(_source_system,'ledgeros.manual'), _correlation_id);

  RETURN jsonb_build_object(
    'bill_id', _bill_id,
    'journal_id', _je_id,
    'total', _total
  );
END $$;

CREATE OR REPLACE FUNCTION public.record_vendor_payment_with_posting(
  _org_id uuid,
  _vendor_id uuid,
  _payment_date date,
  _method text,
  _reference text,
  _amount numeric,
  _memo text,
  _apply_to jsonb,          -- [{bill_id, amount}]
  _external_source text,
  _external_id text,
  _source_system text,
  _source_ref text,
  _correlation_id text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _pay_id uuid;
  _je_id uuid;
  _ap uuid;
  _cash uuid;
  _apply_total numeric(18,2) := 0;
  _unapplied numeric(18,2);
  _app jsonb;
  _bill_id uuid;
  _amt numeric(18,2);
  _bill_balance numeric(18,2);
  _bill_total numeric(18,2);
  _new_balance numeric(18,2);
  _new_status text;
  _apps jsonb := '[]'::jsonb;
BEGIN
  IF NOT public.is_org_member(_org_id) THEN
    RAISE EXCEPTION 'Not authorized for org %', _org_id;
  END IF;
  IF NOT public.is_period_open(_org_id, _payment_date) THEN
    RAISE EXCEPTION 'Payment date % is not within an open fiscal period', _payment_date;
  END IF;
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;

  SELECT id INTO _ap FROM public.accounts
   WHERE org_id = _org_id AND type = 'liability' AND is_active
     AND name ILIKE '%payable%'
   ORDER BY code LIMIT 1;
  IF _ap IS NULL THEN RAISE EXCEPTION 'No Accounts Payable account configured'; END IF;

  SELECT account_id INTO _cash FROM public.payment_account_mappings
   WHERE org_id = _org_id AND method = COALESCE(_method,'default');
  IF _cash IS NULL THEN
    SELECT account_id INTO _cash FROM public.payment_account_mappings
      WHERE org_id = _org_id AND method = 'default';
  END IF;
  IF _cash IS NULL THEN
    SELECT id INTO _cash FROM public.accounts
     WHERE org_id = _org_id AND type = 'asset' AND is_active
       AND (name ILIKE '%bank%' OR name ILIKE '%cash%')
     ORDER BY code LIMIT 1;
  END IF;
  IF _cash IS NULL THEN RAISE EXCEPTION 'No cash/bank account mapping for method %', COALESCE(_method,'(none)'); END IF;

  IF _apply_to IS NOT NULL AND jsonb_typeof(_apply_to) = 'array' THEN
    SELECT COALESCE(SUM((e->>'amount')::numeric), 0)
      INTO _apply_total FROM jsonb_array_elements(_apply_to) e;
  END IF;
  IF _apply_total > _amount + 0.005 THEN
    RAISE EXCEPTION 'apply_to sum % exceeds payment amount %', _apply_total, _amount;
  END IF;
  _unapplied := ROUND(_amount - _apply_total, 2);

  INSERT INTO public.bill_payments
    (org_id, vendor_id, payment_date, method, reference, amount,
     unapplied_amount, memo, external_source, external_id,
     source_system, source_ref)
  VALUES
    (_org_id, _vendor_id, _payment_date, _method, _reference, _amount,
     _unapplied, _memo, _external_source, _external_id,
     COALESCE(_source_system,'ledgeros.manual'), _source_ref)
  RETURNING id INTO _pay_id;

  IF _apply_to IS NOT NULL AND jsonb_typeof(_apply_to) = 'array' THEN
    FOR _app IN SELECT value FROM jsonb_array_elements(_apply_to) LOOP
      _bill_id := (_app->>'bill_id')::uuid;
      _amt := (_app->>'amount')::numeric;
      SELECT balance, total INTO _bill_balance, _bill_total
        FROM public.bills WHERE id = _bill_id AND org_id = _org_id FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Bill % not found', _bill_id; END IF;
      IF _amt > _bill_balance + 0.005 THEN
        RAISE EXCEPTION 'Application % exceeds bill balance %', _amt, _bill_balance;
      END IF;

      INSERT INTO public.bill_payment_applications (bill_payment_id, bill_id, amount_applied)
        VALUES (_pay_id, _bill_id, _amt);

      _new_balance := ROUND(_bill_balance - _amt, 2);
      IF _new_balance = 0 THEN _new_status := 'paid';
      ELSIF _new_balance < _bill_total THEN _new_status := 'partial';
      ELSE _new_status := 'open';
      END IF;

      UPDATE public.bills
         SET balance = _new_balance, status = _new_status, updated_at = now()
       WHERE id = _bill_id;

      _apps := _apps || jsonb_build_object(
        'bill_id', _bill_id, 'amount_applied', _amt,
        'new_balance', _new_balance, 'new_status', _new_status);
    END LOOP;
  END IF;

  INSERT INTO public.journal_entries
    (org_id, entry_date, memo, source_type, source_id, status,
     source_system, source_ref, external_id, correlation_id)
  VALUES
    (_org_id, _payment_date,
     'Vendor payment ' || COALESCE(NULLIF(_reference,''), _pay_id::text),
     'vendor_payment', _pay_id, 'draft',
     COALESCE(_source_system,'ledgeros.manual'), _source_ref,
     _external_id, _correlation_id)
  RETURNING id INTO _je_id;

  -- DR AP for amount, CR Cash for amount (balanced regardless of allocations)
  INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order, vendor_id)
    VALUES (_je_id, _ap, _amount, 0, 'AP settlement', 0, _vendor_id);
  INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order, vendor_id)
    VALUES (_je_id, _cash, 0, _amount, 'Cash disbursement', 1, _vendor_id);

  UPDATE public.journal_entries
     SET status = 'posted', posted_at = now(),
         ledger_impact = jsonb_build_object(
           'bill_payment_id', _pay_id, 'amount', _amount,
           'unapplied_amount', _unapplied, 'ap_account_id', _ap,
           'cash_account_id', _cash, 'applications', _apps)
   WHERE id = _je_id;

  UPDATE public.bill_payments SET posted_journal_id = _je_id WHERE id = _pay_id;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source, correlation_id)
  VALUES
    (_org_id, 'user', COALESCE(auth.uid()::text,'system'),
     'vendor_payment.recorded', 'posted',
     'bill_payment', _pay_id::text,
     jsonb_build_object(
       'bill_payment_id', _pay_id, 'journal_id', _je_id,
       'amount', _amount, 'unapplied_amount', _unapplied,
       'ap_account_id', _ap, 'cash_account_id', _cash,
       'applications', _apps),
     COALESCE(_source_system,'ledgeros.manual'), _correlation_id);

  RETURN jsonb_build_object(
    'bill_payment_id', _pay_id,
    'journal_id', _je_id,
    'unapplied_amount', _unapplied,
    'applications', _apps
  );
END $$;
