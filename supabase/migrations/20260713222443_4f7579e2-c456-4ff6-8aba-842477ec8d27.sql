
-- ============================================================
-- FOUNDATION: organizations, roles, api clients, audit, sync
-- ============================================================

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE INDEX ON public.org_members(user_id);
GRANT SELECT ON public.org_members TO authenticated;
GRANT ALL ON public.org_members TO service_role;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.app_role AS ENUM (
  'owner','accounting_lead','accountant','systems_reviewer','team_member','integration_service'
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, org_id, role)
);
CREATE INDEX ON public.user_roles(user_id, org_id);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer helpers (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_org_member(_org UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members WHERE org_id = _org AND user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user UUID, _org UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user AND org_id = _org AND role = _role
  )
$$;

-- Baseline policies for the foundation tables
CREATE POLICY "org members can read their orgs" ON public.organizations
  FOR SELECT TO authenticated USING (public.is_org_member(id));

CREATE POLICY "members read their org rows" ON public.org_members
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));

CREATE POLICY "members read roles in their orgs" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));

-- API clients (bearer tokens for ServiceConnect and future integrations)
CREATE TABLE public.api_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.api_clients(org_id);
GRANT SELECT ON public.api_clients TO authenticated;
GRANT ALL ON public.api_clients TO service_role;
ALTER TABLE public.api_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners read their org api clients" ON public.api_clients
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), org_id, 'owner'));

-- Audit events
CREATE TABLE public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL,     -- 'user' | 'api_client' | 'system'
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  before JSONB,
  after JSONB,
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.audit_events(org_id, created_at DESC);
CREATE INDEX ON public.audit_events(target_type, target_id);
GRANT SELECT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read audit" ON public.audit_events
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));

-- Sync history (idempotency + ServiceConnect replay)
CREATE TABLE public.sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source TEXT NOT NULL,           -- 'serviceconnect'
  endpoint TEXT NOT NULL,
  external_id TEXT,
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL,           -- 'accepted' | 'duplicate' | 'error'
  request JSONB,
  response JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, idempotency_key)
);
CREATE INDEX ON public.sync_history(org_id, created_at DESC);
CREATE INDEX ON public.sync_history(source, external_id);
GRANT SELECT ON public.sync_history TO authenticated;
GRANT ALL ON public.sync_history TO service_role;
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read sync history" ON public.sync_history
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));

-- ============================================================
-- ACCOUNTING CORE
-- ============================================================

-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_source TEXT,      -- 'serviceconnect'
  external_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  billing_address JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, external_source, external_id)
);
CREATE INDEX ON public.customers(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read customers" ON public.customers
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "accountants write customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

-- Chart of accounts
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit','credit')),
  parent_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);
CREATE INDEX ON public.accounts(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read accounts" ON public.accounts
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members write accounts" ON public.accounts
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

-- Journal entries + lines
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  memo TEXT,
  source_type TEXT,          -- 'invoice' | 'payment' | 'refund' | 'manual' | 'inventory'
  source_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted','void')),
  posted_at TIMESTAMPTZ,
  posted_by UUID,
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.journal_entries(org_id, entry_date DESC);
CREATE INDEX ON public.journal_entries(source_type, source_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read journals" ON public.journal_entries
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members write journals" ON public.journal_entries
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TABLE public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  debit NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit NUMERIC(18,2) NOT NULL DEFAULT 0,
  memo TEXT,
  line_order INT NOT NULL DEFAULT 0,
  CHECK (debit >= 0 AND credit >= 0),
  CHECK (debit = 0 OR credit = 0)
);
CREATE INDEX ON public.journal_lines(journal_id);
CREATE INDEX ON public.journal_lines(account_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_lines TO authenticated;
GRANT ALL ON public.journal_lines TO service_role;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read journal lines" ON public.journal_lines
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.journal_entries je
    WHERE je.id = journal_id AND public.is_org_member(je.org_id)
  ));
