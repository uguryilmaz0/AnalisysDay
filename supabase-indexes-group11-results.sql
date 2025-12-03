-- =============================================
-- GROUP 11: SONUÇLAR & OVER/UNDER
-- Score, Over/Under, BTTS - Tahmini: 1 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_ht_score ON matches(ht_score);
CREATE INDEX IF NOT EXISTS idx_matches_ft_score ON matches(ft_score);
CREATE INDEX IF NOT EXISTS idx_matches_ht_ft ON matches(ht_ft);
CREATE INDEX IF NOT EXISTS idx_matches_ht_over_05 ON matches(ht_over_05);
CREATE INDEX IF NOT EXISTS idx_matches_ft_over_15 ON matches(ft_over_15);
CREATE INDEX IF NOT EXISTS idx_matches_ft_over_25 ON matches(ft_over_25);
CREATE INDEX IF NOT EXISTS idx_matches_ft_over_35 ON matches(ft_over_35);
CREATE INDEX IF NOT EXISTS idx_matches_btts ON matches(btts);
