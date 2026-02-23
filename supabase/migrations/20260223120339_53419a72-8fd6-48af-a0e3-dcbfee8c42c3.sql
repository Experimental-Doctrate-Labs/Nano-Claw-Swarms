
-- Org role enum
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Organizations table
CREATE TABLE public.orgs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

-- Org members table (stores roles)
CREATE TABLE public.org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Security definer function to check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;

-- Security definer function to check org role
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _role org_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id AND role = _role
  )
$$;

-- Check if user has role at or above a level
CREATE OR REPLACE FUNCTION public.has_org_role_gte(_user_id UUID, _org_id UUID, _min_role org_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id
    AND CASE _min_role
      WHEN 'viewer' THEN role IN ('viewer','member','admin','owner')
      WHEN 'member' THEN role IN ('member','admin','owner')
      WHEN 'admin' THEN role IN ('admin','owner')
      WHEN 'owner' THEN role = 'owner'
    END
  )
$$;

-- RLS for orgs: members can view their orgs
CREATE POLICY "Members can view own orgs" ON public.orgs
  FOR SELECT USING (public.is_org_member(auth.uid(), id));
CREATE POLICY "Authenticated can create orgs" ON public.orgs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update orgs" ON public.orgs
  FOR UPDATE USING (public.has_org_role_gte(auth.uid(), id, 'admin'));
CREATE POLICY "Owner can delete orgs" ON public.orgs
  FOR DELETE USING (public.has_org_role(auth.uid(), id, 'owner'));

-- RLS for org_members
CREATE POLICY "Members can view org members" ON public.org_members
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Admins can insert org members" ON public.org_members
  FOR INSERT WITH CHECK (
    public.has_org_role_gte(auth.uid(), org_id, 'admin')
    OR (auth.uid() = user_id AND role = 'owner') -- allow self-insert as owner during org creation
  );
CREATE POLICY "Admins can update org members" ON public.org_members
  FOR UPDATE USING (public.has_org_role_gte(auth.uid(), org_id, 'admin'));
CREATE POLICY "Admins can delete org members" ON public.org_members
  FOR DELETE USING (public.has_org_role_gte(auth.uid(), org_id, 'admin'));

-- Add org_id to all data tables
ALTER TABLE public.agents ADD COLUMN org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE;
ALTER TABLE public.workflows ADD COLUMN org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE;
ALTER TABLE public.runs ADD COLUMN org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE;
ALTER TABLE public.run_events ADD COLUMN org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE;
ALTER TABLE public.logs ADD COLUMN org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE;
ALTER TABLE public.provider_keys ADD COLUMN org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE;

-- Drop old user-scoped RLS policies and replace with org-scoped ones

-- AGENTS
DROP POLICY "Users can view own agents" ON public.agents;
DROP POLICY "Users can create own agents" ON public.agents;
DROP POLICY "Users can update own agents" ON public.agents;
DROP POLICY "Users can delete own agents" ON public.agents;

CREATE POLICY "Org members can view agents" ON public.agents
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org members can create agents" ON public.agents
  FOR INSERT WITH CHECK (public.has_org_role_gte(auth.uid(), org_id, 'member'));
CREATE POLICY "Org admins can update agents" ON public.agents
  FOR UPDATE USING (public.has_org_role_gte(auth.uid(), org_id, 'member'));
CREATE POLICY "Org admins can delete agents" ON public.agents
  FOR DELETE USING (public.has_org_role_gte(auth.uid(), org_id, 'admin'));

-- WORKFLOWS
DROP POLICY "Users can view own workflows" ON public.workflows;
DROP POLICY "Users can create own workflows" ON public.workflows;
DROP POLICY "Users can update own workflows" ON public.workflows;
DROP POLICY "Users can delete own workflows" ON public.workflows;

CREATE POLICY "Org members can view workflows" ON public.workflows
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org members can create workflows" ON public.workflows
  FOR INSERT WITH CHECK (public.has_org_role_gte(auth.uid(), org_id, 'member'));
CREATE POLICY "Org admins can update workflows" ON public.workflows
  FOR UPDATE USING (public.has_org_role_gte(auth.uid(), org_id, 'member'));
CREATE POLICY "Org admins can delete workflows" ON public.workflows
  FOR DELETE USING (public.has_org_role_gte(auth.uid(), org_id, 'admin'));

-- RUNS
DROP POLICY "Users can view own runs" ON public.runs;
DROP POLICY "Users can create own runs" ON public.runs;
DROP POLICY "Users can update own runs" ON public.runs;

CREATE POLICY "Org members can view runs" ON public.runs
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org members can create runs" ON public.runs
  FOR INSERT WITH CHECK (public.has_org_role_gte(auth.uid(), org_id, 'member'));
CREATE POLICY "Org members can update runs" ON public.runs
  FOR UPDATE USING (public.has_org_role_gte(auth.uid(), org_id, 'member'));

-- RUN_EVENTS
DROP POLICY "Users can view own run events" ON public.run_events;
DROP POLICY "Authenticated can insert run events" ON public.run_events;

CREATE POLICY "Org members can view run events" ON public.run_events
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org members can insert run events" ON public.run_events
  FOR INSERT WITH CHECK (public.has_org_role_gte(auth.uid(), org_id, 'member'));

-- LOGS
DROP POLICY "Users can view own logs" ON public.logs;
DROP POLICY "Authenticated can insert logs" ON public.logs;

CREATE POLICY "Org members can view logs" ON public.logs
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org members can insert logs" ON public.logs
  FOR INSERT WITH CHECK (public.has_org_role_gte(auth.uid(), org_id, 'member'));

-- PROVIDER_KEYS
DROP POLICY "Users can view own keys" ON public.provider_keys;
DROP POLICY "Users can create own keys" ON public.provider_keys;
DROP POLICY "Users can delete own keys" ON public.provider_keys;

CREATE POLICY "Org members can view keys" ON public.provider_keys
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "Org admins can create keys" ON public.provider_keys
  FOR INSERT WITH CHECK (public.has_org_role_gte(auth.uid(), org_id, 'admin'));
CREATE POLICY "Org admins can delete keys" ON public.provider_keys
  FOR DELETE USING (public.has_org_role_gte(auth.uid(), org_id, 'admin'));

-- Trigger for orgs updated_at
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON public.orgs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime on org_members
ALTER PUBLICATION supabase_realtime ADD TABLE public.org_members;
