
-- Agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL DEFAULT 'You are a helpful AI assistant.',
  model_provider TEXT NOT NULL DEFAULT 'openai',
  model_name TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  temperature NUMERIC NOT NULL DEFAULT 0.7,
  max_loops INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own agents" ON public.agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own agents" ON public.agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agents" ON public.agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agents" ON public.agents FOR DELETE USING (auth.uid() = user_id);

-- Workflows table
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL DEFAULT 'sequential',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workflows" ON public.workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workflows" ON public.workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workflows" ON public.workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workflows" ON public.workflows FOR DELETE USING (auth.uid() = user_id);

-- Runs table
CREATE TABLE public.runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  workflow_name TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  input TEXT NOT NULL,
  output TEXT,
  error TEXT,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own runs" ON public.runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own runs" ON public.runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own runs" ON public.runs FOR UPDATE USING (auth.uid() = user_id);

-- Run events for streaming
CREATE TABLE public.run_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'chunk',
  agent_name TEXT,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.run_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own run events" ON public.run_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.runs WHERE runs.id = run_events.run_id AND runs.user_id = auth.uid())
);
CREATE POLICY "Service can insert run events" ON public.run_events FOR INSERT WITH CHECK (true);

-- Logs table
CREATE TABLE public.logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  agent_name TEXT,
  workflow_name TEXT,
  run_id UUID REFERENCES public.runs(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON public.logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert logs" ON public.logs FOR INSERT WITH CHECK (true);

-- Provider keys table (stores encrypted API keys)
CREATE TABLE public.provider_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own keys" ON public.provider_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own keys" ON public.provider_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own keys" ON public.provider_keys FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime on runs and run_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.run_events;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
