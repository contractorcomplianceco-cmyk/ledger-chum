
-- ============================================================
-- M9A: Canonical Financial Metrics Layer
-- ============================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.metric_category AS ENUM (
    'cash','revenue','profitability','ar','ap','expenses','banking',
    'growth','operations','people','compensation','technology','risk','company_health'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.metric_status AS ENUM ('draft','active','deprecated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.metric_freshness AS ENUM ('fresh','delayed','stale','unavailable');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.metric_refresh_frequency AS ENUM (
    'realtime','minutely','hourly','daily','weekly','monthly','on_demand'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.metric_source_type AS ENUM ('table','view','rpc','derived','external');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 1. METRIC REGISTRY
-- ============================================================
CREATE TABLE public.financial_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  category public.metric_category NOT NULL,
  description TEXT NOT NULL,
  formula_definition TEXT NOT NULL,
  calculation_method TEXT NOT NULL,
  owner_role TEXT NOT NULL DEFAULT 'accounting_lead',
  refresh_frequency public.metric_refresh_frequency NOT NULL DEFAULT 'on_demand',
  status public.metric_status NOT NULL DEFAULT 'active',
  required_permission TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_rule TEXT,
  demonstration_only BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, metric_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_metrics TO authenticated;
GRANT ALL ON public.financial_metrics TO service_role;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read financial_metrics" ON public.financial_metrics
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write financial_metrics" ON public.financial_metrics
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE TRIGGER trg_financial_metrics_updated_at BEFORE UPDATE ON public.financial_metrics
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 2. METRIC VALUES
-- ============================================================
CREATE TABLE public.financial_metric_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES public.financial_metrics(id) ON DELETE CASCADE,
  value NUMERIC,
  value_json JSONB,
  period_start DATE,
  period_end DATE,
  calculation_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  confidence_score NUMERIC NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  freshness_status public.metric_freshness NOT NULL DEFAULT 'fresh',
  source_count INTEGER NOT NULL DEFAULT 0,
  assumptions TEXT[] NOT NULL DEFAULT '{}',
  missing_data TEXT[] NOT NULL DEFAULT '{}',
  calculated_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_metric_values_metric ON public.financial_metric_values (org_id, metric_id, calculation_timestamp DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_metric_values TO authenticated;
GRANT ALL ON public.financial_metric_values TO service_role;
ALTER TABLE public.financial_metric_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read financial_metric_values" ON public.financial_metric_values
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write financial_metric_values" ON public.financial_metric_values
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));

-- ============================================================
-- 3. METRIC LINEAGE
-- ============================================================
CREATE TABLE public.financial_metric_lineage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES public.financial_metrics(id) ON DELETE CASCADE,
  source_type public.metric_source_type NOT NULL,
  source_table TEXT,
  source_field TEXT,
  transformation_description TEXT NOT NULL,
  dependency_metric_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_metric_lineage_metric ON public.financial_metric_lineage (org_id, metric_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_metric_lineage TO authenticated;
GRANT ALL ON public.financial_metric_lineage TO service_role;
ALTER TABLE public.financial_metric_lineage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read financial_metric_lineage" ON public.financial_metric_lineage
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "org members write financial_metric_lineage" ON public.financial_metric_lineage
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));

