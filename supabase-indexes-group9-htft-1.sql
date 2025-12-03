-- =============================================
-- GROUP 9: HT/FT PART 1
-- Half Time / Full Time (ilk 5) - Tahmini: 1 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_ht_ft_11_close ON matches(ht_ft_11_odds_close) WHERE ht_ft_11_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_ft_1x_close ON matches(ht_ft_1x_odds_close) WHERE ht_ft_1x_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_ft_12_close ON matches(ht_ft_12_odds_close) WHERE ht_ft_12_odds_close IS NOT NULL;
