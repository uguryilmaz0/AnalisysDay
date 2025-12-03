-- =============================================
-- GROUP 4: MAÇSONU 1X2
-- Full Time odds - Tahmini: 1 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_ft_home_close ON matches(ft_home_odds_close) WHERE ft_home_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ft_draw_close ON matches(ft_draw_odds_close) WHERE ft_draw_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ft_away_close ON matches(ft_away_odds_close) WHERE ft_away_odds_close IS NOT NULL;