CREATE POLICY "members write journal lines" ON public.journal_lines
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.journal_entries je WHERE je.id = journal_id AND public.is_org_member(je.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.journal_entries je WHERE je.id = journal_id AND public.is_org_member(je.org_id)));

-- Balanced-journal trigger: fires on posted status
CREATE OR REPLACE FUNCTION public.enforce_balanced_journal()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE d NUMERIC(18,2); c NUMERIC(18,2);
BEGIN
  IF NEW.status = 'posted' AND (OLD.status IS NULL OR OLD.status <> 'posted') THEN
    SELECT COALESCE(SUM(debit),0), COALESCE(SUM(credit),0)
    INTO d, c FROM public.journal_lines WHERE journal_id = NEW.id;
    IF d <> c THEN
      RAISE EXCEPTION 'Journal % is unbalanced: debit=% credit=%', NEW.id, d, c;
    END IF;
    IF d = 0 THEN
      RAISE EXCEPTION 'Journal % has no lines', NEW.id;
    END IF;
    NEW.posted_at := COALESCE(NEW.posted_at, now());
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_journal_balance
BEFORE INSERT OR UPDATE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_balanced_journal();

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  external_source TEXT,
  external_id TEXT,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','sent','partial','paid','void')),
  subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax NUMERIC(18,2) NOT NULL DEFAULT 0,
  total NUMERIC(18,2) NOT NULL DEFAULT 0,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  work_order_ref TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, invoice_number),
  UNIQUE (org_id, external_source, external_id)
);
CREATE INDEX ON public.invoices(org_id, status);
CREATE INDEX ON public.invoices(customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read invoices" ON public.invoices
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members write invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TABLE public.invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(18,4) NOT NULL DEFAULT 1,
  unit_price NUMERIC(18,4) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(9,4) NOT NULL DEFAULT 0,
  amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  account_id UUID REFERENCES public.accounts(id),
  line_order INT NOT NULL DEFAULT 0
);
CREATE INDEX ON public.invoice_lines(invoice_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_lines TO authenticated;
GRANT ALL ON public.invoice_lines TO service_role;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read invoice lines" ON public.invoice_lines
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_org_member(i.org_id)
  ));
CREATE POLICY "members write invoice lines" ON public.invoice_lines
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_org_member(i.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_org_member(i.org_id)));

-- Payments + applications
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  external_source TEXT,
  external_id TEXT,
  payment_date DATE NOT NULL,
  method TEXT,
  reference TEXT,
  amount NUMERIC(18,2) NOT NULL,
  unapplied_amount NUMERIC(18,2) NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, external_source, external_id)
);
CREATE INDEX ON public.payments(org_id);
CREATE INDEX ON public.payments(customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read payments" ON public.payments
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members write payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TABLE public.payment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount_applied NUMERIC(18,2) NOT NULL CHECK (amount_applied > 0),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.payment_applications(payment_id);
CREATE INDEX ON public.payment_applications(invoice_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_applications TO authenticated;
GRANT ALL ON public.payment_applications TO service_role;
ALTER TABLE public.payment_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read payment apps" ON public.payment_applications
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.payments p WHERE p.id = payment_id AND public.is_org_member(p.org_id)
  ));
CREATE POLICY "members write payment apps" ON public.payment_applications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.payments p WHERE p.id = payment_id AND public.is_org_member(p.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.payments p WHERE p.id = payment_id AND public.is_org_member(p.org_id)));

-- Credits + applications
CREATE TABLE public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  credit_date DATE NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  unapplied_amount NUMERIC(18,2) NOT NULL,
  memo TEXT,
  source_type TEXT,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.credits(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credits TO authenticated;
GRANT ALL ON public.credits TO service_role;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read credits" ON public.credits
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members write credits" ON public.credits
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

CREATE TABLE public.credit_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID NOT NULL REFERENCES public.credits(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount_applied NUMERIC(18,2) NOT NULL CHECK (amount_applied > 0),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.credit_applications(credit_id);
CREATE INDEX ON public.credit_applications(invoice_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_applications TO authenticated;
GRANT ALL ON public.credit_applications TO service_role;
ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read credit apps" ON public.credit_applications
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.credits c WHERE c.id = credit_id AND public.is_org_member(c.org_id)
  ));
CREATE POLICY "members write credit apps" ON public.credit_applications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.credits c WHERE c.id = credit_id AND public.is_org_member(c.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.credits c WHERE c.id = credit_id AND public.is_org_member(c.org_id)));

