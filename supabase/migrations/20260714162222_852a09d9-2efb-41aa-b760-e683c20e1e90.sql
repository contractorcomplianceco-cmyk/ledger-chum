
-- ============================================================
-- LedgerOS · Phase 5 · M4: Close + Settings + Accounting Controls
-- ============================================================

CREATE TABLE IF NOT EXISTS public.close_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  fiscal_period_id UUID NOT NULL REFERENCES public.fiscal_periods(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress','pending_approval','completed','reopened','cancelled')),
  started_by UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_by UUID,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (fiscal_period_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.close_runs TO authenticated;
GRANT ALL ON public.close_runs TO service_role;
ALTER TABLE public.close_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read close_runs"
  ON public.close_runs FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "leads write close_runs"
  ON public.close_runs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'))
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'));

DROP TRIGGER IF EXISTS close_runs_set_updated_at ON public.close_runs;
CREATE TRIGGER close_runs_set_updated_at
  BEFORE UPDATE ON public.close_runs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.close_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  close_run_id UUID NOT NULL REFERENCES public.close_runs(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general','reconciliation','ar','ap','banking','review','approval')),
  required BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','done','skipped','blocked')),
  completed_by UUID,
  completed_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (close_run_id, task_key)
);

CREATE INDEX IF NOT EXISTS close_tasks_run_idx ON public.close_tasks (close_run_id, order_index);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.close_tasks TO authenticated;
GRANT ALL ON public.close_tasks TO service_role;
ALTER TABLE public.close_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read close_tasks"
  ON public.close_tasks FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "members update close_tasks"
  ON public.close_tasks FOR UPDATE TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE POLICY "leads insert close_tasks"
  ON public.close_tasks FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'));

CREATE POLICY "leads delete close_tasks"
  ON public.close_tasks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'));

DROP TRIGGER IF EXISTS close_tasks_set_updated_at ON public.close_tasks;
CREATE TRIGGER close_tasks_set_updated_at
  BEFORE UPDATE ON public.close_tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.close_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  close_run_id UUID NOT NULL REFERENCES public.close_runs(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.close_approvals TO authenticated;
GRANT ALL ON public.close_approvals TO service_role;
ALTER TABLE public.close_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read close_approvals"
  ON public.close_approvals FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "leads approve close"
  ON public.close_approvals FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), org_id, 'owner')
      OR public.has_role(auth.uid(), org_id, 'accounting_lead'));

