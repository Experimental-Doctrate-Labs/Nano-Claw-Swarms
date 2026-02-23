
-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Authenticated can create orgs" ON public.orgs;
CREATE POLICY "Authenticated can create orgs"
  ON public.orgs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Also fix other restrictive policies that should be permissive
DROP POLICY IF EXISTS "Members can view own orgs" ON public.orgs;
CREATE POLICY "Members can view own orgs"
  ON public.orgs
  FOR SELECT
  TO authenticated
  USING (is_org_member(auth.uid(), id));

DROP POLICY IF EXISTS "Admins can update orgs" ON public.orgs;
CREATE POLICY "Admins can update orgs"
  ON public.orgs
  FOR UPDATE
  TO authenticated
  USING (has_org_role_gte(auth.uid(), id, 'admin'::org_role));

DROP POLICY IF EXISTS "Owner can delete orgs" ON public.orgs;
CREATE POLICY "Owner can delete orgs"
  ON public.orgs
  FOR DELETE
  TO authenticated
  USING (has_org_role(auth.uid(), id, 'owner'::org_role));

-- Fix org_members policies too
DROP POLICY IF EXISTS "Members can view org members" ON public.org_members;
CREATE POLICY "Members can view org members"
  ON public.org_members
  FOR SELECT
  TO authenticated
  USING (is_org_member(auth.uid(), org_id));

DROP POLICY IF EXISTS "Admins can insert org members" ON public.org_members;
CREATE POLICY "Admins can insert org members"
  ON public.org_members
  FOR INSERT
  TO authenticated
  WITH CHECK (has_org_role_gte(auth.uid(), org_id, 'admin'::org_role) OR (auth.uid() = user_id AND role = 'owner'::org_role));

DROP POLICY IF EXISTS "Admins can update org members" ON public.org_members;
CREATE POLICY "Admins can update org members"
  ON public.org_members
  FOR UPDATE
  TO authenticated
  USING (has_org_role_gte(auth.uid(), org_id, 'admin'::org_role));

DROP POLICY IF EXISTS "Admins can delete org members" ON public.org_members;
CREATE POLICY "Admins can delete org members"
  ON public.org_members
  FOR DELETE
  TO authenticated
  USING (has_org_role_gte(auth.uid(), org_id, 'admin'::org_role));