-- Refunds
CREATE TABLE public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id),
  refund_date DATE NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  method TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.refunds(org_id);
CREATE INDEX ON public.refunds(payment_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read refunds" ON public.refunds
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members write refunds" ON public.refunds
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

-- Inventory consumption from ServiceConnect
CREATE TABLE public.inventory_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_source TEXT,
  external_id TEXT,
  work_order_ref TEXT,
  item_ref TEXT NOT NULL,
  item_description TEXT,
  quantity NUMERIC(18,4) NOT NULL,
  unit_cost NUMERIC(18,4) NOT NULL,
  total_cost NUMERIC(18,2) NOT NULL,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, external_source, external_id)
);
CREATE INDEX ON public.inventory_consumption(org_id);
CREATE INDEX ON public.inventory_consumption(work_order_ref);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_consumption TO authenticated;
GRANT ALL ON public.inventory_consumption TO service_role;
ALTER TABLE public.inventory_consumption ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read inventory consumption" ON public.inventory_consumption
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members write inventory consumption" ON public.inventory_consumption
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

-- ============================================================
-- REPORTING VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.v_trial_balance AS
SELECT
  je.org_id,
  a.id AS account_id,
  a.code,
  a.name,
  a.type,
  COALESCE(SUM(jl.debit),0)  AS total_debit,
  COALESCE(SUM(jl.credit),0) AS total_credit,
  COALESCE(SUM(jl.debit),0) - COALESCE(SUM(jl.credit),0) AS balance
FROM public.accounts a
LEFT JOIN public.journal_lines jl ON jl.account_id = a.id
LEFT JOIN public.journal_entries je ON je.id = jl.journal_id AND je.status = 'posted'
GROUP BY je.org_id, a.id, a.code, a.name, a.type;

GRANT SELECT ON public.v_trial_balance TO authenticated, service_role;

CREATE OR REPLACE VIEW public.v_general_ledger AS
SELECT
  je.org_id,
  je.id AS journal_id,
  je.entry_date,
  je.memo AS journal_memo,
  je.status,
  jl.id AS line_id,
  jl.account_id,
  a.code AS account_code,
  a.name AS account_name,
  jl.debit,
  jl.credit,
  jl.memo AS line_memo,
  je.source_type,
  je.source_id
FROM public.journal_entries je
JOIN public.journal_lines jl ON jl.journal_id = je.id
JOIN public.accounts a ON a.id = jl.account_id
WHERE je.status = 'posted';

GRANT SELECT ON public.v_general_ledger TO authenticated, service_role;

CREATE OR REPLACE VIEW public.v_ar_aging AS
SELECT
  i.org_id,
  i.customer_id,
  c.name AS customer_name,
  i.id AS invoice_id,
  i.invoice_number,
  i.issue_date,
  i.due_date,
  i.balance,
  CASE
    WHEN i.due_date IS NULL THEN NULL
    ELSE CURRENT_DATE - i.due_date
  END AS days_past_due,
  CASE
    WHEN i.due_date IS NULL OR CURRENT_DATE <= i.due_date THEN '0-30'
    WHEN CURRENT_DATE - i.due_date <= 30 THEN '0-30'
    WHEN CURRENT_DATE - i.due_date <= 60 THEN '31-60'
    WHEN CURRENT_DATE - i.due_date <= 90 THEN '61-90'
    ELSE '90+'
  END AS bucket
FROM public.invoices i
JOIN public.customers c ON c.id = i.customer_id
WHERE i.status IN ('sent','partial') AND i.balance > 0;

GRANT SELECT ON public.v_ar_aging TO authenticated, service_role;
