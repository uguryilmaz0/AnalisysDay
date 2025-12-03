-- =============================================
-- GROUP 7: ÇİFTE ŞANS (HT)
-- Half Time Double Chance - Tahmini: 1 dakika
-- =============================================

CREATE INDEX IF NOT EXISTS idx_matches_ht_dc_1x_close ON matches(ht_dc_1x_odds_close) WHERE ht_dc_1x_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_dc_12_close ON matches(ht_dc_12_odds_close) WHERE ht_dc_12_odds_close IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_ht_dc_x2_close ON matches(ht_dc_x2_odds_close) WHERE ht_dc_x2_odds_close IS NOT NULL;
