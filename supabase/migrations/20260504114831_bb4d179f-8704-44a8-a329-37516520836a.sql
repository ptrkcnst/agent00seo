
-- Hide profiles & audits from anon role (only authenticated should see them)
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.audits FROM anon;

-- Restrict execution of the timestamp helper
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
