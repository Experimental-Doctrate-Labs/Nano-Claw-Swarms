
-- Allow org creator to see the org (needed for INSERT...RETURNING)
DROP POLICY IF EXISTS "Members can view own orgs" ON public.orgs;
CREATE POLICY "Members can view own orgs"
  ON public.orgs
  FOR SELECT
  TO authenticated
  USING (is_org_member(auth.uid(), id) OR auth.uid() = created_by);
