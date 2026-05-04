CREATE TYPE public.ai_feedback_section AS ENUM ('smart_fix', 'seo_rewrite', 'conversion_variant', 'product_draft');
CREATE TYPE public.ai_feedback_vote AS ENUM ('up', 'down');

CREATE TABLE public.ai_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section public.ai_feedback_section NOT NULL,
  item_key TEXT NOT NULL,
  vote public.ai_feedback_vote NOT NULL,
  page_url TEXT,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_feedback_section_created ON public.ai_feedback (section, created_at DESC);

ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (no auth in this app)
CREATE POLICY "Anyone can insert feedback"
  ON public.ai_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No public read/update/delete (admin reviews via DB tools only)