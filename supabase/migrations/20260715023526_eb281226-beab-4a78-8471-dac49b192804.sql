-- ============================================================
-- M7: Financial Event Materialization Engine
-- ============================================================

CREATE TABLE public.financial_event_materializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.financial_events(id) ON DELETE CASCADE,
  materialization_type TEXT NOT NULL,
  target_object_type TEXT,
  target_object_id UUID,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed','requires_review','cancelled')),
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  audit_event_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_fem_event_active
  ON public.financial_event_materializations(event_id)
  WHERE status IN ('pending','processing','completed');
CREATE INDEX idx_fem_org_status
  ON public.financial_event_materializations(org_id, status);
CREATE INDEX idx_fem_org_created
  ON public.financial_event_materializations(org_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.financial_event_materializations TO authenticated;
GRANT ALL ON public.financial_event_materializations TO service_role;
ALTER TABLE public.financial_event_materializations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read materializations"
  ON public.financial_event_materializations FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));
CREATE POLICY "org members write materializations"
  ON public.financial_event_materializations FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TRIGGER trg_fem_updated_at
  BEFORE UPDATE ON public.financial_event_materializations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- financial_account_mappings -----------------------
CREATE TABLE public.financial_account_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_source_id UUID REFERENCES public.integration_sources(id) ON DELETE CASCADE,
  external_type TEXT NOT NULL,
  external_value TEXT NOT NULL,
  ledger_object_type TEXT,
  ledger_account_id UUID REFERENCES public.accounts(id),
  effective_date DATE NOT NULL DEFAULT current_date,
  expiration_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, integration_source_id, external_type, external_value, effective_date)
);
CREATE INDEX idx_fam_org_lookup
  ON public.financial_account_mappings(org_id, external_type, external_value)
  WHERE status = 'active';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_account_mappings TO authenticated;
GRANT ALL ON public.financial_account_mappings TO service_role;
ALTER TABLE public.financial_account_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read account mappings"
  ON public.financial_account_mappings FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));
CREATE POLICY "org members write account mappings"
  ON public.financial_account_mappings FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TRIGGER trg_fam_updated_at
  BEFORE UPDATE ON public.financial_account_mappings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- materialize_financial_event