CREATE OR REPLACE FUNCTION public.seed_default_close_tasks(_org UUID, _run UUID)
RETURNS VOID LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  INSERT INTO public.close_tasks (org_id, close_run_id, task_key, title, category, order_index, required) VALUES
    (_org, _run, 'bank_recon',       'Reconcile all bank accounts',            'reconciliation', 10, true),
    (_org, _run, 'ar_review',        'Review AR aging & outstanding invoices', 'ar',             20, true),
    (_org, _run, 'ap_review',        'Review AP aging & unpaid bills',         'ap',             30, true),
    (_org, _run, 'unposted_journals','Post or void all draft journals',        'general',        40, true),
    (_org, _run, 'trial_balance',    'Confirm Trial Balance is balanced',      'review',         50, true),
    (_org, _run, 'variance_review',  'Review P&L and Balance Sheet variances', 'review',         60, false),
    (_org, _run, 'accrual_review',   'Post accruals, prepaids, deferrals',     'general',        70, false),
    (_org, _run, 'lead_approval',    'Accounting lead approval',               'approval',       80, true),
    (_org, _run, 'lock_period',      'Lock fiscal period',                     'approval',       90, true)
  ON CONFLICT (close_run_id, task_key) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.start_period_close(_org_id UUID, _period_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _run_id UUID; _period RECORD;
BEGIN
  IF NOT (public.has_role(auth.uid(), _org_id, 'owner')
       OR public.has_role(auth.uid(), _org_id, 'accounting_lead')) THEN
    RAISE EXCEPTION 'Only owner or accounting_lead may start a close';
  END IF;

  SELECT * INTO _period FROM public.fiscal_periods
    WHERE id = _period_id AND org_id = _org_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Period % not found', _period_id; END IF;
  IF _period.status NOT IN ('open','pending_close') THEN
    RAISE EXCEPTION 'Cannot start close for period in status %', _period.status;
  END IF;

  SELECT id INTO _run_id FROM public.close_runs
    WHERE fiscal_period_id = _period_id AND status IN ('in_progress','pending_approval');
  IF _run_id IS NOT NULL THEN
    RETURN jsonb_build_object('close_run_id', _run_id, 'existing', true);
  END IF;

  INSERT INTO public.close_runs (org_id, fiscal_period_id, started_by)
    VALUES (_org_id, _period_id, auth.uid())
    RETURNING id INTO _run_id;

  PERFORM public.seed_default_close_tasks(_org_id, _run_id);

  UPDATE public.fiscal_periods SET status = 'pending_close' WHERE id = _period_id;

  INSERT INTO public.audit_events (org_id, actor_type, actor_id, event_type, action,
    target_type, target_id, after, source)
  VALUES (_org_id, 'user', COALESCE(auth.uid()::text,'system'),
    'close.started', 'started', 'close_run', _run_id::text,
    jsonb_build_object('period_id', _period_id, 'close_run_id', _run_id),
    'ledgeros.close');

  RETURN jsonb_build_object('close_run_id', _run_id, 'existing', false);
END $$;

CREATE OR REPLACE FUNCTION public.set_close_task_status(_task_id UUID, _status TEXT, _note TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _t RECORD;
BEGIN
  SELECT * INTO _t FROM public.close_tasks WHERE id = _task_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Task % not found', _task_id; END IF;
  IF NOT public.is_org_member(_t.org_id) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF _status NOT IN ('pending','in_progress','done','skipped','blocked') THEN
    RAISE EXCEPTION 'Invalid task status %', _status;
  END IF;

  UPDATE public.close_tasks
    SET status = _status,
        note = COALESCE(_note, note),
        completed_by = CASE WHEN _status = 'done' THEN auth.uid() ELSE completed_by END,
        completed_at = CASE WHEN _status = 'done' THEN now() ELSE completed_at END
    WHERE id = _task_id;

  INSERT INTO public.audit_events (org_id, actor_type, actor_id, event_type, action,
    target_type, target_id, after, source)
  VALUES (_t.org_id, 'user', COALESCE(auth.uid()::text,'system'),
    'close.task.' || _status, _status, 'close_task', _task_id::text,
    jsonb_build_object('task_key', _t.task_key, 'status', _status, 'note', _note),
    'ledgeros.close');

  RETURN jsonb_build_object('task_id', _task_id, 'status', _status);
END $$;

CREATE OR REPLACE FUNCTION public.approve_period_close(_close_run_id UUID, _note TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _run RECORD; _open_required INT; _tb_debit NUMERIC; _tb_credit NUMERIC;
BEGIN
  SELECT * INTO _run FROM public.close_runs WHERE id = _close_run_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Close run % not found', _close_run_id; END IF;

  IF NOT (public.has_role(auth.uid(), _run.org_id, 'owner')
       OR public.has_role(auth.uid(), _run.org_id, 'accounting_lead')) THEN
    RAISE EXCEPTION 'Only owner or accounting_lead may approve close';
  END IF;

  IF _run.status NOT IN ('in_progress','pending_approval') THEN
    RAISE EXCEPTION 'Close run status is %', _run.status;
  END IF;

  SELECT COUNT(*) INTO _open_required FROM public.close_tasks
    WHERE close_run_id = _close_run_id AND required = true AND status NOT IN ('done','skipped');
  IF _open_required > 0 THEN
    RAISE EXCEPTION 'Cannot approve close: % required tasks still open', _open_required;
  END IF;

  SELECT COALESCE(SUM(jl.debit),0), COALESCE(SUM(jl.credit),0)
    INTO _tb_debit, _tb_credit
    FROM public.journal_lines jl
    JOIN public.journal_entries je ON je.id = jl.journal_id
   WHERE je.org_id = _run.org_id AND je.status = 'posted';
  IF ROUND(_tb_debit,2) <> ROUND(_tb_credit,2) THEN
    RAISE EXCEPTION 'Trial balance unbalanced: debit=% credit=%', _tb_debit, _tb_credit;
  END IF;

  INSERT INTO public.close_approvals (org_id, close_run_id, approver_id, decision, note)
    VALUES (_run.org_id, _close_run_id, auth.uid(), 'approved', _note);

  UPDATE public.close_runs
    SET status = 'completed', completed_by = auth.uid(), completed_at = now(), notes = _note
    WHERE id = _close_run_id;

  UPDATE public.fiscal_periods
    SET status = 'closed', closed_by = auth.uid(), closed_at = now()
    WHERE id = _run.fiscal_period_id;

  INSERT INTO public.audit_events (org_id, actor_type, actor_id, event_type, action,
    target_type, target_id, after, source)
  VALUES (_run.org_id, 'user', COALESCE(auth.uid()::text,'system'),
    'close.approved', 'approved', 'close_run', _close_run_id::text,
    jsonb_build_object('period_id', _run.fiscal_period_id, 'close_run_id', _close_run_id),
    'ledgeros.close');

  RETURN jsonb_build_object('close_run_id', _close_run_id, 'period_id', _run.fiscal_period_id, 'status', 'completed');
END $$;

CREATE OR REPLACE FUNCTION public.reopen_period(_org_id UUID, _period_id UUID, _reason TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _period RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), _org_id, 'owner') THEN
    RAISE EXCEPTION 'Only owner may reopen a closed period';
  END IF;

  SELECT * INTO _period FROM public.fiscal_periods
    WHERE id = _period_id AND org_id = _org_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Period % not found', _period_id; END IF;
  IF _period.status = 'locked' THEN RAISE EXCEPTION 'Locked periods cannot be reopened'; END IF;
  IF _period.status NOT IN ('closed','pending_close') THEN
    RAISE EXCEPTION 'Period is not closed (status=%)', _period.status;
  END IF;

  UPDATE public.fiscal_periods
    SET status = 'open', closed_by = NULL, closed_at = NULL
    WHERE id = _period_id;

  UPDATE public.close_runs
    SET status = 'reopened'
    WHERE fiscal_period_id = _period_id AND status = 'completed';

  INSERT INTO public.audit_events (org_id, actor_type, actor_id, event_type, action,
    target_type, target_id, after, source)
  VALUES (_org_id, 'user', COALESCE(auth.uid()::text,'system'),
    'period.reopened', 'reopened', 'fiscal_period', _period_id::text,
    jsonb_build_object('period_id', _period_id, 'reason', _reason),
    'ledgeros.close');

  RETURN jsonb_build_object('period_id', _period_id, 'status', 'open');
END $$;

CREATE OR REPLACE VIEW public.v_control_exceptions AS
SELECT
  je.org_id,
  'draft_journal'::text AS category,
  je.id::text AS ref_id,
  'Draft journal: ' || COALESCE(je.memo, je.id::text) AS message,
  je.entry_date AS occurred_on,
  'warning'::text AS severity
FROM public.journal_entries je
WHERE je.status = 'draft'
UNION ALL
SELECT
  bt.org_id,
  'unmatched_bank_txn'::text,
  bt.id::text,
  'Unmatched bank txn ' || COALESCE(bt.description, bt.id::text) || ' (' || bt.amount::text || ')',
  bt.txn_date,
  CASE WHEN bt.txn_date < CURRENT_DATE - INTERVAL '30 days' THEN 'critical' ELSE 'warning' END
FROM public.bank_transactions bt
WHERE bt.status = 'unmatched' AND bt.txn_date < CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT
  i.org_id,
  'past_due_invoice'::text,
  i.id::text,
  'Past-due invoice ' || i.invoice_number || ' balance ' || i.balance::text,
  i.due_date,
  CASE WHEN i.due_date < CURRENT_DATE - INTERVAL '60 days' THEN 'critical' ELSE 'warning' END
FROM public.invoices i
WHERE i.status IN ('sent','partial')
  AND i.balance > 0
  AND i.due_date IS NOT NULL
  AND i.due_date < CURRENT_DATE
UNION ALL
SELECT
  b.org_id,
  'past_due_bill'::text,
  b.id::text,
  'Past-due bill ' || COALESCE(b.bill_number, b.id::text) || ' balance ' || b.balance::text,
  b.due_date,
  CASE WHEN b.due_date < CURRENT_DATE - INTERVAL '60 days' THEN 'critical' ELSE 'warning' END
FROM public.bills b
WHERE b.status IN ('open','partial')
  AND b.balance > 0
  AND b.due_date IS NOT NULL
  AND b.due_date < CURRENT_DATE;

ALTER VIEW public.v_control_exceptions SET (security_invoker = true);
GRANT SELECT ON public.v_control_exceptions TO authenticated, service_role;
