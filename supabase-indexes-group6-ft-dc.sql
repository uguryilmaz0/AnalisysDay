-- =============================================
-- GROUP 6: ÇİFTE ŞANS (FT)
-- Full Time Double Chance - Tahmini: 1 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_ft_dc_1x_close ON matches(ft_dc_1x_odds_close) WHERE ft_dc_1x_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ft_dc_12_close ON matches(ft_dc_12_odds_close) WHERE ft_dc_12_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ft_dc_x2_close ON matches(ft_dc_x2_odds_close) WHERE ft_dc_x2_odds_close IS NOT NULL;
