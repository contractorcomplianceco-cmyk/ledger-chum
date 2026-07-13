
-- ---------- Payment account mappings ----------
CREATE TABLE IF NOT EXISTS public.payment_account_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, method)
);

CREATE INDEX IF NOT EXISTS payment_account_mappings_org_idx
  ON public.payment_account_mappings (org_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_account_mappings TO authenticated;
GRANT ALL ON public.payment_account_mappings TO service_role;
ALTER TABLE public.payment_account_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read payment account mappings"
  ON public.payment_account_mappings FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "leads write payment account mappings"
  ON public.payment_account_mappings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'))
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'));

DROP TRIGGER IF EXISTS payment_account_mappings_set_updated_at ON public.payment_account_mappings;
CREATE TRIGGER payment_account_mappings_set_updated_at
  BEFORE UPDATE ON public.payment_account_mappings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- Prevent duplicate journals per source ----------
CREATE UNIQUE INDEX IF NOT EXISTS journal_entries_unique_active_source
  ON public.journal_entries (org_id, source_type, source_id)
  WHERE source_id IS NOT NULL AND status <> 'void';

-- ---------- Posted journal immutability ----------
CREATE OR REPLACE FUNCTION public.tg_journal_entry_immutable()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'posted' THEN
      RAISE EXCEPTION 'Cannot delete posted journal entry %; create a reversing entry instead', OLD.id;
    END IF;
    RETURN OLD;
  END IF;

  -- UPDATE: allow posting (draft -> posted) and voiding (posted -> void).
  -- Block any other change once posted.
  IF OLD.status = 'posted' AND NEW.status = 'posted' THEN
    IF NEW.org_id       IS DISTINCT FROM OLD.org_id
    OR NEW.entry_date   IS DISTINCT FROM OLD.entry_date
    OR NEW.memo         IS DISTINCT FROM OLD.memo
    OR NEW.source_type  IS DISTINCT FROM OLD.source_type
    OR NEW.source_id    IS DISTINCT FROM OLD.source_id THEN
      RAISE EXCEPTION 'Cannot modify posted journal entry %; use void + reversal', OLD.id;
    END IF;
  END IF;

  IF OLD.status = 'posted' AND NEW.status NOT IN ('posted','void') THEN
    RAISE EXCEPTION 'Posted journal entry % may only transition to void', OLD.id;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS journal_entries_immutable ON public.journal_entries;
CREATE TRIGGER journal_entries_immutable
  BEFORE UPDATE OR DELETE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.tg_journal_entry_immutable();

CREATE OR REPLACE FUNCTION public.tg_journal_lines_immutable()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _status TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT status INTO _status FROM public.journal_entries WHERE id = OLD.journal_id;
    IF _status = 'posted' THEN
      RAISE EXCEPTION 'Cannot delete lines of posted journal %', OLD.journal_id;
    END IF;
    RETURN OLD;
  END IF;

  SELECT status INTO _status FROM public.journal_entries WHERE id = NEW.journal_id;
  IF _status = 'posted' AND (
    TG_OP = 'INSERT' OR (
      TG_OP = 'UPDATE' AND (
        NEW.account_id IS DISTINCT FROM OLD.account_id
        OR NEW.debit      IS DISTINCT FROM OLD.debit
        OR NEW.credit     IS DISTINCT FROM OLD.credit
        OR NEW.memo       IS DISTINCT FROM OLD.memo
        OR NEW.line_order IS DISTINCT FROM OLD.line_order
      )
    )
  ) THEN
    RAISE EXCEPTION 'Cannot modify lines of posted journal %', NEW.journal_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS journal_lines_immutable ON public.journal_lines;
CREATE TRIGGER journal_lines_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON public.journal_lines
  FOR EACH ROW EXECUTE FUNCTION public.tg_journal_lines_immutable();

-- ---------- record_payment_with_posting ----------
CREATE OR REPLACE FUNCTION public.record_payment_with_posting(
  _org_id UUID,
  _customer_id UUID,
  _external_source TEXT,
  _external_id TEXT,
  _payment_date DATE,
  _method TEXT,
  _reference TEXT,
  _amount NUMERIC,
  _memo TEXT,
  _apply_to JSONB,
  _actor_type TEXT,
  _actor_id TEXT,
  _correlation_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _pay_id UUID;
  _je_id UUID;
  _ar UUID;
  _cash UUID;
  _apply_total NUMERIC(18,2) := 0;
  _unapplied NUMERIC(18,2);
  _app JSONB;
  _inv_id UUID;
  _amt NUMERIC(18,2);
  _inv_balance NUMERIC(18,2);
  _inv_total NUMERIC(18,2);
  _new_balance NUMERIC(18,2);
  _new_status TEXT;
  _apps JSONB := '[]'::jsonb;
BEGIN
  IF NOT public.is_period_open(_org_id, _payment_date) THEN
    RAISE EXCEPTION 'Payment date % is not within an open fiscal period', _payment_date;
  END IF;

  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;

  -- AR account
  SELECT id INTO _ar FROM public.accounts
   WHERE org_id = _org_id AND type = 'asset' AND is_active
     AND name ILIKE '%receivable%'
   ORDER BY code LIMIT 1;
  IF _ar IS NULL THEN
    RAISE EXCEPTION 'No Accounts Receivable account configured for org %', _org_id;
  END IF;

  -- Cash / clearing account resolution
  SELECT account_id INTO _cash FROM public.payment_account_mappings
    WHERE org_id = _org_id AND method = COALESCE(_method, 'default');
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
  IF _cash IS NULL THEN
    RAISE EXCEPTION 'No cash/bank account mapping for method %', COALESCE(_method,'(none)');
  END IF;

  -- Apply total
  IF _apply_to IS NOT NULL AND jsonb_typeof(_apply_to) = 'array' THEN
    SELECT COALESCE(SUM((e->>'amount')::numeric), 0)
      INTO _apply_total
      FROM jsonb_array_elements(_apply_to) e;
  END IF;

  IF _apply_total > _amount + 0.005 THEN
    RAISE EXCEPTION 'apply_to sum % exceeds payment amount %', _apply_total, _amount;
  END IF;
  _unapplied := ROUND(_amount - _apply_total, 2);

  -- Insert payment (unique (org_id, external_source, external_id) protects against duplicate)
  INSERT INTO public.payments
    (org_id, customer_id, external_source, external_id, payment_date,
     method, reference, amount, unapplied_amount, memo)
  VALUES
    (_org_id, _customer_id, _external_source, _external_id, _payment_date,
     _method, _reference, _amount, _unapplied, _memo)
  RETURNING id INTO _pay_id;

  -- Applications
  IF _apply_to IS NOT NULL AND jsonb_typeof(_apply_to) = 'array' THEN
    FOR _app IN SELECT value FROM jsonb_array_elements(_apply_to) LOOP
      _inv_id := (_app->>'invoice_id')::uuid;
      _amt := (_app->>'amount')::numeric;

      SELECT balance, total INTO _inv_balance, _inv_total
        FROM public.invoices
        WHERE id = _inv_id AND org_id = _org_id FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice % not found in org', _inv_id;
      END IF;
      IF _amt > _inv_balance + 0.005 THEN
        RAISE EXCEPTION 'Application % exceeds invoice balance %', _amt, _inv_balance;
      END IF;

      INSERT INTO public.payment_applications (payment_id, invoice_id, amount_applied)
        VALUES (_pay_id, _inv_id, _amt);

      _new_balance := ROUND(_inv_balance - _amt, 2);
      IF _new_balance = 0 THEN _new_status := 'paid';
      ELSIF _new_balance < _inv_total THEN _new_status := 'partial';
      ELSE _new_status := 'sent';
      END IF;

      UPDATE public.invoices
        SET balance = _new_balance, status = _new_status, updated_at = now()
        WHERE id = _inv_id;

      _apps := _apps || jsonb_build_object(
        'invoice_id', _inv_id, 'amount_applied', _amt,
        'new_balance', _new_balance, 'new_status', _new_status
      );
    END LOOP;
  END IF;

  -- Journal: DR Cash / CR AR for full payment amount
  INSERT INTO public.journal_entries
    (org_id, entry_date, memo, source_type, source_id, status, correlation_id)
  VALUES
    (_org_id, _payment_date,
     'Payment ' || COALESCE(NULLIF(_reference,''), _external_id),
     'payment', _pay_id, 'draft', _correlation_id)
  RETURNING id INTO _je_id;

  INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order)
    VALUES (_je_id, _cash, _amount, 0, 'Cash receipt', 0);
  INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order)
    VALUES (_je_id, _ar, 0, _amount, 'AR settlement', 1);

  UPDATE public.journal_entries
    SET status = 'posted', posted_at = now()
    WHERE id = _je_id;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source, correlation_id)
  VALUES
    (_org_id, _actor_type, _actor_id, 'payment.recorded', 'posted',
     'payment', _pay_id::text,
     jsonb_build_object(
       'payment_id', _pay_id, 'journal_id', _je_id,
       'amount', _amount, 'unapplied_amount', _unapplied,
       'cash_account_id', _cash, 'ar_account_id', _ar,
       'applications', _apps
     ),
     _external_source, _correlation_id);

  RETURN jsonb_build_object(
    'payment_id', _pay_id,
    'journal_id', _je_id,
    'unapplied_amount', _unapplied,
    'applications', _apps
  );
