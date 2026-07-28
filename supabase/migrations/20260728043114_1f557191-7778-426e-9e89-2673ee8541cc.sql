CREATE TABLE IF NOT EXISTS public.system_consumers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'internal',
  purpose text NOT NULL,
  homepage text,
  contract_version text NOT NULL DEFAULT 'v1',
  default_scopes text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','planned','deprecated')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.system_consumers TO authenticated;
GRANT ALL ON public.system_consumers TO service_role;
ALTER TABLE public.system_consumers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_consumers readable by authenticated"
  ON public.system_consumers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER trg_system_consumers_updated_at
  BEFORE UPDATE ON public.system_consumers
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.api_clients
  ADD COLUMN IF NOT EXISTS consumer_slug text
    REFERENCES public.system_consumers(slug) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_api_clients_consumer_slug
  ON public.api_clients(consumer_slug) WHERE consumer_slug IS NOT NULL;

INSERT INTO public.system_consumers (slug, name, category, purpose, contract_version, default_scopes, status) VALUES
  ('auditengine', 'AuditEngine', 'internal-cca',
   'Consumes published financial snapshots (metrics, journals, close status) to run continuous audit and evidence workflows.',
   'v1', ARRAY['read.metrics','read.journals','read.close','read.intelligence','read.health'], 'active'),
  ('applications-os', 'ApplicationsOS', 'internal-cca',
   'Reads company health, cash runway, and financial-health score to score prequalification and application decisions.',
   'v1', ARRAY['read.metrics','read.health'], 'active'),
  ('document-os', 'DocumentOS', 'internal-cca',
   'Attaches financial evidence bundles (period, metric value, lineage) to generated documents.',
   'v1', ARRAY['read.metrics','read.close'], 'active'),
  ('compliance-core-os', 'ComplianceCoreOS', 'internal-cca',
   'Ingests close status, anomalies, and audit-critical metrics to monitor compliance posture.',
   'v1', ARRAY['read.metrics','read.close','read.intelligence'], 'active'),
  ('bid-intelligence-os', 'BidIntelligenceOS', 'internal-cca',
   'Uses gross margin, working capital, and health score to shape bid strategy and pricing floors.',
   'v1', ARRAY['read.metrics','read.health'], 'active'),
  ('carmen-os', 'CarmenOS', 'internal-cca',
   'AI advisory OS that reads canonical metrics and intelligence explanations to power executive dialog.',
   'v1', ARRAY['read.metrics','read.intelligence','read.health'], 'active'),
  ('compliance-connect', 'ComplianceConnect', 'internal-cca',
   'Reads AR/AP balances, tax liabilities, and close status for regulator-facing compliance handoff.',
   'v1', ARRAY['read.metrics','read.close'], 'planned'),
  ('trustscore', 'TrustScore', 'internal-cca',
   'Consumes financial health score and payment discipline metrics to compute counterparty trust ratings.',
   'v1', ARRAY['read.metrics','read.health'], 'planned'),
  ('steel-link', 'Steel Link', 'internal-cca',
   'Reads project-level revenue and margin snapshots to reconcile field data.',
   'v1', ARRAY['read.metrics'], 'planned'),
  ('rose-os', 'Rose OS', 'internal-cca',
   'Company operating system — reads canonical metrics and intelligence for the Command Center dashboard.',
   'v1', ARRAY['read.metrics','read.intelligence','read.health','read.close'], 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  purpose = EXCLUDED.purpose,
  default_scopes = EXCLUDED.default_scopes,
  status = EXCLUDED.status,
  updated_at = now();