-- ============================================================
CREATE OR REPLACE FUNCTION public.materialize_financial_event(
  _org_id UUID,
  _event_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _evt         public.financial_events%ROWTYPE;
  _existing    public.financial_event_materializations%ROWTYPE;
  _mat_id      UUID;
  _target_type TEXT;
  _target_id   UUID;
  _payload     JSONB;
  _customer_id UUID;
  _ext_source  TEXT;
  _ext_id      TEXT;
  _amount      NUMERIC(18,2);
  _line        JSONB;
  _line_idx    INT := 0;
  _error_code  TEXT;
  _error_msg   TEXT;
BEGIN
  IF NOT (public.has_role(auth.uid(), _org_id, 'owner')
       OR public.has_role(auth.uid(), _org_id, 'accounting_lead')) THEN
    RAISE EXCEPTION 'Only owner or accounting_lead may materialize financial events';
  END IF;

  SELECT * INTO _evt FROM public.financial_events
   WHERE id = _event_id AND org_id = _org_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event % not found', _event_id; END IF;

  IF _evt.status <> 'approved' AND _evt.status <> 'materialized' THEN
    RAISE EXCEPTION 'Event % status=% — must be approved before materialization',
      _event_id, _evt.status;
  END IF;

  SELECT * INTO _existing
    FROM public.financial_event_materializations
   WHERE event_id = _event_id AND status IN ('completed','processing');
  IF FOUND AND _existing.status = 'completed' THEN
    RETURN jsonb_build_object(
      'materialization_id', _existing.id,
      'event_id', _event_id,
      'status', _existing.status,
      'target_object_type', _existing.target_object_type,
      'target_object_id', _existing.target_object_id,
      'duplicate', true
    );
  END IF;

  _payload    := COALESCE(_evt.payload, '{}'::jsonb);
  _ext_source := _evt.source_system;
  _ext_id     := _evt.external_id;

  INSERT INTO public.financial_event_materializations(
    org_id, event_id, materialization_type, status, created_by
  ) VALUES (
    _org_id, _event_id, COALESCE(_evt.ledger_object,'unknown'),
    'processing', auth.uid()
  )
  RETURNING id INTO _mat_id;

  BEGIN
    IF _evt.ledger_object = 'customer' THEN
      _target_type := 'customer';
      INSERT INTO public.customers(
        org_id, external_source, external_id, name, email, phone, billing_address
      ) VALUES (
        _org_id, _ext_source, _ext_id,
        COALESCE(_payload->>'name', 'Unnamed Customer'),
        _payload->>'email',
        _payload->>'phone',
        _payload->'billing_address'
      )
      ON CONFLICT (org_id, external_source, external_id)
      DO UPDATE SET name = EXCLUDED.name, updated_at = now()
      RETURNING id INTO _target_id;

    ELSIF _evt.ledger_object = 'invoice' THEN
      _target_type := 'invoice';

      _customer_id := NULLIF(_payload->>'customer_id','')::uuid;
      IF _customer_id IS NULL AND _payload ? 'customer_external_id' THEN
        SELECT id INTO _customer_id FROM public.customers
         WHERE org_id = _org_id
           AND external_source = _ext_source
           AND external_id = _payload->>'customer_external_id';
      END IF;

      IF _customer_id IS NULL THEN
        _error_code := 'MISSING_CUSTOMER';
        _error_msg  := 'No matching customer for event; create customer event first or provide customer_id.';
        RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE=_error_msg;
      END IF;

      _amount := COALESCE((_payload->>'total')::numeric, 0);

      INSERT INTO public.invoices(
        org_id, customer_id, external_source, external_id,
        invoice_number, issue_date, due_date, status,
        subtotal, tax, total, balance, work_order_ref, memo
      ) VALUES (
        _org_id, _customer_id, _ext_source, _ext_id,
        COALESCE(_payload->>'invoice_number', 'INV-' || substr(_event_id::text, 1, 8)),
        COALESCE((_payload->>'issue_date')::date, current_date),
        (_payload->>'due_date')::date,
        'draft',
        COALESCE((_payload->>'subtotal')::numeric, _amount),
        COALESCE((_payload->>'tax')::numeric, 0),
        _amount,
        _amount,
        _payload->>'work_order_ref',
        _payload->>'memo'
      )
      ON CONFLICT (org_id, external_source, external_id)
      DO UPDATE SET updated_at = now()
      RETURNING id INTO _target_id;

      IF NOT EXISTS (SELECT 1 FROM public.invoice_lines WHERE invoice_id = _target_id) THEN
        FOR _line IN SELECT * FROM jsonb_array_elements(COALESCE(_payload->'lines','[]'::jsonb))
        LOOP
          INSERT INTO public.invoice_lines(
            invoice_id, description, quantity, unit_price, tax_rate, amount, line_order
          ) VALUES (
            _target_id,
            COALESCE(_line->>'description', 'Line'),
            COALESCE((_line->>'quantity')::numeric, 1),
            COALESCE((_line->>'unit_price')::numeric, 0),
            COALESCE((_line->>'tax_rate')::numeric, 0),
            COALESCE((_line->>'amount')::numeric,
              COALESCE((_line->>'quantity')::numeric,1) *
              COALESCE((_line->>'unit_price')::numeric,0)),
            _line_idx
          );
          _line_idx := _line_idx + 1;
        END LOOP;
      END IF;

    ELSIF _evt.ledger_object = 'payment' THEN
      _target_type := 'payment';
      _customer_id := NULLIF(_payload->>'customer_id','')::uuid;
      IF _customer_id IS NULL AND _payload ? 'customer_external_id' THEN
        SELECT id INTO _customer_id FROM public.customers
         WHERE org_id = _org_id
           AND external_source = _ext_source
           AND external_id = _payload->>'customer_external_id';
      END IF;
      IF _customer_id IS NULL THEN
        _error_code := 'MISSING_CUSTOMER';
        _error_msg  := 'Payment event references unknown customer.';
        RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE=_error_msg;
      END IF;

      _amount := COALESCE((_payload->>'amount')::numeric, 0);
      IF _amount <= 0 THEN
        _error_code := 'INVALID_AMOUNT';
        _error_msg  := 'Payment amount must be greater than zero.';
        RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE=_error_msg;
      END IF;

      INSERT INTO public.payments(
        org_id, customer_id, external_source, external_id,
        payment_date, method, reference, amount, unapplied_amount, memo
      ) VALUES (
        _org_id, _customer_id, _ext_source, _ext_id,
        COALESCE((_payload->>'payment_date')::date, current_date),
        _payload->>'method',
        _payload->>'reference',
        _amount,
        _amount,
        _payload->>'memo'
      )
      ON CONFLICT (org_id, external_source, external_id)
      DO NOTHING
      RETURNING id INTO _target_id;

      IF _target_id IS NULL THEN
        SELECT id INTO _target_id FROM public.payments
         WHERE org_id=_org_id AND external_source=_ext_source AND external_id=_ext_id;
      END IF;

    ELSIF _evt.ledger_object = 'credit' THEN
      _target_type := 'credit';
      _customer_id := NULLIF(_payload->>'customer_id','')::uuid;
      IF _customer_id IS NULL AND _payload ? 'customer_external_id' THEN
        SELECT id INTO _customer_id FROM public.customers
         WHERE org_id = _org_id
           AND external_source = _ext_source
           AND external_id = _payload->>'customer_external_id';
      END IF;
      IF _customer_id IS NULL THEN
        _error_code := 'MISSING_CUSTOMER';
        _error_msg  := 'Credit event references unknown customer.';
        RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE=_error_msg;
      END IF;

      _amount := COALESCE((_payload->>'amount')::numeric, 0);
      INSERT INTO public.credits(
        org_id, customer_id, credit_date, amount, unapplied_amount, memo,
        source_type, source_id
      ) VALUES (
        _org_id, _customer_id,
        COALESCE((_payload->>'credit_date')::date, current_date),
        _amount, _amount,
        _payload->>'memo',
        'financial_event', _event_id
      )
      RETURNING id INTO _target_id;

    ELSE
      _error_code := 'UNSUPPORTED_LEDGER_OBJECT';
      _error_msg  := format('No materializer for ledger_object=%L', _evt.ledger_object);
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE=_error_msg;
    END IF;

    UPDATE public.financial_event_materializations
       SET status = 'completed',
           target_object_type = _target_type,
           target_object_id   = _target_id,
           completed_at       = now()
     WHERE id = _mat_id;

    UPDATE public.financial_events
       SET status = 'materialized',
           materialized_target_type = _target_type,
           materialized_target_id   = _target_id
     WHERE id = _event_id;

    INSERT INTO public.audit_events(
      org_id, actor_type, actor_id, event_type, action,
      target_type, target_id, after, source, correlation_id
    ) VALUES (
      _org_id, 'user', COALESCE(auth.uid()::text,'system'),
      'financial_event.materialized', 'created',
      _target_type, _target_id::text,
      jsonb_build_object(
        'event_id', _event_id,
        'materialization_id', _mat_id,
        'ledger_object', _evt.ledger_object
      ),
      'ledgeros.materializer', _evt.correlation_id
    );

    RETURN jsonb_build_object(
      'materialization_id', _mat_id,
      'event_id', _event_id,
      'status', 'completed',
      'target_object_type', _target_type,
      'target_object_id', _target_id,
      'duplicate', false
    );

  EXCEPTION WHEN OTHERS THEN
    UPDATE public.financial_event_materializations
       SET status = CASE WHEN _error_code IS NOT NULL THEN 'requires_review' ELSE 'failed' END,
           error_code = COALESCE(_error_code, SQLSTATE),
           error_message = COALESCE(_error_msg, SQLERRM),
           retry_count = retry_count + 1
     WHERE id = _mat_id;

    INSERT INTO public.audit_events(
      org_id, actor_type, actor_id, event_type, action,
      target_type, target_id, after, source, correlation_id
    ) VALUES (
      _org_id, 'user', COALESCE(auth.uid()::text,'system'),
      'financial_event.materialization_failed', 'errored',
      'financial_event', _event_id::text,
      jsonb_build_object(
        'error_code', COALESCE(_error_code, SQLSTATE),
        'error_message', COALESCE(_error_msg, SQLERRM),
        'materialization_id', _mat_id
      ),
      'ledgeros.materializer', _evt.correlation_id
    );

    RETURN jsonb_build_object(
      'materialization_id', _mat_id,
      'event_id', _event_id,
      'status', 'failed',
      'error_code', COALESCE(_error_code, SQLSTATE),
      'error_message', COALESCE(_error_msg, SQLERRM)
    );
  END;
END $$;

REVOKE ALL ON FUNCTION public.materialize_financial_event(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.materialize_financial_event(UUID, UUID) TO authenticated;

-- ============================================================
-- retry_materialization
-- ============================================================
CREATE OR REPLACE FUNCTION public.retry_materialization(
  _org_id UUID,
  _event_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), _org_id, 'owner')
       OR public.has_role(auth.uid(), _org_id, 'accounting_lead')) THEN
    RAISE EXCEPTION 'Only owner or accounting_lead may retry materialization';
  END IF;

  UPDATE public.financial_event_materializations
     SET status = 'cancelled', updated_at = now()
   WHERE event_id = _event_id
     AND org_id = _org_id
     AND status IN ('failed','requires_review');

  RETURN public.materialize_financial_event(_org_id, _event_id);
END $$;

REVOKE ALL ON FUNCTION public.retry_materialization(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.retry_materialization(UUID, UUID) TO authenticated;