END $$;

REVOKE ALL ON FUNCTION public.record_payment_with_posting(
  UUID, UUID, TEXT, TEXT, DATE, TEXT, TEXT, NUMERIC, TEXT, JSONB, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_payment_with_posting(
  UUID, UUID, TEXT, TEXT, DATE, TEXT, TEXT, NUMERIC, TEXT, JSONB, TEXT, TEXT, TEXT
) TO service_role;

-- ---------- record_refund_with_posting (structure only) ----------
CREATE OR REPLACE FUNCTION public.record_refund_with_posting(
  _org_id UUID,
  _payment_id UUID,
  _refund_date DATE,
  _amount NUMERIC,
  _method TEXT,
  _memo TEXT,
  _actor_type TEXT,
  _actor_id TEXT,
  _correlation_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _refund_id UUID;
  _je_id UUID;
  _ar UUID;
  _cash UUID;
  _pay RECORD;
BEGIN
  IF NOT public.is_period_open(_org_id, _refund_date) THEN
    RAISE EXCEPTION 'Refund date % is not within an open fiscal period', _refund_date;
  END IF;
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Refund amount must be positive';
  END IF;

  SELECT * INTO _pay FROM public.payments
    WHERE id = _payment_id AND org_id = _org_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment % not found in org', _payment_id;
  END IF;

  SELECT id INTO _ar FROM public.accounts
    WHERE org_id = _org_id AND type = 'asset' AND is_active
      AND name ILIKE '%receivable%'
    ORDER BY code LIMIT 1;
  IF _ar IS NULL THEN
    RAISE EXCEPTION 'No Accounts Receivable account configured for org %', _org_id;
  END IF;

  SELECT account_id INTO _cash FROM public.payment_account_mappings
    WHERE org_id = _org_id AND method = COALESCE(_method, _pay.method, 'default');
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
  IF _cash IS NULL THEN
    RAISE EXCEPTION 'No cash/bank account mapping resolved for refund';
  END IF;

  INSERT INTO public.refunds (org_id, payment_id, refund_date, amount, method, memo)
    VALUES (_org_id, _payment_id, _refund_date, _amount, _method, _memo)
    RETURNING id INTO _refund_id;

  INSERT INTO public.journal_entries
    (org_id, entry_date, memo, source_type, source_id, status, correlation_id)
  VALUES
    (_org_id, _refund_date, 'Refund of payment ' || _payment_id::text,
     'refund', _refund_id, 'draft', _correlation_id)
  RETURNING id INTO _je_id;

  -- DR AR / CR Cash (reverses the AR reduction from the original payment)
  INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order)
    VALUES (_je_id, _ar, _amount, 0, 'Refund reversal', 0);
  INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order)
    VALUES (_je_id, _cash, 0, _amount, 'Cash out', 1);

  UPDATE public.journal_entries SET status = 'posted', posted_at = now() WHERE id = _je_id;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source, correlation_id)
  VALUES
    (_org_id, _actor_type, _actor_id, 'refund.recorded', 'posted',
     'refund', _refund_id::text,
     jsonb_build_object('refund_id', _refund_id, 'payment_id', _payment_id,
       'journal_id', _je_id, 'amount', _amount),
     'ledgeros.system', _correlation_id);

  RETURN jsonb_build_object('refund_id', _refund_id, 'journal_id', _je_id);
END $$;

REVOKE ALL ON FUNCTION public.record_refund_with_posting(
  UUID, UUID, DATE, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_refund_with_posting(
  UUID, UUID, DATE, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT
) TO service_role;
