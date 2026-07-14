
-- 1. Accounts additions
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- 2. Journal entries additions (reversal linkage + longer description)
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS reversal_of uuid REFERENCES public.journal_entries(id),
  ADD COLUMN IF NOT EXISTS reversed_by uuid REFERENCES public.journal_entries(id),
  ADD COLUMN IF NOT EXISTS description text;

CREATE INDEX IF NOT EXISTS idx_journal_entries_reversal_of ON public.journal_entries(reversal_of);
CREATE INDEX IF NOT EXISTS idx_journal_entries_org_date ON public.journal_entries(org_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON public.journal_lines(account_id);

-- 3. Balance view (posted only)
CREATE OR REPLACE VIEW public.v_account_balances AS
SELECT
  a.id                                    AS account_id,
  a.org_id,
  a.code,
  a.name,
  a.type,
  a.normal_balance,
  a.parent_id,
  a.is_active,
  a.is_system,
  a.sort_order,
  COALESCE(SUM(jl.debit),  0)::numeric(18,2) AS debit_total,
  COALESCE(SUM(jl.credit), 0)::numeric(18,2) AS credit_total,
  CASE WHEN a.normal_balance = 'debit'
       THEN COALESCE(SUM(jl.debit),0) - COALESCE(SUM(jl.credit),0)
       ELSE COALESCE(SUM(jl.credit),0) - COALESCE(SUM(jl.debit),0)
  END::numeric(18,2)                       AS balance
FROM public.accounts a
LEFT JOIN public.journal_lines jl ON jl.account_id = a.id
LEFT JOIN public.journal_entries je ON je.id = jl.journal_id AND je.status = 'posted'
GROUP BY a.id;

GRANT SELECT ON public.v_account_balances TO authenticated, service_role;

-- 4. RPC: post a balanced manual journal in one shot
CREATE OR REPLACE FUNCTION public.post_manual_journal(
  _org_id uuid,
  _entry_date date,
  _memo text,
  _description text,
  _lines jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _je_id uuid;
  _line jsonb;
  _idx int := 0;
  _debit numeric(18,2) := 0;
  _credit numeric(18,2) := 0;
  _count int := 0;
BEGIN
  IF NOT public.is_org_member(_org_id) THEN
    RAISE EXCEPTION 'Not authorized for org %', _org_id;
  END IF;
  IF NOT public.is_period_open(_org_id, _entry_date) THEN
    RAISE EXCEPTION 'Entry date % is not within an open fiscal period', _entry_date;
  END IF;
  IF jsonb_typeof(_lines) <> 'array' THEN
    RAISE EXCEPTION 'Lines payload must be a JSON array';
  END IF;

  SELECT COALESCE(SUM((l->>'debit')::numeric),  0),
         COALESCE(SUM((l->>'credit')::numeric), 0),
         COUNT(*)
    INTO _debit, _credit, _count
    FROM jsonb_array_elements(_lines) l;

  IF _count < 2 THEN
    RAISE EXCEPTION 'Journal requires at least two lines';
  END IF;
  IF _debit <> _credit THEN
    RAISE EXCEPTION 'Journal is unbalanced: debit=% credit=%', _debit, _credit;
  END IF;
  IF _debit = 0 THEN
    RAISE EXCEPTION 'Journal totals cannot be zero';
  END IF;

  INSERT INTO public.journal_entries
    (org_id, entry_date, memo, description, source_type, status)
  VALUES
    (_org_id, _entry_date, _memo, _description, 'manual', 'draft')
  RETURNING id INTO _je_id;

  FOR _line IN SELECT value FROM jsonb_array_elements(_lines) LOOP
    INSERT INTO public.journal_lines
      (journal_id, account_id, debit, credit, memo, line_order)
    VALUES
      (_je_id,
       (_line->>'account_id')::uuid,
       COALESCE((_line->>'debit')::numeric,  0),
       COALESCE((_line->>'credit')::numeric, 0),
       NULLIF(_line->>'memo',''),
       _idx);
    _idx := _idx + 1;
  END LOOP;

  UPDATE public.journal_entries
     SET status = 'posted', posted_at = now(), posted_by = auth.uid()
   WHERE id = _je_id;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source)
  VALUES
    (_org_id, 'user', COALESCE(auth.uid()::text,'system'),
     'journal.posted', 'posted',
     'journal_entry', _je_id::text,
     jsonb_build_object('journal_id', _je_id,
                        'debit_total', _debit,
                        'credit_total', _credit,
                        'entry_date', _entry_date),
     'ledgeros.manual');

  RETURN jsonb_build_object(
    'journal_id', _je_id,
    'debit_total', _debit,
    'credit_total', _credit
  );
END $$;

GRANT EXECUTE ON FUNCTION public.post_manual_journal(uuid,date,text,text,jsonb)
  TO authenticated, service_role;

-- 5. RPC: reverse a posted journal
CREATE OR REPLACE FUNCTION public.reverse_journal(
  _org_id uuid,
  _journal_id uuid,
  _reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rev_id uuid;
  _je RECORD;
BEGIN
  IF NOT public.is_org_member(_org_id) THEN
    RAISE EXCEPTION 'Not authorized for org %', _org_id;
  END IF;

  SELECT * INTO _je FROM public.journal_entries
    WHERE id = _journal_id AND org_id = _org_id
    FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Journal % not found in org', _journal_id; END IF;
  IF _je.status <> 'posted' THEN
    RAISE EXCEPTION 'Only posted journals can be reversed (current status: %)', _je.status;
  END IF;
  IF _je.reversed_by IS NOT NULL THEN
    RAISE EXCEPTION 'Journal % has already been reversed by %', _journal_id, _je.reversed_by;
  END IF;
  IF NOT public.is_period_open(_org_id, current_date) THEN
    RAISE EXCEPTION 'Cannot reverse: current fiscal period is closed';
  END IF;

  INSERT INTO public.journal_entries
    (org_id, entry_date, memo, description,
     source_type, source_id, status, reversal_of)
  VALUES
    (_org_id, current_date,
     'Reversal of ' || COALESCE(_je.memo, _journal_id::text),
     _reason,
     'reversal', _journal_id, 'draft', _journal_id)
  RETURNING id INTO _rev_id;

  INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order)
  SELECT _rev_id, jl.account_id, jl.credit, jl.debit,
         COALESCE(jl.memo,'') || ' (reversal)', jl.line_order
    FROM public.journal_lines jl
   WHERE jl.journal_id = _journal_id;

  UPDATE public.journal_entries
     SET status = 'posted', posted_at = now(), posted_by = auth.uid()
   WHERE id = _rev_id;

  UPDATE public.journal_entries
     SET reversed_by = _rev_id
   WHERE id = _journal_id;

  INSERT INTO public.audit_events
    (org_id, actor_type, actor_id, event_type, action,
     target_type, target_id, after, source)
  VALUES
    (_org_id, 'user', COALESCE(auth.uid()::text,'system'),
     'journal.reversed', 'posted',
     'journal_entry', _journal_id::text,
     jsonb_build_object('original_id', _journal_id,
                        'reversal_id', _rev_id,
                        'reason', _reason),
     'ledgeros.manual');

  RETURN jsonb_build_object(
    'reversal_id', _rev_id,
    'original_id', _journal_id
  );
END $$;

GRANT EXECUTE ON FUNCTION public.reverse_journal(uuid,uuid,text)
  TO authenticated, service_role;
