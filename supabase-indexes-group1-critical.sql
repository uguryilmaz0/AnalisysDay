-- =============================================
-- GROUP 1: KRİTİK İNDEXLER (İLK ÖNCE BUNU)
-- En önemli 3 index - Tahmini: 1-2 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_match_date ON matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league);
CREATE INDEX IF NOT EXISTS idx_matches_league_date ON matches(league, match_date DESC);
