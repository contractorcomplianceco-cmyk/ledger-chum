
DO $mig$
DECLARE
  demo_org uuid := '00000000-0000-4000-8000-000000dec0de';
  acc_cash uuid; acc_ar uuid; acc_labor_rev uuid; acc_material_rev uuid;
  cust_a uuid; cust_b uuid;
  inv_a uuid; inv_b uuid; pay_a uuid;
  je1 uuid; je2 uuid; je3 uuid;
BEGIN
  INSERT INTO public.organizations (id, name, slug, display_name, currency, timezone, country, status)
  VALUES (demo_org, 'Sample Marine Services', 'sample-demo', 'Sample Marine Services', 'USD', 'America/New_York', 'US', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.accounts (org_id, code, name, type, normal_balance, is_system, sort_order) VALUES
    (demo_org, '1000', 'Operating Cash',        'asset',     'debit',  true, 10),
    (demo_org, '1200', 'Accounts Receivable',   'asset',     'debit',  true, 20),
    (demo_org, '1400', 'Inventory',             'asset',     'debit',  true, 30),
    (demo_org, '2000', 'Accounts Payable',      'liability', 'credit', true, 40),
    (demo_org, '3000', 'Retained Earnings',     'equity',    'credit', true, 50),
    (demo_org, '4000', 'Labor Revenue',         'revenue',   'credit', true, 60),
    (demo_org, '4100', 'Material Revenue',      'revenue',   'credit', true, 70),
    (demo_org, '5000', 'Cost of Goods Sold',    'expense',   'debit',  true, 80),
    (demo_org, '6000', 'Operating Expenses',    'expense',   'debit',  true, 90)
  ON CONFLICT (org_id, code) DO NOTHING;

  SELECT id INTO acc_cash         FROM public.accounts WHERE org_id = demo_org AND code = '1000';
  SELECT id INTO acc_ar           FROM public.accounts WHERE org_id = demo_org AND code = '1200';
  SELECT id INTO acc_labor_rev    FROM public.accounts WHERE org_id = demo_org AND code = '4000';
  SELECT id INTO acc_material_rev FROM public.accounts WHERE org_id = demo_org AND code = '4100';

  INSERT INTO public.customers (org_id, name, email, external_id, external_source) VALUES
    (demo_org, 'Blue Harbor Yachts', 'ap@blueharbor.example', 'DEMO-CUST-001', 'sample'),
    (demo_org, 'Coastline Charters', 'billing@coastline.example', 'DEMO-CUST-002', 'sample')
  ON CONFLICT DO NOTHING;

  SELECT id INTO cust_a FROM public.customers WHERE org_id = demo_org AND external_id = 'DEMO-CUST-001';
  SELECT id INTO cust_b FROM public.customers WHERE org_id = demo_org AND external_id = 'DEMO-CUST-002';

  INSERT INTO public.invoices (org_id, customer_id, invoice_number, issue_date, due_date, status,
                               subtotal, tax, total, balance, external_id, external_source, memo)
  VALUES (demo_org, cust_a, 'INV-1001', (CURRENT_DATE - 14), (CURRENT_DATE + 16), 'sent',
          650, 0, 650, 650, 'DEMO-WO-1001', 'sample', 'Annual engine service — 42ft Grand Banks')
  ON CONFLICT (org_id, invoice_number) DO NOTHING;
  SELECT id INTO inv_a FROM public.invoices WHERE org_id = demo_org AND invoice_number = 'INV-1001';

  INSERT INTO public.invoice_lines (invoice_id, line_order, description, quantity, unit_price, amount, account_id) VALUES
    (inv_a, 0, 'Technician Labor (4h @ $125)', 4, 125, 500, acc_labor_rev),
    (inv_a, 1, 'Impeller & gasket kit',        1, 150, 150, acc_material_rev)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.invoices (org_id, customer_id, invoice_number, issue_date, due_date, status,
                               subtotal, tax, total, balance, external_id, external_source, memo)
  VALUES (demo_org, cust_b, 'INV-1002', (CURRENT_DATE - 30), CURRENT_DATE, 'paid',
          1520, 0, 1520, 0, 'DEMO-WO-1002', 'sample', 'Hull cleaning + prop shaft alignment')
  ON CONFLICT (org_id, invoice_number) DO NOTHING;
  SELECT id INTO inv_b FROM public.invoices WHERE org_id = demo_org AND invoice_number = 'INV-1002';

  INSERT INTO public.invoice_lines (invoice_id, line_order, description, quantity, unit_price, amount, account_id) VALUES
    (inv_b, 0, 'Technician Labor (8h @ $135)', 8, 135, 1080, acc_labor_rev),
    (inv_b, 1, 'Prop-shaft coupling',          2, 220, 440,  acc_material_rev)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.payments (org_id, customer_id, payment_date, method, reference,
                               amount, unapplied_amount, external_id, external_source, memo)
  VALUES (demo_org, cust_b, (CURRENT_DATE - 2), 'ach', 'ACH-889422',
          1520, 0, 'DEMO-PAY-2001', 'sample', 'Payment against INV-1002')
  ON CONFLICT (org_id, external_source, external_id) DO NOTHING;
  SELECT id INTO pay_a FROM public.payments WHERE org_id = demo_org AND external_id = 'DEMO-PAY-2001';

  INSERT INTO public.payment_applications (payment_id, invoice_id, amount_applied)
  SELECT pay_a, inv_b, 1520
  WHERE NOT EXISTS (SELECT 1 FROM public.payment_applications WHERE payment_id = pay_a AND invoice_id = inv_b);

  -- Journal 1: create as draft, add lines, then post
  IF NOT EXISTS (SELECT 1 FROM public.journal_entries WHERE org_id = demo_org AND external_id = 'DEMO-JE-1001') THEN
    INSERT INTO public.journal_entries (org_id, entry_date, memo, source_type, source_id, status, external_id, source_system)
    VALUES (demo_org, (CURRENT_DATE - 14), 'Invoice INV-1001 — Blue Harbor Yachts',
            'invoice', inv_a, 'draft', 'DEMO-JE-1001', 'sample')
    RETURNING id INTO je1;

    INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order) VALUES
      (je1, acc_ar,           650, 0,   'A/R — Blue Harbor', 0),
      (je1, acc_labor_rev,    0,   500, 'Labor revenue',     1),
      (je1, acc_material_rev, 0,   150, 'Material revenue',  2);

    UPDATE public.journal_entries SET status = 'posted', posted_at = now() WHERE id = je1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.journal_entries WHERE org_id = demo_org AND external_id = 'DEMO-JE-1002') THEN
    INSERT INTO public.journal_entries (org_id, entry_date, memo, source_type, source_id, status, external_id, source_system)
    VALUES (demo_org, (CURRENT_DATE - 30), 'Invoice INV-1002 — Coastline Charters',
            'invoice', inv_b, 'draft', 'DEMO-JE-1002', 'sample')
    RETURNING id INTO je2;

    INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order) VALUES
      (je2, acc_ar,           1520, 0,    'A/R — Coastline',  0),
      (je2, acc_labor_rev,    0,    1080, 'Labor revenue',    1),
      (je2, acc_material_rev, 0,    440,  'Material revenue', 2);

    UPDATE public.journal_entries SET status = 'posted', posted_at = now() WHERE id = je2;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.journal_entries WHERE org_id = demo_org AND external_id = 'DEMO-JE-2001') THEN
    INSERT INTO public.journal_entries (org_id, entry_date, memo, source_type, source_id, status, external_id, source_system)
    VALUES (demo_org, (CURRENT_DATE - 2), 'Payment ACH-889422 — Coastline Charters',
            'payment', pay_a, 'draft', 'DEMO-JE-2001', 'sample')
    RETURNING id INTO je3;

    INSERT INTO public.journal_lines (journal_id, account_id, debit, credit, memo, line_order) VALUES
      (je3, acc_cash, 1520, 0,    'Cash receipt', 0),
      (je3, acc_ar,   0,    1520, 'A/R clearing', 1);

    UPDATE public.journal_entries SET status = 'posted', posted_at = now() WHERE id = je3;
  END IF;
END
$mig$;

CREATE OR REPLACE FUNCTION public.ensure_sample_demo_membership()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  demo_org uuid := '00000000-0000-4000-8000-000000dec0de';
  uid      uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.org_members (org_id, user_id)
  VALUES (demo_org, uid)
  ON CONFLICT (org_id, user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (uid, demo_org, 'owner')
  ON CONFLICT (user_id, org_id, role) DO NOTHING;

  RETURN demo_org;
END
$fn$;

REVOKE ALL ON FUNCTION public.ensure_sample_demo_membership() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_sample_demo_membership() TO authenticated;
