
REVOKE EXECUTE ON FUNCTION public.seed_canonical_metrics(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_canonical_metrics(UUID) TO authenticated, service_role;
