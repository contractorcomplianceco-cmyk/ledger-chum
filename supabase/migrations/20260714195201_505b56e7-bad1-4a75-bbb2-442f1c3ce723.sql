
-- ============================================================
-- M6: Financial Event Engine
-- ============================================================

-- ---------- financial_events ---------------------------------
CREATE TABLE public.financial_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.integration_sources(id) ON DELETE SET NULL,
  source_system TEXT NOT NULL,
  external_event_type TEXT NOT NULL,
  external_id TEXT,
  idempotency_key TEXT NOT NULL,
  correlation_id TEXT,
  ledger_object TEXT,
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received','validated','mapped','pending_approval','approved','materialized','rejected','error')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  mapping_id UUID REFERENCES public.integration_event_mappings(id) ON DELETE SET NULL,
  matched_rule_id UUID,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  materialized_target_type TEXT,
  materialized_target_id UUID,
  validation_errors JSONB,
  error TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, idempotency_key)
);
CREATE INDEX idx_financial_events_org_status ON public.financial_events(org_id, status);
CREATE INDEX idx_financial_events_org_created ON public.financial_events(org_id, created_at DESC);
CREATE INDEX idx_financial_events_source ON public.financial_events(source_id);
CREATE INDEX idx_financial_events_external ON public.financial_events(org_id, source_system, external_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_events TO authenticated;
GRANT ALL ON public.financial_events TO service_role;
ALTER TABLE public.financial_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read financial_events"
  ON public.financial_events FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));
CREATE POLICY "org members write financial_events"
  ON public.financial_events FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TRIGGER trg_financial_events_updated_at
  BEFORE UPDATE ON public.financial_events
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- financial_event_rules ----------------------------
CREATE TABLE public.financial_event_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_financial_event_rules_org_priority
  ON public.financial_event_rules(org_id, priority) WHERE active = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_event_rules TO authenticated;
GRANT ALL ON public.financial_event_rules TO service_role;
ALTER TABLE public.financial_event_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read financial_event_rules"
  ON public.financial_event_rules FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));
CREATE POLICY "org members write financial_event_rules"
  ON public.financial_event_rules FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TRIGGER trg_financial_event_rules_updated_at
  BEFORE UPDATE ON public.financial_event_rules
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- financial_event_approvals ------------------------
CREATE TABLE public.financial_event_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.financial_events(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES auth.users(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_financial_event_approvals_event ON public.financial_event_approvals(event_id);

GRANT SELECT, INSERT ON public.financial_event_approvals TO authenticated;
GRANT ALL ON public.financial_event_approvals TO service_role;
ALTER TABLE public.financial_event_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read financial_event_approvals"
  ON public.financial_event_approvals FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));
CREATE POLICY "org members insert financial_event_approvals"
  ON public.financial_event_approvals FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id));

-- ---------- ingest_financial_event ---------------------------
-- Idempotent event ingestion. Called by the public integration route
-- through the service-role client. Does NOT create journal entries.
CREATE OR REPLACE FUNCTION public.ingest_financial_event(
  _org_id UUID,
  _source_id UUID,
  _source_system TEXT,
  _external_event_type TEXT,
  _external_id TEXT,
  _idempotency_key TEXT,
  _correlation_id TEXT,
  _payload JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing RECORD;
  _new_id UUID;
  _mapping RECORD;
  _rule RECORD;
  _requires_approval BOOLEAN := true;
  _status TEXT := 'received';
BEGIN
  -- Duplicate?
  SELECT id, status INTO _existing
    FROM public.financial_events
   WHERE org_id = _org_id AND idempotency_key = _idempotency_key;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'event_id', _existing.id,
      'status', _existing.status,
      'duplicate', true
    );
  END IF;

  -- Look up mapping (source + external event type)
  SELECT * INTO _mapping
    FROM public.integration_event_mappings
   WHERE org_id = _org_id
     AND source_id = _source_id
     AND external_event_type = _external_event_type
     AND active = true
   LIMIT 1;

  IF FOUND THEN
    _status := 'mapped';
  ELSE
    _status := 'validated';
  END IF;

  -- Evaluate rules (highest priority first). Rules can toggle approval.
  FOR _rule IN
    SELECT * FROM public.financial_event_rules
     WHERE org_id = _org_id AND active = true
       AND (
         (conditions->>'source_system' IS NULL OR conditions->>'source_system' = _source_system)
         AND (conditions->>'external_event_type' IS NULL OR conditions->>'external_event_type' = _external_event_type)
         AND (conditions->>'ledger_object' IS NULL OR conditions->>'ledger_object' = _mapping.ledger_object)
       )
     ORDER BY priority ASC
  LOOP
    IF _rule.actions ? 'auto_approve' AND (_rule.actions->>'auto_approve')::boolean THEN
      _requires_approval := false;
    END IF;
    IF _rule.actions ? 'require_approval' AND (_rule.actions->>'require_approval')::boolean THEN
      _requires_approval := true;
    END IF;
    EXIT; -- match highest-priority rule only
  END LOOP;

  IF _status = 'mapped' AND _requires_approval THEN
    _status := 'pending_approval';
  END IF;

  INSERT INTO public.financial_events(
    org_id, source_id, source_system, external_event_type, external_id,
    idempotency_key, correlation_id, ledger_object, status, payload,
    mapping_id, matched_rule_id, requires_approval
  ) VALUES (
    _org_id, _source_id, _source_system, _external_event_type, _external_id,
    _idempotency_key, _correlation_id, _mapping.ledger_object, _status, _payload,
    _mapping.id, _rule.id, _requires_approval
  ) RETURNING id INTO _new_id;

  INSERT INTO public.audit_events(
    org_id, actor_type, actor_id, event_type, action,
    target_type, target_id, after, source, correlation_id
  ) VALUES (
    _org_id, 'integration', COALESCE(_source_system,'unknown'),
    'financial_event.ingested', 'received',
    'financial_event', _new_id::text,
    jsonb_build_object(
      'event_id', _new_id, 'status', _status,
      'external_event_type', _external_event_type,
      'ledger_object', _mapping.ledger_object,
      'requires_approval', _requires_approval
    ),
    _source_system, _correlation_id
  );

  RETURN jsonb_build_object(
    'event_id', _new_id,
    'status', _status,
    'requires_approval', _requires_approval,
    'duplicate', false
  );
