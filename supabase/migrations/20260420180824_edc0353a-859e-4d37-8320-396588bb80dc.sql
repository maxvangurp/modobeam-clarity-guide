-- Insights table
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  intention TEXT,
  draw_type TEXT NOT NULL CHECK (draw_type IN ('daily', 'three')),
  cards JSONB NOT NULL,
  combined_insight TEXT,
  ai_reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert with either user_id matching auth.uid() or via session_id (anonymous)
CREATE POLICY "Anyone can create insights"
  ON public.insights FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND session_id IS NOT NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can view their own insights"
  ON public.insights FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can delete their own insights"
  ON public.insights FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

-- Journal entries
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_id UUID NOT NULL REFERENCES public.insights(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND session_id IS NOT NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can view their own journal entries"
  ON public.journal_entries FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can delete their own journal entries"
  ON public.journal_entries FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE INDEX idx_insights_session ON public.insights(session_id, created_at DESC);
CREATE INDEX idx_insights_user ON public.insights(user_id, created_at DESC);
CREATE INDEX idx_journal_insight ON public.journal_entries(insight_id);