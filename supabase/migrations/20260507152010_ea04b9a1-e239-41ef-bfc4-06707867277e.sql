
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 20),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX leaderboard_score_idx ON public.leaderboard (score DESC);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_public_read"
  ON public.leaderboard FOR SELECT
  USING (true);

CREATE POLICY "leaderboard_public_insert"
  ON public.leaderboard FOR INSERT
  WITH CHECK (true);
