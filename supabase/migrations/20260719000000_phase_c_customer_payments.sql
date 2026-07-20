-- Phase C — Customer payments (processor-agnostic + Authorize.net).
-- Additive only: extends the existing `payments` table with gateway metadata,
-- adds capture idempotency, and introduces a `payment_events` table for webhook
-- notifications. RLS + org-scoping mirror the existing payment tables.

-- ---------- payments: gateway metadata + capture idempotency ----------
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_txn_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'succeeded',
  ADD COLUMN IF NOT EXISTS payment_type TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- One capture per idempotency key, per org — the DB-level guarantee that a
-- gateway charge cannot be double-posted even if the request is retried.
CREATE UNIQUE INDEX IF NOT EXISTS payments_org_idempotency_key_uq
  ON public.payments(org_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Fast reconciliation lookups from webhook -> payment.
CREATE INDEX IF NOT EXISTS payments_provider_txn_idx
  ON public.payments(org_id, provider, provider_txn_id)
  WHERE provider_txn_id IS NOT NULL;

-- ---------- payment_events: verified gateway webhook notifications ----------
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  -- Gateway's own event id; unique per provider makes processing idempotent.
  provider_event_id TEXT NOT NULL,
  provider_txn_id TEXT,
  event_type TEXT NOT NULL,
  status TEXT,
  amount NUMERIC(18,2),
  payload JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);
CREATE INDEX IF NOT EXISTS payment_events_org_idx ON public.payment_events(org_id);
CREATE INDEX IF NOT EXISTS payment_events_payment_idx ON public.payment_events(payment_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_events TO authenticated;
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members read payment events" ON public.payment_events;
CREATE POLICY "members read payment events" ON public.payment_events
  FOR SELECT TO authenticated USING (public.is_org_member(org_id));

-- Writes are performed by the service role from the webhook handler (which has
-- no user JWT); members may not insert/mutate events directly.
DROP POLICY IF EXISTS "members write payment events" ON public.payment_events;
CREATE POLICY "members write payment events" ON public.payment_events
  FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);
