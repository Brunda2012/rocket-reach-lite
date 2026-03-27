CREATE TABLE public.prospect_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  company_profile jsonb DEFAULT '{}'::jsonb,
  signals jsonb DEFAULT '{}'::jsonb,
  recent_changes jsonb DEFAULT '[]'::jsonb,
  insights jsonb DEFAULT '[]'::jsonb,
  conversation_starters jsonb DEFAULT '{}'::jsonb,
  why_it_matters text,
  confidence_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.prospect_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.prospect_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.prospect_snapshots FOR INSERT WITH CHECK (true);