
ALTER VIEW public.v_trial_balance SET (security_invoker = true);
ALTER VIEW public.v_general_ledger SET (security_invoker = true);
ALTER VIEW public.v_ar_aging SET (security_invoker = true);

REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.enforce_balanced_journal() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, UUID, public.app_role) TO authenticated;
