
-- ============================================================
-- M3: Banking + Reporting
-- ============================================================

-- ---------- BANK ACCOUNTS ----------
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  gl_account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  name text NOT NULL,
  bank_name text,
  account_number_last4 text,
  currency text NOT NULL DEFAULT 'USD',
  opening_balance numeric(18,2) NOT NULL DEFAULT 0,
  opening_balance_date date,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org ON public.bank_accounts(org_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_accounts TO authenticated;
GRANT ALL ON public.bank_accounts TO service_role;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read bank_accounts" ON public.bank_accounts
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write bank_accounts" ON public.bank_accounts
  FOR ALL TO authenticated USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TRIGGER tg_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- BANK TRANSACTIONS ----------
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bank_account_id uuid NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  txn_date date NOT NULL,
  posted_date date,
  description text NOT NULL,
  reference text,
  amount numeric(18,2) NOT NULL, -- signed: + deposit, - withdrawal
  balance_after numeric(18,2),
  status text NOT NULL DEFAULT 'unmatched'
    CHECK (status IN ('unmatched','matched','ignored','pending')),
  matched_journal_line_id uuid REFERENCES public.journal_lines(id) ON DELETE SET NULL,
  matched_at timestamptz,
  matched_by uuid,
  external_source text,
  external_id text,
  source_ref text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bank_txn_account_date ON public.bank_transactions(bank_account_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_txn_org_status ON public.bank_transactions(org_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_bank_txn_external
  ON public.bank_transactions(bank_account_id, external_source, external_id)
  WHERE external_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_transactions TO authenticated;
GRANT ALL ON public.bank_transactions TO service_role;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read bank_transactions" ON public.bank_transactions
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write bank_transactions" ON public.bank_transactions
  FOR ALL TO authenticated USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TRIGGER tg_bank_transactions_updated_at BEFORE UPDATE ON public.bank_transactions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- RECONCILIATIONS ----------
CREATE TABLE IF NOT EXISTS public.bank_reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bank_account_id uuid NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  statement_start_date date NOT NULL,
  statement_end_date date NOT NULL,
  statement_ending_balance numeric(18,2) NOT NULL,
  cleared_balance numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress','completed','abandoned')),
  completed_at timestamptz,
  completed_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recon_account ON public.bank_reconciliations(bank_account_id, statement_end_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_reconciliations TO authenticated;
GRANT ALL ON public.bank_reconciliations TO service_role;
ALTER TABLE public.bank_reconciliations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read reconciliations" ON public.bank_reconciliations
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write reconciliations" ON public.bank_reconciliations
  FOR ALL TO authenticated USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TRIGGER tg_reconciliations_updated_at BEFORE UPDATE ON public.bank_reconciliations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.reconciliation_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id uuid NOT NULL REFERENCES public.bank_reconciliations(id) ON DELETE CASCADE,
  bank_transaction_id uuid REFERENCES public.bank_transactions(id) ON DELETE SET NULL,
  journal_line_id uuid REFERENCES public.journal_lines(id) ON DELETE SET NULL,
  cleared boolean NOT NULL DEFAULT true,
  amount numeric(18,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recon_lines_recon ON public.reconciliation_lines(reconciliation_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reconciliation_lines TO authenticated;
GRANT ALL ON public.reconciliation_lines TO service_role;
ALTER TABLE public.reconciliation_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members via recon parent" ON public.reconciliation_lines
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bank_reconciliations r
                  WHERE r.id = reconciliation_id AND public.is_org_member(r.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.bank_reconciliations r
                       WHERE r.id = reconciliation_id AND public.is_org_member(r.org_id)));

-- ---------- MATCH / UNMATCH RPCS ----------
CREATE OR REPLACE FUNCTION public.match_bank_transaction(
  _org_id uuid, _bank_txn_id uuid, _journal_line_id uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _txn RECORD; _jl RECORD; _je_org uuid;
BEGIN
  IF NOT public.is_org_member(_org_id) THEN
    RAISE EXCEPTION 'Not authorized for org %', _org_id;
  END IF;

  SELECT * INTO _txn FROM public.bank_transactions
   WHERE id = _bank_txn_id AND org_id = _org_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bank transaction % not found', _bank_txn_id; END IF;
  IF _txn.status = 'matched' THEN
    RAISE EXCEPTION 'Bank transaction % already matched', _bank_txn_id;
  END IF;

  SELECT jl.*, je.org_id AS je_org, je.status AS je_status
    INTO _jl
    FROM public.journal_lines jl
    JOIN public.journal_entries je ON je.id = jl.journal_id
   WHERE jl.id = _journal_line_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Journal line % not found', _journal_line_id; END IF;
  IF _jl.je_org <> _org_id THEN RAISE EXCEPTION 'Cross-org match rejected'; END IF;
  IF _jl.je_status <> 'posted' THEN RAISE EXCEPTION 'Journal line must belong to a posted entry'; END IF;

  UPDATE public.bank_transactions
     SET status = 'matched',
         matched_journal_line_id = _journal_line_id,
         matched_at = now(),
         matched_by = auth.uid()
   WHERE id = _bank_txn_id;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source)
  VALUES
    (_org_id, 'user', COALESCE(auth.uid()::text,'system'),
     'bank_txn.matched', 'matched',
     'bank_transaction', _bank_txn_id::text,
     jsonb_build_object('bank_txn_id', _bank_txn_id,
                        'journal_line_id', _journal_line_id,
                        'amount', _txn.amount),
     'ledgeros.banking');

  RETURN jsonb_build_object('bank_txn_id', _bank_txn_id, 'journal_line_id', _journal_line_id);
END $$;

CREATE OR REPLACE FUNCTION public.unmatch_bank_transaction(_org_id uuid, _bank_txn_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _prev uuid;
BEGIN
  IF NOT public.is_org_member(_org_id) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT matched_journal_line_id INTO _prev FROM public.bank_transactions
    WHERE id = _bank_txn_id AND org_id = _org_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bank transaction % not found', _bank_txn_id; END IF;

  UPDATE public.bank_transactions
     SET status = 'unmatched', matched_journal_line_id = NULL, matched_at = NULL, matched_by = NULL
   WHERE id = _bank_txn_id;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source)
  VALUES
    (_org_id, 'user', COALESCE(auth.uid()::text,'system'),
     'bank_txn.unmatched', 'unmatched',
     'bank_transaction', _bank_txn_id::text,
     jsonb_build_object('bank_txn_id', _bank_txn_id, 'previous_journal_line_id', _prev),
     'ledgeros.banking');

  RETURN jsonb_build_object('bank_txn_id', _bank_txn_id);
END $$;

-- ---------- COMPLETE RECONCILIATION ----------
CREATE OR REPLACE FUNCTION public.complete_bank_reconciliation(
  _org_id uuid, _reconciliation_id uuid, _statement_ending_balance numeric,
  _cleared_bank_txn_ids uuid[]
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _recon RECORD; _cleared numeric(18,2); _diff numeric(18,2);
BEGIN
  IF NOT public.is_org_member(_org_id) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO _recon FROM public.bank_reconciliations
    WHERE id = _reconciliation_id AND org_id = _org_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reconciliation % not found', _reconciliation_id; END IF;
  IF _recon.status = 'completed' THEN
    RAISE EXCEPTION 'Reconciliation already completed';
  END IF;

  DELETE FROM public.reconciliation_lines WHERE reconciliation_id = _reconciliation_id;

  INSERT INTO public.reconciliation_lines (reconciliation_id, bank_transaction_id, amount, cleared)
    SELECT _reconciliation_id, bt.id, bt.amount, true
      FROM public.bank_transactions bt
     WHERE bt.id = ANY(_cleared_bank_txn_ids)
       AND bt.org_id = _org_id
       AND bt.bank_account_id = _recon.bank_account_id;

  SELECT COALESCE(SUM(amount), 0) INTO _cleared
    FROM public.reconciliation_lines WHERE reconciliation_id = _reconciliation_id;

  _diff := ROUND(_statement_ending_balance - _cleared - COALESCE((
      SELECT opening_balance FROM public.bank_accounts WHERE id = _recon.bank_account_id
    ), 0), 2);

  UPDATE public.bank_reconciliations
     SET statement_ending_balance = _statement_ending_balance,
         cleared_balance = _cleared,
         status = 'completed',
         completed_at = now(),
         completed_by = auth.uid()
   WHERE id = _reconciliation_id;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source)
  VALUES
    (_org_id, 'user', COALESCE(auth.uid()::text,'system'),
     'reconciliation.completed', 'completed',
     'bank_reconciliation', _reconciliation_id::text,
     jsonb_build_object(
       'reconciliation_id', _reconciliation_id,
       'ending_balance', _statement_ending_balance,
       'cleared_balance', _cleared,
       'difference', _diff,
       'cleared_count', array_length(_cleared_bank_txn_ids,1)
     ),
     'ledgeros.banking');

  RETURN jsonb_build_object(
    'reconciliation_id', _reconciliation_id,
    'cleared_balance', _cleared,
    'difference', _diff
  );
END $$;

-- ---------- AP AGING VIEW ----------
CREATE OR REPLACE VIEW public.v_ap_aging
WITH (security_invoker = on) AS
SELECT b.org_id,
       b.vendor_id,
       v.name AS vendor_name,
       b.id   AS bill_id,
       b.bill_number,
       b.issue_date,
       b.due_date,
       b.balance,
       (CURRENT_DATE - b.due_date) AS days_past_due,
       CASE
         WHEN b.due_date IS NULL OR CURRENT_DATE <= b.due_date THEN '0-30'
         WHEN (CURRENT_DATE - b.due_date) <= 30 THEN '0-30'
         WHEN (CURRENT_DATE - b.due_date) <= 60 THEN '31-60'
         WHEN (CURRENT_DATE - b.due_date) <= 90 THEN '61-90'
         ELSE '90+'
       END AS bucket
  FROM public.bills b
  JOIN public.vendors v ON v.id = b.vendor_id
 WHERE b.status IN ('open','partial') AND b.balance > 0;

GRANT SELECT ON public.v_ap_aging TO authenticated;