-- ============================================================
-- 4. SEED FUNCTION — canonical metrics per organization
-- ============================================================
CREATE OR REPLACE FUNCTION public.seed_canonical_metrics(_org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted INTEGER := 0;
  v_metric_id UUID;
  r RECORD;
  seeds JSONB := '[
    {"key":"true_available_cash","name":"True Available Cash","cat":"cash","desc":"Cash available for operational use after restrictions and commitments.","formula":"Bank Cash - Restricted Funds - Committed Obligations - Reserved Funds","method":"Sum of bank_accounts.balance minus AP obligations and cash-availability reserved allocations.","owner":"accounting_lead","freq":"hourly","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"table","table":"bank_accounts","field":"balance","transform":"Sum of active operating bank account balances."},
      {"type":"table","table":"bills","field":"amount_due","transform":"Subtract open (unpaid) AP obligations."},
      {"type":"derived","table":"cash_availability","field":null,"transform":"Subtract restricted / reserved allocation rules.","dep":null}
    ]},
    {"key":"revenue","name":"Revenue","cat":"revenue","desc":"Posted revenue from the general ledger.","formula":"SUM(credit - debit) on revenue accounts for the selected period.","method":"Sum posted journal_lines against accounts.type = revenue within period.","owner":"accounting_lead","freq":"daily","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"table","table":"journal_entries","field":"entry_date","transform":"Filter to status = posted, period-bound."},
      {"type":"table","table":"journal_lines","field":"credit,debit","transform":"Sum credit − debit for revenue accounts."},
      {"type":"table","table":"accounts","field":"type","transform":"Restrict to type = revenue."}
    ]},
    {"key":"gross_profit","name":"Gross Profit","cat":"profitability","desc":"Revenue minus cost of goods sold.","formula":"Revenue − COGS","method":"Revenue metric minus sum of posted journal_lines against accounts.type = cogs.","owner":"accounting_lead","freq":"daily","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"derived","table":null,"field":null,"transform":"Depends on revenue metric.","dep":"revenue"},
      {"type":"table","table":"accounts","field":"type","transform":"Sum posted debits on type = cogs."}
    ]},
    {"key":"net_income","name":"Net Income","cat":"profitability","desc":"Revenue minus COGS minus operating expenses.","formula":"Revenue − COGS − Operating Expenses","method":"Standard P&L rollup from posted journal_lines by account type.","owner":"accounting_lead","freq":"daily","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"derived","table":null,"field":null,"transform":"Depends on gross_profit.","dep":"gross_profit"},
      {"type":"table","table":"accounts","field":"type","transform":"Subtract sum of type = expense."}
    ]},
    {"key":"ar_balance","name":"AR Balance","cat":"ar","desc":"Outstanding customer receivables.","formula":"SUM(invoices.balance_due) where status != paid","method":"Aggregate open invoice balances net of applied payments/credits.","owner":"accounting_lead","freq":"hourly","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"table","table":"invoices","field":"balance_due","transform":"Sum for status != paid."},
      {"type":"table","table":"payment_applications","field":"amount","transform":"Applied payments already reflected in balance_due."}
    ]},
    {"key":"ap_balance","name":"AP Balance","cat":"ap","desc":"Outstanding vendor obligations.","formula":"SUM(bills.balance_due) where status != paid","method":"Aggregate open bill balances net of applied payments.","owner":"accounting_lead","freq":"hourly","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"table","table":"bills","field":"balance_due","transform":"Sum for status != paid."},
      {"type":"table","table":"bill_payment_applications","field":"amount","transform":"Applied bill payments reflected in balance_due."}
    ]},
    {"key":"working_capital","name":"Working Capital","cat":"profitability","desc":"Current assets minus current liabilities.","formula":"Current Assets − Current Liabilities","method":"Balance-sheet rollup from accounts flagged current.","owner":"accounting_lead","freq":"daily","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"table","table":"accounts","field":"type","transform":"Sum current asset − current liability balances."}
    ]},
    {"key":"gross_margin","name":"Gross Margin","cat":"profitability","desc":"Gross profit as a share of revenue.","formula":"Gross Profit / Revenue","method":"Ratio of gross_profit to revenue for the period.","owner":"accounting_lead","freq":"daily","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"derived","table":null,"field":null,"transform":"Depends on gross_profit and revenue.","dep":"gross_profit"}
    ]},
    {"key":"operating_margin","name":"Operating Margin","cat":"profitability","desc":"Operating income as a share of revenue.","formula":"Operating Income / Revenue","method":"Ratio of net_income (pre-tax) to revenue.","owner":"accounting_lead","freq":"daily","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"derived","table":null,"field":null,"transform":"Depends on net_income and revenue.","dep":"net_income"}
    ]},
    {"key":"cash_runway","name":"Cash Runway","cat":"cash","desc":"Estimated months of operations using available cash. Demonstration calculation until forecasting engine is connected.","formula":"Available Cash / Average Monthly Operating Burn","method":"Available Cash / trailing 3-month average operating expense outflow.","owner":"owner","freq":"daily","perm":null,"sensitive":false,"demo":true,"lineage":[
      {"type":"derived","table":null,"field":null,"transform":"Depends on true_available_cash.","dep":"true_available_cash"},
      {"type":"table","table":"journal_lines","field":"debit","transform":"Trailing 90d expense outflow (demo)."}
    ]},
    {"key":"close_completion_score","name":"Close Completion Score","cat":"operations","desc":"Progress score for the active monthly close.","formula":"Weighted score of reconciliations, exceptions, approvals, journals, reports.","method":"Sum of weighted completion signals on the active close_runs row.","owner":"accounting_lead","freq":"hourly","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"table","table":"close_runs","field":"status","transform":"Score components: recon complete, exceptions cleared, approvals granted, journals posted, reports ready."},
      {"type":"table","table":"close_tasks","field":"status","transform":"Task completion signal."}
    ]},
    {"key":"ar_collection_risk","name":"AR Collection Risk","cat":"ar","desc":"Risk score for open receivables.","formula":"Weighted(aging, overdue amount, payment history, customer concentration)","method":"Aggregate risk score using aging buckets and customer concentration.","owner":"accounting_lead","freq":"daily","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"table","table":"invoices","field":"due_date","transform":"Aging buckets (0-30, 31-60, 61-90, 90+)."},
      {"type":"table","table":"customers","field":"id","transform":"Customer concentration factor."}
    ]},
    {"key":"ap_payment_pressure","name":"AP Payment Pressure","cat":"ap","desc":"Pressure score for upcoming payables.","formula":"Weighted(upcoming due, overdue, cash availability)","method":"Score comparing due bills within 14 days against available cash.","owner":"accounting_lead","freq":"daily","perm":null,"sensitive":false,"demo":false,"lineage":[
      {"type":"table","table":"bills","field":"due_date","transform":"Upcoming & overdue amounts."},
      {"type":"derived","table":null,"field":null,"transform":"Compared against true_available_cash.","dep":"true_available_cash"}
    ]},
    {"key":"financial_health_score","name":"Financial Health Score","cat":"company_health","desc":"Composite health score across cash, profitability, growth, collections, controls, data quality, risk. Framework only — each component requires explanation.","formula":"Weighted composite of component scores","method":"Framework: components computed from other canonical metrics with explanation.","owner":"owner","freq":"daily","perm":null,"sensitive":false,"demo":true,"lineage":[
      {"type":"derived","table":null,"field":null,"transform":"Depends on true_available_cash.","dep":"true_available_cash"},
      {"type":"derived","table":null,"field":null,"transform":"Depends on net_income.","dep":"net_income"},
      {"type":"derived","table":null,"field":null,"transform":"Depends on ar_collection_risk.","dep":"ar_collection_risk"},
      {"type":"derived","table":null,"field":null,"transform":"Depends on close_completion_score.","dep":"close_completion_score"}
    ]}
  ]'::JSONB;
