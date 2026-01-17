-- supabase/rls-policies.sql
-- Shop Visibility Board (SVB)
-- RLS policies: public read for TV; authenticated edit for admins.

-- 0) Ensure RLS is enabled
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 1) Public read (TV display)
-- Allows anyone (anon) to SELECT jobs.
DROP POLICY IF EXISTS "Public can read jobs" ON public.jobs;
CREATE POLICY "Public can read jobs"
ON public.jobs
FOR SELECT
USING (true);

-- 2) Authenticated write (simple MVP)
-- Allows any authenticated user to insert/update/delete.
-- Tighten later by checking a role/allowlist.
DROP POLICY IF EXISTS "Authenticated can insert jobs" ON public.jobs;
CREATE POLICY "Authenticated can insert jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update jobs" ON public.jobs;
CREATE POLICY "Authenticated can update jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can delete jobs" ON public.jobs;
CREATE POLICY "Authenticated can delete jobs"
ON public.jobs
FOR DELETE
TO authenticated
USING (true);

-- 3) Optional: tighten to allowlisted emails (recommended after MVP)
-- Uncomment and replace emails.
-- DROP POLICY IF EXISTS "Allowlisted admins can write" ON public.jobs;
-- CREATE POLICY "Allowlisted admins can write"
-- ON public.jobs
-- FOR ALL
-- TO authenticated
-- USING (auth.jwt() ->> 'email' IN ('david@yourco.com', 'joe@yourco.com'))
-- WITH CHECK (auth.jwt() ->> 'email' IN ('david@yourco.com', 'joe@yourco.com'));