END $$;

-- ---------- approve_financial_event --------------------------
CREATE OR REPLACE FUNCTION public.approve_financial_event(
  _org_id UUID, _event_id UUID, _note TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _evt RECORD;
BEGIN
  IF NOT (public.has_role(auth.uid(), _org_id, 'owner')
       OR public.has_role(auth.uid(), _org_id, 'accounting_lead')) THEN
    RAISE EXCEPTION 'Only owner or accounting_lead may approve financial events';
  END IF;

  SELECT * INTO _evt FROM public.financial_events
   WHERE id = _event_id AND org_id = _org_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event % not found', _event_id; END IF;
  IF _evt.status NOT IN ('pending_approval','mapped','validated') THEN
    RAISE EXCEPTION 'Event % is in status % — cannot approve', _event_id, _evt.status;
  END IF;

  UPDATE public.financial_events
     SET status = 'approved', approved_by = auth.uid(), approved_at = now()
   WHERE id = _event_id;

  INSERT INTO public.financial_event_approvals(org_id, event_id, approver_id, decision, note)
    VALUES (_org_id, _event_id, auth.uid(), 'approved', _note);

  INSERT INTO public.audit_events(
    org_id, actor_type, actor_id, event_type, action,
    target_type, target_id, after, source, correlation_id
  ) VALUES (
    _org_id, 'user', COALESCE(auth.uid()::text,'system'),
    'financial_event.approved', 'approved',
    'financial_event', _event_id::text,
    jsonb_build_object('event_id', _event_id, 'note', _note),
    'ledgeros.ui', _evt.correlation_id
  );

  RETURN jsonb_build_object('event_id', _event_id, 'status', 'approved');
END $$;

-- ---------- reject_financial_event ---------------------------
CREATE OR REPLACE FUNCTION public.reject_financial_event(
  _org_id UUID, _event_id UUID, _reason TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _evt RECORD;
BEGIN
  IF NOT (public.has_role(auth.uid(), _org_id, 'owner')
       OR public.has_role(auth.uid(), _org_id, 'accounting_lead')) THEN
    RAISE EXCEPTION 'Only owner or accounting_lead may reject financial events';
  END IF;

  SELECT * INTO _evt FROM public.financial_events
   WHERE id = _event_id AND org_id = _org_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event % not found', _event_id; END IF;
  IF _evt.status IN ('materialized','rejected') THEN
    RAISE EXCEPTION 'Event % is % — cannot reject', _event_id, _evt.status;
  END IF;

  UPDATE public.financial_events
     SET status = 'rejected', rejected_by = auth.uid(), rejected_at = now(), error = _reason
   WHERE id = _event_id;

  INSERT INTO public.financial_event_approvals(org_id, event_id, approver_id, decision, note)
    VALUES (_org_id, _event_id, auth.uid(), 'rejected', _reason);

  INSERT INTO public.audit_events(
    org_id, actor_type, actor_id, event_type, action,
    target_type, target_id, after, source, correlation_id
  ) VALUES (
    _org_id, 'user', COALESCE(auth.uid()::text,'system'),
    'financial_event.rejected', 'rejected',
    'financial_event', _event_id::text,
    jsonb_build_object('event_id', _event_id, 'reason', _reason),
    'ledgeros.ui', _evt.correlation_id
  );

  RETURN jsonb_build_object('event_id', _event_id, 'status', 'rejected');
END $$;
