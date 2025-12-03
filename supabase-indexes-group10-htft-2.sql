-- =============================================
-- GROUP 10: HT/FT PART 2
-- Half Time / Full Time (son 6) - Tahmini: 1 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_ht_ft_x1_close ON matches(ht_ft_x1_odds_close) WHERE ht_ft_x1_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_ft_xx_close ON matches(ht_ft_xx_odds_close) WHERE ht_ft_xx_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_ft_x2_close ON matches(ht_ft_x2_odds_close) WHERE ht_ft_x2_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_ft_21_close ON matches(ht_ft_21_odds_close) WHERE ht_ft_21_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_ft_2x_close ON matches(ht_ft_2x_odds_close) WHERE ht_ft_2x_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_ft_22_close ON matches(ht_ft_22_odds_close) WHERE ht_ft_22_odds_close IS NOT NULL;
