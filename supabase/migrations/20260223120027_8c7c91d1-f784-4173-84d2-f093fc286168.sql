
-- Tighten run_events and logs INSERT policies to require authenticated users
DROP POLICY "Service can insert run events" ON public.run_events;
CREATE POLICY "Authenticated can insert run events" ON public.run_events FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY "Service can insert logs" ON public.logs;
CREATE POLICY "Authenticated can insert logs" ON public.logs FOR INSERT TO authenticated WITH CHECK (true);
