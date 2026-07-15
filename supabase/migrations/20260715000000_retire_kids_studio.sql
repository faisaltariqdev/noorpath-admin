-- Permanently retire the legacy Kids Studio schema.
-- Idempotent so it is safe to re-apply in local, preview, and production environments.
DROP TABLE IF EXISTS public.kids_studio_progress CASCADE;
DROP TABLE IF EXISTS public.kids_studio_assignments CASCADE;
