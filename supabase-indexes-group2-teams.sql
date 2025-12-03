-- =============================================
-- GROUP 2: TAKIM ARAMA
-- Takım arama index'leri - Tahmini: 1-2 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_matches_home_team_lower ON matches(LOWER(home_team) text_pattern_ops);
