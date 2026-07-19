-- Phase B: per-company invoice brand style default.
-- Additive only. Stores one saved InvoiceStyle per organization; new invoices
-- inherit it unless a per-invoice override is chosen. The style is presentation
-- metadata only (colors/typography/layout) — it carries no monetary data.

CREATE TABLE public.invoice_brand_styles (
  org_id     UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  style      JSONB NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_brand_styles TO authenticated;
GRANT ALL ON public.invoice_brand_styles TO service_role;

ALTER TABLE public.invoice_brand_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read brand style" ON public.invoice_brand_styles
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));

CREATE POLICY "members write brand style" ON public.invoice_brand_styles
  FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));