BEGIN
  FOR r IN SELECT * FROM jsonb_array_elements(seeds) AS s LOOP
    INSERT INTO public.financial_metrics(
      org_id, metric_key, metric_name, category, description,
      formula_definition, calculation_method, owner_role, refresh_frequency,
      required_permission, is_sensitive, demonstration_only
    ) VALUES (
      _org_id,
      r.value->>'key',
      r.value->>'name',
      (r.value->>'cat')::public.metric_category,
      r.value->>'desc',
      r.value->>'formula',
      r.value->>'method',
      r.value->>'owner',
      (r.value->>'freq')::public.metric_refresh_frequency,
      NULLIF(r.value->>'perm',''),
      COALESCE((r.value->>'sensitive')::boolean, false),
      COALESCE((r.value->>'demo')::boolean, false)
    )
    ON CONFLICT (org_id, metric_key) DO UPDATE
      SET metric_name = EXCLUDED.metric_name,
          description = EXCLUDED.description,
          formula_definition = EXCLUDED.formula_definition,
          calculation_method = EXCLUDED.calculation_method,
          updated_at = now()
    RETURNING id INTO v_metric_id;

    -- Rewrite lineage rows for this metric
    DELETE FROM public.financial_metric_lineage WHERE metric_id = v_metric_id;
    INSERT INTO public.financial_metric_lineage(
      org_id, metric_id, source_type, source_table, source_field,
      transformation_description, dependency_metric_key
    )
    SELECT
      _org_id,
      v_metric_id,
      (l->>'type')::public.metric_source_type,
      l->>'table',
      l->>'field',
      l->>'transform',
      l->>'dep'
    FROM jsonb_array_elements(r.value->'lineage') AS l;

    inserted := inserted + 1;
  END LOOP;
  RETURN inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_canonical_metrics(UUID) TO authenticated;
